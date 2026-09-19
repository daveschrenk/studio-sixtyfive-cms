"use client";

import { useEffect, useState } from "react";
import { applyOverrides, CMS_OVERRIDES_KEY, readOverrides } from "@/lib/cms";
import type { Listing } from "@/lib/types";
import { ListingCard } from "./ListingCard";

export function ListingStack({ listings }: { listings: Listing[] }) {
  const [mergedListings, setMergedListings] = useState(listings);

  useEffect(() => {
    const mergeStoredOverrides = () => {
      setMergedListings(applyOverrides(listings, readOverrides()));
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CMS_OVERRIDES_KEY) mergeStoredOverrides();
    };

    mergeStoredOverrides();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(CMS_OVERRIDES_KEY, mergeStoredOverrides);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CMS_OVERRIDES_KEY, mergeStoredOverrides);
    };
  }, [listings]);

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-muted">
        {mergedListings.length} listing{mergedListings.length === 1 ? "" : "s"} ·
        tap More details for hours and amenities
      </p>
      <div className="space-y-6">
        {mergedListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
