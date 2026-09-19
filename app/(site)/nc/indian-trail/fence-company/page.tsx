import type { Metadata } from "next";
import { getRequestSite } from "@/lib/request-site";
import Link from "next/link";
import { listingsForCity } from "@/data/fence-charlotte";
import { FenceCityListings } from "@/components/FenceCityListings";

export const dynamic = "force-dynamic";

const CITY_PATH = "/nc/indian-trail/fence-company/";
const TITLE = "Fence companies in Indian Trail NC";
const DESCRIPTION =
  "Fence companies in Indian Trail, NC — local install and replacement shops in the Charlotte metro directory.";

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
  const listings = listingsForCity("Indian Trail");
  return (
    <main className="mx-auto max-w-page px-4 py-10 sm:px-6">
      <p className="text-xs text-muted">
        <Link
          href="/nc/charlotte/fence-company/"
          className="underline underline-offset-2"
        >
          Charlotte hub
        </Link> 
        · Indian Trail, NC
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight">
        Fence companies in Indian Trail
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Indian Trail is a Union County growth town southeast of Charlotte: 44,303 residents on July 1, 2025, up 4,143 (+10.3%) from the 2020 base of 40,160, with a slower +341 (+0.8%) from 2024 to 2025. Newer subdivision streets drive a lot of matching privacy-fence packages; this page does not invent HOA color or setback rules — bring your plat and guidelines when you request bids.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        Indian Trail does not have a separate named row in the 2025 Building Permits Survey place file. Union County authorized 2,387 one-unit units in 2025 — county context for how busy the east/southeast edge remains. Listings below filter to Indian Trail.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Indian Trail fence companies</h2>
      <FenceCityListings
        listings={listings}
        emptyLabel="No Indian Trail fence listings in this pack yet — check the Charlotte hub or a nearby city."
      />
      <section className="mt-12 max-w-2xl" aria-labelledby="local-context">
        <h2 id="local-context" className="font-serif text-xl tracking-tight">
          Union County edge
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Pair this page with Matthews when shoppers are choosing between SE Meck and Union addresses. Use Union County’s 2,387 only as county context.
        </p>
      </section>
    </main>
  );
}
