// Belief: what each villager feels about the god, and why. Every change records its cause,
// so the inspect bubble and the temple records can say exactly what moved it.
import { SIM_HZ } from "../config";
import type { Settler, World } from "./types";

const MAX_CAUSES = 6;
const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function shiftBelief(world: World, s: Settler, text: string, d: { g?: number; f?: number; r?: number }): void {
  if (!s.alive) return;
  const g = d.g ?? 0;
  const f = d.f ?? 0;
  const r = d.r ?? 0;
  s.belief.gratitude = clamp(s.belief.gratitude + g);
  s.belief.fear = clamp(s.belief.fear + f);
  s.belief.resentment = clamp(s.belief.resentment + r);
  // Repeated causes merge so a busy god does not flood the list with one reason.
  const same = s.belief.causes.find((c) => c.text === text && world.tick - c.tick < 30 * SIM_HZ);
  if (same) {
    same.gratitude += g;
    same.fear += f;
    same.resentment += r;
    same.tick = world.tick;
    s.belief.causes.sort((a, b) => b.tick - a.tick);
    return;
  }
  s.belief.causes.unshift({ tick: world.tick, text, gratitude: g, fear: f, resentment: r });
  if (s.belief.causes.length > MAX_CAUSES) s.belief.causes.length = MAX_CAUSES;
}

/** Everyone alive within radius of a point (who could plausibly see it happen). */
export function witnesses(world: World, x: number, z: number, radius: number): Settler[] {
  return world.settlers.filter((s) => s.alive && Math.hypot(s.x - x, s.z - z) <= radius);
}

/** B&W-style worship: gratitude and fear both bring prayer; resentment takes it away. */
export function beliefScore(s: Settler): number {
  const b = s.belief;
  return clamp(b.gratitude + 0.6 * b.fear - 0.9 * b.resentment);
}

export function villageBelief(world: World): number {
  const alive = world.settlers.filter((s) => s.alive);
  if (!alive.length) return 0;
  return Math.round(alive.reduce((a, s) => a + beliefScore(s), 0) / alive.length);
}

/** Which feeling dominates belief, with its strongest recorded cause. */
export function beliefSummary(s: Settler): { mood: "devoted" | "grateful" | "fearful" | "resentful" | "indifferent"; score: number; top: string | null } {
  const b = s.belief;
  const score = Math.round(beliefScore(s));
  let mood: "devoted" | "grateful" | "fearful" | "resentful" | "indifferent" = "indifferent";
  if (b.resentment > Math.max(b.gratitude, b.fear) && b.resentment > 15) mood = "resentful";
  else if (b.fear > b.gratitude && b.fear > 20) mood = "fearful";
  else if (b.gratitude > 55) mood = "devoted";
  else if (b.gratitude > 20) mood = "grateful";
  let top: string | null = null;
  let best = 0;
  for (const c of b.causes) {
    const w = Math.abs(c.gratitude) + Math.abs(c.fear) + Math.abs(c.resentment);
    if (w > best) {
      best = w;
      top = c.text;
    }
  }
  return { mood, score, top };
}

/** Daily fading: fear fades fastest, gratitude slowest. */
export function decayBelief(world: World): void {
  for (const s of world.settlers) {
    if (!s.alive) continue;
    s.belief.gratitude *= 0.93;
    s.belief.fear *= 0.85;
    s.belief.resentment *= 0.92;
  }
}
