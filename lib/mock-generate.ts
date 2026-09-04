import { catalogProgressStages } from "./catalog-pack";
import type { Workflow } from "./types";

export const SAMPLE_PATHS = Array.from({ length: 10 }, (_, i) => `/samples/drape-${i + 1}.jpg`);

export function pickOutputPaths(workflow: Workflow): string[] {
  const ranges: Record<Workflow, [start: number, count: number]> = {
    studio: [0, 1],
    tryon: [1, 1],
    lifestyle: [2, 1],
    video: [3, 1],
    variants: [4, 4],
  };
  const [start, count] = ranges[workflow];
  return SAMPLE_PATHS.slice(start, start + count);
}

export function mockDelayMs(workflow: Workflow): number {
  return workflow === "video" ? 8000 : 4000;
}

export function progressStages(workflow: Workflow): string[] {
  if (workflow === "studio") {
    return catalogProgressStages();
  }
  const last = workflow === "video" ? "Rendering video..." : "Upscaling...";
  return ["Removing background...", "Generating image...", last];
}
