"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FACTORY_STUBS_STORAGE_KEY,
} from "@/lib/factory/constants";
import type { SiteHubRow } from "@/lib/sites-hub";

type ClaimInfo = {
  niche_slug: string;
  display_name: string;
  siteId: string;
  status?: string;
};

type LockInfo = {
  claimed: boolean;
  niche_slug: string;
  claimedAt: string | null;
  holder: string | null;
};

type ScrapeSnap = {
  budgetCents: number;
  budgetUsd: number;
  killSwitch: boolean;
};

type StatusPayload = {
  claim: ClaimInfo;
  lock: LockInfo;
  pack: { thin: boolean; listingCount: number; message: string };
  scrape: ScrapeSnap;
};

type PreviewResult = {
  claim: {
    niche_slug: string;
    display_name: string;
    siteId: string;
    locked: boolean;
    claimedAt: string | null;
  };
  mode: string;
  pack: { thin: boolean; message: string };
  scrape: { attempted: false; blockedBy: string; budgetCents: number; killSwitch: boolean };
  sitesHubStub: SiteHubRow;
  previewUrl: string;
  notes: string[];
};

type Step = "idle" | "claiming" | "scaffolding" | "scrape-check" | "done" | "error";

type ConfirmBanner =
  | {
      kind: "ok";
      niche: string;
      siteId: string;
      claimedAt: string | null;
      statuses: string[];
      previewUrl: string | null;
      scrapeNote: string;
    }
  | {
      kind: "error";
      message: string;
      at: string;
    };

function saveStubLocal(stub: SiteHubRow) {
  try {
    const raw = window.localStorage.getItem(FACTORY_STUBS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as SiteHubRow[]) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    const next = list.filter((s) => s.siteId !== stub.siteId);
    next.push(stub);
    window.localStorage.setItem(FACTORY_STUBS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("dfw-factory-stubs-updated"));
  } catch {
    // ignore
  }
}

function formatStamp(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString();
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "short",
      timeStyle: "medium",
    }) + " PT";
  } catch {
    return iso;
  }
}

export function FactoryPassButton() {
  const [auth, setAuth] = useState<"unknown" | "ok" | "need-login">("unknown");
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmBanner | null>(null);

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev, line]);
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/factory/claim");
      if (res.status === 401) {
        setAuth("need-login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as StatusPayload;
      setAuth("ok");
      setStatus(data);
    } catch (e) {
      setAuth("need-login");
      setError(e instanceof Error ? e.message : "Status load failed");
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function runClickThrough() {
    setError(null);
    setConfirm(null);
    setLog([]);
    setPreviewUrl(null);
    setStep("claiming");
    push("1/3 Claim next PASS (towing-dallas)…");

    try {
      const claimRes = await fetch("/api/admin/factory/claim", { method: "POST" });
      if (claimRes.status === 401) {
        setAuth("need-login");
        setStep("error");
        const msg = "Log into CMS admin to run factory";
        setError(msg);
        setConfirm({ kind: "error", message: msg, at: new Date().toISOString() });
        return;
      }
      if (!claimRes.ok) {
        const err = (await claimRes.json().catch(() => ({}))) as { reason?: string; error?: string };
        throw new Error(err.reason || err.error || `Claim HTTP ${claimRes.status}`);
      }
      const claimData = (await claimRes.json()) as {
        ok: boolean;
        claim: ClaimInfo;
        lock: LockInfo;
        reason?: string;
        scrape: ScrapeSnap;
      };
      push(
        claimData.lock.claimed
          ? `Claim locked: ${claimData.claim.niche_slug} (${claimData.lock.holder})`
          : `Claim ok: ${claimData.claim.niche_slug}`,
      );
      push(
        `Budget $${claimData.scrape.budgetUsd}/run · kill switch ${claimData.scrape.killSwitch ? "ON" : "OFF"}`,
      );

      setStep("scaffolding");
      push("2/3 Preview scaffold (no scrape)…");
      const prevRes = await fetch("/api/admin/factory/preview", { method: "POST" });
      if (!prevRes.ok) {
        const err = (await prevRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Preview HTTP ${prevRes.status}`);
      }
      const preview = (await prevRes.json()) as PreviewResult;
      saveStubLocal(preview.sitesHubStub);
      push(`Scaffold mode: ${preview.mode}`);
      push(preview.pack.message);
      setPreviewUrl(preview.previewUrl);

      setStep("scrape-check");
      push("3/3 Capped scrape path (must respect $25 + kill switch)…");
      const scrapeRes = await fetch("/api/admin/factory/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedCostCents: 2500 }),
      });
      const scrapeBody = (await scrapeRes.json().catch(() => ({}))) as {
        reason?: string;
        error?: string;
        killSwitch?: boolean;
        budgetUsd?: number;
        scrapeAttempted?: boolean;
      };
      let scrapeNote = "Scrape path checked";
      if (scrapeRes.ok) {
        push("Unexpected: scrape endpoint succeeded — investigate.");
        scrapeNote = "Unexpected: scrape endpoint succeeded";
      } else {
        const reason = scrapeBody.reason || scrapeBody.error || "blocked";
        push(`Scrape blocked (${scrapeRes.status}): ${reason}`);
        push(
          `scrapeAttempted=${String(scrapeBody.scrapeAttempted ?? false)} · kill=${String(scrapeBody.killSwitch)} · cap=$${scrapeBody.budgetUsd ?? 25}`,
        );
        scrapeNote =
          scrapeBody.killSwitch !== false
            ? `Scrape blocked by kill switch (${reason})`
            : `Scrape blocked (${reason})`;
      }

      const claimedAt =
        preview.claim.claimedAt || claimData.lock.claimedAt || new Date().toISOString();
      const niche = preview.claim.niche_slug || claimData.claim.niche_slug;
      const siteId = preview.claim.siteId || claimData.claim.siteId;

      setConfirm({
        kind: "ok",
        niche,
        siteId,
        claimedAt,
        statuses: [
          "Claimed",
          "Preview stub ready",
          scrapeNote,
        ],
        previewUrl: preview.previewUrl,
        scrapeNote,
      });

      setStep("done");
      push(`Preview for Chief: ${preview.previewUrl}`);
      await loadStatus();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Factory flow failed";
      setStep("error");
      setError(msg);
      setConfirm({ kind: "error", message: msg, at: new Date().toISOString() });
    }
  }

  const busy =
    step === "claiming" || step === "scaffolding" || step === "scrape-check";

  return (
    <section className="mt-8 border border-rule bg-cream p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ink">Factory · next PASS</h2>
          <p className="mt-1 text-sm text-muted">
            Click-through only: claim → scaffold → capped scrape path → preview.
            Towing-dallas is not hand-built outside this button.
          </p>
        </div>
        {status ? (
          <div className="text-right text-xs text-muted">
            <p>
              Next:{" "}
              <span className="font-mono text-ink">{status.claim.niche_slug}</span>
            </p>
            <p>
              Cap ${status.scrape.budgetUsd}/run · kill{" "}
              {status.scrape.killSwitch ? "ON" : "OFF"}
            </p>
            <p>
              Lock:{" "}
              {status.lock.claimed
                ? `${status.lock.niche_slug} @ ${status.lock.claimedAt}`
                : "open"}
            </p>
          </div>
        ) : null}
      </div>

      {auth === "need-login" ? (
        <p className="mt-4 text-sm text-rust">
          Log into{" "}
          <a href="/admin/login/" className="underline underline-offset-2">
            CMS admin
          </a>{" "}
          to run the factory button.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy || auth !== "ok"}
            onClick={() => void runClickThrough()}
            className="rounded border border-rust bg-ink px-4 py-2 text-sm text-paper disabled:opacity-60"
          >
            {busy
              ? "Running factory…"
              : "Run factory: claim towing-dallas → preview"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void loadStatus()}
            className="rounded border border-rule px-3 py-2 text-xs hover:border-rust"
          >
            Refresh status
          </button>
        </div>
      )}

      {confirm ? (
        <div
          role="status"
          aria-live="polite"
          className={
            confirm.kind === "ok"
              ? "mt-4 sticky top-2 z-20 border border-rust bg-paper px-4 py-3 text-sm text-ink shadow-sm"
              : "mt-4 sticky top-2 z-20 border border-rust bg-cream px-4 py-3 text-sm text-ink shadow-sm"
          }
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {confirm.kind === "ok" ? (
                <>
                  <p className="font-medium text-ink">
                    Claim registered —{" "}
                    <span className="font-mono">{confirm.niche}</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {confirm.statuses.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-0.5 text-rust" aria-hidden>
                          ●
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted">
                    id{" "}
                    <span className="font-mono text-ink">{confirm.siteId}</span>
                    {" · "}
                    {formatStamp(confirm.claimedAt)}
                  </p>
                  {confirm.previewUrl ? (
                    <p className="mt-2 text-sm">
                      Preview:{" "}
                      <a
                        href={confirm.previewUrl}
                        className="text-rust underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {confirm.previewUrl}
                      </a>
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="font-medium text-rust">Claim failed</p>
                  <p className="mt-1 text-ink">{confirm.message}</p>
                  <p className="mt-2 text-xs text-muted">
                    {formatStamp(confirm.at)}
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setConfirm(null)}
              className="border border-rule px-2 py-1 text-xs hover:border-rust"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {error && !confirm ? <p className="mt-3 text-sm text-rust">{error}</p> : null}

      {log.length ? (
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs text-muted">
          {log.map((line, i) => (
            <li key={`${i}-${line.slice(0, 24)}`} className="text-ink">
              {line}
            </li>
          ))}
        </ol>
      ) : null}

      {previewUrl && step === "done" && !confirm ? (
        <p className="mt-4 text-sm">
          Preview URL for Chief:{" "}
          <a
            href={previewUrl}
            className="text-rust underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {previewUrl}
          </a>
          <span className="mt-1 block text-xs text-muted">
            Hub stub appears in Sites table after click-through (browser
            localStorage). Full tenant domains stay out of TENANTS until pack +
            capped scrape land.
          </span>
        </p>
      ) : null}
    </section>
  );
}
