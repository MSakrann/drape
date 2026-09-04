import { validateUpload } from "./generate-page";

export function assertImageBlob(file: { type: string; size: number }) {
  return validateUpload(file);
}

export async function removeBackground(file: Blob): Promise<Blob> {
  const { removeBackground: imglyRemove } = await import("@imgly/background-removal");
  return imglyRemove(file);
}
