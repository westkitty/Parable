# Patch 07 Report

## Files Changed

- `godot-spike/PATCH_07_REPORT.md`
- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/tests/verify_playability_surrogates.gd`

## Zoom / Click Regression Fix

- Removed the Patch 06 zoom-to-hand pull behavior.
- Restricted zoom to scroll wheel and explicit zoom keys only.
- Reduced per-input zoom step size substantially.
- Kept zoom smoothing target-based without runaway continuation after input release.
- Plain button clicks no longer change zoom.

## Pan Fix

- Reintroduced click-vs-drag separation with a larger drag threshold.
- Empty-ground left click now starts as `pending_pan` and only becomes pan after meaningful drag.
- Pan remains screen-space/ground-space based, but no longer starts immediately on click-down.
- Pan speed is now fixed and conservative instead of distance-scaled runaway motion.
- Camera pan bounds were widened so movement can pass the center instead of feeling trapped there.

## Orbit / Tilt Smoothing Fix

- Orbit and pitch now write into target yaw/pitch values.
- Camera process interpolates current yaw/pitch/distance toward those targets smoothly.
- Middle mouse orbit remains primary when hardware sends it.
- Shift/Alt left-drag fallback remains available.
- Q/E/W/S keyboard fallbacks remain, but now operate through slower target-based motion.

## Input Mode Separation

- Right-mouse grab clears pending pan/click state.
- Left-click empty ground does not immediately move the camera.
- Plain left click on interactables remains click-only.
- Orbit fallback and pan are separated by modifier state and drag threshold.
- Button clicks alone do not zoom.

## Performance / Lag Notes

- Patch 06 bounded gesture trace and F3-gated diagnostics remain intact.
- Patch 07 adds no new per-frame allocations to camera control.
- Camera smoothing is target-based and stops when input stops; no residual drift is intended.

## README Changes

- Added the explicit sentence: plain clicking should not move or zoom the camera.
- Softened camera wording to “slow orbit / slow pitch / slow zoom fallback”.

## Tests Updated

- Surrogate now checks:
  - plain mouse clicks do not zoom;
  - middle mouse orbit does not change zoom;
  - camera settles without residual pan/zoom drift;
  - existing held-object and debug-chain checks still pass.

## Validation Outputs

### `git status --porcelain` before staging

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/tests/verify_playability_surrogates.gd
?? godot-spike/PATCH_07_REPORT.md
```

### `godot --version`

```text
4.7.stable.official.5b4e0cb0f
```

### `cd /Users/andrew/Parable/godot-spike && ./verify.sh`

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
  ok:   tests/verify_contracts.gd
  ok:   tests/verify_playability_surrogates.gd
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

== 6. Contract verification ==
  ok:   contract verification passed
  ok: learned bolt zigzag casts away from shrine
  ok: temple symbol chamber hotspot exists
  ok: temple glyph chamber hotspot exists
  ok: temple exit exists
  ok: temple can focus symbol chamber
  ok: temple can focus glyph chamber
  ok: temple exit handler callable
CONTRACT VERIFY: ALL CHECKS PASSED

== 7. Playability surrogate verification ==
  ok:   playability surrogate verification passed
  ok: temple exposes SYMBOL label
  ok: temple exposes GLYPHS label
  ok: temple exposes EXIT label
  ok: temple exposes physical symbol chamber node
  ok: temple exposes physical glyph chamber node
  ok: temple exposes physical exit chamber node
  ok: gesture trace active motes stay bounded
  ok: temple flow does not restore cursor policy
  ok: temple labels are camera-visible from center
PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED

== 8. Runbook cross-check ==
  ok:   runbook mentions: ./run.sh
  ok:   runbook mentions: Right mouse button
  ok:   runbook mentions: Left mouse button
  ok:   runbook mentions: Middle mouse button
  ok:   runbook mentions: Shift + left drag
  ok:   runbook mentions: Option/Alt + left drag
  ok:   runbook mentions: Q / E
  ok:   runbook mentions: W / S
  ok:   runbook mentions: R
  ok:   runbook mentions: Esc
  ok:   runbook mentions: F3
  ok:   runbook mentions: Scroll wheel
  ok:   runbook mentions: Space
  ok:   runbook mentions: C
  ok:   runbook mentions: H
  ok:   runbook mentions: B
  ok:   runbook mentions: Z

VERIFY RESULT: ALL CHECKS PASSED
(Headless only. Run ./run.sh to actually see and feel the spike.)
```

### `cd /Users/andrew/Parable/godot-spike && ./run.sh --dry-run`

```text
godot binary : /opt/homebrew/bin/godot
version      : 4.7.stable.official.5b4e0cb0f
command      : /opt/homebrew/bin/godot --path /Users/andrew/Parable/godot-spike
```

### `godot --headless --path /Users/andrew/Parable/godot-spike --quit-after 120`

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org
```

### Updated Playability / Contract Test Command

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org

== Parable spike playability surrogate verify ==
  ok: cursor hide call path exists in world boot path
  ok: cursor policy helper exists
  ok: cursor focus helper exists
  ok: camera middle-button helper exists
  ok: camera orbit-source helper exists
  ok: gesture trace exposes bounded mote helper
  ok: rock exists for hold surrogate
  ok: rock simulated grab succeeds
  ok: rock pick anchor offset configured
  ok: rock pickup radius is not absurdly large
  ok: rock hold socket differs from default
  ok: rock remains held across physics frames
  ok: rock owner state remains held
  ok: rock held object stays near grip socket
  ok: rock held state does not recolor base material
  ok: rock gentle release records drop
  ok: rock gentle release flag stays true
  ok: rock gentle release clears hand state
  ok: rock regrab succeeds after gentle release
  ok: rock fast release records throw
  ok: rock throw records non-zero speed
  ok: tree exists for hold surrogate
  ok: tree simulated grab succeeds
  ok: tree pick anchor offset configured
  ok: tree pickup radius is not absurdly large
  ok: tree hold socket differs from default
  ok: tree remains held across physics frames
  ok: tree owner state remains held
  ok: tree held object stays near grip socket
  ok: tree held state does not recolor base material
  ok: tree gentle release records drop
  ok: tree gentle release flag stays true
  ok: tree gentle release clears hand state
  ok: tree regrab succeeds after gentle release
  ok: tree fast release records throw
  ok: tree throw records non-zero speed
  ok: offering exists for hold surrogate
  ok: offering simulated grab succeeds
  ok: offering pick anchor offset configured
  ok: offering pickup radius is not absurdly large
  ok: offering hold socket differs from default
  ok: offering remains held across physics frames
  ok: offering owner state remains held
  ok: offering held object stays near grip socket
  ok: offering held state does not recolor base material
  ok: offering gentle release records drop
  ok: offering gentle release flag stays true
  ok: offering gentle release clears hand state
  ok: offering regrab succeeds after gentle release
  ok: offering fast release records throw
  ok: offering throw records non-zero speed
  ok: rock exists for threshold edge checks
  ok: threshold test grab succeeds
  ok: release just below threshold stays gentle
  ok: threshold test regrab succeeds
  ok: release just above threshold throws
  ok: rock exists for camera surrogate
  ok: camera surrogate grab succeeds
  ok: camera pan changes rig position
  ok: camera orbit changes yaw
  ok: camera orbit changes pitch
  ok: camera zoom changes distance target
  ok: camera motion does not drop held object
  ok: camera motion does not corrupt held object state
  ok: plain mouse button clicks do not zoom
  ok: shift + left orbit fallback activates
  ok: alt + left orbit fallback activates
  ok: middle mouse explicit press is tracked
  ok: middle mouse is primary orbit source
  ok: middle mouse orbit does not change zoom
  ok: camera has no residual pan drift after input
  ok: camera has no residual zoom drift after input
  ok: camera reset returns to safe default
  ok: tree exists for cancel surrogate
  ok: cancel surrogate grab succeeds
  ok: Esc surrogate clears held object
  ok: Esc surrogate uses gentle drop path
  ok: Esc surrogate clears miracle armed state
  ok: Esc surrogate clears miracle timer
  ok: Esc surrogate returns hand to hover state
  ok: shrine offering radius is generous
  ok: shrine no longer exposes PLACE text
  ok: offering exists for gentle shrine contract
  ok: gentle shrine grab succeeds
  ok: gentle shrine placement awakens shrine
  ok: offering exists for hard-throw shrine rejection
  ok: hard-throw shrine grab succeeds
  ok: hard throw near altar does not awaken shrine
  ok: hard throw records explicit shrine reject reason
  ok: zigzag remains locked before shrine teaching
  ok: F3 + Space force-arm path can set armed state
  ok: debug arm records DEBUG_SPACE source
  ok: awakened shrine teaches zigzag
  ok: zigzag teaching flips learned_bolt
  ok: learned zigzag casts away from shrine
  ok: debug blessing fallback can cast
  ok: debug shrine fallback awakens shrine
  ok: debug bolt-learn fallback succeeds
  ok: debug bolt-cast fallback succeeds
  ok: world chamber label stays world-side before linking interior
  ok: world reports left temple chamber
  ok: world reports right temple chamber
  ok: diagnostics expose right mouse state
  ok: diagnostics expose release mode
  ok: diagnostics expose miracle armed state
  ok: diagnostics expose shrine reject reason
  ok: diagnostics expose offering distance
  ok: diagnostics expose temple chamber
  ok: diagnostics expose camera state
  ok: diagnostics expose pan state
  ok: diagnostics expose bolt learned state
  ok: temple exposes SYMBOL label
  ok: temple exposes GLYPHS label
  ok: temple exposes EXIT label
  ok: temple exposes physical symbol chamber node
  ok: temple exposes physical glyph chamber node
  ok: temple exposes physical exit chamber node
  ok: gesture trace active motes stay bounded
  ok: temple flow does not restore cursor policy
  ok: temple labels are camera-visible from center
PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED
```

## Remaining Unverified Live Items

- Andrew still has to judge real hand-feel and live camera feel.
- Middle mouse behavior on Andrew’s exact hardware remains a live verification item.
- Pan speed and orbit speed are headless-verified only here.
- The rest of the spike chain remains intentionally unclaimed until Andrew can test past the camera again.

## Git Status Before Staging

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/tests/verify_playability_surrogates.gd
?? godot-spike/PATCH_07_REPORT.md
```

## Staged Files

```text
godot-spike/PATCH_07_REPORT.md
godot-spike/README_FOR_ANDREW.md
godot-spike/scripts/camera_rig.gd
godot-spike/scripts/hand_input.gd
godot-spike/tests/verify_playability_surrogates.gd
```

## Commit Hash

```text
PENDING
```

## Push Output

```text
PENDING
```

## Final Git Status

```text
PENDING
```

## Protected Files Stayed Clean

`PENDING`

## Andrew Runs Next

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```
