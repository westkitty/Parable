import { test } from "@playwright/test";
import { boot, expect, frames, hook, moveSmooth, playback, pts2moves, shot, spearman, spiralPts, state, waitFor, writeResult, zigzagPts, type Ev, type P } from "./helpers";

test.describe.configure({ mode: "serial" });

test("1 camera: zoom from settlement to individual scale, pan, orbit, reset", async ({ page }) => {
  await boot(page);
  await page.mouse.move(720, 450);
  // Max zoom-out.
  for (let i = 0; i < 20; i += 1) await page.mouse.wheel(0, 400);
  await waitFor(page, "window.__parable.state().camera.dist > 94.5");
  await frames(page, 12);
  const far = await state(page);
  await shot(page, "01-camera-far");
  // Mid.
  await hook(page, "setCamera", { tx: 10, tz: 10, yaw: -0.96, dist: 30 });
  await frames(page, 3);
  const mid = await state(page);
  await shot(page, "01-camera-mid");
  // Max zoom-in on Ilse with the wheel, keeping the cursor on her.
  await hook(page, "setSettlerAi", false);
  for (let i = 0; i < 30; i += 1) {
    const s = await hook<{ x: number; y: number }>(page, "settlerScreen");
    await page.mouse.move(s.x, s.y);
    await page.mouse.wheel(0, -300);
    await frames(page, 1);
    if ((await state(page)).camera.dist <= 4.01) break;
  }
  await waitFor(page, "window.__parable.state().camera.dist <= 4.05");
  await frames(page, 12);
  const s = await hook<{ x: number; y: number }>(page, "settlerScreen");
  await page.mouse.move(s.x + 260, s.y + 120);
  await frames(page, 3);
  const near = await state(page);
  await shot(page, "01-camera-near-ilse");
  const ratio = far.camera.height / near.camera.height;
  // Pan: left-drag the land.
  await hook(page, "setCamera", { tx: 6, tz: 2, yaw: -0.96, dist: 62 });
  await frames(page, 2);
  const before = (await state(page)).camera;
  await page.mouse.move(700, 500);
  await page.mouse.down({ button: "left" });
  await moveSmooth(page, 700, 500, 450, 380, 12, 16);
  await page.mouse.up({ button: "left" });
  await frames(page, 2);
  const afterPan = (await state(page)).camera;
  // Orbit: middle-drag.
  await page.mouse.down({ button: "middle" });
  await moveSmooth(page, 450, 380, 650, 380, 10, 16);
  await page.mouse.up({ button: "middle" });
  const afterOrbit = (await state(page)).camera;
  await page.keyboard.press("r");
  await frames(page, 2);
  const afterReset = (await state(page)).camera;
  const result = {
    farHeight: far.camera.height,
    midHeight: mid.camera.height,
    nearHeight: near.camera.height,
    heightRatio: ratio,
    nearDist: near.camera.dist,
    panMoved: Math.hypot(afterPan.tx - before.tx, afterPan.tz - before.tz),
    orbitYawChange: afterOrbit.yaw - afterPan.yaw,
    resetOk: Math.abs(afterReset.dist - 62) < 0.01 && Math.abs(afterReset.yaw + 0.96) < 1e-6,
  };
  writeResult("01-camera", result);
  expect(ratio).toBeGreaterThanOrEqual(10);
  expect(result.panMoved).toBeGreaterThan(5);
  expect(Math.abs(result.orbitYawChange)).toBeGreaterThan(0.5);
  expect(result.resetOk).toBe(true);
});

test("2 grab: 20/20 first-press acquisitions from empty ground, and A->B rapid switch", async ({ page }) => {
  await boot(page);
  await hook(page, "setSettlerAi", false);
  await hook(page, "setCamera", { tx: 2, tz: -2, yaw: -0.96, dist: 34 });
  await frames(page, 3);
  const st = await state(page);
  const logs = st.items.filter((i: P) => i.kind === "log");
  const A = logs[0].id;
  const B = logs[1].id;
  let ok = 0;
  const attempts: P[] = [];
  for (let k = 0; k < 20; k += 1) {
    // Start on empty ground a few metres off, then sweep onto the log and press once.
    const ang = (k / 20) * Math.PI * 2;
    const it = (await state(page)).items.find((i: P) => i.id === A);
    const empty = await hook<{ x: number; y: number }>(page, "groundScreen", it.p[0] + Math.cos(ang) * 7, it.p[2] + Math.sin(ang) * 7);
    await page.mouse.move(empty.x, empty.y);
    await frames(page, 1);
    const target = await hook<{ x: number; y: number }>(page, "itemScreen", A);
    await moveSmooth(page, empty.x, empty.y, target.x, target.y, 4, 8);
    await page.mouse.down({ button: "right" });
    const held = (await state(page)).held;
    const got = held && held.kind === "item" && held.id === A;
    if (got) ok += 1;
    attempts.push({ k, got: !!got, held });
    await page.waitForTimeout(150);
    await page.mouse.up({ button: "right" });
    await frames(page, 2);
  }
  await shot(page, "02-grab-holding");
  // A -> B rapid switch: hover A, then jump straight to B and press.
  const a = await hook<{ x: number; y: number }>(page, "itemScreen", A);
  const b = await hook<{ x: number; y: number }>(page, "itemScreen", B);
  await page.mouse.move(a.x, a.y);
  await frames(page, 1);
  await page.mouse.move(b.x, b.y);
  await page.mouse.down({ button: "right" });
  const switched = (await state(page)).held;
  await frames(page, 4);
  await shot(page, "02-grab-switch-B");
  await page.mouse.up({ button: "right" });
  writeResult("02-grab", { acquired: ok, of: 20, switchedTo: switched, expectedB: B, attempts });
  expect(ok).toBe(20);
  expect(switched).toEqual({ kind: "item", id: B });
});

test("3 throw: distance rises with hand speed; slow release sets down within 0.5 m", async ({ page }) => {
  await boot(page);
  await hook(page, "setSettlerAi", false);
  await hook(page, "setCamera", { tx: -2, tz: 6, yaw: -0.96, dist: 48 });
  await frames(page, 3);
  const id = (await state(page)).items.find((i: P) => i.kind === "log").id;
  const rows: P[] = [];
  for (let k = 0; k < 10; k += 1) {
    await hook(page, "placeItem", id, 6, 14);
    await hook(page, "stepTicks", 10);
    await frames(page, 1);
    const p = await hook<{ x: number; y: number }>(page, "itemScreen", id);
    // Recorded flick: press on the log, hold 120 ms, then 8 moves 16 ms apart toward the open meadow.
    const step = 0.8 + k * 0.85; // pixels per 16 ms, rising each throw
    const evs: Ev[] = [
      { type: "move", x: p.x, y: p.y },
      { type: "down", x: p.x, y: p.y, button: "right" },
    ];
    for (let s = 1; s <= 8; s += 1) evs.push({ type: "move", x: p.x - step * 0.87 * s, y: p.y - step * 0.5 * s, dt: s === 1 ? 120 : 16 });
    evs.push({ type: "up", x: p.x - step * 0.87 * 8, y: p.y - step * 0.5 * 8, button: "right", dt: 8 });
    await playback(page, evs);
    await frames(page, 1);
    const rel = await state(page);
    const start = rel.items.find((i: P) => i.id === id).p;
    await hook(page, "stepTicks", 160);
    const end = (await state(page)).items.find((i: P) => i.id === id).p;
    rows.push({ k, releaseSpeed: rel.lastRelease.speed, gentle: rel.lastRelease.gentle, distance: Math.hypot(end[0] - start[0], end[2] - start[2]), start, end });
  }
  await frames(page, 2);
  await shot(page, "03-throw-landed");
  const rho = spearman(
    rows.map((r) => r.releaseSpeed),
    rows.map((r) => r.distance),
  );
  const rhoIndex = spearman(
    rows.map((r) => r.k),
    rows.map((r) => r.distance),
  );
  // Gentle: carry slowly, stop, release.
  await hook(page, "placeItem", id, 6, 14);
  await hook(page, "stepTicks", 10);
  const p = await hook<{ x: number; y: number }>(page, "itemScreen", id);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down({ button: "right" });
  await moveSmooth(page, p.x, p.y, p.x - 120, p.y - 40, 30, 30);
  await page.waitForTimeout(250);
  await page.mouse.up({ button: "right" });
  const g = await state(page);
  await hook(page, "stepTicks", 80);
  const after = (await state(page)).items.find((i: P) => i.id === id).p;
  const rp = g.lastReleasePoint;
  const gentleDist = Math.hypot(after[0] - rp[0], after[2] - rp[2]);
  await shot(page, "03-gentle-setdown");
  writeResult("03-throw", { rows, spearmanSpeedVsDistance: rho, spearmanStepVsDistance: rhoIndex, gentle: { release: g.lastRelease, releasePoint: rp, rest: after, distance: gentleDist } });
  expect(rows.every((r) => !r.gentle)).toBe(true);
  expect(rho).toBeGreaterThanOrEqual(0.9);
  expect(g.lastRelease.gentle).toBe(true);
  expect(gentleDist).toBeLessThanOrEqual(0.5);
});

test("4 haul: a log dropped on the meadow is hauled and the woodpile grows by one", async ({ page }) => {
  await boot(page);
  await hook(page, "restart");
  await hook(page, "setSettlerAi", false);
  await hook(page, "setCamera", { tx: 12, tz: 12, yaw: -0.96, dist: 30 });
  await frames(page, 3);
  const st0 = await state(page);
  const id = st0.items.find((i: P) => i.kind === "log").id;
  // Pick the log up with the hand and set it down gently on the meadow near the cottage.
  await hook(page, "placeItem", id, 8, 6);
  await hook(page, "stepTicks", 5);
  const a = await hook<{ x: number; y: number }>(page, "itemScreen", id);
  const b = await hook<{ x: number; y: number }>(page, "groundScreen", 9, 11);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down({ button: "right" });
  await moveSmooth(page, a.x, a.y, b.x, b.y, 8, 20);
  await page.waitForTimeout(300);
  await page.mouse.up({ button: "right" });
  const dropped = await state(page);
  expect(dropped.lastRelease.gentle).toBe(true);
  await shot(page, "04-haul-log-dropped");
  const startTick = dropped.tick;
  const woodBefore = dropped.woodpile;
  const s0 = dropped.settler;
  const log = dropped.items.find((i: P) => i.id === id).p;
  await hook(page, "setSettlerAi", true);
  // Real-time: Ilse must start moving within 2 s of sim time (40 ticks).
  await waitFor(page, `window.__parable.state().settler.state !== "idle"`);
  const moving = await state(page);
  const startDelayTicks = moving.tick - startTick;
  await waitFor(page, `window.__parable.state().settler.state === "carrying"`, 120_000);
  await frames(page, 2);
  await shot(page, "04-haul-carrying");
  // Bound: (path length / walk speed) + 5 s.
  const wp = { x: 20.5, z: 16.5 };
  const pathLen = Math.hypot(log[0] - s0.x, log[2] - s0.z) + Math.hypot(wp.x - log[0], wp.z - log[2]);
  const boundTicks = Math.ceil((pathLen * 1.35 / (1.7 * 0.85) + 5) * 20);
  for (let i = 0; i < 60; i += 1) {
    const s = await state(page);
    if (s.woodpile > woodBefore || s.tick - startTick > boundTicks) break;
    await hook(page, "stepTicks", 10);
  }
  const done = await state(page);
  await frames(page, 3);
  await shot(page, "04-haul-stacked");
  const item = done.items.find((i: P) => i.id === id);
  writeResult("04-haul", { startDelayTicks, startDelaySeconds: startDelayTicks / 20, woodBefore, woodAfter: done.woodpile, ticksToStack: done.tick - startTick, boundTicks, pathLen, itemState: item.state });
  expect(startDelayTicks).toBeLessThanOrEqual(40);
  expect(done.woodpile).toBe(woodBefore + 1);
  expect(item.state).toBe("stacked");
  expect(done.tick - startTick).toBeLessThanOrEqual(boundTicks);
});

test("5+6 miracle and reaction: spiral -> zigzag summons a held Fireball; the grove burns; Ilse flees and remembers", async ({ page }) => {
  await boot(page);
  await hook(page, "restart");
  await hook(page, "setSettlerAi", false);
  await hook(page, "placeSettler", 2, -12); // ~12 m from the grove's edge, in sight of it
  await hook(page, "setCamera", { tx: -2, tz: -14, yaw: -0.96, dist: 44 });
  await frames(page, 3);
  // Draw a clockwise spiral with the empty hand (no button), pause, then a vertical zigzag.
  const cx = 980;
  const cy = 520;
  await page.mouse.move(cx, cy);
  await playback(page, pts2moves(spiralPts(cx, cy, 20, 110, 2.3, 120)));
  await waitFor(page, "window.__parable.state().armed === true", 20_000);
  const armed = await state(page);
  await shot(page, "05-ritual-armed-spiral");
  // The full-res screenshot costs several real seconds under SwiftShader, longer than the
  // 5.6 s arm window. Re-draw the spiral so the spiral -> zigzag sequence is uninterrupted.
  await frames(page, 8);
  await page.mouse.move(cx, cy);
  await playback(page, pts2moves(spiralPts(cx, cy, 20, 110, 2.3, 120)));
  await waitFor(page, "window.__parable.state().armed === true", 20_000);
  await playback(page, pts2moves(zigzagPts(cx - 40, cy - 120, 80, 240, 5, 12), 16).map((e, i) => (i === 0 ? { ...e, dt: 450 } : e)));
  await waitFor(page, `window.__parable.state().items.some(i => i.kind === "fireball" && i.state === "held")`, 20_000);
  const summoned = await state(page);
  await frames(page, 4);
  await shot(page, "05-fireball-held");
  // Throw it at the grove: move over the grove's near edge, press right, flick toward the grove centre.
  const edge = await hook<{ x: number; y: number }>(page, "groundScreen", -4, -14);
  const centre = await hook<{ x: number; y: number }>(page, "groundScreen", -8, -24);
  await page.mouse.move(edge.x, edge.y);
  await frames(page, 2);
  await hook(page, "setSettlerAi", true);
  const dx = (centre.x - edge.x) / 8;
  const dy = (centre.y - edge.y) / 8;
  const evs: Ev[] = [{ type: "down", x: edge.x, y: edge.y, button: "right" }];
  for (let s = 1; s <= 4; s += 1) evs.push({ type: "move", x: edge.x + dx * s * 0.5, y: edge.y + dy * s * 0.5, dt: s === 1 ? 100 : 16 });
  evs.push({ type: "up", x: edge.x + dx * 2, y: edge.y + dy * 2, button: "right", dt: 8 });
  await playback(page, evs);
  const thrown = await state(page);
  // Impact -> >= 3 burning cells within 2 s of sim time.
  await waitFor(page, "window.__parable.state().burning > 0 || window.__parable.state().log.some(l => /impact|quenched/.test(l))", 60_000);
  const lit = await state(page);
  const impactLine = lit.log.find((l: string) => /fireball impact/.test(l));
  const impactTick = impactLine ? Number(impactLine.split(":")[0]) : lit.tick;
  await waitFor(page, "window.__parable.state().burning >= 3", 60_000);
  const burning3 = await state(page);
  // Reaction: Ilse flees within 1 s (20 ticks) of the fire starting.
  await waitFor(page, `["flee","cower"].includes(window.__parable.state().settler.state)`, 60_000);
  const fled = await state(page);
  const fleeLine = fled.log.find((l: string) => /ilse flee/.test(l));
  const fleeTick = fleeLine ? Number(fleeLine.split(":")[0]) : fled.tick;
  await frames(page, 4);
  await shot(page, "05-grove-burning-ilse-flees");
  // Let her reach cover, then hover the empty hand over her for > 0.6 s to inspect.
  await waitFor(page, `window.__parable.state().settler.state === "cower"`, 120_000);
  let bubble: string | null = null;
  for (let i = 0; i < 20 && !bubble; i += 1) {
    const s = await hook<{ x: number; y: number }>(page, "settlerScreen");
    await page.mouse.move(s.x, s.y);
    await page.waitForTimeout(250);
    bubble = (await state(page)).bubble;
  }
  await shot(page, "06-inspect-bubble");
  const mem = (await state(page)).settler.memories;
  // Burn-out: fast-forward the sim; scorch must remain and never revert.
  await hook(page, "stepTicks", 1400);
  const out1 = await state(page);
  await hook(page, "stepTicks", 400);
  const out2 = await state(page);
  await hook(page, "setCamera", { tx: -6, tz: -20, yaw: -0.96, dist: 40 });
  await frames(page, 6);
  await shot(page, "05-scorch-after-burnout");
  const result = {
    armedAfterSpiral: armed.armed,
    gestureAfterSpiral: armed.lastGesture,
    gestureAfterZigzag: summoned.lastGesture,
    fireballHeld: summoned.held,
    throwRelease: thrown.lastRelease,
    impactLine,
    impactTick,
    ticksToThreeBurning: burning3.tick - impactTick,
    burningAt3: burning3.burning,
    fleeTick,
    ticksFireToFlee: fleeTick - impactTick,
    ilseDistanceToGroveCentreAtFlee: Math.hypot(fled.settler.x + 8, fled.settler.z + 24),
    memories: mem,
    bubble,
    afterBurnout: { burning: out1.burning, scorched: out1.scorched },
    later: { burning: out2.burning, scorched: out2.scorched },
  };
  writeResult("05-06-miracle-reaction", result);
  expect(armed.armed).toBe(true);
  expect(summoned.held?.kind).toBe("item");
  expect(burning3.tick - impactTick).toBeLessThanOrEqual(40);
  expect(fleeTick - impactTick).toBeLessThanOrEqual(20);
  expect(mem.some((m: P) => m.kind === "saw_fire" && m.causedByGod === true)).toBe(true);
  expect(bubble ?? "").toMatch(/your fire/);
  expect(out1.burning).toBe(0);
  expect(out1.scorched).toBeGreaterThan(0);
  expect(out2.scorched).toBe(out1.scorched);
});

async function enterTempleAndTouch(page: P, tablet: "save" | "load" | "restart"): Promise<string[]> {
  const door = await hook<{ x: number; y: number }>(page, "templeDoorScreen");
  await page.mouse.move(door.x, door.y);
  await page.mouse.click(door.x, door.y, { button: "left" });
  await waitFor(page, `window.__parable.state().templeMode === "chamber"`, 60_000);
  await frames(page, 3);
  const t = await hook<{ x: number; y: number }>(page, "tabletScreen", tablet);
  await page.mouse.move(t.x, t.y);
  await frames(page, 3);
  const log0 = (await state(page)).log.length;
  await page.mouse.click(t.x, t.y, { button: "left" });
  await waitFor(page, `window.__parable.state().templeMode === "world"`, 60_000);
  return (await state(page)).log.slice(Math.max(0, log0 - 5));
}

test("7 persistence: save at the temple, change the world, load restores the same hash, also after reload", async ({ page }) => {
  await boot(page);
  await hook(page, "setCamera", { tx: 30, tz: -28, yaw: -0.83, dist: 24 });
  await frames(page, 3);
  // Visit the chamber once for a screenshot of the tablets.
  const door = await hook<{ x: number; y: number }>(page, "templeDoorScreen");
  await page.mouse.click(door.x, door.y, { button: "left" });
  await waitFor(page, `window.__parable.state().templeMode === "chamber"`, 60_000);
  const sv = await hook<{ x: number; y: number }>(page, "tabletScreen", "save");
  await page.mouse.move(sv.x, sv.y);
  await frames(page, 4);
  await shot(page, "07-temple-chamber-tablets");
  await page.mouse.click(sv.x, sv.y, { button: "left" });
  await waitFor(page, `window.__parable.state().templeMode === "world"`, 60_000);
  const saveLog = (await state(page)).log.filter((l: string) => /saved /.test(l));
  const savedHash = saveLog[saveLog.length - 1].split("saved ")[1];
  // Change the world: throw logs, let time pass.
  await hook(page, "placeItem", 1, -20, -2);
  await hook(page, "placeItem", 2, 25, 30);
  await hook(page, "stepTicks", 300);
  const changedHash = await hook<string>(page, "hash");
  await hook(page, "setCamera", { tx: 30, tz: -28, yaw: -0.83, dist: 24 });
  await frames(page, 3);
  const loadLog = await enterTempleAndTouch(page, "load");
  const loaded = loadLog.filter((l) => /loaded /.test(l)).pop()!.split("loaded ")[1];
  // Reload the page and load again.
  await page.reload();
  await page.waitForFunction(() => (window as P).__parable?.ready === true, null, { timeout: 120_000 });
  await hook(page, "setCamera", { tx: 30, tz: -28, yaw: -0.83, dist: 24 });
  await frames(page, 4);
  const freshHash = await hook<string>(page, "hash");
  const reloadLog = await enterTempleAndTouch(page, "load");
  const reloaded = reloadLog.filter((l) => /loaded /.test(l)).pop()!.split("loaded ")[1];
  // Restart tablet: back to the seed's world.
  const restartLog = await enterTempleAndTouch(page, "restart");
  writeResult("07-persistence", { savedHash, changedHash, loadedHash: loaded, freshPageHash: freshHash, reloadedHash: reloaded, restartLog });
  expect(changedHash).not.toBe(savedHash);
  expect(loaded).toBe(savedHash);
  expect(reloaded).toBe(savedHash);
  expect(restartLog.some((l) => /restarted/.test(l))).toBe(true);
});

test("8 no HUD: only the canvas is visible in normal play; F3 overlay is off by default", async ({ page }) => {
  await boot(page);
  await frames(page, 6);
  const visible = async () =>
    page.evaluate(() =>
      [...document.body.querySelectorAll("*")]
        .filter((el) => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0 && r.width > 0 && r.height > 0 && el.tagName !== "SCRIPT";
        })
        .map((el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className ? "." + el.className : ""}`),
    );
  const normal = await visible();
  await shot(page, "08-no-hud-default-view");
  await page.keyboard.press("F3");
  await frames(page, 4);
  await page.waitForTimeout(400);
  const withF3 = await visible();
  await shot(page, "08-f3-overlay-on");
  await page.keyboard.press("F3");
  await frames(page, 2);
  const after = await visible();
  writeResult("08-no-hud", { normal, withF3, afterToggleOff: after });
  expect(normal).toEqual(["canvas#c"]);
  expect(withF3).toContain("pre#f3");
  expect(after).toEqual(["canvas#c"]);
});

test("perf (software-rendered, NOT hardware): 30 s at the default view", async ({ page }) => {
  await page.goto("/?test=1&seed=7");
  await page.waitForFunction(() => (window as P).__parable?.ready === true, null, { timeout: 120_000 });
  await page.mouse.move(720, 450);
  await page.waitForTimeout(3000);
  await hook(page, "resetPerf");
  await page.waitForTimeout(30_000);
  const perf = await hook<P>(page, "perf");
  const heap = await page.evaluate(() => (performance as P).memory?.usedJSHeapSize ?? null);
  const gl = await page.evaluate(() => {
    const c = document.createElement("canvas").getContext("webgl2");
    const ext = c?.getExtension("WEBGL_debug_renderer_info");
    return ext ? c!.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
  });
  writeResult("perf-software", { renderer: gl, note: "Headless Chrome + SwiftShader software WebGL on the build box. Not hardware evidence.", perf, heapMB: heap ? heap / 1048576 : null });
  expect(perf.interval.n).toBeGreaterThan(5);
});
