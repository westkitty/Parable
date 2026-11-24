import { FIRE_BURN_S, FIRE_CELL, SIM_DT, SIM_HZ, WORLD_SIZE } from "../config";
import { nextRandom } from "./rng";
import { LAYOUT, isWater, pathDistance } from "./terrain";
import type { FireGrid, World } from "./types";

const half = WORLD_SIZE / 2;
export const FIRE_N = WORLD_SIZE / FIRE_CELL;

export function fireCellCenter(idx: number): [number, number] {
  const i = idx % FIRE_N;
  const j = Math.floor(idx / FIRE_N);
  return [i * FIRE_CELL - half + FIRE_CELL / 2, j * FIRE_CELL - half + FIRE_CELL / 2];
}
export function fireCellIndex(x: number, z: number): number {
  const i = Math.floor((x + half) / FIRE_CELL);
  const j = Math.floor((z + half) / FIRE_CELL);
  if (i < 0 || j < 0 || i >= FIRE_N || j >= FIRE_N) return -1;
  return j * FIRE_N + i;
}

/** Authored fuel map: the grove burns hard, meadow grass barely carries fire, paths and water never burn. */
export function createFireGrid(): FireGrid {
  const fuel: number[] = new Array(FIRE_N * FIRE_N).fill(0);
  const g = LAYOUT.grove;
  for (let idx = 0; idx < fuel.length; idx += 1) {
    const [x, z] = fireCellCenter(idx);
    if (isWater(x, z) || pathDistance(x, z) < 1.6) continue;
    const dg = Math.hypot(x - g.x, z - g.z);
    fuel[idx] = dg < g.r ? 1 : dg < g.r + 3 ? 0.45 : 0.18;
  }
  return { n: FIRE_N, cell: FIRE_CELL, fuel, burn: new Array(FIRE_N * FIRE_N).fill(0), scorched: new Array(FIRE_N * FIRE_N).fill(0) };
}

export function igniteAt(world: World, x: number, z: number, radius: number): number {
  const f = world.fire;
  let count = 0;
  for (let dz = -radius; dz <= radius; dz += FIRE_CELL / 2) {
    for (let dx = -radius; dx <= radius; dx += FIRE_CELL / 2) {
      if (dx * dx + dz * dz > radius * radius) continue;
      const idx = fireCellIndex(x + dx, z + dz);
      if (idx < 0 || f.burn[idx] > 0 || f.fuel[idx] <= 0.05) continue;
      f.burn[idx] = Math.round(FIRE_BURN_S * SIM_HZ);
      count += 1;
    }
  }
  if (count) world.events.push({ type: "ignite", x, z, cells: count });
  return count;
}

export function stepFire(world: World): void {
  const f = world.fire;
  const n = f.n;
  const ignitions: number[] = [];
  for (let idx = 0; idx < f.burn.length; idx += 1) {
    if (f.burn[idx] <= 0) continue;
    f.burn[idx] -= 1;
    const i = idx % n;
    const j = Math.floor(idx / n);
    for (let dj = -1; dj <= 1; dj += 1) {
      for (let di = -1; di <= 1; di += 1) {
        if (!di && !dj) continue;
        const ni = i + di;
        const nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= n || nj >= n) continue;
        const nIdx = nj * n + ni;
        if (f.burn[nIdx] > 0 || f.scorched[nIdx] || f.fuel[nIdx] <= 0.05) continue;
        const fuel = f.fuel[nIdx];
        const p = 0.9 * fuel * fuel * fuel * SIM_DT * (di && dj ? 0.7 : 1);
        if (nextRandom(world) < p) ignitions.push(nIdx);
      }
    }
    if (f.burn[idx] === 0) {
      f.scorched[idx] = 1;
      f.fuel[idx] = 0;
    }
  }
  for (const idx of ignitions) {
    if (f.burn[idx] === 0 && !f.scorched[idx]) f.burn[idx] = Math.round(FIRE_BURN_S * SIM_HZ);
  }
}

export function burningCount(f: FireGrid): number {
  let c = 0;
  for (const b of f.burn) if (b > 0) c += 1;
  return c;
}
export function scorchedCount(f: FireGrid): number {
  let c = 0;
  for (const s of f.scorched) if (s) c += 1;
  return c;
}
/** Nearest burning cell within radius, or null. */
export function nearestBurning(f: FireGrid, x: number, z: number, radius: number): { x: number; z: number; d: number } | null {
  let best: { x: number; z: number; d: number } | null = null;
  for (let idx = 0; idx < f.burn.length; idx += 1) {
    if (f.burn[idx] <= 0) continue;
    const [cx, cz] = fireCellCenter(idx);
    const d = Math.hypot(cx - x, cz - z);
    if (d <= radius && (!best || d < best.d)) best = { x: cx, z: cz, d };
  }
  return best;
}
