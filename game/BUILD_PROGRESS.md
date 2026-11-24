# Build progress (M2 → ten miracles + golems) (handoff note — update every push)

Branch `feat/m1-hand-camera-fireball` (PR #1). Never push to main, never force-push. No creatures/golems.

## Done
- 0d635c8 Stage 1: village sim (12 settlers, needs, jobs, relationships, memories, belief causes),
  Dry Year (drought, wind, day-5 lightning, fire crisis, burn/ruin/rebuild), Rain via shrine + bell stone,
  Sanctuary via mural, temple plaques/brazier/records, end card + restart. 35 unit tests; M1 e2e 8/8 in `&scenario=solo`.
- e2e specs written: e2e/m2.spec.ts, m3.spec.ts, m4.spec.ts.
- m2-1..m2-4 PASS, m3-1..m3-4 PASS (each run individually; full gate not yet re-run).
- Scope expanded by the user: TEN miracles + GOLEM system (no creature). Gestures for all ten done
  (spiral then: zigzag Fireball, wave Rain, ring Sanctuary, V Heal, line-down Lightning, line-up Fertility,
  line-side Wind, square Stone, ^ Beacon, triangle Golem Wake) with unit tests.
- Sim for heal/lightning/fertility/wind/stone/beacon + glyph stones (rituals wake them) in src/sim/miracles.ts.

## Next
1. src/sim/golems.ts: form from 4 logs in the golem ring (36,34); Golem Wake wakes; job from where the hand drops it
   (woodpile → haul loose logs, site → carry wood to build, well → douse); slow; upkeep drains prayer power; never casts.
2. Unit tests for miracles + golems; render (glyph stones, beacon pillar, stone ring, golem view, heal/wind particles);
   main.ts cast routing for all ten + learning (glyph stones; Beacon + Golem Wake taught in the temple).
3. e2e m5 spec (miracles) + m6 (golems); then full gate.
4. Run m4.spec.ts (full Dry Year → end card → records → restart; losing branch; village save/load; perf); fix; gate.
4. Update HUMAN_GATE checklist (M2–M4), README, evidence RESULTS, append Parable_Bible entry, PR description.

## How to iterate fast
- `npx vite build && PW_CHROMIUM_PATH=/usr/bin/google-chrome npx playwright test e2e/m2.spec.ts -g m2-4`
- Headless village sim: `npx vite-node /workspace/scratch/vsim.ts <days> <seed>` (scratch may be gone on a fresh box).
