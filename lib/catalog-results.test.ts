import { describe, expect, it } from "vitest";

import { catalogSlotLabel } from "./catalog-results";

describe("catalogSlotLabel", () => {
  it("labels studio catalog outputs with preset names and sizes", () => {
    expect(catalogSlotLabel(0, "studio")).toBe("Shop (1080×1080)");
    expect(catalogSlotLabel(1, "studio")).toBe("Story (1080×1920)");
    expect(catalogSlotLabel(2, "studio")).toBe("WhatsApp (1080×1080)");
  });

  it("labels non-studio workflows with generic output numbers", () => {
    expect(catalogSlotLabel(0, "tryon")).toBe("Output 1");
  });
});
