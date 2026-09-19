import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TowingHubView } from "@/components/TowingHubView";
import { isTowingCityIndexable } from "@/data/towing-dallas-copy";
import { previewRobots } from "@/lib/preview-seo";
import { getRequestSite } from "@/lib/request-site";
import {
  listingsForCity,
  TOWING_CITIES,
  towingCityBySlug,
} from "@/lib/towing-listings";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ tab?: string; tenant?: string }>;
};

export function generateStaticParams() {
  return TOWING_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = towingCityBySlug(citySlug);
  const { siteUrl, isStudioPreview } = await getRequestSite();
  if (!city) {
    return { title: "City not found", robots: previewRobots(isStudioPreview) };
  }
  const title =
    city.slug === "dallas"
      ? "Towing companies in Dallas"
      : `Towing companies in ${city.name}`;
  const description =
    city.slug === "dallas"
      ? "Local towing companies in Dallas and nearby suburbs."
      : `Towing companies in ${city.name}, TX — Dallas-area directory.`;
  const canonical = `${siteUrl}${city.path}`;
  // Thin factory-blurb cities: always noindex,follow (keep URL, drop from sitemap).
  // Thick Census cities: follow studio preview robots policy.
  const robots = isTowingCityIndexable(city.slug)
    ? previewRobots(isStudioPreview)
    : { index: false, follow: true };
  return {
    title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      url: canonical,
      title,
      description,
      type: "website",
    },
  };
}

export default async function TowingCityPage({ params, searchParams }: PageProps) {
  const { city: citySlug } = await params;
  const sp = await searchParams;
  const { tenant } = await getRequestSite();
  if (tenant.siteId !== "towing-dallas") notFound();
  const city = towingCityBySlug(citySlug);
  if (!city) notFound();
  const listings = listingsForCity(city.slug);
  return (
    <TowingHubView
      listings={listings}
      cityName={city.slug === "dallas" ? null : city.name}
      citySlug={city.slug}
      initialTab={sp.tab}
    />
  );
}
