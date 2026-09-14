import sharp from "sharp";
const data = await sharp("artwork/source/cat-recognition.png")
  .resize(640, 360, { kernel: "nearest" })
  .extract({ left: 229, top: 199, width: 46, height: 36 })
  .ensureAlpha()
  .raw()
  .toBuffer();
const points = [
  [6, 1],
  [15, 5],
  [25, 6],
  [40, 11],
  [45, 23],
  [44, 32],
  [30, 35],
  [11, 33],
  [1, 27],
  [0, 17],
  [5, 12],
];
function inside(x, y) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      hit = !hit;
  }
  return hit;
}
for (let y = 0; y < 36; y++)
  for (let x = 0; x < 46; x++)
    if (!inside(x + 0.5, y + 0.5)) data[(y * 46 + x) * 4 + 3] = 0;
await sharp(data, { raw: { width: 46, height: 36, channels: 4 } })
  .png()
  .toFile("public/art/memory/cat-recognition.png");
