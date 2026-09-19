"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FENCE_CITIES } from "@/data/fence-charlotte";

function normalizePath(path: string) {
  if (!path) return "/";
  return path.replace(/\/+$/, "") || "/";
}

export function FenceCityStrip() {
  const pathname = normalizePath(usePathname() || "/");
  return (
    <div className="relative -mx-4 sm:mx-0">
      <nav
        aria-label="City pages"
        className="flex gap-x-4 gap-y-2 overflow-x-auto pb-3 text-[13px] text-muted whitespace-nowrap px-4 sm:px-0 scroll-smooth"
      >
        {FENCE_CITIES.map((city) => {
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
