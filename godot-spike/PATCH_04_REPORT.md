# PATCH 04 REPORT

## What Changed

- Added `tests/verify_playability_surrogates.gd` to exercise the remaining high-value interaction surrogates that Patch 03 still left to Andrew.
- Added small public test hooks in `scripts/hand_input.gd` and `scripts/camera_rig.gd` so headless tests can drive safe-cancel and zoom without mutating the real control scheme.
- Added `scripts/shrine.gd` reject-reason access and `scripts/diagnostics.gd` snapshot lines so failures become easier to report and easier to assert in tests.
- Updated `verify.sh` so one command now runs:
  - headless smoke verification
  - contract verification
  - playability surrogate verification
- Tightened `README_FOR_ANDREW.md` with a simple three-line failure report template.

## Why It Matters

- Andrew cannot playtest this session, so the best available substitute is stronger automated proof around input-state cleanup, threshold edges, shrine rejection, and diagnostics visibility.
- This does not claim the hand feels good. It only raises automated confidence and makes later failures easier to describe without Godot knowledge.

## What Automated Tests Now Cover

- Hold stability across simulated frames.
- Gentle drop versus throw mode recording across multiple object classes.
- Throw threshold edge behavior just below and just above the release cutoff.
- Camera pan, orbit, and zoom state changes while carrying, without corrupting hold state.
- Esc safe-release clearing held-object and miracle-armed state.
- Shrine gentle placement acceptance and hard-throw rejection near the altar.
- Clockwise spiral acceptance, random/counterclockwise rejection, and zigzag teaching/casting path.
- Temple chamber focus visibility through world and diagnostics state.
- Diagnostics readiness for Andrew-facing failure reports.

## What Automated Tests Still Cannot Prove

- Real hand feel.
- Real middle-mouse comfort on Andrew’s hardware.
- Whether shrine and temple interaction feel obvious without diagnostics.
- Whether the overall play loop feels like godhood rather than cursor work.

## Exact Validation Commands Run

```bash
cd /Users/andrew/Parable/godot-spike && ./verify.sh
godot --headless --path /Users/andrew/Parable/godot-spike --script res://tests/verify_contracts.gd
godot --headless --path /Users/andrew/Parable/godot-spike --script res://tests/verify_playability_surrogates.gd
cd /Users/andrew/Parable/godot-spike && ./run.sh --dry-run
```

## Validation Output Summary

- `./verify.sh`: passed
  - smoke verify passed
  - contract verify passed
  - playability surrogate verify passed
  - runbook cross-check passed
- `verify_contracts.gd`: `CONTRACT VERIFY: ALL CHECKS PASSED`
- `verify_playability_surrogates.gd`: `PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED`
- `./run.sh --dry-run`: printed the resolved Godot binary, version, and launch command

## Exact Files Changed

- `godot-spike/PATCH_04_REPORT.md`
- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/diagnostics.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/scripts/shrine.gd`
- `godot-spike/tests/verify_playability_surrogates.gd`
- `godot-spike/tests/verify_playability_surrogates.gd.uid`
- `godot-spike/verify.sh`

## Whether Commit Was Created

- At report authoring time: no commit created yet.
- Final terminal handoff states whether validation stayed green through staging and commit.

## Final Git Status

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/shrine.gd
 M godot-spike/verify.sh
?? godot-spike/tests/verify_playability_surrogates.gd
?? godot-spike/tests/verify_playability_surrogates.gd.uid
```

## Next Command Andrew Should Run When Awake

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```
