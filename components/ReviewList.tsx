import type { Review } from "@/lib/reviews";

function StarRow({ stars }: { stars: number }) {
  const full = Math.round(Math.min(5, Math.max(0, stars)));
  return (
    <span className="inline-flex items-center gap-0.5 text-rust" aria-label={`${full} out of 5 stars`}>
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

export function ReviewList({
  reviews,
  emptyLabel = "No reviews yet for this listing.",
  className,
}: {
  reviews: Review[];
  emptyLabel?: string;
  /** Optional wrapper class (default mt-6). Pass "" or "mt-0" when nested. */
  className?: string;
}) {
  const wrapClass = className ?? "mt-6";

  if (reviews.length === 0) {
    return (
      <p className={`${wrapClass} border border-dashed border-rule bg-cream p-6 text-sm text-muted`}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className={`${wrapClass} space-y-4`}>
      {reviews.map((r) => (
        <li
          key={`${r.site_id}-${r.source}-${r.source_review_id}`}
          className="border border-rule bg-cream p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRow stars={r.stars} />
            <span className="text-sm font-medium tabular-nums">{r.stars.toFixed(1)}</span>
            <span className="text-xs uppercase tracking-[0.12em] text-muted">
              {r.source}
            </span>
            {r.reviewed_at ? (
              <span className="text-xs text-muted">{r.reviewed_at}</span>
            ) : null}
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
            {r.text}
          </p>
          <p className="mt-3 text-sm text-muted">
            {r.author?.trim() ? r.author : "Anonymous"}
            {r.source_url ? (
              <>
                {" · "}
                <a
                  href={r.source_url}
                  className="text-rust-dark underline underline-offset-2"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View source
                </a>
              </>
            ) : null}
          </p>
        </li>
      ))}
    </ul>
  );
}
