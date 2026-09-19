import { NextResponse } from "next/server";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import type { ReviewPack } from "@/lib/reviews";
import { ingestReviewPack } from "@/lib/reviews";

export const runtime = "nodejs";

function authorized(request: Request): boolean {
  const cookie = request.headers.get("cookie") || "";
  if (cookie.includes(`${CMS_COOKIE_NAME}=${CMS_COOKIE_VALUE}`)) return true;
  const secret = process.env.REVIEWS_INGEST_SECRET;
  if (secret && request.headers.get("x-reviews-ingest-secret") === secret) {
    return true;
  }
  return false;
}

/**
 * POST JSON ReviewPack — upserts by site_id + source + source_review_id.
 * Auth: CMS cookie or x-reviews-ingest-secret header.
 */
export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const pack = body as ReviewPack;
  if (
    !pack?.pack?.site_id ||
    !Array.isArray(pack.reviews)
  ) {
    return NextResponse.json(
      { ok: false, error: "Expected { pack: { site_id, generated_at }, reviews: [] }" },
      { status: 400 },
    );
  }

  try {
    const result = ingestReviewPack(pack);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[reviews/ingest]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Ingest failed" },
      { status: 500 },
    );
  }
}
