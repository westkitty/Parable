# Patch 06 Report

## Files Changed

- `godot-spike/PATCH_06_REPORT.md`
- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/diagnostics.gd`
- `godot-spike/scripts/gesture_trace.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/scripts/hand_visual.gd`
- `godot-spike/scripts/offering_proxy.gd`
- `godot-spike/scripts/rock_proxy.gd`
- `godot-spike/scripts/shrine.gd`
- `godot-spike/scripts/temple_interior.gd`
- `godot-spike/scripts/tree_proxy.gd`
- `godot-spike/scripts/villager_proxy.gd`
- `godot-spike/tests/verify_playability_surrogates.gd`
- `godot-spike/verify.sh`

## Lag / Performance Changes

- Replaced per-point gesture trail node allocation with a bounded pooled trace.
- Added trace cap via `MAX_MOTES` and bounded stroke history via `MAX_STROKE_POINTS`.
- Removed shrine per-frame scan across all grabbables and replaced it with release-window fallback tracking for the most recent offering.
- Kept diagnostics work gated behind F3 visibility and added FPS / frame-ms readout there.
- Cached diagnostics and shrine references inside `hand_input.gd`.

## Camera / Pan / Orbit Changes

- Added explicit keyboard fallbacks:
  - `Q` / `E` orbit left / right
  - `W` / `S` pitch up / down
  - `=` / `+` and `-` zoom
  - `R` reset
- Kept middle mouse explicit orbit handling.
- Kept Shift + left drag and Alt + left drag orbit fallback handling.
- Reworked pan to use ground-delta pan when available and screen-delta fallback when terrain hit is unreliable.
- Added diagnostics for pan active state, pan source, and camera target.

## Hand / Socket Changes

- Added carry-time hold profiles in `hand_visual.gd`.
- Grip socket now shifts deeper into the palm depending on held class.
- Hold profiles enlarge the hand slightly while carrying to make enclosure more legible.
- Updated class hold offsets to place rock, offering, villager, and tree more honestly in the hand.

## Grab Alignment Changes

- Removed raw-mouse direct ray pickup as the hover truth.
- Hover and pickup now use the projected grip socket screen position.
- Removed the broad nearest-object fallback in the no-camera path.
- Right-click only grabs the currently highlighted object.

## Debug Miracle Path Changes

- F3-visible `Space` now arms miracle mode immediately and reliably for 10 seconds.
- Debug arm records `DEBUG_SPACE` as the arm source.
- Added visible debug arm burst through hand aura and gesture-trace ring flare.
- Added debug chain testers:
  - `C` cast blessing
  - `H` awaken shrine
  - `B` learn bolt
  - `Z` cast bolt

## Shrine Changes

- Kept `PLACE` removed.
- Added recent-offering fallback window instead of whole-scene polling.
- Added `debug_awaken()` path for F3 + `H`.
- Strengthened awakened-state visuals.

## Temple Process Changes

- Added physical chamber nodes:
  - `SymbolChamber`
  - `GlyphChamber`
  - `ExitChamber`
- Added visible chamber arches and floor rings.
- Added named pedestal nodes for symbol / glyph presentation.
- Kept temple labels, but no longer rely on labels alone.
- Added chamber scaling highlight on focus.

## README Changes

- Added camera keyboard fallback controls.
- Added short debug-chain section for F3 + `Space` / `C` / `H` / `B` / `Z`.

## Validation Outputs

### `git status --porcelain` before staging

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/gesture_trace.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/hand_visual.gd
 M godot-spike/scripts/offering_proxy.gd
 M godot-spike/scripts/rock_proxy.gd
 M godot-spike/scripts/shrine.gd
 M godot-spike/scripts/temple_interior.gd
 M godot-spike/scripts/tree_proxy.gd
 M godot-spike/scripts/villager_proxy.gd
 M godot-spike/tests/verify_playability_surrogates.gd
 M godot-spike/verify.sh
?? godot-spike/PATCH_06_REPORT.md
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

### Added / Updated Contract Test Command

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

- Andrew still has to judge actual hand feel.
- Camera feel on Andrew's exact hardware is still only headless-verified here.
- Middle mouse behavior on Andrew’s exact mouse/macOS path is still a live check.
- The new debug chain is verified as a test path, not as a statement that freehand gestures feel good.
- Temple readability is improved structurally, but still needs live human judgment.

## Git Status Before Staging

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/gesture_trace.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/hand_visual.gd
 M godot-spike/scripts/offering_proxy.gd
 M godot-spike/scripts/rock_proxy.gd
 M godot-spike/scripts/shrine.gd
 M godot-spike/scripts/temple_interior.gd
 M godot-spike/scripts/tree_proxy.gd
 M godot-spike/scripts/villager_proxy.gd
 M godot-spike/tests/verify_playability_surrogates.gd
 M godot-spike/verify.sh
?? godot-spike/PATCH_06_REPORT.md
```

## Staged Files

```text
godot-spike/PATCH_06_REPORT.md
godot-spike/README_FOR_ANDREW.md
godot-spike/scripts/camera_rig.gd
godot-spike/scripts/diagnostics.gd
godot-spike/scripts/gesture_trace.gd
godot-spike/scripts/hand_input.gd
godot-spike/scripts/hand_visual.gd
godot-spike/scripts/offering_proxy.gd
godot-spike/scripts/rock_proxy.gd
godot-spike/scripts/shrine.gd
godot-spike/scripts/temple_interior.gd
godot-spike/scripts/tree_proxy.gd
godot-spike/scripts/villager_proxy.gd
godot-spike/tests/verify_playability_surrogates.gd
godot-spike/verify.sh
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
