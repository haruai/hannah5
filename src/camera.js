const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
// Camera coordinates are in the artwork grid; controls remain children of it.
export class RoomCamera {
  constructor({ world, element, canPan }) {
    Object.assign(this, { world, element, canPan });
    this.center = 337;
    this.scale = 1;
    this.drag = null;
    this.suppressUntil = 0;
    this.portrait = false;
    this.resize = () => this.layout();
    window.addEventListener("resize", this.resize);
    window.visualViewport?.addEventListener("resize", this.resize);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(world);
    element.addEventListener("pointerdown", (e) => this.down(e));
    element.addEventListener("pointermove", (e) => this.move(e));
    element.addEventListener("pointerup", (e) => this.up(e));
    element.addEventListener("pointercancel", (e) => this.up(e));
    element.addEventListener(
      "click",
      (e) => {
        if (performance.now() < this.suppressUntil) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
    element.addEventListener("focusin", (e) => this.ensureVisible(e.target));
    this.layout();
  }
  layout() {
    const w = this.world.clientWidth,
      h = this.world.clientHeight;
    this.world.dataset.camera =
      w < 430
        ? "small-mobile"
        : w < 768
          ? "mobile"
          : w < 1024
            ? "tablet"
            : "desktop";
    const portrait = w < 1024 && w / h < 1.3;
    if (portrait && !this.portrait) this.center = w < 768 ? 337 : 350;
    this.portrait = portrait;
    let s = Math.max(w / 640, h / 360);
    // Round scale upwards, never down, so the artwork covers all viewport edges.
    if (w < 1024) s = Math.ceil(s * 64) / 64;
    this.scale = s;
    this.width = w;
    this.height = h;
    this.minCenter = Math.max(w / (2 * s), 242);
    this.maxCenter = Math.min(640 - w / (2 * s), 476);
    this.center = clamp(this.center, this.minCenter, this.maxCenter);
    this.apply();
  }
  apply() {
    const w = this.width,
      h = this.height,
      s = this.scale;
    const x = this.portrait
      ? clamp(w / 2 - this.center * s, w - 640 * s, 0)
      : (w - 640 * s) / 2;
    const y = (h - 360 * s) / 2;
    this.element.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) scale(${s})`;
    this.element.style.setProperty("--scene-scale", s);
    this.element.style.touchAction = this.portrait ? "none" : "manipulation";
    this.element.dispatchEvent(new Event("camerachange"));
  }
  down(e) {
    if (!this.portrait || !this.canPan() || e.button !== 0 || !e.isPrimary)
      return;
    this.drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      center: this.center,
      moved: false,
    };
  }
  move(e) {
    const d = this.drag;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - d.y)) return;
      d.moved = true;
      this.element.setPointerCapture(e.pointerId);
    }
    this.center = clamp(
      d.center - dx / this.scale,
      this.minCenter,
      this.maxCenter,
    );
    this.apply();
    e.preventDefault();
  }
  up(e) {
    if (!this.drag || this.drag.id !== e.pointerId) return;
    if (this.drag.moved) {
      this.suppressUntil = performance.now() + 350;
      if (this.element.hasPointerCapture(e.pointerId))
        this.element.releasePointerCapture(e.pointerId);
    }
    this.drag = null;
  }
  ensureVisible(target) {
    if (!this.portrait || !target.matches("button:focus-visible")) return;
    const r = target.getBoundingClientRect(),
      w = this.width;
    if (r.left >= 12 && r.right <= w - 12) return;
    const offset = target.id === "cat-memory-trigger" ? 244 : 347;
    this.center = clamp(offset, this.minCenter, this.maxCenter);
    this.apply();
  }
}
