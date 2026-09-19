import type { Listing } from "./types";

export const CMS_OVERRIDES_KEY = "dfw-cms-overrides";

export type ListingOverride = {
  sponsor?: boolean;
  name?: string;
  phone?: string;
  website?: string | null;
  blurb?: string;
  rank?: number;
  /** Vertical focal point for thin header crop (0–100, default 50). */
  photoPositionY?: number;
};

export type CmsOverrides = Record<string, ListingOverride>;

export function readOverrides(): CmsOverrides {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(CMS_OVERRIDES_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as CmsOverrides)
      : {};
  } catch {
    return {};
  }
}

export function writeOverrides(overrides: CmsOverrides): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CMS_OVERRIDES_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new CustomEvent(CMS_OVERRIDES_KEY));
}

function clampPhotoPositionY(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

export function patchOverride(
  id: string,
  patch: ListingOverride,
): CmsOverrides {
  const overrides = readOverrides();
  const normalized: ListingOverride = { ...patch };
  if (normalized.photoPositionY !== undefined) {
    normalized.photoPositionY = clampPhotoPositionY(normalized.photoPositionY);
  }
  const next = {
    ...overrides,
    [id]: { ...overrides[id], ...normalized },
  };
  writeOverrides(next);
  return next;
}

export function mergeListing(
  listing: Listing,
  override?: ListingOverride,
): Listing {
  return override ? { ...listing, ...override } : listing;
}

const MISSING_RANK = 9999;

export function applyOverrides(
  listings: Listing[],
  overrides: CmsOverrides,
): Listing[] {
  return listings
    .map((listing) => mergeListing(listing, overrides[listing.id]))
    .sort((a, b) => (a.rank ?? MISSING_RANK) - (b.rank ?? MISSING_RANK));
}
