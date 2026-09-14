import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { createHash } from "node:crypto";
test("supplied memory image is preserved byte for byte", () => {
  expect(
    createHash("sha256")
      .update(fs.readFileSync("public/art/memory/childhood-cat.png"))
      .digest("hex") ===
      "16aaf531fe6ae152156d78c1ca913b2405e1a0dfef6bac7ed6bb97d46cd6ca22",
  ).toBe(true);
});
test("desktop discovery, delayed reveal, close and replay, letter coexistence", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  const cat = page.getByRole("button", { name: "Open cat memory" }),
    card = page.locator("#cat-memory");
  await expect(card).toBeHidden();
  await cat.hover();
  await expect(cat).toHaveCSS("cursor", "pointer");
  await cat.click();
  await page.waitForTimeout(400);
  await expect(card).toBeHidden();
  await page.screenshot({ path: "test-results/cat-recognition.png" });
  await expect(card).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/cat-memory-desktop.png" });
  await expect(card.getByText("your childhood cat ♡")).toBeVisible();
  await expect(page.locator("#shade")).toHaveCSS("opacity", "0");
  await cat.click();
  await expect(page.locator("#cat-memory")).toHaveCount(1);
  await page.getByRole("button", { name: "Close cat memory" }).click();
  await expect(card).toBeHidden();
  await expect(cat).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(card).toBeHidden();
  await expect(card).toBeVisible();
  await page.locator("#envelope").click();
  await expect(card).toBeHidden();
  await expect(cat).toBeDisabled();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(cat).toBeEnabled();
  expect(errors).toEqual([]);
});
test("mobile touch placement stays visible and clear of face bouquet and envelope", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5173");
  await expect(page.locator("#loading")).toBeHidden();
  const catBox = await page.locator("#cat-memory-trigger").boundingBox();
  await page.touchscreen.tap(
    Math.max(0, catBox.x) +
      (Math.min(390, catBox.x + catBox.width) - Math.max(0, catBox.x)) / 2,
    catBox.y + catBox.height / 2,
  );
  await expect(page.locator("#cat-memory")).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/cat-memory-mobile.png" });
  const card = await page.locator("#cat-memory").boundingBox();
  expect(card.x).toBeGreaterThanOrEqual(0);
  expect(card.y).toBeGreaterThanOrEqual(0);
  expect(card.x + card.width).toBeLessThanOrEqual(390);
  expect(card.y + card.height).toBeLessThanOrEqual(844);
  const env = await page.locator("#envelope").boundingBox();
  expect(
    Math.max(
      0,
      Math.min(card.y + card.height, env.y + env.height) -
        Math.max(card.y, env.y),
    ) *
      Math.max(
        0,
        Math.min(card.x + card.width, env.x + env.width) -
          Math.max(card.x, env.x),
      ),
  ).toBe(0);
  await page.locator(".memory-close").tap();
  await expect(page.locator("#cat-memory")).toBeHidden();
  await context.close();
});
test("reduced motion opens immediately and Escape restores keyboard focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await page.locator("#cat-memory-trigger").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#cat-memory")).toBeVisible({ timeout: 500 });
  await expect(page.locator(".memory-close")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#cat-memory")).toBeHidden();
  await expect(page.locator("#cat-memory-trigger")).toBeFocused();
});
