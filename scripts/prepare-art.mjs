import sharp from "sharp";
import fs from "node:fs/promises";
const W = 640,
  H = 360;
// Use only the registered cat patch from the generated edit to preserve the room.
const blackCatGrid = await sharp("artwork/source/black-cat.png")
  .resize(W, H, { kernel: "nearest" })
  .png()
  .toBuffer();
const blackCat = await sharp(blackCatGrid)
  .extract({ left: 179, top: 197, width: 95, height: 38 })
  .png()
  .toBuffer();
const originalRoomGrid = await sharp("artwork/source/room.png")
  .resize(W, H, { kernel: "nearest" })
  .png()
  .toBuffer();
// All runtime artwork is registered to this one nearest-neighbor pixel grid.
await sharp(originalRoomGrid)
  .composite([{ input: blackCat, left: 179, top: 197 }])
  .png()
  .toFile("public/art/room-grid.png");
await sharp("artwork/source/blink-closed.png")
  .resize(W, H, { kernel: "nearest" })
  .png()
  .toFile("public/art/blink-grid.png");
const cuts = {
  girl: [267, 120, 144, 116],
  cat: [179, 197, 95, 38],
  bouquet: [410, 128, 141, 150],
  plant: [217, 2, 33, 149],
};
for (const [name, [left, top, width, height]] of Object.entries(cuts))
  await sharp("public/art/room-grid.png")
    .extract({ left, top, width, height })
    .toFile(`public/art/${name}.png`);
await sharp("public/art/blink-grid.png")
  .extract({ left: 323, top: 157, width: 39, height: 18 })
  .toFile("public/art/girl-closed.png");
await sharp("public/art/room-grid.png")
  .extract({ left: 323, top: 157, width: 39, height: 18 })
  .toFile("public/art/girl-open.png");
await fs.unlink("public/art/blink-grid.png");

await sharp("artwork/source/blink-half.png")
  .resize(W, H, { kernel: "nearest" })
  .png()
  .toFile("artwork/half-grid.png");
await sharp("artwork/half-grid.png")
  .extract({ left: 323, top: 157, width: 39, height: 18 })
  .toFile("public/art/girl-half-blink.png");
await fs.unlink("artwork/half-grid.png");
