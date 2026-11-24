import { mulberry32Step } from "../src/sim/rng";
import type { GesturePoint } from "../src/input/gesture";

export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    const r = mulberry32Step(s);
    s = r.state;
    return r.value;
  };
}

/** A hand-drawn-ish spiral: 1.6–2.6 turns, growing radius, jitter. Screen y down: clockwise = +angle. */
export function spiral(seed: number, clockwise: boolean): GesturePoint[] {
  const r = rng(seed);
  const cx = 300 + r() * 400;
  const cy = 200 + r() * 300;
  const turns = 1.6 + r() * 1.0;
  const r0 = 8 + r() * 10;
  const r1 = 60 + r() * 60;
  const n = 90 + Math.floor(r() * 50);
  const start = r() * Math.PI * 2;
  const squash = 0.8 + r() * 0.4;
  const pts: GesturePoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const f = i / (n - 1);
    const a = start + (clockwise ? 1 : -1) * f * turns * Math.PI * 2;
    const rad = r0 + (r1 - r0) * f;
    pts.push({ x: cx + Math.cos(a) * rad + (r() - 0.5) * 3, y: cy + Math.sin(a) * rad * squash + (r() - 0.5) * 3, t: i * 16 });
  }
  return pts;
}

/** A vertical zigzag: 4–6 strokes left/right while travelling down (or up). */
export function zigzag(seed: number): GesturePoint[] {
  const r = rng(seed);
  const x0 = 300 + r() * 400;
  const y0 = 150 + r() * 200;
  const height = 160 + r() * 140;
  const width = 40 + r() * 50;
  const legs = 4 + Math.floor(r() * 3);
  const down = r() < 0.8;
  const pts: GesturePoint[] = [];
  let t = 0;
  for (let leg = 0; leg < legs; leg += 1) {
    const ax = leg % 2 === 0 ? x0 : x0 + width;
    const bx = leg % 2 === 0 ? x0 + width : x0;
    const ay = y0 + (height * leg) / legs;
    const by = y0 + (height * (leg + 1)) / legs;
    for (let k = 0; k < 12; k += 1) {
      const f = k / 12;
      const y = down ? ay + (by - ay) * f : y0 + height - (ay - y0 + (by - ay) * f);
      pts.push({ x: ax + (bx - ax) * f + (r() - 0.5) * 3, y: y + (r() - 0.5) * 3, t: (t += 16) });
    }
  }
  return pts;
}

/** Ordinary mouse wandering: smooth random-walk strokes, lines, and gentle arcs. */
export function wander(seed: number): GesturePoint[] {
  const r = rng(seed);
  let x = 200 + r() * 600;
  let y = 150 + r() * 400;
  let heading = r() * Math.PI * 2;
  const speed = 4 + r() * 8;
  const curve = (r() - 0.5) * 0.12;
  const n = 30 + Math.floor(r() * 90);
  const pts: GesturePoint[] = [];
  for (let i = 0; i < n; i += 1) {
    heading += curve + (r() - 0.5) * 0.35;
    x += Math.cos(heading) * speed;
    y += Math.sin(heading) * speed;
    pts.push({ x, y, t: i * 16 });
  }
  return pts;
}

/** A horizontal wave: the zigzag on its side, 4–6 strokes up/down while travelling sideways. */
export function wave(seed: number): GesturePoint[] {
  return zigzag(seed).map((p, i, all) => {
    const c = all[0];
    return { x: c.x + (p.y - c.y), y: c.y + (p.x - c.x), t: p.t ?? i * 16 };
  });
}

/** One hand-drawn closed loop, either direction, slightly squashed, with a little overlap. */
export function ring(seed: number): GesturePoint[] {
  const r = rng(seed);
  const cx = 300 + r() * 400;
  const cy = 200 + r() * 300;
  const rad = 50 + r() * 70;
  const squash = 0.8 + r() * 0.35;
  const dir = r() < 0.5 ? 1 : -1;
  const sweep = 1.02 + r() * 0.12;
  const n = 60 + Math.floor(r() * 40);
  const start = r() * Math.PI * 2;
  const pts: GesturePoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const a = start + dir * (i / (n - 1)) * sweep * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * rad + (r() - 0.5) * 3, y: cy + Math.sin(a) * rad * squash + (r() - 0.5) * 3, t: i * 16 });
  }
  return pts;
}

/** A hand-drawn polyline through corners, with jitter and uneven speed. */
function polyline(seed: number, corners: [number, number][], n = 60): GesturePoint[] {
  const r = rng(seed);
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < corners.length; i += 1) {
    const d = Math.hypot(corners[i][0] - corners[i - 1][0], corners[i][1] - corners[i - 1][1]);
    segs.push(d);
    total += d;
  }
  const pts: GesturePoint[] = [];
  for (let k = 0; k < n; k += 1) {
    let d = (k / (n - 1)) * total;
    let i = 0;
    while (i < segs.length - 1 && d > segs[i]) {
      d -= segs[i];
      i += 1;
    }
    const f = Math.min(1, d / segs[i]);
    const [ax, ay] = corners[i];
    const [bx, by] = corners[i + 1];
    pts.push({ x: ax + (bx - ax) * f + (r() - 0.5) * 4, y: ay + (by - ay) * f + (r() - 0.5) * 4, t: k * 16 });
  }
  return pts;
}

export function line(seed: number, dir: "down" | "up" | "side"): GesturePoint[] {
  const r = rng(seed);
  const cx = 300 + r() * 400;
  const cy = 250 + r() * 300;
  const len = 120 + r() * 160;
  const lean = (r() - 0.5) * 0.5;
  const [dx, dy] = dir === "side" ? [len * (r() < 0.5 ? 1 : -1), len * lean] : [len * lean, dir === "down" ? len : -len];
  return polyline(seed + 7, [
    [cx, cy],
    [cx + dx, cy + dy],
  ], 40);
}

export function peak(seed: number, flip = false): GesturePoint[] {
  const r = rng(seed);
  const cx = 300 + r() * 400;
  const cy = 300 + r() * 200;
  const w = 90 + r() * 120;
  const h = (90 + r() * 120) * (flip ? -1 : 1);
  return polyline(seed + 3, [
    [cx - w / 2, cy + h / 2],
    [cx + (r() - 0.5) * w * 0.3, cy - h / 2],
    [cx + w / 2, cy + h / 2 + (r() - 0.5) * 20],
  ]);
}

export const vee = (seed: number) => peak(seed, true);

export function closedPoly(seed: number, sides: 3 | 4): GesturePoint[] {
  const r = rng(seed);
  const cx = 300 + r() * 400;
  const cy = 250 + r() * 300;
  const rad = 60 + r() * 70;
  const rot = sides === 4 ? Math.PI / 4 + (r() - 0.5) * 0.4 : -Math.PI / 2 + (r() - 0.5) * 0.4;
  const dir = r() < 0.5 ? 1 : -1;
  const c: [number, number][] = [];
  for (let i = 0; i <= sides; i += 1) {
    const a = rot + dir * (i / sides) * Math.PI * 2;
    c.push([cx + Math.cos(a) * rad * (1 + (r() - 0.5) * 0.15), cy + Math.sin(a) * rad * (1 + (r() - 0.5) * 0.15)]);
  }
  c[sides] = [c[0][0] + (r() - 0.5) * 10, c[0][1] + (r() - 0.5) * 10];
  return polyline(seed + 11, c, 80);
}
