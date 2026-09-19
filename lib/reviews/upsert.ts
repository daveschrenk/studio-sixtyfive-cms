import fs from "fs";
import path from "path";
import type { Review, ReviewPack } from "./types";
import { reviewUpsertKey } from "./types";
import { LAURA_REVIEW_PATHS, loadBundledReviewPack, normalizeSiteId } from "./load";

function validateReview(r: unknown): r is Review {
  if (!r || typeof r !== "object") return false;
  const x = r as Review;
  return (
    typeof x.listing_rank === "number" &&
    typeof x.site_id === "string" &&
    typeof x.stars === "number" &&
    x.stars >= 1 &&
    x.stars <= 5 &&
    typeof x.text === "string" &&
    (x.author === null || typeof x.author === "string") &&
    (x.source === "google" || x.source === "yelp") &&
    (x.source_url === null || typeof x.source_url === "string") &&
    typeof x.reviewed_at === "string" &&
    typeof x.pulled_at === "string" &&
    typeof x.source_review_id === "string"
  );
}

export function readReviewPackFromFile(filePath: string): ReviewPack | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
    if (!raw || typeof raw !== "object") return null;
    const v = raw as ReviewPack;
    if (!v.pack || typeof v.pack.site_id !== "string" || !Array.isArray(v.reviews)) {
      return null;
    }
    return v;
  } catch (err) {
    console.warn("[reviews] failed to read pack", filePath, err);
    return null;
  }
}

export type UpsertResult = {
  ok: true;
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  wrotePath: string;
};

/**
 * Upsert reviews into a pack without wiping history.
 * Match key: site_id + source + source_review_id.
 */
export function upsertReviewsIntoPack(
  existing: ReviewPack,
  incoming: Review[],
  packSiteId: string,
): { pack: ReviewPack; inserted: number; updated: number; skipped: number } {
  const normalizedSite = normalizeSiteId(packSiteId);
  const byKey = new Map<string, Review>();
  for (const r of existing.reviews) {
    const site_id = normalizeSiteId(r.site_id);
    byKey.set(reviewUpsertKey({ ...r, site_id }), { ...r, site_id });
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of incoming) {
    if (!validateReview(raw)) {
      skipped += 1;
      continue;
    }
    const site_id = normalizeSiteId(raw.site_id || normalizedSite);
    const next: Review = {
      listing_rank: raw.listing_rank,
      site_id,
      stars: Math.round(Math.min(5, Math.max(1, raw.stars))),
      text: raw.text,
      author: raw.author ?? null,
      source: raw.source,
      source_url: raw.source_url ?? null,
      reviewed_at: raw.reviewed_at,
      pulled_at: raw.pulled_at,
      source_review_id: raw.source_review_id,
      raw: raw.raw ?? null,
    };
    const key = reviewUpsertKey(next);
    if (byKey.has(key)) {
      byKey.set(key, next);
      updated += 1;
    } else {
      byKey.set(key, next);
      inserted += 1;
    }
  }

  return {
    pack: {
      pack: {
        site_id: normalizedSite,
        generated_at: new Date().toISOString(),
      },
      reviews: [...byKey.values()],
    },
    inserted,
    updated,
    skipped,
  };
}

function writePack(filePath: string, pack: ReviewPack): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(pack, null, 2) + "\n", "utf8");
}

function resolveLauraPath(siteId: string): string | null {
  const candidates = LAURA_REVIEW_PATHS[siteId] || [];
  for (const rel of candidates) {
    const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
    if (fs.existsSync(path.dirname(abs)) || fs.existsSync(abs)) return abs;
  }
  // Prefer first candidate even if missing (will create)
  if (candidates[0]) {
    return path.join(process.cwd(), candidates[0]);
  }
  return null;
}

/**
 * Ingest a Laura (or any) review pack into sidecar + data/reviews.json.
 * Upserts by site_id + source + source_review_id; never wipes other rows.
 */
export function ingestReviewPack(
  incomingPack: ReviewPack,
  options?: { targetPath?: string },
): UpsertResult {
  const siteId = normalizeSiteId(incomingPack.pack.site_id);
  const lauraPath = resolveLauraPath(siteId);
  const targetPath =
    options?.targetPath ||
    lauraPath ||
    path.join(process.cwd(), "data", "reviews.json");

  const existing =
    readReviewPackFromFile(targetPath) ||
    ({
      pack: { site_id: siteId, generated_at: new Date().toISOString() },
      reviews: [],
    } satisfies ReviewPack);

  const { pack, inserted, updated, skipped } = upsertReviewsIntoPack(
    existing,
    incomingPack.reviews,
    siteId,
  );
  writePack(targetPath, pack);

  // Merge into app data/reviews.json (deploy source of truth)
  const bundledPath = path.join(process.cwd(), "data", "reviews.json");
  if (path.resolve(bundledPath) !== path.resolve(targetPath)) {
    const bundled = readReviewPackFromFile(bundledPath) || loadBundledReviewPack();
    const allByKey = new Map<string, Review>();
    for (const r of bundled.reviews) {
      allByKey.set(reviewUpsertKey(r), r);
    }
    for (const r of pack.reviews) {
      allByKey.set(reviewUpsertKey(r), r);
    }
    writePack(bundledPath, {
      pack: {
        site_id: siteId,
        generated_at: new Date().toISOString(),
      },
      reviews: [...allByKey.values()],
    });
  }

  return {
    ok: true,
    inserted,
    updated,
    skipped,
    total: pack.reviews.length,
    wrotePath: targetPath,
  };
}

export function ingestReviewPackFromFile(filePath: string): UpsertResult {
  const pack = readReviewPackFromFile(filePath);
  if (!pack) {
    throw new Error(`Invalid or missing review pack: ${filePath}`);
  }
  return ingestReviewPack(pack);
}
