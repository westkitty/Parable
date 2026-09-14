# Next Playtest Packet — M1: Hands On The World

**Branch:** `spike/godot-hand-feel-2026-07-02`
**Build under test:** `9336c68` (M1 = `c5bc674`, preserved targeting checkpoint = `04b2f2c`)
**Gate:** this is the *only* human acceptance test for M1. Five items, nothing more.

Run:

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```

---

## What changed in M1 (so you know what you are looking at)

- **Panning was repaired.** Previously a left-click that began inside a
  grabbable's hover halo left the input state empty, and because the press
  event had already fired it could never recover into a pan for its whole
  duration. That is why dragging felt dead. Hover now decides only what the
  *right* button would grab; it no longer decides whether a left-button camera
  gesture is allowed to exist.
- **The hand now reaches.** Hovering eases the hand onto the object's own grip
  contact point instead of leaving it flat on the ground, so
  hover → reach → grip is a visible movement rather than a snap.
- **Grip sockets were re-biased downward** instead of forward. The old forward
  bias put the palm nearer the camera than the thing it held, which at normal
  world pitch rendered the hand *underneath* its own grip — the rock-on-top-of-hand
  defect.
- **The tree is now gripped low on the trunk.** A mid-trunk grip buried the
  whole hand inside the canopy.
- **Throw physics were deliberately not touched.** The throw sampler still reads
  the unsmoothed hand target, and the gentle-release / throw distinction is
  unchanged.

---

## Check only these five

### 1. Pan  ← the main M1 repair

- Left-drag across ordinary empty world space.
- **Then deliberately start a left-drag with the cursor on or right next to a
  rock**, and drag away from it.

Both should move the camera smoothly and continuously. Neither should dead-click,
freeze, or require a second click to "wake up" the camera. A short left-click
with no drag should *not* jerk the camera.

### 2. Rock  ← regression check (was HUMAN VERIFIED 2026-08-21)

Move directly from empty terrain onto a rock and press the right mouse button
**once**.

It should pick up on that first attempt, and it should *look* like the hand
reached for and took the rock — gripped from an upper/side contact, not sitting
on top of the palm, not swallowed inside it, not teleported.

### 3. A → B  ← regression check (was HUMAN VERIFIED 2026-08-21)

Move quickly from one grabbable to another and press the right button over the
second one.

The **second** object should be acquired — no stale first target.

### 4. Throw  ← regression check (was HUMAN VERIFIED 2026-08-21)

Flick a held object to throw it, and separately release one gently.

Throwing should still work and still feel distinct from a gentle set-down.

### 5. One representative other object

Pick up **one** of: villager, offering, or tree.

It should visibly read as *held* — outside the palm, correctly aligned, not
swallowed or sunk into the hand. A villager should still dangle and panic-shake
as before.

---

## Explicitly NOT part of this gate

Do not spend time on these during the M1 test. They are known, deliberately
deferred to M2+ and are recorded as such in
`PARABLE_PROJECT_RECOVERY_SOURCE_2026-08-18.md` §26:

- Altar / shrine offering progression.
- Temple functionality (`SYMBOL` / `GLYPHS` hotspots, missing ceiling, exit ring).
- Villager water outcome (thrown into the sea: currently left alive and submerged).
- Production miracle system.
- Hand scale at default camera distance and default camera framing — noted as an
  observation, not an M1 acceptance criterion.
- `F3` grip markers. Useful for diagnosing a contact problem, but not an M1
  check item. Leave the overlay off unless item 2 or 5 fails.

---

## How to report

For each of the five items, one line: **as expected** or **what actually
happened**. That is the whole report.

- If all five pass → M1 human acceptance is granted and **M2 — The Offering** begins.
- If any of items 1–5 is milestone-blocking → describe it and it will be repaired
  on this same branch, as one bounded pass, not as a new sequence of micro-patches.
