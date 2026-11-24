import { FIRE_IGNITE_RADIUS, MIRACLE_COST, RAIN_S, SANCTUARY_RADIUS, SANCTUARY_S, SIM_HZ } from "../config";
import type { PathFn } from "../nav/grid";
import { shiftBelief, witnesses } from "./belief";
import { stepEconomy } from "./economy";
import { stepGolems } from "./golems";
import { stepMiracles } from "./miracles";
import { burningCount, igniteAt, stepFire } from "./fire";
import { stepSettler } from "./settler";
import { LAYOUT, terrainHeight } from "./terrain";
import type { Item, World } from "./types";

export function stepWorld(world: World, findPath: PathFn, opts: { settlers?: boolean } = {}): void {
  world.tick += 1;
  stepFire(world);
  if (burningCount(world.fire) > 0 && world.godFireUntil >= world.tick - 1) world.godFireUntil = world.tick + 1;
  for (const item of world.items) {
    if (item.state !== "loose") continue;
    const speed = Math.hypot(item.v[0], item.v[1], item.v[2]);
    item.restTicks = speed < 0.35 ? item.restTicks + 1 : 0;
  }
  stepEconomy(world);
  if (world.scenario === "village") {
    stepMiracles(world);
    stepGolems(world, findPath);
  }
  checkShrine(world);
  if (opts.settlers !== false) for (const s of world.settlers) stepSettler(world, s, findPath);
  // Carried items ride on the settler's shoulder.
  for (const s of world.settlers) {
    if (s.carrying == null) continue;
    const item = world.items.find((i) => i.id === s.carrying);
    if (!item) continue;
    item.p = [s.x, s.y + 1.45, s.z];
    const yaw = s.heading + Math.PI / 2;
    item.q = [0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)];
    item.v = [0, 0, 0];
  }
}

/** A thrown fireball struck the world: ignite fuel around the point. */
export function fireballImpact(world: World, item: Item): number {
  item.state = "gone";
  const n = igniteAt(world, item.p[0], item.p[2], FIRE_IGNITE_RADIUS, true);
  if (n > 0) world.godFireUntil = world.tick + 1;
  if (world.scenario === "village") for (const w of witnesses(world, item.p[0], item.p[2], 30)) shiftBelief(world, w, "your fireball", { f: 10 });
  return n;
}

export function dissolveFireball(item: Item): void {
  item.state = "gone";
}

export function groundAt(x: number, z: number): number {
  return Math.max(terrainHeight(x, z), 0);
}

/** Miracles cost prayer power. The M1 solo scenario keeps the Fireball free. */
export function canAfford(world: World, miracle: string): boolean {
  if (world.scenario === "solo") return true;
  return world.power >= (MIRACLE_COST[miracle] ?? 0);
}
export function spend(world: World, miracle: string): void {
  world.miraclesCast += 1;
  if (world.scenario === "solo") return;
  world.power = Math.max(0, world.power - (MIRACLE_COST[miracle] ?? 0));
}

export function castRain(world: World, x: number, z: number): number {
  const c = { id: world.nextId++, x, z, ttl: RAIN_S * SIM_HZ, held: true };
  world.clouds.push(c);
  return c.id;
}

export function castSanctuary(world: World, x: number, z: number): number {
  const s = { id: world.nextId++, x, z, r: SANCTUARY_RADIUS, ttl: SANCTUARY_S * SIM_HZ };
  world.sanctuaries.push(s);
  for (const w of witnesses(world, x, z, 30)) shiftBelief(world, w, "you raised a sanctuary", { g: 6, f: 3 });
  return s.id;
}

/** The dry bell stone resting on the shrine's altar wakes the shrine (it then shows the Rain glyph). */
export function checkShrine(world: World): void {
  if (world.scenario !== "village" || world.shrine.awakened) return;
  const sh = LAYOUT.shrine;
  for (const it of world.items) {
    if (it.kind !== "bellstone" || it.state !== "loose" || it.restTicks < 8) continue;
    if (Math.hypot(it.p[0] - sh.x, it.p[2] - sh.z) > 2.4) continue;
    it.state = "stacked";
    it.p = [sh.x, terrainHeight(sh.x, sh.z) + 1.55, sh.z];
    it.q = [0, 0, 0, 1];
    it.v = [0, 0, 0];
    world.shrine.awakened = true;
    world.shrine.glyphShownTick = world.tick;
    world.events.push({ type: "shrine_awake" });
  }
}

/** Learning: the shrine teaches Rain when its glyph is traced near it; the finished mural teaches Sanctuary. */
export function learn(world: World, miracle: string): boolean {
  if (world.learned.includes(miracle)) return false;
  world.learned.push(miracle);
  world.events.push({ type: "learned", miracle });
  return true;
}

export const TICKS_PER_SECOND = SIM_HZ;
void SANCTUARY_RADIUS;
