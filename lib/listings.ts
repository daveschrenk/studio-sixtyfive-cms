import pack from "@/data/listings.json";
import type { HoursRow, Listing } from "./types";

type Raw = {
  rank: number;
  sponsor?: boolean | null;
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
  same_day: boolean | null;
  commercial: boolean | null;
  showroom: boolean | null;
  new_construction: boolean | null;
  also_gates: boolean | null;
  family_owned: boolean | null;
  custom_wood: boolean | null;
  years_in_business: number | null;
  brands: string[] | null;
  service_area: string[] | null;
  dfw_wide: boolean | null;
  extra_notes: string | null;
  reviewSuppressBelow?: number | null;
  review_suppress_below?: number | null;
};

const rawListings = (pack as { listings: Raw[] }).listings;

function slugify(name: string, rank: number) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "listing"}-${rank}`;
}

function parseHours(hours: string | null): HoursRow[] {
  if (!hours) return [];
  return hours.split(";").map((part) => {
    const p = part.trim();
    const m = p.match(/^(.+?)\s{2,}(.+)$/) || p.match(/^([A-Za-zÀ-ÿ–\-/, ]+?)\s+(\d.+|[Cc]losed.*)$/);
    if (m) return { days: m[1].trim(), time: m[2].trim() };
    return { days: p, time: "" };
  });
}

function amenities(row: Raw): string[] {
  const out: string[] = [];
  if (row.same_day) out.push("Same-day");
  if (row.new_construction) out.push("New construction");
  if (row.showroom) out.push("Showroom");
  if (row.commercial) out.push("Commercial");
  if (row.also_gates) out.push("Gates");
  if (row.family_owned) out.push("Family owned");
  if (row.custom_wood) out.push("Custom wood");
  if (row.years_in_business) out.push(`${row.years_in_business} years`);
  if (row.brands?.length) out.push(...row.brands.slice(0, 4));
  return out;
}

function toListing(row: Raw): Listing {
  const address = [row.street, row.city, row.state, row.zip].filter(Boolean).join(", ");
  return {
    id: String(row.rank),
    rank: row.rank,
    city: row.city,
    sponsor: Boolean(row.sponsor),
    name: row.name,
    slug: slugify(row.name, row.rank),
    blurb: row.extra_notes || (row.service_area?.length ? `Serves ${row.service_area.join(", ")}.` : ""),
    address: address || row.city || "Dallas–Fort Worth, TX",
    phone: row.phone || "",
    hours: parseHours(row.hours),
    amenities: amenities(row),
    photoStyle: "flush",
    photoTint: "#6b7c8c",
    photoUrl: row.photo_url,
    website: row.website,
    mapsUrl: row.maps_url,
    rating: row.rating,
    reviewCount: row.review_count,
    lat: row.lat ?? 32.7767,
    lng: row.lng ?? -96.797,
    serviceNotes: "",
    sample: false,
    serviceArea: row.service_area || [],
    dfwWide: Boolean(row.dfw_wide),
    reviewSuppressBelow:
      row.reviewSuppressBelow ?? row.review_suppress_below ?? undefined,
  };
}

export const ALL_LISTINGS: Listing[] = rawListings
  .slice()
  .sort((a, b) => a.rank - b.rank)
  .map(toListing);

function namedArea(listing: Listing, cityName: string) {
  const target = cityName.toLowerCase();
  return (listing.serviceArea ?? []).some((area) => area.toLowerCase() === target);
}

export function listingsForCity(cityName: string): Listing[] {
  return ALL_LISTINGS.filter((listing) => namedArea(listing, cityName));
}

export function listingsForHub(): Listing[] {
  return ALL_LISTINGS.filter((listing) => listing.dfwWide);
}
