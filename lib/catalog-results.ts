import {
  CATALOG_OUTPUT_NAMES,
  CATALOG_SIZES,
  type CatalogPreset,
} from "./catalog-pack";
import type { Workflow } from "./types";

const CATALOG_PRESET_ORDER = Object.keys(
  CATALOG_OUTPUT_NAMES,
) as CatalogPreset[];

const CATALOG_SLOT_DISPLAY_NAMES: Record<CatalogPreset, string> = {
  shop: "Shop",
  story: "Story",
  whatsapp: "WhatsApp",
};

function catalogOutputFileName(index: number, workflow: Workflow): string {
  if (workflow === "studio" && index < CATALOG_PRESET_ORDER.length) {
    return CATALOG_OUTPUT_NAMES[CATALOG_PRESET_ORDER[index]];
  }

  return `output-${index + 1}.jpg`;
}

export function catalogSlotLabel(index: number, workflow: Workflow): string {
  if (workflow === "studio" && index < CATALOG_PRESET_ORDER.length) {
    const preset = CATALOG_PRESET_ORDER[index];
    const { width, height } = CATALOG_SIZES[preset];
    return `${CATALOG_SLOT_DISPLAY_NAMES[preset]} (${width}×${height})`;
  }

  return `Output ${index + 1}`;
}

export function catalogDownloadHref(
  src: string,
  index: number,
  workflow: Workflow,
): string {
  const filename = catalogOutputFileName(index, workflow);
  try {
    const url = new URL(src);
    url.searchParams.set("download", filename);
    return url.toString();
  } catch {
    const join = src.includes("?") ? "&" : "?";
    return `${src}${join}download=${encodeURIComponent(filename)}`;
  }
}
