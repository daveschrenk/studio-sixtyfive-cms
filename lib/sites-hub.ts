/** Hub-only multi-site registry. Stub sites are NOT added to public TENANTS. */

export type SiteHubStatus = "live" | "stub";

export type SiteHubRow = {
  siteId: string;
  name: string;
  apex: string;
  adminPath: string;
  themeId: string;
  /** Manual GSC status text; empty/null → UI shows N/A. */
  gscNote: string | null;
  /** Search Console domain property. Factory-created stubs may omit it. */
  gscProperty?: string;
  adsense: "parked" | string;
  status: SiteHubStatus;
};

export const SITES_HUB: SiteHubRow[] = [
  {
    siteId: "dfw-garage",
    name: "DFW Garage Door Installers",
    apex: "https://dfwgaragedoorinstallers.com",
    adminPath: "/admin/",
    themeId: "slate-amber",
    gscNote: "Domain verified · sitemap Success (10 pages)",
    gscProperty: "sc-domain:dfwgaragedoorinstallers.com",
    adsense: "parked",
    status: "live",
  },
  {
    siteId: "fence-charlotte",
    name: "Charlotte Fence Companies",
    apex: "https://charlottefencecompanies.com",
    adminPath: "/admin/",
    themeId: "harbor-teal",
    gscNote: null,
    gscProperty: "sc-domain:charlottefencecompanies.com",
    adsense: "parked",
    status: "live",
  },
  {
    siteId: "towing-dallas",
    name: "Dallas Towing Companies",
    apex: "https://dallastowingcompanies.com",
    adminPath: "/admin/",
    themeId: "slate-amber",
    gscNote: null,
    gscProperty: "sc-domain:dallastowingcompanies.com",
    adsense: "parked",
    status: "live",
  },
];

export const CMS_CRED_RESET_KEY_PREFIX = "dfw-cms-cred-reset:";

export function cmsCredResetKey(siteId: string): string {
  return `${CMS_CRED_RESET_KEY_PREFIX}${siteId}`;
}

/** Absolute CMS admin URL for live sites (apex + adminPath). */
export function cmsAdminUrl(site: SiteHubRow): string {
  const base = site.apex.replace(/\/$/, "");
  const path = site.adminPath.startsWith("/")
    ? site.adminPath
    : `/${site.adminPath}`;
  return `${base}${path}`;
}

/** Generate a one-time mock password for CMS credential reset demos. */
export function generateMockCmsPassword(length = 16): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}
