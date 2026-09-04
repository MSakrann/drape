import { describe, expect, it } from "vitest";

import { assertImageBlob } from "./remove-background";
import { MAX_UPLOAD_BYTES, UPLOAD_ERROR } from "./generate-page";

describe("assertImageBlob", () => {
  it("accepts an image no larger than 10MB", () => {
    expect(assertImageBlob({ type: "image/png", size: MAX_UPLOAD_BYTES })).toBeNull();
  });

  it.each([
    { type: "text/plain", size: 100 },
    { type: "image/jpeg", size: MAX_UPLOAD_BYTES + 1 },
  ])("rejects an invalid image blob", (file) => {
    expect(assertImageBlob(file)).toBe(UPLOAD_ERROR);
  });
});
