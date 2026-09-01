import { test, expect, type Page } from "@playwright/test";

async function signUp(page: Page) {
  const email = `drape-${Date.now()}@example.com`;

  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password8");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function openStudioGenerator(page: Page) {
  await page
    .getByRole("link", { name: "New generation" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/generate$/);
  await expect(page.getByRole("tab", { name: "Studio" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
}

test("signs up and generates a studio image", async ({ page }) => {
  await signUp(page);
  await openStudioGenerator(page);

  await page.getByRole("button", { name: /Generate · 1 credits/i }).click();

  await expect(page).toHaveURL(/\/results\//, { timeout: 30_000 });
  await expect(
    page.getByRole("img", { name: /Studio output 1/i }),
  ).toBeVisible();
});

test("shows the insufficient credits modal on a 402", async ({ page }) => {
  await signUp(page);
  await openStudioGenerator(page);

  await page.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 402,
      contentType: "application/json",
      body: JSON.stringify({ message: "Not enough credits." }),
    });
  });

  await page.getByRole("button", { name: /Generate · 1 credits/i }).click();
  await expect(page.getByText("Not enough credits.")).toBeVisible();
});
