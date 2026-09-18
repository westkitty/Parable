# Parable Godhood Contract

**Date:** 2026-09-17
**Status:** Controlling quality contract for protected godhood behavior
**Applies to:** `spike/godot-hand-feel-2026-07-02` and successor production work
**Current live baseline observed:** `9336c68`
**Authority note:** This contract does not supersede the 2026-08-21 milestone process rule. It converts protected Parable laws into inspectable proof obligations.

## Core law

> The player must feel present in the world as the god. The Divine Hand is the player's embodied interface, not a cursor decorating an RTS.

## Evidence labels

- **VERIFIED** — directly proven by current human or runtime evidence appropriate to the claim.
- **AGENT-VERIFIED** — automated/rendered evidence exists, but human-feel acceptance is still pending.
- **IMPLEMENTED-UNVERIFIED** — implementation exists without decisive acceptance evidence.
- **PENDING** — explicitly required but not yet implemented or tested.
- **SUPERSEDED** — replaced by a newer controlling decision.

## Godhood invariants

### GOD-001 — Player identity
**Capability:** Player identity is Divine Hand + chosen symbol.
**Scope:** Normal world play.
**Expected result:** No humanoid player avatar or creature proxy becomes the primary locus of control.
**Acceptable evidence:** rendered gameplay + human play.
**Current proof:** AGENT-VERIFIED / human acceptance pending.
**Recheck when:** camera, input, avatar, creature, or symbol systems change.

### GOD-002 — Direct godhood remains primary
**Capability:** The player acts directly on the world.
**Expected result:** Core actions do not require issuing unit orders through conventional RTS panels.
**Evidence:** human journey replay.
**Current proof:** AGENT-VERIFIED.
**Recheck when:** village control, automation, golems, or command UI changes.

### HAND-001 — Stable target acquisition
**Capability:** What the Hand intends to grab is stable and predictable.
**Expected result:** First-attempt pickup and rapid A -> B acquisition remain reliable.
**Evidence:** existing M1 surrogates + human play.
**Current proof:** human-verified on 2026-08-21 for the targeting repair; protected by M1 tests.
**Recheck when:** pick pose, hover, grip, camera, reach easing, collision, or targeting changes.

### HAND-002 — Hold / move / release grammar
**Capability:** Grabbing and throwing remain one physical interaction family.
**Expected result:** Holding carries, slow release places, fast release throws with momentum.
**Evidence:** runtime test + human play.
**Current proof:** AGENT-VERIFIED; final M1 acceptance pending.
**Recheck when:** grab, carry, release, throw sampler, physics, or input thresholds change.

### HAND-003 — Deliberate gentle placement
**Capability:** Player can intentionally set objects down rather than accidentally throw them.
**Expected result:** low-velocity release produces a controlled placement state.
**Evidence:** Godhood Gauntlet checkpoint.
**Current proof:** IMPLEMENTED-UNVERIFIED.
**Recheck when:** throw threshold, sampler, carried-object lag, or physics changes.

### HAND-004 — Deliberate throwing
**Capability:** Player can intentionally vary throw direction and strength.
**Expected result:** short lob and hard throw are distinguishable and broadly predictable.
**Evidence:** Godhood Gauntlet checkpoint.
**Current proof:** PARTIALLY VERIFIED; prior human evidence confirms throwing works, precision remains acceptance data.
**Recheck when:** throw sampler or carried-object motion changes.

### HAND-005 — Physical grip readability
**Capability:** Held things read as gripped, not stored inside the palm.
**Expected result:** rock top/side grip, villager dangle, offering readable/upright, tree trunk grip.
**Evidence:** rendered frames + human play.
**Current proof:** AGENT-VERIFIED; M1 human acceptance pending.
**Recheck when:** grip sockets, hand pose, object dimensions, camera, or animation changes.

### HAND-006 — Escape is safe
**Capability:** Escape safely releases/cancels current interaction.
**Expected result:** no accidental throw, cast, or stuck interaction state.
**Evidence:** automated contract + human spot check.
**Current proof:** AGENT-VERIFIED.
**Recheck when:** input state machine or miracle handling changes.

### CAM-001 — Camera serves the Hand
**Capability:** Pan/orbit/zoom support manipulation rather than competing with it.
**Expected result:** camera motion does not unexpectedly retarget, release, displace, or seed a gesture.
**Evidence:** M1 surrogates + Godhood Gauntlet.
**Current proof:** AGENT-VERIFIED; human acceptance pending.
**Recheck when:** camera or input routing changes.

### CAM-002 — Current-frame targeting remains independent from visual reach easing
**Capability:** visual hand reach may ease without feeding back into targeting.
**Expected result:** reaching toward a hovered object cannot cause target drift.
**Evidence:** M1 surrogate tests.
**Current proof:** VERIFIED by current source/test evidence.
**Recheck when:** pick pose, hover, reach easing, or camera projection changes.

### UI-001 — Minimal normal-world HUD
**Capability:** Normal world play remains free of persistent conventional HUD.
**Expected result:** no persistent spell hotbar, resource dashboard, objective list, stats panel, or menu chrome becomes required.
**Evidence:** rendered world view + UI inspection.
**Current proof:** VERIFIED in current spike presentation.
**Recheck when:** HUD, economy, tutorial, miracle, or progression UI changes.

### UI-002 — Major explicit interface belongs in the temple
**Capability:** settings/reference/state-heavy interfaces are contained diegetically.
**Expected result:** new explicit interfaces default to temple/world-space treatment, not overlay panels.
**Evidence:** design review + rendered user path.
**Current proof:** PENDING deeper temple milestone.
**Recheck when:** save/options/glyph/reference/stat systems are added.

### WITNESS-001 — Villagers witness divine action
**Capability:** Villagers visibly respond to meaningful divine acts.
**Expected result:** actions can produce gathering, prayer, fear, fleeing, bowing, symbol behavior, or other readable reactions.
**Evidence:** runtime + human play.
**Current proof:** IMPLEMENTED-UNVERIFIED at current simplified depth.
**Recheck when:** villager AI, miracle effects, fear/worship, or event routing changes.

### MIRACLE-001 — No primary spell-button casting
**Capability:** Production miracles are formed through the Hand.
**Expected result:** a spell toolbar is not the primary casting path.
**Evidence:** design + runtime.
**Current proof:** protected requirement; production miracle system PENDING.
**Recheck when:** miracle UX is implemented.

### MIRACLE-002 — Miracles become physically held
**Capability:** Production miracles have an embodied held state before release/use.
**Expected result:** family recognition creates a visible held miracle rather than instant toolbar-like firing.
**Evidence:** future Fire vertical slice.
**Current proof:** PENDING.
**Recheck when:** production miracle system changes.

### MIRACLE-003 — Miracle handling grammar
**Capability:** Universal spiral -> family symbol -> held miracle -> cast/upgrade; shake dissolves eligible held reserve.
**Expected result:** either spiral direction is accepted in production semantics; upgrade and refund remain embodied.
**Evidence:** future Fire/Water slice.
**Current proof:** PENDING.
**Recheck when:** gesture recognizer, worship reserve, held miracle, or family system changes.

### WORLD-001 — Consequence is world-readable
**Capability:** Divine action leaves readable physical/social consequence instead of relying on meters.
**Expected result:** terrain, weather, scorch, growth, symbols, fear, worship, restoration, or other world states communicate what happened.
**Evidence:** rendered gameplay.
**Current proof:** PARTIAL in prototype effects; production depth PENDING.
**Recheck when:** terrain/material/witness systems change.

### GOLEM-001 — Golems cannot cast miracles
**Capability:** Golems remain optional non-miracle embodied macros.
**Expected result:** delegated automation never becomes the source of divine power.
**Evidence:** design + future golem tests.
**Current proof:** protected requirement; system not yet implemented in current Godot production path.
**Recheck when:** golems return to implementation scope.

## Mandatory impact-radius rule

A change only needs to re-prove invariants it can plausibly affect. Do not rerun the entire project ritual for a bounded unrelated edit.

Any change touching `hand_input.gd`, `camera_rig.gd`, `grabbable.gd`, `hand_visual.gd`, the throw sampler, gesture recognizer, temple routing, villager witness routing, or production miracle handling must declare which invariant IDs are in its impact radius before implementation.

## Stop rule

A milestone cannot be called human-accepted while any mandatory human-feel invariant in its declared acceptance subset remains **No**, **Almost without bounded follow-up**, or **unplayed**.
