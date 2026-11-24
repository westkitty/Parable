// M4 — the first playable loop: the Dry Year runs to its end, the village survives or falls, the end card
// says why, the temple keeps the record, and a new year begins. Save/load works on the full village.
import { test } from "@playwright/test";
import { boot, expect, frames, hook, keepVideo, shot, state, useEvidence, waitFor, writeResult, type P } from "./helpers";

test.beforeEach(() => useEvidence("m4"));

const village = (page: P) => hook<P>(page, "village");

async function enterTemple(page: P): Promise<void> {
  const door = await hook<{ x: number; y: number }>(page, "templeDoorScreen");
  await page.mouse.move(door.x, door.y);
  await page.mouse.click(door.x, door.y, { button: "left" });
  await waitFor(page, `window.__parable.state().templeMode === "chamber"`, 60_000);
  await frames(page, 4);
}

async function touch(page: P, tablet: string): Promise<void> {
  const t = await hook<{ x: number; y: number }>(page, "tabletScreen", tablet);
  await page.mouse.move(t.x, t.y);
  await frames(page, 3);
  await page.mouse.click(t.x, t.y, { button: "left" });
}

test("m4-1 a whole Dry Year, unattended: the year ends, the end card tells what happened, the record is kept, a new year begins", async ({ page }) => {
  await boot(page);
  await hook(page, "clearRecords");
  await hook(page, "setCamera", { tx: 21, tz: 17, yaw: 0.6, dist: 70 });
  const days: P[] = [];
  for (let k = 0; k < 19; k += 1) {
    await hook(page, "stepTicks", 1000);
    const v = await village(page);
    days.push({ tick: (await state(page)).tick, day: v.day, dryness: +v.dryness.toFixed(3), alive: v.alive, food: v.food, houses: v.houses.map((h: P) => h.state[0]).join(""), belief: v.belief, power: Math.floor(v.power) });
    if (k === 9) {
      await frames(page, 3);
      await shot(page, "m4-01-midyear");
    }
    if (v.outcome?.ended) break;
  }
  await waitFor(page, `window.__parable.village().endCardVisible === true`, 30_000);
  await frames(page, 3);
  await shot(page, "m4-01-end-card");
  const end = await village(page);
  const records = await hook<P[]>(page, "records");
  const cardText = await page.locator("#endcard").innerText();
  // A new year.
  await page.locator("#restart").click();
  await waitFor(page, `window.__parable.village().endCardVisible === false`, 30_000);
  const fresh = await village(page);
  await frames(page, 3);
  await shot(page, "m4-01-new-year");
  writeResult("m4-01-dry-year", { days, outcome: end.outcome, cardText, records, fresh: { day: fresh.day, alive: fresh.alive, houses: fresh.houses, outcome: fresh.outcome } });
  expect(end.outcome.ended).toBe(true);
  expect(end.outcome.day).toBeGreaterThanOrEqual(10);
  expect(cardText).toContain(end.outcome.title);
  expect(records.length).toBe(1);
  expect(records[0].alive).toBe(end.outcome.alive);
  expect(fresh.day).toBe(1);
  expect(fresh.alive).toBe(12);
  expect(fresh.outcome).toBeNull();
  await keepVideo(page, "m4-dry-year-end");
});

test("m4-2 losing: when the village falls the card says so, and the temple's records wall carves both years", async ({ page }) => {
  await boot(page);
  await hook(page, "clearRecords");
  await hook(page, "endOutcome", true);
  await waitFor(page, `window.__parable.village().endCardVisible === true`, 30_000);
  await page.locator("#restart").click();
  // Burn the village down on a tinder-dry day and let the year end there (forced end: a fast check of the losing branch).
  await hook(page, "setDay", 8, 0.1);
  for (const [x, z] of [
    [14, 12],
    [29, 3],
    [5, 27],
    [31, 23],
  ])
    await hook(page, "igniteAt", x, z, 4);
  await hook(page, "stepTicks", 900);
  await hook(page, "endOutcome", true);
  await waitFor(page, `window.__parable.village().endCardVisible === true`, 30_000);
  const lost = await village(page);
  await hook(page, "setCamera", { tx: 21, tz: 17, yaw: 0.6, dist: 60 });
  await frames(page, 3);
  await shot(page, "m4-02-village-lost");
  await page.locator("#restart").click();
  await hook(page, "learn", "rain");
  await enterTemple(page);
  await shot(page, "m4-02-temple-chamber");
  const lit = { fireball: await hook(page, "templeLit", "fireball"), rain: await hook(page, "templeLit", "rain"), sanctuary: await hook(page, "templeLit", "sanctuary") };
  await touch(page, "records");
  await page.waitForTimeout(1500);
  await frames(page, 4);
  const open = await hook<boolean>(page, "recordsOpen");
  await shot(page, "m4-02-temple-records");
  const records = await hook<P[]>(page, "records");
  writeResult("m4-02-lost-and-records", { lost: lost.outcome, houses: lost.houses, lit, recordsOpen: open, records });
  expect(lost.outcome.survived).toBe(false);
  expect(lost.outcome.title).toMatch(/broke|silent/);
  expect(records.length).toBe(2);
  expect(records[0].survived).toBe(true);
  expect(records[1].survived).toBe(false);
  expect(lit).toEqual({ fireball: true, rain: true, sanctuary: false });
  expect(open).toBe(true);
});

test("m4-3 save and load the whole village at the temple: twelve villagers, houses, fire, belief and the year restore exactly", async ({ page }) => {
  await boot(page);
  await hook(page, "stepTicks", 1200);
  await hook(page, "igniteAt", -12, -29, 3);
  await hook(page, "stepTicks", 60);
  await enterTemple(page);
  await touch(page, "save");
  await waitFor(page, `window.__parable.state().templeMode === "world"`, 60_000);
  const savedLine = (await state(page)).log.filter((l: string) => /saved /.test(l)).pop()!;
  const savedHash = savedLine.split("saved ")[1];
  const before = await village(page);
  await hook(page, "stepTicks", 600);
  const changed = await hook<string>(page, "hash");
  await enterTemple(page);
  await touch(page, "load");
  await waitFor(page, `window.__parable.state().templeMode === "world"`, 60_000);
  // The hash at the moment of loading (the world keeps living during the fade back out).
  const loadedLine = (await state(page)).log.filter((l: string) => /loaded /.test(l)).pop()!;
  const loadedHash = loadedLine.split("loaded ")[1];
  const after = await village(page);
  await page.reload();
  await page.waitForFunction(() => (window as P).__parable?.ready === true, null, { timeout: 120_000 });
  await enterTemple(page);
  await touch(page, "load");
  await waitFor(page, `window.__parable.state().templeMode === "world"`, 60_000);
  const reloadedHash = (await state(page)).log.filter((l: string) => /loaded /.test(l)).pop()!.split("loaded ")[1];
  writeResult("m4-03-village-save", { savedHash, changed, loadedHash, reloadedHash, before: { day: before.day, alive: before.alive, food: before.food, belief: before.belief }, after: { day: after.day, alive: after.alive, food: after.food, belief: after.belief } });
  expect(changed).not.toBe(savedHash);
  expect(loadedHash).toBe(savedHash);
  expect(reloadedHash).toBe(savedHash);
  expect(after.day).toBe(before.day);
  expect(after.belief).toBe(before.belief);
});

test("m4-perf (software-rendered, NOT hardware): 20 s of the village at the default view", async ({ page }) => {
  await page.goto("/?test=1&seed=7");
  await page.waitForFunction(() => (window as P).__parable?.ready === true, null, { timeout: 120_000 });
  await page.mouse.move(720, 450);
  await page.waitForTimeout(3000);
  await hook(page, "resetPerf");
  await page.waitForTimeout(20_000);
  const perf = await hook<P>(page, "perf");
  const heap = await page.evaluate(() => (performance as P).memory?.usedJSHeapSize ?? null);
  writeResult("m4-perf-software", { note: "Headless Chrome + SwiftShader software WebGL on the build box, full village. Not hardware evidence.", perf, heapMB: heap ? heap / 1048576 : null });
  expect(perf.interval.n).toBeGreaterThan(5);
  expect(perf.simTickMs).toBeLessThan(10);
});
