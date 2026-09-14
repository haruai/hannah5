import "./cat-memory.css";
import { drawHeart } from "./sprites.js";

// One memory instance; it shares the room's pauseable pixel clock.
export class CatMemory {
  constructor({ world, camera, motion, time, requestDraw, canOpen }) {
    Object.assign(this, { world, camera, motion, time, requestDraw, canOpen });
    this.state = "idle";
    this.started = 0;
    this.hovered = false;
    this.hoverAt = -Infinity;
    this.ready = false;
    this.trigger = document.createElement("button");
    this.trigger.id = "cat-memory-trigger";
    this.trigger.type = "button";
    this.trigger.disabled = true;
    this.trigger.setAttribute("aria-label", "Open cat memory");
    this.trigger.setAttribute("aria-controls", "cat-memory");
    this.trigger.setAttribute("aria-expanded", "false");
    camera.append(this.trigger);
    this.card = document.createElement("aside");
    this.card.id = "cat-memory";
    this.card.hidden = true;
    this.card.setAttribute("aria-label", "Childhood cat memory");
    this.card.innerHTML = `<button type="button" class="memory-close" aria-label="Close cat memory">×</button><figure class="memory-photo"><img src="${import.meta.env.BASE_URL}art/memory/childhood-cat.png" alt="Your childhood black cat resting on a patterned rug" width="86" height="86"></figure><p class="memory-title">your childhood cat ♡</p><p class="memory-caption">a little piece of home</p>`;
    world.append(this.card);
    this.closeButton = this.card.querySelector("button");
    camera.addEventListener("camerachange", () => {
      if (!this.card.hidden) this.position();
    });
    this.trigger.addEventListener("click", () => this.open());
    this.trigger.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "touch" && this.canOpen()) {
        this.hovered = true;
        this.hoverAt = this.time();
        this.requestDraw();
      }
    });
    this.trigger.addEventListener("pointerleave", () => {
      this.hovered = false;
      this.requestDraw();
    });
    this.trigger.addEventListener("focus", () => {
      if (this.trigger.matches(":focus-visible")) {
        this.hovered = true;
        this.hoverAt = this.time();
        this.requestDraw();
      }
    });
    this.trigger.addEventListener("blur", () => {
      this.hovered = false;
      this.requestDraw();
    });
    this.closeButton.addEventListener("click", () => this.close());
    this.onKey = (e) => {
      if (e.key === "Escape" && this.state !== "idle") {
        this.close();
      }
    };
    document.addEventListener("keydown", this.onKey);
    window.addEventListener("resize", () => {
      if (!this.card.hidden) this.position();
    });
    this.motion.addEventListener("change", () => {
      if (this.motion.matches) {
        this.animation?.cancel();
        if (this.state === "playing") this.reveal();
        this.requestDraw();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.animation?.pause();
      else this.animation?.play();
    });
  }
  async preload() {
    this.head = new Image();
    this.head.src = `${import.meta.env.BASE_URL}art/memory/cat-recognition.png`;
    await Promise.all([
      this.head.decode(),
      this.card.querySelector("img").decode(),
    ]);
    this.ready = true;
    this.trigger.disabled = false;
  }
  get animating() {
    return this.state === "playing";
  }
  get overridesCat() {
    return (
      this.animating ||
      (this.hovered &&
        this.state === "idle" &&
        this.canOpen() &&
        !this.motion.matches)
    );
  }
  open() {
    if (!this.ready || !this.canOpen() || this.state !== "idle") return;
    this.state = "playing";
    this.started = this.time();
    this.trigger.setAttribute("aria-busy", "true");
    if (this.motion.matches) this.reveal();
    this.requestDraw();
  }
  reveal() {
    if (this.state !== "playing") return;
    this.state = "open";
    this.card.hidden = false;
    this.trigger.removeAttribute("aria-busy");
    this.trigger.setAttribute("aria-expanded", "true");
    this.position();
    if (!this.motion.matches)
      this.animation = this.card.animate(
        [
          { opacity: 0, transform: "translateY(4px) scale(.96)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 360, easing: "steps(6,end)", fill: "both" },
      );
    this.closeButton.focus({ preventScroll: true });
  }
  close({ restoreFocus = true } = {}) {
    if (this.state === "idle") return;
    this.animation?.cancel();
    this.card.hidden = true;
    this.state = "idle";
    this.hovered = false;
    this.hoverAt = -Infinity;
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.removeAttribute("aria-busy");
    if (restoreFocus) this.trigger.focus({ preventScroll: true });
    this.requestDraw();
  }
  suspend() {
    this.close({ restoreFocus: false });
    this.hovered = false;
    this.trigger.disabled = true;
  }
  resume() {
    this.trigger.disabled = !this.ready;
  }
  draw(ctx, drawPatch) {
    if (this.motion.matches) return;
    const t = this.time();
    if (this.state === "playing") {
      const age = t - this.started;
      if (age < 220) {
        if (age < 90 || age > 145) drawPatch("cat-ear");
      } else if (age < 1030) {
        drawPatch("cat-inhale");
        // Raised, sleepy eyes -> resting closed frame -> raised eyes: one blink.
        if (age < 470 || age >= 610) ctx.drawImage(this.head, 229, 199);
      }
      if (age >= 650 && age < 1250) {
        const f = (age - 650) / 600;
        ctx.save();
        ctx.globalAlpha = 1 - Math.floor(f * 5) / 5;
        drawHeart(ctx, 251, 190 - Math.floor(f * 10), true);
        ctx.restore();
      }
      if (age >= 1320) this.reveal();
    } else if (this.hovered && this.state === "idle" && this.canOpen()) {
      drawPatch("cat-inhale");
      const age = t - this.hoverAt;
      if (age < 650) {
        ctx.save();
        ctx.globalAlpha = age > 450 ? 0.5 : 1;
        drawHeart(ctx, 251, 190, true);
        ctx.restore();
      }
    }
  }
  position() {
    const bounds = this.world.getBoundingClientRect(),
      cam = this.camera.getBoundingClientRect(),
      scale = cam.width / 640;
    const rect = (x, y, w, h) => ({
      x: cam.left - bounds.left + x * scale,
      y: cam.top - bounds.top + y * scale,
      w: w * scale,
      h: h * scale,
    });
    const cat = rect(179, 197, 95, 38),
      face = rect(313, 139, 62, 58),
      bouquet = rect(410, 128, 145, 152),
      envelope = rect(303, 238, 88, 55),
      wall = rect(289, 0, 210, 112);
    const width = this.card.offsetWidth,
      height = this.card.offsetHeight,
      W = bounds.width,
      H = bounds.height,
      pad = 12;
    const candidates = [
      [cat.x - width - 16, cat.y - height / 3],
      [cat.x - width / 2, cat.y - height - 16],
      [cat.x + cat.w + 16, cat.y - height / 2],
      [(W - width) / 2, envelope.y + envelope.h + 14],
      [(W - width) / 2, H - height - pad],
      [pad, face.y-height-14],
      [W-width-pad, face.y-height-14],
    ];
    const overlap = (a, b) =>
      Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
      Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const scored = candidates
      .map(([x, y], index) => {
        const r = {
          x: Math.round(Math.max(pad, Math.min(W - width - pad, x))),
          y: Math.round(Math.max(pad, Math.min(H - height - pad, y))),
          w: width,
          h: height,
        };
        const score =
          [face, bouquet, envelope].reduce(
            (sum, b) => sum + overlap(r, b) * 100,
            0,
          ) +
          overlap(r, wall) * 10 +
          overlap(r, cat) * 5 +
          index * 10;
        return { ...r, score };
      })
      .sort((a, b) => a.score - b.score);
    this.card.style.left = `${scored[0].x}px`;
    this.card.style.top = `${scored[0].y}px`;
  }
}
