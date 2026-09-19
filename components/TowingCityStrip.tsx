"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOWING_CITIES } from "@/lib/towing-listings";

function normalizePath(path: string) {
  if (!path) return "/";
  return path.replace(/\/+$/, "") || "/";
}

/** Cities with enough pack listings to be worth a hub strip. */
const STRIP = TOWING_CITIES.filter(
  (c) => c.slug === "dallas" || c.count >= 3,
);

export function TowingCityStrip() {
  const pathname = normalizePath(usePathname() || "/");
  return (
    <div className="relative -mx-4 sm:mx-0">
      <nav
        aria-label="City pages"
        className="flex gap-x-4 gap-y-2 overflow-x-auto pb-3 text-[13px] text-muted whitespace-nowrap px-4 sm:px-0 scroll-smooth"
      >
        {STRIP.map((city) => {
          const active = pathname === normalizePath(city.path);
          return (
            <Link
              key={city.slug}
              href={city.path}
              className={
                active
                  ? "text-ink font-medium underline underline-offset-4 decoration-rust"
                  : "hover:text-ink hover:underline underline-offset-4"
              }
            >
              {city.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
