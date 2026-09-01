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
    expect(pickOutputPaths("studio")).toHaveLength(1);
    expect(SAMPLE_PATHS).toContain(pickOutputPaths("studio")[0]);
  });
  it("returns four distinct paths for variants", () => {
    const paths = pickOutputPaths("variants");
    expect(paths).toHaveLength(4);
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
