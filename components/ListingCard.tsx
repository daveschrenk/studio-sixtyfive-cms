import Link from "next/link";
import type { Listing } from "@/lib/types";

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

export function ListingCard({ listing }: { listing: Listing }) {
  const phoneDigits = listing.phone?.replace(/[^\d+]/g, "") || "";
  const hasPhone = phoneDigits.length >= 7;
  return (
    <article
      id={listing.slug}
      className={`scroll-mt-28 border overflow-hidden ${
        listing.sponsor ? "text-ink border-[#7aa8d0]" : "bg-cream border-rule"
      }`}
      style={
        listing.sponsor
          ? {
              background:
                "radial-gradient(130% 100% at 0% -10%, #d4e7f8 0%, #9ec4e6 42%, #6a9cc8 100%)",
            }
          : undefined
      }
    >
      {isRealPhotoUrl(listing.photoUrl) ? (
        <img
          src={listing.photoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-28 w-full object-cover"
          style={{
            objectPosition: `center ${listing.photoPositionY ?? 50}%`,
          }}
        />
      ) : null}
      <div className="p-5 sm:p-6">
        {listing.sponsor ? (
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-rust">
            Sponsor
          </p>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-serif text-2xl">
            <Link
              href={`/l/${listing.slug}/`}
              className="hover:text-rust focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
            >
              {listing.name}
            </Link>
          </h3>
          {listing.rating ? (
            <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-ink">
              <StarRow rating={listing.rating} />
              <span className="font-medium tabular-nums">
                {listing.rating.toFixed(1)}
              </span>
              {listing.reviewCount ? (
                <span className="text-muted">
                  · {listing.reviewCount} reviews
                </span>
              ) : null}
              <span className="text-xs text-muted">Google rating</span>
            </p>
          ) : null}
        </div>
        {listing.blurb ? (
          <p className="mt-2 text-muted leading-relaxed">{listing.blurb}</p>
        ) : null}

        <dl className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted">
              Address
            </dt>
            <dd className="mt-0.5">{listing.address}</dd>
          </div>
          {hasPhone ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                Phone
              </dt>
              <dd className="mt-0.5">
                <a
                  href={`tel:${phoneDigits}`}
                  className="text-rust-dark underline underline-offset-2"
                >
                  {listing.phone}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>

        {hasPhone ? (
          <p className="mt-4">
            <a
              href={`tel:${phoneDigits}`}
              className="inline-flex min-h-11 items-center justify-center border border-rust bg-rust px-5 text-[15px] font-medium text-cream hover:bg-rust-dark hover:border-rust-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-dark"
            >
              Call {listing.phone}
            </a>
          </p>
        ) : null}

        {listing.website ? (
          <p className="mt-3 text-sm">
            <a
              href={listing.website}
              className="text-rust-dark underline underline-offset-2"
            >
              Website
            </a>
          </p>
        ) : null}

        <p className="mt-4 text-sm">
          <Link
            href={`/l/${listing.slug}/`}
            className="text-rust-dark underline underline-offset-2"
          >
            View details &amp; reviews
          </Link>
        </p>

        <details className="mt-4 group border-t border-rule pt-3">
          <summary className="cursor-pointer list-none text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden inline-flex min-h-11 items-center gap-2">
            <span
              className="inline-block text-muted transition-transform group-open:rotate-90"
              aria-hidden="true"
            >
              ▸
            </span>
            More details
          </summary>
          <div className="mt-3 space-y-4">
            {listing.amenities.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Amenities
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
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
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Hours
                </p>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {listing.hours.map((row) => (
                      <tr
                        key={`${row.days}-${row.time}`}
                        className="border-t border-rule"
                      >
                        <th className="py-1.5 pr-4 text-left font-medium w-28">
                          {row.days}
                        </th>
                        <td className="py-1.5 text-muted">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}


            <p className="text-[13px] text-muted/80">
              <Link
                href={`/contact/?listing=${encodeURIComponent(listing.name)}&reason=correction`}
                className="text-muted/80 hover:text-muted hover:underline underline-offset-2"
              >
                Your company?
              </Link>
            </p>
          </div>
        </details>
      </div>
    </article>
  );
}
