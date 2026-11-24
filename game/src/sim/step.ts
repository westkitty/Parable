import { FIRE_IGNITE_RADIUS, SIM_HZ } from "../config";
import type { PathFn } from "../nav/grid";
import { burningCount, igniteAt, stepFire } from "./fire";
import { stepSettler } from "./settler";
import { terrainHeight } from "./terrain";
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
  const n = igniteAt(world, item.p[0], item.p[2], FIRE_IGNITE_RADIUS);
  if (n > 0) world.godFireUntil = world.tick + 1;
  return n;
}

export function dissolveFireball(item: Item): void {
  item.state = "gone";
}

export function groundAt(x: number, z: number): number {
  return Math.max(terrainHeight(x, z), 0);
}

export const TICKS_PER_SECOND = SIM_HZ;
