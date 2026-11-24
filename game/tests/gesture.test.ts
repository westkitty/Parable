import { describe, expect, it } from "vitest";
import { Ritual, analyzeGesture, resample } from "../src/input/gesture";
import { ACCEPT_COUNTERCLOCKWISE, RITUAL_ARM_MS } from "../src/config";
import { ring, spiral, wander, wave, zigzag } from "./gestureCorpus";

describe("ritual gesture recogniser", () => {
  it("recognises 30/30 clockwise spirals as clockwise", () => {
    let ok = 0;
    for (let s = 1; s <= 30; s += 1) {
      const g = analyzeGesture(spiral(s, true));
      if (g.kind === "spiral" && g.clockwise) ok += 1;
    }
    expect(ok).toBe(30);
  });
  it("never reads a counter-clockwise spiral as clockwise (0/30)", () => {
    let bad = 0;
    for (let s = 101; s <= 130; s += 1) {
      const g = analyzeGesture(spiral(s, false));
      if (g.kind === "spiral" && g.clockwise) bad += 1;
    }
    expect(bad).toBe(0);
  });
  it("recognises 30/30 vertical zigzags", () => {
    let ok = 0;
    for (let s = 201; s <= 230; s += 1) if (analyzeGesture(zigzag(s)).kind === "zigzag") ok += 1;
    expect(ok).toBe(30);
  });
  it("gives at most 1 false positive per 100 ordinary mouse wanders (tested over 500)", () => {
    let fp = 0;
    // M1 glyph shapes only (spiral arms; zigzag/wave/ring finish). The M4 straight-line/peak/vee finishers
    // are checked separately below: a straight mouse move IS a line, so those rely on the arming spiral.
    for (let s = 301; s <= 800; s += 1) if (["spiral", "zigzag", "wave", "ring"].includes(analyzeGesture(wander(s)).kind)) fp += 1;
    expect(fp).toBeLessThanOrEqual(5);
  });
  it("resample returns exactly n points", () => {
    expect(resample(zigzag(5), 42)).toHaveLength(42);
  });
  it("ritual: 30/30 clockwise spiral -> vertical zigzag pairs summon a Fireball", () => {
    let ok = 0;
    for (let s = 1; s <= 30; s += 1) {
      const r = new Ritual(RITUAL_ARM_MS, ACCEPT_COUNTERCLOCKWISE);
      const a = r.feed(analyzeGesture(spiral(s, true)), 1000);
      const b = r.feed(analyzeGesture(zigzag(200 + s)), 1000 + 2500);
      if (a === "armed" && b === "fireball") ok += 1;
    }
    expect(ok).toBe(30);
  });
  it("ritual: counter-clockwise spirals never arm, zigzag alone never casts, arming expires", () => {
    for (let s = 1; s <= 30; s += 1) {
      const r = new Ritual(RITUAL_ARM_MS, ACCEPT_COUNTERCLOCKWISE);
      expect(r.feed(analyzeGesture(spiral(100 + s, false)), 0)).toBeNull();
      expect(r.feed(analyzeGesture(zigzag(200 + s)), 100)).toBeNull();
      r.feed(analyzeGesture(spiral(s, true)), 1000);
      expect(r.feed(analyzeGesture(zigzag(200 + s)), 1000 + RITUAL_ARM_MS + 1)).toBeNull();
    }
  });
  it("recognises 30/30 waves and 30/30 rings, and never confuses the four glyph strokes", () => {
    let w = 0;
    let g = 0;
    for (let s = 401; s <= 430; s += 1) if (analyzeGesture(wave(s)).kind === "wave") w += 1;
    for (let s = 501; s <= 530; s += 1) if (analyzeGesture(ring(s)).kind === "ring") g += 1;
    expect(w).toBe(30);
    expect(g).toBe(30);
    for (let s = 1; s <= 30; s += 1) {
      expect(analyzeGesture(spiral(s, true)).kind).toBe("spiral");
      expect(analyzeGesture(zigzag(200 + s)).kind).toBe("zigzag");
    }
  });
  it("ritual: spiral -> wave = Rain, spiral -> ring = Sanctuary; neither casts unarmed", () => {
    for (let s = 1; s <= 20; s += 1) {
      const r = new Ritual(RITUAL_ARM_MS, ACCEPT_COUNTERCLOCKWISE);
      expect(r.feed(analyzeGesture(wave(400 + s)), 0)).toBeNull();
      expect(r.feed(analyzeGesture(ring(500 + s)), 0)).toBeNull();
      r.feed(analyzeGesture(spiral(s, true)), 1000);
      expect(r.feed(analyzeGesture(wave(400 + s)), 2000)).toBe("rain");
      r.feed(analyzeGesture(spiral(s, true)), 3000);
      expect(r.feed(analyzeGesture(ring(500 + s)), 4000)).toBe("sanctuary");
    }
  });
});

import { MIRACLES, miracleFor } from "../src/input/gesture";
import { closedPoly, line, peak, vee } from "./gestureCorpus";

describe("the ten miracle finishers", () => {
  const cases: [string, (s: number) => ReturnType<typeof zigzag>, string][] = [
    ["fireball", zigzag, "zigzag"],
    ["rain", wave, "wave"],
    ["sanctuary", ring, "ring"],
    ["heal", vee, "vee"],
    ["lightning", (s) => line(s, "down"), "line"],
    ["fertility", (s) => line(s, "up"), "line"],
    ["wind", (s) => line(s, "side"), "line"],
    ["stone", (s) => closedPoly(s, 4), "square"],
    ["beacon", peak, "peak"],
    ["golem", (s) => closedPoly(s, 3), "triangle"],
  ];
  it("covers exactly ten miracles", () => {
    expect(MIRACLES.length).toBe(10);
    expect(cases.map((c) => c[0]).sort()).toEqual([...MIRACLES].sort());
  });
  for (const [m, gen] of cases) {
    it(`reads at least 28/30 drawn ${m} finishers as ${m}, and never as another miracle`, () => {
      let ok = 0;
      let wrong = 0;
      for (let s = 1000; s < 1030; s += 1) {
        const got = miracleFor(analyzeGesture(gen(s)));
        if (got === m) ok += 1;
        else if (got) wrong += 1;
      }
      expect(ok).toBeGreaterThanOrEqual(28);
      expect(wrong).toBe(0);
    });
  }
  it("wanders almost never arm the ritual (at most 1 in 100), so a stray finisher alone casts nothing", () => {
    let arm = 0;
    for (let s = 301; s <= 800; s += 1) if (analyzeGesture(wander(s)).kind === "spiral") arm += 1;
    expect(arm).toBeLessThanOrEqual(5);
  });
  it("inside the 5.6 s armed window, a wander reads as some finisher at most 3 in 100 (was 6 in 100 before the straightness check)", () => {
    let fp = 0;
    for (let s = 301; s <= 800; s += 1) if (miracleFor(analyzeGesture(wander(s)))) fp += 1;
    expect(fp).toBeLessThanOrEqual(15);
  });
});
