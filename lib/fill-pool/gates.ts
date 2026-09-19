import mapsCategories from "@/data/maps-categories.json";
import type { HubIdea } from "@/lib/idea-pool";
import type { RawCandidate } from "./generate-candidates";

type GateOutcome = {
  status: "HOLD" | "FAIL";
  hold_reasons: string[];
  fail_reasons: string[];
};

/**
 * MVP gates — HOLD/FAIL only. Never returns PASS.
 */
export function runGates(candidate: RawCandidate): GateOutcome {
  const hold: string[] = [];
  const fail: string[] = [];

  hold.push("Gate1: Planner evidence not supplied (no invent volume/CPC)");

  if (candidate.policy_class === "deny") {
    fail.push("Gate2: policy_class deny");
  } else if (candidate.policy_class === "adjacent") {
    hold.push("Gate2: policy_class adjacent — needs named sign-off");
  }

  hold.push("Gate3: pending Google SERP handoff (no auto PASS)");

  if (!candidate.proposed_pilot_geo) {
    hold.push("Gate4: no proposed pilot geo");
  }

  const bySlug = (mapsCategories as { by_industry_slug?: Record<string, { maps_category?: string; fragments?: string[] }> }).by_industry_slug || {};
  const entry = bySlug[candidate.industry];
  if (!entry?.maps_category) {
    fail.push(`Gate5: no Maps category for industry ${candidate.industry}`);
  } else if (!entry.fragments || entry.fragments.length === 0) {
    hold.push("Gate5: Maps category present but no fragments listed");
  }

  if (fail.length) {
    return { status: "FAIL", hold_reasons: hold, fail_reasons: fail };
  }
  return { status: "HOLD", hold_reasons: hold, fail_reasons: [] };
}

export function candidateToIdea(candidate: RawCandidate): HubIdea {
  const gates = runGates(candidate);
  return {
    niche_slug: candidate.niche_slug,
    display_name: candidate.display_name,
    industry: candidate.industry,
    primary_serp_term: candidate.primary_serp_term,
    serp_pass_count: 0,
    pilot_geo: null,
    proposed_pilot_geo: candidate.proposed_pilot_geo,
    status: gates.status,
    hold_reasons: gates.hold_reasons,
    fail_reasons: gates.fail_reasons.length ? gates.fail_reasons : undefined,
    near_pass: false,
  };
}
