// Deterministic placement of the valley's static scenery (shared by render, physics and fire visuals).
import { hash2 } from "./rng";
import { LAYOUT, isWater, pathDistance, terrainHeight, terrainSlope } from "./terrain";

export type TreeKind = "tree_oak" | "tree_default" | "tree_fat" | "tree_tall" | "tree_pineRoundA" | "tree_pineTallA" | "tree_simple";

export interface Tree {
  kind: TreeKind;
  x: number;
  z: number;
  y: number;
  rot: number;
  scale: number;
  grove: boolean;
}

export interface Prop {
  kind: string;
  x: number;
  z: number;
  y: number;
  rot: number;
  scale: number;
}

function clearOfBuildings(x: number, z: number, margin: number): boolean {
  const c = LAYOUT.cottage;
  const t = LAYOUT.temple;
  const w = LAYOUT.woodpile;
  if (Math.hypot(x - c.x - 2, z - c.z - 1) < 9 + margin) return false;
  if (Math.hypot(x - w.x, z - w.z) < 3 + margin) return false;
  if (Math.hypot(x - t.x, z - t.z) < 11 + margin) return false;
  for (const s of LAYOUT.spawnLogs) if (Math.hypot(x - s.x, z - s.z) < 3) return false;
  // Village footprints (M2): houses, the building site, granary, well, field, wall and shrine.
  for (const h of [...LAYOUT.houses, LAYOUT.site]) if (Math.hypot(x - h.x, z - h.z) < 7.5 + margin) return false;
  for (const p of [LAYOUT.granary, LAYOUT.well]) if (Math.hypot(x - p.x, z - p.z) < 3.5 + margin) return false;
  const f = LAYOUT.field;
  if (Math.abs(x - f.x) < f.w / 2 + 2 + margin && Math.abs(z - f.z) < f.d / 2 + 2 + margin) return false;
  if (Math.hypot(x - LAYOUT.mural.x, z - LAYOUT.mural.z) < LAYOUT.mural.len / 2 + 2 + margin) return false;
  if (Math.hypot(x - LAYOUT.shrine.x, z - LAYOUT.shrine.z) < 6 + margin) return false;
  // Old-god glyph stones and the golem ring (M5).
  for (const g of LAYOUT.glyphStones) if (Math.hypot(x - g.x, z - g.z) < 6 + margin) return false; // a cleared circle round each monolith
  if (Math.hypot(x - LAYOUT.golemForm.x, z - LAYOUT.golemForm.z) < 5 + margin) return false;
  return true;
}

let cachedTrees: Tree[] | null = null;
export function trees(): Tree[] {
  if (cachedTrees) return cachedTrees;
  const out: Tree[] = [];
  const g = LAYOUT.grove;
  const groveKinds: TreeKind[] = ["tree_oak", "tree_default", "tree_fat", "tree_oak", "tree_tall"];
  for (let gz = -16; gz <= 16; gz += 3.4) {
    for (let gx = -16; gx <= 16; gx += 3.4) {
      const jx = (hash2(gx * 10, gz * 10, 11) - 0.5) * 2.6;
      const jz = (hash2(gx * 10, gz * 10, 12) - 0.5) * 2.6;
      const x = g.x + gx + jx;
      const z = g.z + gz + jz;
      const d = Math.hypot(x - g.x, z - g.z);
      if (d > g.r + 1.5 || pathDistance(x, z) < 2) continue;
      if (d > g.r - 2 && hash2(x, z, 13) < 0.4) continue;
      out.push({
        kind: groveKinds[Math.floor(hash2(x, z, 14) * groveKinds.length)],
        x,
        z,
        y: terrainHeight(x, z),
        rot: hash2(x, z, 15) * Math.PI * 2,
        scale: 4.2 + hash2(x, z, 16) * 1.6,
        grove: true,
      });
    }
  }
  // Scattered trees and pines on the valley sides.
  const sideKinds: TreeKind[] = ["tree_pineRoundA", "tree_pineTallA", "tree_simple", "tree_default", "tree_pineRoundA"];
  for (let k = 0; k < 420; k += 1) {
    const x = (hash2(k, 1, 21) - 0.5) * 150;
    const z = (hash2(k, 2, 21) - 0.5) * 150;
    const edge = Math.max(Math.abs(x), Math.abs(z)) / 80;
    const want = edge > 0.62 ? 0.75 : 0.06;
    if (hash2(k, 3, 21) > want) continue;
    if (isWater(x, z) || terrainSlope(x, z) > 1.4 || pathDistance(x, z) < 3 || !clearOfBuildings(x, z, 2)) continue;
    if (Math.hypot(x - g.x, z - g.z) < g.r + 5) continue;
    if (Math.hypot(x - LAYOUT.meadow.x, z - LAYOUT.meadow.z) < 16) continue;
    out.push({
      kind: sideKinds[Math.floor(hash2(x, z, 22) * sideKinds.length)],
      x,
      z,
      y: terrainHeight(x, z),
      rot: hash2(x, z, 23) * Math.PI * 2,
      scale: 3.8 + hash2(x, z, 24) * 2.2,
      grove: false,
    });
  }
  cachedTrees = out;
  return out;
}

let cachedProps: Prop[] | null = null;
/** Bushes, grass tufts, flowers, rocks, stumps, crops. Purely visual. */
export function props(): Prop[] {
  if (cachedProps) return cachedProps;
  const out: Prop[] = [];
  const g = LAYOUT.grove;
  const add = (kind: string, x: number, z: number, scale: number, seed: number) =>
    out.push({ kind, x, z, y: terrainHeight(x, z), rot: hash2(x, z, seed) * Math.PI * 2, scale });
  for (let k = 0; k < 3400; k += 1) {
    const x = (hash2(k, 7, 31) - 0.5) * 152;
    const z = (hash2(k, 8, 31) - 0.5) * 152;
    if (isWater(x, z) || pathDistance(x, z) < 1.6 || !clearOfBuildings(x, z, -3)) continue;
    const r = hash2(k, 9, 31);
    const inGrove = Math.hypot(x - g.x, z - g.z) < g.r;
    const shore = terrainHeight(x, z) < 0.6;
    if (shore) {
      if (r < 0.12) add("grass_large", x, z, 3.2, 32);
      continue;
    }
    if (r < 0.22) add(r < 0.16 ? "grass" : "grass_large", x, z, 3 + hash2(x, z, 33) * 1.6, 34);
    else if (r < 0.4) add(inGrove ? "plant_bushLarge" : "plant_bush", x, z, (r < 0.3 ? 2.2 : 3.2) + hash2(x, z, 35) * 2, 36);
    else if (r < 0.5 && !inGrove) {
      const f = ["flower_yellowA", "flower_redA", "flower_purpleA"][Math.floor(hash2(x, z, 37) * 3)];
      add(f, x, z, 3.4, 38);
    } else if (r < 0.515) add(["rock_largeB", "rock_largeE", "stone_largeC"][Math.floor(hash2(x, z, 39) * 3)], x, z, 2.2 + hash2(x, z, 40) * 2.5, 41);
    else if (r < 0.525) add("stone_smallC", x, z, 3, 42);
    else if (r < 0.54 && inGrove) add("stump_round", x, z, 3.5, 43);
  }
  // A small wheat patch and a campfire ring behind the cottage.
  const c = LAYOUT.cottage;
  for (let i = 0; i < 6; i += 1) for (let j = 0; j < 4; j += 1) add("crops_wheatStageB", c.x - 9 + i * 1.1, c.z + 6 + j * 1.1, 1.9, 44);
  add("campfire_logs", c.x + 2, c.z + 7.5, 5, 45);
  cachedProps = out;
  return out;
}
