import type { HubIdea } from "@/lib/idea-pool";

export type FillPoolProposal = HubIdea & {
  fill_run_id?: string;
  proposed?: true;
};

export type FillPoolRunResult = {
  runId: string;
  status: "done" | "error";
  proposals: FillPoolProposal[];
  summary: string;
  error?: string;
};
