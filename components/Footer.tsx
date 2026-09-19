import Link from "next/link";
import { cookies } from "next/headers";
import { CITIES, HUB, SOURCES } from "@/lib/data";
import { FENCE_CITIES } from "@/data/fence-charlotte";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import { getRequestSite } from "@/lib/request-site";

export async function Footer() {
  const { tenant } = await getRequestSite();
  const jar = await cookies();
  const cmsLoggedIn =
    jar.get(CMS_COOKIE_NAME)?.value === CMS_COOKIE_VALUE;
  const isFence = tenant.siteId === "fence-charlotte";
  const isStudio = tenant.siteId === "studio-hub";
  const isTowing = tenant.siteId === "towing-dallas";

  return (
    <footer className="mt-16 border-t border-rule bg-cream">
      <div className="mx-auto max-w-page px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-serif text-lg">
            {isStudio && !cmsLoggedIn ? "Studio Sixtyfive" : tenant.name}
          </p>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            {isStudio && !cmsLoggedIn
              ? "Big Dir directory factory workspace."
              : tenant.tagline}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Pages</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {isTowing ? (
              <>
                <li>
                  <Link href="/tx/dallas/towing/" className="hover:text-rust">
                    Dallas towing hub
                  </Link>
                </li>
                <li>
                  <Link href="/contact/" className="hover:text-rust">
                    Contact / claim a listing
                  </Link>
                </li>
              </>
            ) : isStudio ? (
              cmsLoggedIn ? (
                <>
                  <li>
                    <Link href="/" className="hover:text-rust">
                      Sites hub
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact/" className="hover:text-rust">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/sites/" className="hover:text-rust">
                      Admin sites
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/contact/" className="hover:text-rust">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/login/" className="hover:text-rust">
                      CMS login
                    </Link>
                  </li>
                </>
              )
            ) : isFence ? (
              <>
                <li>
                  <Link
                    href="/nc/charlotte/fence-company/"
                    className="hover:text-rust"
                  >
                    Charlotte hub
                  </Link>
                </li>
                <li>
                  <Link href="/contact/" className="hover:text-rust">
                    Contact / claim a listing
                  </Link>
                </li>
                {FENCE_CITIES.filter((c) => c.slug !== "charlotte").map(
                  (city) => (
                    <li key={city.slug}>
                      <Link href={city.path} className="hover:text-rust">
                        {city.name}
                      </Link>
                    </li>
                  ),
                )}
              </>
            ) : (
              <>
                <li>
                  <Link href={HUB.path} className="hover:text-rust">
                    Dallas–Fort Worth hub
                  </Link>
                </li>
                <li>
                  <Link href="/contact/" className="hover:text-rust">
                    Contact / claim a listing
                  </Link>
                </li>
                {CITIES.map((city) => (
                  <li key={city.slug}>
                    <Link href={city.path} className="hover:text-rust">
                      {city.name}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Sources
          </p>
          {isTowing ? (
            <p className="mt-3 text-sm text-muted">
              Laura v1.1 towing-dallas pack (198 listings, 27 photos).
            </p>
          ) : isStudio ? (
            <p className="mt-3 text-sm text-muted">
              {cmsLoggedIn
                ? "Internal Big Dir factory hub. Not a public directory site."
                : "Big Dir / Studio Sixtyfive placard."}
            </p>
          ) : isFence ? (
            <p className="mt-3 text-sm text-muted">
              Sample listings for multi-tenant preview. Real Charlotte pack TBD.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {SOURCES.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    className="hover:text-rust underline-offset-2 hover:underline"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-rule">
        <p className="mx-auto max-w-page px-4 sm:px-6 py-4 text-xs text-muted">
          {isTowing
            ? "Towing Dallas pack preview via Studio Sixtyfive factory claim."
            : isStudio
              ? cmsLoggedIn
                ? "Big Dir Studio — factory hub for directory sites."
                : "Studio Sixtyfive — Big Dir placeholder."
              : isFence
                ? "Charlotte fence directory mock. Contact us to correct a listing."
                : "Listings from the Big Dir DFW pack. Permit figures are Census BPS 2025 and Vintage 2025 PEP. Contact us to correct a listing."}
        </p>
      </div>
    </footer>
  );
}
