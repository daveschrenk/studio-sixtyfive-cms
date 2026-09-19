import { headers } from "next/headers";
import { SITE_URL } from "@/lib/data";
import {
  getSiteUrlFromHost,
  getTenantByHost,
  getTenantBySiteId,
  isStudioPreviewHost,
  normalizeHost,
  type Tenant,
} from "@/lib/tenants";

export async function getRequestSite(): Promise<{
  siteUrl: string;
  tenant: Tenant;
  /** Studio (or vercel.app) serving a non-studio tenant via ?tenant= / preview cookie. */
  isStudioPreview: boolean;
}> {
  const h = await headers();
  const siteUrlHeader = h.get("x-site-url");
  const siteIdHeader = h.get("x-site-id");
  const previewTenant = h.get("x-preview-tenant");
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const normalized = normalizeHost(host);
  const studioHost = isStudioPreviewHost(host);

  // Prefer explicit middleware site id / preview switch (needed for *.vercel.app demos)
  let tenant =
    (studioHost && previewTenant && getTenantBySiteId(previewTenant)) ||
    (siteIdHeader && getTenantBySiteId(siteIdHeader)) ||
    getTenantByHost(host, studioHost ? previewTenant : null);

  // Known custom domains always win over preview cookie / ?tenant=
  // (fence + ?tenant= must stay fence; never flip canon to studio).
  if (!studioHost) {
    const byHost = getTenantByHost(host, null);
    if (byHost.domains.includes(normalized)) {
      tenant = byHost;
    }
  } else if (previewTenant) {
    const preview = getTenantBySiteId(previewTenant);
    if (preview) tenant = preview;
  }

  // When previewing a tenant on studio host, keep studio apex for canonicals
  const hostTenant = getTenantByHost(host, null);
  const siteUrlBaseTenant =
    studioHost && hostTenant.domains.includes(normalized)
      ? hostTenant
      : tenant;

  const siteUrl =
    siteUrlHeader ||
    (host ? getSiteUrlFromHost(host, siteUrlBaseTenant) : SITE_URL);

  const isStudioPreview =
    studioHost && tenant.siteId !== "studio-hub" && Boolean(previewTenant);

  return { siteUrl, tenant, isStudioPreview };
}
