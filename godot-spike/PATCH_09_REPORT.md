# Patch 09 Report

## Scope

- Made `HandVisual/GripSocket` the explicit visual truth for held-object placement.
- Added explicit `hold_profile` values for rock, villager, offering, and tree.
- Tuned held-object offsets:
  - rock sits centered in the palm;
  - villager dangles from upper body/head under the palm;
  - offering stays upright in the palm;
  - tree is gripped around the trunk.
- Made the hand enter the carry pose immediately when a grab begins.
- Added profile-specific carry curl/spread targets so the hand visibly closes around held objects.
- Preserved existing held-object materials; no held recolor path was added.
- Added F3 diagnostics for grip socket position, held object position, grip distance, active hold profile, and hand pose.
- Preserved Patch 08 behavior: right mouse only grabs the highlighted object, no right-click auto-acquire, no right-click camera/zoom/snap behavior, and focus re-entry behavior remains covered by tests.
- Did not change camera code.

## Validation

Commands run successfully:

```text
git status --porcelain
godot --version
cd /Users/andrew/Parable/godot-spike && ./verify.sh
cd /Users/andrew/Parable/godot-spike && ./run.sh --dry-run
godot --headless --path /Users/andrew/Parable/godot-spike --quit-after 120
godot --headless --path /Users/andrew/Parable/godot-spike --script res://tests/verify_playability_surrogates.gd
```

Results:

- `git status --porcelain` before staging showed only modified/untracked `godot-spike/` files.
- Protected-file check found no `PROJECT_BIBLE`, PDF, `.DS_Store`, root README, or `docs/` path.
- `godot --version`: `4.7.stable.official.5b4e0cb0f`.
- `./verify.sh`: `VERIFY RESULT: ALL CHECKS PASSED`.
- `./run.sh --dry-run`: resolved `/opt/homebrew/bin/godot` and printed the expected Godot project command.
- Headless boot exited successfully.
- Updated playability surrogate: `PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED`.

## Surrogate Coverage Added

- Each grabbable class has an explicit hold profile.
- Each class activates its matching hold profile on grab.
- Each class closes the hand into carry pose on grab.
- Each class follows `GripSocket + hold_offset` within a tight threshold.
- Each class keeps its base material color while held.
- Diagnostics expose grip socket position, held object position, active hold profile, and grip distance.
- Patch 08 right-click and focus behavior remains covered in the same surrogate run.

## Commit Metadata

- Commit hash: recorded in final handoff after commit.
- Push output: recorded in final handoff after push.
