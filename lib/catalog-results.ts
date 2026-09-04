import { CATALOG_SIZES, type CatalogPreset } from "./catalog-pack";
import type { Workflow } from "./types";

const CATALOG_PRESET_ORDER: CatalogPreset[] = ["shop", "story", "whatsapp"];

const CATALOG_SLOT_DISPLAY_NAMES: Record<CatalogPreset, string> = {
  shop: "Shop",
  story: "Story",
  whatsapp: "WhatsApp",
};

export function catalogSlotLabel(index: number, workflow: Workflow): string {
  if (workflow === "studio" && index < CATALOG_PRESET_ORDER.length) {
    const preset = CATALOG_PRESET_ORDER[index];
    const { width, height } = CATALOG_SIZES[preset];
    return `${CATALOG_SLOT_DISPLAY_NAMES[preset]} (${width}×${height})`;
  }

  return `Output ${index + 1}`;
}
