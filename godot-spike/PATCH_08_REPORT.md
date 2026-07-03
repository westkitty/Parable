# Patch 08 Report

## Scope

- Removed right-click auto-acquire behavior. Right mouse can only grab the currently highlighted grabbable.
- Kept right mouse out of camera movement, zoom, pan, orbit, snap, search, and assist paths.
- Made hover target authoritative and based on the visible hand grip/palm point.
- Removed carry-time camera slowdown by keeping camera control scale at `1.0`.
- Added focus-loss cleanup for orbit, middle-button state, carry, pending hand input, stale hover, sampler state, and cursor visibility.
- Added focus-gain resync that restores cursor policy and hand position without grabbing or moving the camera.
- Cached grabbables for hover checks instead of searching the scene tree every frame.
- Slightly increased scroll zoom step while preserving bounded additive zoom and no click zoom.
- Added diagnostics input-mode reporting.
- Added README guardrail: right mouse only grabs the currently highlighted object and never moves or zooms the camera.

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

## Commit Metadata

- Commit hash: recorded in final handoff after commit.
- Push output: recorded in final handoff after push.
