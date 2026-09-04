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

  const pad = 3 * CATALOG_SHADOW.blur + Math.abs(CATALOG_SHADOW.offsetY);
  const shadowWidth = box.width + pad * 2;
  const shadowHeight = box.height + pad * 2;

  const shadow = await sharp(resized)
    .recomb([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ])
    .linear([0, 0, 0, CATALOG_SHADOW.opacity], [0, 0, 0, 0])
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .blur(CATALOG_SHADOW.blur)
    .png()
    .toBuffer();

  const placed = cropOverlayToCanvas(
    {
      width: shadowWidth,
      height: shadowHeight,
      left: box.x + CATALOG_SHADOW.offsetX - pad,
      top: box.y + CATALOG_SHADOW.offsetY - pad,
    },
    canvas,
  );

  const layers: {
    input: Buffer;
    left: number;
    top: number;
    blend: "over";
  }[] = [];
  if (placed) {
    layers.push({
      input: await sharp(shadow)
        .extract({
          left: placed.extractLeft,
          top: placed.extractTop,
          width: placed.width,
          height: placed.height,
        })
        .png()
        .toBuffer(),
      left: placed.left,
      top: placed.top,
      blend: "over",
    });
  }
  layers.push({
    input: resized,
    left: box.x,
    top: box.y,
    blend: "over",
  });

  return sharp({
    create: {
      width: canvas.width,
      height: canvas.height,
      channels: 3,
      background: bg,
    },
  })
    .composite(layers)
    .toColorspace("srgb")
    .jpeg({ quality: 90 })
    .toBuffer();
}

function cropOverlayToCanvas(
  overlay: { width: number; height: number; left: number; top: number },
  canvas: { width: number; height: number },
): {
  extractLeft: number;
  extractTop: number;
  width: number;
  height: number;
  left: number;
  top: number;
} | null {
  let extractLeft = 0;
  let extractTop = 0;
  let width = overlay.width;
  let height = overlay.height;
  let left = overlay.left;
  let top = overlay.top;

  if (left < 0) {
    extractLeft = -left;
    width -= extractLeft;
    left = 0;
  }
  if (top < 0) {
    extractTop = -top;
    height -= extractTop;
    top = 0;
  }
  if (left + width > canvas.width) {
    width = canvas.width - left;
  }
  if (top + height > canvas.height) {
    height = canvas.height - top;
  }
  if (width <= 0 || height <= 0) {
    return null;
  }

  return { extractLeft, extractTop, width, height, left, top };
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
