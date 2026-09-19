import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/sc/fort-mill/fence-company/";
const TITLE = "Fence companies in Fort Mill SC";
const DESCRIPTION =
  "Fence companies in Fort Mill, SC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Fort Mill");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Fort Mill, SC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Fort Mill
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Fort Mill sits just over the South Carolina line in York County and is the fastest-growing place among these eleven: 38,673 residents on July 1, 2025, up 14,156 (+57.7%) from the 2020 base of 24,517, and up 2,466 (+6.8%) from 2024. Baxter-area growth and Charlotte-commute subdivisions keep residential fence packages busy on the SC side of the metro.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Unlike most NC suburbs on this hub, Fort Mill has a 2025 Building Permits Survey place row: 786 one-unit units authorized. York County as a whole authorized 1,949 one-unit units the same year. This page does not invent SC permit checklists or HOA board contents — ask shops that already file Fort Mill / York jobs.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Fort Mill fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Fort Mill fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          SC page on a Charlotte hub
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Fort Mill is inside CBSA 16740. Paperwork differs from Mecklenburg even when the crew crosses the state line; verify with the listing you call.
        </p>
      </section>
    </main>
  );
}
