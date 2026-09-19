"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Review } from "@/lib/reviews";
import { ReviewList } from "./ReviewList";

type TabId = "overview" | "reviews";

function resolveInitialTab(
  initialTab: string | undefined,
  hasReviews: boolean,
): TabId {
  if (initialTab === "reviews" && hasReviews) return "reviews";
  return "overview";
}

function setTabQuery(next: TabId) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (next === "reviews") {
    url.searchParams.set("tab", "reviews");
  } else {
    url.searchParams.delete("tab");
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function TowingHubTabs({
  reviews,
  initialTab,
  children,
}: {
  reviews: Review[];
  initialTab?: string;
  children: ReactNode;
}) {
  const hasReviews = reviews.length > 0;
  const [tab, setTab] = useState<TabId>(() =>
    resolveInitialTab(initialTab, hasReviews),
  );

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

  function selectTab(next: TabId) {
    setTab(next);
    setTabQuery(next);
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="Directory sections"
        className="mb-8 flex gap-1 border-b border-rule"
      >
        {tabs.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`hub-tab-${t.id}`}
              aria-controls={`hub-panel-${t.id}`}
              className={`min-h-11 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                selected
                  ? "border-rust text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
              onClick={() => selectTab(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <div
          role="tabpanel"
          id="hub-panel-overview"
          aria-labelledby="hub-tab-overview"
        >
          {children}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="hub-panel-reviews"
          aria-labelledby="hub-tab-reviews"
        >
          <h2 className="font-serif text-2xl">Reviews</h2>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            All customer reviews from public sources across listings on this
            page. Prefer the Reviews button on a listing card in Overview to
            read one company without leaving the directory.
          </p>
          <ReviewList
            reviews={reviews}
            emptyLabel="No reviews yet for these listings. Check back after the next monthly refresh."
          />
        </div>
      )}
    </>
  );
}
