import { BRUISE_S, CALM_AFTER_S, MEMORY_MAX, SETTLER_FLEE_SPEED, SETTLER_WALK_SPEED, SIM_DT, SIM_HZ, WITNESS_RADIUS } from "../config";
import type { PathFn } from "../nav/grid";
import { beliefSummary, shiftBelief, witnesses } from "./belief";
import { fireCellIndex, nearestBurning } from "./fire";
import { LAYOUT, terrainHeight } from "./terrain";
import type { Feeling, Memory, MemoryKind, Settler, SettlerState, World } from "./types";
import { getItem, getSettler } from "./world";
import { bodyTick, dieIfFatal, releaseClaims, villageFireResponse, villageIdle, villageWorkTick } from "./tasks";

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
  const f = LAYOUT.field;
  if (Math.abs(x - f.x) < f.w / 2 + 3 && Math.abs(z - f.z) < f.d / 2 + 3) return "the wheat field";
  if (Math.hypot(x - LAYOUT.site.x, z - LAYOUT.site.z) < 8) return "the new house";
  if (Math.hypot(x - LAYOUT.mural.x, z - LAYOUT.mural.z) < 8) return "the painted wall";
  if (Math.hypot(x - LAYOUT.shrine.x, z - LAYOUT.shrine.z) < 12) return "the old shrine";
  if (Math.hypot(x - LAYOUT.villageCentre.x, z - LAYOUT.villageCentre.z) < 20) return "the village";
  return "the meadow";
}

export function remember(world: World, s: Settler, kind: MemoryKind, place: string, causedByGod: boolean, feeling: Feeling, about?: number): void {
  const m: Memory = { tick: world.tick, kind, place, causedByGod, feeling };
  if (about != null) m.about = about;
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
  angry: "Angry",
  grieving: "Grieving",
  proud: "Proud",
  hungry: "Hungry",
};

function reasonText(world: World, m: Memory): string {
  const who = m.about != null ? (getSettler(world, m.about)?.name ?? "a friend") : "a friend";
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
    case "home_burned":
      return m.causedByGod ? "your fire burned my home" : "fire burned my home";
    case "friend_hurt":
      return m.causedByGod ? `you hurt ${who}` : `${who} was hurt`;
    case "friend_died":
      return m.causedByGod ? `you killed ${who}` : `${who} died`;
    case "rain_came":
      return `your rain fell on ${m.place}`;
    case "sheltered":
      return "your sanctuary kept me safe";
    case "built_house":
      return "we raised a new house";
    case "went_hungry":
      return "the granary was empty";
    case "was_tended":
      return `${who} tended my wounds`;
    case "was_healed":
      return `your light healed me at ${m.place}`;
    case "struck_by_lightning":
      return `your lightning struck me at ${m.place}`;
    case "saw_golem":
      return `your golem worked at ${m.place}`;
    case "gathered_at_beacon":
      return `we gathered at your beacon at ${m.place}`;
  }
}

const STATE_WORD: Partial<Record<SettlerState, string>> = {
  idle: "resting a moment",
  to_log: "fetching a log",
  pickup: "lifting a log",
  carrying: "hauling wood",
  stacking: "stacking wood",
  returning: "heading home",
  walking: "on the way",
  chopping: "felling a tree",
  fetching: "fetching",
  hauling: "carrying a load",
  building: "building",
  farming: "working the field",
  dousing: "fighting the fire",
  clearing: "cutting a firebreak",
  eating: "eating",
  resting: "resting at home",
  laid_up: "laid up, hurt",
  tending: "tending the hurt",
  praying: "praying",
  painting: "painting the wall",
  sheltering: "sheltering",
  flee: "running",
  cower: "hiding",
};

/** The one line shown in the inspect bubble: a feeling and its top reason. (M1 format, kept.) */
export function describeSettler(world: World, s: Settler): string {
  if (world.tick < s.cantReachShownUntil) return "I can't reach that.";
  if (!s.alive) return `${s.name} — died (${s.causeOfDeath}).`;
  const { feeling, because } = currentFeeling(world, s);
  if (world.scenario === "solo") {
    if (!because) return `${FEELING_WORD[feeling]} — hauling wood for the winter.`;
    const ago = Math.max(1, Math.round((world.tick - because.tick) / SIM_HZ));
    return `${FEELING_WORD[feeling]} — ${reasonText(world, because)} (${ago} s ago)`;
  }
  const doing = STATE_WORD[s.state] ?? s.state;
  if (!because) return `${s.name}, ${s.job} — ${FEELING_WORD[feeling]}, ${doing}.`;
  const ago = Math.max(1, Math.round((world.tick - because.tick) / SIM_HZ));
  return `${s.name}, ${s.job} — ${FEELING_WORD[feeling]}: ${reasonText(world, because)} (${ago} s ago)`;
}

/** Second inspect line (village): body, needs and belief with its main cause. */
export function describeDetail(world: World, s: Settler): string {
  if (!s.alive) return "";
  const parts: string[] = [];
  if (s.injury >= 0.6) parts.push("badly hurt");
  else if (s.injury >= 0.25) parts.push("hurt");
  if (s.hunger >= 0.95) parts.push("starving");
  else if (s.hunger > 0.6) parts.push("hungry");
  if (s.energy < 0.15) parts.push("exhausted");
  else if (s.energy < 0.3) parts.push("tired");
  const b = beliefSummary(s);
  const lately = b.recent && b.recent !== b.top ? `; lately: ${b.recent}` : "";
  const belief = `belief ${b.score} (${b.mood}${b.top ? `: ${b.top}` : ""}${lately})`;
  const fam = s.relationships.filter((r) => r.kind === "family").map((r) => getSettler(world, r.id)?.name).filter(Boolean);
  return [parts.join(", "), belief, fam.length ? `lives with ${fam.join(" and ")}` : ""].filter(Boolean).join(" · ");
}

export function setState(world: World, s: Settler, state: SettlerState): void {
  if (s.state === state) return;
  s.state = state;
  s.stateTicks = 0;
  world.events.push({ type: "settler_state", settler: s.id, state });
}

export function lineOfSight(ax: number, az: number, bx: number, bz: number): boolean {
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

export function dropCarried(world: World, s: Settler): void {
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

export function followPath(s: Settler, speed: number): boolean {
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

export function startFlee(world: World, s: Settler, fx: number, fz: number, findPath: PathFn, refuge?: { x: number; z: number }): void {
  dropCarried(world, s);
  releaseClaims(world, s);
  let path: [number, number][] | null = null;
  if (refuge) path = findPath(s.x, s.z, refuge.x, refuge.z);
  if (!path) {
    let ax = s.x - fx;
    let az = s.z - fz;
    const len = Math.hypot(ax, az) || 1;
    ax /= len;
    az /= len;
    let fallback: [number, number][] | null = null;
    for (const angle of [0, 0.6, -0.6, 1.2, -1.2, 2, -2]) {
      const cx = Math.cos(angle) * ax - Math.sin(angle) * az;
      const cz = Math.sin(angle) * ax + Math.cos(angle) * az;
      const p = findPath(s.x, s.z, s.x + cx * 22, s.z + cz * 22);
      if (!p) continue;
      if (world.scenario === "solo" || !pathBurns(world, p)) {
        path = p;
        break;
      }
      fallback ??= p;
    }
    path ??= fallback;
  }
  s.path = path ?? [];
  s.calmTicks = 0;
  setState(world, s, "flee");
}

/** Does a path run through (or right beside) burning ground? Villagers will not flee into the fire. */
export function pathBurns(world: World, path: [number, number][]): boolean {
  const f = world.fire;
  for (const [x, z] of path) {
    const idx = fireCellIndex(x, z);
    if (idx < 0) continue;
    const i = idx % f.n;
    const j = Math.floor(idx / f.n);
    for (let dj = -1; dj <= 1; dj += 1) for (let di = -1; di <= 1; di += 1) {
      const k = (j + dj) * f.n + (i + di);
      if (k >= 0 && k < f.burn.length && f.burn[k] > 0) return true;
    }
  }
  return false;
}

/** Speed multiplier from bruises and injuries: hurt villagers limp. */
export function ability(world: World, s: Settler): number {
  const bruise = world.tick < s.bruisedUntil ? 0.55 : 1;
  return bruise * (1 - 0.65 * Math.min(1, s.injury)) * (s.energy < 0.12 ? 0.75 : 1);
}

export function stepSettler(world: World, s: Settler, findPath: PathFn): void {
  s.stateTicks += 1;
  if (!s.alive) return;
  if (s.state === "held") return;
  const village = world.scenario === "village";
  if (s.state === "airborne") {
    s.vy -= 9.81 * SIM_DT;
    s.x += s.vx * SIM_DT;
    s.y += s.vy * SIM_DT;
    s.z += s.vz * SIM_DT;
    s.x = Math.max(-74, Math.min(74, s.x));
    s.z = Math.max(-74, Math.min(74, s.z));
    const ground = terrainHeight(s.x, s.z);
    if (s.y <= ground) {
      const impact = Math.hypot(s.vx, s.vy, s.vz);
      if (impact > 7) {
        s.injury = Math.min(1, s.injury + (impact - 7) / 22);
        s.causeOfDeath = "thrown by the god";
      }
      s.y = Math.max(ground, 0);
      s.vx = s.vy = s.vz = 0;
      setState(world, s, "recover");
      if (village && dieIfFatal(world, s, true)) return;
    }
    return;
  }
  if (village) {
    bodyTick(world, s);
    if (!s.alive) return;
    if (villageFireResponse(world, s, findPath)) return;
    if (villageWorkTick(world, s, findPath)) return;
  }
  const slow = village ? ability(world, s) : world.tick < s.bruisedUntil ? 0.55 : 1;

  // Witnessing fire overrides work (M1 rule; the village uses villageFireResponse above).
  if (!village && s.state !== "flee" && s.state !== "cower" && s.state !== "recover") {
    const fire = nearestBurning(world.fire, s.x, s.z, WITNESS_RADIUS);
    if (fire && lineOfSight(s.x, s.z, fire.x, fire.z)) {
      remember(world, s, "saw_fire", placeName(fire.x, fire.z), world.tick <= world.godFireUntil || world.fire.cause[fire.idx] === 1, "scared");
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
      const radius = village ? 14 + 6 * (1 - s.bravery) : WITNESS_RADIUS;
      const fire = nearestBurning(world.fire, s.x, s.z, radius);
      if (fire && fire.d < 7) {
        startFlee(world, s, fire.x, fire.z, findPath);
        return;
      }
      s.calmTicks = fire ? 0 : s.calmTicks + 1;
      if (s.calmTicks >= (village ? 4 : CALM_AFTER_S) * SIM_HZ) setState(world, s, "idle");
      return;
    }
    case "idle": {
      if (village) {
        villageIdle(world, s, findPath);
        return;
      }
      const log = chooseLog(world, s);
      if (log) {
        claimLog(world, s, log, findPath);
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
      if (!village && chooseLog(world, s)) {
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
            if (better.godTouched) noteGodLog(world, s, better.p[0], better.p[2]);
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

function noteGodLog(world: World, s: Settler, x: number, z: number): void {
  remember(world, s, "log_appeared", placeName(x, z), true, "grateful");
  if (world.scenario === "village") shiftBelief(world, s, "you laid logs for us", { g: 4 });
}

export function claimLog(world: World, s: Settler, log: NonNullable<ReturnType<typeof getItem>>, findPath: PathFn): boolean {
  const path = findPath(s.x, s.z, log.p[0], log.p[2]);
  if (!path) {
    s.unreachable.push(log.id);
    s.cantReachShownUntil = world.tick + 3 * SIM_HZ;
    world.events.push({ type: "cant_reach", settler: s.id });
    return false;
  }
  log.claimedBy = s.id;
  s.targetItem = log.id;
  s.path = path;
  if (log.godTouched) noteGodLog(world, s, log.p[0], log.p[2]);
  setState(world, s, "to_log");
  return true;
}

export function chooseLog(world: World, s: Settler, maxD = 90) {
  let best = null as ReturnType<typeof getItem> | null;
  let bestD = Infinity;
  for (const item of world.items) {
    if (item.kind !== "log" || item.state !== "loose" || item.claimedBy != null) continue;
    if (item.restTicks < 10 || s.unreachable.includes(item.id)) continue;
    const d = Math.hypot(item.p[0] - s.x, item.p[2] - s.z);
    if (d < bestD && d < maxD) {
      best = item;
      bestD = d;
    }
  }
  return best ?? null;
}

// ---- Divine hand interactions (called by the input layer through the sim API) ----
export function grabSettler(world: World, s: Settler): void {
  dropCarried(world, s);
  releaseClaims(world, s);
  s.path = [];
  setState(world, s, "held");
}

export function releaseSettler(world: World, s: Settler, x: number, y: number, z: number, v: [number, number, number], thrown: boolean): void {
  s.x = x;
  s.y = y;
  s.z = z;
  const village = world.scenario === "village";
  if (thrown) {
    s.vx = v[0];
    s.vy = v[1];
    s.vz = v[2];
    s.bruisedUntil = world.tick + BRUISE_S * SIM_HZ;
    remember(world, s, "was_thrown", placeName(x, z), true, "hurt");
    if (village) {
      shiftBelief(world, s, "you threw me", { f: 12, r: 15 });
      for (const w of witnesses(world, x, z, 22)) {
        if (w.id === s.id) continue;
        const rel = w.relationships.find((r) => r.id === s.id);
        if (rel) remember(world, w, "friend_hurt", placeName(x, z), true, "angry", s.id);
        shiftBelief(world, w, `you threw ${s.name}`, { f: 6, r: rel ? 10 : 3 });
      }
    }
    setState(world, s, "airborne");
  } else {
    s.vx = 0;
    s.vz = 0;
    s.vy = 0;
    remember(world, s, "was_carried_gently", placeName(x, z), true, "awed");
    if (village) shiftBelief(world, s, "you carried me gently", { g: 4, f: 2 });
    setState(world, s, y - terrainHeight(x, z) > 0.4 ? "airborne" : "recover");
  }
}

export function describeAll(world: World): { id: number; name: string; line: string; detail: string }[] {
  return world.settlers.map((s) => ({ id: s.id, name: s.name, line: describeSettler(world, s), detail: describeDetail(world, s) }));
}
