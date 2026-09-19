import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityView } from "@/components/CityView";
import { cityBySlug } from "@/lib/data";

const city = cityBySlug("frisco");

export const metadata: Metadata = {
  title: city?.title ?? "City not found",
  description: city?.description,
  alternates: city ? { canonical: city.path } : undefined,
  openGraph: city
    ? {
        url: city.path,
        title: city.title,
        description: city.description,
        type: "website",
      }
    : undefined,
  keywords: city
    ? [
        `garage door installation ${city.name}`,
        `new garage door ${city.name}`,
        `garage door install ${city.name} TX`,
      ]
    : undefined,
};

export default function Page() {
  if (!city) notFound();
  return <CityView city={city} />;
}
