import path from "node:path";

import { test, expect, type Page } from "@playwright/test";

const garmentPath = path.join(process.cwd(), "public/samples/drape-1.jpg");

async function signUp(page: Page) {
  const email = `drape-${Date.now()}@example.com`;

  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password8");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

async function openCatalogGenerator(page: Page) {
  await page.getByRole("link", { name: "New generation" }).first().click();
  await expect(page).toHaveURL(/\/generate$/);
  await expect(page.getByText(/catalog pack/i).first()).toBeVisible();
}

async function chooseGarment(page: Page) {
  await page.locator('input[type="file"]').setInputFiles(garmentPath);
}

test("signs up and generates a catalog pack", async ({ page }) => {
  test.setTimeout(60_000);
  await signUp(page);
  await openCatalogGenerator(page);
  await chooseGarment(page);

  const generatePosted = page.waitForRequest(
    (request) =>
      request.url().includes("/api/generate") && request.method() === "POST",
    { timeout: 60_000 },
  );

  await page.getByRole("button", { name: /Generate · 1 credits/i }).click();
  await generatePosted;

  await expect(page).toHaveURL(/\/results\//, { timeout: 60_000 });
  await expect(page.getByRole("heading", { name: /catalog pack/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /Shop/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /Story/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /WhatsApp/i })).toBeVisible();
});

test("shows the insufficient credits modal on a 402", async ({ page }) => {
  test.setTimeout(60_000);
  await signUp(page);
  await openCatalogGenerator(page);
  await chooseGarment(page);

  await page.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 402,
      contentType: "application/json",
      body: JSON.stringify({ message: "Not enough credits." }),
    });
  });

  await page.getByRole("button", { name: /Generate · 1 credits/i }).click();
  await expect(page.getByText("Not enough credits.")).toBeVisible({
    timeout: 60_000,
  });
});
