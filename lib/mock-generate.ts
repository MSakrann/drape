import type { Workflow } from "./types";

export const SAMPLE_PATHS = Array.from({ length: 10 }, (_, i) => `/samples/drape-${i + 1}.jpg`);

export function pickOutputPaths(workflow: Workflow): string[] {
  const count = workflow === "variants" ? 4 : 1;
  return SAMPLE_PATHS.slice(0, count);
}

export function mockDelayMs(workflow: Workflow): number {
  return workflow === "video" ? 8000 : 4000;
}

export function progressStages(workflow: Workflow): string[] {
  const last = workflow === "video" ? "Rendering video..." : "Upscaling...";
  return ["Removing background...", "Generating image...", last];
}
