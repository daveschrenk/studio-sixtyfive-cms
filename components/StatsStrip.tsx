import type { CityStat } from "@/lib/types";

export function StatsStrip({ stats }: { stats: CityStat[] }) {
  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4 border border-rule bg-cream divide-x-0 divide-y lg:divide-y-0 lg:divide-x divide-rule">
      {stats.map((stat) => (
        <div key={stat.label} className="p-4 sm:p-5">
          <dt className="text-xs uppercase tracking-[0.14em] text-muted">
            {stat.label}
          </dt>
          <dd className="font-serif text-2xl sm:text-3xl mt-1 tabular-nums">
            {stat.value}
          </dd>
          {stat.note ? (
            <p className="text-xs text-muted mt-1 leading-snug">{stat.note}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
