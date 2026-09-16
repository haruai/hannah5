export class IdleScene {
  constructor(random = Math.random) {
    this.random = random;
    this.events = [];
    this.sparkleAt = -Infinity;
    this.petal = null;
    this.breaths = {
      girl: { start: -800, duration: this.range(3600, 4700) },
      cat: { start: -1800, duration: this.range(3800, 4900) },
    };
    this.blink = {
      next: this.range(4200, 6500),
      start: -Infinity,
      double: false,
    };
    this.steam = { start: 0, duration: this.range(2800, 3500), variant: 0 };
    this.details = [
      ["hair-lock", 5600, 11000, 1400],
      ["vine-leaf", 6200, 14000, 1800],
      ["blossom", 7300, 13000, 1500],
      ["tulip", 6700, 12000, 1700],
      ["ribbon", 10500, 17000, 1500],
      ["cat-ear", 10000, 25000, 320],
    ].map(([name, min, max, hold]) => ({
      name,
      min,
      max,
      hold,
      next: this.range(Math.min(min, 5000), Math.min(max, 14000)),
      start: -Infinity,
    }));
    this.nextPetal = this.range(4400, 8000);
    this.nextSparkle = this.range(11000, 18000);
    this.city = {
      next: this.range(6200, 10000),
      start: -Infinity,
      x: 146,
      y: 116,
    };
    this.lamp = { start: 0, duration: this.range(7500, 13000) };
  }
  range(a, b) {
    return a + this.random() * (b - a);
  }
  event(name, t) {
    this.events.push({ name, t });
    if (this.events.length > 100) this.events.shift();
  }
  update(t) {
    const active = [];
    for (const [name, b] of Object.entries(this.breaths)) {
      if (t - b.start > b.duration) {
        b.start = t;
        b.duration = this.range(name === "girl" ? 3600 : 3800, 4900);
      }
      const p = (t - b.start) / b.duration;
      if (p > 0.26 && p < 0.65)
        active.push(name === "girl" ? "shoulder-left" : "cat-inhale");
      if (name === "girl" && p > 0.31 && p < 0.69)
        active.push("shoulder-right");
    }
    for (const d of this.details) {
      if (t >= d.next) {
        d.start = t;
        d.next = t + d.hold + this.range(d.min, d.max);
        this.event(d.name, t);
      }
      const age = t - d.start;
      if (
        age >= 0 &&
        age < d.hold &&
        (d.name !== "cat-ear" || age < 100 || age > 180)
      )
        active.push(d.name);
    }
    if (t >= this.blink.next) {
      this.blink.start = t;
      this.blink.double = this.random() < 0.16;
      this.blink.next = t + this.range(4000, 8000);
      this.event("blink", t);
    }
    let blinkAge = t - this.blink.start;
    if (this.blink.double && blinkAge >= 410) blinkAge -= 410;
    let eye = null;
    if (blinkAge >= 0 && blinkAge < 310)
      eye = blinkAge < 80 || blinkAge >= 220 ? "eyes-half" : "eyes-closed";
    if (eye) active.push(eye);
    if (t - this.steam.start >= this.steam.duration) {
      this.steam.start = t;
      this.steam.duration = this.range(2800, 3600);
      this.steam.variant = this.random() < 0.5 ? 0 : 1;
    }
    if (t >= this.nextPetal && !this.petal) {
      this.petal = {
        start: t,
        duration: this.range(5400, 7000),
        x: this.range(83, 177),
        y: this.range(30, 65),
        drift: this.range(18, 43),
      };
      this.event("petal", t);
    }
    if (this.petal && t - this.petal.start > this.petal.duration) {
      this.petal = null;
      this.nextPetal = t + this.range(4200, 15000);
    }
    if (t >= this.nextSparkle) {
      this.sparkleAt = t;
      this.nextSparkle = t + this.range(10000, 20000);
      this.event("sparkle", t);
    }
    if (t >= this.city.next) {
      const lights = [
        [146, 116],
        [170, 125],
        [131, 128],
        [104, 123],
        [183, 130],
        [118, 119],
      ];
      [this.city.x, this.city.y] =
        lights[Math.floor(this.random() * lights.length)];
      this.city.start = t;
      this.city.next = t + this.range(5500, 12000);
      this.event("city", t);
    }
    if (t - this.lamp.start > this.lamp.duration) {
      this.lamp.start = t;
      this.lamp.duration = this.range(8000, 14000);
    }
    return {
      active,
      eye,
      steamFrame: Math.min(
        4,
        Math.floor(((t - this.steam.start) / this.steam.duration) * 5),
      ),
      steamVariant: this.steam.variant,
      sparkleAge: t - this.sparkleAt,
      cityAge: t - this.city.start,
      lamp:
        Math.sin(((t - this.lamp.start) / this.lamp.duration) * Math.PI) ** 2,
    };
  }
}
