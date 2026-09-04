import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { composeCatalogPack } from "./catalog-compose";
import { fitCutout } from "./catalog-layout";
import { CATALOG_SHADOW, CATALOG_SIZES } from "./catalog-pack";

async function redCutoutPng(): Promise<Buffer> {
  return sharp({
    create: {
      width: 40,
      height: 80,
      channels: 4,
      background: { r: 200, g: 40, b: 40, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

describe("composeCatalogPack", () => {
  it("exports shop, story, and whatsapp JPEGs at catalog sizes", async () => {
    const pack = await composeCatalogPack(await redCutoutPng(), "white");
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

  it("casts a drop shadow onto the studio below the cutout", async () => {
    const pack = await composeCatalogPack(await redCutoutPng(), "white");
    const box = fitCutout(CATALOG_SIZES.shop, { width: 40, height: 80 }, "shop");
    const { data, info } = await sharp(pack.shop)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const luma = (x: number, y: number) => {
      const i = (y * info.width + x) * info.channels;
      return data[i]! + data[i + 1]! + data[i + 2]!;
    };

    const x = box.x + Math.floor(box.width / 2);
    const y = box.y + box.height + CATALOG_SHADOW.offsetY + 8;
    expect(luma(x, y)).toBeLessThan(luma(0, 0));
  });
});
