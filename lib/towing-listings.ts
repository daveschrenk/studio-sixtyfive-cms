import pack from "@/data/towing-listings.json";

export type TowingListing = {
  id: string;
  rank: number;
  name: string;
  slug: string;
  city: string;
  state: string;
  phone: string;
  note: string;
  website?: string | null;
  hours?: string | null;
  amenities: string[];
  photo_url?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  mapsUrl?: string | null;
  street?: string | null;
  zip?: string | null;
  serviceArea: string[];
  dallasWide: boolean;
  reviewSuppressBelow?: number;
};

type Raw = {
  rank: number;
  name: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  maps_url: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  review_count: number | null;
  hours: string | null;
  photo_url: string | null;
  light_duty: boolean | null;
  heavy_duty: boolean | null;
  roadside: boolean | null;
  jump_start: boolean | null;
  lockout: boolean | null;
  tire_change: boolean | null;
  winch_out: boolean | null;
  accident_recovery: boolean | null;
  motorcycle: boolean | null;
  commercial: boolean | null;
  is_24_7: boolean | null;
  flatbed: boolean | null;
  wheel_lift: boolean | null;
  years_in_business: number | null;
  brands: string[] | null;
  service_area: string[] | null;
  dallas_wide: boolean | null;
  extra_notes: string | null;
  reviewSuppressBelow?: number | null;
  review_suppress_below?: number | null;
};

function slugify(name: string, rank: number) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "listing"}-${rank}`;
}

const rawListings = (pack as { listings: Raw[] }).listings;

function amenities(row: Raw): string[] {
  const out: string[] = [];
  if (row.light_duty) out.push("Light duty");
  if (row.heavy_duty) out.push("Heavy duty");
  if (row.roadside) out.push("Roadside");
  if (row.jump_start) out.push("Jump start");
  if (row.lockout) out.push("Lockout");
  if (row.tire_change) out.push("Tire change");
  if (row.winch_out) out.push("Winch out");
  if (row.accident_recovery) out.push("Accident recovery");
  if (row.motorcycle) out.push("Motorcycle");
  if (row.commercial) out.push("Commercial");
  if (row.is_24_7) out.push("24/7");
  if (row.flatbed) out.push("Flatbed");
  if (row.wheel_lift) out.push("Wheel lift");
  if (row.years_in_business) out.push(`${row.years_in_business} years`);
  if (row.brands?.length) out.push(...row.brands.slice(0, 4));
  return out;
}

function toListing(row: Raw): TowingListing {
  const city = row.city || "";
  const note =
    row.extra_notes ||
    (row.service_area?.length ? `Serves ${row.service_area.join(", ")}.` : "");
  const photo = (row.photo_url || "").trim();
  return {
    id: String(row.rank),
    rank: row.rank,
    name: row.name,
    slug: slugify(row.name, row.rank),
    city,
    state: row.state || "",
    phone: row.phone || "",
    note,
    website: row.website || null,
    hours: row.hours || null,
    amenities: amenities(row),
    photo_url: photo || null,
    rating: row.rating,
    reviewCount: row.review_count,
    mapsUrl: row.maps_url || null,
    street: row.street,
    zip: row.zip,
    serviceArea: row.service_area || [],
    dallasWide: Boolean(row.dallas_wide),
    reviewSuppressBelow:
      row.reviewSuppressBelow ?? row.review_suppress_below ?? undefined,
  };
}

export const ALL_TOWING_LISTINGS: TowingListing[] = rawListings
  .slice()
  .sort((a, b) => a.rank - b.rank)
  .map(toListing);

export function listingsForHub(): TowingListing[] {
  return ALL_TOWING_LISTINGS;
}

function citySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type TowingCity = {
  slug: string;
  name: string;
  path: string;
  count: number;
};

export const TOWING_CITIES: TowingCity[] = (() => {
  const map = new Map<string, { name: string; count: number }>();
  for (const listing of ALL_TOWING_LISTINGS) {
    const name = listing.city || "Dallas";
    const slug = citySlug(name) || "dallas";
    const prev = map.get(slug);
    map.set(slug, { name, count: (prev?.count ?? 0) + 1 });
  }
  return [...map.entries()]
    .map(([slug, v]) => ({
      slug,
      name: v.name,
      path: `/tx/${slug}/towing/`,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
})();

export function towingCityBySlug(slug: string): TowingCity | undefined {
  return TOWING_CITIES.find((c) => c.slug === slug);
}

// Metro hub must exist even if no listing has city === "Dallas".
if (!TOWING_CITIES.some((c) => c.slug === "dallas")) {
  TOWING_CITIES.unshift({
    slug: "dallas",
    name: "Dallas",
    path: "/tx/dallas/towing/",
    count: ALL_TOWING_LISTINGS.length,
  });
}

/** Dallas hub is the metro pack (all listings). Other cities are filtered. */
export function listingsForCity(slug: string): TowingListing[] {
  if (slug === "dallas") return ALL_TOWING_LISTINGS;
  return ALL_TOWING_LISTINGS.filter(
    (listing) => citySlug(listing.city || "") === slug,
  );
}
