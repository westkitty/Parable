# Patch 05 Report

## Files Changed

- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/diagnostics.gd`
- `godot-spike/scripts/grabbable.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/scripts/hand_visual.gd`
- `godot-spike/scripts/shrine.gd`
- `godot-spike/scripts/temple_interior.gd`
- `godot-spike/scripts/world.gd`
- `godot-spike/tests/verify_playability_surrogates.gd`
- `godot-spike/PATCH_05_REPORT.md`

## What Changed

### Cursor Focus Handling Fix

- Centralized cursor policy in `world.gd`.
- Restores visible cursor on window focus loss and mouse exit.
- Re-hides cursor on focus regain and mouse enter.
- Keeps the same focused-gameplay cursor policy in temple flow.
- Adds F3 cursor policy reporting.

### Middle Mouse Orbit Fix

- `camera_rig.gd` now handles explicit middle-mouse press, release, and drag.
- Shift + left drag and Alt + left drag remain fallback paths only.
- Adds F3 reporting for camera mode, middle-button state, and orbit source.

### Grab Alignment Fix

- `hand_visual.gd` now exposes a real `GripSocket`.
- Hover selection now uses the grip socket screen projection instead of raw cursor position.
- `hand_input.gd` reports ray target, grip point, and hover anchor in F3 diagnostics.

### Held Object Socket Fix

- Held objects now follow the grip socket target continuously while carry state is active.
- Carry height is raised per held object so socketed objects clear the ground without floating beside the hand.
- Held-object follow is immediate instead of smoothed-lag carry drift.
- F3 now reports held-object hold offset and grip distance.
- Held-state recolor behavior remains disabled.

### Shrine Activation Fix

- Removed the `PLACE` text from the shrine.
- Shrine uses visual affordance only.
- Shrine activation remains signal-based but also has polling fallback for gentle offering release near the altar.
- Simulated gentle release now mirrors real carry-update order so shrine awaken tests reflect real runtime behavior.

### Spiral / Force-Arm Fix

- F3 + Space force-arm path now arms miracle mode through the normal arming helper.
- The debug arm path reports armed state in diagnostics and seeds visible trace feedback.
- Surrogate coverage now proves the force-arm path can set armed state.

### Temple Readability Fix

- Temple labels `SYMBOL`, `GLYPHS`, and `EXIT` are positioned for immediate readability.
- Left, right, and exit chamber affordances remain large and clickable.
- Temple flow no longer breaks cursor policy.

## Validation Outputs

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
  ok: diagnostics expose shrine reject reason
  ok: diagnostics expose offering distance
  ok: diagnostics expose temple chamber
  ok: diagnostics expose camera state
  ok: temple exposes SYMBOL label
  ok: temple exposes GLYPHS label
  ok: temple exposes EXIT label
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
  ok:   runbook mentions: R
  ok:   runbook mentions: Esc
  ok:   runbook mentions: F3
  ok:   runbook mentions: Scroll wheel

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

### `godot --headless --path /Users/andrew/Parable/godot-spike --script res://tests/verify_playability_surrogates.gd`

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org

== Parable spike playability surrogate verify ==
  ok: cursor hide call path exists in world boot path
  ok: cursor policy helper exists
  ok: cursor focus helper exists
  ok: camera middle-button helper exists
  ok: camera orbit-source helper exists
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
  ok: shift + left orbit fallback activates
  ok: alt + left orbit fallback activates
  ok: middle mouse explicit press is tracked
  ok: middle mouse is primary orbit source
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
  ok: awakened shrine teaches zigzag
  ok: zigzag teaching flips learned_bolt
  ok: learned zigzag casts away from shrine
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
  ok: temple exposes SYMBOL label
  ok: temple exposes GLYPHS label
  ok: temple exposes EXIT label
  ok: temple flow does not restore cursor policy
  ok: temple labels are camera-visible from center
PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED
```

## Remaining Unverified Live Items

- Actual hand feel remains unverified. Andrew still has to judge the live build.
- Cursor return behavior on physical mouse leave and app deactivation is covered by code path and diagnostics, but not by a live human playtest in this turn.
- Middle-mouse ergonomics on Andrew's exact hardware still need live confirmation.
- Spiral feel is improved and the debug force-arm path is verified, but sloppy human-gesture tolerance is still ultimately a live-judgment item.

## Git Status Before Staging

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/grabbable.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/hand_visual.gd
 M godot-spike/scripts/shrine.gd
 M godot-spike/scripts/temple_interior.gd
 M godot-spike/scripts/world.gd
 M godot-spike/tests/verify_playability_surrogates.gd
?? godot-spike/PATCH_05_REPORT.md
```

## Staged Files

```text
godot-spike/PATCH_05_REPORT.md
godot-spike/README_FOR_ANDREW.md
godot-spike/scripts/camera_rig.gd
godot-spike/scripts/diagnostics.gd
godot-spike/scripts/grabbable.gd
godot-spike/scripts/hand_input.gd
godot-spike/scripts/hand_visual.gd
godot-spike/scripts/shrine.gd
godot-spike/scripts/temple_interior.gd
godot-spike/scripts/world.gd
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
