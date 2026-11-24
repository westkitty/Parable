// M2 — the village: twelve settlers with identities, needs, skills and relationships; work that moves
// real resources (wood -> building, wheat -> granary); injuries that change what a villager can do.
import { test } from "@playwright/test";
import { boot, expect, frames, hook, keepVideo, moveSmooth, playback, shot, state, useEvidence, writeResult, type Ev, type P } from "./helpers";

test.beforeEach(() => useEvidence("m2"));

const village = (page: P) => hook<P>(page, "village");
const settlers = (page: P) => hook<P[]>(page, "settlers");

test("m2-1 twelve villagers with names, trades, homes and family; hover one to read who they are", async ({ page }) => {
  await boot(page);
  await hook(page, "setCamera", { tx: 21, tz: 19, yaw: 0.6, dist: 58 });
  await frames(page, 4);
  await shot(page, "m2-01-village-overview");
  const ss = await settlers(page);
  const desc = await hook<P[]>(page, "describe");
  // Hover the empty hand over a villager until the bubble shows (they keep moving; retarget each try).
  await hook(page, "setCamera", { tx: 21, tz: 19, yaw: 0.6, dist: 24 });
  await frames(page, 3);
  const target = ss.find((s: P) => s.job === "farmer") ?? ss[0];
  let bubble: string | null = null;
  let detail = "";
  for (let i = 0; i < 30 && !bubble; i += 1) {
    const p = await hook<{ x: number; y: number }>(page, "settlerScreenOf", target.id);
    await page.mouse.move(p.x, p.y);
    await page.waitForTimeout(250);
    const st = await state(page);
    if (st.hover?.id === target.id) bubble = st.bubble;
    detail = (await village(page)).bubbleDetail;
  }
  await shot(page, "m2-01-inspect-villager");
  const jobs: Record<string, number> = {};
  for (const s of ss) jobs[s.job] = (jobs[s.job] ?? 0) + 1;
  writeResult("m2-01-identities", { count: ss.length, names: ss.map((s: P) => s.name), jobs, target: target.name, bubble, detail, describe: desc.slice(0, 12) });
  expect(ss.length).toBe(12);
  expect(new Set(ss.map((s: P) => s.name)).size).toBe(12);
  expect(Object.keys(jobs).sort()).toEqual(["builder", "carer", "farmer", "hauler", "water", "woodcutter"]);
  for (const n of Object.values(jobs)) expect(n).toBe(2);
  expect(bubble ?? "").toContain(target.name);
  expect(bubble ?? "").toContain("farmer");
  expect(detail).toMatch(/lives with/);
  expect(detail).toMatch(/belief \d+/);
});

test("m2-2 a working day: woodcutters fell trees, haulers move wood, builders raise the new house, farmers bring in wheat", async ({ page }) => {
  await boot(page);
  await hook(page, "setCamera", { tx: 20, tz: 26, yaw: 0.6, dist: 40 });
  const v0 = await village(page);
  const seen = new Set<string>();
  const lines: string[] = [];
  let lastLen = 0;
  for (let k = 0; k < 9; k += 1) {
    await hook(page, "stepTicks", 200);
    for (const s of await settlers(page)) seen.add(`${s.job}:${s.state}`);
    const log: string[] = (await state(page)).log;
    lines.push(...log.slice(Math.max(0, log.length - (log.length - lastLen))));
    lastLen = log.length;
    if (k === 4) {
      await frames(page, 3);
      await shot(page, "m2-02-working-midday");
    }
  }
  const v1 = await village(page);
  await frames(page, 3);
  await shot(page, "m2-02-site-after-a-day");
  const all: string[] = (await state(page)).log;
  const count = (re: RegExp) => all.filter((l) => re.test(l)).length;
  const result = {
    ticks: 1800,
    before: { felled: v0.felled, woodpile: v0.woodpile, site: v0.sites[0], food: v0.food },
    after: { felled: v1.felled, woodpile: v1.woodpile, site: v1.sites[0], food: v1.food },
    felledLines: count(/felled a tree/),
    deliveredWood: count(/delivered wood/),
    deliveredFood: count(/delivered (food|wheat)/),
    harvests: count(/harvest/),
    jobStatesSeen: [...seen].sort(),
  };
  writeResult("m2-02-work-loop", result);
  expect(v1.felled).toBeGreaterThan(v0.felled);
  expect(v1.sites[0].have + v1.woodpile).toBeGreaterThan(v0.sites[0].have + v0.woodpile);
  expect(v1.sites[0].work).toBeGreaterThan(0);
  expect(result.deliveredWood).toBeGreaterThan(0);
  for (const st of ["woodcutter:chopping", "builder:building", "farmer:farming"]) expect([...seen]).toContain(st);
});

test("m2-3 the god helps: a log the hand sets on the building site becomes part of the house", async ({ page }) => {
  await boot(page);
  await hook(page, "setSettlerAi", false);
  await hook(page, "setCamera", { tx: 21, tz: 30, yaw: 0.6, dist: 26 });
  await frames(page, 3);
  const st0 = await state(page);
  const id = st0.items.find((i: P) => i.kind === "log" && i.state === "loose").id;
  // Start the log on the meadow beside the site, then carry it onto the site with the hand.
  await hook(page, "placeItem", id, 14, 36);
  await hook(page, "stepTicks", 8);
  const before = (await village(page)).sites[0];
  const a = await hook<{ x: number; y: number }>(page, "itemScreen", id);
  const b = await hook<{ x: number; y: number }>(page, "groundScreen", 21, 33);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down({ button: "right" });
  await moveSmooth(page, a.x, a.y, b.x, b.y, 8, 20);
  await page.waitForTimeout(300);
  await page.mouse.up({ button: "right" });
  const rel = await state(page);
  await hook(page, "stepTicks", 30);
  const after = (await village(page)).sites[0];
  const item = (await state(page)).items.find((i: P) => i.id === id);
  await frames(page, 3);
  await shot(page, "m2-03-log-on-site");
  // Let the builders finish it (bounded: 3 simulated days).
  await hook(page, "setSettlerAi", true);
  let done = after;
  for (let k = 0; k < 27 && !done.done; k += 1) {
    await hook(page, "stepTicks", 200);
    done = (await village(page)).sites[0];
  }
  await hook(page, "setCamera", { tx: 21, tz: 33, yaw: 0.6, dist: 24 });
  await frames(page, 4);
  await shot(page, "m2-03-new-house-finished");
  const desc: P[] = await hook(page, "describe");
  writeResult("m2-03-god-builds", { release: rel.lastRelease, before, after, itemState: item?.state, finished: done, ticks: (await state(page)).tick, describe: desc.map((d) => d.detail) });
  expect(rel.lastRelease.gentle).toBe(true);
  expect(after.have).toBe(before.have + 1);
  expect(item?.state).toBe("gone");
  expect(done.done).toBe(true);
});

test("m2-4 injury: a villager thrown hard is hurt, limps with a crutch, resents it, and a carer tends them", async ({ page }) => {
  await boot(page);
  await hook(page, "setSettlerAi", false);
  const ss = await settlers(page);
  const victim = ss.find((s: P) => s.job === "hauler")!;
  await hook(page, "placeSettler", 24, 42, victim.id);
  await hook(page, "setCamera", { tx: 24, tz: 36, yaw: 0.6, dist: 34 });
  await hook(page, "stepTicks", 4);
  await frames(page, 3);
  const p = await hook<{ x: number; y: number }>(page, "settlerScreenOf", victim.id);
  // A hard recorded flick toward open meadow (~16 m/s: hard enough to hurt, not to kill).
  const evs: Ev[] = [
    { type: "move", x: p.x, y: p.y },
    { type: "down", x: p.x, y: p.y, button: "right" },
  ];
  for (let s = 1; s <= 8; s += 1) evs.push({ type: "move", x: p.x + 7.5 * s, y: p.y - 4.3 * s, dt: s === 1 ? 140 : 16 });
  evs.push({ type: "up", x: p.x + 60, y: p.y - 34, button: "right", dt: 8 });
  await playback(page, evs);
  const rel = await state(page);
  // Villagers (and a thrown villager's flight) only move while their AI runs.
  await hook(page, "setSettlerAi", true);
  await hook(page, "stepTicks", 80);
  const hurt = (await settlers(page)).find((s: P) => s.id === victim.id)!;
  const detail = (await hook<P[]>(page, "describe")).find((d: P) => d.id === victim.id)!.detail;
  await hook(page, "setCamera", { tx: hurt.x, tz: hurt.z + 6, yaw: 0.6, dist: 16 });
  await frames(page, 4);
  await shot(page, "m2-04-hurt-with-crutch");
  // Carers look after the worst hurt; tending speeds healing.
  let tended = false;
  let carerSeen: string | null = null;
  for (let k = 0; k < 40 && !tended; k += 1) {
    await hook(page, "stepTicks", 40);
    const now = await settlers(page);
    const c = now.find((s: P) => s.job === "carer" && s.state === "tending");
    if (c) carerSeen = c.name;
    const vic = now.find((s: P) => s.id === victim.id)!;
    tended = vic.memoryKinds.includes("was_tended");
    if (c && !tended) {
      await hook(page, "setCamera", { tx: c.x, tz: c.z + 6, yaw: 0.6, dist: 16 });
      await frames(page, 2);
    }
  }
  await frames(page, 3);
  await shot(page, "m2-04-carer-tending");
  const later = (await settlers(page)).find((s: P) => s.id === victim.id)!;
  writeResult("m2-04-injury", { release: rel.lastRelease, injuryAfterLanding: hurt.injury, detail, carerSeen, tended, injuryLater: later.injury, stateLater: later.state, mood: later.mood });
  expect(rel.lastRelease.gentle).toBe(false);
  expect(hurt.injury).toBeGreaterThan(0.25);
  expect(detail).toMatch(/hurt/);
  expect(`${hurt.mood.top} ${hurt.mood.recent}`).toMatch(/threw/);
  expect(carerSeen).not.toBeNull();
  expect(tended).toBe(true);
  await keepVideo(page, "m2-injury-and-care");
});
