/**
 * Append ?tenant= for studio preview so client navigation keeps tenant
 * without relying solely on the preview_tenant cookie.
 */
export function withPreviewTenant(
  href: string,
  opts: { isStudioPreview: boolean; siteId: string } | null | undefined,
): string {
  if (!opts?.isStudioPreview) return href;
  if (!opts.siteId || opts.siteId === "studio-hub") return href;
  if (/[?&]tenant=/.test(href)) return href;

  const hashIdx = href.indexOf("#");
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : "";
  const base = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const join = base.includes("?") ? "&" : "?";
  return `${base}${join}tenant=${encodeURIComponent(opts.siteId)}${hash}`;
}

/** Listing detail path, optionally with tab + preview tenant query. */
export function listingHref(
  slug: string,
  opts?: {
    isStudioPreview?: boolean;
    siteId?: string;
    tab?: string;
  },
): string {
  let path = `/l/${encodeURIComponent(slug)}/`;
  if (opts?.tab) {
    path += `?tab=${encodeURIComponent(opts.tab)}`;
  }
  return withPreviewTenant(path, {
    isStudioPreview: Boolean(opts?.isStudioPreview),
    siteId: opts?.siteId ?? "",
  });
}
