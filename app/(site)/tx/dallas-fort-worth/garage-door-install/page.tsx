import type { Metadata } from "next";
import { HubView } from "@/components/HubView";
import { HUB } from "@/lib/data";
import { getRequestSite } from "@/lib/request-site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl } = await getRequestSite();
  const canonical = `${siteUrl}${HUB.path}`;
  return {
    title: HUB.title,
    description: HUB.description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: HUB.title,
      description: HUB.description,
      type: "website",
    },
    keywords: [
      "garage door install Dallas Fort Worth",
      "garage door installation Dallas-Fort Worth",
      "new garage door DFW",
    ],
  };
}

export default function HubPage() {
  return <HubView pagePath={HUB.path} />;
}
