import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import { listSubscribers } from "@/lib/mailing-list/store";
import { getTenantByHost } from "@/lib/tenants";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  if (jar.get(CMS_COOKIE_NAME)?.value !== CMS_COOKIE_VALUE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const h = await headers();
  const siteId =
    h.get("x-site-id") ||
    getTenantByHost(h.get("x-forwarded-host") ?? h.get("host") ?? "").siteId;
  const subscribers = await listSubscribers(siteId);
  return NextResponse.json({ siteId, subscribers });
}
