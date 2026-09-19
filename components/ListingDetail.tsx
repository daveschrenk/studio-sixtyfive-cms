"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DirectoryListing } from "@/lib/directory-listing";
import type { Review } from "@/lib/reviews";
import { withPreviewTenant } from "@/lib/preview-path";
import { ReviewList } from "./ReviewList";

function isRealPhotoUrl(url?: string | null): url is string {
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return true;
  return url.startsWith("/photo-picker/");
}

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span className="inline-flex items-center gap-0.5 text-rust" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i < full ? "fill-current" : "fill-none stroke-current opacity-35"}`}
          aria-hidden="true"
        >
          <path
            strokeWidth={i < full ? 0 : 1.25}
            d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.4l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"
          />
        </svg>
      ))}
    </span>
  );
}

type TabId = "overview" | "reviews";

function resolveInitialTab(
  initialTab: string | undefined,
  hasReviews: boolean,
): TabId {
  if (initialTab === "reviews" && hasReviews) return "reviews";
  return "overview";
}

export function ListingDetail({
  listing,
  reviews,
  suppressedCount = 0,
  initialTab,
  previewTenant = null,
}: {
  listing: DirectoryListing;
  reviews: Review[];
  suppressedCount?: number;
  /** From ?tab=reviews (or similar) on the listing URL. */
  initialTab?: string;
  /** Studio preview siteId — keep tenant on back-link without CMS login. */
  previewTenant?: string | null;
}) {
  const hasReviews = reviews.length > 0;
  const [tab, setTab] = useState<TabId>(() =>
    resolveInitialTab(initialTab, hasReviews),
  );

  // Honor #reviews hash and late ?tab= on client without requiring CMS login.
  useEffect(() => {
    if (!hasReviews) return;
    if (initialTab === "reviews") {
      setTab("reviews");
      return;
    }
    if (typeof window !== "undefined" && window.location.hash === "#reviews") {
      setTab("reviews");
    }
  }, [initialTab, hasReviews]);

  const hubHref = withPreviewTenant(listing.hubPath, {
    isStudioPreview: Boolean(previewTenant),
    siteId: previewTenant || "",
  });

  const reviewLabelCount = reviews.length || listing.reviewCount || 0;

  const tabs = useMemo(
    () =>
      [
        { id: "overview" as const, label: "Overview" },
        {
          id: "reviews" as const,
          label:
            reviews.length > 0
              ? `Reviews (${reviews.length})`
              : "Reviews",
        },
      ] as const,
    [reviews.length],
  );

  const phoneDigits = listing.phone?.replace(/[^\d+]/g, "") || "";
  const hasPhone = phoneDigits.length >= 7;

  return (
    <article className="mx-auto max-w-reading-page px-4 sm:px-6 py-10 sm:py-14">
      <p className="text-sm text-muted">
        <Link
          href={hubHref}
          className="hover:text-rust underline-offset-2 hover:underline"
        >
          ← Back to directory
        </Link>
      </p>

      {isRealPhotoUrl(listing.photoUrl) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.photoUrl}
          alt=""
          className="mt-6 h-44 w-full object-cover border border-rule"
          style={{
            objectPosition: `center ${listing.photoPositionY ?? 50}%`,
          }}
        />
      ) : null}

      <header className="mt-6">
        {listing.sponsor ? (
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-rust">
            Sponsor
          </p>
        ) : null}
        <h1 className="font-serif text-3xl sm:text-4xl leading-tight">
          {listing.name}
        </h1>
        {listing.rating ? (
          <p className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-ink">
            <StarRow rating={listing.rating} />
            <span className="font-medium tabular-nums">
              {listing.rating.toFixed(1)}
            </span>
            {listing.reviewCount ? (
              <span className="text-muted">
                · {listing.reviewCount} Google reviews
              </span>
            ) : null}
          </p>
        ) : null}
        {hasReviews || (listing.reviewCount && listing.reviewCount > 0) ? (
          <p className="mt-2 text-sm">
            <button
              type="button"
              className="text-rust underline underline-offset-2 hover:text-rust-dark"
              onClick={() => setTab("reviews")}
            >
              See {reviewLabelCount} review{reviewLabelCount === 1 ? "" : "s"}
            </button>
          </p>
        ) : null}
        {listing.blurb ? (
          <p className="mt-4 text-muted leading-relaxed max-w-reading">
            {listing.blurb}
          </p>
        ) : null}
      </header>

      <div
        role="tablist"
        aria-label="Listing sections"
        className="mt-8 flex gap-1 border-b border-rule"
      >
        {tabs.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`tab-${t.id}`}
              aria-controls={`panel-${t.id}`}
              className={`min-h-11 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                selected
                  ? "border-rust text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <div
          role="tabpanel"
          id="panel-overview"
          aria-labelledby="tab-overview"
          className="mt-8"
        >
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                Address
              </dt>
              <dd className="mt-1">{listing.address || "—"}</dd>
            </div>
            {hasPhone ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                  Phone
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${phoneDigits}`}
                    className="text-rust-dark underline underline-offset-2"
                  >
                    {listing.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {listing.website ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                  Website
                </dt>
                <dd className="mt-1">
                  <a
                    href={listing.website}
                    className="text-rust-dark underline underline-offset-2"
                    rel="noopener noreferrer"
                  >
                    Visit website
                  </a>
                </dd>
              </div>
            ) : null}
            {listing.mapsUrl ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                  Map
                </dt>
                <dd className="mt-1">
                  <a
                    href={listing.mapsUrl}
                    className="text-rust-dark underline underline-offset-2"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          {hasPhone ? (
            <p className="mt-6">
              <a
                href={`tel:${phoneDigits}`}
                className="inline-flex min-h-11 items-center justify-center border border-rust bg-rust px-5 text-[15px] font-medium text-cream hover:bg-rust-dark hover:border-rust-dark"
              >
                Call {listing.phone}
              </a>
            </p>
          ) : null}

          {listing.amenities.length > 0 ? (
            <div className="mt-8">
              <h2 className="font-serif text-xl">Amenities</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {listing.amenities.map((item) => (
                  <li
                    key={item}
                    className="text-xs border border-rule bg-paper px-2 py-1"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {listing.hours.length > 0 ? (
            <div className="mt-8">
              <h2 className="font-serif text-xl">Hours</h2>
              <table className="mt-3 w-full max-w-md text-sm">
                <tbody>
                  {listing.hours.map((row) => (
                    <tr
                      key={`${row.days}-${row.time}`}
                      className="border-t border-rule"
                    >
                      <th className="py-1.5 pr-4 text-left font-medium w-32">
                        {row.days}
                      </th>
                      <td className="py-1.5 text-muted">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : listing.hoursText ? (
            <div className="mt-8">
              <h2 className="font-serif text-xl">Hours</h2>
              <p className="mt-2 text-sm text-muted">{listing.hoursText}</p>
            </div>
          ) : null}

          <p className="mt-10 text-[13px] text-muted/80">
            <Link
              href={`/contact/?listing=${encodeURIComponent(listing.name)}&reason=correction`}
              className="hover:text-muted hover:underline underline-offset-2"
            >
              Your company?
            </Link>
          </p>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="panel-reviews"
          aria-labelledby="tab-reviews"
          className="mt-8"
        >
          <h2 className="font-serif text-2xl">Reviews</h2>
          <p className="mt-2 text-sm text-muted max-w-reading">
            Customer reviews pulled from public sources. Low-star rows may be
            hidden for sponsored listings without removing them from storage.
          </p>
          {suppressedCount > 0 ? (
            <p className="mt-2 text-xs text-muted">
              {suppressedCount} review{suppressedCount === 1 ? "" : "s"} hidden by
              listing filter (stars below {listing.reviewSuppressBelow}).
            </p>
          ) : null}
          <ReviewList
            reviews={reviews}
            emptyLabel="No reviews yet for this listing. Check back after the next monthly refresh."
          />
        </div>
      )}
    </article>
  );
}
