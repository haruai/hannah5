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
function polygon(c, p, fill, stroke) {
  for (
    let y = Math.min(...p.map((a) => a[1]));
    y <= Math.max(...p.map((a) => a[1]));
    y++
  ) {
    const xs = [];
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const a = p[i],
        b = p[j];
      if (a[1] > y !== b[1] > y)
        xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
    }
    xs.sort((a, b) => a - b);
    c.fillStyle = fill;
    for (let i = 0; i < xs.length; i += 2)
      c.fillRect(
        Math.ceil(xs[i]),
        y,
        Math.floor(xs[i + 1]) - Math.ceil(xs[i]) + 1,
        1,
      );
  }
  if (stroke)
    for (let i = 0; i < p.length; i++)
      line(c, p[i], p[(i + 1) % p.length], stroke);
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
export function makeEnvelopeFrames() {
  return Array.from({ length: 10 }, (_, f) => {
    const c = surface(88, 60),
      p = c.getContext("2d");
    polygon(
      p,
      [
        [7, 51],
        [81, 51],
        [86, 54],
        [12, 56],
      ],
      "#68354980",
    );
    if (f >= 3)
      polygon(
        p,
        [
          [7, 28],
          [44, f === 3 ? 20 : f === 4 ? 10 : 4],
          [81, 28],
        ],
        "#d98397",
        "#854458",
      );
    polygon(
      p,
      [
        [7, 28],
        [80, 28],
        [83, 50],
        [4, 50],
      ],
      "#ed9b9d",
      "#8b4a60",
    );
    if (f >= 5) {
      const y = [25, 19, 12, 5, 0][f - 5];
      polygon(
        p,
        [
          [18, y],
          [69, y],
          [69, 43],
          [18, 43],
        ],
        "#ffe2c5",
        "#c28383",
      );
      line(p, [20, y + 1], [67, y + 1], "#fff0d1");
      for (let i = 0; i < 4; i++)
        line(
          p,
          [25, y + 6 + i * 4],
          [59 - (i % 2) * 7, y + 6 + i * 4],
          "#c58d86",
        );
    }
    polygon(
      p,
      [
        [5, 49],
        [8, 29],
        [44, 43],
      ],
      "#f9b2aa",
      "#c27382",
    );
    polygon(
      p,
      [
        [44, 43],
        [80, 29],
        [82, 49],
      ],
      "#e990a0",
      "#bb657c",
    );
    polygon(
      p,
      [
        [5, 50],
        [43, 34],
        [82, 50],
      ],
      "#f3a4a8",
      "#c27382",
    );
    if (f < 3)
      polygon(
        p,
        [
          [8, 28],
          [80, 28],
          [44, f === 2 ? 40 : 44],
        ],
        "#f6b2ac",
        "#ac6076",
      );
    line(p, [9, 28], [79, 28], "#ffd4b5");
    line(p, [8, 49], [80, 49], "#ffc6b7");
    if (f < 2) drawHeart(p, 41, 39, f === 1);
    else if (f === 2) drawHeart(p, 41, 38, true);
    else drawHeart(p, 41, 39);
    return c;
  });
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
