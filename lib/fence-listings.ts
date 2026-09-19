/** Laura pack v2 enrich redeploy 1788774864: sa=31 clt=22 pine_sa=8. */
import pack from "@/data/fence-listings.json";

export type FenceListing = {
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
  cltWide: boolean;
  /** Hide reviews with stars < N on the Reviews tab (storage untouched). */
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
  wood: boolean | null;
  vinyl: boolean | null;
  chain_link: boolean | null;
  aluminum_or_iron: boolean | null;
  gates: boolean | null;
  commercial: boolean | null;
  residential: boolean | null;
  custom: boolean | null;
  years_in_business: number | null;
  brands: string[] | null;
  service_area: string[] | null;
  clt_wide: boolean | null;
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
  if (row.wood) out.push("Wood");
  if (row.vinyl) out.push("Vinyl");
  if (row.chain_link) out.push("Chain-link");
  if (row.aluminum_or_iron) out.push("Aluminum / iron");
  if (row.gates) out.push("Gates");
  if (row.commercial) out.push("Commercial");
  if (row.residential) out.push("Residential");
  if (row.custom) out.push("Custom");
  if (row.years_in_business) out.push(`${row.years_in_business} years`);
  if (row.brands?.length) out.push(...row.brands.slice(0, 4));
  return out;
}

function toListing(row: Raw): FenceListing {
  const city = row.city || "";
  const note =
    row.extra_notes ||
    (row.service_area?.length ? `Serves ${row.service_area.join(", ")}.` : "");
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
    photo_url: row.photo_url || null,
    rating: row.rating,
    reviewCount: row.review_count,
    mapsUrl: row.maps_url || null,
    street: row.street,
    zip: row.zip,
    serviceArea: row.service_area || [],
    cltWide: Boolean(row.clt_wide),
    reviewSuppressBelow:
      row.reviewSuppressBelow ?? row.review_suppress_below ?? undefined,
  };
}

export const ALL_FENCE_LISTINGS: FenceListing[] = rawListings
  .slice()
  .sort((a, b) => a.rank - b.rank)
  .map(toListing);

function matchesCity(listing: FenceListing, cityName: string) {
  const target = cityName.trim().toLowerCase();
  if (!target) return false;
  if (listing.city.toLowerCase() === target) return true;
  return listing.serviceArea.some((area) => area.toLowerCase() === target);
}

/** City pages: shop city match OR service_area contains city. */
export function listingsForCity(cityName: string): FenceListing[] {
  return ALL_FENCE_LISTINGS.filter((listing) => matchesCity(listing, cityName));
}

/**
 * Charlotte hub: full metro pack (shop-in-city, serves-city, clt_wide,
 * and remaining MSA shops kept for the hub phrase).
 */
export function listingsForHub(): FenceListing[] {
  return ALL_FENCE_LISTINGS;
}