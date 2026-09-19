import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/nc/mooresville/fence-company/";
const TITLE = "Fence companies in Mooresville NC";
const DESCRIPTION =
  "Fence companies in Mooresville, NC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Mooresville");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Mooresville, NC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Mooresville
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Mooresville is the Iredell County “Race City” market on the north Lake Norman shore: 55,842 residents on July 1, 2025, up 5,554 (+11.0%) from the 2020 base of 50,288, and up 342 (+0.6%) from 2024. Privacy screens on busier streets and open aluminum on view lots both belong on this page — without invented pool-code or lake-breeze engineering claims.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Mooresville has a 2025 Building Permits Survey place row: 308 one-unit units. Iredell County authorized 1,447 one-unit units the same year. Listings below filter to Mooresville.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Mooresville fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Mooresville fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          Iredell / Lake Norman north
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Mooresville is inside the Charlotte MSA even though it sits in Iredell. Use 308 as the city-office one-unit print; ask shops about lakefront vs inland scopes when you call.
        </p>
      </section>
    </main>
  );
}
