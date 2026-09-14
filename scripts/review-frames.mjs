import { chromium } from "@playwright/test";
import sharp from "sharp";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5173");
await page.locator("#loading").waitFor({ state: "hidden" });
// Render registered frames side by side, independent of random event timing.
const raw = await page.evaluate(async () => {
  const image = async (url) => {
    const i = new Image();
    i.src = url;
    await i.decode();
    return i;
  };
  const room = await image("/art/idle/room.png");
  const out = [];
  for (const name of ["open", "eyes-half", "eyes-closed"]) {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 360;
    const p = c.getContext("2d");
    p.drawImage(room, 0, 0);
    if (name !== "open")
      p.drawImage(await image(`/art/idle/${name}.png`), 323, 157);
    out.push(c.toDataURL().split(",")[1]);
  }
  return out;
});
const panels = [];
for (let i = 0; i < 3; i++)
  panels.push({
    input: await sharp(Buffer.from(raw[i], "base64"))
      .extract({ left: 315, top: 150, width: 54, height: 36 })
      .resize(324, 216, { kernel: "nearest" })
      .png()
      .toBuffer(),
    left: i * 324,
    top: 0,
  });
await sharp({
  create: { width: 972, height: 216, channels: 4, background: "#34202e" },
})
  .composite(panels)
  .png()
  .toFile("test-results/eye-frames.png");
await page.locator("#envelope").click();
await page.waitForTimeout(480);
await page.screenshot({ path: "test-results/opening-flap.png" });
await page.waitForTimeout(900);
await page.locator("#close").click();
await page.waitForTimeout(150);
await page.screenshot({ path: "test-results/letter-return.png" });
await page.waitForTimeout(600);
await browser.close();
