export const CUTOUT_MAX_EDGE = 1200;

export function cutoutTargetSize(
  width: number,
  height: number,
  maxEdge = CUTOUT_MAX_EDGE,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    return { width, height };
  }

  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function downscaleCutout(
  blob: Blob,
  maxEdge = CUTOUT_MAX_EDGE,
): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const { width, height } = cutoutTargetSize(
    bitmap.width,
    bitmap.height,
    maxEdge,
  );

  if (width === bitmap.width && height === bitmap.height) {
    bitmap.close();
    return blob;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("canvas");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const png = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!png) {
    throw new Error("toBlob");
  }

  return png;
}
