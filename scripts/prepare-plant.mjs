import sharp from "sharp";
// Separate the five generated drawings; identical pot anchors and pixel scale.
const { data, info } = await sharp("artwork/source/plant-stages.png")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let stage = 0; stage < 5; stage++) {
  const left = Math.floor((stage * info.width) / 5),
    right = Math.floor(((stage + 1) * info.width) / 5);
  let minX = right,
    maxX = left,
    minY = info.height,
    maxY = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = left; x < right; x++)
      if (data[(y * info.width + x) * 4 + 3] > 128) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
  let potLeft = right,
    potRight = left;
  for (let y = maxY - 90; y <= maxY; y++)
    for (let x = left; x < right; x++)
      if (data[(y * info.width + x) * 4 + 3] > 128) {
        potLeft = Math.min(potLeft, x);
        potRight = Math.max(potRight, x);
      }
  const scale = 1 / 20,
    w = Math.round((maxX - minX + 1) * scale),
    h = Math.round((maxY - minY + 1) * scale);
  const sprite = await sharp("artwork/source/plant-stages.png")
    .extract({
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    })
    .resize(w, h, { kernel: "nearest" })
    .png()
    .toBuffer();
  const x = Math.round(12 - ((potLeft + potRight) / 2 - minX) * scale);
  await sharp({
    create: { width: 24, height: 32, channels: 4, background: "#00000000" },
  })
    .composite([{ input: sprite, left: x, top: 31 - h }])
    .png()
    .toFile(`public/art/plant/stage-${stage + 1}.png`);
}
