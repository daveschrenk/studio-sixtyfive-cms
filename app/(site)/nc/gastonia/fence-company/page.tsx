import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/nc/gastonia/fence-company/";
const TITLE = "Fence companies in Gastonia NC";
const DESCRIPTION =
  "Fence companies in Gastonia, NC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Gastonia");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Gastonia, NC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Gastonia
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Gastonia is Gaston County’s principal city west of Charlotte: 87,067 people on July 1, 2025, up 6,614 (+8.2%) from the 2020 base of 80,453, and up 1,195 (+1.4%) from 2024. The local fence mix leans practical — wood privacy on residential side yards and chain-link on commercial edges — across older in-town blocks and newer residential tracts on the west side of the metro.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Gastonia does not have a separate named row in the 2025 Building Permits Survey place file. Gaston County authorized 2,153 one-unit units in 2025 (county context). Use the listing stack for Gastonia-named shops.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Gastonia fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Gastonia fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          West-side metro page
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Gastonia is the Gaston County seat market on this hub, not a Charlotte neighborhood URL. County one-unit volume is high relative to several eastern suburbs.
        </p>
      </section>
    </main>
  );
}
