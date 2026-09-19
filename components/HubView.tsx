import { HUB } from "@/lib/data";
import { listingsForHub } from "@/lib/listings";
import { getRequestSite } from "@/lib/request-site";
import { DirectoryShell } from "./DirectoryShell";
import { StatsStrip } from "./StatsStrip";
import { CityIndex } from "./CityIndex";
import { ListingStack } from "./ListingStack";
import { MapEmbed } from "./MapEmbed";
import { SourcesBlock } from "./SourcesBlock";
import { hubJsonLd, JsonLd } from "./JsonLd";

export async function HubView({
  pagePath,
}: {
  pagePath?: string;
} = {}) {
  const snapshot = HUB.intro[0];
  const cover = HUB.sections[0];
  const hubListings = listingsForHub();
  const { siteUrl, tenant } = await getRequestSite();
  const jsonLdPath = pagePath ?? HUB.path;

  return (
    <DirectoryShell toc={HUB.toc}>
      <JsonLd
        data={hubJsonLd(HUB, hubListings, {
          siteUrl,
          siteName: tenant.name,
          pagePath: jsonLdPath,
        })}
      />
      <p className="text-xs uppercase tracking-[0.18em] text-rust">
        Dallas–Fort Worth–Arlington MSA · CBSA 19100
      </p>
      <h1 id="intro" className="font-serif text-4xl sm:text-[2.75rem] leading-[1.15] mt-2 scroll-mt-28">
        {HUB.h1}
      </h1>
      <p className="mt-4 text-lg text-muted max-w-reading">
        A static directory for{" "}
        <strong className="text-ink font-medium">
          garage door install Dallas Fort Worth
        </strong>
        : new construction and replacement in the growth suburbs, not a Dallas
        city-limits repair page.
      </p>

      <div className="mt-8">
        <StatsStrip stats={HUB.stats} />
      </div>

      {snapshot ? (
        <div className="lede mt-8 max-w-reading text-[17px] leading-7">
          <p>{snapshot}</p>
        </div>
      ) : null}

      <section id="listings" className="mt-14 scroll-mt-28">
        <h2 className="font-serif text-2xl sm:text-3xl">
          Installers covering the metro
        </h2>
        <p className="mt-2 text-muted">
          Shops marked as DFW-wide. City pages list companies that name that
          city in their service area — they are not copied onto every suburb.
          Hours and amenities sit behind More details so the list stays scannable.
        </p>
        <ListingStack listings={hubListings} />
      </section>

      {cover ? (
        <section
          id={cover.id}
          className="mt-12 max-w-reading scroll-mt-28"
        >
          <h2 className="font-serif text-2xl sm:text-3xl">{cover.title}</h2>
          {cover.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="mt-4 leading-7">
              {p}
            </p>
          ))}
        </section>
      ) : null}

      <div className="mt-12">
        <CityIndex heading="Eight city pages off this hub" />
      </div>

      <section id="map" className="mt-14 scroll-mt-28">
        <h2 className="font-serif text-2xl sm:text-3xl">Metro area map</h2>
        <p className="mt-2 text-muted max-w-reading mb-4">
          City-context map of the Dallas–Fort Worth–Arlington MSA. The pin is
          metro context, not a shop address. City pages zoom to the named place.
        </p>
        <MapEmbed lat={HUB.lat} lng={HUB.lng} label={HUB.mapLabel} span={0.55} />
      </section>

      <div className="mt-14">
        <SourcesBlock />
      </div>
    </DirectoryShell>
  );
}
