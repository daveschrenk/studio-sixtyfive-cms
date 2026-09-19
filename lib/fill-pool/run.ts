import { randomUUID } from "crypto";
import { generateCandidates } from "./generate-candidates";
import { candidateToIdea } from "./gates";
import type { FillPoolRunResult } from "./types";

export function runFillPool(maxCandidates = 3): FillPoolRunResult {
  const runId = randomUUID();
  const max = Math.min(Math.max(1, maxCandidates || 3), 5);
  const raw = generateCandidates(max);
  const proposals = raw.map((c) => ({
    ...candidateToIdea(c),
    fill_run_id: runId,
    proposed: true as const,
  }));

  const hold = proposals.filter((p) => p.status === "HOLD").length;
  const fail = proposals.filter((p) => p.status === "FAIL").length;

  return {
    runId,
    status: "done",
    proposals,
    summary: `+${hold} HOLD · ${fail} FAIL · 0 PASS (never auto-PASS)`,
  };
}
