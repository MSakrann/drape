export type CatalogBackground = "white" | "grey";
export type CatalogPreset = "shop" | "story" | "whatsapp";

export const CATALOG_BACKGROUNDS: Record<CatalogBackground, string> = {
  white: "#FFFFFF",
  grey: "#E8E6E3",
};

export const CATALOG_SIZES: Record<CatalogPreset, { width: number; height: number }> = {
  shop: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  whatsapp: { width: 1080, height: 1080 },
};

export const CATALOG_OUTPUT_NAMES: Record<CatalogPreset, string> = {
  shop: "shop.jpg",
  story: "story.jpg",
  whatsapp: "whatsapp.jpg",
};

export const CATALOG_SHADOW = {
  offsetX: 0,
  offsetY: 18,
  blur: 28,
  opacity: 0.22,
};

export function catalogProgressStages(): string[] {
  return [
    "Removing background...",
    "Placing on studio...",
    "Exporting Shop, Story, WhatsApp...",
  ];
}
