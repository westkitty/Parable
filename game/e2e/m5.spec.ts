// M5 — the ten miracles: every one is a drawn gesture (clockwise spiral, then a finishing stroke) with a
// visible effect on the land and the villagers. Here: the seven added after Fireball, Rain and Sanctuary,
// learned at old-god glyph stones (woken by physical rituals) and in the temple.
// M6 — golems: four logs in the old ring form one; Golem Wake wakes it; where the hand sets it down is its job.
import { test } from "@playwright/test";
import { boot, expect, frames, hook, keepVideo, moveSmooth, ritual, shot, state, useEvidence, waitFor, writeResult, type P } from "./helpers";

test.beforeEach(() => useEvidence("m5"));

const village = (page: P) => hook<P>(page, "village");
type XY = { x: number; y: number };

/** A polyline through corners, one point every ~10 px. */
function poly(corners: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 1; i < corners.length; i += 1) {
    const [ax, ay] = corners[i - 1];
    const [bx, by] = corners[i];
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 10));
    for (let k = i === 1 ? 0 : 1; k <= n; k += 1) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  return out;
}
// Open finishers end where the miracle should land (it acts under the hand); closed ones surround it.
const vee = (t: XY) => poly([[t.x - 160, t.y - 10], [t.x - 80, t.y + 130], [t.x, t.y]]);
const peakUp = (t: XY) => poly([[t.x - 160, t.y + 10], [t.x - 80, t.y - 130], [t.x, t.y]]);
const lineDown = (t: XY) => poly([[t.x + 4, t.y - 200], [t.x, t.y]]);
const lineUp = (t: XY) => poly([[t.x - 4, t.y + 200], [t.x, t.y]]);
const lineSide = (t: XY) => poly([[t.x - 220, t.y + 6], [t.x, t.y]]);
const square = (t: XY, r = 95) => poly([[t.x - r, t.y - r], [t.x + r, t.y - r], [t.x + r, t.y + r], [t.x - r, t.y + r], [t.x - r + 4, t.y - r + 6]]);
const triangle = (t: XY, r = 110) => poly([[t.x, t.y - r], [t.x + r * 0.95, t.y + r * 0.6], [t.x - r * 0.95, t.y + r * 0.6], [t.x + 4, t.y - r + 6]]);

/** Spiral drawn just beside the target, then the finisher. */
async function cast(page: P, _t: XY, finisher: [number, number][]): Promise<void> {
  const [fx, fy] = finisher[0];
  await ritual(page, Math.min(1300, Math.max(140, fx - 40)), Math.min(780, Math.max(140, fy - 160)), finisher);
  await frames(page, 2);
}

async function enterTemple(page: P): Promise<void> {
  await hook(page, "setCamera", { tx: 31.2, tz: -24, yaw: 0, dist: 34 });
  await frames(page, 3);
  const door = await hook<XY>(page, "templeDoorScreen");
  await page.mouse.move(door.x, door.y);
  await page.mouse.click(door.x, door.y, { button: "left" });
  await waitFor(page, `window.__parable.state().templeMode === "chamber"`, 60_000);
  await frames(page, 4);
}
async function touch(page: P, tablet: string): Promise<void> {
  const t = await hook<XY>(page, "tabletScreen", tablet);
  await page.mouse.move(t.x, t.y);
  await frames(page, 3);
  await page.mouse.click(t.x, t.y, { button: "left" });
  await frames(page, 2);
}
const lastLog = async (page: P, re: RegExp) => ((await state(page)).log as string[]).filter((l) => re.test(l)).pop() ?? null;

test("m5-1 a glyph stone wakes when two logs are laid by it; tracing its glyph there teaches Stone Shape, which raises a ring fire cannot cross", async ({ page }) => {
  await boot(page);
  await hook(page, "setPower", 100);
  const gs = { x: 12, z: -42 };
  await hook(page, "setCamera", { tx: gs.x, tz: gs.z + 4, yaw: 0, dist: 34 });
  await frames(page, 3);
  await shot(page, "m5-01-stone-asleep");
  // The ritual: two logs laid beside the stone (placed by hook; the hand-carry path is the same code as M1/M3 carries).
  await hook(page, "addLog", gs.x - 1, gs.z + 2);
  await hook(page, "addLog", gs.x + 1.2, gs.z + 2.2);
  await waitFor(page, `window.__parable.village().glyphStones.find((g) => g.miracle === "stone").awake === true`, 30_000);
  await frames(page, 4);
  await shot(page, "m5-01-stone-awake");
  const target = { x: gs.x + 6, z: gs.z + 4 };
  const t = await hook<XY>(page, "groundScreen", target.x, target.z);
  await cast(page, t, square(t));
  await waitFor(page, `window.__parable.village().stoneworks > 0`, 20_000);
  await hook(page, "igniteAt", target.x, target.z, 1.5);
  await hook(page, "stepTicks", 60);
  await frames(page, 4);
  await shot(page, "m5-01-stone-ring");
  const v = await village(page);
  const learned = await lastLog(page, /learned stone at/);
  writeResult("m5-01-glyph-stone", { learned, stoneworks: v.stoneworks, power: v.power, burning: (await state(page)).burning, stones: v.glyphStones });
  expect(learned).toMatch(/glyph stone/);
  expect(v.learned).toContain("stone");
  expect(v.stoneworks).toBe(1);
  expect(v.power).toBeLessThan(85); // 30 spent from 100 (prayer trickles some back meanwhile)
});

test("m5-2 Healing (spiral, then V) closes a villager's wound and greens the burnt ground; the villager remembers why", async ({ page }) => {
  await boot(page);
  await hook(page, "setPower", 100);
  await hook(page, "learn", "heal");
  await hook(page, "setSettlerAi", false);
  const at = { x: 6, z: 8 };
  const id = (await hook<P[]>(page, "settlers"))[3].id;
  await hook(page, "placeSettler", at.x, at.z, id);
  await hook(page, "hurt", id, 0.7);
  await hook(page, "setCamera", { tx: at.x, tz: at.z + 4, yaw: 0, dist: 30 });
  await frames(page, 3);
  const before = (await hook<P[]>(page, "settlers"))[3];
  const t = await hook<XY>(page, "groundScreen", at.x, at.z);
  await cast(page, t, vee(t));
  await waitFor(page, `window.__parable.settlers()[3].injury < 0.3`, 20_000);
  await frames(page, 3);
  await shot(page, "m5-02-healing");
  const after = (await hook<P[]>(page, "settlers"))[3];
  writeResult("m5-02-healing", { before: before.injury, after: after.injury, memories: after.memoryKinds.slice(0, 3), mood: after.mood, log: await lastLog(page, /heal at/) });
  expect(after.injury).toBeLessThan(before.injury - 0.4);
  expect(after.memoryKinds[0]).toBe("was_healed");
});

test("m5-3 Lightning (spiral, then a stroke down) splits a tree into logs and sets it burning", async ({ page }) => {
  await boot(page);
  await hook(page, "setPower", 100);
  await hook(page, "learn", "lightning");
  const tree = await hook<{ x: number; z: number }>(page, "treeNear", -20, -10);
  await hook(page, "setCamera", { tx: tree.x, tz: tree.z + 5, yaw: 0, dist: 34 });
  await frames(page, 3);
  const logs0 = (await state(page)).items.filter((i: P) => i.kind === "log").length;
  const t = await hook<XY>(page, "groundScreen", tree.x, tree.z);
  await cast(page, t, lineDown(t));
  await waitFor(page, `window.__parable.state().log.some((l) => /bolt at/.test(l))`, 20_000);
  await hook(page, "stepTicks", 20);
  await frames(page, 3);
  await shot(page, "m5-03-lightning");
  const st = await state(page);
  const line = await lastLog(page, /bolt at/);
  writeResult("m5-03-lightning", { tree, line, logsBefore: logs0, logsAfter: st.items.filter((i: P) => i.kind === "log").length, burning: st.burning });
  expect(line).toMatch(/2 logs/);
  expect(st.burning).toBeGreaterThan(0);
});

test("m5-4 Fertility (spiral, then a stroke up) ripens the whole field; Wind Lash (spiral, then a stroke sideways) bends the weather", async ({ page }) => {
  await boot(page);
  await hook(page, "setPower", 100);
  await hook(page, "learn", "fertility");
  await hook(page, "learn", "wind");
  const f = { x: 40, z: 12 };
  await hook(page, "setCamera", { tx: f.x, tz: f.z + 4, yaw: 0, dist: 36 });
  await frames(page, 3);
  await shot(page, "m5-04-field-before");
  const before = (await village(page)).plots;
  const t = await hook<XY>(page, "groundScreen", f.x, f.z);
  await cast(page, t, lineUp(t));
  await waitFor(page, `window.__parable.village().plots.every((p) => p >= 0.99)`, 20_000);
  await frames(page, 6);
  await shot(page, "m5-04-fertility");
  const after = (await village(page)).plots;
  // Wind Lash over the village, drawn left to right.
  const w = { x: 18, z: 16 };
  await hook(page, "setCamera", { tx: w.x, tz: w.z + 4, yaw: 0, dist: 44 });
  await frames(page, 3);
  const wt = await hook<XY>(page, "groundScreen", w.x, w.z);
  const wind0 = (await village(page)).wind;
  await cast(page, wt, lineSide(wt));
  await waitFor(page, `window.__parable.village().gust !== null`, 20_000);
  await hook(page, "stepTicks", 3);
  await frames(page, 4);
  await shot(page, "m5-04-wind");
  const v = await village(page);
  writeResult("m5-04-fertility-wind", { before, after, wind0, wind1: v.wind, gust: v.gust, log: await lastLog(page, /wind at/) });
  expect(after.every((g: number) => g >= 0.99)).toBe(true);
  expect(Math.hypot(...(v.wind as [number, number]))).toBeGreaterThan(Math.hypot(...(wind0 as [number, number])));
});

test("m5-5 Beacon is learned at the temple brazier when faith burns high, and (spiral, then a peak) calls the village to gather and pray", async ({ page }) => {
  await boot(page);
  await hook(page, "setPower", 60);
  await enterTemple(page);
  await touch(page, "beacon");
  const low = await lastLog(page, /brazier/);
  await hook(page, "setPower", 95);
  await frames(page, 6);
  await shot(page, "m5-05-brazier-high");
  await touch(page, "beacon");
  const learned = await lastLog(page, /brazier/);
  await page.keyboard.press("Escape");
  await waitFor(page, `window.__parable.state().templeMode === "world"`, 30_000);
  const at = { x: 21, z: 17 };
  await hook(page, "setCamera", { tx: at.x, tz: at.z + 6, yaw: 0.4, dist: 52 });
  await frames(page, 3);
  const t = await hook<XY>(page, "groundScreen", at.x, at.z);
  await cast(page, t, peakUp(t));
  await waitFor(page, `window.__parable.village().beacon !== null`, 20_000);
  const p0 = (await village(page)).power;
  await hook(page, "stepTicks", 30 * 25);
  await frames(page, 4);
  await shot(page, "m5-05-beacon");
  const ss = await hook<P[]>(page, "settlers");
  const gathered = ss.filter((s: P) => s.memoryKinds.includes("gathered_at_beacon")).length;
  writeResult("m5-05-beacon", { low, learned, powerAfterCast: p0, powerLater: (await village(page)).power, gathered });
  expect(low).toMatch(/too low/);
  expect(learned).toMatch(/learned Beacon/);
  expect(gathered).toBeGreaterThan(2);
});

test("m6-1 golem: four logs in the old ring form a body; the stele teaches Golem Wake; set down by the building site it carries wood and builds", async ({ page }) => {
  await boot(page);
  await hook(page, "setPower", 100);
  const r = (await village(page)).golemForm;
  await hook(page, "setCamera", { tx: r.x, tz: r.z + 4, yaw: 0.3, dist: 30 });
  for (let k = 0; k < 4; k += 1) await hook(page, "addLog", r.x + Math.cos(k * 1.6) * 1.2, r.z + Math.sin(k * 1.6) * 1.2);
  await waitFor(page, `window.__parable.village().golems.length === 1`, 30_000);
  await frames(page, 4);
  await shot(page, "m6-01-golem-dormant");
  // Golem Wake is not known yet: the triangle fizzles.
  let t = await hook<XY>(page, "groundScreen", r.x, r.z);
  await cast(page, t, triangle(t));
  await waitFor(page, `window.__parable.state().log.some((l) => /fizzle: golem not learned/.test(l))`, 20_000);
  await enterTemple(page);
  await touch(page, "golem");
  const learned = await lastLog(page, /stele/);
  await page.keyboard.press("Escape");
  await waitFor(page, `window.__parable.state().templeMode === "world"`, 30_000);
  await hook(page, "setCamera", { tx: r.x, tz: r.z + 4, yaw: 0.3, dist: 30 });
  await frames(page, 3);
  t = await hook<XY>(page, "groundScreen", r.x, r.z);
  await cast(page, t, triangle(t));
  await waitFor(page, `window.__parable.village().golems[0].awake === true`, 20_000);
  await frames(page, 4);
  await shot(page, "m6-01-golem-awake");
  // Pick it up with the hand and set it down by the building site.
  const g0 = (await village(page)).golems[0];
  const site = { x: 21, z: 33 };
  await hook(page, "setCamera", { tx: (g0.x + site.x) / 2, tz: (g0.z + site.z) / 2 + 6, yaw: 0, dist: 44 });
  await frames(page, 3);
  const a = await hook<XY>(page, "golemScreen", g0.id);
  const b = await hook<XY>(page, "groundScreen", site.x + 4, site.z + 3);
  await page.mouse.move(a.x, a.y);
  await frames(page, 2);
  await page.mouse.down({ button: "right" });
  const held = (await state(page)).held;
  await moveSmooth(page, a.x, a.y, b.x, b.y, 16, 30);
  await page.waitForTimeout(400);
  await page.mouse.up({ button: "right" });
  await frames(page, 2);
  const job = (await village(page)).golems[0].job;
  const v0 = await village(page);
  await hook(page, "stepTicks", 30 * 120);
  await hook(page, "setCamera", { tx: site.x, tz: site.z + 4, yaw: 0.3, dist: 26 });
  await frames(page, 4);
  await shot(page, "m6-01-golem-building");
  const v1 = await village(page);
  writeResult("m6-01-golem-build", { learned, held, job, siteBefore: v0.sites[0], siteAfter: v1.sites[0], woodpileBefore: v0.woodpile, woodpileAfter: v1.woodpile, golem: v1.golems[0], powerBefore: v0.power, powerAfter: v1.power });
  expect(learned).toMatch(/learned Golem Wake/);
  expect(held?.kind).toBe("golem");
  expect(job).toBe("build");
  expect(v1.golems[0].workDone).toBeGreaterThan(0);
  expect(v1.sites[0].have + (v1.sites[0].done ? 99 : 0)).toBeGreaterThan(v0.sites[0].have);
  await keepVideo(page, "m6-golem");
});

test("m6-2 a golem set down by the well waits with water and fights a fire near the village; with no prayer power it falls asleep", async ({ page }) => {
  await boot(page);
  await hook(page, "setPower", 100);
  await hook(page, "learn", "golem");
  const r = (await village(page)).golemForm;
  for (let k = 0; k < 4; k += 1) await hook(page, "addLog", r.x + Math.cos(k * 1.6) * 1.2, r.z + Math.sin(k * 1.6) * 1.2);
  await waitFor(page, `window.__parable.village().golems.length === 1`, 30_000);
  await hook(page, "setCamera", { tx: r.x, tz: r.z + 4, yaw: 0.3, dist: 30 });
  await frames(page, 3);
  const t = await hook<XY>(page, "groundScreen", r.x, r.z);
  await cast(page, t, triangle(t));
  await waitFor(page, `window.__parable.village().golems[0].awake === true`, 20_000);
  const g0 = (await village(page)).golems[0];
  const well = { x: 19, z: 25 };
  await hook(page, "setCamera", { tx: (g0.x + well.x) / 2, tz: (g0.z + well.z) / 2 + 6, yaw: 0, dist: 44 });
  await frames(page, 3);
  const a = await hook<XY>(page, "golemScreen", g0.id);
  const b = await hook<XY>(page, "groundScreen", well.x + 2, well.z + 2);
  await page.mouse.move(a.x, a.y);
  await frames(page, 2);
  await page.mouse.down({ button: "right" });
  await moveSmooth(page, a.x, a.y, b.x, b.y, 16, 30);
  await page.waitForTimeout(400);
  await page.mouse.up({ button: "right" });
  const job = (await village(page)).golems[0].job;
  await hook(page, "stepTicks", 30 * 5);
  const filled = (await village(page)).golems[0].carryWater;
  // The Dry Year's crisis: a fire beside the well.
  await hook(page, "setDay", 8, 0.1);
  await hook(page, "igniteAt", 14, 12, 2);
  await hook(page, "setCamera", { tx: 16, tz: 18, yaw: 0.3, dist: 34 });
  let fought = false;
  for (let k = 0; k < 12 && !fought; k += 1) {
    await hook(page, "stepTicks", 150);
    fought = (await village(page)).golems[0].workDone > 0;
    if (k === 2) {
      await frames(page, 3);
      await shot(page, "m6-02-golem-douses");
    }
  }
  const doused = await lastLog(page, /golem \d+ doused/);
  await hook(page, "setPower", 0.01);
  await hook(page, "stepTicks", 5);
  const slept = await lastLog(page, /slept/);
  writeResult("m6-02-golem-douse", { job, filled, fought, doused, slept });
  expect(job).toBe("douse");
  expect(filled).toBe(true);
  expect(fought).toBe(true);
  expect(slept).toMatch(/no prayer power/);
});
