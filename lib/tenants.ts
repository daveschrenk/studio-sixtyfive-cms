import { SITE } from "@/lib/data";

/** Per-tenant hub URL pattern — pick one before host #2 (Stef/Kyle 2026-09-02). */
export type HubMode = "at-root" | "redirect-to-hub";

export type Tenant = {
  siteId: string;
  domains: string[]; // hostnames without protocol
  name: string;
  tagline: string;
  keyword: string;
  primaryUrl: string; // https://...
  /** How `/` resolves for this tenant. DFW uses redirect-to-hub (308). */
  hubMode: HubMode;
  /** Hub path when hubMode is redirect-to-hub (and for sitemap/nav). */
  hubPath: string;
  /** CMS theme id default for this tenant (localStorage overrides). */
  defaultThemeId?: string;
};

export const TENANTS: Tenant[] = [
  {
    siteId: "dfw-garage",
    domains: [
      "dfwgaragedoorinstallers.com",
      "www.dfwgaragedoorinstallers.com",
      "dfw-garage-install.vercel.app",
    ],
    name: "DFW Garage Door Installers",
    tagline: SITE.tagline,
    keyword: "garage door install Dallas Fort Worth",
    primaryUrl: "https://dfwgaragedoorinstallers.com",
    hubMode: "redirect-to-hub",
    hubPath: "/tx/dallas-fort-worth/garage-door-install/",
    defaultThemeId: "slate-amber",
  },
  {
    siteId: "fence-charlotte",
    domains: [
      "charlottefencecompanies.com",
      "www.charlottefencecompanies.com",
    ],
    name: "Charlotte Fence Companies",
    tagline: "Local fence companies in Charlotte and nearby suburbs.",
    keyword: "fence company Charlotte",
    primaryUrl: "https://charlottefencecompanies.com",
    hubMode: "at-root",
    hubPath: "/nc/charlotte/fence-company/",
    defaultThemeId: "harbor-teal",
  },
  {
    siteId: "studio-hub",
    domains: ["studiosixtyfive.com", "www.studiosixtyfive.com"],
    name: "Big Dir Studio",
    tagline: "Big Dir factory hub — sites, idea pool, and launch tools.",
    keyword: "Big Dir factory hub",
    primaryUrl: "https://studiosixtyfive.com",
    hubMode: "at-root",
    hubPath: "/",
    defaultThemeId: "slate-amber",
  },
  {
    // Custom domain: dallastowingcompanies.com (studio ?tenant= preview still works for CMS).
    siteId: "towing-dallas",
    domains: [
      "dallastowingcompanies.com",
      "www.dallastowingcompanies.com",
    ],
    name: "Dallas Towing Companies",
    tagline: "Local towing companies in Dallas and nearby suburbs.",
    keyword: "towing Dallas",
    primaryUrl: "https://dallastowingcompanies.com",
    hubMode: "redirect-to-hub",
    hubPath: "/tx/dallas/towing/",
    defaultThemeId: "slate-amber",
  },
];

const DEFAULT_TENANT = TENANTS[0]!;

export function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/:\d+$/, "").trim();
}

export function getTenantBySiteId(siteId: string): Tenant | undefined {
  return TENANTS.find((t) => t.siteId === siteId);
}

/** Studio apex / www, or *.vercel.app — the only hosts that may honor ?tenant= / preview cookie. */
export function isStudioPreviewHost(host: string): boolean {
  const normalized = normalizeHost(host);
  const studio = getTenantBySiteId("studio-hub");
  if (studio?.domains.includes(normalized)) return true;
  return normalized.endsWith(".vercel.app");
}

export function getTenantByHost(
  host: string,
  previewTenantId?: string | null,
): Tenant {
  if (previewTenantId) {
    const preview = getTenantBySiteId(previewTenantId);
    if (preview) return preview;
  }
  const normalized = normalizeHost(host);
  const matched = TENANTS.find((t) => t.domains.includes(normalized));
  if (matched) return matched;
  // Preview deployments without explicit tenant → DFW
  if (normalized.endsWith(".vercel.app")) return DEFAULT_TENANT;
  return DEFAULT_TENANT;
}

/**
 * Site origin for metadataBase / canonicals.
 * Custom-domain tenants always use apex primaryUrl (never www).
 * Preview / *.vercel.app keep the request host.
 */
export function getSiteUrlFromHost(host: string, tenant?: Tenant): string {
  const normalized = normalizeHost(host);
  const t = tenant ?? DEFAULT_TENANT;
  if (!normalized) return t.primaryUrl;
  if (normalized.endsWith(".vercel.app")) {
    return `https://${normalized}`;
  }
  // Matched custom domain (apex or www) → always apex primaryUrl
  if (t.domains.includes(normalized)) {
    return t.primaryUrl;
  }
  return t.primaryUrl;
}
