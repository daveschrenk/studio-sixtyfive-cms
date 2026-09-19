import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/nc/matthews/fence-company/";
const TITLE = "Fence companies in Matthews NC";
const DESCRIPTION =
  "Fence companies in Matthews, NC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Matthews");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Matthews, NC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Matthews
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Matthews sits southeast of Uptown in Mecklenburg County with 32,769 residents on July 1, 2025 — up 3,342 (+11.4%) from the 2020 base of 29,427, and up 701 (+2.2%) from 2024. Downtown Matthews and the John Street corridor are the usual local landmarks for homeowners comparing privacy wood and black aluminum runs.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Matthews does not have a separate named row in the 2025 Building Permits Survey place file; Mecklenburg’s 3,747 one-unit authorizations are county context only. This page is for shops that name Matthews; metro-wide crews also appear on the Charlotte hub.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Matthews fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Matthews fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          Why Matthews has its own page
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          It is a named SE Meck town, not a Ballantyne mill URL. Union County growth sits next door (see Indian Trail), but Matthews listings stay Mecklenburg-facing unless a shop’s own service area says otherwise.
        </p>
      </section>
    </main>
  );
}
