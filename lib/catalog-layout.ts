import type { CatalogPreset } from "./catalog-pack";

const SIDE_PAD = 0.08;

export function fitCutout(
  canvas: { width: number; height: number },
  image: { width: number; height: number },
  preset: CatalogPreset,
): { x: number; y: number; width: number; height: number } {
  const maxW = canvas.width * (1 - SIDE_PAD * 2);
  const maxH =
    preset === "story"
      ? canvas.height * 0.58
      : canvas.height * (1 - SIDE_PAD * 2);
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const x = Math.round((canvas.width - width) / 2);
  const bottomPad = canvas.height * 0.06;
  const y = Math.round(canvas.height - bottomPad - height);
  return { x, y, width, height };
}
