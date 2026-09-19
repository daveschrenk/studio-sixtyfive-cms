import fs from "fs";
import path from "path";
import type { SiteHubRow } from "@/lib/sites-hub";
export { FACTORY_STUBS_STORAGE_KEY } from "@/lib/factory/constants";

const STUBS_PATH = path.join(process.cwd(), "data", "factory-stubs.json");

type StubFile = {
  updatedAt: string | null;
  stubs: SiteHubRow[];
};

function readFile(): StubFile {
  try {
    if (!fs.existsSync(STUBS_PATH)) {
      return { updatedAt: null, stubs: [] };
    }
    const parsed = JSON.parse(fs.readFileSync(STUBS_PATH, "utf8")) as StubFile;
    return {
      updatedAt: parsed.updatedAt ?? null,
      stubs: Array.isArray(parsed.stubs) ? parsed.stubs : [],
    };
  } catch {
    return { updatedAt: null, stubs: [] };
  }
}

/** Read stubs produced by factory button click-through only. */
export function getFactoryStubs(): SiteHubRow[] {
  return readFile().stubs;
}

/**
 * Upsert a stub — called only from factory preview scaffold (button flow).
 * Best-effort disk write (may no-op on read-only serverless); client also persists.
 */
export function upsertFactoryStub(stub: SiteHubRow): SiteHubRow[] {
  const current = readFile();
  const next = current.stubs.filter((s) => s.siteId !== stub.siteId);
  next.push(stub);
  const payload: StubFile = {
    updatedAt: new Date().toISOString(),
    stubs: next,
  };
  try {
    fs.mkdirSync(path.dirname(STUBS_PATH), { recursive: true });
    fs.writeFileSync(STUBS_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  } catch {
    // Vercel serverless FS may be read-only — client localStorage is source of truth in UI
  }
  return next;
}
