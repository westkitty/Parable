// World-level systems of the village: seasons and drought, crops, building, houses and fire,
// rain clouds and sanctuaries, and the end of the Dry Year.
import {
  DAY_TICKS,
  DRY_YEAR_DAYS,
  FIRE_BURN_S,
  LIGHTNING_DAY,
  SECOND_STRIKE_DAY,
  RAIN_RADIUS,
  REBUILD_WOOD,
  SIM_HZ,
  SURVIVE_MIN_ALIVE,
  WET_S,
} from "../config";
import { decayBelief, shiftBelief, villageBelief, witnesses } from "./belief";
import { extinguish, fireCellCenter, fireCellIndex, houseCells, igniteAt } from "./fire";
import { placeName, remember } from "./settler";
import { LAYOUT } from "./terrain";
import type { Outcome, World } from "./types";

/** Dryness for a moment of the Dry Year: a wet spring that turns to tinder by day 7. */
export function drynessAt(day: number, dayTick: number): number {
  const t = day - 1 + dayTick / DAY_TICKS;
  return Math.min(1, 0.08 + 0.92 * Math.pow(Math.min(1, t / 6.5), 1.3));
}

export function stepEconomy(world: World): void {
  if (world.scenario !== "village") return;
  if (world.outcome?.ended) return;
  climateTick(world);
  cropsTick(world);
  sitesTick(world);
  housesTick(world);
  granaryTick(world);
  miraclesTick(world);
  outcomeTick(world);
}

function climateTick(world: World): void {
  const c = world.climate;
  if (!c.enabled) return;
  c.dayTick += 1;
  if (c.dayTick >= DAY_TICKS) {
    c.dayTick = 0;
    c.day += 1;
    decayBelief(world);
    world.power = Math.min(100, world.power + 4); // a trickle of faith even on quiet days
    world.events.push({ type: "day", day: c.day, dryness: c.dryness });
  }
  c.dryness = drynessAt(c.day, c.dayTick);
  // Wind from the west-north-west, rising with the drought: it pushes fire from the grove toward the village.
  const strength = 0.25 + 0.55 * c.dryness;
  c.wind = [0.6 * strength, 0.8 * strength];
  if (!c.lightningDone && c.day >= LIGHTNING_DAY && c.dayTick >= Math.round(DAY_TICKS * 0.3)) {
    c.lightningDone = true;
    const g = LAYOUT.grove;
    const x = g.x - 4;
    const z = g.z - 5;
    igniteAt(world, x, z, 2.5, false);
    world.events.push({ type: "lightning", x, z });
  }
  // The second dry storm strikes upwind of the village (stateless: fires on one exact tick, so saves need nothing new).
  if (c.day === SECOND_STRIKE_DAY && c.dayTick === Math.round(DAY_TICKS * 0.45)) {
    const [x, z] = driestGround(world);
    igniteAt(world, x, z, 2.5, false);
    world.events.push({ type: "lightning", x, z });
  }
}

/** The second storm finds the dry grass: of a ring of spots around the village, the one with the most unburnt fuel (upwind wins ties). */
function driestGround(world: World): [number, number] {
  const vc = LAYOUT.villageCentre;
  let best: [number, number] = [vc.x - 18, vc.z - 24];
  let bestFuel = -1;
  for (let k = 0; k < 12; k += 1) {
    const a = (k / 12) * Math.PI * 2 + Math.PI * 1.3; // start upwind (wind blows toward +x,+z)
    const x = vc.x + Math.cos(a) * 30;
    const z = vc.z + Math.sin(a) * 30;
    let fuel = 0;
    for (let dz = -4; dz <= 4; dz += 2) {
      for (let dx = -4; dx <= 4; dx += 2) {
        const idx = fireCellIndex(x + dx, z + dz);
        if (idx >= 0 && !world.fire.scorched[idx] && world.fire.wet[idx] === 0 && world.fire.burn[idx] === 0) fuel += world.fire.fuel[idx];
      }
    }
    if (fuel > bestFuel + 0.5) {
      bestFuel = fuel;
      best = [x, z];
    }
  }
  return best;
}

function cropsTick(world: World): void {
  const dry = world.climate.dryness;
  for (const p of world.plots) {
    if (p.dead) continue;
    p.moisture = Math.max(0, p.moisture - (0.25 + 0.95 * dry) / DAY_TICKS);
    if (p.growth < 1) p.growth = Math.min(1, p.growth + (0.55 * Math.min(1, p.moisture * 1.6)) / DAY_TICKS);
    if (p.moisture <= 0) {
      p.growth -= 0.8 / DAY_TICKS;
      if (p.growth <= 0) {
        p.dead = true;
        p.growth = 0;
      }
    }
  }
}

function sitesTick(world: World): void {
  for (const site of world.sites) {
    if (site.done) continue;
    // Logs the god lays on the site are used directly.
    for (const it of world.items) {
      if (it.kind !== "log" || it.state !== "loose" || it.restTicks < 5 || site.have >= site.need) continue;
      if (Math.hypot(it.p[0] - site.x, it.p[2] - site.z) > 4.6) continue;
      it.state = "gone";
      it.claimedBy = null;
      site.have += 1;
      site.work = Math.min(1, Math.max(site.work, (site.have - 0.5) / site.need));
      for (const w of witnesses(world, site.x, site.z, 26)) shiftBelief(world, w, "you brought wood for the new house", { g: 6 });
      world.events.push({ type: "delivered", settler: -1, res: "wood", to: "site" });
    }
    if (site.have >= site.need && site.work >= 1) {
      site.done = true;
      const existing = world.houses.find((h) => h.id === site.house);
      if (existing) {
        existing.state = "standing";
        existing.builtTick = world.tick;
      } else world.houses.push({ id: site.house, x: site.x, z: site.z, rot: site.rot, state: "standing", builtTick: world.tick });
      for (const idx of houseCells(site.x, site.z)) {
        world.fire.fuel[idx] = 0.7;
        world.fire.scorched[idx] = 0;
      }
      for (const s of world.settlers) if (s.alive) remember(world, s, "built_house", placeName(site.x, site.z), false, "proud");
      // The homeless move in first.
      for (const s of world.settlers) if (s.alive && (world.houses[s.home]?.state ?? "ruin") !== "standing") s.home = site.house;
      world.events.push({ type: "site_done", site: site.id, house: site.house });
    }
  }
}

function housesTick(world: World): void {
  const f = world.fire;
  for (const h of world.houses) {
    if (h.state === "ruin") continue;
    const cells = houseCells(h.x, h.z);
    const burning = cells.some((idx) => f.burn[idx] > 0);
    if (h.state === "standing" && burning) {
      h.state = "burning";
      h.builtTick = world.tick; // reuse as "burning since"
      // Whoever is inside or at the door when the roof catches is scalded before they get out.
      for (const s of world.settlers) {
        if (!s.alive || Math.hypot(s.x - h.x, s.z - h.z) > HOUSE_CATCH_R) continue;
        s.injury = Math.min(1, s.injury + HOUSE_CATCH_HURT);
        if (s.injury >= 1) s.causeOfDeath = "caught in the burning house";
      }
    } else if (h.state === "burning" && !burning) {
      const lost = cells.filter((idx) => f.scorched[idx]).length >= cells.length / 2;
      h.state = lost ? "ruin" : "standing";
      if (lost) {
        const byGod = cells.some((idx) => f.cause[idx] === 1);
        world.events.push({ type: "house_burned", house: h.id });
        for (const s of world.settlers) {
          if (!s.alive || s.home !== h.id) continue;
          remember(world, s, "home_burned", placeName(h.x, h.z), byGod, byGod ? "angry" : "grieving");
          shiftBelief(world, s, byGod ? "your fire burned our home" : "the wildfire took our home", byGod ? { f: 10, r: 30 } : { f: 10 });
        }
        if (!world.sites.some((q) => q.house === h.id && !q.done)) {
          world.sites.push({ id: world.nextId++, kind: "rebuild", house: h.id, x: h.x, z: h.z, rot: h.rot, need: REBUILD_WOOD, have: 0, work: 0, done: false });
        }
      }
    }
  }
  void FIRE_BURN_S;
  void fireCellCenter;
}

/** Fire in the granary eats the stores: one measure of food every two seconds while it burns. */
const HOUSE_CATCH_R = 4.5;
const HOUSE_CATCH_HURT = 0.55;

function granaryTick(world: World): void {
  if (world.tick % (SIM_HZ * 2) !== 0 || world.granary.food <= 0) return;
  const g = world.granary;
  if (houseCells(g.x, g.z).some((idx) => world.fire.burn[idx] > 0)) g.food = Math.max(0, g.food - 1);
}

function miraclesTick(world: World): void {
  for (const c of world.clouds) {
    c.ttl -= 1;
    if (world.tick % 4 !== 0) continue;
    const out = extinguish(world, c.x, c.z, RAIN_RADIUS, Math.round(WET_S * SIM_HZ));
    for (const p of world.plots) if (Math.hypot(p.x - c.x, p.z - c.z) < RAIN_RADIUS + 1) p.moisture = 1;
    const drought = world.climate.dryness > 0.35;
    for (const s of witnesses(world, c.x, c.z, 30)) {
      if (s.memories.some((m) => m.kind === "rain_came" && world.tick - m.tick < 30 * SIM_HZ)) continue;
      remember(world, s, "rain_came", placeName(c.x, c.z), true, "grateful");
      shiftBelief(world, s, out > 0 ? "your rain put out the fire" : drought ? "your rain broke the drought" : "your rain", { g: out > 0 ? 18 : drought ? 14 : 5 });
    }
  }
  world.clouds = world.clouds.filter((c) => c.ttl > 0);
  for (const sa of world.sanctuaries) sa.ttl -= 1;
  world.sanctuaries = world.sanctuaries.filter((s) => s.ttl > 0);
}

export function computeOutcome(world: World, survivedYear: boolean): Outcome {
  const alive = world.settlers.filter((s) => s.alive).length;
  const dead = world.settlers.length - alive;
  const housesStanding = world.houses.filter((h) => h.state === "standing").length;
  const survived = survivedYear && alive >= SURVIVE_MIN_ALIVE && housesStanding >= 1;
  const belief = villageBelief(world);
  const lines = [
    `${alive} of ${world.settlers.length} villagers lived to see the rain${dead ? `; ${dead} died` : ""}.`,
    `${housesStanding} house${housesStanding === 1 ? "" : "s"} still standing; ${world.granary.food} food in the granary.`,
    `Belief in you: ${belief} — ${belief >= 55 ? "they sing your name" : belief >= 30 ? "they pray, mostly" : "they doubt you"}.`,
    `Miracles worked: ${world.miraclesCast}. Learned: ${world.learned.join(", ")}.`,
  ];
  const fallen = world.settlers.filter((s) => !s.alive);
  if (fallen.length) lines.push(`Remembered: ${fallen.map((s) => `${s.name}, ${s.causeOfDeath ?? "lost"}`).join("; ")}.`);
  return {
    ended: true,
    survived,
    tick: world.tick,
    day: world.climate.day,
    alive,
    dead,
    housesStanding,
    belief,
    title: survived ? "The village endured the Dry Year" : alive ? "The Dry Year broke the village" : "The valley is silent",
    lines,
  };
}

function outcomeTick(world: World): void {
  const alive = world.settlers.some((s) => s.alive);
  const yearOver = world.climate.enabled && world.climate.day > DRY_YEAR_DAYS;
  if (!alive || yearOver) {
    if (yearOver) {
      // The rains return: every fire goes out.
      for (let i = 0; i < world.fire.burn.length; i += 1) {
        world.fire.burn[i] = 0;
        world.fire.wet[i] = Math.round(WET_S * SIM_HZ);
      }
      world.climate.dryness = 0.1;
    }
    world.outcome = computeOutcome(world, yearOver && alive);
    world.events.push({ type: "outcome", survived: world.outcome.survived });
  }
}
