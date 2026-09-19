import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  // Do NOT permanently redirect `/` here — it sticks as 308 across all hosts
  // and breaks fence-charlotte (and any future at-root tenants). Hub routing
  // is handled in middleware.ts (fence rewrite) and app/(site)/page.tsx (DFW).
  //
  // Block streaming metadata for Googlebot (+ default HTML-limited bots) so
  // <title>/canonical land in the initial HTML head for GSC (soft SEO fix).
  // Themes unchanged — only when metadata is flushed relative to </head>.
  htmlLimitedBots:
    /Googlebot|Google-InspectionTool|Mediapartners-Google|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview/i,
};

export default nextConfig;
