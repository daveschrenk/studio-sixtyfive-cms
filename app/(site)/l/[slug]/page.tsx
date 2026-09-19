import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/ListingDetail";
import {
  allListingSlugsForSite,
  findListingBySlug,
} from "@/lib/directory-listing";
import { previewRobots } from "@/lib/preview-seo";
import { reviewsForListing, reviewsForListingRaw } from "@/lib/reviews";
import { getRequestSite } from "@/lib/request-site";
import { TENANTS } from "@/lib/tenants";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; tenant?: string }>;
};

export async function generateStaticParams() {
  const slugs = new Set<string>();
  for (const t of TENANTS) {
    for (const slug of allListingSlugsForSite(t.siteId)) {
      slugs.add(slug);
    }
  }
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { tenant, siteUrl, isStudioPreview } = await getRequestSite();
  const listing = findListingBySlug(tenant.siteId, slug);
  if (!listing) {
    return { title: "Listing not found", robots: previewRobots(isStudioPreview) };
  }
  const canonical = `${siteUrl}/l/${listing.slug}/`;
  return {
    title: listing.name,
    description:
      listing.blurb ||
      `${listing.name} — details and reviews on ${tenant.name}.`,
    alternates: { canonical },
    robots: previewRobots(isStudioPreview),
    openGraph: {
      url: canonical,
      title: listing.name,
      description:
        listing.blurb ||
        `${listing.name} — details and reviews on ${tenant.name}.`,
      type: "website",
    },
  };
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const { tenant, isStudioPreview } = await getRequestSite();
  const listing = findListingBySlug(tenant.siteId, slug);
  if (!listing) notFound();

  const suppressBelow = listing.reviewSuppressBelow ?? null;
  const visible = reviewsForListing(tenant.siteId, listing.rank, {
    suppressBelow,
  });
  const all = reviewsForListingRaw(tenant.siteId, listing.rank);
  const suppressedCount = Math.max(0, all.length - visible.length);

  return (
    <ListingDetail
      listing={listing}
      reviews={visible}
      suppressedCount={suppressedCount}
      initialTab={sp.tab}
      previewTenant={isStudioPreview ? tenant.siteId : null}
    />
  );
}
