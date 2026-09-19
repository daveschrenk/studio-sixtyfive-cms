"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CITIES, HUB } from "@/lib/data";

function normalizePath(path: string) {
  if (!path) return "/";
  return path.replace(/\/+$/, "") || "/";
}

function linkClass(active: boolean) {
  return active
    ? "text-ink font-medium underline underline-offset-4 decoration-rust"
    : "hover:text-ink hover:underline underline-offset-4";
}

export function CityStrip() {
  const pathname = normalizePath(usePathname() || "/");
  const hubActive =
    pathname === normalizePath(HUB.path) || pathname === "/";

  return (
    <div className="relative -mx-4 sm:mx-0">
      <nav
        aria-label="City pages"
        className="flex gap-x-4 gap-y-2 overflow-x-auto pb-3 text-[13px] text-muted whitespace-nowrap px-4 sm:px-0 scroll-smooth"
      >
        <Link
          href={HUB.path}
          className={linkClass(hubActive)}
          aria-current={hubActive ? "page" : undefined}
        >
          DFW hub
        </Link>
        {CITIES.map((city) => {
          const active = pathname === normalizePath(city.path);
          return (
            <Link
              key={city.slug}
              href={city.path}
              className={linkClass(active)}
              aria-current={active ? "page" : undefined}
            >
              {city.shortName}
            </Link>
          );
        })}
      </nav>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-cream via-cream/80 to-transparent sm:from-cream"
        aria-hidden="true"
      />
    </div>
  );
}
