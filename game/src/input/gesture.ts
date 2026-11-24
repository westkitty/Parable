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
  | { kind: "wave"; turns: number } // horizontal zigzag: the Rain glyph's second stroke
  | { kind: "ring"; rotation: number } // one closed loop: the Sanctuary glyph's second stroke
  | { kind: "line"; dir: "down" | "up" | "side" } // one straight stroke: Lightning (down), Fertility (up), Wind Lash (side)
  | { kind: "peak" } // ^ : Beacon
  | { kind: "vee" } // V : Healing
  | { kind: "square" } // closed, four corners: Stone Shape
  | { kind: "triangle" } // closed, three corners: Golem Wake
  | { kind: "none"; reason: string };

/** The ten miracles. Every finisher follows the arming spiral. */
export type Miracle = "fireball" | "rain" | "sanctuary" | "heal" | "lightning" | "fertility" | "wind" | "stone" | "beacon" | "golem";
export const MIRACLES: Miracle[] = ["fireball", "rain", "sanctuary", "heal", "lightning", "fertility", "wind", "stone", "beacon", "golem"];

export function miracleFor(r: GestureResult): Miracle | null {
  switch (r.kind) {
    case "zigzag":
      return "fireball";
    case "wave":
      return "rain";
    case "ring":
      return "sanctuary";
    case "vee":
      return "heal";
    case "line":
      return r.dir === "down" ? "lightning" : r.dir === "up" ? "fertility" : "wind";
    case "square":
      return "stone";
    case "peak":
      return "beacon";
    case "triangle":
      return "golem";
    default:
      return null;
  }
}

/** Ramer-Douglas-Peucker simplification: the stroke's corners. */
export function simplify(pts: GesturePoint[], eps: number): GesturePoint[] {
  if (pts.length < 3) return pts.slice();
  const a = pts[0];
  const b = pts[pts.length - 1];
  let best = -1;
  let bestD = 0;
  const L = Math.hypot(b.x - a.x, b.y - a.y);
  for (let i = 1; i < pts.length - 1; i += 1) {
    const p = pts[i];
    const d = L < 1e-6 ? Math.hypot(p.x - a.x, p.y - a.y) : Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / L;
    if (d > bestD) {
      bestD = d;
      best = i;
    }
  }
  if (bestD <= eps) return [a, b];
  const left = simplify(pts.slice(0, best + 1), eps);
  const right = simplify(pts.slice(best), eps);
  return [...left.slice(0, -1), ...right];
}

/** Corners of a closed stroke (the start/end join counts once). */
function closedCorners(pts: GesturePoint[], eps: number): number {
  // Split at the point farthest from the start so RDP sees two open halves.
  let far = 0;
  let farD = 0;
  pts.forEach((p, i) => {
    const d = Math.hypot(p.x - pts[0].x, p.y - pts[0].y);
    if (d > farD) {
      farD = d;
      far = i;
    }
  });
  const a = simplify(pts.slice(0, far + 1), eps);
  const b = simplify(pts.slice(far), eps);
  const ring = [...a.slice(0, -1), ...b.slice(0, -1)];
  // Drop near-straight vertices (turn < 35 degrees).
  let n = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const p0 = ring[(i - 1 + ring.length) % ring.length];
    const p1 = ring[i];
    const p2 = ring[(i + 1) % ring.length];
    const a1 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const a2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let d = Math.abs(a2 - a1);
    if (d > Math.PI) d = TAU - d;
    if (d > 0.61) n += 1;
  }
  return n;
}

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

export function countVerticalTurns(pts: GesturePoint[]): number {
  let turns = 0;
  let dir = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const dy = pts[i].y - pts[i - 1].y;
    if (Math.abs(dy) < 1.2) continue;
    const s = Math.sign(dy);
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

/** Spread of distances from the centroid, relative to their mean: 0 for a perfect circle. */
export function roundness(pts: GesturePoint[]): number {
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  cx /= pts.length;
  cy /= pts.length;
  const d = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
  const mean = d.reduce((a, b) => a + b, 0) / d.length;
  const sd = Math.sqrt(d.reduce((a, b) => a + (b - mean) ** 2, 0) / d.length);
  return sd / Math.max(1, mean);
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
  // Wave: the zigzag turned on its side (rain falling in sheets).
  const vturns = countVerticalTurns(pts);
  const horizontalTravel = Math.abs(last.x - first.x);
  if (box.w > box.h * 1.25 && box.w < 560 && box.h > 24 && horizontalTravel > box.w * 0.25 && vturns >= 3 && L > box.w * 1.2 && Math.abs(rotation) < TAU * 0.45) {
    return { kind: "wave", turns: vturns };
  }
  // Ring: one loop that closes on itself and keeps its radius (a spiral grows; a ring does not).
  const aspect = box.w / Math.max(1, box.h);
  const size = Math.max(box.w, box.h);
  // Closes: the end comes back near the start (it may overshoot a little past it).
  let gap = Infinity;
  for (let i = 0; i < Math.ceil(pts.length * 0.3); i += 1) gap = Math.min(gap, Math.hypot(last.x - pts[i].x, last.y - pts[i].y));
  const closedish = gap / size < 0.22 && aspect > 0.45 && aspect < 2.2 && L > size * 2.2;
  if (closedish) {
    const corners = closedCorners(pts, size * 0.07);
    if (corners === 4 && roundness(pts) > 0.06) return { kind: "square" };
    if (corners === 3) return { kind: "triangle" };
  }
  if (Math.abs(rotation) > TAU * 0.8 && Math.abs(rotation) < TAU * 1.45 && gap / size < 0.22 && aspect > 0.6 && aspect < 1.66 && L > size * 2.4 && radialGrowth(pts) < 1.35 && roundness(pts) < 0.12) {
    return { kind: "ring", rotation };
  }
  // Open single strokes: a straight line, a ^ peak or a V.
  const chord = Math.hypot(last.x - first.x, last.y - first.y);
  const corners = simplify(pts, size * 0.1);
  if (simplify(pts, size * 0.05).length === 2 && chord > 100 && L < chord * 1.08) {
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    if (Math.abs(dy) > Math.abs(dx) * 2) return { kind: "line", dir: dy > 0 ? "down" : "up" };
    if (Math.abs(dx) > Math.abs(dy) * 2) return { kind: "line", dir: "side" };
  }
  if (corners.length === 3 && closure > 0.3) {
    const [a, m, b] = corners;
    const legA = Math.hypot(m.x - a.x, m.y - a.y);
    const legB = Math.hypot(b.x - m.x, b.y - m.y);
    const straight = L < (legA + legB) * 1.08 && simplify(pts, size * 0.05).length <= 4;
    const balanced = Math.min(legA, legB) > Math.max(legA, legB) * 0.5 && Math.min(legA, legB) > 60;
    const spread = Math.abs(b.x - a.x) > 0.35 * Math.max(legA, legB);
    if (straight && balanced && spread) {
      if (Math.min(a.y, b.y) - m.y > 0.5 * box.h) return { kind: "peak" };
      if (m.y - Math.max(a.y, b.y) > 0.5 * box.h) return { kind: "vee" };
    }
  }
  return { kind: "none", reason: "unrecognised" };
}

/** The protected ritual: clockwise spiral arms for RITUAL_ARM_MS; then a vertical zigzag = Fireball, a wave = Rain, a ring = Sanctuary. */
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
  feed(r: GestureResult, now: number): "armed" | Miracle | null {
    if (r.kind === "spiral" && (r.clockwise || this.acceptCounterClockwise)) {
      this.armedUntil = now + this.armMs;
      return "armed";
    }
    if (!this.armed(now)) return null;
    const cast = miracleFor(r);
    if (cast) this.armedUntil = 0;
    return cast;
  }
}
