# PATCH 02 REPORT

## Files Changed

- `godot-spike/PATCH_02_REPORT.md`
- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/diagnostics.gd`
- `godot-spike/scripts/gesture_recognizer.gd`
- `godot-spike/scripts/grabbable.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/scripts/island.gd`
- `godot-spike/scripts/offering_proxy.gd`
- `godot-spike/scripts/rock_proxy.gd`
- `godot-spike/scripts/shrine.gd`
- `godot-spike/scripts/symbol_forms.gd`
- `godot-spike/scripts/temple_interior.gd`
- `godot-spike/scripts/world.gd`
- `godot-spike/tests/verify_headless.gd`

## Object / Terrain Collision Fix Summary

- Moved collision safety ownership into `scripts/grabbable.gd`.
- Added canonical surface placement helpers so world spawns and gentle releases use terrain height plus per-object clearance.
- Added below-floor safety recovery in `Grabbable._physics_process()` with recovery counters and debug visibility.
- Froze fragile startup objects (`rock`, `offering`) in place at load so they remain visible and grabbable instead of waking into bad contact states.
- Tightened headless checks so the verifier advances physics frames and asserts:
  - all grabbables stay above a safety floor;
  - rocks and offerings are visibly above terrain;
  - no startup recovery was needed.

## Island Readability Changes

- Reworked `island.gd` so the terrain falls to a real seabed outside the island instead of hovering just under the water plane.
- Lowered the water plane relative to land and added a simple raised island base so the silhouette reads as an island immediately.
- Kept the terrain simple and ugly on purpose: clear green/brown land over lower blue water.

## Orbit Control Fix

- Kept middle mouse as the primary `camera_orbit` binding.
- Added `Option/Alt + left drag` fallback in `camera_rig.gd` for Mac setups where middle mouse is unreliable.
- Updated the local runbook to document the fallback without restoring right-mouse orbit.

## Spiral Threshold Changes

- Reduced spiral arming thresholds in `gesture_recognizer.gd`:
  - shorter path requirement;
  - lower clockwise rotation requirement;
  - lower radius swing requirement.
- Extended the live gesture windows in `hand_input.gd` so arming and glyph completion tolerate slower human mouse motion.
- Added debug diagnostics for current trace length, armed state, and radius swing.
- Added headless tests for both clockwise inward and clockwise outward spirals.

## Shrine Fix

- Made offerings larger, brighter, and placed nearer the shrine.
- Increased shrine offer and learn radii.
- Added explicit reject pulse support in `shrine.gd` for failed shrine attempts.
- Verified the offering-awaken-teach-bolt path in the headless test.

## Temple Fix

- Added obvious left/right chamber markers in `temple_interior.gd`.
- Kept left, right, and exit hotspots explicit and headless-tested.
- Temple still stays HUD-free; interaction is carried by large placeholder geometry and markers.

## Exact Validation Outputs

### 1. `godot --version`

```text
4.7.stable.official.5b4e0cb0f
```

### 2. `cd /Users/andrew/Parable/godot-spike && ./verify.sh`

```text
== 1. Godot detection ==
  ok:   Godot 4.7.stable.official.5b4e0cb0f at /opt/homebrew/bin/godot

== 2. File presence ==
  ok:   project.godot
  ok:   run.sh
  ok:   verify.sh
  ok:   README_FOR_ANDREW.md
  ok:   scenes/Main.tscn
  ok:   scenes/TempleInterior.tscn
  ok:   scenes/objects/Villager.tscn
  ok:   scenes/objects/Rock.tscn
  ok:   scenes/objects/Tree.tscn
  ok:   scenes/objects/Offering.tscn
  ok:   tests/verify_headless.gd
  ok:   scripts/world.gd
  ok:   scripts/island.gd
  ok:   scripts/hand_input.gd
  ok:   scripts/hand_visual.gd
  ok:   scripts/camera_rig.gd
  ok:   scripts/grabbable.gd
  ok:   scripts/villager_proxy.gd
  ok:   scripts/rock_proxy.gd
  ok:   scripts/tree_proxy.gd
  ok:   scripts/offering_proxy.gd
  ok:   scripts/throw_sampler.gd
  ok:   scripts/gesture_recognizer.gd
  ok:   scripts/gesture_trace.gd
  ok:   scripts/shrine.gd
  ok:   scripts/temple_door.gd
  ok:   scripts/temple_interior.gd
  ok:   scripts/god_identity.gd
  ok:   scripts/witness_director.gd
  ok:   scripts/diagnostics.gd
  ok:   scripts/symbol_forms.gd
  ok:   scripts/symbol_choice.gd
  ok:   scripts/miracle_fx.gd

== 3. project.godot sanity ==
  ok:   main scene set
  ok:   input action: grab_action
  ok:   input action: pan_action
  ok:   input action: interact_action
  ok:   input action: camera_orbit
  ok:   input action: camera_zoom_in
  ok:   input action: camera_zoom_out
  ok:   input action: gesture_mode
  ok:   input action: cancel_action
  ok:   input action: toggle_diagnostics
  ok:   GodIdentity autoload

== 4. Headless import ==
  ok:   project imports cleanly

== 5. Headless smoke test (loads every script, checks structure) ==
  ok:   headless smoke test passed
  ok: symbol choices are visibly separated
  ok: bolt starts locked before shrine path
  ok: offering exists for shrine path
  ok: shrine awakens after offering
  ok: zigzag teaches at shrine after awakening
  ok: bolt becomes learned after shrine path
  ok: throw sampler: velocity math (got 10.00)
HEADLESS VERIFY: ALL CHECKS PASSED

== 6. Runbook cross-check ==
  ok:   runbook mentions: ./run.sh
  ok:   runbook mentions: Right mouse button
  ok:   runbook mentions: Left mouse button
  ok:   runbook mentions: Middle mouse button
  ok:   runbook mentions: Esc
  ok:   runbook mentions: F3
  ok:   runbook mentions: Scroll wheel

VERIFY RESULT: ALL CHECKS PASSED
(Headless only. Run ./run.sh to actually see and feel the spike.)
```

### 3. `cd /Users/andrew/Parable/godot-spike && ./run.sh --dry-run`

```text
godot binary : /opt/homebrew/bin/godot
version      : 4.7.stable.official.5b4e0cb0f
command      : /opt/homebrew/bin/godot --path /Users/andrew/Parable/godot-spike
```

### 4. `godot --headless --path /Users/andrew/Parable/godot-spike --quit-after 120`

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org
```

## What Remains Unverified By Tools

- Live on-screen island readability from Andrew’s actual launch window.
- Real middle-mouse behavior on Andrew’s Mac input hardware, beyond the new fallback.
- Real-world spiral arming success within three attempts.
- Live shrine readability and temple chamber comprehension under manual play.
- Hand feel itself. Andrew still judges that.

## Git Status Before Staging

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/gesture_recognizer.gd
 M godot-spike/scripts/grabbable.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/island.gd
 M godot-spike/scripts/offering_proxy.gd
 M godot-spike/scripts/rock_proxy.gd
 M godot-spike/scripts/shrine.gd
 M godot-spike/scripts/symbol_forms.gd
 M godot-spike/scripts/temple_interior.gd
 M godot-spike/scripts/world.gd
 M godot-spike/tests/verify_headless.gd
```

Protected file check at this boundary:

- no legacy `PROJECT_BIBLE`
- no PDF
- no `.DS_Store`
- no `docs/`
- no old root README touched

## Post-Commit / Push Note

Exact commit hash, push output, and final clean git status are reported in the terminal handoff after the final commit and push. They are not self-recorded here because doing so would re-dirty the repository after the final commit.

## Exact Command Andrew Runs Next

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```
