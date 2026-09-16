import './night-interactions.css';
import { makeSparkles } from './sprites.js';
const DREAMS = ['zzz...', 'five more minutes...', '♡', 'sleeping...'];
export class NightInteractions {
  constructor({ world, camera, motion, time, requestDraw, revealWindow }) {
    Object.assign(this, { world, camera, motion, time, requestDraw, revealWindow });
    this.sleeping = false;
    this.dreamAt = this.starAt = -Infinity;
    this.dreamCooldown = this.starCooldown = 0;
    this.sparkles = makeSparkles();
    try { this.wishSeen = localStorage.getItem('shootingStarMessageSeen') === 'true'; } catch { this.wishSeen = false; }
    this.hannah = this.hotspot('sleeping-hannah', 'Sleeping Hannah', 352, () => this.dream());
    this.window = this.hotspot('night-window', 'Night window', 160, () => this.shoot());
    this.bubble = document.createElement('p');
    this.bubble.className = 'room-whisper';
    this.bubble.id = 'room-whisper';
    this.bubble.setAttribute('role', 'status');
    this.bubble.hidden = true;
    world.append(this.bubble);
    camera.addEventListener('camerachange', () => this.position());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.hide(); });
    motion.addEventListener('change', () => {
      if (motion.matches) this.dreamAt = this.starAt = -Infinity;
      requestDraw();
    });
  }
  hotspot(id, label, x, handler) {
    const b = document.createElement('button');
    b.id = id; b.type = 'button'; b.className = 'world-hotspot';
    b.setAttribute('aria-label', label); b.dataset.cameraX = x;
    b.hidden = true;
    b.addEventListener('click', handler);
    this.camera.append(b);
    return b;
  }
  setState(state) {
    this.sleeping = state === 'sleeping';
    this.hannah.hidden = this.window.hidden = !this.sleeping;
    if (!this.sleeping) {
      if ([this.hannah, this.window].includes(document.activeElement)) document.activeElement.blur();
      this.dreamAt = this.starAt = -Infinity;
      this.hide();
    }
  }
  dream() {
    if (!this.sleeping || performance.now() < this.dreamCooldown) return;
    this.dreamCooldown = performance.now() + 2800;
    this.dreamAt = this.time();
    this.say(DREAMS[Math.floor(Math.random() * DREAMS.length)], 349, 160);
    this.requestDraw();
  }
  async shoot() {
    if (!this.sleeping || performance.now() < this.starCooldown) return;
    this.starCooldown = performance.now() + 1600;
    await this.revealWindow?.();
    if (!this.sleeping || document.hidden) return;
    this.starAt = this.time();
    const c = this.camera.getBoundingClientRect(), w = this.world.getBoundingClientRect();
    const left = (w.left-c.left)/(c.width/640);
    this.starPath = left > 150 ? {x:200, y:24, dx:22, dy:21} : {x:135, y:31, dx:42, dy:23};
    if (!this.wishSeen) {
      this.wishSeen = true;
      try { localStorage.setItem('shootingStarMessageSeen', 'true'); } catch {}
      this.say('make a wish ♡', 167, 71);
    }
    this.requestDraw();
  }
  say(text, x, y) {
    clearTimeout(this.bubbleTimer);
    this.bubble.textContent = text;
    this.bubble.hidden = false;
    this.anchor = { x, y };
    this.position();
    this.bubbleTimer = setTimeout(() => this.hide(), 1900);
  }
  hide() { clearTimeout(this.bubbleTimer); this.bubble.hidden = true; }
  position() {
    if (this.bubble.hidden) return;
    const c = this.camera.getBoundingClientRect(), w = this.world.getBoundingClientRect(), s = c.width / 640;
    this.bubble.style.left = `${Math.round(Math.max(12, Math.min(w.width - this.bubble.offsetWidth - 12, c.x-w.x+this.anchor.x*s-this.bubble.offsetWidth/2)))}px`;
    this.bubble.style.top = `${Math.round(Math.max(12, Math.min(w.height - this.bubble.offsetHeight - 12, c.y-w.y+this.anchor.y*s-this.bubble.offsetHeight-8)))}px`;
  }
  get shifting() { const age = this.time() - this.dreamAt; return age >= 0 && age < 450; }
  draw(ctx) {
    if (!this.sleeping || this.motion.matches) return;
    const age = this.time() - this.starAt;
    if (age < 0 || age >= 1000) return;
    const f = Math.floor(age / 50) / 20;
    const path = this.starPath;
    const x = path.x + Math.floor(f*path.dx), y = path.y + Math.floor(f*path.dy);
    // Remains inside one window pane; integer trail pixels, no interpolation.
    for (let i = 5; i >= 0; i--) {
      ctx.globalAlpha = (1-i/7) * Math.min(1, (1000-age)/180);
      ctx.fillStyle = i ? '#c8b7ec' : '#fff1d3';
      ctx.fillRect(x-i*2, y-i, i ? 2 : 3, 1);
    }
    ctx.globalAlpha = 1;
    if (age > 100 && age < 850) ctx.drawImage(this.sparkles[Math.floor(age/170)%5], x-2, y-3);
  }
}
