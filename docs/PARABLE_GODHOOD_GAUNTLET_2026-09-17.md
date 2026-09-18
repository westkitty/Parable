# Parable Godhood Gauntlet

**Date:** 2026-09-17
**Purpose:** One reusable human acceptance grammar for playable Parable milestones.
**Important:** This does **not** restore the obsolete single project-wide hand-feel blocker. It conforms to the 2026-08-21 rule: coherent playable milestones receive automated/rendered QA first, then one concise Andrew acceptance playtest.

## Journey ID

`PARABLE-GODHOOD-GAUNTLET-v1`

## Current milestone use

For M1, run only the **M1 Hand on the World** subset below.
M2 and later milestones append their own checkpoints to the same grammar.

## Prerequisites

- Repository: `/Users/andrew/Parable`
- Branch: `spike/godot-hand-feel-2026-07-02`
- Use current branch HEAD, not a historical hard-coded commit.
- Automated milestone verification should pass before human acceptance.
- Launch:
  `cd /Users/andrew/Parable/godot-spike && ./run.sh`
- Input modality: mouse + keyboard.
- F3 is allowed only as a diagnostic cross-check, never as required player guidance.

## Initial state

- Fresh spike launch.
- No object held.
- No gesture in progress.
- Default camera state.
- F3 off.
- Player begins in normal world view.

# M1 — Hand on the World

## G1 — Embodiment
**Action:** Move the mouse over terrain and around several objects for roughly ten seconds.
**Checkpoint:** Hand follows the world coherently and reads as embodied presence rather than a detached cursor.
**Record:** Yes / Almost / No + one sentence.

## G2 — Camera cooperation
**Action:** Pan with left-drag, orbit with middle-drag, zoom with wheel while keeping the Hand near a chosen object.
**Checkpoint:** Camera changes support manipulation; the Hand does not unexpectedly retarget or drift away because of camera operation.
**Record:** Yes / Almost / No.

## G3 — Rock acquisition
**Action:** Acquire a rock with RMB on first attempt. Release. Acquire a different nearby grabbable immediately afterward.
**Checkpoint:** pickup is intentional and A -> B acquisition remains reliable.
**Record:** Yes / Almost / No.

## G4 — Gentle placement
**Action:** Pick up a rock, move it, slow the Hand, release deliberately.
**Checkpoint:** object is set down rather than thrown.
**Record:** Yes / Almost / No + what your hand expected if it failed.

## G5 — Intentional throw
**Action:** Pick up the rock again. Perform one short lob and one harder throw toward chosen landing areas.
**Checkpoint:** velocity reads from deliberate motion; short and hard throws differ; direction is broadly predictable.
**Record:** Yes / Almost / No.

## G6 — Grip readability: rock
**Action:** Carry a rock at normal camera distance.
**Checkpoint:** rock reads as held from top/side, not embedded in the palm.
**Record:** Yes / Almost / No.

## G7 — Grip readability: villager
**Action:** Pick up a villager and carry them briefly.
**Checkpoint:** villager remains visible and dangles from the hand rather than being swallowed by it.
**Record:** Yes / Almost / No.

## G8 — Grip readability: offering
**Action:** Pick up a teal offering.
**Checkpoint:** offering remains readable and mostly upright while held.
**Record:** Yes / Almost / No.

## G9 — Grip readability: tree
**Action:** Pick up a tree.
**Checkpoint:** hand reads as gripping the trunk; canopy does not consume the hand.
**Record:** Yes / Almost / No.

## G10 — Safe cancel
**Action:** Hold an object, then press Escape. Start a gesture-like motion, then press Escape.
**Checkpoint:** state cancels safely without accidental throw/cast/stuck state.
**Record:** Yes / Almost / No.

## G11 — Gesture feel sampling
**Action:** Draw the currently implemented spiral and one current placeholder glyph only to judge physical gesture feel.
**Checkpoint:** tracing feels like a mark made by the Hand over a living world rather than drawing on an invisible dashboard.
**Important:** Do not treat current clockwise-only semantics, circle, zigzag, Blessing, or Bolt as production miracle authority.
**Record:** Yes / Almost / No.

## G12 — Witness response sampling
**Action:** Trigger one current visible divine effect or a harmless existing witness event.
**Checkpoint:** villagers visibly acknowledge the god's act without requiring a HUD explanation.
**Record:** Yes / Almost / No.

## M1 terminal oracle

M1 human acceptance can be recorded **PASS** when:
- G1–G10 are all Yes, or any Almost is explicitly accepted as non-blocking by Andrew;
- G11–G12 reveal no engine-level interaction failure that makes later production work unreasonable;
- Andrew answers **Yes** to:
  > "Subtract the placeholder ugliness: does operating this build feel sufficiently like being the god to keep building Parable in Godot?"

M1 is **PARTIAL** when Godot is viable but one bounded interaction defect should be repaired before advancing.

M1 is **FAIL** when the embodied interaction or engine friction is bad enough that further milestone expansion should stop pending a platform/implementation reassessment.

Only Andrew supplies the human verdict.

# M2 — The Offering (reserved extension)

When M1 is accepted, M2 should extend the Gauntlet rather than invent a separate review language.

Minimum M2 checkpoints:
- pick up offering;
- transport offering while camera remains cooperative;
- deliberately place offering at the shrine altar;
- offering placement is visually legible;
- shrine response is visible without F3;
- no accidental gesture/camera conflict occurs during the path;
- player understands that the offering changed shrine state.

Detailed M2 implementation/acceptance remains governed by the M2 milestone packet, not this document.

# Later milestone extension pattern

Every future milestone adds:
1. **Action** — what Andrew physically does.
2. **Checkpoint** — what must be visibly/kinetically true.
3. **Evidence** — human, rendered, automated, or mixed.
4. **Expectation gap** — for any Almost/No: what was attempted, what happened, what the Hand expected.
5. **Terminal oracle** — explicit PASS / PARTIAL / FAIL condition.

# Replay record template

```text
BUILD:
BRANCH:
HEAD:
DATE:

G1 Embodiment: Yes / Almost / No
G2 Camera cooperation: Yes / Almost / No
G3 Rock acquisition: Yes / Almost / No
G4 Gentle placement: Yes / Almost / No
G5 Intentional throw: Yes / Almost / No
G6 Rock grip: Yes / Almost / No
G7 Villager grip: Yes / Almost / No
G8 Offering grip: Yes / Almost / No
G9 Tree grip: Yes / Almost / No
G10 Safe cancel: Yes / Almost / No
G11 Gesture feel: Yes / Almost / No
G12 Witness response: Yes / Almost / No

GODHOOD QUESTION:
Yes / Almost / No

VERDICT:
PASS / PARTIAL / FAIL

EXPECTATION GAPS:
- action:
  observed:
  expected:
```
