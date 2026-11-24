import { describe, expect, it } from "vitest";
import { DAY_TICKS, GOLEM_JOB_UPKEEP_PER_DAY, GOLEM_UPKEEP_PER_DAY } from "../src/config";
import { buildWalkable, makePathFinder } from "../src/nav/grid";
import { fireCellCenter, fireCellIndex, houseCells } from "../src/sim/fire";
import { canAfford, castRain, spend, stepWorld } from "../src/sim/step";
import { LAYOUT } from "../src/sim/terrain";
import { createWorld } from "../src/sim/world";
import type { World } from "../src/sim/types";

const fp = makePathFinder(buildWalkable());
const vc = LAYOUT.villageCentre;

function runYear(seed: number, attend: boolean): World {
  const w = createWorld(seed, "village");
  for (let i = 0; i < 11 * DAY_TICKS && !w.outcome; i += 1) {
    stepWorld(w, fp);
    w.events = [];
    if (!attend || i % 60 !== 0 || !canAfford(w, "rain")) continue;
    // A watchful god: rain on the fire nearest the village, otherwise on a parched field.
    let best = -1;
    let bd = Infinity;
    for (let k = 0; k < w.fire.burn.length; k += 1) {
      if (w.fire.burn[k] <= 0) continue;
      const [x, z] = fireCellCenter(k);
      const d = Math.hypot(x - vc.x, z - vc.z);
      if (d < bd) [bd, best] = [d, k];
    }
    if (best >= 0 && bd < 60) {
      const [x, z] = fireCellCenter(best);
      castRain(w, x, z);
      spend(w, "rain");
    } else if (w.power >= 70 && w.plots.some((p) => !p.dead && p.moisture < 0.2)) {
      castRain(w, LAYOUT.field.x, LAYOUT.field.z);
      spend(w, "rain");
    }
  }
  return w;
}

describe("the Dry Year is dangerous when neglected and winnable when tended", () => {
  it("left alone, the village loses people on every sampled seed (seed 7 used to come through with all 12)", () => {
    const dead = [3, 5, 7].map((seed) => runYear(seed, false).outcome!.dead);
    for (const d of dead) expect(d).toBeGreaterThanOrEqual(1);
    expect(dead.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(5);
  }, 120_000);
  it("seed 7 tended with Rain alone comes through whole", () => {
    const w = runYear(7, true);
    expect(w.outcome?.survived).toBe(true);
    expect(w.outcome!.dead).toBe(0);
  }, 60_000);
  it("standing beside a fire (not in it) now hurts", () => {
    const w = createWorld(3, "village");
    const s = w.settlers[0];
    const idx = fireCellIndex(s.x, s.z);
    w.fire.burn[idx + 1] = 500;
    w.fire.fuel[idx + 1] = 1;
    const before = s.injury;
    stepWorld(w, fp);
    expect(s.injury).toBeGreaterThan(before);
  });
  it("a fire in the granary burns the stores", () => {
    const w = createWorld(3, "village");
    const food = w.granary.food;
    for (let i = 0; i < 400; i += 1) {
      for (const idx of houseCells(w.granary.x, w.granary.z)) w.fire.burn[idx] = 50;
      stepWorld(w, fp);
    }
    expect(w.granary.food).toBeLessThan(food);
  });
  it("a working golem costs about half the village's daily faith", () => {
    expect(GOLEM_UPKEEP_PER_DAY + GOLEM_JOB_UPKEEP_PER_DAY).toBeGreaterThanOrEqual(9);
  });
});

import { computeOutcome } from "../src/sim/economy";
import { fallenFromRecords } from "../src/render/cairns";
describe("the land remembers", () => {
  it("the year's end names the dead and how they died", () => {
    const w = createWorld(7, "village");
    w.settlers[2].alive = false;
    w.settlers[2].causeOfDeath = "choked on the smoke";
    const o = computeOutcome(w, true);
    expect(o.lines.join(" ")).toContain(`Remembered: ${w.settlers[2].name}, choked on the smoke`);
  });
  it("cairns gather every fallen villager from the records, numbered by year", () => {
    const f = fallenFromRecords([{ fallen: [{ name: "Bram", cause: "starved", x: 1, z: 2 }] }, {}, { fallen: [{ name: "Oda", cause: "burned in the wildfire", x: 3, z: 4 }] }]);
    expect(f.map((x) => `${x.name}@${x.year}`)).toEqual(["Bram@1", "Oda@3"]);
  });
});
