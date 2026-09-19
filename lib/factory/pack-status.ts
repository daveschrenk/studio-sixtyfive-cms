import fs from "fs";
import path from "path";

export type PackStatus = {
  niche_slug: "towing-dallas";
  packRoot: string | null;
  hasListingsJson: boolean;
  listingCount: number;
  rawBytes: number;
  /** Laura reviews sidecar present under niche reviews/ (factory content gate). */
  hasReviewsPack: boolean;
  reviewCount: number;
  thin: boolean;
  /** Soft-hold Done: listings alone are not enough — reviews pack required before Dave OK / domain. */
  readyForDone: boolean;
  message: string;
};

const CANDIDATE_ROOTS = [
  "/workspace/big-dir-listings/towing-dallas",
  path.join(process.cwd(), "big-dir-listings", "towing-dallas"),
  path.join(process.cwd(), "..", "big-dir-listings", "towing-dallas"),
];

/** Deployed pack copy inside the Next app (Vercel-safe). */
const PROJECT_LISTINGS = path.join(process.cwd(), "data", "towing-listings.json");
/** Bundled multi-site reviews (ingest target). */
const PROJECT_REVIEWS = path.join(process.cwd(), "data", "reviews.json");

function resolvePackRoot(): string | null {
  for (const root of CANDIDATE_ROOTS) {
    try {
      if (fs.existsSync(root) && fs.statSync(root).isDirectory()) {
        return root;
      }
    } catch {
      // continue
    }
  }
  return null;
}

function readListingCount(listingsPath: string): number {
  try {
    const raw = fs.readFileSync(listingsPath, "utf8");
    const parsed = JSON.parse(raw) as { listings?: unknown[] } | unknown[];
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && Array.isArray(parsed.listings)) return parsed.listings.length;
    return 0;
  } catch {
    return 0;
  }
}

function fileSize(p: string): number {
  try {
    return fs.statSync(p).size;
  } catch {
    return 0;
  }
}


function countReviewsForSite(reviewsPath: string, siteId: string): number {
  try {
    const raw = JSON.parse(fs.readFileSync(reviewsPath, "utf8")) as {
      reviews?: { site_id?: string }[];
    };
    if (!Array.isArray(raw.reviews)) return 0;
    return raw.reviews.filter((r) => r.site_id === siteId).length;
  } catch {
    return 0;
  }
}

export function getTowingDallasPackStatus(): PackStatus {
  const niche_slug = "towing-dallas" as const;
  const packRoot = resolvePackRoot();

  const listingsCandidates = [
    PROJECT_LISTINGS,
    ...(packRoot
      ? [
          path.join(packRoot, "listings.json"),
          path.join(packRoot, "build", "listings.json"),
        ]
      : []),
  ];
  let listingsPath: string | null = null;
  for (const p of listingsCandidates) {
    if (fs.existsSync(p)) {
      listingsPath = p;
      break;
    }
  }

  const hasListingsJson = Boolean(listingsPath);
  const listingCount = listingsPath ? readListingCount(listingsPath) : 0;
  const rawBytes = packRoot
    ? fileSize(path.join(packRoot, "raw", "raw-gmaps.jsonl"))
    : 0;

  // Factory gate: preview not Done without Laura reviews pack for claimed niche.
  const reviewCandidates = [
    ...(packRoot
      ? [
          path.join(packRoot, "reviews", "reviews.json"),
          path.join(packRoot, "reviews", "reviews.min.json"),
        ]
      : []),
    PROJECT_REVIEWS,
  ];
  let hasReviewsPack = false;
  let reviewCount = 0;
  for (const rp of reviewCandidates) {
    if (!fs.existsSync(rp)) continue;
    const n =
      rp === PROJECT_REVIEWS
        ? countReviewsForSite(rp, niche_slug)
        : (() => {
            try {
              const raw = JSON.parse(fs.readFileSync(rp, "utf8")) as {
                pack?: { site_id?: string };
                reviews?: unknown[];
              };
              if (raw?.pack?.site_id && raw.pack.site_id !== niche_slug) return 0;
              return Array.isArray(raw.reviews) ? raw.reviews.length : 0;
            } catch {
              return 0;
            }
          })();
    if (n > 0) {
      hasReviewsPack = true;
      reviewCount = n;
      break;
    }
  }

  // Photos soft-empty OK — thin only when pack/listings missing
  const thin = !hasListingsJson || listingCount === 0;
  // Soft-hold Done until reviews land (Dave required before Done/domain).
  const readyForDone = !thin && hasReviewsPack && reviewCount > 0;

  let message: string;
  if (thin) {
    message = `Thin pack (listings=${listingCount}, rawBytes=${rawBytes}) — preview stub only; paid scrape gated.`;
  } else if (!hasReviewsPack) {
    message = `Pack has ${listingCount} listings but reviews pack MISSING — soft-hold Done (Dave required before domain). Preview OK at ?tenant=towing-dallas.`;
  } else {
    message = `Pack has ${listingCount} listings + ${reviewCount} reviews — pack-preview ready; reviews gate satisfied (still no domain until Dave OK).`;
  }

  return {
    niche_slug,
    packRoot: packRoot ?? (hasListingsJson ? path.dirname(PROJECT_LISTINGS) : null),
    hasListingsJson,
    listingCount,
    rawBytes,
    hasReviewsPack,
    reviewCount,
    thin,
    readyForDone,
    message,
  };
}
