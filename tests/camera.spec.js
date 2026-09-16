import { test, expect } from "@playwright/test";
for (const [width, height] of [
  [390, 844],
  [393, 852],
  [430, 932],
  [844, 390],
  [768, 1024],
  [1024, 768],
])
  test(`camera fills ${width}x${height} without gaps`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.setFixedTime(new Date("2026-09-16T19:00:00Z"));
  await page.goto("/");
    await expect(page.locator("#loading")).toBeHidden();
    const scene = await page.locator("#camera").boundingBox();
    expect(scene.x).toBeLessThanOrEqual(0);
    expect(scene.y).toBeLessThanOrEqual(0);
    expect(scene.x + scene.width).toBeGreaterThanOrEqual(width - 1);
    expect(scene.y + scene.height).toBeGreaterThanOrEqual(height - 1);
    await page.screenshot({
      path: `test-results/camera-${width}x${height}.png`,
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBe(height);
  });
test("phone panning reveals bouquet and cat, does not activate hotspots while dragging", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await page.mouse.move(325, 740);
  await page.mouse.down();
  await page.mouse.move(30, 740, { steps: 12 });
  await page.mouse.up();
  await page.screenshot({ path: "test-results/camera-bouquet.png" });
  let centre = await page.evaluate(
    async () => (await import(document.querySelector('script[src*="/src/main.js"]').src)).roomCamera.center,
  );
  expect(centre).toBeGreaterThan(440);
  await page.mouse.move(25, 740);
  await page.mouse.down();
  await page.mouse.move(370, 740, { steps: 12 });
  await page.mouse.up();
  await page.mouse.move(25, 740);
  await page.mouse.down();
  await page.mouse.move(250, 740, { steps: 12 });
  await page.mouse.up();
  await page.screenshot({ path: "test-results/camera-cat.png" });
  centre = await page.evaluate(
    async () => (await import(document.querySelector('script[src*="/src/main.js"]').src)).roomCamera.center,
  );
  expect(centre).toBeLessThan(260);
  await expect(page.locator("#cat-memory")).toBeHidden();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.waitForTimeout(400);
  await page.locator("#cat-memory-trigger").click();
  await expect(page.locator("#cat-memory")).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/camera-cat-memory.png" });
});

test("touch swipe follows the camera and viewport resize never leaves a gap", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5173");
  await expect(page.locator("#loading")).toBeHidden();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 330, y: 750 }],
  });
  for (let x = 310; x >= 35; x -= 25)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: 750 }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect(
    await page.evaluate(
      async () => (await import(document.querySelector('script[src*="/src/main.js"]').src)).roomCamera.center,
    ),
  ).toBeGreaterThan(430);
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.setViewportSize({ width: 393, height: 700 });
  await page.waitForTimeout(80);
  let r = await page.locator("#camera").boundingBox();
  expect(r.y).toBeLessThanOrEqual(0);
  expect(r.y + r.height).toBeGreaterThanOrEqual(700);
  await page.setViewportSize({ width: 852, height: 393 });
  await page.waitForTimeout(80);
  r = await page.locator("#camera").boundingBox();
  expect(r.x + r.width).toBeGreaterThanOrEqual(852);
  await context.close();
});
