// Local wall-clock time is independent of the pauseable animation clock and plant age.
export function stateAt(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  if (hour >= 17 && hour < 22) return "evening";
  return "sleeping";
}
export class RoomTime {
  constructor(onChange, { now = () => new Date() } = {}) {
    this.now = now;
    this.onChange = onChange;
    this.state = stateAt(now());
  }
  check() {
    const next = stateAt(this.now());
    if (next !== this.state) {
      const previous = this.state;
      this.state = next;
      this.onChange(next, previous);
    }
    this.schedule();
  }
  schedule() {
    clearTimeout(this.timer);
    if (typeof document !== "undefined" && document.hidden) return;
    const now = this.now(), boundary = new Date(now);
    const hour = now.getHours();
    boundary.setHours([6, 12, 17, 22, 30].find(h => h > hour), 0, 0, 0);
    // Exact next boundary plus a periodic check catches device clock/timezone changes.
    this.timer = setTimeout(() => this.check(), Math.max(25, Math.min(30000, boundary - now)));
  }
  start() { this.check(); }
  stop() { clearTimeout(this.timer); }
}
