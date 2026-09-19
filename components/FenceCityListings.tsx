import Link from "next/link";
import type { FenceListing } from "@/data/fence-charlotte";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function isRealPhotoUrl(url?: string | null): url is string {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

export function FenceCityListings({
  listings,
  emptyLabel,
}: {
  listings: FenceListing[];
  emptyLabel: string;
}) {
  if (listings.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted border border-dashed border-rule bg-cream p-4">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="mt-6 grid gap-4">
      {listings.map((l) => (
        <li
          key={l.id}
          className="border border-rule bg-cream text-sm overflow-hidden"
        >
          {isRealPhotoUrl(l.photo_url) ? (
            <img
              src={l.photo_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-28 w-full object-cover"
            />
          ) : null}
          <div className="p-4">
            <p className="font-medium text-ink">
              <Link href={`/l/${l.slug}/`} className="hover:text-rust">
                {l.name}
              </Link>
            </p>
            <p className="mt-1 text-muted">
              {l.city}
              {l.state ? `, ${l.state}` : ""}
              {l.phone ? (
                <>
                  {" "}
                  ·{" "}
                  <a
                    href={telHref(l.phone)}
                    className="text-rust underline underline-offset-2 hover:text-rust-dark"
                  >
                    {l.phone}
                  </a>
                </>
              ) : null}
            </p>
            {l.rating != null ? (
              <p className="mt-1 text-xs text-muted">
                {l.rating.toFixed(1)}
                {l.reviewCount != null ? ` · ${l.reviewCount} reviews` : ""}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted leading-relaxed">{l.note}</p>
            {l.hours ? (
              <p className="mt-2 text-xs text-muted">Hours: {l.hours}</p>
            ) : null}
            {l.website ? (
              <p className="mt-1 text-xs">
                <a
                  href={l.website}
                  className="text-rust underline underline-offset-2"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              </p>
            ) : null}
            {l.amenities && l.amenities.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {l.amenities.map((a) => (
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
                href={`/l/${l.slug}/`}
                className="text-rust underline underline-offset-2"
              >
                View details &amp; reviews
              </Link>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
