# Parable first playable (M2–M6): acceptance results

Run: 2026-11-23, about 21:43–21:59 America/Detroit (EST). Box: headless Chrome with SwiftShader (software WebGL), Node 24.
Command: `PW_CHROMIUM_PATH=/usr/bin/google-chrome npm run gate` (typecheck → unit → build → Playwright, all specs). Exit 0.
Typecheck PASS · Unit 62/62 PASS · Build PASS · Playwright 27/27 PASS (14.9 min). M1 results: `../m1/RESULTS.md` (8/8 again in this run).

| Stage / check | Result | Numbers | Evidence |
|---|---|---|---|
| m2-1 twelve villagers with identities | PASS | 12 names, 6 trades × 2, households, hover bubble | ../m2/m2-01-*.jpg, m2-01-identities.json |
| m2-2 work moves resources | PASS | in 1800 ticks: 6 trees felled, woodpile 3 → 7, site 0 → 3/8 wood | ../m2/m2-02-*.jpg, m2-02-work-loop.json |
| m2-3 god's log builds the house | PASS | gentle set-down on site: have 0 → 1; house finishes | ../m2/m2-03-*.jpg/json |
| m2-4 injury and care | PASS | thrown at 17.8 m/s: injury 0.53, crutch, resentment, carer tends | ../m2/m2-04-*, m2-injury-and-care.webm |
| m3-1 drought → day-5 lightning wildfire | PASS | dryness 0.08 → 0.29 → 0.59 → 0.93 → 1.0 (days 1/3/5/7/9) | ../m3/m3-01-*.jpg/json |
| m3-2 shrine teaches Rain | PASS | bell stone carried to altar, spiral+wave traced, rain douses fire | ../m3/m3-02-*, m3-shrine-rain.webm |
| m3-3 mural teaches Sanctuary | PASS | painted in 8 days; dome over house 1 holds against two ignitions | ../m3/m3-03-*.jpg/json |
| m3-4 power and fizzle; belief causes | PASS | weak cast fizzles; cost 30 spent | ../m3/m3-04-*.json |
| m4-1 whole year → end card → record → restart | PASS | seed 7 unattended: endured, 12/12 alive, 5 houses, 0 food, belief 22 | ../m4/m4-01-*, m4-dry-year-end.webm |
| m4-2 losing branch + temple records | PASS | "The Dry Year broke the village", 6 dead; two years carved | ../m4/m4-02-*.jpg/json |
| m4-3 village save/load | PASS | saved 3baf8757 → changed → loaded 3baf8757 → page reload + load 3baf8757 | ../m4/m4-03-village-save.json |
| m4-perf | measurement only | SwiftShader: frame interval median 605 ms; CPU per frame median 7.5 ms | ../m4/m4-perf-software.json |
| m5-1 glyph stone ritual → Stone Shape (square) | PASS | 2 logs laid → stone wakes; traced within 12 m → learned; ring raised, fire inside stays out | m5-01-*.jpg/json |
| m5-2 Healing (V) | PASS | injury 0.70 → 0.10; memory was_healed; mood "grateful: your light healed me" | m5-02-healing.jpg/json |
| m5-3 Lightning (line down) | PASS | tree split into 2 logs; 4 cells lit → 79 burning | m5-03-lightning.jpg/json |
| m5-4 Fertility (line up), Wind Lash (line sideways) | PASS | 12/12 plots ripe; wind 0.29 → 1.2 m/s toward 92° | m5-04-*.jpg/json |
| m5-5 Beacon at the brazier (peak) | PASS | refused at power 60, learned at 95; 12 villagers gathered and prayed | m5-05-*.jpg/json |
| m6-1 golem forms, learned at stele, builds | PASS | 4 logs → dormant golem; triangle fizzles until the stele teaches it; hand grab → set down by site → job build; 3 golem work events; site finished (villagers helped too) | m6-01-*.jpg/json, m6-golem.webm |
| m6-2 golem douses, sleeps at 0 power | PASS | job douse, waits full of water, doused 3 cells; slept "no prayer power left" | m6-02-*.jpg/json |

Unit tests added for M5/M6 (`tests/miracles.test.ts`, 14): each later miracle's effect and belief cause, glyph-stone wake,
golem formation/wake/job-by-place/haul/build/douse/upkeep-sleep, and a check that the golem module has no path to cast.

## UNVERIFIED
- Real mouse / trackpad feel for all ten gestures. Tests replay timed strokes through CDP.
- False casts: in the synthetic corpus, 30/500 (6%) of random strokes made inside the 5.6 s armed window read as a
  finisher (mostly the three straight-line ones). Needs the human gate.
- Frame rate on the M1 Air with a real GPU.
- Balance: on seed 7 the unattended year is survived 12/12 (food runs out on the last day). The fire crisis may be
  too gentle on some seeds. Golem upkeep (3–5 power/day) is small next to prayer income, so golems feel nearly free.
- Human gates `HUMAN_GATE_M1.md` and `HUMAN_GATE_FIRST_PLAYABLE.md` are not done.

## Test shortcuts (not in the game)
- `stepTicks` fast-forward, `setPower`, `learn`, `setDay`, `hurt`, and `addLog` (logs for the stone and golem
  rituals are placed by hook; hand-carrying a log uses the same code tested in M1–M3).
