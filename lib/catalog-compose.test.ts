import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { composeCatalogPack } from "./catalog-compose";

describe("composeCatalogPack", () => {
  it("exports shop, story, and whatsapp JPEGs at catalog sizes", async () => {
    const cutout = await sharp({
      create: {
        width: 40,
        height: 80,
        channels: 4,
        background: { r: 200, g: 40, b: 40, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const pack = await composeCatalogPack(cutout, "white");
    const shop = await sharp(pack.shop).metadata();
    const story = await sharp(pack.story).metadata();
    const whatsapp = await sharp(pack.whatsapp).metadata();
    expect(shop.width).toBe(1080);
    expect(shop.height).toBe(1080);
    expect(story.width).toBe(1080);
    expect(story.height).toBe(1920);
    expect(whatsapp.width).toBe(1080);
    expect(whatsapp.height).toBe(1080);
    expect(shop.format).toBe("jpeg");
  });
});
