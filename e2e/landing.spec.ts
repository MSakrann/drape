import { test, expect } from "@playwright/test";

test("landing loads hero copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Studio product photos",
  );
  await expect(
    page.getByRole("link", { name: /get started for free/i }),
  ).toBeVisible();
});
