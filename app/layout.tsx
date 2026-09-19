import type { Metadata } from "next";
import "./globals.css";
import { previewRobots } from "@/lib/preview-seo";
import { getRequestSite } from "@/lib/request-site";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DEFAULT_THEME_ID } from "@/lib/themes";

export async function generateMetadata(): Promise<Metadata> {
  const { siteUrl, tenant, isStudioPreview } = await getRequestSite();
  const defaultTitle = `${tenant.name} — ${tenant.keyword}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: defaultTitle, template: `%s | ${tenant.name}` },
    description: tenant.tagline,
    robots: previewRobots(isStudioPreview),
    openGraph: {
      title: defaultTitle,
      description: tenant.tagline,
      locale: "en_US",
      siteName: tenant.name,
      type: "website",
    },
    twitter: { card: "summary" },
  };
}

const themeBootScript = `(function(){try{var p=location.pathname;if(p==='/admin'||p.indexOf('/admin/')===0){document.documentElement.setAttribute('data-theme','admin-cms');return;}var k='dfw-cms-theme';var id=localStorage.getItem(k);document.documentElement.setAttribute('data-theme',id||'${DEFAULT_THEME_ID}');}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME_ID}');}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { tenant } = await getRequestSite();
  const defaultThemeId = tenant.defaultThemeId ?? DEFAULT_THEME_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-paper text-ink min-h-screen flex flex-col">
        <ThemeProvider defaultThemeId={defaultThemeId}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
