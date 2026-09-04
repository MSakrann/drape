import sharp from "sharp";
import { fitCutout } from "./catalog-layout";
import {
  CATALOG_BACKGROUNDS,
  CATALOG_SHADOW,
  CATALOG_SIZES,
  type CatalogBackground,
  type CatalogPreset,
} from "./catalog-pack";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = hex.replace("#", "");
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

async function composeOne(
  cutoutPng: Buffer,
  background: CatalogBackground,
  preset: CatalogPreset,
  image: { width: number; height: number },
): Promise<Buffer> {
  const canvas = CATALOG_SIZES[preset];
  const box = fitCutout(canvas, image, preset);
  const bg = hexToRgb(CATALOG_BACKGROUNDS[background]);

  const resized = await sharp(cutoutPng)
    .resize(box.width, box.height)
    .ensureAlpha()
    .png()
    .toBuffer();

  const shadow = await sharp(resized)
    .recomb([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ])
    .linear([0, 0, 0, CATALOG_SHADOW.opacity], [0, 0, 0, 0])
    .blur(CATALOG_SHADOW.blur)
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: canvas.width,
      height: canvas.height,
      channels: 3,
      background: bg,
    },
  })
    .composite([
      {
        input: shadow,
        left: box.x + CATALOG_SHADOW.offsetX,
        top: box.y + CATALOG_SHADOW.offsetY,
        blend: "over",
      },
      {
        input: resized,
        left: box.x,
        top: box.y,
        blend: "over",
      },
    ])
    .toColorspace("srgb")
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function composeCatalogPack(
  cutoutPng: Buffer,
  background: CatalogBackground,
): Promise<{ shop: Buffer; story: Buffer; whatsapp: Buffer }> {
  const meta = await sharp(cutoutPng).metadata();
  const image = { width: meta.width ?? 0, height: meta.height ?? 0 };

  const [shop, story, whatsapp] = await Promise.all([
    composeOne(cutoutPng, background, "shop", image),
    composeOne(cutoutPng, background, "story", image),
    composeOne(cutoutPng, background, "whatsapp", image),
  ]);

  return { shop, story, whatsapp };
}
