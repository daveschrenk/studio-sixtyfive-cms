/**
 * Census-grounded thicken copy for the towing-dallas preview.
 * Source of truth (paste exactly, do not invent):
 * /workspace/big-dir-listings/towing-dallas/THICKEN.md
 */

export type OptionalH2 = {
  title: string;
  body: string;
};

export const HUB_COPY: { intro: [string, string]; optionalH2: OptionalH2 } = {
  intro: [
    "Browse towing and roadside shops across the Dallas–Fort Worth–Arlington metro (CBSA 19100) — 8,477,157 people as of July 1, 2025, up 123,557 (+1.5%) from 8,353,600 in 2024. This hub lists the 198-card sample pack for the two principal cities and nearby mid-cities; open a city page for local context, then use the listing stack to call.",
    "Coverage is towing and roadside only — light and heavy trucks, flatbed, jump / lockout / tire, winch-out, accident recovery. Mechanic shops, vehicle-storage facilities, and tire-only stores stay off this pack. I-30, I-35E/W, I-45, I-635, and DFW Airport are geography, not crash-count claims. Plano, Garland, and Mesquite are searched names; they do not get mill URLs on this pass (0 / 1 / 0 named cards). Listings below are the full sample set.",
  ],
  optionalH2: {
    title: "What this directory covers",
    body: "City pages are for named markets with enough cards. Uptown, Deep Ellum, Las Colinas, and Alliance stay inside their city page. This mock does not rank shops, quote wait times, or publish city wrecker-rotation lists. The metro authorized 39,790 one-unit housing units in 2025 — housing-growth context, not a tow-job forecast.",
  },
};

export type TowingCopyCity = {
  slug: string;
  name: string;
  path: string;
  blurb: string;
  intro: [string, string];
  optionalH2: OptionalH2;
};

export const TOWING_COPY_CITIES: readonly TowingCopyCity[] = [
  {
    slug: "dallas",
    name: "Dallas",
    path: "/tx/dallas/towing/",
    blurb:
      "Principal city — 1,329,491 people (V2025). I-35E / I-30 / I-45 / I-635 stay on this page; place 1-unit 2,026; county 4,651.",
    intro: [
      "Dallas is the MSA principal city: 1,329,491 residents on July 1, 2025, up 25,150 (+1.9%) from the 2020 estimates base of 1,304,341, and down 1,808 (−0.1%) from 2024. Towing search here sits on I-35E, I-30, I-45, I-635, and US-75 — Downtown, Deep Ellum, and Stemmons stay on this page, not separate mill URLs.",
      "Dallas’s BPS 2025 place row shows 2,026 one-unit units; Dallas County authorized 4,651. Treat those as housing-growth context, not a tow-job forecast. Use the listings below for crews that name Dallas (70 cards in this pack; three pack-wide cards are marked dallas_wide).",
    ],
    optionalH2: {
      title: "Dallas vs the suburbs",
      body: "Fort Worth, Arlington, Irving, and Grand Prairie have their own pages. Neighborhood names do not. This directory stays listings-first: call cards first, geography second.",
    },
  },
  {
    slug: "fort-worth",
    name: "Fort Worth",
    path: "/tx/fort-worth/towing/",
    blurb:
      "West principal city — 1,028,117 (V2025). I-30 / I-35W / I-820; place 1-unit 5,887; county 8,658.",
    intro: [
      "Fort Worth is the west-side principal city: 1,028,117 people on July 1, 2025, up 109,225 (+11.9%) from the 2020 base of 918,892, and up 19,512 (+1.9%) from 2024. Local towing search follows I-30, I-35W, and I-820 — Alliance, near-west, and the south fringe stay on this page.",
      "Fort Worth’s BPS 2025 place row is 5,887 one-unit units, the largest city office in the metro; Tarrant County authorized 8,658. That is housing context, not a wrecker ranking. Scroll to the listing stack for Fort Worth–named cards (53 in this pack).",
    ],
    optionalH2: {
      title: "West-side principal city",
      body: "Fort Worth is a second core, not a Dallas neighborhood URL. Tarrant’s 8,658 one-unit count is county context only.",
    },
  },
  {
    slug: "arlington",
    name: "Arlington",
    path: "/tx/arlington/towing/",
    blurb:
      "Mid-cities Tarrant — 402,134 (V2025). I-30 / I-20 / SH-360; place 1-unit 532; county 8,658.",
    intro: [
      "Arlington sits between the two cores in Tarrant County: 402,134 residents on July 1, 2025, up 7,747 (+2.0%) from the 2020 base of 394,387, and down 1,214 (−0.3%) from 2024. I-30, I-20, and SH-360 are the usual local landmarks — entertainment-district traffic is geography, not an invented event-towing product line.",
      "Arlington’s BPS 2025 place row shows 532 one-unit units; Tarrant’s 8,658 is county context. This page is for shops that name Arlington (29 cards in the pack). Metro-wide crews also appear on the hub.",
    ],
    optionalH2: {
      title: "Mid-cities, own URL",
      body: "Arlington is a named Tarrant city, not a Dallas or Fort Worth mill page. Confirm service area on the card you call.",
    },
  },
  {
    slug: "irving",
    name: "Irving",
    path: "/tx/irving/towing/",
    blurb:
      "Airport / 183 side — 257,076 (V2025). Las Colinas; place 1-unit 69; county 4,651.",
    intro: [
      "Irving is the Dallas County city on the DFW Airport / SH-183 / SH-114 side of the metro: 257,076 people on July 1, 2025, up 295 (+0.1%) from the 2020 base of 256,781, and down 1,561 (−0.6%) from 2024. Las Colinas and the airport edge stay on this page.",
      "Irving’s BPS 2025 place row is 69 one-unit units; Dallas County authorized 4,651 (county context). Six named Irving cards sit in this pack. This page does not invent airport-badge or terminal-access rules — ask the shop.",
    ],
    optionalH2: {
      title: "Airport-adjacent without invented rules",
      body: "DFW Airport is the landmark. Paperwork for airside or hotel work is a call with the listing, not a statute claimed here.",
    },
  },
  {
    slug: "grand-prairie",
    name: "Grand Prairie",
    path: "/tx/grand-prairie/towing/",
    blurb:
      "I-30 / I-20 mid-cities — 209,434 (V2025). Place 1-unit 356 (do not assign county totals).",
    intro: [
      "Grand Prairie is the I-30 / I-20 mid-cities strip between Dallas and Fort Worth: 209,434 residents on July 1, 2025, up 13,353 (+6.8%) from the 2020 base of 196,081, and up 1,919 (+0.9%) from 2024. The city spans more than one county; this page stays on the named place, not a county mill URL.",
      "Grand Prairie’s BPS 2025 place row (Dallas County line in the annual file) shows 356 one-unit units. Do not assign Dallas County’s 4,651 or Tarrant’s 8,658 to this city office. Six named cards in this pack; use the stack to call.",
    ],
    optionalH2: {
      title: "Mid-cities strip",
      body: "Pair with Arlington when the shopper’s pin sits between the two cores. Grand Prairie remains a city page because that is the search name.",
    },
  },
  {
    slug: "haltom-city",
    name: "Haltom City",
    path: "/tx/haltom-city/towing/",
    blurb:
      "NE Tarrant — 45,542 (V2025). I-820 / SH-121; place 1-unit 57; county 8,658.",
    intro: [
      "Haltom City is a named NE Tarrant town between Fort Worth and North Richland Hills: 45,542 people on July 1, 2025, down 536 (−1.2%) from the 2020 base of 46,078, and down 229 (−0.5%) from 2024. I-820 and the Airport Freeway (SH-121) are the local landmarks.",
      "Haltom City’s BPS 2025 place row shows 57 one-unit units; Tarrant’s 8,658 is county context. Five named cards in this pack — enough for a city filter, not a claim that this is a high-growth tow market. Listings below.",
    ],
    optionalH2: {
      title: "Small named Tarrant page",
      body: "Haltom City stays a URL because the pack has five city-named cards. Nearby one-card towns stay on the hub or the Fort Worth page.",
    },
  },
  {
    slug: "euless",
    name: "Euless",
    path: "/tx/euless/towing/",
    blurb:
      "Mid-cities / 183 — 60,008 (V2025). DFW south edge; place 1-unit 84; county 8,658.",
    intro: [
      "Euless is the mid-cities / SH-183 town on the south edge of DFW Airport: 60,008 residents on July 1, 2025, down 1,007 (−1.7%) from the 2020 base of 61,015, with a small +57 (+0.1%) from 2024. SH-183 and SH-360 are the usual corridors; airport-adjacent geography stays on this page.",
      "Euless’s BPS 2025 place row shows 84 one-unit units; Tarrant’s 8,658 is county context. Three named cards in this pack. This page does not invent airport or hotel dispatch rules.",
    ],
    optionalH2: {
      title: "Mid-cities, thin stack",
      body: "Euless is a named city filter, not a mill page for every 183-corridor suburb. Bedford and Grapevine do not get their own URLs on this pass.",
    },
  },
] as const;


/** Census-thickened cities — indexable (Stef/Kyle). Thin city routes stay up but noindex + off sitemap. */
export const TOWING_INDEXABLE_CITY_SLUGS: readonly string[] = TOWING_COPY_CITIES.map(
  (c) => c.slug,
);

export function isTowingCityIndexable(slug: string): boolean {
  return TOWING_INDEXABLE_CITY_SLUGS.includes(slug);
}

export function towingCopyBySlug(slug: string): TowingCopyCity | undefined {
  return TOWING_COPY_CITIES.find((c) => c.slug === slug);
}
