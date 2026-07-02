# PATCH 04 REPORT

## 1. Summary

Patch 04 turns more of the spike from "mouse-controlled object picker" into a readable divine-hand body:

- cursor hide call path added in the world boot path;
- hand tracking tightened so the hand snaps to the intended world point instead of lazily trailing;
- pickup targeting moved away from loose world-nearest behavior toward visually honest screen-space anchors;
- held objects now sit on explicit hand sockets and no longer change base color while held;
- throw release now considers the recent release window, not only one final frame;
- camera gained working Shift/Alt orbit fallbacks plus `R` reset and zoom-key fallbacks;
- gesture trail visibility and spiral/circle/zigzag forgiveness were increased;
- shrine offering intent is more obvious through placement preview and a larger drop zone;
- temple interior labeling is blunter and easier to read at a glance.

Automated checks still do not prove hand feel. Andrew's next play session remains the deciding test.

## 2. Files Changed

- `godot-spike/PATCH_04_REPORT.md`
- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/diagnostics.gd`
- `godot-spike/scripts/gesture_recognizer.gd`
- `godot-spike/scripts/gesture_trace.gd`
- `godot-spike/scripts/grabbable.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/scripts/hand_visual.gd`
- `godot-spike/scripts/offering_proxy.gd`
- `godot-spike/scripts/rock_proxy.gd`
- `godot-spike/scripts/shrine.gd`
- `godot-spike/scripts/temple_interior.gd`
- `godot-spike/scripts/throw_sampler.gd`
- `godot-spike/scripts/tree_proxy.gd`
- `godot-spike/scripts/villager_proxy.gd`
- `godot-spike/scripts/world.gd`
- `godot-spike/tests/verify_playability_surrogates.gd`
- `godot-spike/verify.sh`

## 3. Cursor Hiding / Hand-As-Pointer Changes

- `world.gd` now requests hidden mouse mode on world boot.
- `world.gd` restores visible mouse mode on exit.
- The automated surrogate suite now checks that the cursor-hide call path exists in the world boot path.

## 4. Hand Tracking / Float Reduction

- `hand_input.gd` now drives the hand body directly to the intended world target instead of visually lagging behind it.
- Hover and press heights were lowered so the hand feels closer to the world.
- Carry precision now uses the direct hand target instead of a more floaty smoothed body path.
- `hand_visual.gd` keeps finger-pose smoothing, but the hand body itself is now much more immediate.

## 5. Targeting / Pickup Alignment Changes

- `hand_input.gd` no longer falls back to broad nearest-object pickup when the ray misses.
- Pickup now prefers per-object screen-space hover anchors with tuned radius caps.
- `grabbable.gd` gained `pick_anchor_offset` and `hover_screen_radius`.
- Rock, villager, tree, and offering proxies now define class-specific visible pickup anchors.

## 6. Held-Object Socket Changes

- Held-object placement now uses the hand visual as the socket owner instead of vague nearby world offsets.
- Rock, villager, tree, and offering hold offsets were retuned to sit in or under the palm more honestly.
- `grabbable.gd` carry lag was increased for tighter attachment.
- Held-state object recoloring was removed; hover glow still exists, but holding no longer changes the object's base identity.

## 7. Throw Reliability Changes

- `throw_sampler.gd` window increased from `0.11s` to `0.22s`.
- `hand_input.gd` throw threshold lowered from `2.2` to `1.8`.
- Release now considers the recent peak movement window instead of depending only on the final sampled frame.
- Diagnostics now expose last throw vector and release speed.

## 8. Camera Control Changes

- `camera_rig.gd` supports:
  - middle mouse orbit;
  - Shift + left drag orbit fallback;
  - Option/Alt + left drag orbit fallback;
  - scroll zoom;
  - `=` / `+` and `-` zoom-key fallback;
  - `R` camera reset.
- Zoom pull was increased so zoom visibly moves toward the hand target more aggressively.
- Reset returns to the safe startup camera state.

## 9. Gesture Visibility / Spiral Changes

- `gesture_trace.gd` motes are brighter, larger, denser, and easier to see.
- `hand_visual.gd` now gives candidate tracking aura feedback before full arming.
- `gesture_recognizer.gd` thresholds were relaxed again:
  - smaller minimum size;
  - shorter minimum path lengths;
  - more forgiving circle closure/aspect/rotation bounds;
  - more forgiving zigzag height/length bounds;
  - more forgiving spiral rotation/radius swing;
  - sloppy clockwise curls can now arm.
- Miracle armed duration increased to `6.2s`.

## 10. Shrine / Offer Affordance Changes

- Offerings were moved nearer to the shrine in `world.gd`.
- Shrine offer radius increased from `4.0` to `5.4`.
- Shrine reject radius increased from `6.0` to `7.0`.
- Shrine learn radius increased from `8.0` to `9.0`.
- `shrine.gd` now shows a visible altar placement ring and `PLACE` label while an offering is carried near it.
- Shrine preview also brightens altar/glyph feedback before the actual drop.

## 11. Temple Readability Changes

- Temple chamber labels are now the blunt readable set:
  - `SYMBOL`
  - `GLYPHS`
  - `EXIT`
- Left and right hotspot sizes were increased.
- Existing chamber highlighting remains, but labels are now much harder to miss.

## 12. README Changes

- The runbook now reflects:
  - Shift + left drag orbit fallback;
  - Option/Alt + left drag orbit fallback;
  - `=` / `+` and `-` zoom fallback;
  - `R` camera reset;
  - F3 + Space debug arm fallback;
  - the specific F3 values Andrew should report when gesture handling breaks.

## 13. Tests Added / Updated

- `tests/verify_playability_surrogates.gd` now covers:
  - cursor-hide call path existence;
  - per-class pickup anchors;
  - pickup radius sanity;
  - per-class hold socket offsets;
  - no held-state recolor on base materials;
  - throw threshold edge behavior;
  - Shift/Alt orbit fallbacks;
  - camera reset;
  - generous shrine offer radius;
  - temple label presence.
- `verify.sh` runbook cross-check now verifies the updated fallback controls are documented.

## 14. Exact Validation Outputs

### `git status --porcelain` before staging

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/gesture_recognizer.gd
 M godot-spike/scripts/gesture_trace.gd
 M godot-spike/scripts/grabbable.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/hand_visual.gd
 M godot-spike/scripts/offering_proxy.gd
 M godot-spike/scripts/rock_proxy.gd
 M godot-spike/scripts/shrine.gd
 M godot-spike/scripts/temple_interior.gd
 M godot-spike/scripts/throw_sampler.gd
 M godot-spike/scripts/tree_proxy.gd
 M godot-spike/scripts/villager_proxy.gd
 M godot-spike/scripts/world.gd
 M godot-spike/tests/verify_playability_surrogates.gd
 M godot-spike/verify.sh
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
  ok: diagnostics expose release mode
  ok: diagnostics expose miracle armed state
  ok: diagnostics expose shrine reject reason
  ok: diagnostics expose offering distance
  ok: diagnostics expose temple chamber
  ok: diagnostics expose camera state
  ok: temple exposes SYMBOL label
  ok: temple exposes GLYPHS label
  ok: temple exposes EXIT label
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

### Added contract test command

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org

== Parable spike playability surrogate verify ==
  ok: cursor hide call path exists in world boot path
  ok: rock exists for hold surrogate
  ok: rock simulated grab succeeds
  ok: rock pick anchor offset configured
  ok: rock pickup radius is not absurdly large
  ok: rock hold socket differs from default
  ok: rock remains held across physics frames
  ok: rock owner state remains held
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
  ok: camera reset returns to safe default
  ok: tree exists for cancel surrogate
  ok: cancel surrogate grab succeeds
  ok: Esc surrogate clears held object
  ok: Esc surrogate uses gentle drop path
  ok: Esc surrogate clears miracle armed state
  ok: Esc surrogate clears miracle timer
  ok: Esc surrogate returns hand to hover state
  ok: shrine offering radius is generous
  ok: offering exists for gentle shrine contract
  ok: gentle shrine grab succeeds
  ok: gentle shrine placement awakens shrine
  ok: offering exists for hard-throw shrine rejection
  ok: hard-throw shrine grab succeeds
  ok: hard throw near altar does not awaken shrine
  ok: hard throw records explicit shrine reject reason
  ok: zigzag remains locked before shrine teaching
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
PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED
```

## 15. What Remains Unverified By Tools

- Whether macOS actually hides the cursor in Andrew's focused live window every time.
- Whether the new direct hand motion feels like a body part instead of a cursor.
- Whether the new orbit fallbacks are discoverable and comfortable on Andrew's exact Mac input hardware.
- Whether spiral/circle/zigzag now work in under three live attempts for an impatient tired human.
- Whether shrine purpose and temple labels are now obvious enough without explanation.

## 16. Git Status Before Staging

Recorded above in Section 14.

## 17. Exact Staged File List

```text
godot-spike/PATCH_04_REPORT.md
godot-spike/README_FOR_ANDREW.md
godot-spike/scripts/camera_rig.gd
godot-spike/scripts/diagnostics.gd
godot-spike/scripts/gesture_recognizer.gd
godot-spike/scripts/gesture_trace.gd
godot-spike/scripts/grabbable.gd
godot-spike/scripts/hand_input.gd
godot-spike/scripts/hand_visual.gd
godot-spike/scripts/offering_proxy.gd
godot-spike/scripts/rock_proxy.gd
godot-spike/scripts/shrine.gd
godot-spike/scripts/temple_interior.gd
godot-spike/scripts/throw_sampler.gd
godot-spike/scripts/tree_proxy.gd
godot-spike/scripts/villager_proxy.gd
godot-spike/scripts/world.gd
godot-spike/tests/verify_playability_surrogates.gd
godot-spike/verify.sh
```

Staged status before commit:

```text
M  godot-spike/PATCH_04_REPORT.md
M  godot-spike/README_FOR_ANDREW.md
M  godot-spike/scripts/camera_rig.gd
M  godot-spike/scripts/diagnostics.gd
M  godot-spike/scripts/gesture_recognizer.gd
M  godot-spike/scripts/gesture_trace.gd
M  godot-spike/scripts/grabbable.gd
M  godot-spike/scripts/hand_input.gd
M  godot-spike/scripts/hand_visual.gd
M  godot-spike/scripts/offering_proxy.gd
M  godot-spike/scripts/rock_proxy.gd
M  godot-spike/scripts/shrine.gd
M  godot-spike/scripts/temple_interior.gd
M  godot-spike/scripts/throw_sampler.gd
M  godot-spike/scripts/tree_proxy.gd
M  godot-spike/scripts/villager_proxy.gd
M  godot-spike/scripts/world.gd
M  godot-spike/tests/verify_playability_surrogates.gd
M  godot-spike/verify.sh
```

## 18. Commit Hash

Recorded in the terminal handoff after commit.

## 19. Push Output

Recorded in the terminal handoff after push.

## 20. Final Git Status

Recorded in the terminal handoff after push.

## 21. Proof Protected Files Were Not Staged / Committed / Pushed

- no root README changes
- no `docs/` changes
- no legacy `PROJECT_BIBLE` changes
- no PDF changes
- no `.DS_Store` changes

## 22. Exact Command Andrew Runs Next

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```
