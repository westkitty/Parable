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
