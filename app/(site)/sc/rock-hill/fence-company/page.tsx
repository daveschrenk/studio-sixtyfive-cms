import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/sc/rock-hill/fence-company/";
const TITLE = "Fence companies in Rock Hill SC";
const DESCRIPTION =
  "Fence companies in Rock Hill, SC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Rock Hill");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Rock Hill, SC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Rock Hill
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Rock Hill is York County’s largest city on this hub: 75,911 people on July 1, 2025, up 1,566 (+2.1%) from the 2020 base of 74,345, with only +114 (+0.2%) from 2024 to 2025. Fence demand spans Riverwalk new builds, established neighborhoods, and industrial edges along Dave Lyle Boulevard — wood privacy, commercial chain-link, and security runs in one market.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Rock Hill’s 2025 Building Permits Survey place row shows 189 one-unit units; York County logged 1,949. Growth is slower than Fort Mill’s, so expect more replacement and commercial mix beside first-fence new construction. Use the listing cards below to call Rock Hill–named shops.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Rock Hill fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Rock Hill fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          Larger SC city, slower pop climb
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Population growth is modest versus Fort Mill; the 189 one-unit place print is a lower-bound install proxy, not a ranking of fence companies.
        </p>
      </section>
    </main>
  );
}
