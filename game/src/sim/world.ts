import { DAY_TICKS, HOUSE_WOOD, SIM_HZ, START_FOOD, START_POWER, START_WOOD } from "../config";
import { createFireGrid } from "./fire";
import { nextRandom } from "./rng";
import { LAYOUT, terrainHeight } from "./terrain";
import type { House, Item, ItemKind, Job, Plot, Settler, World } from "./types";

export type Scenario = "solo" | "village";

/** The twelve founders: name, character model, trade, house. Identities are authored; skills/temperament are seeded. */
export const FOUNDERS: { name: string; model: string; job: Job; house: number }[] = [
  { name: "Ilse", model: "character-female-b", job: "hauler", house: 0 },
  { name: "Bram", model: "character-male-c", job: "woodcutter", house: 0 },
  { name: "Oda", model: "character-female-a", job: "carer", house: 0 },
  { name: "Tamsin", model: "character-female-c", job: "farmer", house: 1 },
  { name: "Corin", model: "character-male-a", job: "farmer", house: 1 },
  { name: "Wil", model: "character-male-b", job: "water", house: 1 },
  { name: "Maren", model: "character-female-d", job: "builder", house: 2 },
  { name: "Hob", model: "character-male-d", job: "builder", house: 2 },
  { name: "Ness", model: "character-female-e", job: "woodcutter", house: 2 },
  { name: "Edda", model: "character-female-f", job: "water", house: 3 },
  { name: "Pell", model: "character-male-e", job: "hauler", house: 3 },
  { name: "Rafe", model: "character-male-f", job: "carer", house: 3 },
];
/** Friendships across households (index pairs into FOUNDERS). */
const FRIENDS: [number, number][] = [
  [0, 3],
  [1, 7],
  [2, 9],
  [4, 10],
  [5, 8],
  [6, 11],
];
const JOBS: Job[] = ["woodcutter", "hauler", "builder", "farmer", "water", "carer"];

export function createWorld(seed: number, scenario: Scenario = "village"): World {
  const village = scenario === "village";
  const world: World = {
    version: 2,
    scenario,
    seed,
    tick: 0,
    rngState: (seed * 2654435761) >>> 0,
    nextId: 1,
    items: [],
    settlers: [],
    woodpile: { x: LAYOUT.woodpile.x, z: LAYOUT.woodpile.z, count: village ? START_WOOD : 0 },
    granary: { x: LAYOUT.granary.x, z: LAYOUT.granary.z, food: village ? START_FOOD : 0 },
    fire: createFireGrid(village),
    learned: ["fireball"],
    godFireUntil: 0,
    houses: [],
    sites: [],
    plots: [],
    felled: [],
    clouds: [],
    sanctuaries: [],
    climate: { day: 1, dayTick: 0, dryness: village ? 0.08 : 0, wind: [0, 0], lightningDone: false, enabled: village },
    power: START_POWER,
    miraclesCast: 0,
    shrine: { awakened: false, glyphShownTick: -1 },
    mural: { progress: 0, read: false },
    outcome: null,
    events: [],
  };
  for (const s of LAYOUT.spawnLogs) addItem(world, "log", s.x, terrainHeight(s.x, s.z) + 0.5, s.z);
  if (!village) {
    world.houses.push(house(0));
    world.settlers.push(createSettler(world, "Ilse", "character-female-b", "hauler", 0, 17, 19));
    return world;
  }
  for (let i = 0; i < LAYOUT.houses.length; i += 1) world.houses.push(house(i));
  const s = LAYOUT.site;
  world.sites.push({ id: world.nextId++, kind: "house", house: LAYOUT.houses.length, x: s.x, z: s.z, rot: s.rot, need: HOUSE_WOOD, have: 0, work: 0, done: false });
  const f = LAYOUT.field;
  for (let r = 0; r < f.rows; r += 1) {
    for (let c = 0; c < f.cols; c += 1) {
      const plot: Plot = {
        x: f.x - f.w / 2 + (c + 0.5) * (f.w / f.cols),
        z: f.z - f.d / 2 + (r + 0.5) * (f.d / f.rows),
        growth: 0.25 + 0.7 * nextRandom(world),
        moisture: 0.7,
        dead: false,
      };
      world.plots.push(plot);
    }
  }
  addItem(world, "bellstone", LAYOUT.bellStone.x, terrainHeight(LAYOUT.bellStone.x, LAYOUT.bellStone.z) + 0.7, LAYOUT.bellStone.z);
  FOUNDERS.forEach((fd, i) => {
    const h = LAYOUT.houses[fd.house];
    const a = (i % 3) * 2.1 + fd.house;
    const x = h.x + Math.sin(a) * 5.5;
    const z = h.z + Math.cos(a) * 5.5;
    const st = createSettler(world, fd.name, fd.model, fd.job, fd.house, x, z);
    for (const j of JOBS) st.skill[j] = +(j === fd.job ? 1.1 + 0.3 * nextRandom(world) : 0.6 + 0.4 * nextRandom(world)).toFixed(2);
    st.bravery = +nextRandom(world).toFixed(2);
    st.piety = +(0.3 + 0.7 * nextRandom(world)).toFixed(2);
    st.hunger = +(0.1 + 0.3 * nextRandom(world)).toFixed(2);
    st.energy = +(0.7 + 0.3 * nextRandom(world)).toFixed(2);
    st.belief.gratitude = 18 + Math.round(st.piety * 14);
    st.belief.fear = 8;
    world.settlers.push(st);
  });
  // Households are family; a few friendships cross between them.
  const ids = world.settlers.map((x) => x.id);
  FOUNDERS.forEach((fd, i) => {
    FOUNDERS.forEach((other, j) => {
      if (i !== j && other.house === fd.house) world.settlers[i].relationships.push({ id: ids[j], kind: "family", affinity: 0.8 });
    });
  });
  for (const [a, b] of FRIENDS) {
    world.settlers[a].relationships.push({ id: ids[b], kind: "friend", affinity: 0.55 });
    world.settlers[b].relationships.push({ id: ids[a], kind: "friend", affinity: 0.55 });
  }
  void DAY_TICKS;
  return world;
}

function house(i: number): House {
  const h = LAYOUT.houses[i];
  return { id: i, x: h.x, z: h.z, rot: h.rot, state: "standing", builtTick: -1 };
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

export function createSettler(world: World, name: string, model: string, job: Job, home: number, x: number, z: number): Settler {
  return {
    id: world.nextId++,
    name,
    model,
    job,
    skill: { woodcutter: 1, hauler: 1, builder: 1, farmer: 1, water: 1, carer: 1 },
    bravery: 0.5,
    piety: 0.5,
    home,
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
    carryRes: null,
    task: null,
    bruisedUntil: 0,
    cantReachShownUntil: 0,
    unreachable: [],
    calmTicks: 0,
    memories: [],
    hunger: 0,
    energy: 1,
    injury: 0,
    alive: true,
    diedTick: -1,
    causeOfDeath: "",
    relationships: [],
    belief: { gratitude: 20, fear: 5, resentment: 0, causes: [] },
    lastPrayDay: 0,
    repathAt: 0,
  };
}

export function getItem(world: World, id: number | null): Item | undefined {
  return id == null ? undefined : world.items.find((i) => i.id === id);
}
export function getSettler(world: World, id: number | null): Settler | undefined {
  return id == null ? undefined : world.settlers.find((s) => s.id === id);
}
export function getSite(world: World, id: number): import("./types").Site | undefined {
  return world.sites.find((s) => s.id === id);
}
