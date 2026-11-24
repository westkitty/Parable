// M3 — the Dry Year: drought that escalates into a fire crisis, a shrine that teaches Rain, a painted
// wall that teaches Sanctuary, and belief that remembers why.
import { test } from "@playwright/test";
import { boot, expect, frames, hook, keepVideo, moveSmooth, ringPts, ritual, shot, state, useEvidence, waitFor, wavePts, writeResult, zigzagPts, type P } from "./helpers";

test.beforeEach(() => useEvidence("m3"));

const village = (page: P) => hook<P>(page, "village");

test("m3-1 the drought builds day by day and lightning on day 5 starts a wildfire in the grove", async ({ page }) => {
  await boot(page);
  const dryness: { day: number; dryness: number }[] = [];
  for (const day of [1, 3, 5, 7, 9]) {
    await hook(page, "setDay", day, 0.1);
    await hook(page, "stepTicks", 1);
    dryness.push({ day, dryness: (await village(page)).dryness });
  }
  await hook(page, "setDay", 1, 0.1);
  await hook(page, "stepTicks", 1);
  await hook(page, "setCamera", { tx: 10, tz: 0, yaw: 0.6, dist: 70 });
  await frames(page, 4);
  await shot(page, "m3-01-day1-green");
  await hook(page, "setDay", 5, 0.29);
  await hook(page, "stepTicks", 1);
  await frames(page, 4);
  await shot(page, "m3-01-day5-parched");
  const pre = await village(page);
  await hook(page, "stepTicks", 30);
  const st = await state(page);
  const lightning = st.log.find((l: string) => /lightning at/.test(l));
  await hook(page, "setCamera", { tx: -12, tz: -24, yaw: 0.6, dist: 44 });
  await frames(page, 2);
  await hook(page, "stepTicks", 260);
  await frames(page, 3);
  await shot(page, "m3-01-wildfire-spreads");
  const spread = await state(page);
  const v = await village(page);
  writeResult("m3-01-drought-lightning", { dryness, lightningDoneBefore: pre.lightningDone, lightning, burningAfter30: st.burning, burningAfter290: spread.burning, scorched: spread.scorched, wind: v.wind });
  for (let i = 1; i < dryness.length; i += 1) expect(dryness[i].dryness).toBeGreaterThan(dryness[i - 1].dryness);
  expect(dryness[4].dryness).toBeGreaterThan(0.6);
  expect(lightning).toBeTruthy();
  expect(st.burning).toBeGreaterThan(0);
  expect(spread.burning + spread.scorched).toBeGreaterThan(st.burning);
});

async function carry(page: P, id: number, x: number, z: number): Promise<P> {
  const it0 = (await state(page)).items.find((i: P) => i.id === id);
  await hook(page, "setCamera", { tx: (it0.p[0] + x) / 2, tz: (it0.p[2] + z) / 2 + 8, yaw: 0, dist: 58 });
  await frames(page, 3);
  const a = await hook<{ x: number; y: number }>(page, "itemScreen", id);
  const b = await hook<{ x: number; y: number }>(page, "groundScreen", x, z);
  await page.mouse.move(a.x, a.y);
  await frames(page, 2);
  await page.mouse.down({ button: "right" });
  const held = (await state(page)).held;
  await moveSmooth(page, a.x, a.y, b.x, b.y, 14, 20);
  await page.waitForTimeout(350);
  await page.mouse.up({ button: "right" });
  const rel = (await state(page)).lastRelease;
  await hook(page, "stepTicks", 30);
  const it = (await state(page)).items.find((i: P) => i.id === id);
  return { held, gentle: rel?.gentle, at: it.p, state: it.state };
}

test("m3-2 the shrine: the hand carries the bell stone to the altar, the Rain glyph is traced beside it, and rain puts out the fire", async ({ page }) => {
  await boot(page);
  await hook(page, "setSettlerAi", false);
  const id = await hook<number>(page, "itemOfKind", "bellstone");
  const hops: P[] = [];
  for (const [x, z] of [
    [-28, 16],
    [-38, -12],
    [-46, -40],
    [-47.2, -47.2],
  ]) {
    const h = await carry(page, id, x, z);
    hops.push(h);
    if (h.state === "stacked") break;
  }
  await waitFor(page, `window.__parable.village().shrine.awakened === true`, 30_000);
  await hook(page, "setCamera", { tx: -48, tz: -40, yaw: 0, dist: 22 });
  await frames(page, 6);
  await shot(page, "m3-02-shrine-awake");
  // Before learning: the Rain glyph fizzles away from the shrine.
  // Trace spiral -> wave beside the shrine: the god learns Rain and the cloud forms in the hand.
  const sp = await hook<{ x: number; y: number }>(page, "shrineScreen");
  await ritual(page, sp.x + 160, sp.y + 40, wavePts(sp.x + 40, sp.y - 20, 240, 80, 5, 12));
  await waitFor(page, `window.__parable.village().heldCloud !== null`, 20_000);
  const learned = await village(page);
  // Light a fire near the shrine meadow and carry the rain over it.
  await hook(page, "setDay", 6, 0.5);
  await hook(page, "igniteAt", -36, -40, 3);
  await hook(page, "stepTicks", 60);
  const burningBefore = (await state(page)).burning;
  await hook(page, "setCamera", { tx: -38, tz: -34, yaw: 0, dist: 34 });
  await frames(page, 3);
  const f = await hook<{ x: number; y: number }>(page, "groundScreen", -36, -40);
  await page.mouse.move(f.x, f.y);
  await frames(page, 4);
  await shot(page, "m3-02-rain-cloud-in-hand");
  await page.mouse.click(f.x, f.y, { button: "left" });
  const dropped = await village(page);
  await hook(page, "stepTicks", 120);
  await frames(page, 4);
  await shot(page, "m3-02-rain-on-fire");
  const after = await state(page);
  writeResult("m3-02-shrine-rain", { hops, awakened: learned.shrine, learnedAfterTrace: learned.learned, powerAfterRain: learned.power, burningBefore, burningAfterRain: after.burning, cloud: dropped.clouds, log: after.log.slice(-12) });
  expect(learned.learned).toContain("rain");
  expect(dropped.clouds.length).toBe(1);
  expect(dropped.clouds[0].held).toBe(false);
  expect(after.burning).toBeLessThan(burningBefore);
  await keepVideo(page, "m3-shrine-rain");
});

test("m3-3 the painted wall: believing villagers paint it, the god studies it, and Sanctuary shields a house from fire", async ({ page }) => {
  await boot(page);
  // The villagers paint as they pray; let the days run (bounded at 4 days).
  let v = await village(page);
  let days = 0;
  while (v.mural.progress < 1 && days < 8) {
    await hook(page, "stepTicks", 900);
    days += 0.5;
    v = await village(page);
  }
  await hook(page, "setCamera", { tx: 3, tz: 22, yaw: 0.9, dist: 16 });
  await frames(page, 4);
  await shot(page, "m3-03-mural-painted");
  // Hold the empty hand over the mural to study it.
  const m = await hook<{ x: number; y: number }>(page, "muralScreen");
  await page.mouse.move(m.x, m.y);
  await waitFor(page, `window.__parable.village().learned.includes("sanctuary")`, 60_000);
  const learned = await village(page);
  // A wildfire comes at house 2; raise Sanctuary over it first.
  await hook(page, "setPower", 100);
  await hook(page, "setDay", 8, 0.2);
  await hook(page, "setCamera", { tx: 5, tz: 30, yaw: 0.6, dist: 36 });
  await frames(page, 3);
  const h = await hook<{ x: number; y: number }>(page, "groundScreen", 5, 27);
  await ritual(page, h.x, h.y, ringPts(h.x, h.y, 90));
  await waitFor(page, `window.__parable.village().sanctuaries.length > 0`, 20_000);
  const sanct = (await village(page)).sanctuaries[0];
  await hook(page, "igniteAt", 5, 40, 3);
  await hook(page, "igniteAt", -6, 27, 3);
  await hook(page, "stepTicks", 200);
  await frames(page, 4);
  await shot(page, "m3-03-sanctuary-holds-the-fire");
  await hook(page, "stepTicks", 400);
  const after = await village(page);
  const ss: P[] = await hook(page, "settlers");
  const causes = ss.flatMap((s) => s.belief.causes.map((c: P) => `${s.name}: ${c.text}`));
  writeResult("m3-03-mural-sanctuary", { daysToPaint: days, mural: v.mural, learned: learned.learned, sanctuary: sanct, houses: after.houses, causes });
  expect(v.mural.progress).toBeGreaterThanOrEqual(1);
  expect(learned.learned).toContain("sanctuary");
  expect(Math.hypot(sanct.x - 5, sanct.z - 27)).toBeLessThan(6);
  expect(after.houses.find((x: P) => x.id === 2).state).toBe("standing");
  expect(causes.some((c) => /sanctuary/.test(c))).toBe(true);
});

test("m3-4 belief: miracles cost prayer power; a weak god's glyph fizzles; causes are readable on each villager", async ({ page }) => {
  await boot(page);
  await hook(page, "setCamera", { tx: 21, tz: 17, yaw: 0.6, dist: 40 });
  await frames(page, 3);
  await hook(page, "setPower", 10);
  const cx = 900;
  const cy = 480;
  await ritual(page, cx, cy, zigzagPts(cx - 40, cy - 120, 80, 240, 5, 12));
  await frames(page, 6);
  const weak = await state(page);
  const fizzled = weak.log.some((l: string) => /fizzle: fireball needs/.test(l));
  await hook(page, "setPower", 60);
  await page.waitForTimeout(800);
  await ritual(page, cx, cy, zigzagPts(cx - 40, cy - 120, 80, 240, 5, 12));
  await waitFor(page, `window.__parable.state().items.some(i => i.kind === "fireball" && i.state === "held")`, 20_000);
  const strong = await village(page);
  await page.keyboard.press("Escape");
  const desc: P[] = await hook(page, "describe");
  const ss: P[] = await hook(page, "settlers");
  writeResult("m3-04-belief-power", { fizzled, heldAfterWeak: weak.held, powerAfterCast: strong.power, beliefs: ss.map((s) => ({ name: s.name, mood: s.mood, belief: s.belief })), details: desc.map((d) => d.detail) });
  expect(fizzled).toBe(true);
  expect(weak.held).toBeNull();
  expect(strong.power).toBeLessThan(50);
  for (const s of ss) expect(typeof s.mood.score).toBe("number");
  expect(ss.some((s) => (s.belief.causes ?? []).length > 0)).toBe(true);
});
