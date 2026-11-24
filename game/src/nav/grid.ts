// Deterministic grid A* over the valley (2 m cells). Pure: no three/rapier/DOM imports.
// M1 uses this instead of recast-navigation: the valley has only two buildings, and a
// grid keeps the sim deterministic and dependency-free. Recast stays an option for M2.
import { WORLD_SIZE } from "../config";
import { LAYOUT, inBounds, isWater, terrainSlope } from "../sim/terrain";

export const NAV_CELL = 2;
export const NAV_N = WORLD_SIZE / NAV_CELL;
const half = WORLD_SIZE / 2;

export type PathFn = (ax: number, az: number, bx: number, bz: number) => [number, number][] | null;

export function cellOf(x: number, z: number): [number, number] {
  return [Math.floor((x + half) / NAV_CELL), Math.floor((z + half) / NAV_CELL)];
}
export function cellCenter(i: number, j: number): [number, number] {
  return [i * NAV_CELL - half + NAV_CELL / 2, j * NAV_CELL - half + NAV_CELL / 2];
}

export function buildWalkable(extraBlocked: [number, number, number][] = []): Uint8Array {
  const grid = new Uint8Array(NAV_N * NAV_N);
  const c = LAYOUT.cottage;
  const t = LAYOUT.temple;
  for (let j = 0; j < NAV_N; j += 1) {
    for (let i = 0; i < NAV_N; i += 1) {
      const [x, z] = cellCenter(i, j);
      let ok = inBounds(x, z, 6) && !isWater(x, z) && terrainSlope(x, z) < 0.75;
      // House footprints (rotated squares ~ 6.4 m): the cottage, the village houses and the building site.
      for (const h of [c, ...LAYOUT.houses.slice(1), LAYOUT.site]) {
        const lx = (x - h.x) * Math.cos(-h.rot) - (z - h.z) * Math.sin(-h.rot);
        const lz = (x - h.x) * Math.sin(-h.rot) + (z - h.z) * Math.cos(-h.rot);
        if (Math.abs(lx) < 3.6 && Math.abs(lz) < 3.6) ok = false;
      }
      if (Math.hypot(x - LAYOUT.granary.x, z - LAYOUT.granary.z) < 1.6) ok = false;
      if (Math.hypot(x - LAYOUT.well.x, z - LAYOUT.well.z) < 1.4) ok = false;
      if (Math.hypot(x - LAYOUT.shrine.x, z - LAYOUT.shrine.z) < 1.6) ok = false;
      for (const g of LAYOUT.glyphStones) if (Math.hypot(x - g.x, z - g.z) < 1.1) ok = false;
      const m = LAYOUT.mural;
      if (Math.abs(x - m.x) < 1.2 && Math.abs(z - m.z) < m.len / 2 + 0.2) ok = false;
      if (Math.hypot(x - t.x, z - t.z) < t.r) ok = false;
      for (const [bx, bz, br] of extraBlocked) if (Math.hypot(x - bx, z - bz) < br) ok = false;
      grid[j * NAV_N + i] = ok ? 1 : 0;
    }
  }
  return grid;
}

export function makePathFinder(walkable: Uint8Array): PathFn {
  return (ax, az, bx, bz) => findPath(walkable, ax, az, bx, bz);
}

export function nearestWalkable(walkable: Uint8Array, x: number, z: number, maxRing = 6): [number, number] | null {
  const [ci, cj] = cellOf(x, z);
  for (let r = 0; r <= maxRing; r += 1) {
    for (let dj = -r; dj <= r; dj += 1) {
      for (let di = -r; di <= r; di += 1) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        const i = ci + di;
        const j = cj + dj;
        if (i < 0 || j < 0 || i >= NAV_N || j >= NAV_N) continue;
        if (walkable[j * NAV_N + i]) return [i, j];
      }
    }
  }
  return null;
}

export function findPath(walkable: Uint8Array, ax: number, az: number, bx: number, bz: number): [number, number][] | null {
  const start = nearestWalkable(walkable, ax, az, 2);
  const [gi, gj] = cellOf(bx, bz);
  if (!start || gi < 0 || gj < 0 || gi >= NAV_N || gj >= NAV_N) return null;
  // Goal must be walkable or adjacent to walkable (so a log at a cliff edge is unreachable but one in grass is fine).
  const goal = walkable[gj * NAV_N + gi] ? [gi, gj] : null;
  if (!goal) return null;
  const startIdx = start[1] * NAV_N + start[0];
  const goalIdx = goal[1] * NAV_N + goal[0];
  const g = new Float32Array(NAV_N * NAV_N).fill(Infinity);
  const came = new Int32Array(NAV_N * NAV_N).fill(-1);
  const closed = new Uint8Array(NAV_N * NAV_N);
  const heap: [number, number][] = []; // [f, idx]
  const push = (f: number, idx: number) => {
    heap.push([f, idx]);
    let k = heap.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (heap[p][0] < heap[k][0] || (heap[p][0] === heap[k][0] && heap[p][1] <= heap[k][1])) break;
      [heap[p], heap[k]] = [heap[k], heap[p]];
      k = p;
    }
  };
  const pop = (): [number, number] => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        const less = (a: number, b: number) => heap[a][0] < heap[b][0] || (heap[a][0] === heap[b][0] && heap[a][1] < heap[b][1]);
        if (l < heap.length && less(l, m)) m = l;
        if (r < heap.length && less(r, m)) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  const h = (idx: number) => {
    const dx = Math.abs((idx % NAV_N) - goal[0]);
    const dz = Math.abs(Math.floor(idx / NAV_N) - goal[1]);
    return Math.max(dx, dz) + 0.4142 * Math.min(dx, dz);
  };
  g[startIdx] = 0;
  push(h(startIdx), startIdx);
  let iterations = 0;
  while (heap.length && iterations < 20000) {
    iterations += 1;
    const [, cur] = pop();
    if (closed[cur]) continue;
    closed[cur] = 1;
    if (cur === goalIdx) break;
    const ci = cur % NAV_N;
    const cj = Math.floor(cur / NAV_N);
    for (let dj = -1; dj <= 1; dj += 1) {
      for (let di = -1; di <= 1; di += 1) {
        if (!di && !dj) continue;
        const ni = ci + di;
        const nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= NAV_N || nj >= NAV_N) continue;
        const nIdx = nj * NAV_N + ni;
        if (!walkable[nIdx] || closed[nIdx]) continue;
        if (di && dj && (!walkable[cj * NAV_N + ni] || !walkable[nj * NAV_N + ci])) continue; // no corner cutting
        const cost = g[cur] + (di && dj ? 1.4142 : 1);
        if (cost < g[nIdx]) {
          g[nIdx] = cost;
          came[nIdx] = cur;
          push(cost + h(nIdx), nIdx);
        }
      }
    }
  }
  if (!closed[goalIdx]) return null;
  const cells: number[] = [];
  for (let k = goalIdx; k !== -1; k = came[k]) cells.push(k);
  cells.reverse();
  const pts: [number, number][] = cells.map((idx) => cellCenter(idx % NAV_N, Math.floor(idx / NAV_N)));
  pts[pts.length - 1] = [bx, bz];
  // Light string-pulling: drop collinear points.
  const out: [number, number][] = [pts[0]];
  for (let k = 1; k < pts.length - 1; k += 1) {
    const a = out[out.length - 1];
    const b = pts[k];
    const c = pts[k + 1];
    const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(cross) > 1e-6) out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
