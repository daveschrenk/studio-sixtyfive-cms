import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/nc/pineville/fence-company/";
const TITLE = "Fence companies in Pineville NC";
const DESCRIPTION =
  "Fence companies in Pineville, NC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Pineville");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Pineville, NC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Pineville
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Pineville is a compact south Mecklenburg town: 11,851 residents on July 1, 2025, up 1,246 (+11.7%) from the 2020 base of 10,605, and up 260 (+2.2%) from 2024. Downtown shops, Carolina Place traffic, and short residential lots shape install logistics — alley access and tight side yards show up more often than acreage runs.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Pineville does not have a separate named row in the 2025 Building Permits Survey place file. Use Mecklenburg’s 3,747 one-unit authorizations only as county context. Listings below filter to Pineville (coverage may be thin until metro enrichment lands).
      </p>
      <h2 className="mt-10 font-serif text-2xl">Pineville fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Pineville fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          Small footprint, own URL
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Pineville stays a city page because the place name is how locals search — not because it matches Charlotte’s permit volume. Staging on short lots is a quote conversation with the shop, not a statute claimed here.
        </p>
      </section>
    </main>
  );
}
