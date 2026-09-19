import Link from "next/link";
import { HUB, cityBySlug } from "@/lib/data";
import { listingsForCity } from "@/lib/listings";
import { getRequestSite } from "@/lib/request-site";
import type { CityPage } from "@/lib/types";
import { DirectoryShell } from "./DirectoryShell";
import { StatsStrip } from "./StatsStrip";
import { CityIndex } from "./CityIndex";
import { ListingStack } from "./ListingStack";
import { MapEmbed } from "./MapEmbed";
import { SourcesBlock } from "./SourcesBlock";
import { cityJsonLd, JsonLd } from "./JsonLd";

export async function CityView({ city }: { city: CityPage }) {
  const related = city.related
    .map((slug) => cityBySlug(slug))
    .filter((c): c is CityPage => Boolean(c));
  const snapshot = city.intro[0];
  const local = city.sections[0];
  const cityListings = listingsForCity(city.name);
  const { siteUrl, tenant } = await getRequestSite();

  return (
    <DirectoryShell toc={city.toc}>
      <JsonLd
        data={cityJsonLd(city, cityListings, {
          siteUrl,
          siteName: tenant.name,
        })}
      />
      <p className="text-xs uppercase tracking-[0.18em] text-rust">
        {city.kicker}
      </p>
      <h1
        id="intro"
        className="font-serif text-4xl sm:text-[2.6rem] leading-[1.15] mt-2 scroll-mt-28"
      >
        {city.h1}
      </h1>
      <p className="mt-4 text-lg text-muted max-w-reading">
        Garage door installation in {city.name}: new construction and
        replacement, not a repair-first page. Part of the{" "}
        <Link href={HUB.path} className="text-rust underline underline-offset-2">
          Dallas–Fort Worth–Arlington MSA hub
        </Link>
        .
      </p>

      <div className="mt-8">
        <StatsStrip stats={city.stats} />
      </div>

      {snapshot ? (
        <div className="lede mt-8 max-w-reading text-[17px] leading-7">
          <p>{snapshot}</p>
        </div>
      ) : null}

      <section id="listings" className="mt-14 scroll-mt-28">
        <h2 className="font-serif text-2xl sm:text-3xl">
          Installers who serve {city.name}
        </h2>
        <p className="mt-2 text-muted">
          Companies that name {city.name} in their service area. Metro-wide
          shops live on the hub, not auto-copied here. Hours and amenities sit
          behind More details so the list stays scannable.
        </p>
        <ListingStack listings={cityListings} />
      </section>

      {local ? (
        <section
          id={local.id}
          className="mt-12 max-w-reading scroll-mt-28"
        >
          <h2 className="font-serif text-2xl sm:text-3xl">{local.title}</h2>
          {local.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="mt-4 leading-7">
              {p}
            </p>
          ))}
        </section>
      ) : null}

      {city.neighborhoods.length > 0 && (
        <section id="neighborhoods" className="mt-12 max-w-reading scroll-mt-28">
          <h2 className="font-serif text-2xl sm:text-3xl">Where the new doors go</h2>
          <ul className="mt-4 space-y-3">
            {city.neighborhoods.map((n) => (
              <li key={n.name} className="border border-rule bg-cream p-4">
                <p className="font-medium">{n.name}</p>
                <p className="text-sm text-muted mt-1">{n.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="nearby" className="mt-14 scroll-mt-28">
        <h2 className="font-serif text-2xl sm:text-3xl">Nearby install pages</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          <li>
            <Link
              href={HUB.path}
              className="block border border-rule bg-cream px-4 py-3 hover:border-rust"
            >
              Dallas–Fort Worth hub
            </Link>
          </li>
          {related.map((n) => (
            <li key={n.slug}>
              <Link
                href={n.path}
                className="block border border-rule bg-cream px-4 py-3 hover:border-rust"
              >
                {n.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14">
        <CityIndex exclude={city.slug} heading="All city pages" />
      </div>

      <section id="map" className="mt-14 scroll-mt-28">
        <h2 className="font-serif text-2xl sm:text-3xl">{city.name} area map</h2>
        <p className="mt-2 text-muted max-w-reading mb-4">
          City-context map centered on {city.mapLabel}. The pin marks the city,
          not a specific installer.
        </p>
        <MapEmbed lat={city.lat} lng={city.lng} label={city.mapLabel} span={0.12} />
      </section>

      <div className="mt-14">
        <SourcesBlock />
      </div>
    </DirectoryShell>
  );
}
