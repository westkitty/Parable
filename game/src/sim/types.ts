export type ItemKind = "log" | "fireball";
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
  | "returning";

export type MemoryKind = "saw_fire" | "was_carried_gently" | "was_thrown" | "log_appeared" | "saw_log_thrown";
export type Feeling = "calm" | "scared" | "awed" | "grateful" | "wary" | "hurt";

export interface Memory {
  tick: number;
  kind: MemoryKind;
  place: string;
  causedByGod: boolean;
  feeling: Feeling;
}

export interface Settler {
  id: number;
  name: string;
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
  carrying: number | null;
  bruisedUntil: number;
  cantReachShownUntil: number;
  unreachable: number[];
  calmTicks: number;
  memories: Memory[];
}

export interface FireGrid {
  n: number;
  cell: number;
  fuel: number[];
  burn: number[]; // remaining burn ticks, 0 = not burning
  scorched: number[]; // 0/1
}

export interface World {
  version: 1;
  seed: number;
  tick: number;
  rngState: number;
  nextId: number;
  items: Item[];
  settlers: Settler[];
  woodpile: { x: number; z: number; count: number };
  fire: FireGrid;
  learned: string[];
  godFireUntil: number; // tick until which burning cells are attributed to the god
  events: WorldEvent[]; // transient, cleared by consumer each frame; not saved
}

export type WorldEvent =
  | { type: "ignite"; x: number; z: number; cells: number }
  | { type: "stacked"; settler: number; count: number }
  | { type: "cant_reach"; settler: number }
  | { type: "settler_state"; settler: number; state: SettlerState };
