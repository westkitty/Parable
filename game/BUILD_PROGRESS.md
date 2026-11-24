# Build progress (M2 → ten miracles + golems) (handoff note — update every push)

Branch `feat/m1-hand-camera-fireball` (PR #1). Never push to main, never force-push. No creatures
(no companion, no training). Golems are allowed: optional physical labour only, they never cast.

## Done
- 0d635c8 Stage 1: village sim (12 settlers, needs, jobs, relationships, memories, belief causes),
  Dry Year (drought, wind, day-5 lightning, fire crisis, burn/ruin/rebuild), Rain via shrine + bell stone,
  Sanctuary via mural, temple plaques/brazier/records, end card + restart.
- e2e: m2-1..4 PASS, m3-1..4 PASS, m4-1..3 + perf PASS (run per spec; full gate pending).
- Ten miracles, each spiral (clockwise) then a finisher: zigzag Fireball, wave Rain, ring Sanctuary, V Healing,
  line-down Lightning, line-up Fertility, line-side Wind Lash, square Stone Shape, ^ Beacon, triangle Golem Wake.
  Sim in src/sim/miracles.ts; cast routing in main.ts castMiracle.
- Learning: Rain at the shrine, Sanctuary at the mural, Healing/Lightning/Fertility/Wind/Stone at five old-god glyph
  stones (each woken by a physical ritual, then trace the glyph within 12 m), Beacon at the temple brazier
  (power ≥ 90), Golem Wake at the temple's carved stele (once a golem has formed).
- Golems (src/sim/golems.ts): 4 logs laid in the old ring at (36,34) form a dormant body; Golem Wake wakes it;
  hand picks it up (right button) and sets it down: by woodpile → haul, by site → carry wood + build,
  by well → wait full of water and douse fires near the village. Upkeep 3/day (+2 with a job) prayer power;
  sleeps at 0. Witnesses gain gratitude + saw_golem memory.
- Render: src/render/marks.ts (glyph stones, golem ring, procedural golems from Kenney logs/rock, stone rings,
  beacon pillar, wind streaks); src/render/glyphs.ts (shared gesture glyphs); temple frieze of ten plaques,
  brazier tablet, golem stele, records lectern.
- Unit tests: 62 pass (tests/miracles.test.ts covers the seven later miracles + golems).

## Status
- FULL GATE PASS 2026-11-23 ~21:59 EST: typecheck, 62 unit, build, Playwright 27/27 (m1 8, m2 4, m3 4, m4 4, m5 5, m6 2).
- Docs done: README, HUMAN_GATE_FIRST_PLAYABLE.md, evidence/m5/RESULTS.md, Bible Entry 10, PR description.

## Next (after the owner's human gate)
1. Tune false casts of the straight-line finishers (6% in the armed window).
2. Drought severity per seed (seed 7 survives 12/12 unattended); golem upkeep vs prayer income.
3. Consider re-encoding m2-injury-and-care.webm (58.8 MB) smaller in a new commit.

## How to iterate fast
- `npx vite build && PW_CHROMIUM_PATH=/usr/bin/google-chrome npx playwright test e2e/m5.spec.ts -g m6-1`
- Headless village sim: `npx vite-node /workspace/scratch/vsim.ts <days> <seed>` (scratch may be gone on a fresh box).
- NOTE: the image viewer may cache by path; write screenshots to new file names when comparing.
