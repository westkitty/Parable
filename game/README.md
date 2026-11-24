# Parable — first playable: the Dry Year

A small Black & White–style god-game in the browser. One valley, your divine hand, a village of twelve, one Dry Year
that ends in a fire crisis, ten drawn miracles and optional wooden golems. Three.js r185 + Rapier 0.21 physics +
a pure TypeScript simulation. No creature (no companion, no training) and no HUD.

The village is the default. `?scenario=solo` opens the Milestone 1 valley (Ilse alone, Fireball only).

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

## The village and the Dry Year

Twelve villagers live in four households. Each has a name, a trade, needs (hunger, energy, injury), skills, family
and friends, and memories. They fell trees, haul wood to the building site, farm, fetch water, pray, and paint the
village wall. Each day is drier. On day 5 lightning strikes the grove and the wind carries fire toward the
houses. The year ends on day 10. The end card tells you who lived, which houses stand, and how much they believe.
The temple's records wall keeps every year. "Begin a new year" restarts.

Hover the empty hand over a villager to read how they feel about you and why: gratitude, fear and resentment, each
with the act that caused it.

## The ten miracles

Every miracle is drawn with the empty hand: a **clockwise spiral** (it glows gold when the hand is ready), then a
second stroke. Miracles cost prayer power, which is the villagers' worship; the temple brazier shows how much you have.
Closed shapes (ring, square, triangle) act on what they surround. Every other stroke acts where the hand ends.

| Second stroke | Miracle | Does | Learned at |
|---|---|---|---|
| vertical zigzag | Fireball | a fireball in the hand, to throw | known from the start |
| sideways wave | Rain | a rain cloud in the hand; click to let it fall | the bell-stone shrine (set the dry bell stone on its altar, then trace) |
| ring | Sanctuary | a dome that fire cannot enter | the village wall, once the villagers finish painting it (hover to study) |
| V | Healing | wounds close, burnt ground greens | the glyph stone that wakes when a hurt villager is set gently beside it |
| stroke down | Lightning | a bolt: splits a tree into logs, sets fire, hurts | the glyph stone that wakes when fire touches it |
| stroke up | Fertility | the field ripens, dead plots sprout | the glyph stone that wakes when rain falls on it |
| stroke sideways | Wind Lash | a gust along the stroke: bends the fire, throws loose things, knocks people down | the glyph stone that wakes when something is thrown hard past it |
| square | Stone Shape | a ring of standing stones: a firebreak; stone for a nearby building site | the glyph stone that wakes when two logs are laid beside it |
| peak (^) | Beacon | a pillar of light: the village gathers to pray (a refuge in a fire) | touch the temple brazier when prayer power is 90 or more |
| triangle | Golem Wake | wakes a dormant golem | touch the carved stele in the temple once a golem has formed |

A glyph stone glows once its ritual has woken it. Trace its glyph within about 12 m of it to learn the miracle.

## Golems (optional)

Lay four logs in the old stone ring east of the building site and they become a dormant wooden golem (at most three).
Wake it with Golem Wake. Pick it up with the right button and set it down where you want it to work:

- by the woodpile: it **hauls** loose logs to the building site, or to the woodpile;
- by the building site: it **carries wood and builds**;
- by the well: it waits full of water and **douses** fires that come near the village.

Golems are slow and cost prayer power every day they are awake (more when working). At zero power they fall asleep.
They never cast miracles. Villagers who see them work are grateful and remember it.

**Saving:** click the temple doorway on the hill. Inside, touch a carved tablet: spiral = Save, open hand = Load, rising sun = Restart. The frieze above shows the ten miracle glyphs, lit once learned. The lectern on the right turns you to the records wall. The archway on the left leads back out. Saves go to IndexedDB, with a localStorage copy.

**Ilse** hauls loose logs to the woodpile beside her cottage. If she sees fire within 18 m she drops her log, runs, and cowers, then goes back to work after 10 s of calm. She remembers what you do to her. Hover the empty hand over her for a moment to see how she feels and why.

## Tests

```bash
npm --prefix game run typecheck
npm --prefix game test            # Vitest: gesture corpus, ritual, fire, save, settler, nav
npm --prefix game run e2e         # Playwright, Chromium 1440x900, writes game/evidence/m1..m5/
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
src/temple/   front chamber: Save / Load / Restart tablets, miracle frieze, brazier, golem stele, records
src/debug/    F3 overlay, frame stats
```

Assets: Kenney CC0 kits; see `ASSET_LEDGER.md`. Procedural art (labelled in code): the hand, fire, water, terrain,
glyph faces, the mural painting, miracle effects, and the golem assembly (built from Kenney log and rock pieces).
Owner play checklists: `HUMAN_GATE_M1.md`, `HUMAN_GATE_FIRST_PLAYABLE.md`. Results: `evidence/*/RESULTS.md`.
