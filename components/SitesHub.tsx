"use client";

import { useEffect, useState } from "react";
import {
  SITES_HUB,
  cmsAdminUrl,
  cmsCredResetKey,
  generateMockCmsPassword,
  type SiteHubRow,
} from "@/lib/sites-hub";
import { FACTORY_STUBS_STORAGE_KEY } from "@/lib/factory/constants";
import type { GscDailyMetrics } from "@/lib/google-search-console";

type Banner = {
  siteId: string;
  siteName: string;
  password: string;
};

function loadFactoryStubs(): SiteHubRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FACTORY_STUBS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SiteHubRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeHubRows(base: SiteHubRow[], stubs: SiteHubRow[]): SiteHubRow[] {
  const byId = new Map<string, SiteHubRow>();
  for (const row of base) byId.set(row.siteId, row);
  for (const stub of stubs) {
    if (!byId.has(stub.siteId)) byId.set(stub.siteId, stub);
  }
  return [...byId.values()];
}

export function SitesHub({
  metrics = {},
}: {
  metrics?: Record<string, GscDailyMetrics | null>;
}) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [confirmSiteId, setConfirmSiteId] = useState<string | null>(null);
  const [rows, setRows] = useState<SiteHubRow[]>(SITES_HUB);

  useEffect(() => {
    const refresh = () => setRows(mergeHubRows(SITES_HUB, loadFactoryStubs()));
    refresh();
    window.addEventListener("dfw-factory-stubs-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("dfw-factory-stubs-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function startReset(site: SiteHubRow) {
    setConfirmSiteId(site.siteId);
  }

  function cancelReset() {
    setConfirmSiteId(null);
  }

  function confirmReset(site: SiteHubRow) {
    const password = generateMockCmsPassword();
    try {
      window.localStorage.setItem(
        cmsCredResetKey(site.siteId),
        JSON.stringify({
          password,
          resetAt: new Date().toISOString(),
          mock: true,
        }),
      );
    } catch {
      // ignore quota / private mode
    }
    setBanner({ siteId: site.siteId, siteName: site.name, password });
    setConfirmSiteId(null);
  }

  function dismissBanner() {
    setBanner(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">Sites hub</h1>
          <p className="mt-1 text-sm text-muted">
            Multi-site management · GSC first · AdSense parked · CMS tools
          </p>
        </div>
        <p className="text-xs text-muted">{rows.length} sites</p>
      </div>

      {banner ? (
        <div
          role="status"
          className="mt-6 border border-rust bg-cream px-4 py-3 text-sm text-ink"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">
                One-time CMS password for {banner.siteName}
              </p>
              <p className="mt-1 text-muted">
                Mock reset stored in this browser only. Copy now — it will not
                be shown again. Does not change vault or Vercel env.
              </p>
              <p className="mt-2 font-mono text-base tracking-wide text-ink">
                {banner.password}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissBanner}
              className="border border-rule px-2 py-1 text-xs hover:border-rust"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {/* Desktop / wide table */}
      <div className="mt-6 hidden overflow-x-auto border border-rule bg-cream lg:block">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-rule text-left text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-3 py-2 font-medium">Site</th>
              <th className="px-3 py-2 font-medium">Apex</th>
              <th className="px-3 py-2 font-medium">Theme</th>
              <th className="px-3 py-2 font-medium">GSC / day</th>
              <th className="px-3 py-2 font-medium">GSC</th>
              <th className="px-3 py-2 font-medium">AdSense</th>
              <th className="px-3 py-2 font-medium">CMS</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((site) => (
              <tr key={site.siteId} className="border-b border-rule align-top">
                <td className="px-3 py-3">
                  <div className="font-medium text-ink">{site.name}</div>
                  <div className="mt-0.5 text-xs text-muted">{site.siteId}</div>
                  <StatusBadge status={site.status} />
                </td>
                <td className="px-3 py-3">
                  <ApexCell site={site} />
                </td>
                <td className="px-3 py-3 font-mono text-xs">{site.themeId}</td>
                <td className="px-3 py-3">
                  <SearchTrafficCell value={metrics[site.siteId] ?? null} />
                </td>
                <td className="px-3 py-3">
                  <GscCell note={site.gscNote} />
                </td>
                <td className="px-3 py-3">
                  <AdSenseCell value={site.adsense} />
                </td>
                <td className="px-3 py-3">
                  <CmsCell site={site} />
                </td>
                <td className="px-3 py-3">
                  <ResetControls
                    site={site}
                    confirmSiteId={confirmSiteId}
                    onStart={startReset}
                    onCancel={cancelReset}
                    onConfirm={confirmReset}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 grid gap-4 lg:hidden">
        {rows.map((site) => (
          <article
            key={site.siteId}
            className="border border-rule bg-cream p-4 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-serif text-lg text-ink">{site.name}</h2>
                <p className="text-xs text-muted">{site.siteId}</p>
              </div>
              <StatusBadge status={site.status} />
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-muted">
                  Apex
                </dt>
                <dd className="mt-0.5 break-all">
                  <ApexCell site={site} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-muted">
                  Theme
                </dt>
                <dd className="mt-0.5 font-mono text-xs">{site.themeId}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-muted">
                  GSC / day
                </dt>
                <dd className="mt-0.5">
                  <SearchTrafficCell value={metrics[site.siteId] ?? null} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-muted">
                  GSC
                </dt>
                <dd className="mt-0.5">
                  <GscCell note={site.gscNote} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-muted">
                  AdSense
                </dt>
                <dd className="mt-0.5">
                  <AdSenseCell value={site.adsense} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-muted">
                  CMS
                </dt>
                <dd className="mt-0.5">
                  <CmsCell site={site} />
                </dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-rule pt-3">
              <ResetControls
                site={site}
                confirmSiteId={confirmSiteId}
                onStart={startReset}
                onCancel={cancelReset}
                onConfirm={confirmReset}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SiteHubRow["status"] }) {
  return (
    <span
      className={`mt-1 inline-block rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
        status === "live"
          ? "bg-success/15 text-success"
          : "bg-warning/15 text-warning"
      }`}
    >
      {status === "stub" ? "stub · hub-only" : status}
    </span>
  );
}

function ApexCell({ site }: { site: SiteHubRow }) {
  const label = site.apex.replace(/^https?:\/\//, "");
  return (
    <span className="break-all">
      <a
        href={site.apex}
        target="_blank"
        rel="noopener noreferrer"
        className={`${
          site.status === "live" ? "text-rust" : "text-muted"
        } underline underline-offset-2`}
      >
        {label}
      </a>
      {site.status === "stub" ? (
        <span className="mt-0.5 block text-xs text-muted">
          parked / hub-only
        </span>
      ) : null}
    </span>
  );
}

function SearchTrafficCell({ value }: { value: GscDailyMetrics | null }) {
  if (!value) {
    return <span className="text-muted">N/A</span>;
  }
  return (
    <span className="block whitespace-nowrap text-ink">
      <span className="font-medium">{value.clicksPerDay.toFixed(1)}</span>{" "}
      <span className="text-xs text-muted">clicks</span>
      <span className="mt-0.5 block">
        <span className="font-medium">
          {value.impressionsPerDay.toFixed(1)}
        </span>{" "}
        <span className="text-xs text-muted">impressions</span>
      </span>
      <span className="mt-0.5 block text-[10px] text-muted">
        28-day daily avg
      </span>
    </span>
  );
}

function GscCell({ note }: { note: string | null }) {
  if (!note || !note.trim()) {
    return <span className="text-muted">N/A</span>;
  }
  return <span className="text-muted">{note}</span>;
}

function AdSenseCell({ value }: { value: string }) {
  if (value === "parked") {
    return (
      <span className="text-muted">
        N/A{" "}
        <span className="text-xs">(parked)</span>
      </span>
    );
  }
  return <span className="text-ink">{value}</span>;
}

function CmsCell({ site }: { site: SiteHubRow }) {
  if (site.status !== "live") {
    return (
      <span className="text-muted" title="CMS unavailable until domain is live">
        Open CMS (disabled)
      </span>
    );
  }
  return (
    <a
      href={cmsAdminUrl(site)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-rust underline underline-offset-2"
    >
      Open CMS
    </a>
  );
}

function ResetControls({
  site,
  confirmSiteId,
  onStart,
  onCancel,
  onConfirm,
}: {
  site: SiteHubRow;
  confirmSiteId: string | null;
  onStart: (site: SiteHubRow) => void;
  onCancel: () => void;
  onConfirm: (site: SiteHubRow) => void;
}) {
  if (confirmSiteId === site.siteId) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted">
          Reset CMS credentials for {site.name}? Generates a mock password in
          this browser only.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onConfirm(site)}
            className="border border-rust bg-paper px-2 py-1 text-xs hover:border-rust-dark"
          >
            Confirm reset
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border border-rule px-2 py-1 text-xs hover:border-rust"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onStart(site)}
      className="border border-rule px-2 py-1 text-xs hover:border-rust"
    >
      Reset CMS credentials
    </button>
  );
}
