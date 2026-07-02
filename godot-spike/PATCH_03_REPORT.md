# PATCH 03 REPORT

## Files Changed

- `godot-spike/PATCH_03_REPORT.md`
- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/diagnostics.gd`
- `godot-spike/scripts/gesture_recognizer.gd`
- `godot-spike/scripts/grabbable.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/scripts/shrine.gd`
- `godot-spike/scripts/temple_interior.gd`
- `godot-spike/scripts/world.gd`
- `godot-spike/tests/verify_contracts.gd`
- `godot-spike/tests/verify_contracts.gd.uid`

## Contract Hardening Summary

- Made hold state explicit and durable so right-click carry behaves like a real hold instead of a brief toggle.
- Routed release behavior through object-level release contracts so gentle set-down and throw paths are distinguishable and testable.
- Made shrine offering intake depend on actual release mode and altar proximity, rejecting hard throws near the shrine instead of accidentally accepting them.
- Added a more forgiving spiral recognizer with a two-loop clockwise fallback, plus a debug arm fallback when diagnostics are visible.
- Added stronger diagnostics for hold state, release mode, miracle arm timer, loop estimate, shrine state, offering distance, and temple chamber focus.
- Added deterministic contract simulation coverage for grab, hold, drop, throw, shrine, glyph, and temple interaction paths.

## Interaction Notes

- Right mouse remains the grab/carry/release control.
- Middle mouse remains the orbit control.
- The runbook now tells Andrew to inspect F3 diagnostics if the interaction chain breaks.
- Debug fallback for miracle arming is `F3` then hold `Space`.

## Exact Validation Outputs

### 1. `git status --porcelain` before staging

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/gesture_recognizer.gd
 M godot-spike/scripts/grabbable.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/shrine.gd
 M godot-spike/scripts/temple_interior.gd
 M godot-spike/scripts/world.gd
?? godot-spike/tests/verify_contracts.gd
?? godot-spike/tests/verify_contracts.gd.uid
```

Protected file check at this boundary:

- no legacy `PROJECT_BIBLE`
- no PDF
- no `.DS_Store`
- no root README changes
- no `docs/` changes

### 2. `godot --version`

```text
4.7.stable.official.5b4e0cb0f
```

### 3. `cd /Users/andrew/Parable/godot-spike && ./verify.sh`

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

### 4. `cd /Users/andrew/Parable/godot-spike && ./run.sh --dry-run`

```text
godot binary : /opt/homebrew/bin/godot
version      : 4.7.stable.official.5b4e0cb0f
command      : /opt/homebrew/bin/godot --path /Users/andrew/Parable/godot-spike
```

### 5. `godot --headless --path /Users/andrew/Parable/godot-spike --quit-after 120`

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org
```

### 6. `godot --headless --path /Users/andrew/Parable/godot-spike --script res://tests/verify_contracts.gd`

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org

== Parable spike contract verify ==
  ok: rock exists
  ok: rock grab contract
  ok: rock remains held while simulated hold persists
  ok: rock release clears held object
  ok: rock gentle drop stays above terrain
  ok: rock regrab contract
  ok: high velocity release uses throw path
  ok: offering exists
  ok: offering grab contract
  ok: gentle offering near shrine awakens shrine
  ok: second offering grab contract
  ok: hard throw near shrine does not awaken
  ok: inward clockwise spiral accepted
  ok: outward clockwise spiral accepted
  ok: two-loop clockwise fallback accepted
  ok: random short movement rejected
  ok: counterclockwise loop rejected
  ok: debug arm sets miracle armed
  ok: armed circle uses blessing path
  ok: blessing triggers symbol ritual state
  ok: symbol ritual path remains callable
  ok: zigzag before shrine does not cast
  ok: awakened shrine zigzag teaches bolt
  ok: bolt learned after shrine path
  ok: learned bolt zigzag casts away from shrine
  ok: temple symbol chamber hotspot exists
  ok: temple glyph chamber hotspot exists
  ok: temple exit exists
  ok: temple can focus symbol chamber
  ok: temple can focus glyph chamber
  ok: temple exit handler callable
CONTRACT VERIFY: ALL CHECKS PASSED
```

## What Tools Still Do Not Prove

- Real hand feel in Andrew’s actual launch session.
- Real middle-mouse comfort on Andrew’s hardware.
- Whether Andrew personally finds the shrine and temple interaction obvious without diagnostics.

## Post-Commit Note

Exact staged file list, commit hash, push output, and final clean status are reported in the terminal handoff after commit and push. They are not self-recorded here because doing so would dirty the repository again after the final commit.

## Exact Command Andrew Runs Next

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```
