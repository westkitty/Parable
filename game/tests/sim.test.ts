import { describe, expect, it } from "vitest";
import { buildWalkable, findPath, makePathFinder, type PathFn } from "../src/nav/grid";
import { burningCount, igniteAt, scorchedCount, stepFire } from "../src/sim/fire";
import { deserialize, hashWorld, serialize } from "../src/sim/save";
import { describeSettler } from "../src/sim/settler";
import { stepWorld } from "../src/sim/step";
import { LAYOUT } from "../src/sim/terrain";
import { createWorld } from "../src/sim/world";

const cam = { tx: 0, tz: 0, yaw: 0, dist: 60 };

describe("fire", () => {
  it("spreads deterministically for a seed", () => {
    const run = () => {
      const w = createWorld(7, "solo");
      igniteAt(w, LAYOUT.grove.x, LAYOUT.grove.z, 3);
      const trace: number[] = [];
      for (let i = 0; i < 600; i += 1) {
        stepFire(w);
        if (i % 50 === 0) trace.push(burningCount(w.fire), scorchedCount(w.fire));
      }
      return { trace, hash: hashWorld(w) };
    };
    expect(run()).toEqual(run());
  });

  it("burns the grove, then the scorch never reverts", () => {
    const w = createWorld(7, "solo");
    const lit = igniteAt(w, LAYOUT.grove.x, LAYOUT.grove.z, 3);
    expect(lit).toBeGreaterThanOrEqual(3);
    let maxScorch = 0;
    for (let i = 0; i < 4000; i += 1) {
      stepFire(w);
      const s = scorchedCount(w.fire);
      expect(s).toBeGreaterThanOrEqual(maxScorch); // monotone: scorched cells never revert
      maxScorch = s;
    }
    expect(burningCount(w.fire)).toBe(0);
    expect(maxScorch).toBeGreaterThan(20);
  });

  it("does not ignite water or paths", () => {
    const w = createWorld(7, "solo");
    expect(igniteAt(w, LAYOUT.pond.x, LAYOUT.pond.z, 3)).toBe(0);
  });
});

describe("save", () => {
  it("round-trips to the same hash", () => {
    const w = createWorld(7, "solo");
    const path = makePathFinder(buildWalkable());
    for (let i = 0; i < 300; i += 1) stepWorld(w, path);
    igniteAt(w, LAYOUT.grove.x, LAYOUT.grove.z, 3);
    for (let i = 0; i < 40; i += 1) stepWorld(w, path);
    const text = serialize(w, cam);
    const back = deserialize(text);
    expect(hashWorld(back.world)).toBe(hashWorld(w));
    expect(back.camera).toEqual(cam);
    // And the restored world keeps simulating identically.
    const a = deserialize(text).world;
    const b = deserialize(text).world;
    for (let i = 0; i < 200; i += 1) {
      stepWorld(a, path);
      stepWorld(b, path);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });

  it("fails loudly on a version mismatch", () => {
    const w = createWorld(7, "solo");
    const bad = JSON.parse(serialize(w, cam));
    bad.version = 1;
    expect(() => deserialize(JSON.stringify(bad))).toThrow(/version/);
  });
});

describe("settler haul", () => {
  const straight: PathFn = (_ax, _az, bx, bz) => [[bx, bz]];
  it("walks to a log, carries it and stacks it (reachable path stub)", () => {
    const w = createWorld(7, "solo");
    w.items = w.items.slice(0, 1);
    w.items[0].p = [14, 1.8, 22];
    const s = w.settlers[0];
    const seen = new Set<string>();
    for (let i = 0; i < 2000 && w.woodpile.count === 0; i += 1) {
      stepWorld(w, straight);
      seen.add(s.state);
    }
    expect(w.woodpile.count).toBe(1);
    expect(w.items[0].state).toBe("stacked");
    for (const st of ["to_log", "pickup", "carrying", "stacking"]) expect(seen.has(st)).toBe(true);
  });

  it("gives up after one attempt when the log is unreachable", () => {
    const w = createWorld(7, "solo");
    w.items = w.items.slice(0, 1);
    const never: PathFn = () => null;
    let attempts = 0;
    for (let i = 0; i < 400; i += 1) {
      stepWorld(w, never);
      attempts = w.settlers[0].unreachable.length;
      if (i === 1) expect(describeSettler(w, w.settlers[0])).toBe("I can't reach that.");
    }
    expect(attempts).toBe(1);
    expect(w.woodpile.count).toBe(0);
    expect(w.settlers[0].state).not.toBe("to_log");
  });

  it("real grid: a log in the pond is unreachable, one on the meadow is reachable", () => {
    const walk = buildWalkable();
    expect(findPath(walk, 17, 19, LAYOUT.pond.x, LAYOUT.pond.z)).toBeNull();
    const p = findPath(walk, 17, 19, LAYOUT.meadow.x, LAYOUT.meadow.z);
    expect(p).not.toBeNull();
    expect(p!.length).toBeGreaterThan(0);
  });

  it("flees a god-made fire within 18 m and remembers it", () => {
    const w = createWorld(7, "solo");
    const path = makePathFinder(buildWalkable());
    const s = w.settlers[0];
    s.x = LAYOUT.grove.x + 12;
    s.z = LAYOUT.grove.z + 8;
    w.items = [];
    igniteAt(w, LAYOUT.grove.x, LAYOUT.grove.z, 3);
    w.godFireUntil = w.tick + 1;
    let fledAt = -1;
    for (let i = 0; i < 40 && fledAt < 0; i += 1) {
      stepWorld(w, path);
      if (s.state === "flee") fledAt = i;
    }
    expect(fledAt).toBeGreaterThanOrEqual(0);
    expect(fledAt).toBeLessThan(20);
    expect(s.memories[0]).toMatchObject({ kind: "saw_fire", causedByGod: true, place: "the grove", feeling: "scared" });
    expect(describeSettler(w, s)).toMatch(/^Scared — your fire took the grove/);
  });
});
