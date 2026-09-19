import { ALL_FENCE_LISTINGS, type FenceListing } from "@/lib/fence-listings";
import {
  ALL_TOWING_LISTINGS,
  type TowingListing,
} from "@/lib/towing-listings";
import { ALL_LISTINGS } from "@/lib/listings";
import type { HoursRow, Listing } from "@/lib/types";
import { getTenantBySiteId } from "@/lib/tenants";
import reviewFlags from "@/data/listing-review-flags.json";

export type DirectoryListing = {
  siteId: string;
  rank: number;
  id: string;
  slug: string;
  name: string;
  blurb: string;
  address: string;
  phone: string;
  website?: string | null;
  mapsUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  amenities: string[];
  hours: HoursRow[];
  hoursText?: string | null;
  photoUrl?: string | null;
  photoPositionY?: number;
  sponsor?: boolean;
  reviewSuppressBelow?: number;
  hubPath: string;
};

type FlagMap = Record<string, Record<string, { reviewSuppressBelow?: number }>>;

function applyReviewFlags(listing: DirectoryListing): DirectoryListing {
  const siteFlags = (reviewFlags as FlagMap)[listing.siteId] || {};
  const flag = siteFlags[String(listing.rank)];
  if (!flag?.reviewSuppressBelow) return listing;
  return {
    ...listing,
    reviewSuppressBelow: listing.reviewSuppressBelow ?? flag.reviewSuppressBelow,
  };
}


function fromGarage(listing: Listing): DirectoryListing {
  return {
    siteId: "dfw-garage",
    rank: listing.rank ?? (Number(listing.id) || 0),
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    blurb: listing.blurb,
    address: listing.address,
    phone: listing.phone,
    website: listing.website,
    mapsUrl: listing.mapsUrl,
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    amenities: listing.amenities,
    hours: listing.hours,
    photoUrl: listing.photoUrl,
    photoPositionY: listing.photoPositionY,
    sponsor: listing.sponsor,
    reviewSuppressBelow: listing.reviewSuppressBelow,
    hubPath: getTenantBySiteId("dfw-garage")!.hubPath,
  };
}

function parseFenceHours(hours: string | null | undefined): HoursRow[] {
  if (!hours) return [];
  return hours.split(";").map((part) => {
    const p = part.trim();
    const m =
      p.match(/^(.+?)\s{2,}(.+)$/) ||
      p.match(/^([A-Za-zÀ-ÿ–\-/, ]+?)\s+(\d.+|[Cc]losed.*)$/);
    if (m) return { days: m[1].trim(), time: m[2].trim() };
    return { days: p, time: "" };
  });
}

function fromFence(listing: FenceListing): DirectoryListing {
  const address = [listing.street, listing.city, listing.state, listing.zip]
    .filter(Boolean)
    .join(", ");
  return {
    siteId: "fence-charlotte",
    rank: listing.rank,
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    blurb: listing.note,
    address: address || `${listing.city}${listing.state ? `, ${listing.state}` : ""}`,
    phone: listing.phone,
    website: listing.website,
    mapsUrl: listing.mapsUrl,
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    amenities: listing.amenities,
    hours: parseFenceHours(listing.hours),
    hoursText: listing.hours,
    photoUrl: listing.photo_url,
    sponsor: false,
    reviewSuppressBelow: listing.reviewSuppressBelow,
    hubPath: getTenantBySiteId("fence-charlotte")!.hubPath,
  };
}


function fromTowing(listing: TowingListing): DirectoryListing {
  const address = [listing.street, listing.city, listing.state, listing.zip]
    .filter(Boolean)
    .join(", ");
  return {
    siteId: "towing-dallas",
    rank: listing.rank,
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    blurb: listing.note,
    address: address || `${listing.city}${listing.state ? `, ${listing.state}` : ""}`,
    phone: listing.phone,
    website: listing.website,
    mapsUrl: listing.mapsUrl,
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    amenities: listing.amenities,
    hours: parseFenceHours(listing.hours),
    hoursText: listing.hours,
    photoUrl: listing.photo_url,
    sponsor: false,
    reviewSuppressBelow: listing.reviewSuppressBelow,
    hubPath: getTenantBySiteId("towing-dallas")!.hubPath,
  };
}

export function listingDetailPath(slug: string): string {
  return `/l/${slug}/`;
}

export function findListingBySlug(
  siteId: string,
  slug: string,
): DirectoryListing | null {
  if (siteId === "fence-charlotte") {
    const hit = ALL_FENCE_LISTINGS.find((l) => l.slug === slug);
    return hit ? applyReviewFlags(fromFence(hit)) : null;
  }
  if (siteId === "towing-dallas") {
    const hit = ALL_TOWING_LISTINGS.find((l) => l.slug === slug);
    return hit ? applyReviewFlags(fromTowing(hit)) : null;
  }
  if (siteId === "dfw-garage") {
    const hit = ALL_LISTINGS.find((l) => l.slug === slug);
    return hit ? applyReviewFlags(fromGarage(hit)) : null;
  }
  // studio-hub and unknown tenants have no public listings
  return null;
}

export function findListingByRank(
  siteId: string,
  rank: number,
): DirectoryListing | null {
  if (siteId === "fence-charlotte") {
    const hit = ALL_FENCE_LISTINGS.find((l) => l.rank === rank);
    return hit ? applyReviewFlags(fromFence(hit)) : null;
  }
  if (siteId === "towing-dallas") {
    const hit = ALL_TOWING_LISTINGS.find((l) => l.rank === rank);
    return hit ? applyReviewFlags(fromTowing(hit)) : null;
  }
  if (siteId === "dfw-garage") {
    const hit = ALL_LISTINGS.find((l) => l.rank === rank);
    return hit ? applyReviewFlags(fromGarage(hit)) : null;
  }
  return null;
}

export function allListingSlugsForSite(siteId: string): string[] {
  if (siteId === "fence-charlotte") {
    return ALL_FENCE_LISTINGS.map((l) => l.slug);
  }
  if (siteId === "towing-dallas") {
    return ALL_TOWING_LISTINGS.map((l) => l.slug);
  }
  if (siteId === "dfw-garage") {
    return ALL_LISTINGS.map((l) => l.slug);
  }
  return [];
}
