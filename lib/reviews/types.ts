/** Review pack schema (Laura sidecar / data/reviews.json). */

export type ReviewSource = "google" | "yelp";

export type Review = {
  listing_rank: number;
  site_id: string;
  stars: number; // 1–5
  text: string;
  author: string | null;
  source: ReviewSource;
  source_url: string | null;
  reviewed_at: string; // YYYY-MM-DD
  pulled_at: string; // ISO
  source_review_id: string;
  raw: unknown | null;
};

export type ReviewPackMeta = {
  site_id: string;
  generated_at: string;
};

export type ReviewPack = {
  pack: ReviewPackMeta;
  reviews: Review[];
};

/** Upsert identity: site_id + source + source_review_id */
export function reviewUpsertKey(r: Pick<Review, "site_id" | "source" | "source_review_id">): string {
  return `${r.site_id}::${r.source}::${r.source_review_id}`;
}
