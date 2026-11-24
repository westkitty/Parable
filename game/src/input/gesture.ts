// Pure gesture recogniser for the ritual (ported from the old prototype's analyzeGesture,
// with the resample bug fixed). Screen space: +y points DOWN, so positive signed rotation = clockwise.

export interface GesturePoint {
  x: number;
  y: number;
  t: number;
}

export type GestureResult =
  | { kind: "spiral"; clockwise: boolean; rotation: number }
  | { kind: "zigzag"; turns: number }
  | { kind: "none"; reason: string };

const TAU = Math.PI * 2;

export function pathLength(pts: GesturePoint[]): number {
  let L = 0;
  for (let i = 1; i < pts.length; i += 1) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return L;
}

export function boundingBox(pts: GesturePoint[]): { minX: number; minY: number; maxX: number; maxY: number; w: number; h: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

export function resample(pts: GesturePoint[], n = 42): GesturePoint[] {
  if (pts.length < 2) return pts.slice();
  const total = pathLength(pts);
  if (total <= 0) return [pts[0]];
  const step = total / (n - 1);
  const out: GesturePoint[] = [{ ...pts[0] }];
  let acc = 0;
  let prev = { ...pts[0] };
  let i = 1;
  while (i < pts.length && out.length < n) {
    const cur = pts[i];
    const segment = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    if (acc + segment >= step && segment > 0) {
      const t = (step - acc) / segment;
      const q = { x: prev.x + (cur.x - prev.x) * t, y: prev.y + (cur.y - prev.y) * t, t: prev.t + (cur.t - prev.t) * t };
      out.push(q);
      prev = q;
      acc = 0;
    } else {
      acc += segment;
      prev = { ...cur };
      i += 1;
    }
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] });
  return out;
}

export function totalSignedRotation(pts: GesturePoint[]): number {
  let total = 0;
  for (let i = 2; i < pts.length; i += 1) {
    const a1 = Math.atan2(pts[i - 1].y - pts[i - 2].y, pts[i - 1].x - pts[i - 2].x);
    const a2 = Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x);
    let d = a2 - a1;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    total += d;
  }
  return total;
}

export function countHorizontalTurns(pts: GesturePoint[]): number {
  let turns = 0;
  let dir = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const dx = pts[i].x - pts[i - 1].x;
    if (Math.abs(dx) < 1.2) continue;
    const s = Math.sign(dx);
    if (dir !== 0 && s !== dir) turns += 1;
    dir = s;
  }
  return turns;
}

/** How much the stroke's distance from its centroid changes from one end to the other (spiral, not loop). */
export function radialGrowth(pts: GesturePoint[]): number {
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  cx /= pts.length;
  cy /= pts.length;
  const k = Math.max(3, Math.floor(pts.length / 8));
  const avg = (arr: GesturePoint[]) => arr.reduce((a, p) => a + Math.hypot(p.x - cx, p.y - cy), 0) / arr.length;
  const a = avg(pts.slice(0, k));
  const b = avg(pts.slice(-k));
  return Math.max(a, b) / Math.max(1, Math.min(a, b));
}

/** Classify a finished stroke. Minimum 12 raw points and a 40 px extent so twitches never count. */
export function analyzeGesture(raw: GesturePoint[]): GestureResult {
  if (raw.length < 12) return { kind: "none", reason: "too short" };
  const box = boundingBox(raw);
  if (Math.max(box.w, box.h) < 40) return { kind: "none", reason: "too small" };
  const pts = resample(raw, 42);
  const L = pathLength(pts);
  const rotation = totalSignedRotation(pts);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const closure = Math.hypot(last.x - first.x, last.y - first.y) / Math.max(box.w, box.h);

  if (Math.abs(rotation) > TAU * 1.05 && L > Math.max(box.w, box.h) * 3.0 && closure < 0.85 && radialGrowth(pts) > 1.6) {
    return { kind: "spiral", clockwise: rotation > 0, rotation };
  }

  const turns = countHorizontalTurns(pts);
  const verticalTravel = Math.abs(last.y - first.y);
  // Tuned from the prototype's L > 1.65h (which rejected narrow zigzags); the low-net-rotation
  // test is what separates a deliberate zigzag from a meandering mouse.
  if (box.h > box.w * 1.25 && box.h < 480 && box.w > 24 && verticalTravel > box.h * 0.25 && turns >= 3 && L > box.h * 1.2 && Math.abs(rotation) < TAU * 0.45) {
    return { kind: "zigzag", turns };
  }
  return { kind: "none", reason: "unrecognised" };
}

/** The protected ritual: clockwise spiral arms for RITUAL_ARM_MS; a vertical zigzag while armed = Fireball. */
export class Ritual {
  armedUntil = 0;
  constructor(
    private armMs: number,
    private acceptCounterClockwise: boolean,
  ) {}
  armed(now: number): boolean {
    return now < this.armedUntil;
  }
  disarm(): void {
    this.armedUntil = 0;
  }
  feed(r: GestureResult, now: number): "armed" | "fireball" | null {
    if (r.kind === "spiral" && (r.clockwise || this.acceptCounterClockwise)) {
      this.armedUntil = now + this.armMs;
      return "armed";
    }
    if (r.kind === "zigzag" && this.armed(now)) {
      this.armedUntil = 0;
      return "fireball";
    }
    return null;
  }
}
