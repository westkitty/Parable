import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildWalkable, makePathFinder } from "../src/nav/grid";
import { burningCount, fireCellIndex, igniteAt } from "../src/sim/fire";
import { dropGolem, jobAt, logsInRing, wakeGolem } from "../src/sim/golems";
import { castBeacon, castFertility, castHeal, castLightning, castStone, castWind } from "../src/sim/miracles";
import { trees } from "../src/sim/scenery";
import { stepWorld } from "../src/sim/step";
import { LAYOUT, terrainHeight } from "../src/sim/terrain";
import type { World, WorldEvent } from "../src/sim/types";
import { addItem, createWorld } from "../src/sim/world";

const path = makePathFinder(buildWalkable());
function run(w: World, ticks: number, settlers = true, sink?: WorldEvent[]): void {
  for (let i = 0; i < ticks; i += 1) {
    stepWorld(w, path, { settlers });
    if (sink) sink.push(...w.events);
    w.events = [];
  }
}
const causes = (w: World, id: number) => w.settlers[id].belief.causes.map((c) => c.text);
function place(w: World, id: number, x: number, z: number) {
  const s = w.settlers[id];
  s.x = x;
  s.z = z;
  s.y = terrainHeight(x, z);
  s.path = [];
  return s;
}

describe("the seven later miracles", () => {
  it("Healing closes a wound, greens scorched ground, and leaves a grateful memory", () => {
    const w = createWorld(3);
    const s = place(w, 0, 10, 10);
    s.injury = 0.7;
    igniteAt(w, 12, 10, 1.5, false);
    for (const i of [fireCellIndex(12, 10)]) {
      w.fire.burn[i] = 0;
      w.fire.scorched[i] = 1;
    }
    const r = castHeal(w, 10, 10);
    expect(s.injury).toBeLessThan(0.2);
    expect(r.healed).toContain(s.name);
    expect(r.regrown).toBeGreaterThan(0);
    expect(s.memories[0].kind).toBe("was_healed");
    expect(causes(w, 0)).toContain("your light healed me");
  });

  it("Lightning splits a tree into two logs, starts a fire, and hurts and angers whoever stood there", () => {
    const w = createWorld(3);
    const t = trees().find((t) => Math.hypot(t.x - 21, t.z - 17) > 30)!;
    const s = place(w, 1, t.x + 1, t.z);
    const before = w.items.filter((i) => i.kind === "log").length;
    const r = castLightning(w, t.x, t.z);
    expect(r.logs).toBe(2);
    expect(w.items.filter((i) => i.kind === "log").length).toBe(before + 2);
    expect(burningCount(w.fire)).toBeGreaterThan(0);
    expect(s.injury).toBeGreaterThan(0.3);
    expect(s.belief.resentment).toBeGreaterThan(10);
    expect(causes(w, 1)).toContain("your lightning struck me");
  });

  it("Fertility ripens the field and farmers are the most grateful", () => {
    const w = createWorld(3);
    const f = LAYOUT.field;
    for (const p of w.plots) p.growth = 0.1;
    const farmer = w.settlers.findIndex((s) => s.job === "farmer");
    const other = w.settlers.findIndex((s) => s.job !== "farmer");
    place(w, farmer, f.x, f.z + 6);
    place(w, other, f.x + 2, f.z + 6);
    const r = castFertility(w, f.x, f.z);
    expect(r.plots).toBe(12);
    expect(w.plots.every((p) => p.growth === 1)).toBe(true);
    expect(w.settlers[farmer].belief.gratitude).toBeGreaterThan(w.settlers[other].belief.gratitude);
  });

  it("Wind Lash overrides the weather, knocks villagers down and throws loose logs", () => {
    const w = createWorld(3);
    const s = place(w, 2, 5, 5);
    const log = addItem(w, "log", 6, terrainHeight(6, 5) + 0.5, 5);
    castWind(w, 5, 5, 1, 0);
    expect(s.state).toBe("recover");
    expect(log.v[0]).toBeGreaterThan(5);
    run(w, 2, false);
    expect(w.climate.wind[0]).toBeGreaterThan(1);
    expect(causes(w, 2)).toContain("your wind knocked me down");
  });

  it("Stone Shape raises a ring that fire cannot cross and gives builders stone", () => {
    const w = createWorld(3);
    const site = w.sites[0];
    const r = castStone(w, site.x + 2, site.z);
    expect(r.toSite).toBe(3);
    expect(site.have).toBe(3);
    const idx = fireCellIndex(site.x + 2, site.z);
    expect(w.fire.fuel[idx]).toBe(0);
    igniteAt(w, site.x + 2, site.z, 1.2, true);
    expect(w.fire.burn[idx]).toBe(0);
  });

  it("Beacon pulls the village to gather and pray, adding prayer power", () => {
    const w = createWorld(3);
    w.power = 20;
    castBeacon(w, 21, 17);
    run(w, 30 * 30);
    expect(w.settlers.some((s) => s.memories.some((m) => m.kind === "gathered_at_beacon"))).toBe(true);
    expect(w.power).toBeGreaterThan(20);
  });

  it("each glyph stone wakes by its own ritual (logs beside the stone stone)", () => {
    const w = createWorld(3);
    const g = w.glyphStones.find((g) => g.miracle === "stone")!;
    expect(g.awake).toBe(false);
    for (const k of [-1, 1]) addItem(w, "log", g.x + k, terrainHeight(g.x, g.z) + 0.4, g.z + 1.5);
    run(w, 12, false);
    expect(g.awake).toBe(true);
    expect(w.glyphStones.filter((s) => s.awake)).toHaveLength(1);
  });
});

function golemWorld(): World {
  const w = createWorld(5);
  w.power = 100;
  const r = w.golemForm;
  for (let k = 0; k < 4; k += 1) addItem(w, "log", r.x + Math.cos(k * 1.6) * 1.2, terrainHeight(r.x, r.z) + 0.4, r.z + Math.sin(k * 1.6) * 1.2);
  run(w, 12, false);
  return w;
}

describe("golems", () => {
  it("four logs laid in the old ring become one dormant golem; the triangle glyph wakes it", () => {
    const w = golemWorld();
    expect(w.golems).toHaveLength(1);
    expect(w.golems[0]).toMatchObject({ awake: false, state: "dormant", wood: 4 });
    expect(logsInRing(w)).toHaveLength(0);
    expect(wakeGolem(w, 80, 80)).toBe(-1); // too far away
    expect(wakeGolem(w, w.golemForm.x + 3, w.golemForm.z)).toBe(w.golems[0].id);
    expect(w.golems[0].awake).toBe(true);
  });

  it("its job is where the hand sets it down", () => {
    const w = golemWorld();
    expect(jobAt(w, w.woodpile.x + 2, w.woodpile.z)).toBe("haul");
    expect(jobAt(w, w.sites[0].x, w.sites[0].z + 2)).toBe("build");
    expect(jobAt(w, LAYOUT.well.x + 1, LAYOUT.well.z)).toBe("douse");
    expect(jobAt(w, -60, -10)).toBe("none");
  });

  it("a hauling golem carries a loose log to the site, slowly, and villagers see it", () => {
    const w = golemWorld();
    const g = w.golems[0];
    wakeGolem(w, g.x, g.z);
    dropGolem(w, g, w.woodpile.x + 2, w.woodpile.z);
    expect(g.job).toBe("haul");
    addItem(w, "log", w.woodpile.x + 10, terrainHeight(w.woodpile.x + 10, w.woodpile.z) + 0.4, w.woodpile.z);
    const site = w.sites[0];
    const ev: WorldEvent[] = [];
    run(w, 30 * 90, false, ev);
    expect(g.workDone).toBeGreaterThanOrEqual(1);
    expect(site.have + w.woodpile.count).toBeGreaterThan(0);
    expect(ev.some((e) => e.type === "golem_work")).toBe(true);
  });

  it("a building golem carries woodpile wood to the site and raises it", () => {
    const w = golemWorld();
    const g = w.golems[0];
    wakeGolem(w, g.x, g.z);
    const site = w.sites[0];
    w.woodpile.count = site.need;
    dropGolem(w, g, site.x + 2, site.z + 2);
    expect(g.job).toBe("build");
    run(w, 30 * 240, false);
    expect(site.have).toBeGreaterThanOrEqual(2);
    expect(site.work).toBeGreaterThan(0);
  });

  it("a dousing golem fetches water at the well and puts out a fire near the village", () => {
    const w = golemWorld();
    const g = w.golems[0];
    wakeGolem(w, g.x, g.z);
    dropGolem(w, g, LAYOUT.well.x + 1, LAYOUT.well.z + 1);
    expect(g.job).toBe("douse");
    run(w, 30 * 5, false); // it fills up at the well first
    expect(g.carryWater).toBe(true);
    w.climate.day = 8; // the Dry Year's crisis
    w.climate.lightningDone = true;
    const h = w.houses[0];
    igniteAt(w, h.x, h.z, 2, false);
    const lit = burningCount(w.fire);
    expect(lit).toBeGreaterThan(0);
    run(w, 30 * 60, false);
    expect(g.workDone).toBeGreaterThanOrEqual(1);
  });

  it("golems drain prayer power and fall asleep when it runs out", () => {
    const w = golemWorld();
    const g = w.golems[0];
    wakeGolem(w, g.x, g.z);
    dropGolem(w, g, w.woodpile.x + 2, w.woodpile.z);
    w.power = 0.002;
    const ev: WorldEvent[] = [];
    run(w, 10, false, ev);
    expect(g.awake).toBe(false);
    expect(ev.some((e) => e.type === "golem_slept")).toBe(true);
  });

  it("the golem module has no way to cast a miracle", () => {
    const src = readFileSync(new URL("../src/sim/golems.ts", import.meta.url), "utf8");
    expect(src).not.toMatch(/import[^;]*\bcast\w*/);
    expect(src).not.toMatch(/from "\.\/miracles"/);
    expect(src).not.toMatch(/\bspend\(|learn\(/);
  });
});
