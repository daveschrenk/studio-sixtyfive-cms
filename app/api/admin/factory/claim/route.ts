import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import { scrapeGateSnapshot } from "@/lib/factory/scrape-budget";
import {
  getClaimLock,
  getNextPassClaim,
  tryClaimNextPass,
} from "@/lib/factory/queue-claim";
import { getTowingDallasPackStatus } from "@/lib/factory/pack-status";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function requireCms() {
  const jar = await cookies();
  return jar.get(CMS_COOKIE_NAME)?.value === CMS_COOKIE_VALUE;
}

export async function GET() {
  if (!(await requireCms())) return unauthorized();

  return NextResponse.json({
    claim: getNextPassClaim(),
    lock: getClaimLock(),
    pack: getTowingDallasPackStatus(),
    scrape: scrapeGateSnapshot(),
  });
}

export async function POST() {
  if (!(await requireCms())) return unauthorized();

  const result = tryClaimNextPass("studio-hub");
  return NextResponse.json({
    ...result,
    pack: getTowingDallasPackStatus(),
    scrape: scrapeGateSnapshot(),
  });
}
