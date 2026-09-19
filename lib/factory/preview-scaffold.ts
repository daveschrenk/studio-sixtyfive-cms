import {
  assertPaidScrapeAllowed,
  getScrapeBudgetCents,
  isScrapeKillSwitchOn,
} from "@/lib/factory/scrape-budget";
import {
  getNextPassClaim,
  tryClaimNextPass,
  type PassClaim,
} from "@/lib/factory/queue-claim";
import {
  getTowingDallasPackStatus,
  type PackStatus,
} from "@/lib/factory/pack-status";
import { upsertFactoryStub } from "@/lib/factory/stub-registry";
import type { SiteHubRow } from "@/lib/sites-hub";

export type FactoryPreviewResult = {
  claim: {
    niche_slug: string;
    display_name: string;
    siteId: string;
    locked: boolean;
    claimedAt: string | null;
    holder: string | null;
  };
  pack: PackStatus;
  mode: "thin-stub" | "pack-preview";
  scrape: {
    attempted: false;
    blockedBy: string;
    budgetCents: number;
    killSwitch: boolean;
  };
  sitesHubStub: SiteHubRow;
  previewUrl: string;
  notes: string[];
};

function stubFromClaim(claim: PassClaim): SiteHubRow {
  return {
    siteId: claim.siteId,
    name: claim.display_name,
    apex: "https://towingdallas.example",
    adminPath: "/admin/",
    themeId: "slate-amber",
    gscNote: null,
    adsense: "parked",
    status: "stub",
  };
}

/**
 * Button click-through step: claim lock + hub stub scaffold.
 * Never mutates TENANTS.ts. Never fires paid scrape.
 * Stub registry write is the ONLY persistence for towing-dallas this pass.
 */
export function runFactoryPreview(): FactoryPreviewResult {
  const notes: string[] = [];
  const gate = assertPaidScrapeAllowed();
  const budgetCents = getScrapeBudgetCents();
  const killSwitch = isScrapeKillSwitchOn();

  const claimResult = tryClaimNextPass("studio-hub");
  const claim = claimResult.ok ? claimResult.claim : getNextPassClaim();
  const lock = claimResult.lock;

  if (claimResult.ok) {
    notes.push(
      `Claim locked: ${claim.niche_slug} by ${lock.holder ?? "studio-hub"} at ${lock.claimedAt ?? "now"}`,
    );
  } else {
    notes.push(claimResult.reason);
  }

  const pack = getTowingDallasPackStatus();
  notes.push(pack.message);
  // Factory gate: preview not Done without reviews pack (soft-hold until Dave OK).
  if (!pack.hasReviewsPack) {
    notes.push(
      "REVIEWS GATE: Laura reviews pack missing for claimed niche — do not mark Done / attach domain.",
    );
  } else {
    notes.push(
      `REVIEWS GATE: ${pack.reviewCount} reviews present for ${pack.niche_slug} (bundled or sidecar).`,
    );
  }

  const mode: FactoryPreviewResult["mode"] = pack.thin
    ? "thin-stub"
    : "pack-preview";

  const blockedBy = !gate.ok
    ? gate.reason
    : "Preview path does not run paid scrape — Laura pack / explicit scrape runner required.";

  const sitesHubStub = stubFromClaim(claim);
  // Persist ONLY via this button-flow function
  upsertFactoryStub(sitesHubStub);
  notes.push(
    "Hub stub written via factory button flow (data/factory-stubs.json). TENANTS untouched.",
  );
  notes.push(`Paid scrape blocked: ${blockedBy}`);

  const previewUrl = "https://studiosixtyfive.com/?tenant=towing-dallas";

  return {
    claim: {
      niche_slug: claim.niche_slug,
      display_name: claim.display_name,
      siteId: claim.siteId,
      locked: lock.claimed,
      claimedAt: lock.claimedAt,
      holder: lock.holder,
    },
    pack,
    mode,
    scrape: {
      attempted: false,
      blockedBy,
      budgetCents,
      killSwitch,
    },
    sitesHubStub,
    previewUrl,
    notes,
  };
}
