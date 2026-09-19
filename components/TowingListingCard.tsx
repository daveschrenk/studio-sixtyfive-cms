"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { TowingListing } from "@/lib/towing-listings";
import type { Review } from "@/lib/reviews";
import { listingHref } from "@/lib/preview-path";
import { ReviewList } from "./ReviewList";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function isRealPhotoUrl(url?: string | null): url is string {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

export function TowingListingCard({
  listing,
  preview,
  reviews,
}: {
  listing: TowingListing;
  preview: { isStudioPreview: boolean; siteId: string };
  reviews: Review[];
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const detailHref = listingHref(listing.slug, {
    isStudioPreview: preview.isStudioPreview,
    siteId: preview.siteId,
  });
  const reviewCount = reviews.length;

  return (
    <li className="border border-rule bg-cream text-sm overflow-hidden">
      {isRealPhotoUrl(listing.photo_url) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.photo_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-28 w-full object-cover"
        />
      ) : null}
      <div className="p-4">
        <p className="font-medium text-ink">
          <Link href={detailHref} className="hover:text-rust">
            {listing.name}
          </Link>
        </p>
        <p className="mt-1 text-muted">
          {listing.city}
          {listing.state ? `, ${listing.state}` : ""} ·{" "}
          {listing.phone ? (
            <a
              href={telHref(listing.phone)}
              className="text-rust underline underline-offset-2 hover:text-rust-dark"
            >
              {listing.phone}
            </a>
          ) : (
            <span>No phone listed</span>
          )}
        </p>
        {listing.rating != null ? (
          <p className="mt-1 text-xs text-muted">
            {listing.rating.toFixed(1)}
            {listing.reviewCount != null
              ? ` · ${listing.reviewCount} reviews`
              : ""}
          </p>
        ) : null}
        {listing.note ? (
          <p className="mt-2 text-xs text-muted leading-relaxed">{listing.note}</p>
        ) : null}
        {listing.hours ? (
          <p className="mt-2 text-xs text-muted">Hours: {listing.hours}</p>
        ) : null}
        {listing.website ? (
          <p className="mt-1 text-xs">
            <a
              href={listing.website}
              className="text-rust underline underline-offset-2"
              rel="noopener noreferrer"
            >
              Website
            </a>
          </p>
        ) : null}
        {listing.amenities.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {listing.amenities.map((a) => (
              <li
                key={a}
                className="rounded-full border border-rule px-2 py-0.5 text-[11px] text-muted"
              >
                {a}
              </li>
            ))}
          </ul>
        ) : null}

        {reviewCount > 0 ? (
          <div className="mt-3">
            <button
              type="button"
              className="min-h-11 px-3 py-1.5 text-sm font-medium border border-rule bg-white text-ink hover:border-rust hover:text-rust transition-colors"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Hide reviews" : `Reviews (${reviewCount})`}
            </button>
            {open ? (
              <div id={panelId} className="mt-3 border-t border-rule pt-3">
                <ReviewList reviews={reviews} className="mt-0" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}
