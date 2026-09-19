import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("Usage: node scripts/check-gsc-access.mjs /path/to/key.json");
  process.exit(1);
}

const credentials = JSON.parse(await readFile(keyPath, "utf8"));
const properties = [
  "sc-domain:dfwgaragedoorinstallers.com",
  "sc-domain:charlottefencecompanies.com",
  "sc-domain:dallastowingcompanies.com",
];

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const now = Math.floor(Date.now() / 1000);
const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
const claim = base64Url(
  JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }),
);
const unsignedToken = `${header}.${claim}`;
const signer = createSign("RSA-SHA256");
signer.update(unsignedToken);
signer.end();
const assertion = `${unsignedToken}.${base64Url(
  signer.sign(credentials.private_key),
)}`;

const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  }),
});

if (!tokenResponse.ok) {
  console.error(`OAuth failed (${tokenResponse.status})`);
  process.exit(1);
}

const { access_token: accessToken } = await tokenResponse.json();
const end = new Date();
end.setUTCDate(end.getUTCDate() - 3);
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - 27);
const date = (value) => value.toISOString().slice(0, 10);

let failed = false;
for (const property of properties) {
  const response = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        startDate: date(start),
        endDate: date(end),
        dimensions: ["date"],
        rowLimit: 28,
        dataState: "final",
      }),
    },
  );

  if (!response.ok) {
    failed = true;
    console.log(`${property}: denied (${response.status})`);
    continue;
  }

  const body = await response.json();
  const totals = (body.rows ?? []).reduce(
    (sum, row) => ({
      clicks: sum.clicks + (row.clicks ?? 0),
      impressions: sum.impressions + (row.impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );
  console.log(
    `${property}: access confirmed (${(totals.clicks / 28).toFixed(1)} clicks/day, ${(totals.impressions / 28).toFixed(1)} impressions/day)`,
  );
}

if (failed) process.exit(2);
