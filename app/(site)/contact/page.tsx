import type { Metadata } from "next";
import Link from "next/link";
import { HUB } from "@/lib/data";
import { ContactForm } from "@/components/ContactForm";
import { contactJsonLd, JsonLd } from "@/components/JsonLd";
import { previewRobots } from "@/lib/preview-seo";
import { getRequestSite } from "@/lib/request-site";

export const dynamic = "force-dynamic";

const CONTACT_PATH = "/contact/";

function contactCopy(siteId: string, tenantName: string) {
  if (siteId === "towing-dallas") {
    return {
      title: "Contact us — corrections and partnerships",
      description:
        "Contact Towing Dallas to correct a listing or inquire about a partnership.",
      hubHref: "/tx/dallas/towing/",
      hubLabel: "this Dallas towing directory",
    };
  }
  if (siteId === "fence-charlotte") {
    return {
      title: "Contact us — corrections and partnerships",
      description:
        "Contact Charlotte Fence Companies to correct a listing or inquire about a partnership.",
      hubHref: "/nc/charlotte/fence-company/",
      hubLabel: "this Charlotte fence directory",
    };
  }
  if (siteId === "studio-hub") {
    return {
      title: "Contact us",
      description: "Contact Studio Sixtyfive / Big Dir.",
      hubHref: "/",
      hubLabel: "Studio Sixtyfive",
    };
  }
  return {
    title: "Contact us — corrections and partnerships",
    description: `Contact ${tenantName} to correct a listing or inquire about a partnership.`,
    hubHref: HUB.path,
    hubLabel: "this Dallas–Fort Worth install directory",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl, tenant, isStudioPreview } = await getRequestSite();
  const copy = contactCopy(tenant.siteId, tenant.name);
  const canonical = `${siteUrl}${CONTACT_PATH}`;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical },
    robots: previewRobots(isStudioPreview),
    openGraph: {
      url: canonical,
      title: copy.title,
      description: copy.description,
      type: "website",
    },
  };
}

export default async function ContactPage() {
  const { siteUrl, tenant } = await getRequestSite();
  const copy = contactCopy(tenant.siteId, tenant.name);
  return (
    <main className="mx-auto max-w-reading-page px-4 sm:px-6 py-10 sm:py-14">
      <JsonLd
        data={contactJsonLd({
          siteUrl,
          siteName: tenant.name,
          pagePath: CONTACT_PATH,
          description: copy.description,
        })}
      />
      <p className="text-xs uppercase tracking-[0.18em] text-rust">
        Directory operators
      </p>
      <h1 className="font-serif text-4xl leading-[1.15] mt-2">Contact us</h1>
      <p className="mt-4 text-muted leading-relaxed">
        For companies that find themselves on{" "}
        <Link href={copy.hubHref} className="text-rust underline underline-offset-2">
          {copy.hubLabel}
        </Link>
        . Use the form to correct a listing or inquire about a partnership.
        This is not a homeowner quote form.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </main>
  );
}
