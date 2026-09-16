// Small code-native pixel sprites. Rasterized once, never interpolated at runtime.
export function surface(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
function dot(c, x, y, color) {
  c.fillStyle = color;
  c.fillRect(x, y, 1, 1);
}
function line(c, a, b, color) {
  let [x, y] = a,
    [x1, y1] = b,
    dx = Math.abs(x1 - x),
    sx = x < x1 ? 1 : -1,
    dy = -Math.abs(y1 - y),
    sy = y < y1 ? 1 : -1,
    e = dx + dy;
  for (;;) {
    dot(c, x, y, color);
    if (x === x1 && y === y1) break;
    let e2 = 2 * e;
    if (e2 >= dy) {
      e += dy;
      x += sx;
    }
    if (e2 <= dx) {
      e += dx;
      y += sy;
    }
  }
}
export function drawHeart(c, x, y, bright = false) {
  const rows = [
    "0110110",
    "1111111",
    "1111111",
    "0111110",
    "0011100",
    "0001000",
  ];
  for (let j = 0; j < rows.length; j++)
    for (let i = 0; i < 7; i++)
      if (rows[j][i] === "1") dot(c, x + i, y + j + 1, "#943c5c");
  for (let j = 0; j < rows.length; j++)
    for (let i = 0; i < 7; i++)
      if (rows[j][i] === "1")
        dot(c, x + i, y + j, bright ? "#ffb1b5" : "#e77d94");
  line(c, [x + 1, y + 1], [x + 2, y + 1], "#ffd4bf");
}
// Five separately authored steam silhouettes, including a thinning end frame.
const steamPaths = [
  [
    [10, 24],
    [9, 21],
    [10, 18],
  ],
  [
    [10, 24],
    [9, 21],
    [9, 18],
    [12, 15],
    [12, 12],
  ],
  [
    [10, 24],
    [11, 21],
    [11, 18],
    [9, 15],
    [9, 12],
    [12, 9],
    [13, 6],
  ],
  [
    [11, 20],
    [9, 17],
    [9, 14],
    [12, 11],
    [13, 8],
    [11, 5],
    [11, 2],
  ],
  [
    [12, 13],
    [14, 10],
    [14, 7],
    [12, 4],
    [13, 1],
  ],
];
export function makeSteamFrames() {
  return [0, 1].map((variant) =>
    steamPaths.map((points, f) => {
      const c = surface(24, 28),
        p = c.getContext("2d");
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1].map((v, j) =>
            j === 0 && variant ? 23 - v : v,
          ),
          b = points[i].map((v, j) => (j === 0 && variant ? 23 - v : v));
        line(p, a, b, f === 4 ? "#fcd3b04d" : "#ffd9b877");
        if (i < 3 && f < 4)
          line(p, [a[0] + 1, a[1]], [b[0] + 1, b[1]], "#fbcbb833");
      }
      return c;
    }),
  );
}
export function makePetals() {
  return [".hh..", "..hh.", "..h..", ".hh.."].map((row, n) => {
    const c = surface(5, 5),
      p = c.getContext("2d");
    const patterns = [
      [".hh..", "hppm.", ".mm.."],
      ["..h..", ".hpm.", "..m.."],
      ["..h..", "..p..", "..m.."],
      ["..hh.", ".ppm.", "..m.."],
    ];
    patterns[n].forEach((r, y) =>
      [...r].forEach((v, x) => {
        if (v !== ".")
          dot(p, x, y, { h: "#ffcabd", p: "#f39cb2", m: "#d87598" }[v]);
      }),
    );
    return c;
  });
}
export function makeSparkles() {
  return [0, 1, 2, 1, 0].map((f) => {
    const c = surface(7, 7),
      p = c.getContext("2d");
    dot(p, 3, 3, "#fff2ce");
    if (f) {
      line(p, [3, 3 - f], [3, 3 + f], "#ffe8be");
      line(p, [3 - f, 3], [3 + f, 3], "#ffe8be");
    }
    return c;
  });
}
