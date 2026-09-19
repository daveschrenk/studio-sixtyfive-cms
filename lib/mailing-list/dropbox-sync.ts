import { listSubscribers, toCsv } from "./store";

const DROPBOX_UPLOAD_URL = "https://content.dropboxapi.com/2/files/upload";
const DROPBOX_DIR = "/AI/BigDir/Files/mailing-lists";

function dropboxAccessToken(): string | undefined {
  const token = process.env.DROPBOX_ACCESS_TOKEN;
  return token && token.trim() ? token.trim() : undefined;
}

function csvPathFor(siteId: string): string {
  const safe = siteId.replace(/[^a-zA-Z0-9_-]/g, "") || "unknown";
  return `${DROPBOX_DIR}/${safe}.csv`;
}

/**
 * Best-effort overwrite of `/AI/BigDir/Files/mailing-lists/{siteId}.csv`.
 * Missing DROPBOX_ACCESS_TOKEN or Dropbox errors are logged and ignored.
 */
export async function syncMailingListCsvToDropbox(siteId: string): Promise<void> {
  const token = dropboxAccessToken();
  if (!token) {
    console.info(
      "[mailing-list] DROPBOX_ACCESS_TOKEN missing; skip CSV sync",
    );
    return;
  }

  const csv = toCsv(await listSubscribers(siteId));
  const path = csvPathFor(siteId);

  const res = await fetch(DROPBOX_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        path,
        mode: "overwrite",
        autorename: false,
        mute: true,
      }),
    },
    body: csv,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      "[mailing-list] dropbox upload failed",
      res.status,
      path,
      body.slice(0, 400),
    );
  }
}
