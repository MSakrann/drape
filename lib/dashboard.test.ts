import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CreditsChip } from "@/components/credits-chip";
import { EmptyState } from "@/components/empty-state";

describe("CreditsChip", () => {
  it.each([
    ["trial", "Trial"],
    ["starter", "Starter"],
    ["pro", "Pro"],
    ["business", "Business"],
    ["agency", "Agency"],
  ] as const)("renders the %s plan label", (plan, label) => {
    const html = renderToStaticMarkup(
      createElement(CreditsChip, { credits: 20, plan }),
    );

    expect(html).toContain("20 credits");
    expect(html).toContain(label);
  });
});

describe("EmptyState", () => {
  it("links an empty dashboard to generation creation", () => {
    const html = renderToStaticMarkup(createElement(EmptyState));

    expect(html).toContain("No generations yet");
    expect(html).toContain('href="/generate"');
    expect(html).toContain("New generation");
  });
});
