// Pure terrain description shared by simulation, navigation, physics and rendering.
// The valley layout is authored (fixed), not randomised: it is a composed miniature.
import { hash2 } from "./rng";
import { WORLD_SIZE } from "../config";

export const LAYOUT = {
  pond: { x: -30, z: 18, r: 15 },
  stream: { ax: -34, az: 30, bx: -58, bz: 82 },
  grove: { x: -8, z: -24, r: 13 },
  meadow: { x: 2, z: 4 },
  cottage: { x: 14, z: 12, rot: -0.35 },
  woodpile: { x: 20.5, z: 16.5 },
  temple: { x: 36, z: -36, r: 6.5, doorX: 31.2, doorZ: -31.6 },
  spawnLogs: [
    { x: 4, z: -6 },
    { x: -3, z: 2 },
    { x: 8, z: -14 },
  ],
} as const;

const NOISE_SEED = 7331;
const half = WORLD_SIZE / 2;

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, z: number): number {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const fx = x - xi;
  const fz = z - zi;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash2(xi, zi, NOISE_SEED);
  const b = hash2(xi + 1, zi, NOISE_SEED);
  const c = hash2(xi, zi + 1, NOISE_SEED);
  const d = hash2(xi + 1, zi + 1, NOISE_SEED);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

export function fbm(x: number, z: number): number {
  let sum = 0;
  let amp = 0.5;
  let f = 1 / 18;
  for (let i = 0; i < 4; i += 1) {
    sum += amp * valueNoise(x * f, z * f);
    amp *= 0.5;
    f *= 2.03;
  }
  return sum; // ~0..0.94
}

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

export function terrainHeight(x: number, z: number): number {
  let h = 1.3 + (fbm(x, z) - 0.45) * 2.2;
  // Rim hills that frame the miniature.
  const edge = Math.max(Math.abs(x), Math.abs(z)) / half;
  h += smoothstep(0.58, 1.0, edge) * 16 + smoothstep(0.75, 1.0, edge) * fbm(x * 2, z * 2) * 10;
  // Temple rise.
  const t = LAYOUT.temple;
  const dt = Math.hypot(x - t.x, z - t.z);
  h += 7.5 * (1 - smoothstep(4, 22, dt));
  if (dt < 9) h = h * smoothstep(7, 9, dt) + (1.3 + 7.5) * (1 - smoothstep(7, 9, dt)); // flat temple platform
  // Cottage yard is flattened.
  const c = LAYOUT.cottage;
  const dc = Math.hypot(x - c.x - 3, z - c.z - 2);
  const yard = 1 - smoothstep(6, 11, dc);
  h = h * (1 - yard) + 1.4 * yard;
  // Pond basin and the stream that leaves it.
  const p = LAYOUT.pond;
  const dp = Math.hypot(x - p.x, z - p.z) / p.r;
  const basin = 1 - smoothstep(0.45, 1.05, dp);
  h = h * (1 - basin) - 2.4 * basin;
  const s = LAYOUT.stream;
  const ds = distToSegment(x, z, s.ax, s.az, s.bx, s.bz);
  const channel = 1 - smoothstep(1.8, 5.5, ds);
  h = h * (1 - channel) - 1.3 * channel;
  return h;
}

export function terrainSlope(x: number, z: number): number {
  const e = 0.8;
  const dx = (terrainHeight(x + e, z) - terrainHeight(x - e, z)) / (2 * e);
  const dz = (terrainHeight(x, z + e) - terrainHeight(x, z - e)) / (2 * e);
  return Math.hypot(dx, dz);
}

export function isWater(x: number, z: number): boolean {
  return terrainHeight(x, z) < 0.12;
}

export function inBounds(x: number, z: number, margin = 4): boolean {
  return Math.abs(x) < half - margin && Math.abs(z) < half - margin;
}

/** Distance to the authored dirt paths (cottage -> meadow -> grove, cottage -> temple). */
export function pathDistance(x: number, z: number): number {
  const c = LAYOUT.cottage;
  const g = LAYOUT.grove;
  const t = LAYOUT.temple;
  return Math.min(
    distToSegment(x, z, c.x - 2, c.z + 1, 2, 2),
    distToSegment(x, z, 2, 2, g.x + 6, g.z + 9),
    distToSegment(x, z, c.x + 4, c.z - 2, 22, -14),
    distToSegment(x, z, 22, -14, t.doorX - 1, t.doorZ + 1),
  );
}
