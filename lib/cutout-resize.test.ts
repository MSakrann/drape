import { describe, expect, it } from "vitest";

import { CUTOUT_MAX_EDGE, cutoutTargetSize } from "./cutout-resize";

describe("cutoutTargetSize", () => {
  it("keeps dimensions at or under the max edge", () => {
    expect(cutoutTargetSize(800, 600)).toEqual({ width: 800, height: 600 });
    expect(cutoutTargetSize(CUTOUT_MAX_EDGE, 400)).toEqual({
      width: CUTOUT_MAX_EDGE,
      height: 400,
    });
  });

  it("scales so the longest edge is CUTOUT_MAX_EDGE", () => {
    expect(cutoutTargetSize(2400, 1800)).toEqual({ width: 1200, height: 900 });
    expect(cutoutTargetSize(900, 3600)).toEqual({ width: 300, height: 1200 });
  });
});
