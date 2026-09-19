import type { MetadataRoute } from "next";
import { getRequestSite } from "@/lib/request-site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getRequestSite();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
