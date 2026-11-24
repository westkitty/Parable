// Village life: needs, jobs and emergencies. Every job is real work in the world: walk to the
// thing, spend time doing it, carry the result to where it is used.
import {
  BUILD_S,
  CHOP_S,
  DAY_TICKS,
  EAT_S,
  ENERGY_DAYS,
  FARM_S,
  FETCH_S,
  FOOD_PER_HARVEST,
  HEAL_PER_DAY,
  HUNGER_DAYS,
  LAID_UP_AT,
  PAINT_MIN_VILLAGE_BELIEF,
  PAINT_S,
  POWER_MAX,
  PRAY_MIN_BELIEF,
  PRAY_S,
  REST_S,
  SETTLER_FLEE_SPEED,
  SETTLER_WALK_SPEED,
  SIM_DT,
  SIM_HZ,
  SMOKE_HURT_PER_S,
  STARVE_PER_DAY,
  TEND_HEAL,
  TEND_S,
  WET_S,
  WOODPILE_TARGET,
} from "../config";
import type { PathFn } from "../nav/grid";
import { beliefScore, shiftBelief, villageBelief, witnesses } from "./belief";
import { extinguish, fireCellCenter, fireCellIndex, inSanctuary, nearestBurning } from "./fire";
import { nextRandom } from "./rng";
import { trees } from "./scenery";
import { ability, chooseLog, claimLog, dropCarried, followPath, lineOfSight, placeName, remember, setState, startFlee } from "./settler";
import { LAYOUT, isWater, pathDistance, terrainHeight } from "./terrain";
import type { Settler, SettlerState, Task, World } from "./types";
import { addItem, getSettler } from "./world";

const VC = LAYOUT.villageCentre;
const WORKING: SettlerState[] = ["chopping", "building", "farming", "dousing", "clearing", "fetching", "hauling", "walking", "to_log", "carrying", "pickup", "stacking", "painting"];

// ---------------- body ----------------
export function bodyTick(world: World, s: Settler): void {
  if (dieIfFatal(world, s, s.causeOfDeath === "thrown by the god")) return;
  s.hunger = Math.min(1, s.hunger + 1 / (HUNGER_DAYS * DAY_TICKS));
  if (WORKING.includes(s.state)) s.energy = Math.max(0, s.energy - 1 / (ENERGY_DAYS * DAY_TICKS));
  if (s.hunger >= 1) {
    s.injury = Math.min(1, s.injury + STARVE_PER_DAY / DAY_TICKS);
    if (s.injury >= 1) s.causeOfDeath = "starved";
  } else if (s.injury > 0) s.injury = Math.max(0, s.injury - HEAL_PER_DAY / DAY_TICKS);
  // Standing in fire burns.
  const idx = fireCellIndex(s.x, s.z);
  if (idx >= 0 && world.fire.burn[idx] > 0 && !inSanctuary(world, idx)) {
    s.injury = Math.min(1, s.injury + 0.15 * SIM_DT);
    if (s.injury >= 1) s.causeOfDeath = world.fire.cause[idx] ? "burned in your fire" : "burned in the wildfire";
  } else if (idx >= 0 && besideFire(world, idx)) {
    // Smoke: standing at the fire's edge (fleeing late, or fighting it with buckets) chokes and scalds.
    s.injury = Math.min(1, s.injury + SMOKE_HURT_PER_S * SIM_DT);
    if (s.injury >= 1) s.causeOfDeath = "choked on the smoke";
  }
  dieIfFatal(world, s, world.fire.cause[idx] === 1 || s.causeOfDeath === "thrown by the god");
}

function besideFire(world: World, idx: number): boolean {
  const f = world.fire;
  const n = f.n;
  const i = idx % n;
  const j = Math.floor(idx / n);
  for (let dj = -1; dj <= 1; dj += 1) {
    for (let di = -1; di <= 1; di += 1) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && nj >= 0 && ni < n && nj < n && f.burn[nj * n + ni] > 0) return !inSanctuary(world, idx);
    }
  }
  return false;
}

export function dieIfFatal(world: World, s: Settler, byGod: boolean): boolean {
  if (s.injury < 1 || !s.alive) return false;
  s.alive = false;
  s.diedTick = world.tick;
  if (!s.causeOfDeath) s.causeOfDeath = "wounds";
  dropCarried(world, s);
  releaseClaims(world, s);
  s.carryRes = null;
  s.task = null;
  s.path = [];
  setState(world, s, "dead");
  world.events.push({ type: "died", settler: s.id, cause: s.causeOfDeath });
  for (const o of world.settlers) {
    if (!o.alive || o.id === s.id) continue;
    const rel = o.relationships.find((r) => r.id === s.id);
    if (rel) {
      remember(world, o, "friend_died", placeName(s.x, s.z), byGod, "grieving", s.id);
      shiftBelief(world, o, byGod ? `you killed ${s.name}` : `${s.name} died`, byGod ? { f: 10, r: 30 * rel.affinity + 6 } : { f: 6 });
    } else if (byGod) shiftBelief(world, o, `you killed ${s.name}`, { f: 8, r: 6 });
  }
  return true;
}

/** A beacon was raised: villagers drop what they are doing (not fleeing or laid up) and come. */
export function answerBeacon(world: World): void {
  for (const s of world.settlers) {
    if (!s.alive || !WORKING.includes(s.state) || s.task?.kind === "shelter") continue;
    if (s.carrying != null) dropCarried(world, s);
    releaseClaims(world, s);
    finish(world, s);
  }
}

export function releaseClaims(world: World, s: Settler): void {
  for (const it of world.items) if (it.claimedBy === s.id) it.claimedBy = null;
  if (s.carryRes === "wood" && s.task?.kind === "build") world.woodpile.count += 1; // drop the plank back
  s.carryRes = null;
  s.task = null;
}

// ---------------- emergencies ----------------
function refuge(world: World, s: Settler): { x: number; z: number } | undefined {
  let best: { x: number; z: number } | undefined;
  let bd = 45;
  // A beacon is a refuge too, when it is not itself in the fire.
  if (world.beacon && !nearestBurning(world.fire, world.beacon.x, world.beacon.z, 8)) {
    bd = Math.hypot(world.beacon.x - s.x, world.beacon.z - s.z);
    if (bd < 60) best = { x: world.beacon.x, z: world.beacon.z };
    else bd = 45;
  }
  for (const sa of world.sanctuaries) {
    const d = Math.hypot(sa.x - s.x, sa.z - s.z);
    if (d < bd) {
      bd = d;
      best = { x: sa.x, z: sa.z };
    }
  }
  return best;
}

function inAnySanctuary(world: World, s: Settler): boolean {
  return world.sanctuaries.some((sa) => Math.hypot(sa.x - s.x, sa.z - s.z) < sa.r - 0.5);
}

/** Fire: the brave fight it, the rest run (to a Sanctuary if there is one). Returns true if it took over the tick. */
export function villageFireResponse(world: World, s: Settler, findPath: PathFn): boolean {
  if ((s.state === "flee" || s.state === "cower") && s.task?.kind === "shelter" && inAnySanctuary(world, s)) {
    startShelter(world, s);
    return true;
  }
  if (["flee", "cower", "recover", "dead", "sheltering", "laid_up"].includes(s.state)) return false;
  if ((world.tick + s.id) % 4 !== 0) return false;
  const fire = nearestBurning(world.fire, s.x, s.z, 34);
  if (!fire) return false;
  const byGod = world.tick <= world.godFireUntil || world.fire.cause[fire.idx] === 1;
  const seen = lineOfSight(s.x, s.z, fire.x, fire.z);
  if (seen && !s.memories.some((m) => m.kind === "saw_fire" && world.tick - m.tick < 40 * SIM_HZ)) {
    remember(world, s, "saw_fire", placeName(fire.x, fire.z), byGod, "scared");
    shiftBelief(world, s, byGod ? `your fire at ${placeName(fire.x, fire.z)}` : `wildfire at ${placeName(fire.x, fire.z)}`, byGod ? { f: 16, r: 3 } : { f: 7 });
  }
  if (inAnySanctuary(world, s)) {
    if (s.task?.kind !== "shelter") startShelter(world, s);
    return true;
  }
  const danger = 5 + 9 * (1 - s.bravery) + (s.injury > 0.3 ? 6 : 0);
  if ((fire.d < danger && seen) || fire.d < 3.2) {
    if (s.task?.kind === "douse" && s.state === "dousing") return false; // finishing the throw
    const r = refuge(world, s);
    startFlee(world, s, fire.x, fire.z, findPath, r);
    if (r) s.task = { kind: "shelter", phase: 0, tx: r.x, tz: r.z, ref: -1, ticks: 0 };
    return true;
  }
  // Fight it if it threatens the village and they are fit.
  const threat = nearestBurning(world.fire, VC.x, VC.z, 36);
  if (!threat || s.injury >= LAID_UP_AT) return false;
  const busy = s.task && (s.task.kind === "douse" || s.task.kind === "firebreak");
  if (busy || s.hunger > 0.85 || s.energy < 0.08) return false;
  if (s.job === "builder" || (s.job === "woodcutter" && s.bravery < 0.5)) {
    const cell = firebreakCell(world, threat.x, threat.z);
    if (cell >= 0) {
      const [cx, cz] = fireCellCenter(cell);
      abandon(world, s);
      if (beginTask(world, s, { kind: "firebreak", phase: 0, tx: cx, tz: cz, ref: cell, ticks: 0 }, findPath)) return true;
    }
  }
  if (s.job === "water" || s.job === "hauler" || s.job === "woodcutter" || s.job === "farmer" || s.bravery > 0.6) {
    abandon(world, s);
    if (beginTask(world, s, { kind: "douse", phase: 0, tx: LAYOUT.well.x + 1.6, tz: LAYOUT.well.z, ref: threat.idx, ticks: 0 }, findPath)) return true;
  }
  return false;
}

/** A burnable cell between the fire and the village, on a ring around the houses. */
function firebreakCell(world: World, fx: number, fz: number): number {
  const f = world.fire;
  const ang = Math.atan2(fz - VC.z, fx - VC.x);
  const claimed = new Set(world.settlers.filter((o) => o.task?.kind === "firebreak").map((o) => o.task!.ref));
  for (const ring of [19, 23, 27]) {
    for (let k = 0; k < 13; k += 1) {
      const a = ang + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.13;
      const idx = fireCellIndex(VC.x + Math.cos(a) * ring, VC.z + Math.sin(a) * ring);
      if (idx < 0 || claimed.has(idx) || f.fuel[idx] <= 0.05 || f.burn[idx] > 0 || f.scorched[idx]) continue;
      const [cx, cz] = fireCellCenter(idx);
      if (isWater(cx, cz) || pathDistance(cx, cz) < 1.6) continue;
      return idx;
    }
  }
  return -1;
}

function abandon(world: World, s: Settler): void {
  if (s.carrying != null) dropCarried(world, s);
  releaseClaims(world, s);
  s.path = [];
}

function startShelter(world: World, s: Settler): void {
  const sa = world.sanctuaries.find((q) => Math.hypot(q.x - s.x, q.z - s.z) < q.r);
  abandon(world, s);
  s.task = { kind: "shelter", phase: 1, tx: sa?.x ?? s.x, tz: sa?.z ?? s.z, ref: sa?.id ?? -1, ticks: 0 };
  if (!s.memories.some((m) => m.kind === "sheltered" && world.tick - m.tick < 60 * SIM_HZ)) {
    remember(world, s, "sheltered", placeName(s.x, s.z), true, "grateful");
    shiftBelief(world, s, "your sanctuary kept us safe", { g: 15, f: -6 });
  }
  setState(world, s, "sheltering");
}

// ---------------- task engine ----------------
function beginTask(world: World, s: Settler, task: Task, findPath: PathFn): boolean {
  const path = findPath(s.x, s.z, task.tx, task.tz);
  if (!path) return false;
  s.task = task;
  s.path = path;
  setState(world, s, "walking");
  return true;
}

function leg(world: World, s: Settler, tx: number, tz: number, findPath: PathFn): boolean {
  const t = s.task!;
  t.phase += 1;
  t.tx = tx;
  t.tz = tz;
  const path = findPath(s.x, s.z, tx, tz);
  if (!path) {
    finish(world, s);
    return false;
  }
  s.path = path;
  setState(world, s, s.carryRes ? "hauling" : "walking");
  return true;
}

function finish(world: World, s: Settler): void {
  if (s.carryRes === "wood" && s.task?.kind === "build") world.woodpile.count += 1;
  s.carryRes = null;
  s.task = null;
  s.path = [];
  setState(world, s, "idle");
}

const secs = (world: World, s: Settler, base: number, skill = 1) => (base * SIM_HZ) / Math.max(0.25, skill * ability(world, s));

/** States the village task engine owns. Returns true when it handled the tick. */
export function villageWorkTick(world: World, s: Settler, findPath: PathFn): boolean {
  const t = s.task;
  switch (s.state) {
    case "walking":
    case "hauling": {
      if (!t) {
        setState(world, s, "idle");
        return true;
      }
      if (t.kind === "tend") {
        const p = getSettler(world, t.ref);
        if (!p || !p.alive) return finish(world, s), true;
        if (Math.hypot(p.x - t.tx, p.z - t.tz) > 2.5 && world.tick >= s.repathAt) {
          t.tx = p.x;
          t.tz = p.z;
          s.path = findPath(s.x, s.z, p.x, p.z) ?? [];
          s.repathAt = world.tick + SIM_HZ;
        }
      }
      const speed = (t.kind === "shelter" ? SETTLER_FLEE_SPEED : SETTLER_WALK_SPEED * (s.carryRes ? 0.9 : 1)) * ability(world, s);
      const done = followPath(s, speed);
      if (done || Math.hypot(s.x - t.tx, s.z - t.tz) < 1.4) arrive(world, s, findPath);
      return true;
    }
    case "chopping":
    case "fetching":
    case "building":
    case "farming":
    case "dousing":
    case "clearing":
    case "eating":
    case "resting":
    case "tending":
    case "praying":
    case "painting":
      if (!t) {
        setState(world, s, "idle");
        return true;
      }
      if (s.stateTicks >= t.ticks) complete(world, s, findPath);
      return true;
    case "laid_up":
      if (s.injury < 0.35) {
        s.task = null;
        setState(world, s, "idle");
      }
      return true;
    case "sheltering": {
      const sa = world.sanctuaries.find((q) => q.id === t?.ref) ?? world.sanctuaries.find((q) => Math.hypot(q.x - s.x, q.z - s.z) < q.r);
      const fire = nearestBurning(world.fire, s.x, s.z, 26);
      if (!sa || (!fire && s.stateTicks > 3 * SIM_HZ)) finish(world, s);
      return true;
    }
    case "dead":
      return true;
    default:
      return false;
  }
}

function face(s: Settler, x: number, z: number): void {
  s.heading = Math.atan2(x - s.x, z - s.z);
}

function arrive(world: World, s: Settler, findPath: PathFn): void {
  const t = s.task!;
  s.path = [];
  switch (t.kind) {
    case "chop": {
      const tr = trees()[t.ref];
      if (world.felled.includes(t.ref) || !tr) return finish(world, s);
      face(s, tr.x, tr.z);
      t.ticks = secs(world, s, CHOP_S, s.skill.woodcutter);
      return setState(world, s, "chopping");
    }
    case "build":
      if (t.phase === 0) {
        t.ticks = secs(world, s, FETCH_S);
        face(s, world.woodpile.x, world.woodpile.z);
        return setState(world, s, "fetching");
      }
      face(s, siteOf(world, t.ref)?.x ?? s.x, siteOf(world, t.ref)?.z ?? s.z);
      t.ticks = secs(world, s, BUILD_S, s.skill.builder);
      return setState(world, s, "building");
    case "farm":
      if (t.phase === 0) {
        t.ticks = secs(world, s, FARM_S, s.skill.farmer);
        return setState(world, s, "farming");
      }
      t.ticks = secs(world, s, FETCH_S);
      return setState(world, s, "fetching");
    case "water_field":
    case "douse":
      if (t.phase === 0) {
        t.ticks = secs(world, s, FETCH_S * (1 + 4 * world.climate.dryness)); // the well runs low in the drought
        face(s, LAYOUT.well.x, LAYOUT.well.z);
        return setState(world, s, "fetching");
      }
      t.ticks = secs(world, s, 1.6, s.skill.water);
      if (t.kind === "douse") {
        const [cx, cz] = fireCellCenter(t.ref);
        face(s, cx, cz);
        return setState(world, s, "dousing");
      }
      return setState(world, s, "farming");
    case "firebreak":
      t.ticks = secs(world, s, 4, s.skill.builder);
      return setState(world, s, "clearing");
    case "eat":
      t.ticks = secs(world, s, EAT_S);
      return setState(world, s, "eating");
    case "rest":
      if (t.ref === 1) return setState(world, s, "laid_up");
      t.ticks = REST_S * SIM_HZ;
      return setState(world, s, "resting");
    case "tend": {
      const p = getSettler(world, t.ref);
      if (!p || !p.alive) return finish(world, s);
      face(s, p.x, p.z);
      t.ticks = secs(world, s, TEND_S, s.skill.carer);
      return setState(world, s, "tending");
    }
    case "pray":
      face(s, LAYOUT.mural.x, LAYOUT.mural.z);
      t.ticks = PRAY_S * SIM_HZ;
      return setState(world, s, t.phase === 0 ? "praying" : "painting");
    case "shelter":
      return startShelter(world, s);
    case "haul_log":
      return finish(world, s);
    case "gather": {
      const b = world.beacon;
      if (!b) return finish(world, s);
      face(s, b.x, b.z);
      t.ticks = Math.max(SIM_HZ, b.ttl);
      if (!s.memories.some((m) => m.kind === "gathered_at_beacon" && world.tick - m.tick < 60 * SIM_HZ)) {
        remember(world, s, "gathered_at_beacon", placeName(b.x, b.z), true, "awed");
        shiftBelief(world, s, "we gathered at your beacon", { g: 4, f: 1 });
        world.power = Math.min(POWER_MAX, world.power + 1);
      }
      return setState(world, s, "praying");
    }
  }
  void findPath;
}

function complete(world: World, s: Settler, findPath: PathFn): void {
  const t = s.task!;
  switch (t.kind) {
    case "gather":
      return finish(world, s);
    case "chop": {
      const tr = trees()[t.ref];
      if (!world.felled.includes(t.ref)) {
        world.felled.push(t.ref);
        const idx = fireCellIndex(tr.x, tr.z);
        if (idx >= 0) world.fire.fuel[idx] = Math.min(world.fire.fuel[idx], 0.35);
        const a = tr.rot;
        for (const k of [-1, 1]) {
          const x = tr.x + Math.cos(a) * 1.6 * k;
          const z = tr.z + Math.sin(a) * 1.6 * k;
          const it = addItem(world, "log", x, Math.max(terrainHeight(x, z), 0) + 0.45, z);
          const yaw = a + Math.PI / 2;
          it.q = [0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)];
        }
        world.events.push({ type: "felled", tree: t.ref, settler: s.id });
      }
      return finish(world, s);
    }
    case "build": {
      const site = siteOf(world, t.ref);
      if (t.phase === 0) {
        if (!site || site.done || world.woodpile.count <= 0) return finish(world, s);
        world.woodpile.count -= 1;
        s.carryRes = "wood";
        leg(world, s, site.x + Math.sin(s.id) * 5, site.z + Math.cos(s.id) * 5, findPath);
        return;
      }
      if (site && !site.done) {
        if (s.carryRes === "wood") {
          site.have = Math.min(site.need, site.have + 1);
          world.events.push({ type: "delivered", settler: s.id, res: "wood", to: "site" });
        }
        site.work = Math.min(1, site.have / site.need);
      }
      s.carryRes = null;
      return finish(world, s);
    }
    case "farm": {
      const plot = world.plots[t.ref];
      if (t.phase === 0) {
        if (plot.dead) {
          plot.dead = false;
          plot.growth = 0.05;
          return finish(world, s);
        }
        if (plot.growth >= 1) {
          plot.growth = 0.05;
          s.carryRes = "food";
          world.events.push({ type: "harvest", plot: t.ref, food: FOOD_PER_HARVEST });
          leg(world, s, world.granary.x - 1.8, world.granary.z, findPath);
          return;
        }
        return finish(world, s);
      }
      if (s.carryRes === "food") {
        world.granary.food += FOOD_PER_HARVEST;
        world.events.push({ type: "delivered", settler: s.id, res: "food", to: "granary" });
      }
      s.carryRes = null;
      return finish(world, s);
    }
    case "water_field":
    case "douse": {
      if (t.phase === 0) {
        s.carryRes = "water";
        if (t.kind === "water_field") {
          const p = world.plots[t.ref];
          leg(world, s, p.x, p.z + 1.3, findPath);
        } else {
          const fire = nearestBurning(world.fire, VC.x, VC.z, 40) ?? nearestBurning(world.fire, s.x, s.z, 40);
          if (!fire) return finish(world, s);
          t.ref = fire.idx;
          const d = Math.hypot(fire.x - s.x, fire.z - s.z) || 1;
          leg(world, s, fire.x - ((fire.x - s.x) / d) * 2.6, fire.z - ((fire.z - s.z) / d) * 2.6, findPath);
        }
        return;
      }
      if (t.kind === "water_field") {
        const p = world.plots[t.ref];
        p.moisture = Math.min(1, p.moisture + 0.7);
        world.events.push({ type: "delivered", settler: s.id, res: "water", to: "field" });
      } else {
        const [cx, cz] = fireCellCenter(t.ref);
        const n = extinguish(world, cx, cz, 2.3, Math.round(WET_S * 0.4 * SIM_HZ));
        world.events.push({ type: "doused", settler: s.id, cells: n });
      }
      s.carryRes = null;
      return finish(world, s);
    }
    case "firebreak": {
      const f = world.fire;
      const n = f.n;
      const i = t.ref % n;
      const j = Math.floor(t.ref / n);
      for (const [di, dj] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const idx = (j + dj) * n + (i + di);
        if (idx >= 0 && idx < f.fuel.length && f.burn[idx] === 0) f.fuel[idx] = Math.min(f.fuel[idx], 0.02);
      }
      return finish(world, s);
    }
    case "eat":
      if (world.granary.food > 0) {
        world.granary.food -= 1;
        s.hunger = 0;
      } else {
        remember(world, s, "went_hungry", "the granary", false, "hungry");
      }
      return finish(world, s);
    case "rest":
      s.energy = 1;
      return finish(world, s);
    case "tend": {
      const p = getSettler(world, t.ref);
      if (p && p.alive) {
        p.injury = Math.max(0, p.injury - TEND_HEAL);
        remember(world, p, "was_tended", placeName(p.x, p.z), false, "grateful", s.id);
      }
      return finish(world, s);
    }
    case "pray": {
      if (t.phase === 0) {
        const gain = 3 + s.piety * 5;
        world.power = Math.min(POWER_MAX, world.power + gain);
        s.lastPrayDay = world.climate.day;
        world.events.push({ type: "prayed", settler: s.id, power: gain });
        if (world.mural.progress < 1 && villageBelief(world) >= PAINT_MIN_VILLAGE_BELIEF) {
          t.phase = 1;
          t.ticks = secs(world, s, PAINT_S, 0.6 + s.piety);
          setState(world, s, "painting");
          return;
        }
        return finish(world, s);
      }
      const before = world.mural.progress;
      world.mural.progress = Math.min(1, world.mural.progress + 0.07 + 0.05 * s.piety);
      if (before < 1 && world.mural.progress >= 1) world.events.push({ type: "mural_done" });
      return finish(world, s);
    }
    default:
      return finish(world, s);
  }
}

function siteOf(world: World, id: number) {
  return world.sites.find((q) => q.id === id);
}

// ---------------- choosing what to do ----------------
function takenBy(world: World, kind: Task["kind"], ref: number, except: number): boolean {
  return world.settlers.some((o) => o.id !== except && o.alive && o.task?.kind === kind && o.task.ref === ref);
}

function homeDoor(world: World, s: Settler): [number, number] {
  const h = world.houses[s.home] ?? world.houses[0];
  return [h.x + Math.sin(h.rot) * 5.4, h.z + Math.cos(h.rot) * 5.4];
}

function nearestTree(world: World, s: Settler): number {
  const all = trees();
  let best = -1;
  let bd = 60;
  for (let i = 0; i < all.length; i += 1) {
    const t = all[i];
    if (world.felled.includes(i)) continue;
    const idx = fireCellIndex(t.x, t.z);
    if (idx >= 0 && (world.fire.burn[idx] > 0 || world.fire.scorched[idx])) continue;
    const d = Math.hypot(t.x - s.x, t.z - s.z) + (t.grove ? 0 : 6);
    if (d < bd && !takenBy(world, "chop", i, s.id)) {
      bd = d;
      best = i;
    }
  }
  return best;
}

function chopTask(world: World, s: Settler, findPath: PathFn): boolean {
  const i = nearestTree(world, s);
  if (i < 0) return false;
  const t = trees()[i];
  const d = Math.hypot(t.x - s.x, t.z - s.z) || 1;
  return beginTask(world, s, { kind: "chop", phase: 0, tx: t.x - ((t.x - s.x) / d) * 1.3, tz: t.z - ((t.z - s.z) / d) * 1.3, ref: i, ticks: 0 }, findPath);
}

function buildTask(world: World, s: Settler, findPath: PathFn): boolean {
  const site = world.sites.find((q) => !q.done && q.have < q.need);
  if (!site || world.woodpile.count <= 0) return false;
  const carrying = world.settlers.filter((o) => o.task?.kind === "build" && o.task.ref === site.id).length;
  if (site.have + carrying >= site.need) return false;
  return beginTask(world, s, { kind: "build", phase: 0, tx: world.woodpile.x - 1.6, tz: world.woodpile.z + 0.8, ref: site.id, ticks: 0 }, findPath);
}

function farmTask(world: World, s: Settler, findPath: PathFn): boolean {
  let best = -1;
  for (let i = 0; i < world.plots.length; i += 1) {
    const p = world.plots[i];
    if ((p.growth >= 1 || p.dead) && !takenBy(world, "farm", i, s.id)) {
      best = i;
      break;
    }
  }
  if (best < 0) return false;
  const p = world.plots[best];
  return beginTask(world, s, { kind: "farm", phase: 0, tx: p.x, tz: p.z + 1.3, ref: best, ticks: 0 }, findPath);
}

function waterTask(world: World, s: Settler, findPath: PathFn, below: number): boolean {
  let best = -1;
  let low = below;
  for (let i = 0; i < world.plots.length; i += 1) {
    const p = world.plots[i];
    if (!p.dead && p.moisture < low && !takenBy(world, "water_field", i, s.id)) {
      low = p.moisture;
      best = i;
    }
  }
  if (best < 0) return false;
  return beginTask(world, s, { kind: "water_field", phase: 0, tx: LAYOUT.well.x + 1.6, tz: LAYOUT.well.z, ref: best, ticks: 0 }, findPath);
}

function haulTask(world: World, s: Settler, findPath: PathFn, maxD = 60): boolean {
  const log = chooseLog(world, s, maxD);
  return !!log && claimLog(world, s, log, findPath);
}

function tendTask(world: World, s: Settler, findPath: PathFn): boolean {
  let best: Settler | null = null;
  let worst = 0.22;
  for (const p of world.settlers) {
    if (!p.alive || p.id === s.id || p.injury < worst || takenBy(world, "tend", p.id, s.id)) continue;
    worst = p.injury;
    best = p;
  }
  if (!best) return false;
  return beginTask(world, s, { kind: "tend", phase: 0, tx: best.x, tz: best.z, ref: best.id, ticks: 0 }, findPath);
}

function prayTask(world: World, s: Settler, findPath: PathFn): boolean {
  if (s.lastPrayDay >= world.climate.day || beliefScore(s) < PRAY_MIN_BELIEF || s.belief.resentment > 60) return false;
  if (nextRandom(world) > 0.02 + s.piety * 0.04) return false; // spread prayers across the day
  const m = LAYOUT.mural;
  const k = (s.id % 5) - 2;
  return beginTask(world, s, { kind: "pray", phase: 0, tx: m.x + 2.6, tz: m.z + k * 1.4, ref: 0, ticks: 0 }, findPath);
}

export function villageIdle(world: World, s: Settler, findPath: PathFn): void {
  if (world.outcome?.ended) return;
  // Stagger decisions so twelve villagers do not all path-find on the same tick.
  if ((world.tick + s.id * 3) % 5 !== 0) return;
  if (s.injury >= LAID_UP_AT) {
    const [hx, hz] = homeDoor(world, s);
    if (Math.hypot(hx - s.x, hz - s.z) < 2) {
      s.task = { kind: "rest", phase: 0, tx: hx, tz: hz, ref: 1, ticks: 0 };
      setState(world, s, "laid_up");
      return;
    }
    if (beginTask(world, s, { kind: "rest", phase: 0, tx: hx, tz: hz, ref: 1, ticks: 0 }, findPath)) return;
    setState(world, s, "laid_up");
    return;
  }
  // The god's beacon: the village leaves its work and gathers to worship.
  if (world.beacon && s.hunger < 0.9) {
    const b = world.beacon;
    const a = (s.id * 2.399) % (Math.PI * 2);
    const tx = b.x + Math.cos(a) * 3.2;
    const tz = b.z + Math.sin(a) * 3.2;
    if (Math.hypot(s.x - tx, s.z - tz) < 1.6) {
      s.task = { kind: "gather", phase: 1, tx, tz, ref: 0, ticks: 0 };
      return arrive(world, s, findPath);
    }
    if (beginTask(world, s, { kind: "gather", phase: 0, tx, tz, ref: 0, ticks: 0 }, findPath)) return;
  }
  if (s.hunger > 0.6 && world.granary.food > 0) {
    if (beginTask(world, s, { kind: "eat", phase: 0, tx: world.granary.x - 1.8, tz: world.granary.z + 1, ref: 0, ticks: 0 }, findPath)) return;
  }
  if (s.energy < 0.28) {
    const [hx, hz] = homeDoor(world, s);
    if (beginTask(world, s, { kind: "rest", phase: 0, tx: hx, tz: hz, ref: 0, ticks: 0 }, findPath)) return;
  }
  if (s.job === "carer" && tendTask(world, s, findPath)) return;
  if (prayTask(world, s, findPath)) return;
  const fallbacks: Record<Settler["job"], ((w: World, s: Settler, f: PathFn) => boolean)[]> = {
    woodcutter: [(w, q, f) => haulTask(w, q, f, 25), (w, q, f) => w.woodpile.count < WOODPILE_TARGET && chopTask(w, q, f), haulTask],
    hauler: [haulTask, buildTask, (w, q, f) => waterTask(w, q, f, 0.35)],
    builder: [buildTask, haulTask, (w, q, f) => w.woodpile.count < 4 && chopTask(w, q, f)],
    farmer: [farmTask, (w, q, f) => waterTask(w, q, f, 0.45), haulTask],
    water: [(w, q, f) => waterTask(w, q, f, 0.6), farmTask, haulTask],
    carer: [tendTask, farmTask, haulTask],
  };
  for (const fn of fallbacks[s.job]) if (fn(world, s, findPath)) return;
  // Nothing to do: drift home.
  const [hx, hz] = homeDoor(world, s);
  if (Math.hypot(s.x - hx, s.z - hz) > 7 && s.stateTicks > SIM_HZ) {
    const path = findPath(s.x, s.z, hx, hz);
    if (path) {
      s.path = path;
      setState(world, s, "returning");
    }
  }
}

/** Belief bookkeeping for things the god does with the hand near the village. */
export function godGaveWood(world: World, x: number, z: number): void {
  for (const w of witnesses(world, x, z, 24)) shiftBelief(world, w, "you brought wood for the new house", { g: 6 });
}
