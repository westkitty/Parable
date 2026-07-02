# PATCH 01 REPORT

## Files Changed

- `godot-spike/PATCH_01_REPORT.md`
- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/project.godot`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/gesture_recognizer.gd`
- `godot-spike/scripts/gesture_trace.gd`
- `godot-spike/scripts/grabbable.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/scripts/hand_visual.gd`
- `godot-spike/scripts/island.gd`
- `godot-spike/scripts/offering_proxy.gd`
- `godot-spike/scripts/rock_proxy.gd`
- `godot-spike/scripts/tree_proxy.gd`
- `godot-spike/scripts/villager_proxy.gd`
- `godot-spike/scripts/world.gd`
- `godot-spike/tests/verify_headless.gd`
- `godot-spike/verify.sh`

## Patch Summary

- Rebound the hand-feel controls to Andrew's requested grammar:
  - right mouse = grab/carry/release
  - left mouse = pan or click-interact
  - middle mouse = orbit
  - scroll = zoom
  - Esc = safe cancel/drop
- Replaced Space-gated miracle casting with continuous spiral arming plus a second glyph stroke, while keeping Space as an optional fallback.
- Loosened circle and zigzag recognition and added explicit clockwise spiral detection.
- Raised visual legibility of the island, rocks, offerings, question text, and ritual symbol choices.
- Clamped held and gently released objects above terrain using per-object ground clearance.
- Added modest vertical lift to throws without removing mass-based differences.

## Tuning Changes

- `scripts/hand_input.gd`
  - `THROW_MIN_SPEED = 2.2`
  - `THROW_VERTICAL_LIFT = 2.35`
  - `MIRACLE_POINT_STEP_PX = 8.0`
  - `MIRACLE_IDLE_RESET = 0.42`
  - `MIRACLE_GLYPH_TIMEOUT = 2.4`
  - `MIRACLE_ARM_WINDOW = 1.8`
- `scripts/gesture_recognizer.gd`
  - `RESAMPLE_COUNT = 36`
  - `SPIRAL_RESAMPLE_COUNT = 40`
  - `MIN_POINTS = 6`
  - `MIN_SIZE_PX = 26.0`
  - `MIN_PATH_LENGTH_PX = 110.0`
  - `SPIRAL_MIN_PATH_LENGTH_PX = 150.0`
  - `SPIRAL_MIN_ROTATION = -4.5`
  - `SPIRAL_MIN_RADIUS_SWING = 0.18`
- `scripts/rock_proxy.gd`
  - `hold_offset = Vector3(0.0, -0.18, 0.0)`
  - `ground_clearance = 0.78`
  - rock radius range increased to `0.72 .. 0.96`
- `scripts/offering_proxy.gd`
  - `hold_offset = Vector3(0.0, 0.08, 0.0)`
  - `ground_clearance = 0.62`
  - offering body/collider size increased; teal emission raised to `2.0` idle and `3.4` on hover
- `scripts/tree_proxy.gd`
  - `hold_offset = Vector3(0.0, -0.95, 0.0)`
  - `ground_clearance = 1.28`
- `scripts/villager_proxy.gd`
  - `hold_offset = Vector3(0.0, -0.16, 0.0)`
  - `ground_clearance = 0.85`
  - `"Who are you?"` text enlarged

## Control Changes

- Move mouse: hand follows the world/raycast target.
- Right mouse button on grabbable: grab and carry.
- Release right mouse button: drop or throw based on release velocity.
- Left mouse button on ground and drag: pan.
- Left mouse button click: interact with temple doorway and symbol choices.
- Middle mouse button held and drag: orbit camera.
- Scroll wheel: zoom.
- Esc: safe release/cancel.
- F3: diagnostics.
- Space: optional fallback gesture assist only.

## Gesture Grammar Changes

- Normal miracle use no longer requires holding Space or holding a mouse button.
- Player must first draw a deliberate clockwise spiral with the hand.
- Spiral arms miracle mode and lights the hand/trace.
- After arming, player draws a learned glyph:
  - forgiving circle = blessing
  - forgiving zigzag = shrine-learned bolt
- Failed glyphs visibly dissolve.

## Exact Validation Outputs

### 1. Godot Version

Command:

```bash
godot --version
```

Output:

```text
4.7.stable.official.5b4e0cb0f
```

### 2. Headless Import

Command:

```bash
godot --headless --path /Users/andrew/Parable/godot-spike --import
```

Output:

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org

[   0% ] first_scan_filesystem | Started Project initialization (5 steps)
[   0% ] first_scan_filesystem | Scanning file structure...
[  16% ] first_scan_filesystem | Loading global class names...
[  33% ] first_scan_filesystem | Verifying GDExtensions...
[  50% ] first_scan_filesystem | Creating autoload scripts...
[  66% ] first_scan_filesystem | Initializing plugins...
[  83% ] first_scan_filesystem | Starting file scan...
[ DONE ] first_scan_filesystem

[   0% ] update_scripts_classes | Started Registering global classes... (3 steps)
[   0% ] update_scripts_classes |
[  25% ] update_scripts_classes |
[  50% ] update_scripts_classes |
[ DONE ] update_scripts_classes

[   0% ] loading_editor_layout | Started Loading editor (5 steps)
[   0% ] loading_editor_layout | Loading editor layout...
[  16% ] loading_editor_layout | Loading docks...
[ DONE ] loading_editor_layout
```

### 3. Script Syntax / Load Checks

Command:

```bash
godot --headless --path /Users/andrew/Parable/godot-spike --script res://tests/verify_headless.gd --check-only
```

Output:

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org
```

### 4. Headless Smoke Test

Command:

```bash
godot --headless --path /Users/andrew/Parable/godot-spike --script res://tests/verify_headless.gd
```

Output:

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org

== Parable spike headless verify ==
  ok: script loads: res://scripts/god_identity.gd
  ok: script loads: res://scripts/witness_director.gd
  ok: script loads: res://scripts/throw_sampler.gd
  ok: script loads: res://scripts/gesture_recognizer.gd
  ok: script loads: res://scripts/symbol_forms.gd
  ok: script loads: res://scripts/island.gd
  ok: script loads: res://scripts/grabbable.gd
  ok: script loads: res://scripts/villager_proxy.gd
  ok: script loads: res://scripts/rock_proxy.gd
  ok: script loads: res://scripts/tree_proxy.gd
  ok: script loads: res://scripts/offering_proxy.gd
  ok: script loads: res://scripts/camera_rig.gd
  ok: script loads: res://scripts/hand_input.gd
  ok: script loads: res://scripts/hand_visual.gd
  ok: script loads: res://scripts/gesture_trace.gd
  ok: script loads: res://scripts/shrine.gd
  ok: script loads: res://scripts/temple_door.gd
  ok: script loads: res://scripts/temple_interior.gd
  ok: script loads: res://scripts/symbol_choice.gd
  ok: script loads: res://scripts/world.gd
  ok: script loads: res://scripts/diagnostics.gd
  ok: script loads: res://scripts/miracle_fx.gd
  ok: input action defined: grab_action
  ok: input action defined: pan_action
  ok: input action defined: interact_action
  ok: input action defined: camera_orbit
  ok: input action defined: camera_zoom_in
  ok: input action defined: camera_zoom_out
  ok: input action defined: gesture_mode
  ok: input action defined: cancel_action
  ok: input action defined: toggle_diagnostics
  ok: identity: starter blessing learned
  ok: identity: bolt unlearned at start
  ok: identity: no symbol at start
  ok: Main.tscn loads
  ok: node exists: Island
  ok: node exists: CameraRig
  ok: node exists: DivineHand
  ok: node exists: Grabbables
  ok: node exists: Shrine
  ok: node exists: TempleDoorway
  ok: node exists: GestureTrace
  ok: node exists: DevDiagnostics
  ok: node exists: WitnessDirector
  ok: node exists: Sun
  ok: node exists: CameraRig/Pitch/Camera3D
  ok: node exists: DivineHand/HandVisual
  ok: grabbable is RigidBody3D: Villager
  ok: grabbable is RigidBody3D: @RigidBody3D@45
  ok: grabbable is RigidBody3D: @RigidBody3D@50
  ok: grabbable is RigidBody3D: @RigidBody3D@55
  ok: grabbable is RigidBody3D: @RigidBody3D@60
  ok: grabbable is RigidBody3D: @RigidBody3D@65
  ok: grabbable is RigidBody3D: @RigidBody3D@70
  ok: grabbable is RigidBody3D: @RigidBody3D@75
  ok: grabbable is RigidBody3D: Rock
  ok: grabbable is RigidBody3D: @RigidBody3D@82
  ok: grabbable is RigidBody3D: @RigidBody3D@85
  ok: grabbable is RigidBody3D: @RigidBody3D@88
  ok: grabbable is RigidBody3D: @RigidBody3D@91
  ok: grabbable is RigidBody3D: Tree
  ok: grabbable is RigidBody3D: @RigidBody3D@97
  ok: grabbable is RigidBody3D: @RigidBody3D@101
  ok: grabbable is RigidBody3D: @RigidBody3D@105
  ok: grabbable is RigidBody3D: Offering
  ok: grabbable is RigidBody3D: @RigidBody3D@113
  ok: grabbable class present: villager (x8)
  ok: grabbable class present: rock (x5)
  ok: grabbable class present: tree (x4)
  ok: grabbable class present: offering (x2)
  ok: island is NOT grabbable
  ok: shrine is NOT grabbable
  ok: temple doorway is NOT grabbable
  ok: grabbable clearance configured: villager
  ok: grabbable clearance configured: villager
  ok: grabbable clearance configured: villager
  ok: grabbable clearance configured: villager
  ok: grabbable clearance configured: villager
  ok: grabbable clearance configured: villager
  ok: grabbable clearance configured: villager
  ok: grabbable clearance configured: villager
  ok: grabbable clearance configured: rock
  ok: grabbable clearance configured: rock
  ok: grabbable clearance configured: rock
  ok: grabbable clearance configured: rock
  ok: grabbable clearance configured: rock
  ok: grabbable clearance configured: tree
  ok: grabbable clearance configured: tree
  ok: grabbable clearance configured: tree
  ok: grabbable clearance configured: tree
  ok: grabbable clearance configured: offering
  ok: grabbable clearance configured: offering
  ok: TempleInterior.tscn loads
  ok: temple interior has camera
  ok: recognizer: circle detected (got circle)
  ok: recognizer: zigzag detected (got zigzag)
  ok: recognizer: straight line rejected (got none)
  ok: recognizer: clockwise spiral arming detected (got spiral)
  ok: world script loads for ritual contract
  ok: starter blessing cast succeeds
  ok: starter blessing arms symbol ritual
  ok: bolt starts locked before shrine path
  ok: offering exists for shrine path
  ok: shrine awakens after offering
  ok: zigzag teaches at shrine after awakening
  ok: bolt becomes learned after shrine path
  ok: throw sampler: velocity math (got 10.00)
HEADLESS VERIFY: ALL CHECKS PASSED
(Structure only. Rendering, input feel, and godhood are Andrew's to judge.)
```

### 5. `./verify.sh`

Command:

```bash
./verify.sh
```

Output:

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
  ok: starter blessing arms symbol ritual
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

### 6. `./run.sh --dry-run`

Command:

```bash
./run.sh --dry-run
```

Output:

```text
godot binary : /opt/homebrew/bin/godot
version      : 4.7.stable.official.5b4e0cb0f
command      : /opt/homebrew/bin/godot --path /Users/andrew/Parable/godot-spike
```

### 7. Short Headless Game-Mode Run

Command:

```bash
godot --headless --path /Users/andrew/Parable/godot-spike --quit-after 120
```

Output:

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org
```

## What Remains Unverified By Tools

- Andrew's live hand-feel judgment.
- Actual on-screen island readability, object visibility, and temple chamber readability.
- Throw feel, drop feel, and visual hand alignment under interactive mouse control.
- Miracle arming clarity and forgiveness with real human mouse paths.
- Full temple proof and shrine path in a visible live window rather than headless logic checks.

## Exact Command Andrew Runs Next

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```

## Git Proof Before Staging

Command:

```bash
git status --porcelain
```

Output:

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/project.godot
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/gesture_recognizer.gd
 M godot-spike/scripts/gesture_trace.gd
 M godot-spike/scripts/grabbable.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/hand_visual.gd
 M godot-spike/scripts/island.gd
 M godot-spike/scripts/offering_proxy.gd
 M godot-spike/scripts/rock_proxy.gd
 M godot-spike/scripts/tree_proxy.gd
 M godot-spike/scripts/villager_proxy.gd
 M godot-spike/scripts/world.gd
 M godot-spike/tests/verify_headless.gd
 M godot-spike/verify.sh
?? godot-spike/PATCH_01_REPORT.md
```

Protected-file proof:

- No `PROJECT_BIBLE` file appears in the modified set.
- No PDF appears in the modified set.
- Nothing outside `godot-spike/` appears in the modified set.

## Staged-Set Proof Before Commit

Command:

```bash
git status --porcelain
```

Output after explicit-path staging:

```text
A  godot-spike/PATCH_01_REPORT.md
M  godot-spike/README_FOR_ANDREW.md
M  godot-spike/project.godot
M  godot-spike/scripts/camera_rig.gd
M  godot-spike/scripts/gesture_recognizer.gd
M  godot-spike/scripts/gesture_trace.gd
M  godot-spike/scripts/grabbable.gd
M  godot-spike/scripts/hand_input.gd
M  godot-spike/scripts/hand_visual.gd
M  godot-spike/scripts/island.gd
M  godot-spike/scripts/offering_proxy.gd
M  godot-spike/scripts/rock_proxy.gd
M  godot-spike/scripts/tree_proxy.gd
M  godot-spike/scripts/villager_proxy.gd
M  godot-spike/scripts/world.gd
M  godot-spike/tests/verify_headless.gd
M  godot-spike/verify.sh
```

## Push Proof

- No `git push` command was run during this patch session.
- This report was written before staging and commit; push status is therefore still local-only at this point.
