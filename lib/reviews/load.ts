import pack from "@/data/reviews.json";
import type { Review, ReviewPack } from "./types";
import { reviewUpsertKey } from "./types";

const SITE_ALIASES: Record<string, string> = {
  "garage-door-install-dfw": "dfw-garage",
  "dfw-garage": "dfw-garage",
  "fence-charlotte": "fence-charlotte",
  "towing-dallas": "towing-dallas",
};

export function normalizeSiteId(siteId: string): string {
  return SITE_ALIASES[siteId] ?? siteId;
}

function isReviewPack(value: unknown): value is ReviewPack {
  if (!value || typeof value !== "object") return false;
  const v = value as ReviewPack;
  return Boolean(
    v.pack && typeof v.pack.site_id === "string" && Array.isArray(v.reviews),
  );
}

/** Built-in pack from data/reviews.json (shipped with the deploy). */
export function loadBundledReviewPack(): ReviewPack {
  if (isReviewPack(pack)) return pack as ReviewPack;
  return {
    pack: { site_id: "dfw-garage", generated_at: new Date().toISOString() },
    reviews: [],
  };
}

/**
 * Laura sidecar paths (local monorepo). Used by ingest script/API on disk —
 * not required at request time on Vercel (bundle is source of truth).
 */
export const LAURA_REVIEW_PATHS: Record<string, string[]> = {
  "dfw-garage": [
    "big-dir-listings/dfw/reviews/reviews.json",
    "../big-dir-listings/dfw/reviews/reviews.json",
  ],
  "fence-charlotte": [
    "big-dir-listings/charlotte-fence/reviews/reviews.json",
    "../big-dir-listings/charlotte-fence/reviews/reviews.json",
  ],
  "towing-dallas": [
    "big-dir-listings/towing-dallas/reviews/reviews.json",
    "../big-dir-listings/towing-dallas/reviews/reviews.json",
  ],
};

export function loadReviewsForSite(siteId: string): Review[] {
  const normalized = normalizeSiteId(siteId);
  const byKey = new Map<string, Review>();

  const bundled = loadBundledReviewPack();
  for (const r of bundled.reviews) {
    if (normalizeSiteId(r.site_id) !== normalized) continue;
    byKey.set(reviewUpsertKey({ ...r, site_id: normalized }), {
      ...r,
      site_id: normalized,
    });
  }

  return [...byKey.values()];
}

export function reviewsForListing(
  siteId: string,
  listingRank: number,
  options?: { suppressBelow?: number | null },
): Review[] {
  const suppressBelow = options?.suppressBelow ?? null;
  return loadReviewsForSite(siteId)
    .filter((r) => r.listing_rank === listingRank)
    .filter((r) =>
      suppressBelow == null || suppressBelow <= 1
        ? true
        : r.stars >= suppressBelow,
    )
    .sort((a, b) => b.reviewed_at.localeCompare(a.reviewed_at));
}

/** All reviews for a listing including suppressed (storage; not for public display). */
export function reviewsForListingRaw(
  siteId: string,
  listingRank: number,
): Review[] {
  return loadReviewsForSite(siteId)
    .filter((r) => r.listing_rank === listingRank)
    .sort((a, b) => b.reviewed_at.localeCompare(a.reviewed_at));
}

/** Aggregated reviews for a set of listings (hub / city directory feed). */
export function reviewsForListings(
  siteId: string,
  listings: { rank: number; reviewSuppressBelow?: number | null }[],
): Review[] {
  const suppressByRank = new Map<number, number | null>();
  for (const listing of listings) {
    suppressByRank.set(listing.rank, listing.reviewSuppressBelow ?? null);
  }
  return loadReviewsForSite(siteId)
    .filter((r) => {
      if (!suppressByRank.has(r.listing_rank)) return false;
      const suppressBelow = suppressByRank.get(r.listing_rank) ?? null;
      if (suppressBelow == null || suppressBelow <= 1) return true;
      return r.stars >= suppressBelow;
    })
    .sort((a, b) => b.reviewed_at.localeCompare(a.reviewed_at));
}
