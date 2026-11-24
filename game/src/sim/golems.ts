// Golems: vessels of delegated labour (Black & White 2 style, without any creature).
// Four logs the hand lays in the old stone ring at LAYOUT.golemForm become a dormant wooden golem.
// The Golem Wake glyph (spiral, then triangle) wakes it. Where the hand sets it down decides its job:
// by the woodpile it hauls loose logs, at a building site it carries wood and builds, by the well it fights fire.
// Golems are slow, cost prayer power every day they are awake, and fall asleep when the power runs out.
// They only lift, carry, build and douse. There is no code path by which a golem casts a miracle.
import {
  BUILD_S,
  DAY_TICKS,
  GOLEM_JOB_UPKEEP_PER_DAY,
  GOLEM_MAX,
  GOLEM_SPEED,
  GOLEM_UPKEEP_PER_DAY,
  GOLEM_WOOD,
  SETTLER_WALK_SPEED,
  SIM_DT,
  SIM_HZ,
  WET_S,
} from "../config";
import type { PathFn } from "../nav/grid";
import { shiftBelief, witnesses } from "./belief";
import { extinguish, nearestBurning } from "./fire";
import { placeName, remember } from "./settler";
import { LAYOUT, terrainHeight } from "./terrain";
import type { Golem, GolemJob, Item, Site, World } from "./types";
import { addItem } from "./world";

export const GOLEM_RING_RADIUS = 3;
export const GOLEM_WAKE_RADIUS = 10;
export const GOLEM_JOB_RADIUS = 12;
export const GOLEM_DOUSE_RANGE = 36;
const SPEED = GOLEM_SPEED * SETTLER_WALK_SPEED;
const LIFT_TICKS = Math.round(1.2 * SIM_HZ);
const FETCH_TICKS = Math.round(1.5 * SIM_HZ);
const SAW_GOLEM_GAP = DAY_TICKS / 2;

const item = (world: World, id: number | null): Item | undefined => (id == null ? undefined : world.items.find((i) => i.id === id));
const openSite = (world: World): Site | undefined => world.sites.find((s) => !s.done);

/** Logs resting in the golem ring (the hand laid them there). */
export function logsInRing(world: World): Item[] {
  const r = world.golemForm;
  return world.items.filter((it) => it.kind === "log" && it.state === "loose" && it.restTicks >= 8 && Math.hypot(it.p[0] - r.x, it.p[2] - r.z) < GOLEM_RING_RADIUS);
}

function formGolem(world: World): void {
  const r = world.golemForm;
  const logs = logsInRing(world);
  r.wood = Math.min(GOLEM_WOOD, logs.length);
  if (logs.length < GOLEM_WOOD || world.golems.length >= GOLEM_MAX) return;
  if (world.golems.some((g) => !g.awake && Math.hypot(g.x - r.x, g.z - r.z) < GOLEM_RING_RADIUS + 1)) return;
  for (const it of logs.slice(0, GOLEM_WOOD)) {
    it.state = "gone";
    it.claimedBy = null;
  }
  r.wood = 0;
  const g: Golem = {
    id: world.nextId++,
    x: r.x,
    y: terrainHeight(r.x, r.z),
    z: r.z,
    heading: 0,
    wood: GOLEM_WOOD,
    awake: false,
    state: "dormant",
    job: "none",
    stateTicks: 0,
    path: [],
    carrying: null,
    carryWater: false,
    target: null,
    workDone: 0,
  };
  world.golems.push(g);
  for (const w of witnesses(world, r.x, r.z, 26)) shiftBelief(world, w, "you raised a body of wood in the old ring", { f: 4, g: 2 });
  world.events.push({ type: "golem_formed", golem: g.id });
}

/** The Golem Wake glyph: the nearest dormant golem within reach stands up. Returns its id or -1. */
export function wakeGolem(world: World, x: number, z: number): number {
  let best: Golem | null = null;
  let bd = GOLEM_WAKE_RADIUS;
  for (const g of world.golems) {
    if (g.awake) continue;
    const d = Math.hypot(g.x - x, g.z - z);
    if (d < bd) {
      bd = d;
      best = g;
    }
  }
  if (!best) return -1;
  best.awake = true;
  best.state = "idle";
  best.stateTicks = 0;
  for (const w of witnesses(world, best.x, best.z, 30)) {
    shiftBelief(world, w, "you woke a golem", { g: 3, f: 6 });
    sawGolem(world, w.id, best);
  }
  world.events.push({ type: "golem_woke", golem: best.id });
  return best.id;
}

/** The golem falls asleep where it stands (out of power). Anything it carries falls. */
export function sleepGolem(world: World, g: Golem, why: string): void {
  dropLoad(world, g);
  g.awake = false;
  g.state = "dormant";
  g.path = [];
  world.events.push({ type: "golem_slept", golem: g.id, why });
}

function dropLoad(world: World, g: Golem): void {
  const it = item(world, g.carrying);
  if (it) {
    it.state = "loose";
    it.claimedBy = null;
    it.p = [g.x + 0.8, terrainHeight(g.x, g.z) + 0.5, g.z];
    it.v = [0, 0, 0];
    it.restTicks = 0;
  }
  g.carrying = null;
  g.carryWater = false;
  for (const i of world.items) if (i.claimedBy === -g.id) i.claimedBy = null;
}

/** The hand picked the golem up. */
export function grabGolem(world: World, g: Golem): void {
  dropLoad(world, g);
  g.state = "held";
  g.path = [];
  g.target = null;
}

/** Where the hand sets a golem down decides its work (B&W2: drop a golem by the job). */
export function jobAt(world: World, x: number, z: number): GolemJob {
  const near = (p: { x: number; z: number }) => Math.hypot(p.x - x, p.z - z);
  const options: [GolemJob, number][] = [
    ["haul", near(world.woodpile)],
    ["douse", near(LAYOUT.well)],
  ];
  const site = openSite(world);
  if (site) options.push(["build", near(site)]);
  options.sort((a, b) => a[1] - b[1]);
  return options[0][1] <= GOLEM_JOB_RADIUS ? options[0][0] : "none";
}

export function dropGolem(world: World, g: Golem, x: number, z: number): GolemJob {
  g.x = x;
  g.z = z;
  g.y = terrainHeight(x, z);
  g.state = g.awake ? "idle" : "dormant";
  g.stateTicks = 0;
  g.path = [];
  g.target = null;
  if (g.awake) g.job = jobAt(world, x, z);
  return g.job;
}

function sawGolem(world: World, settlerId: number, g: Golem): void {
  const s = world.settlers.find((x) => x.id === settlerId);
  if (!s || !s.alive) return;
  if (s.memories.some((m) => m.kind === "saw_golem" && world.tick - m.tick < SAW_GOLEM_GAP)) return;
  remember(world, s, "saw_golem", placeName(g.x, g.z), true, "awed", g.id);
}

function walkTo(g: Golem, tx: number, tz: number, findPath: PathFn): void {
  const p = findPath(g.x, g.z, tx, tz);
  g.path = p && p.length ? p : [[tx, tz]];
  g.state = g.carrying != null || g.carryWater ? (g.carryWater ? "fetching" : "carrying") : "walking";
}

/** Returns true when the golem has arrived. */
function walk(g: Golem): boolean {
  let budget = SPEED * SIM_DT;
  while (budget > 0 && g.path.length) {
    const [tx, tz] = g.path[0];
    const dx = tx - g.x;
    const dz = tz - g.z;
    const d = Math.hypot(dx, dz);
    if (d < 1e-4) {
      g.path.shift();
      continue;
    }
    g.heading = Math.atan2(dx, dz);
    const s = Math.min(d, budget);
    g.x += (dx / d) * s;
    g.z += (dz / d) * s;
    budget -= s;
    if (s === d) g.path.shift();
  }
  g.y = terrainHeight(g.x, g.z);
  return g.path.length === 0;
}

function worked(world: World, g: Golem, what: string, belief: string): void {
  g.workDone += 1;
  world.events.push({ type: "golem_work", golem: g.id, job: g.job, what });
  for (const w of witnesses(world, g.x, g.z, 22)) {
    shiftBelief(world, w, belief, { g: 2 });
    sawGolem(world, w.id, g);
  }
}

function nearestLooseLog(world: World, g: Golem): Item | undefined {
  const ring = world.golemForm;
  let best: Item | undefined;
  let bd = 70;
  for (const it of world.items) {
    if (it.kind !== "log" || it.state !== "loose" || it.claimedBy != null || it.restTicks < 10) continue;
    if (Math.hypot(it.p[0] - ring.x, it.p[2] - ring.z) < GOLEM_RING_RADIUS + 0.5) continue; // never eat the ring's logs
    if (Math.hypot(it.p[0] - world.woodpile.x, it.p[2] - world.woodpile.z) < 2.5) continue;
    const d = Math.hypot(it.p[0] - g.x, it.p[2] - g.z);
    if (d < bd) {
      bd = d;
      best = it;
    }
  }
  return best;
}

/** Take one log from the woodpile into the golem's arms. */
function takeFromPile(world: World, g: Golem): boolean {
  if (world.woodpile.count <= 0) return false;
  world.woodpile.count -= 1;
  const it = addItem(world, "log", g.x, g.y + 2, g.z);
  it.state = "carried";
  it.claimedBy = -g.id;
  g.carrying = it.id;
  return true;
}

function deliver(world: World, g: Golem): void {
  const it = item(world, g.carrying);
  g.carrying = null;
  if (!it) return;
  it.state = "gone";
  it.claimedBy = null;
  const site = g.target != null ? world.sites.find((s) => s.id === g.target && !s.done) : undefined;
  if (site && site.have < site.need && Math.hypot(site.x - g.x, site.z - g.z) < 6) {
    site.have += 1;
    worked(world, g, "wood to the site", "your golem carried wood to the new house");
  } else {
    world.woodpile.count += 1;
    worked(world, g, "a log to the woodpile", "your golem hauled a log");
  }
  g.target = null;
}

function haulTick(world: World, g: Golem, findPath: PathFn): void {
  if (g.state === "lifting") {
    if (++g.stateTicks < LIFT_TICKS) return;
    const it = item(world, g.target);
    if (!it || it.state !== "loose") {
      g.state = "idle";
      g.target = null;
      return;
    }
    it.state = "carried";
    it.claimedBy = -g.id;
    g.carrying = it.id;
    const site = openSite(world);
    const dest = site && site.have < site.need ? site : world.woodpile;
    g.target = site && dest === site ? site.id : null;
    walkTo(g, dest.x + 1.5, dest.z + 1.5, findPath);
    return;
  }
  if (g.state === "walking" || g.state === "carrying") {
    if (!walk(g)) return;
    if (g.carrying != null) deliver(world, g);
    else if (g.target != null) {
      g.state = "lifting";
      g.stateTicks = 0;
    } else g.state = "idle";
    return;
  }
  // idle: find work
  if (world.tick % 10 !== g.id % 10) return;
  const log = nearestLooseLog(world, g);
  if (log) {
    log.claimedBy = -g.id;
    g.target = log.id;
    walkTo(g, log.p[0], log.p[2], findPath);
    return;
  }
  // No loose logs: carry woodpile wood to a site that needs it.
  const site = openSite(world);
  if (site && site.have < site.need && world.woodpile.count > 0) {
    if (Math.hypot(g.x - world.woodpile.x, g.z - world.woodpile.z) > 3) {
      walkTo(g, world.woodpile.x + 1.5, world.woodpile.z, findPath);
      return;
    }
    if (takeFromPile(world, g)) {
      g.target = site.id;
      walkTo(g, site.x + 1.5, site.z + 1.5, findPath);
    }
  }
}

function buildTick(world: World, g: Golem, findPath: PathFn): void {
  const site = openSite(world);
  if (g.state === "walking" || g.state === "carrying") {
    if (!walk(g)) return;
    if (g.carrying != null) deliver(world, g);
    g.state = "idle";
    return;
  }
  if (!site) {
    g.state = "idle";
    return;
  }
  const atSite = Math.hypot(site.x - g.x, site.z - g.z) < 5;
  if (site.have < site.need) {
    if (world.woodpile.count <= 0) {
      if (atSite) buildAt(world, g, site);
      return;
    }
    if (Math.hypot(g.x - world.woodpile.x, g.z - world.woodpile.z) > 3) {
      if (g.state !== "idle" && g.state !== "building") return;
      walkTo(g, world.woodpile.x + 1.5, world.woodpile.z, findPath);
      return;
    }
    if (takeFromPile(world, g)) {
      g.target = site.id;
      walkTo(g, site.x + 1.5, site.z + 1.5, findPath);
    }
    return;
  }
  if (!atSite) {
    walkTo(g, site.x + 1.5, site.z + 1.5, findPath);
    return;
  }
  buildAt(world, g, site);
}

function buildAt(world: World, g: Golem, site: Site): void {
  g.state = "building";
  const cap = site.have / site.need;
  if (site.work >= cap) return;
  site.work = Math.min(cap, site.work + 1 / (BUILD_S * SIM_HZ * site.need));
  if (++g.stateTicks % (BUILD_S * SIM_HZ) === 0) worked(world, g, "building", "your golem raised the walls");
}

function douseTick(world: World, g: Golem, findPath: PathFn): void {
  const well = LAYOUT.well;
  const c = LAYOUT.villageCentre;
  if (g.state === "dousing") {
    if (++g.stateTicks < LIFT_TICKS) return;
    // Throw the water on the nearest flames within reach (the front moves while a golem walks).
    const near = nearestBurning(world.fire, g.x, g.z, 4);
    if (!near) {
      g.state = "idle"; // the front moved on; keep the water and follow it
      return;
    }
    const n = extinguish(world, near.x, near.z, 3, Math.round(WET_S * 0.5 * SIM_HZ));
    g.carryWater = false;
    g.state = "idle";
    if (n > 0) worked(world, g, `doused ${n} cells`, "your golem fought the fire");
    return;
  }
  if (g.state === "lifting") {
    // filling its bucket-body at the well
    if (++g.stateTicks < FETCH_TICKS) return;
    g.carryWater = true;
    g.state = "idle";
    return;
  }
  if (g.state === "walking" || g.state === "fetching") {
    // With water in its body it keeps re-aiming at the nearest flames.
    if (g.carryWater && ++g.stateTicks % SIM_HZ === 0) {
      const f = nearestBurning(world.fire, g.x, g.z, GOLEM_DOUSE_RANGE);
      if (f && Math.hypot(f.x - g.x, f.z - g.z) < 3) g.path = [];
      else if (f) aimAt(g, f, findPath);
    }
    if (!walk(g)) return;
    if (g.carryWater) {
      g.state = "dousing";
      g.stateTicks = 0;
    } else if (Math.hypot(g.x - well.x, g.z - well.z) < 3) {
      g.state = "lifting";
      g.stateTicks = 0;
    } else g.state = "idle";
    return;
  }
  if (world.tick % 10 !== g.id % 10) return;
  const fire = nearestBurning(world.fire, c.x, c.z, GOLEM_DOUSE_RANGE);
  if (!fire) {
    // Wait at the well, body already full of water.
    if (Math.hypot(g.x - well.x, g.z - well.z) > 4) walkTo(g, well.x + 1.2, well.z + 1.2, findPath);
    else if (!g.carryWater) {
      g.state = "lifting";
      g.stateTicks = 0;
    }
    return;
  }
  if (!g.carryWater) walkTo(g, well.x + 1.2, well.z + 1.2, findPath);
  else aimAt(g, fire, findPath);
}

/** Walk to the edge of a burning cell. */
function aimAt(g: Golem, fire: { x: number; z: number }, findPath: PathFn): void {
  const dx = g.x - fire.x;
  const dz = g.z - fire.z;
  const d = Math.hypot(dx, dz) || 1;
  walkTo(g, fire.x + (dx / d) * 1.4, fire.z + (dz / d) * 1.4, findPath);
  g.state = "fetching";
}

/** Per tick: formation in the ring, upkeep, and each awake golem's job. */
export function stepGolems(world: World, findPath: PathFn): void {
  if (world.scenario !== "village") return;
  if (world.tick % 5 === 0) formGolem(world);
  for (const g of world.golems) {
    if (!g.awake || g.state === "held") continue;
    const upkeep = (GOLEM_UPKEEP_PER_DAY + (g.job !== "none" ? GOLEM_JOB_UPKEEP_PER_DAY : 0)) / DAY_TICKS;
    world.power = Math.max(0, world.power - upkeep);
    if (world.power <= 0) {
      sleepGolem(world, g, "no prayer power left");
      continue;
    }
    if (g.job === "haul") haulTick(world, g, findPath);
    else if (g.job === "build") buildTick(world, g, findPath);
    else if (g.job === "douse") douseTick(world, g, findPath);
    // A carried log rides in the golem's arms.
    const it = item(world, g.carrying);
    if (it) {
      it.p = [g.x + Math.sin(g.heading) * 0.9, g.y + 2.1, g.z + Math.cos(g.heading) * 0.9];
      const yaw = g.heading + Math.PI / 2;
      it.q = [0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)];
      it.v = [0, 0, 0];
    }
  }
}
