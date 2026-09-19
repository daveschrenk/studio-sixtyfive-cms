import { del, list, put } from "@vercel/blob";
import type { MailingListFile, MailingSubscriber } from "./types";

function pathnameFor(siteId: string) {
  return `mailing-list/${siteId}.json`;
}

function tokenOrThrow() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing");
  return token;
}

async function readFile(siteId: string): Promise<MailingListFile> {
  const empty: MailingListFile = {
    siteId,
    updatedAt: new Date().toISOString(),
    subscribers: [],
  };
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return empty;

  const listed = await list({ prefix: pathnameFor(siteId), limit: 10, token });
  const hit = listed.blobs.find((b) => b.pathname === pathnameFor(siteId));
  if (!hit) return empty;

  const res = await fetch(hit.url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[mailing-list] blob fetch failed", res.status);
    return empty;
  }
  const data = (await res.json()) as MailingListFile;
  if (!data || !Array.isArray(data.subscribers)) return empty;
  return {
    siteId,
    updatedAt: data.updatedAt || empty.updatedAt,
    subscribers: data.subscribers,
  };
}

async function writeFile(file: MailingListFile): Promise<void> {
  const token = tokenOrThrow();
  const pathname = pathnameFor(file.siteId);
  // Delete-first so updates always land (overwrite has been flaky in practice)
  try {
    await del(pathname, { token });
  } catch (err) {
    console.warn("[mailing-list] blob del skip", err);
  }
  await put(pathname, JSON.stringify(file, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
}

export async function listSubscribers(
  siteId: string,
): Promise<MailingSubscriber[]> {
  const file = await readFile(siteId);
  return [...file.subscribers].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function addSubscriber(
  siteId: string,
  email: string,
  name: string,
): Promise<{ ok: true; created: boolean } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@") || !normalized.includes(".")) {
    return { ok: false, error: "Enter a valid email." };
  }
  const file = await readFile(siteId);
  if (file.subscribers.some((s) => s.email === normalized)) {
    return { ok: true, created: false };
  }
  file.subscribers.push({
    email: normalized,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  });
  file.updatedAt = new Date().toISOString();
  await writeFile(file);
  try {
    const { syncMailingListCsvToDropbox } = await import("./dropbox-sync");
    await syncMailingListCsvToDropbox(siteId);
  } catch (err) {
    console.error("[mailing-list] dropbox sync failed", err);
  }
  return { ok: true, created: true };
}

export function toCsv(subscribers: MailingSubscriber[]): string {
  const header = "email,name,createdAt";
  const rows = subscribers.map((s) =>
    [s.email, s.name, s.createdAt]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}
