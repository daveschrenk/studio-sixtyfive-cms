#!/usr/bin/env node
/**
 * Upsert a Laura review pack into sidecar + data/reviews.json.
 * Usage:
 *   node scripts/ingest-reviews.mjs [path/to/reviews.json]
 *   node scripts/ingest-reviews.mjs --site dfw-garage
 *   node scripts/ingest-reviews.mjs --site fence-charlotte
 *   node scripts/ingest-reviews.mjs --site towing-dallas
 *
 * Default: ingest Laura sidecars for all known sites when present.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(import.meta.url);

// Use compiled-free TS via dynamic import of next isn't available;
// reimplement minimal upsert here to avoid ts-node dependency.
function upsertKey(r) {
  return `${r.site_id}::${r.source}::${r.source_review_id}`;
}

function normalizeSiteId(siteId) {
  if (siteId === "garage-door-install-dfw") return "dfw-garage";
  return siteId;
}

function readPack(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!data?.pack?.site_id || !Array.isArray(data.reviews)) return null;
  return data;
}

function writePack(filePath, pack) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(pack, null, 2) + "\n", "utf8");
}

function upsert(existing, incoming, siteId) {
  const normalized = normalizeSiteId(siteId);
  const byKey = new Map();
  for (const r of existing.reviews || []) {
    const site_id = normalizeSiteId(r.site_id);
    byKey.set(upsertKey({ ...r, site_id }), { ...r, site_id });
  }
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  for (const raw of incoming) {
    if (
      !raw ||
      typeof raw.listing_rank !== "number" ||
      typeof raw.stars !== "number" ||
      typeof raw.source_review_id !== "string" ||
      !(raw.source === "google" || raw.source === "yelp")
    ) {
      skipped += 1;
      continue;
    }
    const site_id = normalizeSiteId(raw.site_id || normalized);
    const next = {
      listing_rank: raw.listing_rank,
      site_id,
      stars: Math.round(Math.min(5, Math.max(1, raw.stars))),
      text: String(raw.text || ""),
      author: raw.author ?? null,
      source: raw.source,
      source_url: raw.source_url ?? null,
      reviewed_at: raw.reviewed_at,
      pulled_at: raw.pulled_at,
      source_review_id: raw.source_review_id,
      raw: raw.raw ?? null,
    };
    const key = upsertKey(next);
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
      pack: { site_id: normalized, generated_at: new Date().toISOString() },
      reviews: [...byKey.values()],
    },
    inserted,
    updated,
    skipped,
  };
}

const LAURA = {
  "dfw-garage": path.join(root, "..", "big-dir-listings", "dfw", "reviews", "reviews.json"),
  "fence-charlotte": path.join(
    root,
    "..",
    "big-dir-listings",
    "charlotte-fence",
    "reviews",
    "reviews.json",
  ),
  "towing-dallas": path.join(
    root,
    "..",
    "big-dir-listings",
    "towing-dallas",
    "reviews",
    "reviews.json",
  ),
};

const bundledPath = path.join(root, "data", "reviews.json");

function ingestFile(filePath) {
  const incoming = readPack(filePath);
  if (!incoming) throw new Error(`Invalid pack: ${filePath}`);
  const siteId = normalizeSiteId(incoming.pack.site_id);
  const sidecar = LAURA[siteId] || filePath;
  const existing = readPack(sidecar) || {
    pack: { site_id: siteId, generated_at: new Date().toISOString() },
    reviews: [],
  };
  const { pack, inserted, updated, skipped } = upsert(
    existing,
    incoming.reviews,
    siteId,
  );
  writePack(sidecar, pack);

  const bundled = readPack(bundledPath) || {
    pack: { site_id: siteId, generated_at: new Date().toISOString() },
    reviews: [],
  };
  const mergedKeys = new Map();
  for (const r of bundled.reviews) mergedKeys.set(upsertKey(r), r);
  for (const r of pack.reviews) mergedKeys.set(upsertKey(r), r);
  writePack(bundledPath, {
    pack: { site_id: siteId, generated_at: new Date().toISOString() },
    reviews: [...mergedKeys.values()],
  });

  return { siteId, inserted, updated, skipped, total: pack.reviews.length, sidecar };
}

const args = process.argv.slice(2);
try {
  if (args[0] && !args[0].startsWith("--")) {
    console.log(JSON.stringify(ingestFile(path.resolve(args[0])), null, 2));
  } else if (args[0] === "--site" && args[1]) {
    const site = normalizeSiteId(args[1]);
    const file = LAURA[site];
    if (!file) throw new Error(`Unknown site: ${args[1]}`);
    console.log(JSON.stringify(ingestFile(file), null, 2));
  } else {
    const results = [];
    for (const [site, file] of Object.entries(LAURA)) {
      if (!fs.existsSync(file)) {
        results.push({ site, skipped: true, reason: "missing" });
        continue;
      }
      results.push(ingestFile(file));
    }
    console.log(JSON.stringify(results, null, 2));
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
