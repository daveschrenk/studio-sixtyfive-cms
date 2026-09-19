import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import { runFillPool } from "@/lib/fill-pool/run";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const jar = await cookies();
  if (jar.get(CMS_COOKIE_NAME)?.value !== CMS_COOKIE_VALUE) {
    return unauthorized();
  }

  let maxCandidates = 3;
  try {
    const body = (await request.json()) as { maxCandidates?: number };
    if (typeof body?.maxCandidates === "number") {
      maxCandidates = body.maxCandidates;
    }
  } catch {
    // empty body ok
  }

  const result = runFillPool(maxCandidates);
  // Hard safety: never return PASS proposals from this endpoint
  const safe = {
    ...result,
    proposals: result.proposals.map((p) =>
      p.status === "PASS"
        ? {
            ...p,
            status: "HOLD" as const,
            hold_reasons: [
              ...(p.hold_reasons || []),
              "Clamped: Fill pool never invents PASS",
            ],
          }
        : p,
    ),
  };

  return NextResponse.json(safe);
}
