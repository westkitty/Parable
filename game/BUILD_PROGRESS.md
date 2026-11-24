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

## Next
1. e2e/m5.spec.ts (m5-1..5 miracles, m6-1..2 golems): get all green; evidence in evidence/m5.
2. Full `PW_CHROMIUM_PATH=/usr/bin/google-chrome npm run gate` (run in background with a log; >10 min).
3. Docs: HUMAN_GATE checklist, README, evidence RESULTS.md, ASSET_LEDGER (node tools/asset-ledger.mjs),
   append Parable_Bible entry, PR description.

## How to iterate fast
- `npx vite build && PW_CHROMIUM_PATH=/usr/bin/google-chrome npx playwright test e2e/m5.spec.ts -g m6-1`
- Headless village sim: `npx vite-node /workspace/scratch/vsim.ts <days> <seed>` (scratch may be gone on a fresh box).
- NOTE: the image viewer may cache by path; write screenshots to new file names when comparing.
