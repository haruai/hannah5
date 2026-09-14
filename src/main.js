import "./style.css";
import { RoomCamera } from "./camera.js";
import { CatMemory } from "./cat-memory.js";
import { IdleScene } from "./idle.js";
import {
  surface,
  makeEnvelopeFrames,
  makeSteamFrames,
  makePetals,
  makeSparkles,
  drawHeart,
} from "./sprites.js";
const $ = (s) => document.querySelector(s),
  canvas = $("#scene"),
  ctx = canvas.getContext("2d", { alpha: false });
const world = $("#world"),
  camera = $("#camera"),
  button = $("#envelope"),
  letter = $("#letter"),
  paper = $(".paper"),
  close = $("#close");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
ctx.imageSmoothingEnabled = false;
export const idle = new IdleScene();
export const playback = {
  time: 0,
  phase: "closed",
  renderedFrames: 0,
  lastState: null,
};
let assets = {},
  manifest = {},
  ready = false,
  hover = false,
  phaseAt = 0,
  lastAt = null,
  raf = 0,
  wake = 0,
  paperAnimation = null,
  returnFrame = 0,
  wasReading = false;
const envelopes = makeEnvelopeFrames(),
  steam = makeSteamFrames(),
  petals = makePetals(),
  sparkles = makeSparkles();
export const roomCamera = new RoomCamera({
  world,
  element: camera,
  canPan: () => playback.phase === "closed",
});
export const catMemory = new CatMemory({
  world,
  camera,
  motion,
  time: () => playback.time,
  requestDraw,
  canOpen: () => playback.phase === "closed",
});
function drawPatch(name) {
  const a = manifest[name];
  ctx.drawImage(assets[name], a.x, a.y);
}
function makeLamp() {
  const c = surface(640, 360),
    p = c.getContext("2d");
  p.drawImage(assets.room, 0, 0);
  const d = p.getImageData(593, 106, 47, 70);
  for (let y = 0; y < 70; y++)
    for (let x = 0; x < 47; x++) {
      const i = (y * 47 + x) * 4;
      const fall = Math.max(
        0,
        1 - Math.abs(x - 29) / 36 - Math.abs(y - 35) / 56,
      );
      for (let k = 0; k < 3; k++)
        d.data[i + k] = Math.min(
          255,
          d.data[i + k] + Math.round(fall * [5, 3, 1][k]),
        );
    }
  const out = surface(47, 70);
  out.getContext("2d").putImageData(d, 0, 0);
  return out;
}
let lamp;
function ambient(t, s) {
  for (const name of s.active) {
    if (catMemory.overridesCat && name.startsWith("cat-")) continue;
    drawPatch(name);
  }
  ctx.drawImage(steam[s.steamVariant][s.steamFrame], 558, 216);
  if (idle.petal) {
    const p = idle.petal,
      f = (t - p.start) / p.duration;
    const x = Math.round(p.x + f * p.drift + Math.sin(f * 7) * 4),
      y = Math.round(p.y + f * 91);
    ctx.globalAlpha = f > 0.8 ? Math.max(0, (1 - f) * 5) : 0.85;
    ctx.drawImage(petals[Math.floor(f * 11) % 4], x, y);
    ctx.globalAlpha = 1;
  }
  if (s.sparkleAge >= 0 && s.sparkleAge < 700)
    ctx.drawImage(
      sparkles[Math.min(4, Math.floor(s.sparkleAge / 140))],
      476,
      153,
    );
  if (s.cityAge >= 0 && s.cityAge < 1400) {
    ctx.globalAlpha =
      Math.round(Math.sin((s.cityAge / 1400) * Math.PI) * 5) / 10;
    ctx.fillStyle = "#ffd297";
    ctx.fillRect(idle.city.x, idle.city.y, 1, 2);
    ctx.globalAlpha = 1;
  }
  // Only three small reflection glints; the water and sunset never move.
  for (const [x, y, period, delay] of [
    [117, 149, 5700, 1900],
    [154, 154, 7100, 3700],
    [189, 145, 8300, 1100],
  ]) {
    const f = ((t + delay) % period) / period;
    if (f > 0.42 && f < 0.61) {
      ctx.fillStyle = "#fba88d";
      ctx.globalAlpha = 0.25;
      ctx.fillRect(x, y, 2, 1);
      ctx.globalAlpha = 1;
    }
  }
  if (s.lamp > 0.3) {
    ctx.globalAlpha = Math.round(s.lamp * 3) / 3;
    ctx.drawImage(lamp, 593, 106);
    ctx.globalAlpha = 1;
  }
}
const OPEN_TIMES = [0, 75, 170, 265, 355, 440, 515, 600, 685, 760];
function envelopeFrame() {
  if (playback.phase === "closed") return 0;
  if (playback.phase === "opening") {
    let age = playback.time - phaseAt;
    return Math.max(
      0,
      OPEN_TIMES.findLastIndex((v) => age >= v),
    );
  }
  if (playback.phase === "closing") {
    let age = playback.time - phaseAt;
    const delay = wasReading ? 320 : 0;
    return Math.max(0, returnFrame - Math.floor(Math.max(0, age - delay) / 32));
  }
  return 9;
}
function draw() {
  ctx.drawImage(assets.room, 0, 0);
  let state = null;
  if (!motion.matches) {
    state = idle.update(playback.time);
    ambient(playback.time, state);
  }
  catMemory.draw(ctx, drawPatch);
  playback.lastState = state;
  ctx.drawImage(envelopes[envelopeFrame()], 303, 220);
  if (playback.phase === "closed" && (hover || state?.attention)) {
    // Only the seal responds; the envelope and shadow stay planted.
    const pulse =
      state?.attention &&
      playback.time - idle.attentionAt > 220 &&
      playback.time - idle.attentionAt < 420;
    drawHeart(ctx, 344, pulse ? 258 : 259, true);
  }
  playback.renderedFrames++;
}
function origin() {
  const b = button.getBoundingClientRect();
  return `translate(${Math.round(b.x + b.width / 2 - world.clientWidth / 2)}px,${Math.round(b.y + b.height / 2 - world.clientHeight / 2)}px) scale(.2,.05)`;
}
function showPaper() {
  letter.hidden = false;
  world.classList.add("open");
  paper.scrollTop = 0;
  paperAnimation?.cancel();
  if (!motion.matches)
    paperAnimation = paper.animate(
      [
        { transform: origin(), opacity: 0 },
        {
          transform: "translate(0, 0) scale(.82,.38)",
          opacity: 1,
          offset: 0.48,
        },
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
      ],
      { duration: 420, easing: "steps(10,end)", fill: "both" },
    );
  close.focus();
  $("#announcement").textContent = "Your letter is open.";
}
function finishClose() {
  paperAnimation?.cancel();
  paperAnimation = null;
  letter.hidden = true;
  world.classList.remove("open");
  playback.phase = "closed";
  button.disabled = false;
  catMemory.resume();
  button.focus({ preventScroll: true });
  $("#announcement").textContent = "Letter closed.";
  if (wasReading && !motion.matches) idle.firstClose(playback.time);
}
function advance() {
  const age = playback.time - phaseAt;
  if (playback.phase === "opening" && age >= 780) {
    showPaper();
    playback.phase = "unfolding";
  }
  if (playback.phase === "unfolding" && age >= 1200) playback.phase = "open";
  if (playback.phase === "closing") {
    if (wasReading && age >= 320) letter.hidden = true;
    if (age >= (wasReading ? 650 : 320)) finishClose();
  }
}
function tick(now) {
  raf = 0;
  if (document.hidden || !ready) return;
  if (lastAt !== null)
    playback.time += Math.min(100, Math.max(0, now - lastAt));
  lastAt = now;
  advance();
  draw();
  if (!motion.matches || !["closed", "open"].includes(playback.phase))
    wake = setTimeout(() => {
      wake = 0;
      raf = requestAnimationFrame(tick);
    }, 30);
  else lastAt = null;
}
function requestDraw() {
  if (!ready || document.hidden || raf || wake) return;
  raf = requestAnimationFrame(tick);
}
function openLetter() {
  if (playback.phase !== "closed" || !ready) return;
  catMemory.suspend();
  idle.letterOpened();
  playback.phase = "opening";
  phaseAt = playback.time;
  button.disabled = true;
  if (motion.matches) {
    showPaper();
    playback.phase = "open";
  }
  requestDraw();
}
function closeLetter() {
  if (["closed", "closing"].includes(playback.phase)) return;
  returnFrame = envelopeFrame();
  wasReading = !letter.hidden;
  playback.phase = "closing";
  phaseAt = playback.time;
  world.classList.remove("open");
  if (motion.matches) {
    finishClose();
    requestDraw();
    return;
  }
  if (wasReading) {
    const style = getComputedStyle(paper),
      start = { transform: style.transform, opacity: style.opacity };
    paperAnimation?.cancel();
    paperAnimation = paper.animate(
      [
        start,
        { transform: origin(), opacity: 1, offset: 0.88 },
        { transform: origin(), opacity: 0 },
      ],
      { duration: 320, easing: "steps(9,end)", fill: "both" },
    );
  }
  requestDraw();
}
button.addEventListener("click", openLetter);
for (const event of ["pointerenter", "focus", "pointerdown"])
  button.addEventListener(event, () => {
    hover = true;
    requestDraw();
  });
for (const event of ["pointerleave", "blur", "pointercancel"])
  button.addEventListener(event, () => {
    hover = false;
    requestDraw();
  });
close.addEventListener("click", closeLetter);
$("#shade").addEventListener("click", closeLetter);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLetter();
  if (!letter.hidden && e.key === "Tab") {
    e.preventDefault();
    close.focus();
  }
});
document.addEventListener("visibilitychange", () => {
  clearTimeout(wake);
  wake = 0;
  cancelAnimationFrame(raf);
  raf = 0;
  lastAt = null;
  if (document.hidden) paperAnimation?.pause();
  else {
    paperAnimation?.play();
    requestDraw();
  }
});
motion.addEventListener("change", () => {
  clearTimeout(wake);
  wake = 0;
  cancelAnimationFrame(raf);
  raf = 0;
  lastAt = null;
  if (motion.matches) {
    if (["opening", "unfolding"].includes(playback.phase)) {
      paperAnimation?.cancel();
      showPaper();
      playback.phase = "open";
    } else if (playback.phase === "closing") finishClose();
  }
  requestDraw();
});
async function image(name, path) {
  const im = new Image();
  im.src = `${import.meta.env.BASE_URL}${path}`;
  await im.decode();
  assets[name] = im;
}
async function json(path) {
  const r = await fetch(`${import.meta.env.BASE_URL}${path}`);
  if (!r.ok) throw new Error(`Could not load ${path}`);
  return r.json();
}
async function init() {
  try {
    const [layout, data] = await Promise.all([
      json("art/idle/manifest.json"),
      json("letter.json"),
    ]);
    manifest = layout;
    await Promise.all([
      image("room", "art/idle/room.png"),
      document.fonts.load('20px "VT323"'),
      catMemory.preload(),
      ...Object.keys(manifest)
        .filter((k) => k !== "steam-clean")
        .map((k) => image(k, `art/idle/${k}.png`)),
    ]);
    $("#letter-title").textContent = data.title;
    for (const text of data.paragraphs) {
      const p = document.createElement("p");
      p.textContent = text;
      $("#letter-body").append(p);
    }
    $("#signature").textContent = data.signature;
    lamp = makeLamp();
    ready = true;
    draw();
    $("#loading").classList.add("done");
    world.classList.add("ready");
    button.disabled = false;
    requestDraw();
  } catch (e) {
    $("#loading").textContent =
      "This little room couldn’t load. Please refresh to try again.";
    console.error(e);
  }
}
init();
