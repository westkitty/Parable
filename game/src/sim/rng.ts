/** mulberry32: small, fast, deterministic PRNG. State is a single uint32 so it can be saved. */
export function mulberry32Step(state: number): { value: number; state: number } {
  let a = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: a >>> 0 };
}

/** Convenience wrapper over a mutable holder (the world stores rngState as a plain number). */
export function nextRandom(holder: { rngState: number }): number {
  const r = mulberry32Step(holder.rngState);
  holder.rngState = r.state;
  return r.value;
}

export function hash2(x: number, z: number, seed: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(z | 0, 668265263) ^ Math.imul(seed | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
