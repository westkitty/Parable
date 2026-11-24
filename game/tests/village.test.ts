import { describe, expect, it } from "vitest";
import { DAY_TICKS, DRY_YEAR_DAYS, LIGHTNING_DAY } from "../src/config";
import { buildWalkable, makePathFinder } from "../src/nav/grid";
import { beliefSummary, villageBelief } from "../src/sim/belief";
import { drynessAt } from "../src/sim/economy";
import { burningCount, createFireGrid, fireCellIndex, igniteAt, scorchedCount, stepFire } from "../src/sim/fire";
import { deserialize, hashWorld, serialize } from "../src/sim/save";
import { describeDetail, describeSettler, releaseSettler } from "../src/sim/settler";
import { castRain, castSanctuary, stepWorld } from "../src/sim/step";
import { LAYOUT } from "../src/sim/terrain";
import type { World, WorldEvent } from "../src/sim/types";
import { createWorld } from "../src/sim/world";

const path = makePathFinder(buildWalkable());
const cam = { tx: 0, tz: 0, yaw: 0, dist: 60 };

function run(w: World, ticks: number, sink?: WorldEvent[]): void {
  for (let i = 0; i < ticks; i += 1) {
    stepWorld(w, path);
    if (sink) sink.push(...w.events);
    w.events = [];
  }
}

describe("village: identities", () => {
  it("has twelve named villagers, two per trade, in four households with friends across them", () => {
    const w = createWorld(7);
    expect(w.settlers).toHaveLength(12);
    expect(new Set(w.settlers.map((s) => s.name)).size).toBe(12);
    const jobs: Record<string, number> = {};
    for (const s of w.settlers) jobs[s.job] = (jobs[s.job] ?? 0) + 1;
    expect(Object.values(jobs)).toEqual([2, 2, 2, 2, 2, 2]);
    for (const s of w.settlers) {
      expect(s.relationships.filter((r) => r.kind === "family")).toHaveLength(2);
      expect(s.relationships.some((r) => r.kind === "friend")).toBe(true);
      expect(s.skill[s.job]).toBeGreaterThanOrEqual(1.1); // best at their own trade
    }
    expect(w.houses).toHaveLength(4);
    expect(w.plots).toHaveLength(12);
    expect(w.sites[0]).toMatchObject({ kind: "house", have: 0, done: false });
  });
});

describe("village: work moves real resources", () => {
  it("in two days: trees are felled into logs, logs are stacked, wood reaches the site, wheat reaches the granary, people eat and pray", () => {
    const w = createWorld(7);
    const ev: WorldEvent[] = [];
    run(w, 2 * DAY_TICKS, ev);
    const n = (t: string) => ev.filter((e) => e.type === t).length;
    expect(n("felled")).toBeGreaterThan(2);
    expect(w.felled.length).toBe(n("felled"));
    expect(n("stacked")).toBeGreaterThan(4);
    expect(ev.filter((e) => e.type === "delivered" && e.res === "wood").length).toBeGreaterThan(2);
    expect(w.sites[0].have).toBeGreaterThan(2);
    expect(n("harvest")).toBeGreaterThan(2);
    expect(ev.filter((e) => e.type === "delivered" && e.res === "food").length).toBeGreaterThan(2);
    expect(ev.filter((e) => e.type === "delivered" && e.res === "water").length).toBeGreaterThan(2);
    expect(n("prayed")).toBeGreaterThan(2);
    const states = new Set(ev.filter((e) => e.type === "settler_state").map((e) => (e as { state: string }).state));
    for (const st of ["chopping", "carrying", "building", "farming", "fetching", "eating", "praying"]) expect(states.has(st)).toBe(true);
    expect(w.settlers.every((s) => s.alive)).toBe(true);
  });

  it("the villagers finish the new house; a god-laid log on the site counts as wood", () => {
    const w = createWorld(7);
    const log = w.items.find((i) => i.kind === "log")!;
    log.p = [LAYOUT.site.x + 1, 2, LAYOUT.site.z];
    log.godTouched = true;
    run(w, 10);
    expect(log.state).toBe("gone");
    expect(w.sites[0].have).toBe(1);
    const ev: WorldEvent[] = [];
    run(w, 5 * DAY_TICKS, ev);
    expect(ev.some((e) => e.type === "site_done")).toBe(true);
    expect(w.houses).toHaveLength(5);
    expect(w.settlers.some((s) => s.memories.some((m) => m.kind === "built_house") || s.belief.causes.some((c) => /wood/.test(c.text)))).toBe(true);
  });
});

describe("village: injuries", () => {
  it("a badly hurt villager is laid up, slows down, and a carer tends them back to work", () => {
    const w = createWorld(7);
    const hurt = w.settlers.find((s) => s.name === "Tamsin")!;
    hurt.injury = 0.75;
    const ev: WorldEvent[] = [];
    let laidUp = false;
    let tendedAt = -1;
    for (let i = 0; i < DAY_TICKS && tendedAt < 0; i += 1) {
      run(w, 1, ev);
      if (hurt.state === "laid_up") laidUp = true;
      if (hurt.memories.some((m) => m.kind === "was_tended")) tendedAt = i;
    }
    expect(laidUp).toBe(true);
    expect(tendedAt).toBeGreaterThan(0);
    expect(hurt.injury).toBeLessThan(0.6);
    expect(describeDetail(w, hurt)).toMatch(/hurt/);
  });

  it("a villager thrown hard is injured; family and friends resent it, with the cause on record", () => {
    const w = createWorld(7);
    const s = w.settlers[1];
    releaseSettler(w, s, s.x, s.y + 6, s.z, [18, 6, 0], true);
    run(w, 60);
    expect(s.injury).toBeGreaterThan(0.3);
    const fam = w.settlers.find((o) => o.id === s.relationships[0].id)!;
    expect(fam.belief.resentment).toBeGreaterThan(5);
    expect(fam.belief.causes[0].text).toBe(`you threw ${s.name}`);
    const sum = beliefSummary(s);
    expect(sum.top === "you threw me" || sum.recent === "you threw me").toBe(true);
  });
});

describe("the Dry Year", () => {
  it("dries out day by day and the wind picks up", () => {
    let last = -1;
    for (let d = 1; d <= DRY_YEAR_DAYS; d += 1) {
      const v = drynessAt(d, 0);
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
    expect(drynessAt(1, 0)).toBeLessThan(0.15);
    expect(drynessAt(8, 0)).toBe(1);
  });

  it("dry grass carries fire that wet grass does not (same seed, same spark)", () => {
    const burn = (dryness: number) => {
      const w = createWorld(7);
      w.climate.enabled = false;
      w.climate.dryness = dryness;
      w.climate.wind = [0, 0];
      igniteAt(w, 2, -2, 3, false);
      for (let i = 0; i < 1200; i += 1) stepFire(w);
      return scorchedCount(w.fire);
    };
    const wet = burn(0);
    const dry = burn(1);
    expect(dry).toBeGreaterThan(wet * 4);
  });

  it("lightning starts a natural wildfire in the grove on day 5", () => {
    const w = createWorld(7);
    w.climate.day = LIGHTNING_DAY;
    w.climate.dayTick = Math.round(DAY_TICKS * 0.3) - 2;
    const ev: WorldEvent[] = [];
    run(w, 4, ev);
    expect(ev.some((e) => e.type === "lightning")).toBe(true);
    expect(burningCount(w.fire)).toBeGreaterThan(0);
    const idx = w.fire.burn.findIndex((b) => b > 0);
    expect(w.fire.cause[idx]).toBe(0);
  });

  it("houses catch fire, burn to ruins, and the family remembers and records the loss; a rebuild site appears", () => {
    const w = createWorld(7);
    w.climate.enabled = false;
    const h = w.houses[1];
    igniteAt(w, h.x, h.z, 3, false);
    const ev: WorldEvent[] = [];
    run(w, 30 * 20, ev);
    expect(ev.some((e) => e.type === "house_burned" && e.house === 1)).toBe(true);
    expect(w.houses[1].state).toBe("ruin");
    const family = w.settlers.filter((s) => s.home === 1);
    expect(family.every((s) => s.memories.some((m) => m.kind === "home_burned"))).toBe(true);
    expect(w.sites.some((s) => s.kind === "rebuild" && s.house === 1)).toBe(true);
  });

  it("the year ends on day 11 with an outcome; everyone dead ends it early", () => {
    const w = createWorld(7);
    w.climate.day = DRY_YEAR_DAYS;
    w.climate.dayTick = DAY_TICKS - 2;
    run(w, 4);
    expect(w.outcome?.ended).toBe(true);
    expect(w.outcome?.survived).toBe(true);
    expect(w.outcome?.lines[0]).toMatch(/12 of 12/);
    const w2 = createWorld(7);
    for (const s of w2.settlers) s.injury = 1;
    run(w2, 3);
    expect(w2.outcome?.survived).toBe(false);
    expect(w2.outcome?.title).toBe("The valley is silent");
  });
});

describe("miracles and belief", () => {
  it("Rain puts out fire under the cloud, soaks the ground, waters crops, and the grateful say why", () => {
    const w = createWorld(7);
    w.climate.enabled = false;
    const f = LAYOUT.field;
    igniteAt(w, f.x, f.z, 3, false);
    const before = burningCount(w.fire);
    expect(before).toBeGreaterThan(0);
    for (const p of w.plots) p.moisture = 0.1;
    const s = w.settlers[3];
    s.x = f.x - 8;
    s.z = f.z;
    castRain(w, f.x, f.z);
    run(w, 8);
    expect(burningCount(w.fire)).toBeLessThan(before);
    expect(w.fire.wet[fireCellIndex(f.x, f.z)]).toBeGreaterThan(0);
    expect(w.plots.every((p) => p.moisture === 1 || Math.hypot(p.x - f.x, p.z - f.z) > 9)).toBe(true);
    expect(s.belief.causes[0].text).toBe("your rain put out the fire");
  });

  it("Sanctuary: fire cannot enter it", () => {
    const w = createWorld(7);
    w.climate.enabled = false;
    w.climate.dryness = 1;
    const g = LAYOUT.grove;
    castSanctuary(w, g.x + 6, g.z);
    igniteAt(w, g.x - 6, g.z, 3, false);
    for (let i = 0; i < 900; i += 1) stepFire(w);
    expect(w.fire.scorched[fireCellIndex(g.x + 6, g.z)]).toBe(0);
    expect(scorchedCount(w.fire)).toBeGreaterThan(10);
  });

  it("belief has inspectable causes and the village prays only when it believes", () => {
    const w = createWorld(7);
    const s = w.settlers[0];
    expect(describeSettler(w, s)).toMatch(/^Ilse, hauler —/);
    for (const o of w.settlers) o.belief.gratitude = 0;
    const ev: WorldEvent[] = [];
    run(w, DAY_TICKS, ev);
    expect(ev.filter((e) => e.type === "prayed").length).toBe(0);
    expect(villageBelief(w)).toBeLessThan(25);
  });

  it("a believing village paints the wall to completion (the mural that teaches Sanctuary)", () => {
    const w = createWorld(7);
    w.climate.enabled = false;
    for (const o of w.settlers) {
      o.belief.gratitude = 70;
      o.piety = 1;
    }
    const ev: WorldEvent[] = [];
    for (let d = 0; d < 4 && !ev.some((e) => e.type === "mural_done"); d += 1) {
      for (const o of w.settlers) o.lastPrayDay = 0;
      run(w, DAY_TICKS, ev);
    }
    expect(ev.some((e) => e.type === "mural_done")).toBe(true);
    expect(w.mural.progress).toBe(1);
  });

  it("the dry bell stone set on the altar wakes the shrine", () => {
    const w = createWorld(7);
    const stone = w.items.find((i) => i.kind === "bellstone")!;
    stone.p = [LAYOUT.shrine.x + 0.8, 3, LAYOUT.shrine.z];
    run(w, 12);
    expect(w.shrine.awakened).toBe(true);
    expect(stone.state).toBe("stacked");
  });
});

describe("village save", () => {
  it("round-trips a busy village to the same hash and keeps simulating identically", () => {
    const w = createWorld(7);
    run(w, 1500);
    castRain(w, 10, 10);
    run(w, 50);
    const text = serialize(w, cam);
    expect(hashWorld(deserialize(text).world)).toBe(hashWorld(w));
    const a = deserialize(text).world;
    const b = deserialize(text).world;
    run(a, 300);
    run(b, 300);
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
  it("fuel grid: the village burns (houses, field), paths and water never do", () => {
    const g = createFireGrid(true);
    expect(g.fuel[fireCellIndex(LAYOUT.houses[1].x, LAYOUT.houses[1].z)]).toBe(0.7);
    expect(g.fuel[fireCellIndex(LAYOUT.field.x, LAYOUT.field.z)]).toBe(0.5);
    expect(g.fuel[fireCellIndex(LAYOUT.pond.x, LAYOUT.pond.z)]).toBe(0);
  });
});
