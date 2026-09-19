/**
 * Qualified hub idea pool — PASS / HOLD / FAIL status for display in Sites hub.
 * Source: data/hub-idea-pool.yaml (committed JSON sibling for runtime import).
 * Display only — no site launch, domain buy, or TENANTS mutations.
 */

import poolJson from "@/data/hub-idea-pool.json";
import { SITES_HUB } from "@/lib/sites-hub";

export type IdeaStatus = "PASS" | "HOLD" | "FAIL" | string;

export type HubIdea = {
  niche_slug: string;
  display_name?: string | null;
  industry?: string | null;
  near_pass?: boolean | null;
  primary_serp_term: string;
  serp_pass_count: number;
  pilot_geo: string | null;
  proposed_pilot_geo?: string | null;
  status: IdeaStatus;
  hold_reasons: string[];
  fail_reasons?: string[];
  install_vs_repair?: string | null;
};

type PoolFile = {
  meta?: Record<string, unknown>;
  ideas: HubIdea[];
};

const pool = poolJson as PoolFile;

const STATUS_ORDER: Record<string, number> = {
  PASS: 0,
  HOLD: 1,
  FAIL: 2,
};

/** Known PASS niches already mapped to a live Sites hub row (display link only). */
const LIVE_SITE_BY_NICHE: Record<string, string> = {
  "garage-door-install-dfw": "dfw-garage",
};

export function getHubIdeas(): HubIdea[] {
  return Array.isArray(pool.ideas) ? pool.ideas : [];
}

/**
 * True when this idea is already mapped to a live Sites hub site.
 * Used to drop live launches from the Idea pool display (HOLD stays visible).
 */
export function isLiveMappedIdea(idea: HubIdea): boolean {
  return liveApexForIdea(idea) !== null;
}

/**
 * PASS first, then HOLD, then FAIL, then other; stable by niche_slug within status.
 * Excludes ideas already mapped to a live site so they do not appear in the Idea pool.
 */
export function getSortedIdeas(): HubIdea[] {
  return [...getHubIdeas()]
    .filter((idea) => !isLiveMappedIdea(idea))
    .sort((a, b) => {
      const ao = STATUS_ORDER[a.status] ?? 99;
      const bo = STATUS_ORDER[b.status] ?? 99;
      if (ao !== bo) return ao - bo;
      return a.niche_slug.localeCompare(b.niche_slug);
    });
}

export function countByStatus(ideas: HubIdea[]): {
  pass: number;
  hold: number;
  fail: number;
  other: number;
} {
  let pass = 0;
  let hold = 0;
  let fail = 0;
  let other = 0;
  for (const i of ideas) {
    if (i.status === "PASS") pass += 1;
    else if (i.status === "HOLD") hold += 1;
    else if (i.status === "FAIL") fail += 1;
    else other += 1;
  }
  return { pass, hold, fail, other };
}

export function truncateReasons(reasons: string[], maxLen = 120): string {
  const joined = reasons.filter(Boolean).join("; ");
  if (joined.length <= maxLen) return joined;
  return `${joined.slice(0, maxLen - 1)}…`;
}

/** Reasons line for HOLD / FAIL rows (truncated). */
export function ideaReasons(idea: HubIdea): string {
  if (idea.status === "HOLD" && idea.hold_reasons?.length) {
    return truncateReasons(idea.hold_reasons);
  }
  if (idea.status === "FAIL" && idea.fail_reasons?.length) {
    return truncateReasons(idea.fail_reasons);
  }
  if (idea.hold_reasons?.length) return truncateReasons(idea.hold_reasons);
  if (idea.fail_reasons?.length) return truncateReasons(idea.fail_reasons);
  return "";
}

/**
 * Apex URL for a PASS idea already mapped to a live Sites hub site.
 * Display-only text link — never a Launch action.
 */
export function liveApexForIdea(idea: HubIdea): string | null {
  if (idea.status !== "PASS") return null;
  const siteId = LIVE_SITE_BY_NICHE[idea.niche_slug];
  if (!siteId) return null;
  const site = SITES_HUB.find((s) => s.siteId === siteId && s.status === "live");
  return site?.apex ?? null;
}
