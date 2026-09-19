import type { Metadata } from "next";
import Link from "next/link";
import { HUB } from "@/lib/data";
import { previewRobots } from "@/lib/preview-seo";
import { getRequestSite } from "@/lib/request-site";

export const dynamic = "force-dynamic";

const THANKS_PATH = "/contact/thanks/";

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl, isStudioPreview } = await getRequestSite();
  const canonical = `${siteUrl}${THANKS_PATH}`;
  return {
    title: "We got your message",
    description: "Your message was sent to the directory team.",
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: "We got your message",
      description: "Your message was sent to the directory team.",
      type: "website",
    },
    robots: isStudioPreview
      ? previewRobots(true)
      : { index: false, follow: false },
  };
}

export default async function ContactThanksPage() {
  const { tenant } = await getRequestSite();
  const hubHref =
    tenant.siteId === "towing-dallas"
      ? "/tx/dallas/towing/"
      : tenant.siteId === "fence-charlotte"
        ? "/nc/charlotte/fence-company/"
        : tenant.siteId === "studio-hub"
          ? "/"
          : HUB.path;
  const hubLabel =
    tenant.siteId === "towing-dallas"
      ? "Back to the Dallas towing directory"
      : tenant.siteId === "fence-charlotte"
        ? "Back to the Charlotte fence directory"
        : tenant.siteId === "studio-hub"
          ? "Back to Studio Sixtyfive"
          : "Back to the Dallas–Fort Worth install directory";
  return (
    <main className="mx-auto max-w-reading-page px-4 sm:px-6 py-10 sm:py-14">
      <p className="text-xs uppercase tracking-[0.18em] text-rust">
        Directory operators
      </p>
      <h1 className="font-serif text-4xl leading-[1.15] mt-2">
        We got your message
      </h1>
      <p className="mt-4 text-muted leading-relaxed">
        We received it. The directory team will get back to you at the email
        you entered. This is not a homeowner quote form.
      </p>
      <p className="mt-4 text-muted leading-relaxed">
        <Link href={hubHref} className="text-rust underline underline-offset-2">
          {hubLabel}
        </Link>
      </p>
    </main>
  );
}
