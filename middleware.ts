import { NextResponse, type NextRequest } from "next/server";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import {
  getSiteUrlFromHost,
  getTenantByHost,
  getTenantBySiteId,
  isStudioPreviewHost,
  normalizeHost,
} from "@/lib/tenants";

const LOGIN_PATH = "/admin/login/";
const PREVIEW_COOKIE = "preview_tenant";
const CONTACT_LISTING_COOKIE = "dfw_contact_listing";
const CONTACT_REASON_COOKIE = "dfw_contact_reason";
const CONTACT_PREFILL_MAX_AGE = 600;
const PREVIEW_COOKIE_MAX_AGE = 86400;
const TOWING_HUB_PATH = "/tx/dallas/towing/";

function withTenantHeaders(
  request: NextRequest,
  siteId: string,
  siteUrl: string,
  previewTenant: string | null,
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-id", siteId);
  requestHeaders.set("x-site-url", siteUrl);
  if (previewTenant) {
    requestHeaders.set("x-preview-tenant", previewTenant);
  }
  return { requestHeaders };
}

function isContactPath(pathname: string): boolean {
  return pathname === "/contact" || pathname === "/contact/";
}

function isFencePath(pathname: string): boolean {
  return (
    pathname.startsWith("/nc/") ||
    pathname.startsWith("/sc/") ||
    pathname.includes("/fence-company")
  );
}

function isDfwPath(pathname: string): boolean {
  return pathname.startsWith("/tx/");
}

function isTowingCityPath(pathname: string): boolean {
  return /^\/tx\/[a-z0-9-]+\/towing\/?$/.test(pathname);
}

function isGarageInstallPath(pathname: string): boolean {
  return pathname.startsWith("/tx/") && pathname.includes("garage-door-install");
}

function setPreviewCookie(res: NextResponse, siteId: string) {
  res.cookies.set(PREVIEW_COOKIE, siteId, {
    path: "/",
    maxAge: PREVIEW_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

function contactPrefillRedirect(
  request: NextRequest,
  siteUrl: string,
  previewToSet: string | null,
): NextResponse {
  const listing = request.nextUrl.searchParams.get("listing")?.trim() ?? "";
  const reason = request.nextUrl.searchParams.get("reason")?.trim() ?? "";
  const dest = new URL("/contact/", siteUrl);
  const res = NextResponse.redirect(dest, 308);
  if (listing) {
    res.cookies.set(CONTACT_LISTING_COOKIE, listing, {
      path: "/",
      maxAge: CONTACT_PREFILL_MAX_AGE,
      sameSite: "lax",
    });
  }
  if (reason) {
    res.cookies.set(CONTACT_REASON_COOKIE, reason, {
      path: "/",
      maxAge: CONTACT_PREFILL_MAX_AGE,
      sameSite: "lax",
    });
  }
  if (previewToSet) {
    setPreviewCookie(res, previewToSet);
  }
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginPath = pathname === "/admin/login" || pathname === LOGIN_PATH;
  const isLoggedIn =
    request.cookies.get(CMS_COOKIE_NAME)?.value === CMS_COOKIE_VALUE;

  const host = request.headers.get("host") ?? "";
  const allowPreview = isStudioPreviewHost(host);
  const queryTenantRaw = request.nextUrl.searchParams.get("tenant");
  const cookieTenantRaw = request.cookies.get(PREVIEW_COOKIE)?.value ?? null;

  const queryPreview =
    (allowPreview &&
      queryTenantRaw &&
      getTenantBySiteId(queryTenantRaw)?.siteId) ||
    null;
  const cookiePreview =
    (allowPreview &&
      cookieTenantRaw &&
      getTenantBySiteId(cookieTenantRaw)?.siteId) ||
    null;

  // Public logged-out studio `/` stays placard — ignore preview cookie on bare root.
  const isBareStudioRoot =
    allowPreview && (pathname === "/" || pathname === "") && !queryPreview;
  const previewTenant = isBareStudioRoot
    ? null
    : queryPreview || cookiePreview;

  const hostTenant = getTenantByHost(host, null);
  const tenant = getTenantByHost(host, previewTenant);
  const normalized = normalizeHost(host);

  // www → apex permanent redirect (preserve path + query). Skip *.vercel.app.
  // Use HOST tenant so fence/studio www is not flipped by a preview query.
  if (
    !normalized.endsWith(".vercel.app") &&
    normalized.startsWith("www.") &&
    hostTenant.domains.includes(normalized)
  ) {
    const dest = new URL(
      pathname + request.nextUrl.search,
      hostTenant.primaryUrl,
    );
    const res = NextResponse.redirect(dest, 308);
    if (queryPreview) setPreviewCookie(res, queryPreview);
    return res;
  }

  // Always apex primaryUrl for the request host (never preview tenant primaryUrl)
  const siteUrl = getSiteUrlFromHost(host, hostTenant);

  // /contact/?… → clean /contact/ (308). Prefill via short-lived cookies.
  // Set preview cookie first so tenant is not stripped on studio preview.
  if (isContactPath(pathname) && request.nextUrl.search.length > 1) {
    return contactPrefillRedirect(request, siteUrl, queryPreview);
  }

  // First hit `/?tenant=towing-dallas` → city hub + cookie (clean paths after).
  if (
    allowPreview &&
    queryPreview === "towing-dallas" &&
    (pathname === "/" || pathname === "")
  ) {
    const dest = new URL(TOWING_HUB_PATH, siteUrl);
    const res = NextResponse.redirect(dest, 308);
    setPreviewCookie(res, queryPreview);
    return res;
  }

  const { requestHeaders } = withTenantHeaders(
    request,
    tenant.siteId,
    siteUrl,
    previewTenant,
  );
  // Original browser path (before any rewrite) for canonical decisions
  requestHeaders.set("x-url-path", pathname);

  // Host isolation: foreign metro / niche paths 404 on the wrong tenant
  if (tenant.siteId === "towing-dallas") {
    if (isFencePath(pathname) || isGarageInstallPath(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  } else {
    if (
      tenant.siteId !== "dfw-garage" &&
      isDfwPath(pathname) &&
      !isTowingCityPath(pathname)
    ) {
      return new NextResponse(null, { status: 404 });
    }
    if (tenant.siteId !== "towing-dallas" && isTowingCityPath(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
    if (tenant.siteId !== "fence-charlotte" && isFencePath(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // Fence hub at / via rewrite (avoids sticky 308 from old DFW permanentRedirect)
  if (
    tenant.siteId === "fence-charlotte" &&
    (pathname === "/" || pathname === "")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/nc/charlotte/fence-company/";
    const res = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    // Never set preview cookie on fence host
    return res;
  }

  if (isAdmin) {
    if (isLoginPath) {
      if (isLoggedIn) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/";
        return NextResponse.redirect(url);
      }
      const res = NextResponse.next({ request: { headers: requestHeaders } });
      if (queryPreview) setPreviewCookie(res, queryPreview);
      return res;
    }

    if (!isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (queryPreview) setPreviewCookie(res, queryPreview);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
