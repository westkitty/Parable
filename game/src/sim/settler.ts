import { BRUISE_S, CALM_AFTER_S, MEMORY_MAX, SETTLER_FLEE_SPEED, SETTLER_WALK_SPEED, SIM_DT, SIM_HZ, WITNESS_RADIUS } from "../config";
import type { PathFn } from "../nav/grid";
import { nearestBurning } from "./fire";
import { LAYOUT, terrainHeight } from "./terrain";
import type { Feeling, Memory, MemoryKind, Settler, SettlerState, World } from "./types";
import { getItem } from "./world";

export const HOME_SPOT: [number, number] = [17, 19];

export function placeName(x: number, z: number): string {
  const g = LAYOUT.grove;
  const p = LAYOUT.pond;
  const t = LAYOUT.temple;
  const c = LAYOUT.cottage;
  if (Math.hypot(x - g.x, z - g.z) < g.r + 3) return "the grove";
  if (Math.hypot(x - p.x, z - p.z) < p.r + 3) return "the pond";
  if (Math.hypot(x - t.x, z - t.z) < 16) return "the temple hill";
  if (Math.hypot(x - c.x, z - c.z) < 10) return "my cottage";
  return "the meadow";
}

export function remember(world: World, s: Settler, kind: MemoryKind, place: string, causedByGod: boolean, feeling: Feeling): void {
  const m: Memory = { tick: world.tick, kind, place, causedByGod, feeling };
  s.memories.unshift(m);
  if (s.memories.length > MEMORY_MAX) s.memories.length = MEMORY_MAX;
}

export function currentFeeling(world: World, s: Settler): { feeling: Feeling; because: Memory | null } {
  const recent = s.memories.find((m) => world.tick - m.tick < 90 * SIM_HZ);
  if (s.state === "flee" || s.state === "cower") {
    const fire = s.memories.find((m) => m.kind === "saw_fire") ?? null;
    return { feeling: "scared", because: fire };
  }
  return recent ? { feeling: recent.feeling, because: recent } : { feeling: "calm", because: null };
}

const FEELING_WORD: Record<Feeling, string> = {
  calm: "Calm",
  scared: "Scared",
  awed: "Awed",
  grateful: "Grateful",
  wary: "Wary",
  hurt: "Hurt",
};

function reasonText(m: Memory): string {
  switch (m.kind) {
    case "saw_fire":
      return m.causedByGod ? `your fire took ${m.place}` : `fire at ${m.place}`;
    case "was_carried_gently":
      return "you lifted me and set me down gently";
    case "was_thrown":
      return "you threw me";
    case "log_appeared":
      return `you laid a log for me at ${m.place}`;
    case "saw_log_thrown":
      return `you hurled a log at ${m.place}`;
  }
}

/** The one line shown in the inspect bubble: a feeling and its top reason. */
export function describeSettler(world: World, s: Settler): string {
  if (world.tick < s.cantReachShownUntil) return "I can't reach that.";
  const { feeling, because } = currentFeeling(world, s);
  if (!because) return `${FEELING_WORD[feeling]} — hauling wood for the winter.`;
  const ago = Math.max(1, Math.round((world.tick - because.tick) / SIM_HZ));
  return `${FEELING_WORD[feeling]} — ${reasonText(because)} (${ago} s ago)`;
}

function setState(world: World, s: Settler, state: SettlerState): void {
  if (s.state === state) return;
  s.state = state;
  s.stateTicks = 0;
  world.events.push({ type: "settler_state", settler: s.id, state });
}

function lineOfSight(ax: number, az: number, bx: number, bz: number): boolean {
  const ay = terrainHeight(ax, az) + 1.6;
  const by = terrainHeight(bx, bz) + 1.2;
  for (let k = 1; k < 10; k += 1) {
    const t = k / 10;
    const x = ax + (bx - ax) * t;
    const z = az + (bz - az) * t;
    if (terrainHeight(x, z) > ay + (by - ay) * t + 0.3) return false;
  }
  return true;
}

function dropCarried(world: World, s: Settler): void {
  const item = getItem(world, s.carrying);
  if (item) {
    item.state = "loose";
    item.claimedBy = null;
    item.p = [s.x + Math.sin(s.heading) * 0.8, terrainHeight(s.x, s.z) + 0.6, s.z + Math.cos(s.heading) * 0.8];
    item.v = [0, 0, 0];
    item.restTicks = 0;
  }
  s.carrying = null;
  const target = getItem(world, s.targetItem);
  if (target && target.claimedBy === s.id) target.claimedBy = null;
  s.targetItem = null;
}

function followPath(s: Settler, speed: number): boolean {
  let budget = speed * SIM_DT;
  while (budget > 0 && s.path.length) {
    const [tx, tz] = s.path[0];
    const dx = tx - s.x;
    const dz = tz - s.z;
    const d = Math.hypot(dx, dz);
    if (d < 1e-4) {
      s.path.shift();
      continue;
    }
    s.heading = Math.atan2(dx, dz);
    if (d <= budget) {
      s.x = tx;
      s.z = tz;
      budget -= d;
      s.path.shift();
    } else {
      s.x += (dx / d) * budget;
      s.z += (dz / d) * budget;
      budget = 0;
    }
  }
  s.y = terrainHeight(s.x, s.z);
  return s.path.length === 0;
}

function startFlee(world: World, s: Settler, fx: number, fz: number, findPath: PathFn): void {
  dropCarried(world, s);
  let ax = s.x - fx;
  let az = s.z - fz;
  const len = Math.hypot(ax, az) || 1;
  ax /= len;
  az /= len;
  let path: [number, number][] | null = null;
  for (const angle of [0, 0.6, -0.6, 1.2, -1.2, 2]) {
    const cx = Math.cos(angle) * ax - Math.sin(angle) * az;
    const cz = Math.sin(angle) * ax + Math.cos(angle) * az;
    path = findPath(s.x, s.z, s.x + cx * 22, s.z + cz * 22);
    if (path) break;
  }
  s.path = path ?? [];
  s.calmTicks = 0;
  setState(world, s, "flee");
}

export function stepSettler(world: World, s: Settler, findPath: PathFn): void {
  s.stateTicks += 1;
  if (s.state === "held") return;
  if (s.state === "airborne") {
    s.vy -= 9.81 * SIM_DT;
    s.x += s.vx * SIM_DT;
    s.y += s.vy * SIM_DT;
    s.z += s.vz * SIM_DT;
    s.x = Math.max(-74, Math.min(74, s.x));
    s.z = Math.max(-74, Math.min(74, s.z));
    const ground = terrainHeight(s.x, s.z);
    if (s.y <= ground) {
      s.y = Math.max(ground, 0);
      s.vx = s.vy = s.vz = 0;
      setState(world, s, "recover");
    }
    return;
  }
  const slow = world.tick < s.bruisedUntil ? 0.55 : 1;

  // Witnessing fire overrides work.
  if (s.state !== "flee" && s.state !== "cower" && s.state !== "recover") {
    const fire = nearestBurning(world.fire, s.x, s.z, WITNESS_RADIUS);
    if (fire && lineOfSight(s.x, s.z, fire.x, fire.z)) {
      remember(world, s, "saw_fire", placeNameOfFire(fire.x, fire.z), world.tick <= world.godFireUntil, "scared");
      startFlee(world, s, fire.x, fire.z, findPath);
      return;
    }
  }

  switch (s.state) {
    case "recover":
      if (s.stateTicks > 1.6 * SIM_HZ) setState(world, s, "idle");
      return;
    case "flee": {
      const done = followPath(s, SETTLER_FLEE_SPEED * slow);
      if (done) setState(world, s, "cower");
      return;
    }
    case "cower": {
      const fire = nearestBurning(world.fire, s.x, s.z, WITNESS_RADIUS);
      if (fire && fire.d < 7) {
        startFlee(world, s, fire.x, fire.z, findPath);
        return;
      }
      s.calmTicks = fire ? 0 : s.calmTicks + 1;
      if (s.calmTicks >= CALM_AFTER_S * SIM_HZ) setState(world, s, "idle");
      return;
    }
    case "idle": {
      const log = chooseLog(world, s);
      if (log) {
        const path = findPath(s.x, s.z, log.p[0], log.p[2]);
        if (!path) {
          s.unreachable.push(log.id);
          s.cantReachShownUntil = world.tick + 3 * SIM_HZ;
          world.events.push({ type: "cant_reach", settler: s.id });
          return;
        }
        log.claimedBy = s.id;
        s.targetItem = log.id;
        s.path = path;
        if (log.godTouched) remember(world, s, "log_appeared", placeName(log.p[0], log.p[2]), true, "grateful");
        setState(world, s, "to_log");
        return;
      }
      if (Math.hypot(s.x - HOME_SPOT[0], s.z - HOME_SPOT[1]) > 6 && s.stateTicks % SIM_HZ === 0) {
        const path = findPath(s.x, s.z, HOME_SPOT[0], HOME_SPOT[1]);
        if (path) {
          s.path = path;
          setState(world, s, "returning");
        }
      }
      return;
    }
    case "returning": {
      if (chooseLog(world, s)) {
        setState(world, s, "idle");
        return;
      }
      if (followPath(s, SETTLER_WALK_SPEED * slow)) setState(world, s, "idle");
      return;
    }
    case "to_log": {
      const log = getItem(world, s.targetItem);
      if (!log || log.state !== "loose" || log.claimedBy !== s.id) {
        s.targetItem = null;
        setState(world, s, "idle");
        return;
      }
      // A nearer log (often one the god just laid down) is worth switching to.
      if (s.stateTicks % 10 === 0) {
        const better = chooseLog(world, s);
        const dNow = Math.hypot(log.p[0] - s.x, log.p[2] - s.z);
        if (better && better.id !== log.id && Math.hypot(better.p[0] - s.x, better.p[2] - s.z) < dNow * 0.6) {
          const path = findPath(s.x, s.z, better.p[0], better.p[2]);
          if (path) {
            log.claimedBy = null;
            better.claimedBy = s.id;
            s.targetItem = better.id;
            s.path = path;
            if (better.godTouched) remember(world, s, "log_appeared", placeName(better.p[0], better.p[2]), true, "grateful");
            return;
          }
        }
      }
      const end = s.path[s.path.length - 1];
      if (end && Math.hypot(end[0] - log.p[0], end[1] - log.p[2]) > 2) {
        const path = findPath(s.x, s.z, log.p[0], log.p[2]);
        if (!path) {
          log.claimedBy = null;
          s.targetItem = null;
          s.unreachable.push(log.id);
          s.cantReachShownUntil = world.tick + 3 * SIM_HZ;
          setState(world, s, "idle");
          return;
        }
        s.path = path;
      }
      followPath(s, SETTLER_WALK_SPEED * slow);
      if (Math.hypot(s.x - log.p[0], s.z - log.p[2]) < 1.3 || s.path.length === 0) {
        s.path = [];
        s.heading = Math.atan2(log.p[0] - s.x, log.p[2] - s.z);
        setState(world, s, "pickup");
      }
      return;
    }
    case "pickup": {
      const log = getItem(world, s.targetItem);
      if (!log || log.state !== "loose") {
        s.targetItem = null;
        setState(world, s, "idle");
        return;
      }
      if (s.stateTicks >= 0.9 * SIM_HZ) {
        log.state = "carried";
        s.carrying = log.id;
        s.targetItem = null;
        const wp = world.woodpile;
        s.path = findPath(s.x, s.z, wp.x - 1.6, wp.z) ?? [];
        setState(world, s, "carrying");
      }
      return;
    }
    case "carrying": {
      const done = followPath(s, SETTLER_WALK_SPEED * 0.85 * slow);
      const wp = world.woodpile;
      if (done || Math.hypot(s.x - wp.x, s.z - wp.z) < 1.9) {
        s.path = [];
        s.heading = Math.atan2(wp.x - s.x, wp.z - s.z);
        setState(world, s, "stacking");
      }
      return;
    }
    case "stacking": {
      if (s.stateTicks >= 0.8 * SIM_HZ) {
        const log = getItem(world, s.carrying);
        if (log) {
          log.state = "stacked";
          log.claimedBy = null;
        }
        s.carrying = null;
        world.woodpile.count += 1;
        world.events.push({ type: "stacked", settler: s.id, count: world.woodpile.count });
        setState(world, s, "idle");
      }
      return;
    }
    default:
      return;
  }
}

function placeNameOfFire(x: number, z: number): string {
  return placeName(x, z);
}

function chooseLog(world: World, s: Settler) {
  let best = null as ReturnType<typeof getItem> | null;
  let bestD = Infinity;
  for (const item of world.items) {
    if (item.kind !== "log" || item.state !== "loose" || item.claimedBy != null) continue;
    if (item.restTicks < 10 || s.unreachable.includes(item.id)) continue;
    const d = Math.hypot(item.p[0] - s.x, item.p[2] - s.z);
    if (d < bestD && d < 90) {
      best = item;
      bestD = d;
    }
  }
  return best ?? null;
}

// ---- Divine hand interactions (called by the input layer through the sim API) ----
export function grabSettler(world: World, s: Settler): void {
  dropCarried(world, s);
  s.path = [];
  setState(world, s, "held");
}

export function releaseSettler(world: World, s: Settler, x: number, y: number, z: number, v: [number, number, number], thrown: boolean): void {
  s.x = x;
  s.y = y;
  s.z = z;
  if (thrown) {
    s.vx = v[0];
    s.vy = v[1];
    s.vz = v[2];
    s.bruisedUntil = world.tick + BRUISE_S * SIM_HZ;
    remember(world, s, "was_thrown", placeName(x, z), true, "hurt");
    setState(world, s, "airborne");
  } else {
    s.vx = 0;
    s.vz = 0;
    s.vy = 0;
    remember(world, s, "was_carried_gently", placeName(x, z), true, "awed");
    setState(world, s, y - terrainHeight(x, z) > 0.4 ? "airborne" : "recover");
  }
}
