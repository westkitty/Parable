import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const EVIDENCE = path.resolve(process.cwd(), "evidence/m1");
fs.mkdirSync(EVIDENCE, { recursive: true });
let evidenceDir = EVIDENCE;
/** Each spec writes its screenshots/results to its own stage folder (evidence/m1, m2, m3, m4). */
export function useEvidence(stage: string): void {
  evidenceDir = path.resolve(process.cwd(), `evidence/${stage}`);
  fs.mkdirSync(evidenceDir, { recursive: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type P = any;

export async function boot(page: Page, extra = ""): Promise<void> {
  await page.goto(`/?test=1&seed=7&lowres=1${extra}`);
  await page.waitForFunction(() => (window as P).__parable?.ready === true, null, { timeout: 120_000 });
  await frames(page, 4);
}

export function frames(page: Page, n: number): Promise<void> {
  return page.evaluate(
    (n) =>
      new Promise<void>((resolve) => {
        let k = 0;
        const f = () => (++k >= n ? resolve() : requestAnimationFrame(f));
        requestAnimationFrame(f);
      }),
    n,
  );
}

export const state = (page: Page): Promise<P> => page.evaluate(() => (window as P).__parable.state());
export const hook = <T>(page: Page, fn: string, ...args: unknown[]): Promise<T> =>
  page.evaluate(([fn, args]) => (window as P).__parable[fn as string](...(args as unknown[])), [fn, args] as const) as Promise<T>;

/** Full-resolution screenshot for the evidence folder (tests otherwise render at half resolution). */
export async function shot(page: Page, name: string): Promise<string> {
  await hook(page, "setPixelRatio", 1);
  await frames(page, 2);
  const file = path.join(evidenceDir, `${name}.jpg`);
  await page.screenshot({ path: file, type: "jpeg", quality: 82 });
  await hook(page, "setPixelRatio", 0.5);
  return file;
}

export async function moveSmooth(page: Page, x0: number, y0: number, x1: number, y1: number, steps: number, stepMs: number): Promise<void> {
  for (let i = 1; i <= steps; i += 1) {
    await page.mouse.move(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps);
    if (stepMs) await page.waitForTimeout(stepMs);
  }
}

export async function drawPath(page: Page, pts: [number, number][], stepMs = 16): Promise<void> {
  for (const [x, y] of pts) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(stepMs);
  }
}

export function spiralPts(cx: number, cy: number, r0: number, r1: number, turns: number, n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i += 1) {
    const f = i / (n - 1);
    const a = f * turns * Math.PI * 2; // screen y down: increasing angle = clockwise on screen
    const r = r0 + (r1 - r0) * f;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

export function zigzagPts(x0: number, y0: number, w: number, h: number, legs: number, perLeg: number): [number, number][] {
  const out: [number, number][] = [];
  for (let leg = 0; leg < legs; leg += 1) {
    const ax = leg % 2 === 0 ? x0 : x0 + w;
    const bx = leg % 2 === 0 ? x0 + w : x0;
    for (let k = 0; k < perLeg; k += 1) {
      const f = k / perLeg;
      out.push([ax + (bx - ax) * f, y0 + (h * (leg + f)) / legs]);
    }
  }
  return out;
}

export function spearman(a: number[], b: number[]): number {
  const rank = (v: number[]) => {
    const idx = v.map((x, i) => [x, i] as const).sort((p, q) => p[0] - q[0]);
    const r = new Array(v.length);
    idx.forEach(([, i], k) => (r[i] = k));
    return r as number[];
  };
  const ra = rank(a);
  const rb = rank(b);
  const n = a.length;
  let d2 = 0;
  for (let i = 0; i < n; i += 1) d2 += (ra[i] - rb[i]) ** 2;
  return 1 - (6 * d2) / (n * (n * n - 1));
}

export function writeResult(name: string, data: unknown): void {
  fs.writeFileSync(path.join(evidenceDir, `${name}.json`), JSON.stringify(data, null, 2));
}

export async function waitFor(page: Page, pred: string, timeout = 60_000): Promise<void> {
  await page.waitForFunction(pred, null, { timeout, polling: 100 });
}

export { expect };

export type Ev = { type: "move" | "down" | "up"; x: number; y: number; button?: "left" | "right" | "middle"; dt?: number };

/**
 * Replay a recorded pointer sequence through Chrome's real input pipeline (CDP Input.dispatchMouseEvent)
 * with explicit timestamps. The software renderer runs at a few fps, and Playwright's page.mouse waits
 * for each event to be handled, which would space events ~250 ms apart; explicit timestamps keep the
 * recorded hand speed (the game reads event.timeStamp / getCoalescedEvents, as with a real mouse).
 */
export async function playback(page: Page, evs: Ev[], defaultDtMs = 16): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const base = Date.now() / 1000;
  let t = 0;
  let buttons = 0;
  const bit = { left: 1, right: 2, middle: 4 } as const;
  const out = evs.map((e) => {
    t += (e.dt ?? defaultDtMs) / 1000;
    if (e.type === "down" && e.button) buttons |= bit[e.button];
    if (e.type === "up" && e.button) buttons &= ~bit[e.button];
    const held = (Object.keys(bit) as (keyof typeof bit)[]).find((k) => buttons & bit[k]);
    return {
      type: e.type === "move" ? "mouseMoved" : e.type === "down" ? "mousePressed" : "mouseReleased",
      x: e.x,
      y: e.y,
      button: e.type === "move" ? (held ?? "none") : e.button,
      buttons,
      clickCount: e.type === "move" ? 0 : 1,
      timestamp: base + t,
    };
  });
  await Promise.all(out.map((e) => cdp.send("Input.dispatchMouseEvent", e as never)));
  await cdp.detach();
}

export const pts2moves = (pts: [number, number][], dt = 16): Ev[] => pts.map(([x, y]) => ({ type: "move", x, y, dt }));

/** Rain's second stroke: a zigzag turned on its side (up-down strokes moving left to right). */
export function wavePts(x0: number, y0: number, w: number, h: number, legs: number, perLeg: number): [number, number][] {
  return zigzagPts(0, 0, h, w, legs, perLeg).map(([x, y]) => [x0 + y, y0 + x]);
}

/** Sanctuary's second stroke: one closed loop with a little overlap. */
export function ringPts(cx: number, cy: number, r: number, n = 80, sweep = 1.06, squash = 0.9): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i += 1) {
    const a = -Math.PI / 2 + (i / (n - 1)) * sweep * Math.PI * 2;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * squash]);
  }
  return out;
}

/** Draw spiral (arms the ritual), then the second stroke, with the empty hand and real pointer events. */
export async function ritual(page: Page, cx: number, cy: number, second: [number, number][]): Promise<void> {
  await page.mouse.move(cx, cy);
  await playback(page, pts2moves(spiralPts(cx, cy, 20, 110, 2.3, 120)));
  await waitFor(page, "window.__parable.state().armed === true", 20_000);
  await playback(page, pts2moves(second, 16).map((e, i) => (i === 0 ? { ...e, dt: 450 } : e)));
}

/** Keep the recorded video of this test as stage evidence (webm). */
export async function keepVideo(page: Page, name: string): Promise<void> {
  const v = page.video();
  if (!v) return;
  await page.close();
  await v.saveAs(path.join(evidenceDir, `${name}.webm`));
}
