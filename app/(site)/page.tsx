import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FactoryPassButton } from "@/components/FactoryPassButton";
import { FenceHubView } from "@/components/FenceHubView";
import { IdeaPoolPanel } from "@/components/IdeaPoolPanel";
import { SitesHub } from "@/components/SitesHub";
import { StudioPlacard } from "@/components/StudioPlacard";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE } from "@/lib/cms-cookie";
import { HUB } from "@/lib/data";
import { previewRobots } from "@/lib/preview-seo";
import { getRequestSite } from "@/lib/request-site";

export const dynamic = "force-dynamic";

async function isCmsLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(CMS_COOKIE_NAME)?.value === CMS_COOKIE_VALUE;
}

export async function generateMetadata(): Promise<Metadata> {
  const { tenant, siteUrl, isStudioPreview } = await getRequestSite();
  if (tenant.siteId === "towing-dallas") {
    const canonical = `${siteUrl}/tx/dallas/towing/`;
    return {
      title: "Towing companies in Dallas",
      description:
        "Local towing companies in Dallas and nearby suburbs.",
      alternates: { canonical },
      robots: previewRobots(isStudioPreview),
      openGraph: {
        url: canonical,
        title: "Towing companies in Dallas",
        description: tenant.tagline,
        type: "website",
      },
    };
  }
  if (tenant.siteId === "studio-hub") {
    const loggedIn = await isCmsLoggedIn();
    return {
      title: loggedIn
        ? "Sites hub | Big Dir Studio"
        : "Studio Sixtyfive | Big Dir",
      description: loggedIn
        ? tenant.tagline
        : "Big Dir / Studio Sixtyfive — directory factory workspace.",
      alternates: { canonical: `${siteUrl}/` },
      openGraph: {
        url: `${siteUrl}/`,
        title: loggedIn
          ? "Big Dir Studio — Sites hub"
          : "Studio Sixtyfive",
        description: loggedIn
          ? tenant.tagline
          : "Directory factory workspace placard.",
        type: "website",
      },
    };
  }
  if (tenant.siteId === "fence-charlotte") {
    return {
      title: "Fence companies in Charlotte | Charlotte Fence Companies",
      description:
        "Local fence company directory for Charlotte, Matthews, and Concord. Preview mock.",
      alternates: { canonical: `${siteUrl}/` },
      openGraph: {
        url: `${siteUrl}/`,
        title: "Fence companies in Charlotte",
        description: tenant.tagline,
        type: "website",
      },
    };
  }
  return {
    title: HUB.title,
    description: HUB.description,
  };
}

/** DFW: `/` → hub path. Fence: hub at root. Studio: placard or SitesHub. Towing: pack preview. */
export default async function HomePage() {
  const { tenant } = await getRequestSite();
  if (tenant.siteId === "towing-dallas") {
    redirect("/tx/dallas/towing/");
  }
  if (tenant.siteId === "studio-hub") {
    const loggedIn = await isCmsLoggedIn();
    if (!loggedIn) {
      return <StudioPlacard />;
    }
    return (
      <div className="mx-auto max-w-page px-4 sm:px-6 py-8 pb-12">
        <SitesHub />
        <FactoryPassButton />
        <IdeaPoolPanel />
      </div>
    );
  }
  if (tenant.siteId === "fence-charlotte") {
    return <FenceHubView />;
  }
  redirect(HUB.path);
}
