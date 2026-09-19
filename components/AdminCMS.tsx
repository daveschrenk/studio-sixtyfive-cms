"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  applyOverrides,
  CMS_OVERRIDES_KEY,
  patchOverride,
  readOverrides,
  type CmsOverrides,
} from "@/lib/cms";
import type { Listing } from "@/lib/types";
import {
  THEMES,
  CMS_THEME_KEY,
  readThemeId,
  writeThemeId,
  resolveThemeId,
  isPlatformOnly,
  DEFAULT_THEME_ID,
} from "@/lib/themes";

type CityLink = { name: string; path: string; shortName: string };

function isRealPhotoUrl(url?: string | null): url is string {
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return true;
  return url.startsWith("/photo-picker/");
}

function publicLinkFor(listing: Listing, hubPath: string, cities: CityLink[]): string {
  if (listing.dfwWide) return `${hubPath}#${listing.slug}`;
  const target = (listing.serviceArea ?? []).map((area) => area.toLowerCase());
  const match = cities.find((city) => target.includes(city.name.toLowerCase()));
  if (match) return `${match.path}#${listing.slug}`;
  return `${hubPath}#${listing.slug}`;
}

type Draft = { phone: string; website: string };
type RankDraft = string;

export function AdminCMS({
  listings,
  hubPath,
  cities,
}: {
  listings: Listing[];
  hubPath: string;
  cities: CityLink[];
}) {
  const [overrides, setOverrides] = useState<CmsOverrides>({});
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [rankDrafts, setRankDrafts] = useState<Record<string, RankDraft>>({});
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);

  useEffect(() => {
    const sync = () => setOverrides(readOverrides());
    sync();
    const syncTheme = () => setThemeId(resolveThemeId(readThemeId() ?? DEFAULT_THEME_ID));
    syncTheme();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CMS_OVERRIDES_KEY) sync();
    };

    const handleThemeStorage = (event: StorageEvent) => {
      if (event.key === CMS_THEME_KEY) {
        setThemeId(resolveThemeId(readThemeId() ?? DEFAULT_THEME_ID));
      }
    };
    const syncThemeEvent = () =>
      setThemeId(resolveThemeId(readThemeId() ?? DEFAULT_THEME_ID));

    window.addEventListener("storage", handleStorage);
    window.addEventListener("storage", handleThemeStorage);
    window.addEventListener(CMS_OVERRIDES_KEY, sync);
    window.addEventListener(CMS_THEME_KEY, syncThemeEvent);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("storage", handleThemeStorage);
      window.removeEventListener(CMS_OVERRIDES_KEY, sync);
      window.removeEventListener(CMS_THEME_KEY, syncThemeEvent);
    };
  }, []);

  const merged = useMemo(() => applyOverrides(listings, overrides), [listings, overrides]);

  const sponsorCount = merged.filter((listing) => listing.sponsor).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter((listing) => listing.name.toLowerCase().includes(q));
  }, [merged, query]);

  function setSponsor(id: string, sponsor: boolean) {
    const next = patchOverride(id, { sponsor });
    setOverrides(next);
  }

  function setPhotoPositionY(id: string, value: number) {
    const next = patchOverride(id, { photoPositionY: value });
    setOverrides(next);
  }

  function setSiteTheme(id: string) {
    writeThemeId(id);
    setThemeId(resolveThemeId(id));
  }

  function draftFor(listing: Listing): Draft {
    return (
      drafts[listing.id] ?? {
        phone: listing.phone ?? "",
        website: listing.website ?? "",
      }
    );
  }

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { phone: "", website: "" }), ...patch },
    }));
  }

  function saveDraft(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    const next = patchOverride(id, {
      phone: draft.phone,
      website: draft.website || null,
    });
    setOverrides(next);
  }

  function rankDraftFor(listing: Listing): RankDraft {
    return rankDrafts[listing.id] ?? String(listing.rank ?? "");
  }

  function updateRankDraft(id: string, value: string) {
    setRankDrafts((prev) => ({ ...prev, [id]: value }));
  }

  function saveRankDraft(id: string) {
    const value = rankDrafts[id];
    if (value === undefined) return;
    const rank = Number(value);
    if (!Number.isFinite(rank)) return;
    const next = patchOverride(id, { rank });
    setOverrides(next);
  }

  return (
    <div className="mx-auto max-w-page px-4 sm:px-6 py-8">
      <div className="border border-rust bg-cream px-4 py-3 text-sm text-ink">
        Preview mock: edits stay in this browser until we attach a hosted
        CMS. Live site is unchanged.
      </div>

      <section className="mt-6 border border-rule bg-cream p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl">Site theme</h2>
          <p className="text-xs text-muted">
            Controls the public site only (this browser). CMS chrome stays dark.
          </p>
        </div>
        <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Choose site theme</legend>
          {THEMES.map((theme) => {
            const selected = themeId === theme.id;
            const platformOnly = isPlatformOnly(theme.id);
            const { primary, accent, cta, bg } = theme.tokens;
            return (
              <label
                key={theme.id}
                className={`flex cursor-pointer gap-3 border px-3 py-3 ${
                  selected ? "border-rust bg-paper" : "border-rule bg-paper/60 hover:border-rust"
                }`}
              >
                <input
                  type="radio"
                  name="site-theme"
                  className="mt-1"
                  checked={selected}
                  onChange={() => setSiteTheme(theme.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{theme.name}</span>
                    {platformOnly ? (
                      <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-primary">
                        platform only — not for trade tenants
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">{theme.vibe}</span>
                  <span className="mt-2 flex gap-1" aria-hidden="true">
                    <span
                      className="h-4 w-4 border border-rule"
                      style={{ background: primary }}
                      title="primary"
                    />
                    <span
                      className="h-4 w-4 border border-rule"
                      style={{ background: accent }}
                      title="accent"
                    />
                    <span
                      className="h-4 w-4 border border-rule"
                      style={{ background: cta }}
                      title="cta"
                    />
                    <span
                      className="h-4 w-4 border border-rule"
                      style={{ background: bg }}
                      title="bg"
                    />
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
      </section>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">Listing overrides</h1>
          <p className="mt-1 text-sm text-muted">
            {merged.length} listings · {sponsorCount} marked sponsor
          </p>
        </div>
        <Link
          href={hubPath}
          className="text-sm text-rust underline underline-offset-2"
        >
          View public hub
        </Link>
      </div>

      <div className="mt-4">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by company name…"
          className="w-full max-w-sm border border-rule bg-paper px-3 py-2 text-sm focus:border-rust focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-x-auto border border-rule bg-cream">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-rule text-left text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-3 py-2 font-medium">Photo</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">City</th>
              <th className="px-3 py-2 font-medium">Rank</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Website</th>
              <th className="px-3 py-2 font-medium">Public page</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((listing) => {
              const draft = draftFor(listing);
              const isSponsor = Boolean(listing.sponsor);
              return (
                <tr key={listing.id} className="border-b border-rule align-top">
                  <td className="px-3 py-2 w-56">
                    {isRealPhotoUrl(listing.photoUrl) ? (
                      <div className="w-52 space-y-2">
                        <img
                          src={listing.photoUrl}
                          alt=""
                          className="h-28 w-full object-cover border border-rule"
                          style={{
                            objectPosition: `center ${listing.photoPositionY ?? 50}%`,
                          }}
                        />
                        <label className="block text-xs text-muted">
                          Photo position (thin header crop)
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={listing.photoPositionY ?? 50}
                            onChange={(event) =>
                              setPhotoPositionY(
                                listing.id,
                                Number(event.target.value),
                              )
                            }
                            className="mt-1 block w-full"
                          />
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPhotoPositionY(
                                listing.id,
                                (listing.photoPositionY ?? 50) - 5,
                              )
                            }
                            className="border border-rule px-2 py-1 text-xs hover:border-rust"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPhotoPositionY(
                                listing.id,
                                (listing.photoPositionY ?? 50) + 5,
                              )
                            }
                            className="border border-rule px-2 py-1 text-xs hover:border-rust"
                          >
                            Down
                          </button>
                          <span className="text-xs tabular-nums text-muted">
                            {listing.photoPositionY ?? 50}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-10 w-14 bg-paper" />
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">{listing.name}</td>
                  <td className="px-3 py-2 text-muted">{listing.city ?? "—"}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={rankDraftFor(listing)}
                      onChange={(event) =>
                        updateRankDraft(listing.id, event.target.value)
                      }
                      onBlur={() => saveRankDraft(listing.id)}
                      className="w-16 border border-rule bg-paper px-2 py-1 text-sm focus:border-rust focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <fieldset className="flex flex-col gap-1">
                      <label className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name={`sponsor-${listing.id}`}
                          checked={!isSponsor}
                          onChange={() => setSponsor(listing.id, false)}
                        />
                        Standard
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name={`sponsor-${listing.id}`}
                          checked={isSponsor}
                          onChange={() => setSponsor(listing.id, true)}
                        />
                        Sponsor
                      </label>
                    </fieldset>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={draft.phone}
                      onChange={(event) =>
                        updateDraft(listing.id, { phone: event.target.value })
                      }
                      className="w-36 border border-rule bg-paper px-2 py-1 text-sm focus:border-rust focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={draft.website}
                      onChange={(event) =>
                        updateDraft(listing.id, { website: event.target.value })
                      }
                      className="w-40 border border-rule bg-paper px-2 py-1 text-sm focus:border-rust focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveDraft(listing.id)}
                      className="mt-1 border border-rule px-2 py-1 text-xs hover:border-rust"
                    >
                      Save
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={publicLinkFor(listing, hubPath, cities)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rust underline underline-offset-2"
                    >
                      View
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
