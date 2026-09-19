import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";

export const runtime = "nodejs";

/** MVP runs sync on POST; status is a stub for UI polling compatibility. */
export async function GET() {
  const jar = await cookies();
  if (jar.get(CMS_COOKIE_NAME)?.value !== CMS_COOKIE_VALUE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    status: "idle",
    note: "MVP fill-pool is synchronous via POST /api/admin/fill-pool",
  });
}
