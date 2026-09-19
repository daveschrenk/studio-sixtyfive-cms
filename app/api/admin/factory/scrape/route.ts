import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import {
  assertPaidScrapeAllowed,
  scrapeGateSnapshot,
} from "@/lib/factory/scrape-budget";
import { getClaimLock, getNextPassClaim } from "@/lib/factory/queue-claim";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Paid scrape endpoint — gated. Never spawns scraper this pass.
 */
export async function POST(request: Request) {
  const jar = await cookies();
  if (jar.get(CMS_COOKIE_NAME)?.value !== CMS_COOKIE_VALUE) {
    return unauthorized();
  }

  let estimatedCostCents: number | undefined;
  try {
    const body = (await request.json()) as { estimatedCostCents?: number };
    if (typeof body?.estimatedCostCents === "number") {
      estimatedCostCents = body.estimatedCostCents;
    }
  } catch {
    // empty body ok
  }

  // FIRST: budget + kill switch before any paid scrape path
  const gate = assertPaidScrapeAllowed(estimatedCostCents);
  const snapshot = scrapeGateSnapshot();
  const claim = getNextPassClaim();
  const lock = getClaimLock();

  if (!gate.ok) {
    return NextResponse.json(
      {
        error: "Paid scrape blocked",
        reason: gate.reason,
        killSwitch: gate.killSwitch,
        budgetCents: gate.budgetCents,
        budgetUsd: snapshot.budgetUsd,
        claim,
        lock,
        scrapeAttempted: false,
      },
      { status: 403 },
    );
  }

  // Cap armed but runner not enabled this pass
  return NextResponse.json(
    {
      error: "Paid scrape not enabled",
      reason:
        "Paid scrape not enabled this pass — Laura pack / explicit runner required; cap is $25/run.",
      killSwitch: snapshot.killSwitch,
      budgetCents: snapshot.budgetCents,
      budgetUsd: snapshot.budgetUsd,
      claim,
      lock,
      scrapeAttempted: false,
    },
    { status: 501 },
  );
}
