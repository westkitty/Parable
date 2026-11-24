import type { World } from "./types";

export const SAVE_VERSION = 3;

export interface CameraState {
  tx: number;
  tz: number;
  yaw: number;
  dist: number;
}

export interface SaveFile {
  version: number;
  savedAt: string;
  world: Omit<World, "events">;
  camera: CameraState;
}

function round(v: unknown): unknown {
  if (typeof v === "number") return Math.round(v * 1000) / 1000;
  if (Array.isArray(v)) return v.map(round);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      if (k === "events") continue;
      out[k] = round((v as Record<string, unknown>)[k]);
    }
    return out;
  }
  return v;
}

/** Canonical JSON (sorted keys, numbers rounded to mm) so equal states hash equally. */
export function canonical(world: World | Omit<World, "events">): string {
  return JSON.stringify(round(world));
}

export function hashWorld(world: World | Omit<World, "events">): string {
  const s = canonical(world);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function serialize(world: World, camera: CameraState): string {
  const { events: _events, ...rest } = world;
  void _events;
  const file: SaveFile = { version: SAVE_VERSION, savedAt: new Date().toISOString(), world: JSON.parse(canonical(rest)), camera };
  return JSON.stringify(file);
}

export function deserialize(text: string): { world: World; camera: CameraState } {
  const file = JSON.parse(text) as SaveFile;
  if (!file || file.version !== SAVE_VERSION || !file.world || file.world.version !== 3) {
    throw new Error(`Unsupported Parable save version: ${file?.version}`);
  }
  return { world: { ...(file.world as World), events: [] }, camera: file.camera };
}
