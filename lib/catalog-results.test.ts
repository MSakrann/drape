import { describe, expect, it } from "vitest";

import { catalogDownloadHref, catalogSlotLabel } from "./catalog-results";

describe("catalogSlotLabel", () => {
  it("labels studio catalog outputs with preset names and sizes", () => {
    expect(catalogSlotLabel(0, "studio")).toBe("Shop (1080×1080)");
    expect(catalogSlotLabel(1, "studio")).toBe("Story (1080×1920)");
    expect(catalogSlotLabel(2, "studio")).toBe("WhatsApp (1080×1080)");
  });

  it("labels non-studio workflows with generic output numbers", () => {
    expect(catalogSlotLabel(0, "tryon")).toBe("Output 1");
  });
});

describe("catalogDownloadHref", () => {
  it("appends the catalog output filename as a download query", () => {
    const src =
      "https://proj.supabase.co/storage/v1/object/public/catalog/u1/job/shop.jpg";
    expect(catalogDownloadHref(src, 0, "studio")).toBe(`${src}?download=shop.jpg`);
    expect(catalogDownloadHref(src, 1, "studio")).toContain("download=story.jpg");
    expect(catalogDownloadHref(src, 2, "studio")).toContain(
      "download=whatsapp.jpg",
    );
  });

  it("uses a generic filename for non-studio slots", () => {
    expect(
      catalogDownloadHref("https://cdn.example/out.png", 0, "tryon"),
    ).toBe("https://cdn.example/out.png?download=output-1.jpg");
  });
});
