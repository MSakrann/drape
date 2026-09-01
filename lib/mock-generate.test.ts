import { describe, expect, it } from "vitest";
import { SAMPLE_PATHS, mockDelayMs, pickOutputPaths, progressStages } from "./mock-generate";

describe("SAMPLE_PATHS", () => {
  it("has ten /samples/drape-N.jpg files", () => {
    expect(SAMPLE_PATHS).toHaveLength(10);
    expect(SAMPLE_PATHS[0]).toBe("/samples/drape-1.jpg");
    expect(SAMPLE_PATHS[9]).toBe("/samples/drape-10.jpg");
  });
});

describe("pickOutputPaths", () => {
  it("returns one path for studio", () => {
    expect(pickOutputPaths("studio")).toEqual([SAMPLE_PATHS[0]]);
  });
  it("uses a different sample for each single-output workflow", () => {
    const paths = ["studio", "tryon", "lifestyle", "video"].map(
      (workflow) =>
        pickOutputPaths(
          workflow as "studio" | "tryon" | "lifestyle" | "video",
        )[0],
    );
    expect(paths).toEqual(SAMPLE_PATHS.slice(0, 4));
  });
  it("returns four distinct paths for variants", () => {
    const paths = pickOutputPaths("variants");
    expect(paths).toEqual(SAMPLE_PATHS.slice(4, 8));
    expect(new Set(paths).size).toBe(4);
  });
});

describe("mockDelayMs", () => {
  it("is 8000 for video and 4000 otherwise", () => {
    expect(mockDelayMs("video")).toBe(8000);
    expect(mockDelayMs("studio")).toBe(4000);
  });
});

describe("progressStages", () => {
  it("ends with Rendering video for video", () => {
    expect(progressStages("video").at(-1)).toBe("Rendering video...");
    expect(progressStages("studio").at(-1)).toBe("Upscaling...");
  });
});
