import { describe, expect, it } from "vitest";
import {
  CATALOG_BACKGROUNDS,
  CATALOG_OUTPUT_NAMES,
  CATALOG_SIZES,
  catalogProgressStages,
} from "./catalog-pack";

describe("catalog pack tokens", () => {
  it("uses white and grey hex and three named outputs", () => {
    expect(CATALOG_BACKGROUNDS.white).toBe("#FFFFFF");
    expect(CATALOG_BACKGROUNDS.grey).toBe("#E8E6E3");
    expect(CATALOG_SIZES.shop).toEqual({ width: 1080, height: 1080 });
    expect(CATALOG_SIZES.story).toEqual({ width: 1080, height: 1920 });
    expect(CATALOG_SIZES.whatsapp).toEqual({ width: 1080, height: 1080 });
    expect(CATALOG_OUTPUT_NAMES).toEqual({
      shop: "shop.jpg",
      story: "story.jpg",
      whatsapp: "whatsapp.jpg",
    });
  });

  it("lists three catalog progress stages", () => {
    expect(catalogProgressStages()).toEqual([
      "Removing background...",
      "Placing on studio...",
      "Exporting Shop, Story, WhatsApp...",
    ]);
  });
});
