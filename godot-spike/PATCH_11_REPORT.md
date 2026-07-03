# Patch 11 Report

## Files Changed

- `NEXT_PLAYTEST_PACKET.md`
- `PATCH_11_REPORT.md`
- `scripts/diagnostics.gd`
- `scripts/grabbable.gd`
- `scripts/hand_input.gd`
- `scripts/hand_visual.gd`
- `scripts/offering_proxy.gd`
- `scripts/rock_proxy.gd`
- `scripts/temple_interior.gd`
- `scripts/tree_proxy.gd`
- `scripts/villager_proxy.gd`
- `scripts/world.gd`
- `tests/verify_playability_surrogates.gd`

## Patch 10 Live Findings Addressed

- Rock no longer uses center/palm-storage semantics; its grip contact is on the top/front side so the rock body hangs below the contact point.
- Villager grip remains at the upper body/head area, with the root/body below the hand contact.
- Offering and tree use explicit visible-object grip contacts.
- F3 diagnostics now describe grip contacts directly instead of ambiguous socket/root data.
- Temple circle is now an intentionally labeled `CIRCLE` glyph under `GlyphChamber/CircleGlyphPedestal`.

## Grasp-Not-Storage Model Changes

- Every grabbable now exposes a `GripContact` node and a nested `HoldAnchor` compatibility node.
- Holding aligns object `GripContact` to the hand grip contact socket.
- The object root is expected to remain visibly offset from the hand contact.
- Tests now assert the body/root hangs below the contact instead of requiring root-to-socket storage alignment.

## Object-Side Grip Contact Changes

- Rock: top/front-side contact on the visible rock mesh.
- Villager: upper body/head contact.
- Offering: upper/mid totem contact.
- Tree: trunk contact.

## Hand-Side Grip Contact Changes

- Added `PalmCenter` to separate palm identity from grip contact semantics.
- Existing grip world helpers now represent the hand grip contact socket, not inventory/palm center storage.
- Profile-specific contact socket offsets keep the held object outside the palm volume.

## Per-Object Hold Pose Changes

- Rock: stronger cupped/pinch contact pose.
- Villager: smaller pinch/lift profile so body dangles.
- Offering: upright totem grip profile.
- Tree: narrower trunk-grip profile.
- Temporary grip cup geometry remains visible only while holding.

## Occlusion / Readability Changes

- Rock body remains below/front of contact instead of centered in the palm.
- Villager body remains below the hand contact.
- Offering and tree roots remain offset from hand contact so the object silhouette stays visible.
- No held-object recolor was added.

## F3 Marker / Diagnostic Changes

- F3 off: hold markers stay hidden.
- F3 on while holding: shows small grip/contact markers, a line, and text:
  - `HELD`
  - `PROFILE`
  - `GRIP DIST`
  - `ALIGNMENT`
- Diagnostics now say `hand grip contact`, `object grip contact`, and `grip-contact dist`.
- Markers are pooled and hidden, not created/destroyed per frame.

## Temple Weird-Circle Cleanup

- World gesture traces are cleared on temple entry.
- Hold debug visuals are hidden on temple entry.
- Circle glyph is smaller, labeled, and pedestal-bound in the GLYPHS chamber.
- Temple tests verify `SYMBOL`, `GLYPHS`, and `EXIT` remain visible.

## Camera Preservation Notes

- Camera code was not redesigned in Patch 11.
- Existing Patch 10 camera guardrails still pass:
  - empty left-drag pans;
  - scroll-step zoom changes distance;
  - plain clicks do not zoom;
  - right-click does not move camera;
  - held grip contact remains attached during camera movement.

## NEXT_PLAYTEST_PACKET Changes

- `NEXT_PLAYTEST_PACKET.md` now tells Andrew to test only the Patch 11 target areas:
  - camera pan/zoom preservation;
  - rock/villager/offering/tree visible grip readability;
  - throw/drop;
  - F3 marker gating/usefulness;
  - temple weird-circle cleanup.

## Tests Updated

- Every grabbable must expose `GripContact` and `HoldAnchor`.
- Every grabbable must have a hold profile.
- Held object `GripContact` must align to the hand grip contact.
- Object root must remain visibly offset from hand contact.
- Object body must hang below contact instead of being stored in palm.
- Grip cup geometry must appear only while holding.
- F3 markers must be hidden when diagnostics are off and visible when on.
- Temple circle glyph must be pedestal-bound and labeled.
- Gesture trace and hold markers must not leak into temple diagnostics.
- Patch 10 camera behavior remains covered.

## Validation Outputs

`git status --porcelain` before staging:

```text
 M godot-spike/NEXT_PLAYTEST_PACKET.md
 M godot-spike/scripts/diagnostics.gd
 M godot-spike/scripts/grabbable.gd
 M godot-spike/scripts/hand_input.gd
 M godot-spike/scripts/hand_visual.gd
 M godot-spike/scripts/offering_proxy.gd
 M godot-spike/scripts/rock_proxy.gd
 M godot-spike/scripts/temple_interior.gd
 M godot-spike/scripts/tree_proxy.gd
 M godot-spike/scripts/villager_proxy.gd
 M godot-spike/scripts/world.gd
 M godot-spike/tests/verify_playability_surrogates.gd
?? godot-spike/PATCH_11_REPORT.md
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
- Headless tests prove contact semantics and guardrails; they do not prove the perceived visual grasp in the live camera view.

## Git / Push Metadata

- Staged files: recorded in final handoff before commit.
- Commit hash: recorded in final handoff after commit.
- Push output: recorded in final handoff after push.
- Final git status: recorded in final handoff after push.
- Protected files stayed clean: no `PROJECT_BIBLE`, PDF, `.DS_Store`, root README, or `docs/` path appeared in protected-file checks.

## Andrew Runs Next

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```
