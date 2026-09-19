import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/nc/mint-hill/fence-company/";
const TITLE = "Fence companies in Mint Hill NC";
const DESCRIPTION =
  "Fence companies in Mint Hill, NC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Mint Hill");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Mint Hill, NC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Mint Hill
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Mint Hill sits on Charlotte’s east side in Mecklenburg County: 29,476 people on July 1, 2025, up 3,026 (+11.4%) from the 2020 base of 26,450, and up 635 (+2.2%) from 2024. Compact lots near Lawyers Road sit beside larger parcels farther out, so the same market sees shadowbox privacy and wider rural-style runs without needing a separate “farm fence” city page.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Mint Hill does not have a separate named row in the 2025 Building Permits Survey place file. Mecklenburg’s 3,747 one-unit count is county context only. Call the Mint Hill listings below for local crews.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Mint Hill fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Mint Hill fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          East Meck named town
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Mint Hill is a town page, not a Charlotte neighborhood chip. Keep Lawyers Road as geography only; do not invent creek setbacks or horse-fence codes here.
        </p>
      </section>
    </main>
  );
}
