# Parable M1: acceptance results

Run: 2026-11-23, about 19:35–19:40 America/Detroit (EST). Box: headless Chrome with SwiftShader (software WebGL), Node 24.
Command: `PW_CHROMIUM_PATH=/usr/bin/google-chrome npm run gate` (typecheck → unit → build → Playwright). Exit 0.

| Check | Result | Numbers | Evidence |
|---|---|---|---|
| Typecheck (`tsc --noEmit`) | PASS | 0 errors | gate log |
| Unit tests (Vitest) | PASS | 16/16 (gesture corpus, sim, save round-trip) | `tests/` |
| Build (`vite build`) | PASS | 36 modules | `dist/` (ignored) |
| 1 Camera zoom / pan / orbit / reset | PASS | eye height 79.9 m → 1.26 m (63.5×); pan 20.0 m; orbit −1.2 rad; reset OK | 01-camera-far/mid/near-ilse.jpg, 01-camera.json |
| 2 Grab | PASS | 20/20 first-press grabs; rapid A→B switch got B | 02-grab-holding.jpg, 02-grab-switch-B.jpg, 02-grab.json |
| 3 Throw with momentum | PASS | Spearman(speed, distance) = 1.0; 2.5 m/s → 1.6 m … 26.2 m/s → 55.9 m; slow release rests 0.027 m from release point | 03-throw-landed.jpg, 03-gentle-setdown.jpg, 03-throw.json |
| 4 Settler hauls log | PASS | Ilse starts after 13 ticks (0.65 s); stacked after 384 ticks (bound 550); woodpile 0 → 1 | 04-haul-*.jpg, 04-haul.json |
| 5 Spiral → zigzag Fireball changes environment | PASS | clockwise spiral armed (rotation 15.7 rad); zigzag 4 turns; Fireball held; thrown at 34.3 m/s; impact lit 10 cells; 210 cells scorched and still 210 later | 05-ritual-armed-spiral.jpg, 05-fireball-held.jpg, 05-grove-burning-ilse-flees.jpg, 05-scorch-after-burnout.jpg, 05-miracle-run.webm |
| 6 Settler reaction | PASS | Ilse flees 1 tick after impact (15.8 m from grove centre); memory `saw_fire`, causedByGod true; bubble "Scared — your fire took the grove (6 s ago)" | 06-inspect-bubble.jpg, 05-06-miracle-reaction.json |
| 7 Save / reload | PASS | saved 8ab03cc4 → changed bd1985b9 → load 8ab03cc4 → fresh page reload + load 8ab03cc4; restart OK | 07-temple-chamber-tablets.jpg, 07-persistence.json |
| 8 No persistent HUD | PASS | normal play: only `canvas#c`; F3 adds `pre#f3`; F3 again removes it | 08-no-hud-default-view.jpg, 08-f3-overlay-on.jpg, 08-no-hud.json |
| Perf on this box | PASS (as a measurement only) | software-rendered: frame interval median 368 ms (2.7 fps), p95 630 ms; CPU per frame median 3.5 ms; physics 0.10 ms/step; heap 24.9 MB | perf-software.json |

## UNVERIFIED
- Feel with a real mouse and trackpad (grab, throw, gestures). Tests replay timed input through CDP.
- Frame rate on the M1 Air with real GPU. The box number is SwiftShader, not hardware.
- Human gate in `HUMAN_GATE_M1.md` is not done.

## How the tests cope with software rendering (deviations, not shortcuts in the game)
- `?lowres=1` (pixel ratio 0.5) for functional steps; screenshots switch to pixel ratio 1.
- Fast mouse motion is replayed with CDP `Input.dispatchMouseEvent` and explicit timestamps; the game reads `event.timeStamp` and coalesced events.
- Long waits use the `stepTicks` test hook. Hooks only exist with `?test=1`.
- Test 5 re-draws the spiral after taking the armed screenshot, because a full-res screenshot takes longer than the 5.6 s arm window under SwiftShader. The spiral → zigzag run that summons the Fireball is uninterrupted.
- Grid A* instead of recast navmesh; gesture thresholds retuned against the unit corpus (1 false positive in 500 random wanders).

## Notes
- Procedural art is labelled as such in `ASSET_LEDGER.md`. Seven CC0 asset files are kept but unused; deleting them needs owner approval.
- No creatures/golems in M1.
