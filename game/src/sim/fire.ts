import { EMBER_RATE, FIRE_BURN_S, FIRE_CELL, SIM_DT, SIM_HZ, WORLD_SIZE } from "../config";
import { nextRandom } from "./rng";
import { trees } from "./scenery";
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

/** Cells covered by a house footprint (about 7 m square). */
export function houseCells(x: number, z: number): number[] {
  const out: number[] = [];
  for (let dz = -3; dz <= 3; dz += 2) for (let dx = -3; dx <= 3; dx += 2) {
    const idx = fireCellIndex(x + dx, z + dz);
    if (idx >= 0 && !out.includes(idx)) out.push(idx);
  }
  return out;
}

/**
 * Authored fuel map: the grove burns hard, meadow grass barely carries fire, paths and water never burn.
 * The village adds fuel where there is something to burn: side woods, thatch and timber, dry wheat.
 */
export function createFireGrid(village = false): FireGrid {
  const size = FIRE_N * FIRE_N;
  const fuel: number[] = new Array(size).fill(0);
  const g = LAYOUT.grove;
  for (let idx = 0; idx < size; idx += 1) {
    const [x, z] = fireCellCenter(idx);
    if (isWater(x, z) || pathDistance(x, z) < 1.6) continue;
    const dg = Math.hypot(x - g.x, z - g.z);
    fuel[idx] = dg < g.r ? 1 : dg < g.r + 3 ? 0.45 : 0.18;
  }
  if (village) {
    for (const t of trees()) {
      if (t.grove) continue;
      const idx = fireCellIndex(t.x, t.z);
      if (idx >= 0 && fuel[idx] > 0) fuel[idx] = Math.max(fuel[idx], 0.85);
    }
    for (const h of [...LAYOUT.houses, LAYOUT.site]) for (const idx of houseCells(h.x, h.z)) fuel[idx] = 0.7;
    const f = LAYOUT.field;
    for (let dz = -f.d / 2; dz <= f.d / 2; dz += FIRE_CELL) for (let dx = -f.w / 2; dx <= f.w / 2; dx += FIRE_CELL) {
      const idx = fireCellIndex(f.x + dx, f.z + dz);
      if (idx >= 0) fuel[idx] = 0.5;
    }
  }
  return {
    n: FIRE_N,
    cell: FIRE_CELL,
    fuel,
    burn: new Array(size).fill(0),
    scorched: new Array(size).fill(0),
    wet: new Array(size).fill(0),
    cause: new Array(size).fill(0),
  };
}

export function igniteAt(world: World, x: number, z: number, radius: number, byGod = true): number {
  const f = world.fire;
  let count = 0;
  for (let dz = -radius; dz <= radius; dz += FIRE_CELL / 2) {
    for (let dx = -radius; dx <= radius; dx += FIRE_CELL / 2) {
      if (dx * dx + dz * dz > radius * radius) continue;
      const idx = fireCellIndex(x + dx, z + dz);
      if (idx < 0 || f.burn[idx] > 0 || f.fuel[idx] <= 0.05 || f.wet[idx] > 0 || inSanctuary(world, idx)) continue;
      f.burn[idx] = Math.round(FIRE_BURN_S * SIM_HZ);
      f.cause[idx] = byGod ? 1 : 0;
      count += 1;
    }
  }
  if (count) world.events.push({ type: "ignite", x, z, cells: count });
  return count;
}

export function inSanctuary(world: World, idx: number): boolean {
  if (!world.sanctuaries.length) return false;
  const [x, z] = fireCellCenter(idx);
  return world.sanctuaries.some((s) => Math.hypot(x - s.x, z - s.z) < s.r);
}

/**
 * Fire spread. With no drought and no wind this is exactly the M1 rule (0.9·fuel³ per second per
 * neighbour). Drought adds a term that lets dry grass carry fire; wind skews it downwind.
 */
export function stepFire(world: World): void {
  const f = world.fire;
  const n = f.n;
  const dry = world.climate?.dryness ?? 0;
  const [wx, wz] = world.climate?.wind ?? [0, 0];
  const windy = wx !== 0 || wz !== 0;
  const ignitions: number[] = [];
  const causes: number[] = [];
  for (let idx = 0; idx < f.burn.length; idx += 1) {
    if (f.wet[idx] > 0) f.wet[idx] -= 1;
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
        if (f.burn[nIdx] > 0 || f.scorched[nIdx] || f.fuel[nIdx] <= 0.05 || f.wet[nIdx] > 0) continue;
        const fuel = f.fuel[nIdx];
        const diag = di && dj ? 0.7 : 1;
        let p = 0.9 * fuel * fuel * fuel * SIM_DT * diag;
        if (dry > 0) p += dry * dry * 0.36 * fuel * SIM_DT * diag;
        if (windy) {
          const len = Math.hypot(di, dj);
          p *= Math.max(0.15, 1 + 1.8 * ((di / len) * wx + (dj / len) * wz));
        }
        if (nextRandom(world) < p && !inSanctuary(world, nIdx)) {
          ignitions.push(nIdx);
          causes.push(f.cause[idx]);
        }
      }
    }
    // Embers: in drought and wind a burning cell can throw a spot fire 3–5 cells downwind, over firebreaks.
    if (windy && dry > 0.4) {
      const wl = Math.hypot(wx, wz);
      if (nextRandom(world) < EMBER_RATE * (dry - 0.4) * wl * 2.5 * SIM_DT) {
        const reach = 3 + Math.floor(nextRandom(world) * 3);
        const ei = i + Math.round((wx / wl) * reach);
        const ej = j + Math.round((wz / wl) * reach);
        if (ei >= 0 && ej >= 0 && ei < n && ej < n) {
          const eIdx = ej * n + ei;
          if (f.burn[eIdx] === 0 && !f.scorched[eIdx] && f.fuel[eIdx] > 0.2 && f.wet[eIdx] === 0 && !inSanctuary(world, eIdx)) {
            ignitions.push(eIdx);
            causes.push(f.cause[idx]);
          }
        }
      }
    }
    if (f.burn[idx] === 0) {
      f.scorched[idx] = 1;
      f.fuel[idx] = 0;
    }
  }
  ignitions.forEach((idx, k) => {
    if (f.burn[idx] === 0 && !f.scorched[idx]) {
      f.burn[idx] = Math.round(FIRE_BURN_S * SIM_HZ);
      f.cause[idx] = causes[k];
    }
  });
}

/** Put out burning cells within a radius (rain, buckets). Returns how many were put out. */
export function extinguish(world: World, x: number, z: number, radius: number, wetTicks: number): number {
  const f = world.fire;
  let out = 0;
  for (let dz = -radius; dz <= radius; dz += FIRE_CELL / 2) {
    for (let dx = -radius; dx <= radius; dx += FIRE_CELL / 2) {
      if (dx * dx + dz * dz > radius * radius) continue;
      const idx = fireCellIndex(x + dx, z + dz);
      if (idx < 0) continue;
      if (f.burn[idx] > 0) {
        f.burn[idx] = 0;
        f.fuel[idx] *= 0.5; // partly burnt
        out += 1;
      }
      f.wet[idx] = Math.max(f.wet[idx], wetTicks);
    }
  }
  return out;
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
export function nearestBurning(f: FireGrid, x: number, z: number, radius: number): { x: number; z: number; d: number; idx: number } | null {
  let best: { x: number; z: number; d: number; idx: number } | null = null;
  const r2 = radius * radius;
  for (let idx = 0; idx < f.burn.length; idx += 1) {
    if (f.burn[idx] <= 0) continue;
    const [cx, cz] = fireCellCenter(idx);
    const d2 = (cx - x) * (cx - x) + (cz - z) * (cz - z);
    if (d2 <= r2 && (!best || d2 < best.d * best.d)) best = { x: cx, z: cz, d: Math.sqrt(d2), idx };
  }
  return best;
}
