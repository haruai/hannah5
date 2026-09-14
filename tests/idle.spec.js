import { test, expect } from "@playwright/test";
import { IdleScene } from "../src/idle.js";
function seeded() {
  let s = 47;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
test("timings are independent, blinks have real half/closed frames, and petals have gaps", () => {
  const idle = new IdleScene(seeded()),
    blinks = [],
    petalPresence = [];
  for (let t = 0; t < 60000; t += 10) {
    const s = idle.update(t);
    if (s.eye) blinks.push([t, s.eye]);
    petalPresence.push([t, !!idle.petal]);
  }
  const first = blinks[0][0];
  expect(first).toBeGreaterThanOrEqual(4000);
  expect(first).toBeLessThanOrEqual(8000);
  expect(
    blinks.filter(([t]) => t >= first && t < first + 310).map((a) => a[1]),
  ).toContain("eyes-half");
  expect(
    blinks.filter(([t]) => t >= first && t < first + 310).map((a) => a[1]),
  ).toContain("eyes-closed");
  expect(blinks.find(([t]) => t >= first + 310)?.[0]).toBeGreaterThanOrEqual(
    first + 410,
  );
  const events = idle.events.filter((e) => e.t < 20000);
  for (const name of [
    "blink",
    "cat-ear",
    "petal",
    "seal",
    "city",
    "tulip",
    "ribbon",
  ])
    expect(events.some((e) => e.name === name)).toBeTruthy();
  const petalEvents = idle.events.filter((e) => e.name === "petal");
  for (let i = 1; i < petalEvents.length; i++)
    expect(petalEvents[i].t - petalEvents[i - 1].t).toBeGreaterThan(9500);
  idle.letterOpened();
  const count = idle.events.filter((e) => e.name === "seal").length;
  idle.update(75000);
  expect(idle.events.filter((e) => e.name === "seal").length).toBe(count);
  idle.firstClose(80000);
  idle.firstClose(81000);
  expect(
    idle.events.filter((e) => e.name === "first-close-sparkle"),
  ).toHaveLength(1);
});
test("first twenty seconds: desktop animation stays local and frames load without errors", async ({
  browser,
}) => {
  test.setTimeout(40000);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: "test-results/idle-video/",
      size: { width: 960, height: 600 },
    },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173");
  await expect(page.locator("#loading")).toBeHidden();
  const pixels = () =>
    page.evaluate(() =>
      Array.from(
        document
          .querySelector("canvas")
          .getContext("2d")
          .getImageData(0, 0, 640, 360).data,
      ),
    );
  const before = await pixels();
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "test-results/idle-6s.png" });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "test-results/idle-12s.png" });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: "test-results/idle-20s.png" });
  const after = await pixels();
  let changed = 0;
  for (let i = 0; i < before.length; i += 4)
    if (
      before[i] !== after[i] ||
      before[i + 1] !== after[i + 1] ||
      before[i + 2] !== after[i + 2]
    )
      changed++;
  expect(changed).toBeGreaterThan(20);
  expect(changed / (640 * 360)).toBeLessThan(0.04);
  const state = await page.evaluate(async () => {
    const { idle, playback } = await import(document.querySelector('script[src*="/src/main.js"]').src);
    return {
      events: idle.events,
      frames: playback.renderedFrames,
      time: playback.time,
    };
  });
  expect(state.events.some((e) => e.name === "blink")).toBeTruthy();
  expect(state.events.some((e) => e.name === "seal")).toBeTruthy();
  expect((state.frames / state.time) * 1000).toBeLessThan(32);
  expect(errors).toEqual([]);
  await context.close();
});
test("live reduced-motion change and hidden tab suspend rendering", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const frames = () =>
    page.evaluate(
      async () => (await import(document.querySelector('script[src*="/src/main.js"]').src)).playback.renderedFrames,
    );
  let a = await frames();
  await page.waitForTimeout(250);
  expect(await frames()).toBe(a);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(150);
  expect(await frames()).toBeGreaterThan(a);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  a = await frames();
  await page.waitForTimeout(250);
  expect(await frames()).toBe(a);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(150);
  expect(await frames()).toBeGreaterThan(a);
  await page.locator("#envelope").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
test("mobile touch, return animation, and one first-close micro moment", async ({
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
  await page.waitForTimeout(1600);
  await page.screenshot({ path: "test-results/mobile-idle.png" });
  for (let i = 0; i < 2; i++) {
    await page.locator("#envelope").tap();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(450);
    await page.locator("#close").tap();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator("#envelope")).toBeEnabled();
  }
  const events = await page.evaluate(
    async () => (await import(document.querySelector('script[src*="/src/main.js"]').src)).idle.events,
  );
  expect(events.filter((e) => e.name === "first-close-sparkle")).toHaveLength(
    1,
  );
  await context.close();
});
