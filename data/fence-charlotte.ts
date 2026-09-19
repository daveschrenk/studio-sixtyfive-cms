/** Charlotte fence metro cities + blurbs. Listings load from lib/fence-listings.ts. */

export type { FenceListing } from "@/lib/fence-listings";
export {
  ALL_FENCE_LISTINGS,
  listingsForCity,
  listingsForHub,
} from "@/lib/fence-listings";

export type FenceCity = {
  slug: string;
  name: string;
  path: string;
  state: "NC" | "SC";
  blurb: string;
};

export const FENCE_CITIES: readonly FenceCity[] = [
  {
    slug: "charlotte",
    name: "Charlotte",
    path: "/nc/charlotte/fence-company/",
    state: "NC",
    blurb:
      "Principal city — 964,784 people (July 1, 2025). South End, Ballantyne, and NoDa stay on this page; Mecklenburg logged 3,747 one-unit permits in 2025 (city-office print not published in the place file).",
  },
  {
    slug: "matthews",
    name: "Matthews",
    path: "/nc/matthews/fence-company/",
    state: "NC",
    blurb:
      "SE Mecklenburg town — 32,769 (July 1, 2025). Downtown Matthews / John Street; Mecklenburg county logged 3,747 one-unit permits in 2025.",
  },
  {
    slug: "concord",
    name: "Concord",
    path: "/nc/concord/fence-company/",
    state: "NC",
    blurb:
      "Cabarrus anchor — 114,598 (July 1, 2025). Afton Village / Concord Mills; Cabarrus County logged 1,358 one-unit permits in 2025.",
  },
  {
    slug: "huntersville",
    name: "Huntersville",
    path: "/nc/huntersville/fence-company/",
    state: "NC",
    blurb:
      "North Meck / Lake Norman — 68,535 (July 1, 2025). Birkdale Village and shoreline-adjacent lots share this market.",
  },
  {
    slug: "gastonia",
    name: "Gastonia",
    path: "/nc/gastonia/fence-company/",
    state: "NC",
    blurb:
      "Gaston County seat city — 87,067 (July 1, 2025). County authorized 2,153 one-unit permits in 2025.",
  },
  {
    slug: "indian-trail",
    name: "Indian Trail",
    path: "/nc/indian-trail/fence-company/",
    state: "NC",
    blurb:
      "Union County — 44,303 (July 1, 2025). County authorized 2,387 one-unit permits in 2025.",
  },
  {
    slug: "mint-hill",
    name: "Mint Hill",
    path: "/nc/mint-hill/fence-company/",
    state: "NC",
    blurb:
      "East Meck — 29,476 (July 1, 2025). Lawyers Road and larger east-side parcels share this town page.",
  },
  {
    slug: "pineville",
    name: "Pineville",
    path: "/nc/pineville/fence-company/",
    state: "NC",
    blurb:
      "Compact south Meck — 11,851 (July 1, 2025). Carolina Place and short residential lots shape install logistics.",
  },
  {
    slug: "fort-mill",
    name: "Fort Mill",
    path: "/sc/fort-mill/fence-company/",
    state: "SC",
    blurb:
      "York County SC — 38,673 (July 1, 2025), +57.7% since 2020. Town authorized 786 one-unit permits in 2025; county 1,949.",
  },
  {
    slug: "rock-hill",
    name: "Rock Hill",
    path: "/sc/rock-hill/fence-company/",
    state: "SC",
    blurb:
      "York County SC — 75,911 (July 1, 2025). Riverwalk / Dave Lyle; town authorized 189 one-unit permits in 2025; county 1,949.",
  },
  {
    slug: "mooresville",
    name: "Mooresville",
    path: "/nc/mooresville/fence-company/",
    state: "NC",
    blurb:
      "Iredell / Race City — 55,842 (July 1, 2025). Town authorized 308 one-unit permits in 2025; county 1,447.",
  },
] as const;

export function fenceCityBySlug(slug: string): FenceCity | undefined {
  return FENCE_CITIES.find((c) => c.slug === slug);
}
