import {
  listingsForHub,
  type TowingListing,
} from "@/lib/towing-listings";
import {
  HUB_COPY,
  TOWING_COPY_CITIES,
  towingCopyBySlug,
} from "@/data/towing-dallas-copy";
import { withPreviewTenant } from "@/lib/preview-path";
import { getRequestSite } from "@/lib/request-site";
import { reviewsForListings, type Review } from "@/lib/reviews";
import { TowingHubTabs } from "./TowingHubTabs";
import { TowingListingCard } from "./TowingListingCard";
import Link from "next/link";

function groupReviewsByRank(reviews: Review[]): Map<number, Review[]> {
  const byRank = new Map<number, Review[]>();
  for (const r of reviews) {
    const list = byRank.get(r.listing_rank);
    if (list) list.push(r);
    else byRank.set(r.listing_rank, [r]);
  }
  return byRank;
}

export async function TowingHubView({
  listings,
  cityName,
  citySlug,
  initialTab,
}: {
  listings?: TowingListing[];
  cityName?: string | null;
  citySlug?: string | null;
  /** From ?tab=reviews on the hub/city URL. */
  initialTab?: string;
} = {}) {
  const { tenant, isStudioPreview } = await getRequestSite();
  const preview = { isStudioPreview, siteId: tenant.siteId };
  const rows = listings ?? listingsForHub();
  const isHub = !cityName;
  const cityCopy = !isHub && citySlug ? towingCopyBySlug(citySlug) : undefined;
  const heading = cityName
    ? `Towing companies in ${cityName}`
    : "Towing companies in Dallas–Fort Worth";

  const reviews = reviewsForListings("towing-dallas", rows);
  const reviewsByRank = groupReviewsByRank(reviews);

  return (
    <div className="mx-auto max-w-page px-4 sm:px-6 py-8 pb-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {isHub ? "Dallas–Fort Worth metro · towing directory" : "Towing directory"}
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          {heading}
        </h1>
        {isHub ? (
          <>
            <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
              {HUB_COPY.intro[0]}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
              {HUB_COPY.intro[1]}
            </p>
          </>
        ) : cityCopy ? (
          <>
            <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
              {cityCopy.intro[0]}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
              {cityCopy.intro[1]}
            </p>
          </>
        ) : (
          <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
            Browse {rows.length} towing listings in {cityName} from the Laura
            v1.1 pack.
          </p>
        )}
      </header>

      <TowingHubTabs reviews={reviews} initialTab={initialTab}>
        {isHub ? (
          <section className="mb-12" aria-labelledby="towing-cities-heading">
            <h2
              id="towing-cities-heading"
              className="font-serif text-2xl tracking-tight"
            >
              Cities we cover
            </h2>
            <p className="mt-2 text-sm text-muted max-w-2xl">
              Each card opens a city page with Census-grounded local context and
              listings filtered to that market.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOWING_COPY_CITIES.map((c) => {
                const cityHref = withPreviewTenant(c.path, preview);
                return (
                  <li
                    key={c.slug}
                    className="border border-rule bg-cream p-4 flex flex-col"
                  >
                    <Link
                      href={cityHref}
                      className="font-serif text-xl text-ink hover:text-rust"
                    >
                      {c.name}
                    </Link>
                    <p className="mt-2 text-sm text-muted leading-relaxed flex-1">
                      {c.blurb}
                    </p>
                    <Link
                      href={cityHref}
                      className="mt-3 text-sm text-rust underline underline-offset-2"
                    >
                      View {c.name} towing listings
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <p className="mb-4 text-sm text-muted max-w-2xl">
          Use <span className="font-medium text-ink">Reviews (N)</span> on a
          listing card to read that company&apos;s reviews without leaving this
          page.
        </p>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((listing) => (
            <TowingListingCard
              key={listing.id}
              listing={listing}
              preview={preview}
              reviews={reviewsByRank.get(listing.rank) ?? []}
            />
          ))}
        </ul>

        {isHub ? (
          <section className="mt-12 max-w-2xl" aria-labelledby="what-covers">
            <h2 id="what-covers" className="font-serif text-xl tracking-tight">
              {HUB_COPY.optionalH2.title}
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {HUB_COPY.optionalH2.body}
            </p>
          </section>
        ) : cityCopy ? (
          <section className="mt-12 max-w-2xl" aria-labelledby="city-context">
            <h2 id="city-context" className="font-serif text-xl tracking-tight">
              {cityCopy.optionalH2.title}
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {cityCopy.optionalH2.body}
            </p>
          </section>
        ) : null}
      </TowingHubTabs>
    </div>
  );
}
