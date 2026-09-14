import sharp from "sharp";
import fs from "node:fs/promises";
// Bake registered, irregularly masked patches once. Runtime never warps artwork.
const W = 640,
  H = 360;
const grid = async (path) =>
  sharp(path)
    .resize(W, H, { kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer();
const inhale = await grid("artwork/source/idle-inhale.png");
const ear = await grid("artwork/source/idle-ear-steam.png");
function inside(x, y, p) {
  let yes = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const a = p[i],
      b = p[j];
    if (
      a[1] > y != b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      yes = !yes;
  }
  return yes;
}
const manifest = {};
await fs.mkdir("public/art/idle", { recursive: true });
async function patch(name, src, points) {
  const x = Math.min(...points.map((p) => p[0])),
    y = Math.min(...points.map((p) => p[1]));
  const w = Math.max(...points.map((p) => p[0])) - x + 1,
    h = Math.max(...points.map((p) => p[1])) - y + 1;
  const pixels = Buffer.alloc(w * h * 4);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++)
      if (inside(x + i + 0.5, y + j + 0.5, points)) {
        let a = ((y + j) * W + x + i) * 4,
          b = (j * w + i) * 4;
        src.copy(pixels, b, a, a + 4);
      }
  await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(`public/art/idle/${name}.png`);
  manifest[name] = { x, y, w, h };
}
await patch("shoulder-left", inhale, [
  [297, 198],
  [304, 192],
  [315, 194],
  [318, 201],
  [311, 208],
  [308, 220],
  [299, 224],
  [295, 217],
]);
await patch("shoulder-right", inhale, [
  [369, 197],
  [379, 199],
  [383, 207],
  [386, 218],
  [379, 226],
  [373, 221],
  [371, 210],
]);
await patch("cat-inhale", inhale, [
  [179, 226],
  [181, 217],
  [188, 209],
  [200, 201],
  [212, 198],
  [232, 201],
  [234, 207],
  [225, 214],
  [219, 223],
  [197, 227],
]);
await patch("cat-ear", ear, [
  [234, 199],
  [244, 203],
  [246, 210],
  [240, 213],
  [234, 210],
]);
await patch("hair-lock", inhale, [
  [287, 180],
  [294, 180],
  [292, 187],
  [286, 191],
  [284, 198],
  [280, 201],
  [279, 195],
  [282, 187],
]);
await patch("tulip", inhale, [
  [429, 167],
  [437, 167],
  [444, 177],
  [445, 185],
  [441, 190],
  [434, 188],
  [429, 182],
  [427, 173],
]);
await patch("ribbon", inhale, [
  [506, 246],
  [514, 245],
  [520, 252],
  [525, 260],
  [526, 266],
  [521, 270],
  [515, 263],
  [512, 254],
]);
await patch("vine-leaf", inhale, [
  [237, 92],
  [245, 93],
  [248, 102],
  [244, 110],
  [238, 110],
  [236, 101],
]);
await patch("blossom", inhale, [
  [102, 25],
  [112, 23],
  [121, 28],
  [126, 34],
  [121, 39],
  [112, 37],
  [105, 33],
]);
await patch("steam-clean", ear, [
  [558, 215],
  [580, 215],
  [582, 235],
  [580, 243],
  [558, 243],
]);
// Remove baked steam once; reduced motion shows this same clean, static room.
const clear = await sharp("public/art/idle/steam-clean.png").toBuffer();
await sharp("public/art/room-grid.png")
  .composite([{ input: clear, left: 558, top: 215 }])
  .png()
  .toFile("public/art/idle/room.png");
// Constrain the existing blink variants to eyelids only, excluding eyebrows/cheeks.
for (const [name, file] of [
  ["eyes-half", "girl-half-blink"],
  ["eyes-closed", "girl-closed"],
]) {
  const { data, info } = await sharp(`public/art/${file}.png`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const polygons = [
    [
      [323, 168],
      [327, 165],
      [335, 164],
      [340, 169],
      [337, 173],
      [326, 174],
    ],
    [
      [348, 161],
      [353, 158],
      [359, 158],
      [362, 162],
      [357, 168],
      [350, 169],
    ],
  ];
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (!polygons.some((p) => inside(x + 323 + 0.5, y + 157 + 0.5, p)))
        data[(y * info.width + x) * 4 + 3] = 0;
  await sharp(data, { raw: info }).png().toFile(`public/art/idle/${name}.png`);
  manifest[name] = { x: 323, y: 157, w: 39, h: 18 };
}
await fs.writeFile(
  "public/art/idle/manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Prepared ${Object.keys(manifest).length} registered idle patches.`,
);
