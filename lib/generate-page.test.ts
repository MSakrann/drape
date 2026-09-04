import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GenerationProgress } from "@/components/generation-progress";
import { InsufficientCreditsModal } from "@/components/insufficient-credits-modal";
import {
  WORKFLOW_OPTIONS,
  WORKFLOW_TABS,
  validateUpload,
} from "@/lib/generate-page";

describe("generate workflow options", () => {
  it("uses the exact workflow tab labels", () => {
    expect(WORKFLOW_TABS.map((tab) => tab.label)).toEqual(["Catalog pack"]);
  });

  it("provides all required choices", () => {
    expect(WORKFLOW_OPTIONS.studio).toEqual(["white", "grey"]);
  });
});

describe("validateUpload", () => {
  it("accepts an image no larger than 10MB", () => {
    expect(validateUpload({ type: "image/png", size: 10 * 1024 * 1024 })).toBeNull();
  });

  it.each([
    { type: "text/plain", size: 100 },
    { type: "image/jpeg", size: 10 * 1024 * 1024 + 1 },
  ])("rejects an invalid upload", (file) => {
    expect(validateUpload(file)).toBe("Use a JPEG or PNG up to 10MB.");
  });
});

describe("InsufficientCreditsModal", () => {
  it("shows the balance, cost, and pricing link when open", () => {
    const html = renderToStaticMarkup(
      createElement(InsufficientCreditsModal, {
        open: true,
        balance: 3,
        cost: 10,
        onClose: () => {},
      }),
    );

    expect(html).toContain("Not enough credits.");
    expect(html).toContain("You have 3. This job costs 10.");
    expect(html).toContain('href="/pricing"');
  });

  it("renders nothing when closed", () => {
    expect(
      renderToStaticMarkup(
        createElement(InsufficientCreditsModal, {
          open: false,
          balance: 3,
          cost: 10,
          onClose: () => {},
        }),
      ),
    ).toBe("");
  });
});

describe("GenerationProgress", () => {
  it("marks and displays the current stage", () => {
    const html = renderToStaticMarkup(
      createElement(GenerationProgress, {
        stages: ["Removing background...", "Generating image...", "Upscaling..."],
        activeIndex: 1,
      }),
    );

    expect(html).toContain("Generating image...");
    expect(html).toContain('aria-current="step"');
  });
});
