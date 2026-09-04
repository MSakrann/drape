import { describe, expect, it } from "vitest";
import { fitCutout } from "./catalog-layout";

describe("fitCutout", () => {
  it("centers a square cutout in the shop canvas with 8% side padding", () => {
    const box = fitCutout(
      { width: 1080, height: 1080 },
      { width: 800, height: 800 },
      "shop",
    );
    expect(box.width).toBe(Math.round(1080 * 0.84));
    expect(box.height).toBe(box.width);
    expect(box.x).toBe(Math.round((1080 - box.width) / 2));
    expect(box.y + box.height).toBeGreaterThan(1080 * 0.9);
  });

  it("places a tall cutout in the lower third of the story canvas", () => {
    const box = fitCutout(
      { width: 1080, height: 1920 },
      { width: 600, height: 1400 },
      "story",
    );
    expect(box.y).toBeGreaterThan(1920 * 0.35);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1080);
  });
});
