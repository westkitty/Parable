import { SIM_HZ } from "../config";
import { createFireGrid } from "./fire";
import { LAYOUT, terrainHeight } from "./terrain";
import type { Item, ItemKind, Settler, World } from "./types";

export function createWorld(seed: number): World {
  const world: World = {
    version: 1,
    seed,
    tick: 0,
    rngState: (seed * 2654435761) >>> 0,
    nextId: 1,
    items: [],
    settlers: [],
    woodpile: { x: LAYOUT.woodpile.x, z: LAYOUT.woodpile.z, count: 0 },
    fire: createFireGrid(),
    learned: ["fireball"],
    godFireUntil: 0,
    events: [],
  };
  for (const s of LAYOUT.spawnLogs) addItem(world, "log", s.x, terrainHeight(s.x, s.z) + 0.5, s.z);
  world.settlers.push(createSettler(world, "Ilse", 17, 19));
  return world;
}

export function addItem(world: World, kind: ItemKind, x: number, y: number, z: number): Item {
  const item: Item = {
    id: world.nextId++,
    kind,
    state: "loose",
    p: [x, y, z],
    q: [0, 0, 0, 1],
    v: [0, 0, 0],
    w: [0, 0, 0],
    claimedBy: null,
    restTicks: SIM_HZ,
    godTouched: false,
  };
  world.items.push(item);
  return item;
}

function createSettler(world: World, name: string, x: number, z: number): Settler {
  return {
    id: world.nextId++,
    name,
    x,
    y: terrainHeight(x, z),
    z,
    vx: 0,
    vy: 0,
    vz: 0,
    heading: Math.PI,
    state: "idle",
    stateTicks: 0,
    path: [],
    targetItem: null,
    carrying: null,
    bruisedUntil: 0,
    cantReachShownUntil: 0,
    unreachable: [],
    calmTicks: 0,
    memories: [],
  };
}

export function getItem(world: World, id: number | null): Item | undefined {
  return id == null ? undefined : world.items.find((i) => i.id === id);
}
export function getSettler(world: World, id: number | null): Settler | undefined {
  return id == null ? undefined : world.settlers.find((s) => s.id === id);
}
