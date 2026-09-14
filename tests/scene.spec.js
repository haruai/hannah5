import { test, expect } from "@playwright/test";
test("desktop scene, opening sequence, focus, closing and no errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await page.screenshot({ path: "test-results/desktop.png" });
  await page
    .getByRole("button", { name: "Open the letter I made for you" })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close letter" }),
  ).toBeFocused();
  await page.waitForTimeout(850);
  await page.screenshot({ path: "test-results/letter.png" });
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close letter" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("#envelope")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(20, 20);
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(errors).toEqual([]);
});
test("portrait camera and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await page.screenshot({ path: "test-results/mobile.png" });
  const a = await page.locator("#scene").screenshot();
  await page.waitForTimeout(350);
  const b = await page.locator("#scene").screenshot();
  expect(a.equals(b)).toBeTruthy();
  const box = await page.locator("#envelope").boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await page.locator("#envelope").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: "test-results/mobile-letter.png" });
  await page.getByRole("button", { name: "Close letter" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
test("Escape cancels opening; assets load successfully", async ({ page }) => {
  let failed = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(r.url());
  });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await page.locator("#envelope").click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1400);
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("#envelope")).toBeEnabled();
  expect(failed).toEqual([]);
});
