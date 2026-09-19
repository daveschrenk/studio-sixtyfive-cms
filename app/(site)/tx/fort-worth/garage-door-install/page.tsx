import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityView } from "@/components/CityView";
import { cityBySlug } from "@/lib/data";
import { getRequestSite } from "@/lib/request-site";

export const dynamic = "force-dynamic";

const city = cityBySlug("fort-worth");

export async function generateMetadata(): Promise<Metadata> {
  if (!city) {
    return { title: "City not found" };
  }
  const { siteUrl } = await getRequestSite();
  const canonical = `${siteUrl}${city.path}`;
  return {
    title: city.title,
    description: city.description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: city.title,
      description: city.description,
      type: "website",
    },
    keywords: [
      `garage door installation ${city.name}`,
      `new garage door ${city.name}`,
      `garage door install ${city.name} TX`,
    ],
  };
}

export default function Page() {
  if (!city) notFound();
  return <CityView city={city} />;
}
