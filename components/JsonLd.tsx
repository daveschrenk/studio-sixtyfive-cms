import { CITIES, SITE, SITE_URL } from "@/lib/data";
import type { CityPage, HubData, Listing } from "@/lib/types";

type SiteOpts = {
  siteUrl?: string;
  siteName?: string;
  pagePath?: string;
};

function absoluteUrl(path: string, siteUrl: string) {
  return new URL(path, siteUrl).toString();
}

// Only surfaces fields we actually have — never invents ratings, reviews,
// prices, or hours. Hours are intentionally omitted from JSON-LD entirely.
function localBusiness(listing: Listing) {
  const business: Record<string, unknown> = {
    "@type": "LocalBusiness",
    name: listing.name,
  };
  if (listing.address) business.address = listing.address;
  if (listing.phone) business.telephone = listing.phone;
  if (listing.website) business.url = listing.website;
  if (typeof listing.lat === "number" && typeof listing.lng === "number") {
    business.geo = {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    };
  }
  if (typeof listing.rating === "number" && typeof listing.reviewCount === "number") {
    business.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.rating,
      reviewCount: listing.reviewCount,
    };
  }
  return business;
}

function website(siteUrl: string, siteName: string) {
  return {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };
}

function collectionPage(
  path: string,
  name: string,
  description: string,
  siteUrl: string,
) {
  const url = absoluteUrl(path, siteUrl);
  return {
    "@type": "CollectionPage",
    "@id": url,
    url,
    name,
    description,
  };
}

export function hubJsonLd(
  hub: HubData,
  listings: Listing[],
  opts: SiteOpts = {},
) {
  const siteUrl = opts.siteUrl ?? SITE_URL;
  const siteName = opts.siteName ?? SITE.name;
  const pagePath = opts.pagePath ?? hub.path;
  return {
    "@context": "https://schema.org",
    "@graph": [
      website(siteUrl, siteName),
      collectionPage(pagePath, hub.title, hub.description, siteUrl),
      {
        "@type": "ItemList",
        itemListElement: CITIES.map((city, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(city.path, siteUrl),
          name: city.name,
        })),
      },
      ...listings.map(localBusiness),
    ],
  };
}

export function cityJsonLd(
  city: CityPage,
  listings: Listing[],
  opts: SiteOpts = {},
) {
  const siteUrl = opts.siteUrl ?? SITE_URL;
  const siteName = opts.siteName ?? SITE.name;
  return {
    "@context": "https://schema.org",
    "@graph": [
      website(siteUrl, siteName),
      collectionPage(city.path, city.title, city.description, siteUrl),
      ...listings.map(localBusiness),
    ],
  };
}

// Visible facts only from the contact page — no invented ratings or offers.
export function fenceHubJsonLd(opts: {
  siteUrl: string;
  siteName: string;
  title: string;
  description: string;
  pagePath?: string;
  cities: readonly { name: string; path: string }[];
}) {
  const pagePath = opts.pagePath ?? "/";
  return {
    "@context": "https://schema.org",
    "@graph": [
      website(opts.siteUrl, opts.siteName),
      collectionPage(pagePath, opts.title, opts.description, opts.siteUrl),
      {
        "@type": "ItemList",
        itemListElement: opts.cities.map((city, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(city.path, opts.siteUrl),
          name: city.name,
        })),
      },
    ],
  };
}

export function contactJsonLd(
  opts: SiteOpts & { description?: string } = {},
) {
  const siteUrl = opts.siteUrl ?? SITE_URL;
  const siteName = opts.siteName ?? SITE.name;
  const path = opts.pagePath ?? "/contact/";
  const url = absoluteUrl(path, siteUrl);
  const description =
    opts.description ??
    `Contact ${siteName} to correct a listing or inquire about a partnership. For directory operators — corrections and partnerships, not homeowner quotes.`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      website(siteUrl, siteName),
      {
        "@type": "ContactPage",
        "@id": url,
        url,
        name: "Contact us",
        description,
        isPartOf: {
          "@type": "WebSite",
          name: siteName,
          url: siteUrl,
        },
      },
    ],
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
