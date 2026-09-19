import type { Metadata } from "next";

/** Studio + ?tenant= / preview cookie: not ready to index. */
export function previewRobots(isStudioPreview: boolean): Metadata["robots"] {
  if (isStudioPreview) {
    return { index: false, follow: true };
  }
  return { index: true, follow: true };
}
