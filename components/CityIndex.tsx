import Link from "next/link";
import { CITIES } from "@/lib/data";

export function CityIndex({
  exclude,
  heading = "City install pages",
}: {
  exclude?: string;
  heading?: string;
}) {
  const cities = CITIES.filter((city) => city.slug !== exclude);
  return (
    <section id={exclude ? "more-cities" : "cities"} className="scroll-mt-28">
      <h2 className="font-serif text-2xl">{heading}</h2>
      <p className="mt-2 text-sm text-muted max-w-reading">
        Eight growth-suburb pages plus Fort Worth. Dallas city copy lives on
        the metro hub, not on its own URL.
      </p>
      <ul className="mt-5 grid sm:grid-cols-2 gap-3">
        {cities.map((city) => (
          <li key={city.slug}>
            <Link
              href={city.path}
              className="block border border-rule bg-cream p-4 hover:border-rust transition-colors"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-rust">
                {city.county.split("(")[0].trim()}
              </p>
              <p className="font-serif text-xl mt-1">{city.name}</p>
              <p className="text-sm text-muted mt-1">
                Pop. {city.stats[0]?.value} · 2025 1-unit{" "}
                {city.stats[2]?.value}
              </p>
              <p className="text-sm mt-2 text-ink/80">{city.kicker}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
