# Parable — Milestone 1: Hand on the Valley

A small Black & White–style god-game slice in the browser: one valley, your divine hand, one settler (Ilse), and the Fireball miracle. Three.js r185 + Rapier 0.21 physics + a pure TypeScript simulation. No creature, no golems, no HUD.

## Run

```bash
npm --prefix game ci
npm --prefix game run dev        # http://localhost:5174
```

Production build and preview: `npm --prefix game run build && npm --prefix game run preview` (port 4174).

## Controls

| Input | Does |
|---|---|
| Move the mouse | The hand follows the land |
| Right button on a log or Ilse | Grab on the first press; hold to carry |
| Release slowly (under 1.8 m/s) | Set it down gently |
| Release while moving | Throw with the hand's momentum |
| Left drag | Pan — grab the land |
| Left click | Interact (temple doorway, tablets) |
| Middle drag (or Alt + left drag) | Orbit |
| Wheel | Zoom from about 80 m up down to Ilse's height; the view flattens as you zoom in |
| R | Reset camera |
| Esc | Safe release (never throws), cancel a gesture, leave the temple |
| F3 | Developer overlay (off by default) |

**Fireball:** with an empty hand and no button held, draw a **clockwise spiral** (a golden trace marks the ritual as ready for 5.6 s), then a **vertical zigzag**. A fireball appears in the hand. Press and release the right button with a flick to throw it. Setting it down gently or pressing Esc puts it out.

**Saving:** click the temple doorway on the hill. Inside, touch a carved tablet: spiral = Save, open hand = Load, rising sun = Restart. The archway on the left leads back out. Saves go to IndexedDB, with a localStorage copy.

**Ilse** hauls loose logs to the woodpile beside her cottage. If she sees fire within 18 m she drops her log, runs, and cowers, then goes back to work after 10 s of calm. She remembers what you do to her. Hover the empty hand over her for a moment to see how she feels and why.

## Tests

```bash
npm --prefix game run typecheck
npm --prefix game test            # Vitest: gesture corpus, ritual, fire, save, settler, nav
npm --prefix game run e2e         # Playwright, Chromium 1440x900, writes game/evidence/m1/
npm --prefix game run gate        # all of the above + build
```

On a box without Playwright's bundled browser, set `PW_CHROMIUM_PATH=/usr/bin/google-chrome`. The headless runs use SwiftShader software WebGL, which gets only a few frames per second, so:
- functional e2e tests render at half resolution (`?lowres=1`); evidence screenshots switch to full resolution;
- fast pointer motions (throws, gestures) are replayed through Chrome's real input pipeline (CDP `Input.dispatchMouseEvent`) with explicit 16 ms timestamps. The game reads `event.timeStamp` and coalesced events exactly as it does with a real mouse;
- long waits fast-forward the sim with the `?test=1` hook `stepTicks(n)`, which runs the same physics and sim steps without rendering.

## Layout

```
src/sim/      pure simulation (no three/rapier/DOM): world, settler, fire, terrain, scenery, save hash
src/nav/      deterministic grid A* (2 m cells); stands in for recast-navigation in M1
src/physics/  Rapier: ground trimesh, trunks, buildings; loose and held objects
src/input/    pointer state machine + pure gesture recogniser and ritual
src/hand/     the divine hand (original procedural art)
src/render/   scene, terrain, water, vegetation, buildings, settler, fire, particles, camera
src/temple/   front chamber with Save / Load / Restart tablets
src/debug/    F3 overlay, frame stats
```

Assets: Kenney CC0 kits; see `ASSET_LEDGER.md`. Owner play checklist: `HUMAN_GATE_M1.md`. Results: `evidence/m1/RESULTS.md`.
