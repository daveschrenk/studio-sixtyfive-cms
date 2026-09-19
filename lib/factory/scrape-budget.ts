/**
 * Paid scrape budget + kill switch.
 * Dave/Chief lock: $25/run cap + kill switch required BEFORE any paid scrape path.
 *
 * Env:
 *   SCRAPE_BUDGET_CENTS=2500  (preferred)
 *   SCRAPE_MAX_USD=25         (fallback if cents unset)
 *   SCRAPE_KILL_SWITCH=true|false  (default true = blocked)
 */

const DEFAULT_BUDGET_CENTS = 2500;

function parseTruthy(raw: string | undefined): boolean | null {
  if (raw === undefined || raw === "") return null;
  const v = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return null;
}

export function getScrapeBudgetCents(): number {
  const centsRaw = process.env.SCRAPE_BUDGET_CENTS;
  if (centsRaw !== undefined && centsRaw !== "") {
    const n = Number(centsRaw);
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  }
  const usdRaw = process.env.SCRAPE_MAX_USD;
  if (usdRaw !== undefined && usdRaw !== "") {
    const n = Number(usdRaw);
    if (Number.isFinite(n) && n >= 0) return Math.floor(n * 100);
  }
  return DEFAULT_BUDGET_CENTS;
}

export function getScrapeBudgetUsd(): number {
  return getScrapeBudgetCents() / 100;
}

/** Kill switch ON (default) blocks all paid scrape. Set SCRAPE_KILL_SWITCH=false to arm. */
export function isScrapeKillSwitchOn(): boolean {
  const parsed = parseTruthy(process.env.SCRAPE_KILL_SWITCH);
  if (parsed === null) return true; // safe default
  return parsed;
}

export type ScrapeGateResult =
  | { ok: true; budgetCents: number; killSwitch: boolean }
  | {
      ok: false;
      reason: string;
      killSwitch: boolean;
      budgetCents: number;
    };

/**
 * Gate every paid scrape path. Fail closed on kill switch or over-budget estimate.
 */
export function assertPaidScrapeAllowed(
  estimatedCostCents?: number,
): ScrapeGateResult {
  const budgetCents = getScrapeBudgetCents();
  const killSwitch = isScrapeKillSwitchOn();

  if (killSwitch) {
    return {
      ok: false,
      reason:
        "SCRAPE_KILL_SWITCH is on — paid scrape blocked until explicitly disarmed (SCRAPE_KILL_SWITCH=false).",
      killSwitch,
      budgetCents,
    };
  }

  if (budgetCents <= 0) {
    return {
      ok: false,
      reason: "Scrape budget is $0 — paid scrape blocked.",
      killSwitch,
      budgetCents,
    };
  }

  if (
    typeof estimatedCostCents === "number" &&
    Number.isFinite(estimatedCostCents) &&
    estimatedCostCents > budgetCents
  ) {
    return {
      ok: false,
      reason: `Estimated cost ${estimatedCostCents}¢ exceeds budget ${budgetCents}¢ ($${getScrapeBudgetUsd()}/run cap).`,
      killSwitch,
      budgetCents,
    };
  }

  return { ok: true, budgetCents, killSwitch };
}

export function scrapeGateSnapshot() {
  return {
    budgetCents: getScrapeBudgetCents(),
    budgetUsd: getScrapeBudgetUsd(),
    killSwitch: isScrapeKillSwitchOn(),
  };
}
