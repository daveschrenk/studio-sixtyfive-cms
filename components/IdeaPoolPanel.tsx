"use client";

import { useEffect, useMemo, useState } from "react";
import {
  countByStatus,
  getSortedIdeas,
  ideaReasons,
  liveApexForIdea,
  type HubIdea,
  type IdeaStatus,
} from "@/lib/idea-pool";
import {
  FillPoolButton,
  loadStoredProposals,
} from "@/components/FillPoolButton";
import type { FillPoolProposal } from "@/lib/fill-pool/types";

function pilotGeoLabel(idea: HubIdea): string {
  if (idea.pilot_geo) return idea.pilot_geo;
  if (idea.proposed_pilot_geo) return `${idea.proposed_pilot_geo} (proposed)`;
  return "—";
}

function nicheLabel(idea: HubIdea): { title: string; subtitle: string | null } {
  if (idea.display_name) {
    return { title: idea.display_name, subtitle: idea.niche_slug };
  }
  return { title: idea.niche_slug, subtitle: null };
}

export function IdeaPoolPanel() {
  const baseIdeas = useMemo(() => getSortedIdeas(), []);
  const [proposals, setProposals] = useState<FillPoolProposal[]>([]);
  const [fillSummary, setFillSummary] = useState<string | null>(null);

  useEffect(() => {
    setProposals(loadStoredProposals());
  }, []);

  const ideas = useMemo(() => {
    const bySlug = new Map<string, HubIdea>();
    for (const idea of baseIdeas) bySlug.set(idea.niche_slug, idea);
    for (const p of proposals) {
      const existing = bySlug.get(p.niche_slug);
      if (existing && existing.status === "PASS") continue;
      bySlug.set(p.niche_slug, p);
    }
    const order: Record<string, number> = { PASS: 0, HOLD: 1, FAIL: 2 };
    return [...bySlug.values()].sort((a, b) => {
      const ao = order[a.status] ?? 99;
      const bo = order[b.status] ?? 99;
      if (ao !== bo) return ao - bo;
      return a.niche_slug.localeCompare(b.niche_slug);
    });
  }, [baseIdeas, proposals]);

  const counts = countByStatus(ideas);

  return (
    <section
      id="idea-pool"
      className="mt-12"
      aria-labelledby="idea-pool-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="idea-pool-heading" className="font-serif text-xl">
            Idea pool
          </h2>
          <p className="mt-1 text-sm text-muted">
            Qualified niches · display only · PASS / HOLD / FAIL
          </p>
          <p className="mt-1 text-xs text-muted">
            No site launch or domain buy from this panel.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <FillPoolButton
            onProposals={(next, summary) => {
              setProposals(next);
              setFillSummary(summary);
            }}
          />
          <p className="text-xs text-muted">
            {counts.pass} PASS · {counts.hold} HOLD
            {counts.fail ? ` · ${counts.fail} FAIL` : ""}
            {counts.other ? ` · ${counts.other} other` : ""}
          </p>
        </div>
      </div>
      {proposals.length ? (
        <p className="mt-3 border border-rule bg-cream px-3 py-2 text-xs text-muted">
          Session Fill pool proposals shown as HOLD/FAIL overlay (not committed
          PASS).{fillSummary ? ` ${fillSummary}` : ""}
        </p>
      ) : null}

      <div className="mt-4 hidden overflow-x-auto border border-rule bg-cream lg:block">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-rule text-left text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-3 py-2 font-medium">Niche</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Pilot geo</th>
              <th className="px-3 py-2 font-medium">Primary SERP</th>
              <th className="px-3 py-2 font-medium">SERP pass</th>
              <th className="px-3 py-2 font-medium">Notes / hold reasons</th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea) => (
              <IdeaRow key={idea.niche_slug} idea={idea} />
            ))}
            {ideas.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-muted"
                >
                  No queued ideas — waiting on Kyle&apos;s next PASS set.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 lg:hidden">
        {ideas.length === 0 ? (
          <p className="border border-rule bg-cream px-3 py-6 text-center text-sm text-muted">
            No queued ideas — waiting on Kyle&apos;s next PASS set.
          </p>
        ) : (
          ideas.map((idea) => (
            <IdeaCard key={idea.niche_slug} idea={idea} />
          ))
        )}
      </div>
    </section>
  );
}

function IdeaRow({ idea }: { idea: HubIdea }) {
  const notes = ideaReasons(idea);
  const apex = liveApexForIdea(idea);
  const highlightPass = idea.status === "PASS";
  const apexLabel = apex ? apex.replace(/^https?:\/\//, "") : null;
  const niche = nicheLabel(idea);

  return (
    <tr
      className={`border-b border-rule align-top ${
        highlightPass ? "bg-success/5" : ""
      }`}
    >
      <td className="px-3 py-3">
        <div
          className={`${
            highlightPass ? "font-medium text-ink" : "text-ink"
          }`}
        >
          {niche.title}
        </div>
        {niche.subtitle ? (
          <div className="mt-0.5 font-mono text-[10px] text-muted">
            {niche.subtitle}
          </div>
        ) : null}
        {apex && apexLabel ? (
          <p className="mt-1 text-xs">
            <a
              href={apex}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rust underline underline-offset-2"
            >
              {apexLabel}
            </a>
          </p>
        ) : null}
      </td>
      <td className="px-3 py-3">
        <IdeaStatusBadge status={idea.status} />
      </td>
      <td className="px-3 py-3 text-muted">{pilotGeoLabel(idea)}</td>
      <td className="px-3 py-3 text-ink">{idea.primary_serp_term}</td>
      <td className="px-3 py-3 font-mono text-xs">
        {idea.serp_pass_count}/20
      </td>
      <td className="px-3 py-3 text-xs text-muted">
        {notes || (
          <span className="text-muted/80">
            {idea.status === "HOLD" ? "Held — await greenlight" : "—"}
          </span>
        )}
      </td>
    </tr>
  );
}

function IdeaCard({ idea }: { idea: HubIdea }) {
  const notes = ideaReasons(idea);
  const apex = liveApexForIdea(idea);
  const highlightPass = idea.status === "PASS";
  const apexLabel = apex ? apex.replace(/^https?:\/\//, "") : null;
  const niche = nicheLabel(idea);

  return (
    <article
      className={`border border-rule bg-cream p-4 text-sm ${
        highlightPass ? "ring-1 ring-success/30" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3
            className={`${
              highlightPass ? "font-medium text-ink" : "text-ink"
            }`}
          >
            {niche.title}
          </h3>
          {niche.subtitle ? (
            <p className="mt-0.5 font-mono text-[10px] text-muted">
              {niche.subtitle}
            </p>
          ) : null}
        </div>
        <IdeaStatusBadge status={idea.status} />
      </div>
      {apex && apexLabel ? (
        <p className="mt-2 text-xs">
          <a
            href={apex}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rust underline underline-offset-2"
          >
            {apexLabel}
          </a>
        </p>
      ) : null}
      <dl className="mt-3 grid gap-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.08em] text-muted">
            Pilot geo
          </dt>
          <dd className="mt-0.5 text-muted">{pilotGeoLabel(idea)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.08em] text-muted">
            Primary SERP
          </dt>
          <dd className="mt-0.5">{idea.primary_serp_term}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.08em] text-muted">
            SERP pass
          </dt>
          <dd className="mt-0.5 font-mono text-xs">
            {idea.serp_pass_count}/20
          </dd>
        </div>
        {notes || idea.status === "HOLD" ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-muted">
              Notes / hold reasons
            </dt>
            <dd className="mt-0.5 text-xs text-muted">
              {notes || "Held — await greenlight"}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  const cls =
    status === "PASS"
      ? "bg-success/15 text-success"
      : status === "HOLD"
        ? "bg-warning/15 text-warning"
        : status === "FAIL"
          ? "bg-rule text-muted"
          : "bg-rule text-muted";

  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] ${cls}`}
    >
      {status}
    </span>
  );
}
