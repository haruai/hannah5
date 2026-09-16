export const PLANT_KEYS = {
  first: "plantFirstVisit",
  last: "plantLastStage",
  bloom: "plantBloomSeen",
};
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dayNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(y, m - 1, d);
  date.setUTCHours(0, 0, 0, 0);
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  )
    return null;
  return date.getTime() / 86400000;
}
export class PlantGrowth {
  constructor(storage) {
    this.storage = storage;
    this.fallback = new Map();
  }
  read(key) {
    try {
      return this.storage?.getItem(key) ?? this.fallback.get(key) ?? null;
    } catch {
      return this.fallback.get(key) ?? null;
    }
  }
  write(key, value) {
    this.fallback.set(key, String(value));
    try {
      this.storage?.setItem(key, String(value));
    } catch {
      /* The plant still works if browser storage is unavailable. */
    }
  }
  inspect(date = new Date()) {
    const today = localDay(date);
    let first = this.read(PLANT_KEYS.first),
      newVisit = false;
    if (dayNumber(first) === null) {
      first = today;
      newVisit = true;
      this.write(PLANT_KEYS.first, first);
      this.write(PLANT_KEYS.last, 1);
      this.write(PLANT_KEYS.bloom, false);
    }
    const elapsed = Math.max(0, dayNumber(today) - dayNumber(first));
    const calculated = Math.min(5, elapsed + 1);
    const raw = Number(this.read(PLANT_KEYS.last));
    const previous = Number.isInteger(raw) && raw >= 1 && raw <= 5 ? raw : 1;
    // Do not visibly shrink after a timezone or clock correction.
    const stage = Math.max(calculated, previous);
    return {
      stage,
      previous,
      first,
      newVisit,
      advanced: stage > previous,
      final: stage === 5 && this.read(PLANT_KEYS.bloom) !== "true",
    };
  }
  commit(state) {
    this.write(PLANT_KEYS.last, state.stage);
    if (state.stage === 5) this.write(PLANT_KEYS.bloom, true);
  }
}
