import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/nc/concord/fence-company/";
const TITLE = "Fence companies in Concord NC";
const DESCRIPTION =
  "Fence companies in Concord, NC — local install and replacement shops in the Charlotte metro directory.";

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl } = await getRequestSite();
  const canonical = `${siteUrl}${CITY_PATH}`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
    },
  };
}

export default function Page() {
  const listings = listingsForCity("Concord");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Concord, NC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Concord
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Concord is the Cabarrus County anchor east-northeast of Charlotte: 114,598 people on July 1, 2025, up 9,282 (+8.8%) from the 2020 base of 105,316, and up 1,865 (+1.7%) from 2024. Local fence demand stretches from historic downtown and Afton Village toward the Concord Mills retail corridor — townhome-scale runs and larger lots both show up in the same market.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Concord does not have a separate named row in the 2025 Building Permits Survey place file. Cabarrus County authorized 1,358 one-unit units in 2025 — county context, not a Concord-only office print. Compare listings below for crews that already work Concord and greater Cabarrus.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Concord fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Concord fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          Cabarrus context
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Use the county one-unit count to understand growth pressure around Concord; do not treat 1,358 as a city permit desk total. This page stays listings-first for Concord-named service areas.
        </p>
      </section>
    </main>
  );
}
