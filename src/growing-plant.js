import "./growing-plant.css";
import { PlantGrowth, localDay } from "./plant-growth.js";
import { drawHeart, makeSparkles } from "./sprites.js";
const MESSAGES = [
  "just getting started ♡",
  "look, i’m growing :)",
  "little by little ♡",
  "almost there...",
  "look how far i’ve grown ♡",
];
export class GrowingPlant {
  constructor({ world, camera, motion, time, requestDraw, canInteract }) {
    Object.assign(this, {
      world,
      camera,
      motion,
      time,
      requestDraw,
      canInteract,
    });
    let storage;
    try {
      storage = window.localStorage;
    } catch {}
    this.growth = new PlantGrowth(storage);
    this.ready = false;
    this.x = 265;
    this.y = 64;
    this.animation = null;
    this.pending = null;
    this.sparkles = makeSparkles();
    this.bubbleTimer = 0;
    this.checkTimer = 0;
    this.trigger = document.createElement("button");
    this.trigger.id = "plant-trigger";
    this.trigger.type = "button";
    this.trigger.disabled = true;
    this.trigger.dataset.cameraX = "277";
    this.trigger.setAttribute("aria-label", "Potted plant");
    camera.append(this.trigger);
    this.bubble = document.createElement("p");
    this.bubble.id = "plant-whisper";
    this.bubble.hidden = true;
    this.bubble.setAttribute("role", "status");
    world.append(this.bubble);
    this.trigger.addEventListener("click", () => this.click());
    camera.addEventListener("camerachange", () => {
      this.positionBubble();
      this.requestDraw();
    });
    this.motion.addEventListener("change", () => {
      if (this.motion.matches && this.animation) {
        this.finishAnimation();
      }
      this.requestDraw();
    });
    document.addEventListener("visibilitychange", () => {
      clearTimeout(this.checkTimer);
      if (document.hidden) {
        this.hideBubble();
      } else {
        if (this.ready) this.checkDate();
        this.scheduleCheck();
      }
    });
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("plant")) {
        this.checkDate();
      }
    });
  }
  async preload() {
    this.frames = await Promise.all(
      [1, 2, 3, 4, 5].map(async (n) => {
        const i = new Image();
        i.src = `${import.meta.env.BASE_URL}art/plant/stage-${n}.png`;
        await i.decode();
        return i;
      }),
    );
    this.ready = true;
    this.trigger.disabled = false;
    this.checkDate();
    this.scheduleCheck();
  }
  checkDate() {
    if (!this.ready) return;
    this.today = localDay();
    const state = this.growth.inspect();
    this.state = state;
    this.stage = state.stage;
    this.pending = state.advanced || state.final ? state : null;
    this.requestDraw();
  }
  scheduleCheck() {
    clearTimeout(this.checkTimer);
    if (document.hidden) return;
    const next = new Date();
    next.setHours(24, 0, 0, 50);
    this.checkTimer = setTimeout(
      () => {
        this.checkDate();
        this.scheduleCheck();
      },
      Math.max(50, next - new Date()),
    );
  }
  visible() {
    const r = this.trigger.getBoundingClientRect(),
      w = this.world.getBoundingClientRect();
    return (
      r.left >= w.left &&
      r.right <= w.right &&
      r.top >= w.top &&
      r.bottom <= w.bottom
    );
  }
  showBubble(text) {
    clearTimeout(this.bubbleTimer);
    this.bubble.textContent = text;
    this.bubble.hidden = false;
    this.positionBubble();
    this.bubbleTimer = setTimeout(() => this.hideBubble(), 2700);
  }
  hideBubble() {
    clearTimeout(this.bubbleTimer);
    this.bubble.hidden = true;
  }
  positionBubble() {
    if (this.bubble.hidden) return;
    const c = this.camera.getBoundingClientRect(),
      r = this.world.getBoundingClientRect(),
      s = c.width / 640,
      w = this.bubble.offsetWidth,
      h = this.bubble.offsetHeight;
    let x = c.left - r.left + (this.x + 24) * s + 8,
      y = c.top - r.top + (this.y + 10) * s;
    this.bubble.style.left = `${Math.round(Math.max(12, Math.min(r.width - w - 12, x)))}px`;
    this.bubble.style.top = `${Math.round(Math.max(12, Math.min(r.height - h - 12, y)))}px`;
  }
  click() {
    if (!this.ready || !this.canInteract() || this.animation || this.pending)
      return;
    if (this.motion.matches) this.showBubble(MESSAGES[this.stage - 1]);
    else this.animation = { kind: "click", start: this.time() };
    this.requestDraw();
  }
  finishAnimation() {
    const a = this.animation;
    if (!a) return;
    this.animation = null;
    if (a.kind === "growth") {
      this.growth.commit(a.state);
      if (a.state.final)
        this.showBubble("some beautiful things just need a little time ♡");
    } else this.showBubble(MESSAGES[this.stage - 1]);
  }
  draw(ctx) {
    if (!this.ready) return;
    const t = this.time();
    const delta =
      this.lastDraw === undefined ? 0 : Math.max(0, t - this.lastDraw);
    this.lastDraw = t;
    if (this.animation && (!this.visible() || !this.canInteract()))
      this.animation.start += delta;
    if (
      this.pending &&
      this.visible() &&
      this.canInteract() &&
      !document.hidden
    ) {
      const pending = this.pending;
      this.pending = null;
      this.animation = { kind: "growth", start: t, state: pending };
      if (this.motion.matches) this.finishAnimation();
    }
    let stage = this.stage,
      dx = 0,
      dy = 0;
    const a = this.animation;
    const age = a ? t - a.start : 0;
    if (a && !this.motion.matches) {
      if (a.kind === "growth") {
        stage =
          age < 350
            ? Math.min(a.state.previous, a.state.final ? 4 : 5)
            : age < 600 && a.state.final
              ? 4
              : a.state.stage;
        dy = age > 220 && age < 650 ? -1 : 0;
        dx =
          a.state.final && age < 220
            ? [0, 1, 0, -1, 0][Math.min(4, Math.floor(age / 44))]
            : 0;
      } else dx = [0, 1, 0, -1, 0][Math.min(4, Math.floor(age / 70))];
    }
    // A tiny shelf and stationary pot anchor the plant to the wall.
    ctx.fillStyle = "#593443";
    ctx.fillRect(this.x - 2, this.y + 32, 28, 3);
    ctx.fillStyle = "#bd796b";
    ctx.fillRect(this.x - 3, this.y + 31, 29, 2);
    ctx.fillStyle = "#e5a083";
    ctx.fillRect(this.x - 3, this.y + 31, 28, 1);
    ctx.fillStyle = "#78444b";
    ctx.fillRect(this.x + 1, this.y + 34, 2, 3);
    ctx.fillRect(this.x + 21, this.y + 34, 2, 3);
    const frame = this.frames[stage - 1];
    ctx.drawImage(frame, 0, 23, 24, 9, this.x, this.y + 23, 24, 9);
    ctx.drawImage(frame, 0, 0, 24, 23, this.x + dx, this.y + dy, 24, 23);
    if (
      a?.kind === "growth" &&
      !this.motion.matches &&
      age > 380 &&
      age < 880
    ) {
      const points = a.state.final
        ? [
            [0, 7],
            [22, 12],
            [3, 23],
            [18, 0],
          ]
        : [
            [0, 10],
            [22, 18],
            [9, 1],
          ];
      points.forEach(([x, y], i) => {
        const f = Math.floor((age - 380 - i * 35) / 85);
        if (f >= 0 && f < 5)
          ctx.drawImage(this.sparkles[f], this.x + x - 3, this.y + y);
      });
      if (a.state.final && age > 600) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - (age - 600) / 300);
        drawHeart(
          ctx,
          this.x + 10,
          this.y - 2 - Math.floor((age - 600) / 45),
          true,
        );
        ctx.restore();
      }
    }
    if (a && age >= (a.kind === "growth" ? 950 : 350)) this.finishAnimation();
  }
}
