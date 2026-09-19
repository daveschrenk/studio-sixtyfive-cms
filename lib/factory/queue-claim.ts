/**
 * Queue claim/lock for next PASS niche.
 * Hardcoded first claim = towing-dallas (Dave/Chief).
 */

export type PassClaim = {
  niche_slug: "towing-dallas";
  display_name: string;
  industry: string;
  pilot_geo: string;
  siteId: string;
  status: "PASS";
};

export const NEXT_PASS_CLAIM: PassClaim = {
  niche_slug: "towing-dallas",
  display_name: "Towing Dallas",
  industry: "towing",
  pilot_geo: "Dallas",
  siteId: "towing-dallas",
  status: "PASS",
};

export type ClaimLock = {
  claimed: boolean;
  niche_slug: string;
  claimedAt: string | null;
  holder: string | null;
};

type LockState = {
  niche_slug: string;
  claimedAt: string;
  holder: string;
} | null;

let lockState: LockState = null;

export function getNextPassClaim(): PassClaim {
  return NEXT_PASS_CLAIM;
}

export function getClaimLock(): ClaimLock {
  if (!lockState) {
    return {
      claimed: false,
      niche_slug: NEXT_PASS_CLAIM.niche_slug,
      claimedAt: null,
      holder: null,
    };
  }
  return {
    claimed: true,
    niche_slug: lockState.niche_slug,
    claimedAt: lockState.claimedAt,
    holder: lockState.holder,
  };
}

export function tryClaimNextPass(
  holder = "studio-hub",
):
  | { ok: true; claim: PassClaim; lock: ClaimLock }
  | { ok: false; reason: string; claim: PassClaim; lock: ClaimLock } {
  const claim = NEXT_PASS_CLAIM;

  if (lockState) {
    // Idempotent: same niche re-claim succeeds
    if (lockState.niche_slug === claim.niche_slug) {
      return {
        ok: true,
        claim,
        lock: getClaimLock(),
      };
    }
    return {
      ok: false,
      reason: `Queue locked by ${lockState.holder} on ${lockState.niche_slug} at ${lockState.claimedAt}`,
      claim,
      lock: getClaimLock(),
    };
  }

  lockState = {
    niche_slug: claim.niche_slug,
    claimedAt: new Date().toISOString(),
    holder,
  };

  return { ok: true, claim, lock: getClaimLock() };
}
