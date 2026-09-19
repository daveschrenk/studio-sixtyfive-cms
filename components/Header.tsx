import Link from "next/link";
import { cookies } from "next/headers";
import { HUB } from "@/lib/data";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import { getRequestSite } from "@/lib/request-site";
import { CityStrip } from "./CityStrip";
import { FenceCityStrip } from "./FenceCityStrip";
import { TowingCityStrip } from "./TowingCityStrip";
import { MailingListHeaderSignup } from "./MailingListForm";

export async function Header() {
  const { tenant } = await getRequestSite();
  const jar = await cookies();
  const cmsLoggedIn =
    jar.get(CMS_COOKIE_NAME)?.value === CMS_COOKIE_VALUE;

  const isFence = tenant.siteId === "fence-charlotte";
  const isStudio = tenant.siteId === "studio-hub";
  const isTowing = tenant.siteId === "towing-dallas";
  const hubHref = isTowing
    ? "/tx/dallas/towing/"
    : isStudio
      ? "/"
      : isFence
        ? "/nc/charlotte/fence-company/"
        : HUB.path;
  const subtitle = isTowing
    ? "Towing directory · Dallas preview"
    : isStudio
      ? cmsLoggedIn
        ? "Factory hub · sites & idea pool"
        : "Big Dir / Studio Sixtyfive"
      : isFence
        ? "Fence directory · Charlotte metro"
        : "Install directory · Dallas–Fort Worth–Arlington MSA";

  // Public placard: keep mailing list, slim nav (no hub label implying sites list)
  const showHubLink = !(isStudio && !cmsLoggedIn);

  return (
    <header className="border-b border-rule bg-cream/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-page px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3">
          <Link href={hubHref} className="group min-w-0">
            <p className="font-serif text-xl sm:text-2xl tracking-tight text-ink group-hover:text-rust-dark">
              {tenant.name}
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted mt-0.5">
              {subtitle}
            </p>
          </Link>
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-4">
            <nav
              aria-label="Primary"
              className="flex shrink-0 items-center gap-3 sm:gap-5 text-sm text-muted"
            >
              {showHubLink ? (
                <Link
                  href={hubHref}
                  className="min-h-11 inline-flex items-center hover:text-rust"
                >
                  Hub
                </Link>
              ) : null}
              <Link
                href="/contact/"
                className="min-h-11 inline-flex items-center hover:text-rust"
              >
                Contact
              </Link>
              {isStudio && !cmsLoggedIn ? (
                <Link
                  href="/admin/login/"
                  className="min-h-11 inline-flex items-center hover:text-rust"
                >
                  Login
                </Link>
              ) : null}
            </nav>
            <MailingListHeaderSignup />
          </div>
        </div>
        {isStudio ? null : isTowing ? (
          <TowingCityStrip />
        ) : isFence ? (
          <FenceCityStrip />
        ) : (
          <CityStrip />
        )}
      </div>
    </header>
  );
}
