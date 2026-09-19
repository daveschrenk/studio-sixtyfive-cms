import { createSign } from "crypto";
import { unstable_cache } from "next/cache";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_CONSOLE_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";
const SEARCH_ANALYTICS_URL =
  "https://searchconsole.googleapis.com/webmasters/v3/sites";
const WINDOW_DAYS = 28;
const DATA_LAG_DAYS = 3;

export type GscDailyMetrics = {
  clicksPerDay: number;
  impressionsPerDay: number;
  startDate: string;
  endDate: string;
};

type ServiceAccountCredentials = {
  email: string;
  privateKey: string;
};

type SearchAnalyticsResponse = {
  rows?: Array<{ clicks?: number; impressions?: number }>;
};

type SearchTotals = {
  clicks: number;
  impressions: number;
};

function base64Url(value: string | Buffer): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function serviceAccountCredentials(): ServiceAccountCredentials | null {
  const email = process.env.GSC_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!email || !privateKey) return null;
  return { email, privateKey };
}

function dateWindow(): { startDate: string; endDate: string } {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - DATA_LAG_DAYS);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (WINDOW_DAYS - 1));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function accessToken(
  credentials: ServiceAccountCredentials,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: credentials.email,
      scope: SEARCH_CONSOLE_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsignedToken = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion = `${unsignedToken}.${base64Url(
    signer.sign(credentials.privateKey),
  )}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Google OAuth failed (${response.status})`);
  }

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("Google OAuth returned no token");
  return body.access_token;
}

async function fetchDailyMetrics(
  property: string,
): Promise<GscDailyMetrics | null> {
  const credentials = serviceAccountCredentials();
  if (!credentials) return null;

  const { startDate, endDate } = dateWindow();
  const token = await accessToken(credentials);
  const response = await fetch(
    `${SEARCH_ANALYTICS_URL}/${encodeURIComponent(property)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["date"],
        rowLimit: WINDOW_DAYS,
        dataState: "final",
      }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(`Search Console query failed (${response.status})`);
  }

  const body = (await response.json()) as SearchAnalyticsResponse;
  const totals = (body.rows ?? []).reduce<SearchTotals>(
    (sum, row) => ({
      clicks: sum.clicks + (row.clicks ?? 0),
      impressions: sum.impressions + (row.impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );

  return {
    clicksPerDay: totals.clicks / WINDOW_DAYS,
    impressionsPerDay: totals.impressions / WINDOW_DAYS,
    startDate,
    endDate,
  };
}

const cachedDailyMetrics = unstable_cache(fetchDailyMetrics, ["gsc-daily-v1"], {
  revalidate: 3600,
  tags: ["gsc-daily"],
});

export async function getGscDailyMetrics(
  property: string,
): Promise<GscDailyMetrics | null> {
  try {
    return await cachedDailyMetrics(property);
  } catch (error) {
    console.error("Unable to load Search Console metrics", {
      property,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}
