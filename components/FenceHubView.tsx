import Link from "next/link";
import {
  FENCE_CITIES,
  listingsForHub,
  type FenceListing,
} from "@/data/fence-charlotte";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function isRealPhotoUrl(url?: string | null): url is string {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

function ListingCard({ listing }: { listing: FenceListing }) {
  return (
    <li className="border border-rule bg-cream text-sm overflow-hidden">
      {isRealPhotoUrl(listing.photo_url) ? (
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
        <Link
          href={`/l/${listing.slug}/`}
          className="hover:text-rust"
        >
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
          {listing.reviewCount != null ? ` · ${listing.reviewCount} reviews` : ""}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-muted leading-relaxed">{listing.note}</p>
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
      {listing.amenities && listing.amenities.length > 0 ? (
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
      <p className="mt-3 text-xs">
        <Link
          href={`/l/${listing.slug}/`}
          className="text-rust underline underline-offset-2"
        >
          View details &amp; reviews
        </Link>
      </p>
      </div>
    </li>
  );
}

export function FenceHubView() {
  const listings = listingsForHub();
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">
        Charlotte metro · NC &amp; SC fence companies
      </p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
        Fence companies in Charlotte and nearby towns
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Browse fence install and replacement shops across the Charlotte–Concord–Gastonia
        metro (CBSA 16740) — about 2.94 million people as of July 1, 2025, up from
        2.88 million in 2024. This hub lists companies for the Queen City and nearby
        NC/SC towns; open a city page for local context, then use the listing stack
        to call.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Coverage spans Mecklenburg suburbs, Cabarrus, Gaston, Union, and Iredell on
        the North Carolina side, plus Fort Mill and Rock Hill in York County, South
        Carolina. Fence work here is residential privacy and ornamental runs plus
        commercial edges — confirm local permitting with the shop before dig day.
        The list below covers the full metro pack ({listings.length} listings).
      </p>

      <section className="mt-10" aria-labelledby="fence-cities-heading">
        <h2
          id="fence-cities-heading"
          className="font-serif text-2xl tracking-tight"
        >
          Cities we cover
        </h2>
        <p className="mt-2 text-sm text-muted max-w-2xl">
          Each card opens a city page with Census-grounded local copy and listings
          filtered to that market.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FENCE_CITIES.map((c) => (
            <li
              key={c.slug}
              className="border border-rule bg-cream p-4 flex flex-col"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-muted">
                {c.state}
              </p>
              <Link
                href={c.path}
                className="mt-1 font-serif text-xl text-ink hover:text-rust"
              >
                {c.name}
              </Link>
              <p className="mt-2 text-sm text-muted leading-relaxed flex-1">
                {c.blurb}
              </p>
              <Link
                href={c.path}
                className="mt-3 text-sm text-rust underline underline-offset-2"
              >
                View {c.name} fence companies
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="fence-listings-heading">
        <h2
          id="fence-listings-heading"
          className="font-serif text-2xl tracking-tight"
        >
          Fence companies across the metro
        </h2>
        <p className="mt-2 text-sm text-muted">
          Tap a phone number to call. Hours and amenities appear when listed.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </ul>
      </section>

      <section className="mt-12 max-w-2xl" aria-labelledby="what-covers">
        <h2 id="what-covers" className="font-serif text-xl tracking-tight">
          What this directory covers
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          City pages are for named markets inside the MSA, not neighborhood mill URLs.
          South End, Ballantyne, and NoDa stay inside the Charlotte page. Install and
          planned replacement belong here; this directory does not rank shops or quote
          prices.
        </p>
      </section>

      <p className="mt-10 text-xs text-muted">
        Preview — mailing list and CMS are keyed to siteId{" "}
        <code className="font-mono">fence-charlotte</code>.
      </p>
    </main>
  );
}
