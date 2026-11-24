export type ItemKind = "log" | "fireball" | "bellstone";
export type ItemState = "loose" | "held" | "carried" | "stacked" | "gone";

export interface Item {
  id: number;
  kind: ItemKind;
  state: ItemState;
  p: [number, number, number];
  q: [number, number, number, number];
  v: [number, number, number];
  w: [number, number, number];
  claimedBy: number | null;
  restTicks: number; // consecutive ticks at rest (for claim eligibility)
  godTouched: boolean; // last moved by the divine hand
}

export type SettlerState =
  // M1 hauling states (kept by name: the M1 acceptance tests read them)
  | "idle"
  | "to_log"
  | "pickup"
  | "carrying"
  | "stacking"
  | "flee"
  | "cower"
  | "held"
  | "airborne"
  | "recover"
  | "returning"
  // M2+ village work and life
  | "walking" // generic: going somewhere for the current task
  | "chopping"
  | "fetching" // taking wood / food / water from a store or the pond
  | "hauling" // carrying a resource (wood, food, water) to where it is needed
  | "building"
  | "farming"
  | "dousing"
  | "clearing" // cutting a firebreak
  | "eating"
  | "resting"
  | "laid_up" // too hurt to work
  | "tending" // caring for a hurt villager
  | "praying"
  | "painting"
  | "sheltering" // inside a Sanctuary
  | "dead";

export type Job = "woodcutter" | "hauler" | "builder" | "farmer" | "water" | "carer";
export type Resource = "wood" | "food" | "water";

export type MemoryKind =
  | "saw_fire"
  | "was_carried_gently"
  | "was_thrown"
  | "log_appeared"
  | "saw_log_thrown"
  | "home_burned"
  | "friend_hurt"
  | "friend_died"
  | "rain_came"
  | "sheltered"
  | "built_house"
  | "went_hungry"
  | "was_tended";
export type Feeling = "calm" | "scared" | "awed" | "grateful" | "wary" | "hurt" | "angry" | "grieving" | "proud" | "hungry";

export interface Memory {
  tick: number;
  kind: MemoryKind;
  place: string;
  causedByGod: boolean;
  feeling: Feeling;
  about?: number; // another settler, when the memory is about them
}

/** One reason a settler's belief moved: shown when the god inspects them. */
export interface BeliefCause {
  tick: number;
  text: string;
  gratitude: number;
  fear: number;
  resentment: number;
}

export interface Belief {
  gratitude: number; // 0..100
  fear: number; // 0..100
  resentment: number; // 0..100
  causes: BeliefCause[]; // newest first, limited
}

export interface Relationship {
  id: number;
  kind: "family" | "friend";
  affinity: number; // 0..1
}

export interface Task {
  kind:
    | "haul_log"
    | "chop"
    | "build"
    | "farm"
    | "water_field"
    | "douse"
    | "firebreak"
    | "eat"
    | "rest"
    | "tend"
    | "pray"
    | "paint"
    | "shelter";
  phase: number; // task-specific step
  tx: number;
  tz: number;
  ref: number; // tree index, site id, plot index, settler id, fire cell...
  ticks: number;
}

export interface Settler {
  id: number;
  name: string;
  model: string; // character GLB name (identity, for the renderer)
  job: Job;
  skill: Record<Job, number>; // 0.6 .. 1.4: work speed multiplier
  bravery: number; // 0..1: how close a fire must be before they flee
  piety: number; // 0..1: how readily they pray
  home: number; // house id, -1 = none
  x: number;
  y: number;
  z: number;
  vy: number;
  vx: number;
  vz: number;
  heading: number;
  state: SettlerState;
  stateTicks: number;
  path: [number, number][];
  targetItem: number | null;
  carrying: number | null; // a physical item (log)
  carryRes: Resource | null; // an abstract load (a split log, a wheat sheaf, a pot of water)
  task: Task | null;
  bruisedUntil: number;
  cantReachShownUntil: number;
  unreachable: number[];
  calmTicks: number;
  memories: Memory[];
  // M2 needs and body
  hunger: number; // 0 fed .. 1 starving
  energy: number; // 1 rested .. 0 exhausted
  injury: number; // 0 whole .. 1 dead
  alive: boolean;
  diedTick: number;
  causeOfDeath: string;
  relationships: Relationship[];
  belief: Belief;
  lastPrayDay: number;
  repathAt: number;
}

export interface FireGrid {
  n: number;
  cell: number;
  fuel: number[];
  burn: number[]; // remaining burn ticks, 0 = not burning
  scorched: number[]; // 0/1
  wet: number[]; // ticks of rain-soaked protection left (M3); 0 = dry
  cause: number[]; // 1 = this cell's fire came from the god
}

export type HouseState = "standing" | "burning" | "ruin";

export interface House {
  id: number;
  x: number;
  z: number;
  rot: number;
  state: HouseState;
  builtTick: number; // -1 = there at the start
}

export interface Site {
  id: number;
  kind: "house" | "rebuild";
  house: number; // the house it creates or restores
  x: number;
  z: number;
  rot: number;
  need: number; // wood needed
  have: number; // wood delivered
  work: number; // 0..1 building progress (gated by have/need)
  done: boolean;
}

export interface Plot {
  x: number;
  z: number;
  growth: number; // 0..1, ripe at 1
  moisture: number; // 0..1
  dead: boolean;
}

export interface Cloud {
  id: number;
  x: number;
  z: number;
  ttl: number; // ticks of rain left
  held: boolean;
}

export interface Sanctuary {
  id: number;
  x: number;
  z: number;
  r: number;
  ttl: number;
}

export interface ClimateState {
  day: number; // 1-based day of the Dry Year
  dayTick: number; // ticks into the current day
  dryness: number; // 0 wet .. 1 tinder
  wind: [number, number]; // direction * strength (0..1)
  lightningDone: boolean;
  enabled: boolean; // false in the M1 "solo" scenario
}

export interface Outcome {
  ended: boolean;
  survived: boolean;
  tick: number;
  day: number;
  alive: number;
  dead: number;
  housesStanding: number;
  belief: number;
  title: string;
  lines: string[];
}

export interface WorldRecordEntry {
  endedAt: string;
  seed: number;
  survived: boolean;
  day: number;
  alive: number;
  dead: number;
  housesStanding: number;
  belief: number;
  miraclesCast: number;
}

export interface Shrine {
  awakened: boolean; // bell stone rests on the altar
  glyphShownTick: number;
}

export interface Mural {
  progress: number; // 0..1, painted by praying villagers
  read: boolean; // the god has studied the finished mural
}

export interface World {
  version: 2;
  scenario: "solo" | "village";
  seed: number;
  tick: number;
  rngState: number;
  nextId: number;
  items: Item[];
  settlers: Settler[];
  woodpile: { x: number; z: number; count: number };
  granary: { x: number; z: number; food: number };
  fire: FireGrid;
  learned: string[];
  godFireUntil: number; // tick until which burning cells are attributed to the god
  houses: House[];
  sites: Site[];
  plots: Plot[];
  felled: number[]; // indices into scenery trees()
  clouds: Cloud[];
  sanctuaries: Sanctuary[];
  climate: ClimateState;
  power: number; // prayer power 0..100: miracles spend it
  miraclesCast: number;
  shrine: Shrine;
  mural: Mural;
  outcome: Outcome | null;
  events: WorldEvent[]; // transient, cleared by consumer each frame; not saved
}

export type WorldEvent =
  | { type: "ignite"; x: number; z: number; cells: number }
  | { type: "stacked"; settler: number; count: number }
  | { type: "cant_reach"; settler: number }
  | { type: "settler_state"; settler: number; state: SettlerState }
  | { type: "felled"; tree: number; settler: number }
  | { type: "delivered"; settler: number; res: Resource; to: string }
  | { type: "site_done"; site: number; house: number }
  | { type: "house_burned"; house: number }
  | { type: "harvest"; plot: number; food: number }
  | { type: "died"; settler: number; cause: string }
  | { type: "learned"; miracle: string }
  | { type: "shrine_awake" }
  | { type: "mural_done" }
  | { type: "day"; day: number; dryness: number }
  | { type: "lightning"; x: number; z: number }
  | { type: "doused"; settler: number; cells: number }
  | { type: "prayed"; settler: number; power: number }
  | { type: "outcome"; survived: boolean };
