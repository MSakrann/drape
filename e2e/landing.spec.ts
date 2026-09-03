import { test, expect } from "@playwright/test";

test("landing loads Drape hero copy", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Drape");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Bold ideas",
    { timeout: 15_000 },
  );
  await expect(
    page.getByRole("link", { name: /start a project/i }).first(),
  ).toBeVisible();
});
