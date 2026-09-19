import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/nc/huntersville/fence-company/";
const TITLE = "Fence companies in Huntersville NC";
const DESCRIPTION =
  "Fence companies in Huntersville, NC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Huntersville");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Huntersville, NC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Huntersville
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Huntersville is the North Mecklenburg / Lake Norman corridor town: 68,535 residents on July 1, 2025, up 7,117 (+11.6%) from the 2020 base of 61,418, and up 1,498 (+2.2%) from 2024. Fence searches here split between shoreline-adjacent lots near Lake Norman and inland subdivisions around Birkdale Village — open aluminum for views and taller privacy screens inland both appear in the same city market.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Huntersville does not have a separate named row in the 2025 Building Permits Survey place file. Cite Mecklenburg’s 3,747 one-unit authorizations as county context only. Listings below filter to Huntersville.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Huntersville fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Huntersville fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          Lake Norman without inventing codes
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          This page does not quote wind loads, dock rules, or HOA color boards. Ask the shop what they file for your lot; use the cards to start those calls.
        </p>
      </section>
    </main>
  );
}
