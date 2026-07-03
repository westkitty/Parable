# Patch 10 Report

## Files Changed

- `README_FOR_ANDREW.md`
- `scripts/camera_rig.gd`
- `scripts/diagnostics.gd`
- `scripts/grabbable.gd`
- `scripts/hand_input.gd`
- `scripts/hand_visual.gd`
- `scripts/offering_proxy.gd`
- `scripts/rock_proxy.gd`
- `scripts/tree_proxy.gd`
- `scripts/villager_proxy.gd`
- `tests/verify_playability_surrogates.gd`
- `PATCH_10_REPORT.md`

## Live Video Findings Addressed

- Patch 09 still made visible held objects appear offset from the hand. Patch 10 aligns a visible `HoldAnchor`, not just the object root.
- Patch 09 camera behavior blocked live testing. Patch 10 makes empty left-drag pan screen-space only and increases bounded zoom/key fallback response.
- Patch 09 tests over-trusted root movement. Patch 10 tests anchor-to-socket distance and camera fallback behavior, while still not claiming to prove live feel.

## Visible Held-Object Anchor Fix

- Added a real `HoldAnchor` child node to every grabbable at runtime.
- Holding now aligns `HoldAnchor.global_position` to `HandVisual/GripSocket.global_position`.
- Removed the held-object floor clamp from carry alignment, because it could separate the visible object from the palm.
- Held object rotation is reset upright relative to the hand yaw while held so anchor math stays predictable.
- Carry alignment now runs after current-frame hand placement so camera movement does not leave a one-frame visible gap.

## Per-Object HoldAnchor Changes

- Rock: anchor placed near the visible rock center/top-center based on generated sphere radius.
- Villager: anchor placed at the upper body/head point.
- Offering: anchor placed at the upper/mid totem point.
- Tree: anchor placed on the trunk.

## Hand Pose / Readability Changes

- Added a temporary `GripCup` child under `HandVisual`, visible only while holding.
- Increased carry curl/spread values per hold profile so the hand reads as closed from the default camera.
- Did not recolor held objects.

## Camera Pan / Zoom Restoration

- Left drag on empty space now pans through screen-space delta only.
- Pan no longer depends on terrain raycast success.
- Scroll zoom uses a larger bounded step.
- `Q/E`, `W/S`, and `+/-` fallback rates were increased.
- Plain left/right clicks still do not zoom.
- Right mouse still does not move the camera.

## Focus Behavior Preservation

- Patch 08 focus helpers remain covered by the surrogate:
  - focus loss restores cursor visibility;
  - clears orbit/middle/right/carry/stale hover;
  - focus gain hides cursor when appropriate;
  - focus gain does not auto-grab or move the camera.

## Performance / Lag Notes

- Hover still uses the cached grabbables list.
- F3 hold markers are pooled and created once, not created/destroyed per frame.
- F3 marker updates happen only when diagnostics are visible and an object is held.
- Gesture trace remains bounded by the existing surrogate.

## Tests Updated

- Each grabbable must have a `HoldAnchor`.
- Holding aligns `HoldAnchor` to `GripSocket` under a strict distance threshold.
- F3 hold-debug marker path exists.
- Carry pose curl changes numerically while held.
- Empty left drag below threshold does not pan.
- Empty left drag beyond threshold pans via screen-space fallback.
- Scroll-step zoom changes camera distance target.
- Camera movement does not detach a held object from the socket.
- Existing Patch 08 right-click and focus constraints still pass.

## Validation Outputs

`git status --porcelain` before report creation:

```text
 M godot-spike/README_FOR_ANDREW.md
 M godot-spike/scripts/camera_rig.gd
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/grabbable.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/hand_visual.gd
 M godot-spike/scripts/offering_proxy.gd
 M godot-spike/scripts/rock_proxy.gd
 M godot-spike/scripts/tree_proxy.gd
 M godot-spike/scripts/villager_proxy.gd
 M godot-spike/tests/verify_playability_surrogates.gd
```

Protected-file check output:

```text
```

`godot --version`:

```text
4.7.stable.official.5b4e0cb0f
```

`cd /Users/andrew/Parable/godot-spike && ./verify.sh`:

```text
VERIFY RESULT: ALL CHECKS PASSED
(Headless only. Run ./run.sh to actually see and feel the spike.)
```

`cd /Users/andrew/Parable/godot-spike && ./run.sh --dry-run`:

```text
godot binary : /opt/homebrew/bin/godot
version      : 4.7.stable.official.5b4e0cb0f
command      : /opt/homebrew/bin/godot --path /Users/andrew/Parable/godot-spike
```

`godot --headless --path /Users/andrew/Parable/godot-spike --quit-after 120`:

```text
Godot Engine v4.7.stable.official.5b4e0cb0f - https://godotengine.org
```

Updated playability surrogate:

```text
PLAYABILITY SURROGATE VERIFY: ALL CHECKS PASSED
```

## Remaining Unverified Live Items

- Live hand feel has not passed until Andrew reruns the spike.
- Headless tests prove anchor/socket math, camera state changes, and preserved constraints; they do not prove the final camera feel or perceived visual readability in Andrew's live recording setup.

## Git Status / Staging / Push

- Staged files: recorded in final handoff before commit.
- Commit hash: recorded in final handoff after commit.
- Push output: recorded in final handoff after push.
- Final git status: recorded in final handoff after push.
- Protected files stayed clean: no `PROJECT_BIBLE`, PDF, `.DS_Store`, root README, or `docs/` path appeared in protected-file checks.

## Andrew Runs Next

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```
