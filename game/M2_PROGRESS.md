# M2–M4 progress (handoff note — update every push)

Branch `feat/m1-hand-camera-fireball` (PR #1). Never push to main, never force-push. No creatures/golems.

## Done
- 0d635c8 Stage 1: village sim (12 settlers, needs, jobs, relationships, memories, belief causes),
  Dry Year (drought, wind, day-5 lightning, fire crisis, burn/ruin/rebuild), Rain via shrine + bell stone,
  Sanctuary via mural, temple plaques/brazier/records, end card + restart. 35 unit tests; M1 e2e 8/8 in `&scenario=solo`.
- e2e specs written: e2e/m2.spec.ts, m3.spec.ts, m4.spec.ts.
- m2-1, m2-2, m2-3 PASS (evidence/m2). m2-4 (injury/carer) failing on throw strength: retuning the flick.

## Next
1. Get m2-4 passing → run full `PW_CHROMIUM_PATH=/usr/bin/google-chrome npm run gate` → mark M2 done.
2. Run m3.spec.ts (drought/lightning, shrine/rain, mural/sanctuary, power/fizzle); fix; gate.
3. Run m4.spec.ts (full Dry Year → end card → records → restart; losing branch; village save/load; perf); fix; gate.
4. Update HUMAN_GATE checklist (M2–M4), README, evidence RESULTS, append Parable_Bible entry, PR description.

## How to iterate fast
- `npx vite build && PW_CHROMIUM_PATH=/usr/bin/google-chrome npx playwright test e2e/m2.spec.ts -g m2-4`
- Headless village sim: `npx vite-node /workspace/scratch/vsim.ts <days> <seed>` (scratch may be gone on a fresh box).
