import { test, expect } from "@playwright/test";
import { PlantGrowth, dayNumber } from "../src/plant-growth.js";
const memory = () => {
  const m = new Map();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, String(v)),
  };
};
test("calendar days, leap days, invalid storage and repeated visits", () => {
  const store = memory(),
    g = new PlantGrowth(store);
  expect(g.inspect(new Date(2026, 8, 16, 23, 59)).stage).toBe(1);
  expect(g.inspect(new Date(2026, 8, 16, 23, 59, 59)).advanced).toBe(false);
  let s = g.inspect(new Date(2026, 8, 17, 0, 0));
  expect(s.stage).toBe(2);
  g.commit(s);
  expect(g.inspect(new Date(2026, 8, 17, 23)).advanced).toBe(false);
  s = g.inspect(new Date(2026, 8, 22));
  expect(s.stage).toBe(5);
  expect(s.final).toBe(true);
  g.commit(s);
  expect(g.inspect(new Date(2026, 8, 23)).final).toBe(false);
  expect(dayNumber("2026-03-09") - dayNumber("2026-03-08")).toBe(1);
  expect(dayNumber("2024-03-01") - dayNumber("2024-02-28")).toBe(2);
  expect(dayNumber("2026-02-30")).toBe(null);
  store.setItem("plantFirstVisit", "broken");
  expect(g.inspect(new Date(2026, 8, 16)).stage).toBe(1);
});
test("storage denied degrades gracefully and backwards clock does not shrink", () => {
  const g = new PlantGrowth({
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("denied");
    },
  });
  expect(g.inspect(new Date(2026, 8, 16)).stage).toBe(1);
  const s = g.inspect(new Date(2026, 8, 19));
  expect(s.stage).toBe(4);
  g.commit(s);
  expect(g.inspect(new Date(2026, 8, 17)).stage).toBe(4);
});
const state = (page) =>
  page.evaluate(async () => {
    const { growingPlant: p } = await import(
      document.querySelector('script[src*="/src/main.js"]').src
    );
    return {
      stage: p.stage,
      animation: p.animation?.kind,
      pending: !!p.pending,
    };
  });
test("first visit refresh and next local date advance just once", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-09-16T12:00:00"));
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  expect((await state(page)).stage).toBe(1);
  await page.locator("#plant-trigger").click();
  await expect(page.locator("#plant-whisper")).toHaveText(
    "just getting started ♡",
  );
  await page.reload();
  await expect(page.locator("#loading")).toBeHidden();
  expect((await state(page)).stage).toBe(1);
  await page.clock.setFixedTime(new Date("2026-09-17T12:00:00"));
  await page.reload();
  await expect(page.locator("#loading")).toBeHidden();
  expect((await state(page)).stage).toBe(2);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("plantLastStage")))
    .toBe("2");
  await page.reload();
  await expect(page.locator("#loading")).toBeHidden();
  expect((await state(page)).animation).toBeUndefined();
});
test("final bloom once, normal click afterward, and bubble expires", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-09-20T12:00:00"));
  await page.addInitScript(() => {
    if (!localStorage.getItem("plantFirstVisit")) {
      localStorage.setItem("plantFirstVisit", "2026-09-16");
      localStorage.setItem("plantLastStage", "4");
    }
  });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await expect(page.locator("#plant-whisper")).toHaveText(
    "some beautiful things just need a little time ♡",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("plantBloomSeen")),
  ).toBe("true");
  await page.screenshot({ path: "test-results/plant-bloom-desktop.png" });
  await expect(page.locator("#plant-whisper")).toBeHidden({ timeout: 4000 });
  await page.reload();
  await expect(page.locator("#loading")).toBeHidden();
  expect((await state(page)).animation).toBeUndefined();
  await page.locator("#plant-trigger").click();
  await expect(page.locator("#plant-whisper")).toHaveText(
    "look how far i’ve grown ♡",
  );
});
for (const [w, h] of [
  [390, 844],
  [393, 852],
  [430, 932],
])
  test(`plant visible and tappable on ${w}x${h}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: w, height: h },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:5173");
    await expect(page.locator("#loading")).toBeHidden();
    const b = await page.locator("#plant-trigger").boundingBox();
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(w);
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(44);
    await page.locator("#plant-trigger").tap();
    await expect(page.locator("#plant-whisper")).toBeVisible();
    await page.screenshot({ path: `test-results/plant-mobile-${w}.png` });
    await context.close();
  });
test("all five sprites look distinct in the unchanged room", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.setFixedTime(new Date("2026-09-20T12:00:00"));
  for (let stage = 1; stage <= 5; stage++) {
    await page.goto("/");
    await page.evaluate((s) => {
      localStorage.setItem("plantFirstVisit", `2026-09-${21 - s}`);
      localStorage.setItem("plantLastStage", String(s));
      localStorage.setItem("plantBloomSeen", "true");
    }, stage);
    await page.reload();
    await expect(page.locator("#loading")).toBeHidden();
    expect((await state(page)).stage).toBe(stage);
    await page.screenshot({ path: `test-results/plant-stage-${stage}.png` });
  }
});

test("reduced-motion bloom is immediate, stored, and visually still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.setFixedTime(new Date("2026-09-20T12:00:00"));
  await page.addInitScript(() => {
    localStorage.setItem("plantFirstVisit", "2026-09-16");
    localStorage.setItem("plantLastStage", "4");
  });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await expect(page.locator("#plant-whisper")).toHaveText(
    "some beautiful things just need a little time ♡",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("plantBloomSeen")),
  ).toBe("true");
  const a = await page.locator("#scene").screenshot();
  await page.waitForTimeout(250);
  expect((await page.locator("#scene").screenshot()).equals(a)).toBe(true);
});
