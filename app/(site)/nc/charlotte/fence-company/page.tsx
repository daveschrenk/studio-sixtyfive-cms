import type { Metadata } from "next";
import { headers } from "next/headers";
import { FenceHubView } from "@/components/FenceHubView";
import { fenceHubJsonLd, JsonLd } from "@/components/JsonLd";
import { FENCE_CITIES } from "@/data/fence-charlotte";
import { getRequestSite } from "@/lib/request-site";

export const dynamic = "force-dynamic";

const HUB_PATH = "/nc/charlotte/fence-company/";
const HUB_TITLE = "Fence companies in Charlotte";
const HUB_DESCRIPTION =
  "Local fence company directory for Charlotte and nearby NC/SC towns — Matthews, Concord, Huntersville, Gastonia, Indian Trail, Mint Hill, Pineville, Mooresville, Fort Mill, and Rock Hill.";

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl, tenant } = await getRequestSite();
  const h = await headers();
  const urlPath = h.get("x-url-path") ?? HUB_PATH;
  // Apex `/` (rewrite) keeps at-root canonical; direct hub path self-canonicalizes.
  const canonicalPath =
    urlPath === "/" || urlPath === "" ? "/" : HUB_PATH;
  const canonical = `${siteUrl}${canonicalPath}`;
  return {
    title: HUB_TITLE,
    description: HUB_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: HUB_TITLE,
      description: tenant.tagline,
      type: "website",
    },
  };
}

export default async function CharlotteFenceHubPage() {
  const { siteUrl, tenant } = await getRequestSite();
  const h = await headers();
  const urlPath = h.get("x-url-path") ?? HUB_PATH;
  const pagePath = urlPath === "/" || urlPath === "" ? "/" : HUB_PATH;
  return (
    <>
      <JsonLd
        data={fenceHubJsonLd({
          siteUrl,
          siteName: tenant.name,
          title: HUB_TITLE,
          description: HUB_DESCRIPTION,
          pagePath,
          cities: FENCE_CITIES,
        })}
      />
      <FenceHubView />
    </>
  );
}
