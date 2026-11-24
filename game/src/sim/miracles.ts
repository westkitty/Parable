// The seven miracles added after Fireball, Rain and Sanctuary, and the old-god glyph stones that teach them.
// Each miracle changes the land and the villagers, and every villager effect leaves a belief cause.
import {
  BEACON_S,
  FERTILITY_RADIUS,
  HEAL_RADIUS,
  LIGHTNING_HURT_RADIUS,
  RAIN_RADIUS,
  SIM_HZ,
  STONE_RADIUS,
  WIND_RADIUS,
  WIND_S,
} from "../config";
import { shiftBelief, witnesses } from "./belief";
import { createFireGrid, fireCellIndex, igniteAt, nearestBurning } from "./fire";
import { trees } from "./scenery";
import { placeName, remember, setState } from "./settler";
import { answerBeacon } from "./tasks";
import { terrainHeight } from "./terrain";
import type { World } from "./types";
import { addItem } from "./world";

let baseFuel: number[] | null = null;
const fuelOf = (idx: number) => (baseFuel ??= createFireGrid(true).fuel)[idx];

/** Cells of the fire grid within r of (x, z). */
function cellsAround(x: number, z: number, r: number): number[] {
  const out = new Set<number>();
  for (let dz = -r; dz <= r; dz += 1) {
    for (let dx = -r; dx <= r; dx += 1) {
      if (dx * dx + dz * dz > r * r) continue;
      const idx = fireCellIndex(x + dx, z + dz);
      if (idx >= 0) out.add(idx);
    }
  }
  return [...out];
}

/** Healing: wounds close, hunger eases, burnt ground greens again. */
export function castHeal(world: World, x: number, z: number): { healed: string[]; regrown: number } {
  const healed: string[] = [];
  for (const s of world.settlers) {
    if (!s.alive || Math.hypot(s.x - x, s.z - z) > HEAL_RADIUS) continue;
    const was = s.injury;
    s.injury = Math.max(0, s.injury - 0.6);
    s.hunger = Math.max(0, s.hunger - 0.2);
    if (was > 0.05) {
      healed.push(s.name);
      remember(world, s, "was_healed", placeName(x, z), true, "grateful");
      shiftBelief(world, s, "your light healed me", { g: 16, r: -6 });
      if (s.state === "laid_up") setState(world, s, "idle");
    } else shiftBelief(world, s, "your light healed us", { g: 5 });
  }
  let regrown = 0;
  const f = world.fire;
  for (const idx of cellsAround(x, z, HEAL_RADIUS)) {
    if (f.scorched[idx] && f.burn[idx] === 0) {
      f.scorched[idx] = 0;
      f.fuel[idx] = Math.max(f.fuel[idx], fuelOf(idx) * 0.6);
      regrown += 1;
    }
  }
  for (const p of world.plots) if (p.dead && Math.hypot(p.x - x, p.z - z) < HEAL_RADIUS) {
    p.dead = false;
    p.growth = 0.2;
  }
  world.events.push({ type: "miracle", miracle: "heal", x, z });
  return { healed, regrown };
}

/** Lightning: a bolt where the hand points. It splits trees into logs, sets fire, and hurts whoever stands there. */
export function castLightning(world: World, x: number, z: number): { cells: number; hurt: string[]; logs: number } {
  const cells = igniteAt(world, x, z, 1.6, true);
  const hurt: string[] = [];
  for (const s of world.settlers) {
    if (!s.alive) continue;
    const d = Math.hypot(s.x - x, s.z - z);
    if (d > LIGHTNING_HURT_RADIUS) continue;
    s.injury = Math.min(1, s.injury + 0.55 * (1 - d / LIGHTNING_HURT_RADIUS) + 0.15);
    if (s.injury >= 1) s.causeOfDeath = "struck by your lightning";
    hurt.push(s.name);
    remember(world, s, "struck_by_lightning", placeName(x, z), true, "hurt");
    shiftBelief(world, s, "your lightning struck me", { f: 20, r: 22 });
  }
  for (const w of witnesses(world, x, z, 30)) if (!hurt.includes(w.name)) shiftBelief(world, w, "your lightning split the sky", { f: 9, g: hurt.length ? 0 : 2 });
  // A struck tree splits into two logs.
  let logs = 0;
  trees().forEach((t, i) => {
    if (logs || world.felled.includes(i) || Math.hypot(t.x - x, t.z - z) > 2.4) return;
    world.felled.push(i);
    for (const k of [-1, 1]) addItem(world, "log", t.x + k * 1.5, terrainHeight(t.x, t.z) + 0.6, t.z + k * 0.6);
    logs = 2;
  });
  world.events.push({ type: "lightning", x, z });
  world.events.push({ type: "miracle", miracle: "lightning", x, z });
  return { cells, hurt, logs };
}

/** Fertility: the wheat stands tall, the dead plots sprout, scorched meadow comes back. */
export function castFertility(world: World, x: number, z: number): { plots: number; regrown: number } {
  let plots = 0;
  for (const p of world.plots) {
    if (Math.hypot(p.x - x, p.z - z) > FERTILITY_RADIUS) continue;
    p.dead = false;
    p.growth = 1;
    p.moisture = Math.max(p.moisture, 0.8);
    plots += 1;
  }
  let regrown = 0;
  const f = world.fire;
  for (const idx of cellsAround(x, z, FERTILITY_RADIUS * 0.6)) {
    if (f.scorched[idx] && f.burn[idx] === 0) {
      f.scorched[idx] = 0;
      f.fuel[idx] = Math.max(f.fuel[idx], fuelOf(idx) * 0.5);
      regrown += 1;
    }
  }
  for (const w of witnesses(world, x, z, 30)) shiftBelief(world, w, plots ? "you made the wheat stand tall" : "you made the meadow green", { g: plots ? (w.job === "farmer" ? 14 : 9) : 4 });
  world.events.push({ type: "miracle", miracle: "fertility", x, z });
  return { plots, regrown };
}

/** Wind Lash: a gust along the drawn stroke. It blows fire downwind, scatters loose things, knocks people over. */
export function castWind(world: World, x: number, z: number, dx: number, dz: number): { knocked: string[] } {
  const L = Math.hypot(dx, dz) || 1;
  world.gust = { x, z, dx: dx / L, dz: dz / L, ttl: WIND_S * SIM_HZ };
  const knocked: string[] = [];
  for (const s of world.settlers) {
    if (!s.alive || ["held", "airborne", "dead"].includes(s.state) || Math.hypot(s.x - x, s.z - z) > WIND_RADIUS * 0.7) continue;
    knocked.push(s.name);
    s.x += (dx / L) * 1.5;
    s.z += (dz / L) * 1.5;
    s.y = terrainHeight(s.x, s.z);
    s.path = [];
    setState(world, s, "recover");
    shiftBelief(world, s, "your wind knocked me down", { f: 8, r: 3 });
  }
  for (const it of world.items) {
    if (it.state !== "loose" || Math.hypot(it.p[0] - x, it.p[2] - z) > WIND_RADIUS) continue;
    it.v = [it.v[0] + (dx / L) * 9, it.v[1] + 2.5, it.v[2] + (dz / L) * 9];
  }
  world.events.push({ type: "miracle", miracle: "wind", x, z });
  return { knocked };
}

/** Stone Shape: a ring of standing stones rises. Fire cannot cross it; builders use the spare stone. */
export function castStone(world: World, x: number, z: number): { cells: number; toSite: number } {
  world.stoneworks.push({ id: world.nextId++, x, z, r: STONE_RADIUS });
  const f = world.fire;
  const cells = cellsAround(x, z, STONE_RADIUS);
  for (const idx of cells) {
    f.burn[idx] = 0;
    f.fuel[idx] = 0;
  }
  let toSite = 0;
  for (const site of world.sites) {
    if (site.done || Math.hypot(site.x - x, site.z - z) > 10) continue;
    toSite = Math.min(3, site.need - site.have);
    site.have += toSite;
    site.work = Math.max(site.work, Math.min(1, site.have / site.need) - 0.01);
    break;
  }
  for (const w of witnesses(world, x, z, 30)) shiftBelief(world, w, toSite ? "you raised stone for our house" : "you raised standing stones", { g: toSite ? 8 : 4, f: 4 });
  world.events.push({ type: "miracle", miracle: "stone", x, z });
  return { cells: cells.length, toSite };
}

/** Beacon: a pillar of light. The village leaves its work to gather and worship; in a fire it is a refuge. */
export function castBeacon(world: World, x: number, z: number): void {
  world.beacon = { x, z, ttl: BEACON_S * SIM_HZ };
  answerBeacon(world);
  world.events.push({ type: "miracle", miracle: "beacon", x, z });
}

/** Per tick: beacon and gust timers, the gust's wind, and the glyph stones' wake rituals. */
export function stepMiracles(world: World): void {
  if (world.beacon && --world.beacon.ttl <= 0) world.beacon = null;
  if (world.gust) {
    const g = world.gust;
    world.climate.wind = [g.dx * 1.2, g.dz * 1.2];
    if (--g.ttl <= 0) world.gust = null;
  }
  if (world.tick % 5 === 0) checkGlyphStones(world);
}

export function checkGlyphStones(world: World): void {
  for (const g of world.glyphStones) {
    if (g.awake) continue;
    let woke = false;
    if (g.miracle === "heal") {
      woke = world.settlers.some(
        (s) => s.alive && s.injury > 0.1 && Math.hypot(s.x - g.x, s.z - g.z) < 4 && s.memories.some((m) => m.kind === "was_carried_gently" && world.tick - m.tick < 30 * SIM_HZ),
      );
    } else if (g.miracle === "lightning") {
      woke = !!nearestBurning(world.fire, g.x, g.z, 3.5);
    } else if (g.miracle === "fertility") {
      woke = world.clouds.some((c) => !c.held && Math.hypot(c.x - g.x, c.z - g.z) < RAIN_RADIUS);
    } else if (g.miracle === "wind") {
      woke =
        world.items.some((it) => it.state === "loose" && Math.hypot(...it.v) > 10 && Math.hypot(it.p[0] - g.x, it.p[2] - g.z) < 5) ||
        world.settlers.some((s) => s.state === "airborne" && Math.hypot(s.x - g.x, s.z - g.z) < 5);
    } else if (g.miracle === "stone") {
      woke = world.items.filter((it) => it.kind === "log" && it.state === "loose" && it.restTicks > 5 && Math.hypot(it.p[0] - g.x, it.p[2] - g.z) < 3.5).length >= 2;
    }
    if (woke) {
      g.awake = true;
      world.events.push({ type: "stone_awake", miracle: g.miracle });
    }
  }
}
