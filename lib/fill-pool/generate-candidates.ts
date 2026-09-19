import industryCatalog from "@/data/industry-catalog.json";
import metroCandidates from "@/data/metro-candidates.json";
import { getHubIdeas } from "@/lib/idea-pool";

export type RawCandidate = {
  niche_slug: string;
  display_name: string;
  industry: string;
  primary_serp_term: string;
  proposed_pilot_geo: string;
  metro_slug: string;
  maps_category: string;
  policy_class: string;
};

const BLOCKED_INDUSTRY_SLUGS = new Set([
  "dumpster-rental",
  "garage-door",
  "garage-door-install",
]);

const USED_FAMILY = ["towing", "fence", "tree", "dog-boarding", "self-storage", "garage-door", "dumpster"];

function poolIndustryFamilies(): Set<string> {
  const used = new Set<string>();
  for (const idea of getHubIdeas()) {
    const slug = (idea.niche_slug || "").toLowerCase();
    const industry = (idea.industry || "").toLowerCase();
    if (industry) used.add(industry);
    for (const f of USED_FAMILY) {
      if (slug.includes(f) || industry.includes(f)) used.add(f);
    }
  }
  return used;
}

function poolMetros(): Set<string> {
  const used = new Set<string>();
  for (const idea of getHubIdeas()) {
    const geo = (idea.pilot_geo || idea.proposed_pilot_geo || "").toLowerCase();
    if (geo) used.add(geo);
  }
  return used;
}

/** Unique industry×metro pairs. No Planner/SERP at generation. */
export function generateCandidates(max = 3): RawCandidate[] {
  const usedFam = poolIndustryFamilies();
  const usedMetro = poolMetros();
  const metros = metroCandidates.metros || [];
  const industries = (industryCatalog.industries || []).filter((ind) => {
    if (BLOCKED_INDUSTRY_SLUGS.has(ind.slug)) return false;
    if (ind.policy_class === "deny") return false;
    const family = ind.slug.split("-")[0];
    if ([...usedFam].some((u) => u.includes(family) || family.includes(u.split("-")[0]))) {
      return false;
    }
    return true;
  });

  const out: RawCandidate[] = [];
  for (const ind of industries) {
    if (out.length >= max) break;
    const metro =
      metros.find((m) => !usedMetro.has(m.short_name.toLowerCase())) ||
      metros[out.length % Math.max(metros.length, 1)];
    if (!metro) break;
    const niche_slug = `${ind.slug}-${metro.slug}`;
    if (niche_slug === "garage-door-install-dfw") continue;
    if (getHubIdeas().some((i) => i.niche_slug === niche_slug)) continue;
    out.push({
      niche_slug,
      display_name: `${ind.display_name} ${metro.short_name}`,
      industry: ind.slug,
      primary_serp_term: `${ind.primary_serp_term} ${metro.short_name}`,
      proposed_pilot_geo: metro.short_name,
      metro_slug: metro.slug,
      maps_category: ind.maps_category,
      policy_class: ind.policy_class,
    });
    usedMetro.add(metro.short_name.toLowerCase());
  }
  return out;
}
