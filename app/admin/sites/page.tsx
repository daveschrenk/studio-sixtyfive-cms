import { FactoryPassButton } from "@/components/FactoryPassButton";
import { IdeaPoolPanel } from "@/components/IdeaPoolPanel";
import { SitesHub } from "@/components/SitesHub";
import { getGscDailyMetrics } from "@/lib/google-search-console";
import { SITES_HUB } from "@/lib/sites-hub";

export default async function AdminSitesPage() {
  const metrics = Object.fromEntries(
    await Promise.all(
      SITES_HUB.map(async (site) => [
        site.siteId,
        site.gscProperty
          ? await getGscDailyMetrics(site.gscProperty)
          : null,
      ] as const),
    ),
  );

  return (
    <div className="mx-auto max-w-page px-4 sm:px-6 py-8 pb-12">
      <SitesHub metrics={metrics} />
      <FactoryPassButton />
      <IdeaPoolPanel />
    </div>
  );
}
