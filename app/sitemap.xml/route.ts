import { ALL_PATHS } from "@/lib/data";
import {
  ALL_FENCE_LISTINGS,
  FENCE_CITIES,
} from "@/data/fence-charlotte";
import { getRequestSite } from "@/lib/request-site";
import { TOWING_INDEXABLE_CITY_SLUGS } from "@/data/towing-dallas-copy";
import { TOWING_CITIES } from "@/lib/towing-listings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const { siteUrl, tenant } = await getRequestSite();

    let paths: string[];
    if (tenant.siteId === "studio-hub") {
      // Hub-only: no tenant directory sitemap
      paths = ["/", "/contact/"];
    } else if (tenant.siteId === "towing-dallas") {
      // Production + studio preview: hub + Census-thickened cities only (Stef KEEP).
      // Listing /l/ pages are noindex — do not put them in the sitemap (Kyle soft).
      // Thin long-tail cities stay routable but are noindex + excluded.
      // Host isolation: these paths only emit on towing-dallas tenant.
      const indexable = new Set(TOWING_INDEXABLE_CITY_SLUGS);
      paths = [
        "/tx/dallas/towing/",
        "/contact/",
        ...TOWING_CITIES.filter(
          (c) => c.slug !== "dallas" && indexable.has(c.slug),
        ).map((c) => c.path),
      ];
    } else if (tenant.siteId === "fence-charlotte") {
      paths = [
        "/",
        "/contact/",
        ...FENCE_CITIES.map((c) => c.path),
        ...ALL_FENCE_LISTINGS.map((l) => `/l/${l.slug}/`),
      ];
    } else {
      paths = ["/contact/", ...ALL_PATHS];
    }

    const clean = paths.filter((p) => typeof p === "string" && p.length > 0);
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      clean
        .map((path) => {
          const isHub =
            path === "/" ||
            path.includes("dallas-fort-worth") ||
            path === "/nc/charlotte/fence-company/" ||
            path === "/tx/dallas/towing/";
          const loc = escapeXml(`${siteUrl}${path}`);
          const priority = isHub ? "1.0" : "0.8";
          return (
            `<url><loc>${loc}</loc>` +
            `<changefreq>monthly</changefreq>` +
            `<priority>${priority}</priority></url>`
          );
        })
        .join("\n") +
      `\n</urlset>\n`;

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "sitemap error";
    return new Response(`<!-- sitemap error: ${escapeXml(message)} -->`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
