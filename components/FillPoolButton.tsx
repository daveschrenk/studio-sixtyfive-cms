"use client";

import { useState } from "react";
import type { FillPoolProposal } from "@/lib/fill-pool/types";

const STORAGE_KEY = "dfw-fill-pool-proposals";

export function loadStoredProposals(): FillPoolProposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FillPoolProposal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredProposals(proposals: FillPoolProposal[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

type Props = {
  onProposals: (proposals: FillPoolProposal[], summary: string) => void;
};

export function FillPoolButton({ onProposals }: Props) {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("running");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/fill-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxCandidates: 3 }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        proposals: FillPoolProposal[];
        summary: string;
      };
      const next = data.proposals || [];
      saveStoredProposals(next);
      onProposals(next, data.summary || "");
      setState("done");
      setMessage(data.summary || "Done");
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Fill pool failed");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "running"}
        className="rounded border border-rule bg-ink px-3 py-1.5 text-sm text-paper disabled:opacity-60"
      >
        {state === "running" ? "Filling…" : "Fill pool"}
      </button>
      {message ? (
        <p
          className={`max-w-xs text-right text-xs ${
            state === "error" ? "text-rust" : "text-muted"
          }`}
        >
          {message}
        </p>
      ) : (
        <p className="max-w-xs text-right text-xs text-muted">
          Proposes HOLD only · never invents PASS
        </p>
      )}
    </div>
  );
}
