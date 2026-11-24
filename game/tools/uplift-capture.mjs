// Matched before/after capture for the uplift pass: fixed scenes, fixed cameras, fixed seed, plus measurements.
// Usage: (vite preview on PORT) node tools/uplift-capture.mjs <outDir> [port]
// Software rendering only (SwiftShader): frame numbers are NOT hardware numbers.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = path.resolve(process.argv[2] ?? "evidence/uplift/run");
const port = process.argv[3] ?? "4180";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM_PATH ?? "/usr/bin/google-chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-precise-memory-info"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const H = (fn, ...a) => page.evaluate(([fn, a]) => window.__parable[fn](...a), [fn, a]);
const frames = (n) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const shot = async (name) => {
  await H("setPixelRatio", 1);
  await frames(3);
  await page.screenshot({ path: path.join(out, `${name}.jpg`), type: "jpeg", quality: 82 });
};
const m = {};
const t0 = Date.now();
await page.goto(`http://localhost:${port}/?test=1&seed=7`);
await page.waitForFunction(() => window.__parable?.ready === true, null, { timeout: 180000 });
m.loadToReadyMs = Date.now() - t0;
await frames(6);
// S1: the village at dawn of the Dry Year, default framing.
await H("setCamera", { tx: 21, tz: 17, yaw: 0.6, dist: 58 });
await shot("s1-village-day1");
// Perf: 10 s at that view.
m.frames = await page.evaluate(() => new Promise((r) => {
  const ts = []; const t0 = performance.now();
  const f = (t) => { ts.push(t); if (t - t0 < 10000) requestAnimationFrame(f); else {
    const d = ts.slice(1).map((x, i) => x - ts[i]).sort((a, b) => a - b);
    r({ n: d.length, medianMs: d[Math.floor(d.length / 2)], p95Ms: d[Math.floor(d.length * 0.95)] }); } };
  requestAnimationFrame(f);
}));
m.heapMB = await page.evaluate(() => (performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null));
// Sim step cost: 1800 ticks (one minute of game time) without rendering.
m.simMsPer1800Ticks = await page.evaluate(() => { const a = performance.now(); window.__parable.stepTicks(1800); return +(performance.now() - a).toFixed(0); });
// S2: day 6, the wildfire after the day-5 lightning, from high up.
await H("setDay", 5, 0.29);
await H("stepTicks", 700);
await H("setCamera", { tx: 4, tz: -4, yaw: 0.6, dist: 80 });
await frames(4);
await shot("s2-wildfire-high");
// S3: the village after the fire has passed (same camera as S1).
await H("stepTicks", 2400);
await H("setCamera", { tx: 21, tz: 17, yaw: 0.6, dist: 58 });
await frames(4);
await shot("s3-village-after-fire");
// S4: run to the year's end, unattended.
for (let k = 0; k < 20; k += 1) {
  const v = await H("village");
  if (v.outcome?.ended) break;
  await H("stepTicks", 1000);
}
await frames(4);
const v = await H("village");
m.unattendedOutcome = v.outcome ? { survived: v.outcome.survived, alive: v.outcome.alive, dead: v.outcome.dead, houses: v.outcome.housesStanding, title: v.outcome.title } : null;
await shot("s4-year-end");
// S5: the next year (restart), same camera as S1.
await page.evaluate(() => document.querySelector("#restart")?.click());
await frames(6);
await H("setCamera", { tx: 21, tz: 17, yaw: 0.6, dist: 58 });
await shot("s5-next-year");
// S6: the valley from the top of the player zoom (CAM_MAX_DIST 95).
await H("setCamera", { tx: 0, tz: 0, yaw: 0.6, dist: 95 });
await frames(4);
await shot("s6-valley-top");
// S7: a glyph stone close up.
await H("setCamera", { tx: 12, tz: -38, yaw: 0, dist: 22 });
await frames(4);
await shot("s7-glyph-stone");
// S9 (new in the uplift): a cairn where a villager fell last year, with the hand over it.
const nc = await H("cairns");
m.cairns = nc;
if (nc > 0) {
  const c0 = await H("cairnScreen", 0);
  await H("setCamera", { tx: c0.wx, tz: c0.wz + 3, yaw: 0.4, dist: 20 });
  await frames(4);
  const c1 = await H("cairnScreen", 0);
  await page.mouse.move(c1.x, c1.y);
  await frames(8);
  m.cairnLabel = await H("cairnLabel");
  await shot("s9-cairn");
}
// S8: the temple chamber.
await H("setCamera", { tx: 31.2, tz: -24, yaw: 0, dist: 34 });
await frames(3);
const door = await H("templeDoorScreen");
await page.mouse.click(door.x, door.y);
await page.waitForFunction(() => window.__parable.state().templeMode === "chamber", null, { timeout: 60000 });
await page.waitForTimeout(1200);
await shot("s8-temple");
fs.writeFileSync(path.join(out, "measure.json"), JSON.stringify({ note: "Headless Chrome + SwiftShader software WebGL, 1280x800, seed 7. Not hardware numbers.", ...m }, null, 2));
console.log(JSON.stringify(m));
await browser.close();
