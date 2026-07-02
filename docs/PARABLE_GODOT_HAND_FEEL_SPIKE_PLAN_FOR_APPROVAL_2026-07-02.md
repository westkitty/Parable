# Parable Godot Hand-Feel Spike — Plan For Approval

Date: 2026-07-02
Status: **PLAN ONLY — awaiting Andrew's approval. No build has started.**
Author: Claude Fable 5
Repository: `westkitty/Parable` at `/Users/andrew/Parable`
Route: **Godot app-first hand-feel spike**

Sources read for this plan (all confirmed to exist):

- `docs/PARABLE_PROJECT_DESIGN_AND_PLAN_2026-07-02.md` (read from `audit/parable-refoundation-2026-07-02`; not present in local worktree)
- `docs/PARABLE_WORLD_FUNCTION_DOCTRINE_2026-07-02.md` (read from audit branch; not present in local worktree)
- `Parable_Bible.md` (read from audit branch: structure, Entries 4–8 in full)
- `docs/PROJECT_BIBLE.md` — **two conflicting versions exist.** The local untracked file is a 2021/2023 bible for a completely different Parable (a choose-your-own-adventure about the life of Christ). The tracked remote version describes the current Three.js prototype. Both were inspected.
- `docs/PARABLE_REPO_REALITY_AUDIT_2026-07-02.md`, `PARABLE_KEEP_REPLACE_TABLE_2026-07-02.md`, `PARABLE_PLATFORM_DECISION_PREP_2026-07-02.md`, `PARABLE_FABLE_INPUT_NOTES_2026-07-02.md` (local, read in full)
- Evidence-only inspection from the audit branch: `README.md`, `package.json`, `index.html`, `styles.css` (head), `src/main.js`, `src/runtime/main.part01/06/07.js.txt` in depth and first-lines of parts 02–12, `scripts/verify-parable.mjs`, `scripts/parable-turn-guard.mjs`.

Files that do **not** exist anywhere found: `docs/PARABLE_SALVAGED_TECHNICAL_PATTERNS_APPENDIX_2026-07-02.md`, `AGENTS.md`, `CLAUDE.md` (in repo), `tests/`. Not invented here.

Uncertainty markers used below: **[VERIFIED]** = directly checked this session. **[AUDIT]** = attested by the 2026-07-02 audit docs, not re-verified. **[UNCERTAIN]** = genuinely unknown until build or human review.

---

## 1. Executive Verdict

**Route: Godot app-first hand-feel spike.**

- The next proof is **not** browser/Three.js. The platform-decision prep ranked a browser spike first, but the human project owner has since chosen Godot app-first; per the uncertainty rules, the owner's July 2 decision governs.
- The old Three.js prototype on `origin/main` is **evidence only**. It proves a gesture-ritual island toy can exist in a browser. It has no divine hand, no grabbing, no throwing, no symbol, no temple, and a persistent HUD that violates doctrine. Nothing from its app shell or chunked runtime is carried forward as architecture.
- **Godot is not declared final forever.** Godot becomes the platform only if the human hand-feel review (Section 21) passes. If Godot fails for engine/friction reasons rather than implementation reasons, the browser spike route (already specced in the platform prep doc) remains alive with the same checklist.
- The spike exists to answer exactly one question: **can Godot make the player feel like the god through a mouse-first divine hand?** Everything in this plan is scoped to answering that and nothing else.

Materially relevant fact discovered while planning: **Godot 4.7 stable is already installed on this Mac** (`/Applications/Godot.app` and Homebrew cask `godot` at `/opt/homebrew/bin/godot`, version `4.7.stable.official`). **[VERIFIED]** This removes the biggest "will Andrew's machine even run it" risk before a single file is written.

---

## 2. Approval Gate

**No build happens until Andrew approves this plan.** After approval, a separate build prompt is created from the skeleton in Section 23; only then does Codex/Fable touch the repo.

**What Andrew is approving:**

1. The branch and directory plan (Section 6), including the one worktree-reconciliation action it requires: renaming the local 2021 `docs/PROJECT_BIBLE.md` to a preserved legacy filename so the branch can be checked out without overwriting it.
2. The spike scope: the eleven proof targets in Section 4 and the non-negotiables in Section 5.
3. The control grammar (Section 10, Candidate A recommended) and camera grammar (Section 11).
4. The scene/script architecture (Sections 8–9) as a spike-sized target, not production architecture.
5. The validation split and human review checklist (Sections 20–21) as the pass/fail instrument.
6. That Andrew's own role is limited to: run the launcher (or follow the click-by-click fallback), move the mouse, and fill in the review checklist.

**What can still change after approval without re-approval:**

- Exact placeholder meshes, colors, sizes, and numeric tuning values (grab radius, throw clamp, camera speeds).
- Internal script structure and node naming, as long as the scene responsibilities in Section 8 hold.
- Which of the two starter-glyph shapes maps to which placeholder miracle.
- Diagnostic layout and verifier internals.
- Anything marked "can decide during build" in Section 24.

**What must not change without a new approval:**

- The mouse-button ownership model (what LMB/RMB/scroll fundamentally do).
- Scope: no new systems, no extra miracles, no extra object classes, no campaign or opening cinematic.
- Any of the Section 5 non-negotiables.
- The branch/directory layout and the "old files are read-only evidence" rule.
- The decision gate logic in Section 22.

---

## 3. Beginner Constraint

Andrew has never touched Godot. The plan treats that as a hard requirement, not a footnote. The build contract will therefore require:

- **Godot detection on macOS** before anything else: check `/opt/homebrew/bin/godot`, `/Applications/Godot.app/Contents/MacOS/Godot`, `~/Applications/Godot.app`, and `command -v godot`. (Already satisfied on this machine — Godot 4.7 stable found **[VERIFIED]** — but the launcher must re-detect at run time rather than hardcode.)
- **Complete project setup by the agent**: `project.godot`, input map, main scene assignment, window size/title, renderer choice — all authored as text files. Godot scenes (`.tscn`), scripts (`.gd`), and project settings are plain text, so **every scene/script/node wiring can and must be done in files by Codex.** Andrew never opens the editor to attach a script, connect a signal, or configure an import.
- **Launcher script** `run.sh`: detects Godot, runs `godot --path <spike dir>` so the game launches directly into play — no editor, no import dialog, no scene picker.
- **Verifier script** `verify.sh`: headless checks (Section 20A) Andrew can run with one command if the launcher misbehaves.
- **Beginner README** (`README_FOR_ANDREW.md`, Section 19): one happy-path command, a click-by-click editor fallback with zero assumed Godot vocabulary, "what you should see," "what to try with the mouse," and "how to report what it felt like."
- **No manual wiring, ever.** If a step in the runbook would require Andrew to know what a "scene tree," "node," or "export preset" is, the build has failed the beginner constraint and must fix it in files instead.

Andrew's total intended interaction: `./run.sh` (or double-click fallback), mouse, checklist.

---

## 4. Spike Goal

The smallest Godot proof that answers:

> **"Can Parable make the player feel like a god through a mouse-first divine hand?"**

Eleven proof targets, and nothing more:

1. **Visible divine hand body** — a 3D hand model (placeholder mesh is fine; readable silhouette is mandatory) that floats over the island and follows the mouse via terrain raycast. Not a cursor skin: it has depth, tilt, and pose changes.
2. **Camera grammar** — pan, orbit, zoom that serve the hand instead of fighting it (Section 11).
3. **Hover / grip / carry / drop / throw** — one consistent interaction family across all grabbable classes (Sections 10, 12).
4. **Release velocity** — thrown objects inherit sampled hand momentum with mass scaling and clamping (Section 13).
5. **Gesture coexistence** — a deliberate gesture-draw mode that cannot be entered by accident and cannot cause accidental grabs (Section 14).
6. **Shrine boundary proof** — one shrine with a glyph motif and a trace-to-learn placeholder (Section 15).
7. **Temple boundary proof** — one clickable temple doorway, zoom/fade transition, static interior with two placeholder chambers, exit back to world (Section 15).
8. **Symbol identity stub** — a "Who are you?" moment, a three-symbol choice, and the symbol visibly appearing in the world and temple (Section 16).
9. **Villager witness stub** — a handful of villager proxies that notice, fear, flee, and pray (Section 17).
10. **No conventional HUD** — the world screen contains the world, the hand, and world-space feedback only.
11. **Open-and-run for Andrew** — launcher + runbook (Sections 3, 19).

If a proposed task during build does not serve one of these eleven, it is out of scope.

---

## 5. Non-Negotiable Constraints

- No persistent conventional HUD in the world view. No bars, counters, stat text, buttons, or panels.
- No spell hotbar, spell buttons, or miracle menu as a casting path.
- No creature system, no creature babysitting.
- No player avatar. Hand and symbol only.
- No campaign, opening cinematic, or birth-of-god sequence in this spike (the symbol stub in Section 16 is its only trace).
- No full miracle roster: exactly one starter placeholder and one shrine-learned placeholder. The old prototype's ten-miracle list does not migrate.
- No city-builder systems, resource economies, or build queues.
- No dashboard stats anywhere in normal play; diagnostics are dev-only and off by default (Section 18).
- No reuse of the old Three.js app shell, chunked runtime, HUD styling, or loader. Concepts may be referenced (Section 14); code is not ported.
- No golems in this spike. If a heavy inert mass is needed to test throw scaling, it is a "boulder," not a golem.
- No overwriting the local conflicting `docs/PROJECT_BIBLE.md`. It gets preserved under a new name (Section 6); its content is never modified.
- No full production architecture. No save system, no settings persistence, no plugin framework, no autoload lattice beyond the minimum the spike needs.

---

## 6. Proposed Branch And Directory Plan

**Repo reality [VERIFIED]:** the local worktree is an unborn `main` (zero commits) containing only untracked files: `.DS_Store`, `docs/` (four audit docs, the local 2021 `PROJECT_BIBLE.md`, and `Parable Project Design and Implementation Plan.pdf` — a 151 KB PDF that was **not** read this session and is assumed related to the July 2 plan **[UNCERTAIN]**). The full prototype lives on `origin/main` and on the local ref `audit/parable-refoundation-2026-07-02`, which has never been checked out.

**Branch:** `spike/godot-hand-feel-2026-07-02`, created from `audit/parable-refoundation-2026-07-02` (which equals `origin/main` **[AUDIT]**). Branching from it keeps the old prototype in-tree as evidence and keeps history linear with the audit.

**Worktree reconciliation (the only prerequisite surgery), in order:**

1. Rename local `docs/PROJECT_BIBLE.md` → `docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md` (rename, never delete — this is the 2021 choose-your-own-adventure bible and is user work).
2. Keep the PDF and local audit docs in place; verify local audit docs are byte-identical to the branch copies before checkout (diff them; if any differ, stop and report rather than overwrite).
3. `git checkout -b spike/godot-hand-feel-2026-07-02 audit/parable-refoundation-2026-07-02`. Git will now not collide with any untracked file. (If any other collision appears, stop and report — do not force.)
4. Commit the legacy-bible rename and this plan document as the branch's first commit.

**Directory:** all new Godot work lives in **`godot-spike/`** at the repo root, beside the old web prototype. The old prototype files remain untouched siblings.

```
/Users/andrew/Parable
├── (old prototype: index.html, styles.css, src/, scripts/ … READ-ONLY EVIDENCE)
├── docs/                          (existing docs + this plan; PROJECT_BIBLE files preserved)
└── godot-spike/                   (NEW — the entire spike)
    ├── project.godot
    ├── run.sh                     (launcher)
    ├── verify.sh                  (verifier entry)
    ├── README_FOR_ANDREW.md       (beginner runbook)
    ├── scenes/                    (Main.tscn, TempleInterior.tscn, object scenes)
    ├── scripts/                   (all .gd files)
    ├── assets/                    (placeholder meshes/materials, if any files needed at all)
    └── tests/                     (headless verify script(s))
```

**Read-only evidence (must not be edited):** `index.html`, `styles.css`, `src/`, `scripts/verify-parable.mjs`, `scripts/parable-turn-guard.mjs`, `package.json`, `README.md`, `Parable_Bible.md`, all existing `docs/*` including both PROJECT_BIBLE variants and the PDF.

**Must not be touched at all:** `docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md` (after the rename), `.git` internals, anything on `origin/main`.

**New files created only after approval:** everything under `godot-spike/`, plus (optionally, if Andrew wants it) a one-line pointer added to the repo README in a separate commit — flagged as an open question (Section 24), default is *don't touch README*.

---

## 7. Recommended Godot Version And Detection Plan

- **Preferred version: Godot 4.x, standard build (GDScript, not .NET).** Concretely: **Godot 4.7 stable, which is already installed** at `/Applications/Godot.app` (Homebrew cask; CLI shim at `/opt/homebrew/bin/godot`, reports `4.7.stable.official.5b4e0cb0f`). **[VERIFIED]** The spike targets "Godot 4.4+" semantics so a later 4.x upgrade doesn't break it; it must not use 3.x tutorials/APIs.
- **Renderer:** Forward+ (the macOS default) — fine on Apple Silicon; no reason to fight defaults in a spike. **[UNCERTAIN whether Metal/Vulkan-via-MoltenVK quirks appear on macOS 26.5; the smoke test in Section 20 checks this.]**
- **What the launcher/verifier must check, in order:** `command -v godot` → `/opt/homebrew/bin/godot` → `/Applications/Godot.app/Contents/MacOS/Godot` → `~/Applications/Godot.app/Contents/MacOS/Godot`. First hit wins; verify `--version` reports 4.x; refuse politely with instructions if only 3.x is found.
- **If Godot is not installed** (not the case today, but machines change): the launcher prints exactly one suggested command — `brew install --cask godot` — and a link to godotengine.org downloads. **Suggest and document only; never auto-install.** Installing software is Andrew's call.
- **What must wait for Andrew confirmation:** any Godot version change (e.g., cask upgrade), any .NET/Mono variant, any editor plugin/addon installation, and any export-template download (not needed for this spike — we run from project files, we do not export a .app).

---

## 8. Proposed Godot Scene Architecture

Plain-English gloss for Andrew: a Godot "scene" is a saved tree of objects ("nodes"); the game runs one main scene. All of the below is authored as text files by the build agent.

**`scenes/Main.tscn` — the world scene (the main scene the project boots into):**

| Node | Responsibility | Must NOT do | Why it exists in the spike |
|---|---|---|---|
| `World` (root, Node3D) | Owns the frame: lighting, environment, wiring child systems together via one small `world.gd` | No gameplay logic, no UI | Something has to be the root; keeping it dumb prevents a god-object |
| `Island` (StaticBody3D + mesh) | One gently sculpted mound/plane with collision; the raycast target for hand position and pan | No procedural generation systems, no biomes, no regions | The hand needs ground to live over; sculpted enough to prove the hand reads height |
| `CameraRig` (Node3D pivot → pitch Node3D → Camera3D) | Pan/orbit/zoom grammar (Section 11); owns "camera mode" state | Never move because of hand-over-object events; no cinematic system | Camera feel is half of hand feel |
| `DivineHand` (Node3D + hand mesh) | The player's body: raycast-follow, pose states (open/point/grip/carry/draw), grab logic, throw sampling | No HUD, no text, no miracle effects logic | The core of the entire proof |
| `Grabbables` (Node3D parent) | Groups all grabbable instances; single place the hand queries | No behavior of its own | Keeps "what is grabbable" one explicit list, per doctrine |
| — `VillagerProxy` ×6–10 (CharacterBody3D) | Wander, witness reactions, symbol moment (Section 17) | No jobs, needs, resources, or AI beyond the witness stub | Villagers are why godhood feels witnessed |
| — `RockProxy` ×4–6 (RigidBody3D) | Medium-mass throwable | Nothing else | The baseline physical object |
| — `TreeProxy` ×3–4 (RigidBody3D, anchored until grabbed) | Heavy-mass grabbable that uproots | No forestry/resource logic | Proves mass classes feel different |
| — `ShrineOffering` ×2 (RigidBody3D, small totem) | Light sacred object; can be carried to the shrine | No inventory/quest logic | Proves "carry a meaningful thing somewhere" |
| `Shrine` (StaticBody3D + glyph motif) | Displays a dormant glyph; awakens; accepts glyph tracing to "learn" the second miracle (Section 15) | No puzzle system, no lore | The learning-loop boundary proof |
| `TempleDoorway` (Area3D click target on a simple temple facade) | Click → zoom/fade → temple scene | No interior geometry in the world scene | The UI-lives-in-the-temple boundary proof |
| `GestureTrace` (Node3D, line/ribbon drawer) | Renders the luminous trail while drawing; feeds points to the recognizer | No recognition logic itself | Gesture must look sacred, and drawing must be visible |
| `DevDiagnostics` (CanvasLayer, hidden) | F3-toggled dev text overlay (Section 18) | Never visible by default; never styled as game UI | We need numbers during tuning without violating doctrine |
| `WitnessDirector` (Node) | Broadcasts events (grab/throw/miracle/symbol) to villagers | No scripting/cutscene system | One cheap event bus instead of villagers polling everything |

**`scenes/TempleInterior.tscn` — separate static scene:**

| Node | Responsibility | Must NOT do | Why |
|---|---|---|---|
| `TempleInterior` (root) | Static interior; fade-in from black; look-left/look-right/center framing | No free-roam movement | Doctrine: temple is a sacred hub, not a walking sim |
| `SymbolChamber` (left) | Shows the three candidate symbols pre-choice; shows the chosen symbol post-choice | No hand customization, no settings | Identity chamber placeholder |
| `GlyphChamber` (right) | Shows the starter glyph and (once learned) the shrine glyph | No upgrade tiers, no records system | Miracle/glyph chamber placeholder |
| `ExitDoor` (center) | Click → fade → back to world exactly where you left | No save/options chambers in this spike | Entry must be reversible or it feels like a trap |

Transition between the two scenes is a fade-through-black scene swap (or sub-viewport swap — build-time choice; behavior is what's contracted).

---

## 9. Proposed Script / Module Layout

All GDScript, all under `godot-spike/scripts/`. Spike-sized: each file should stay small; if one grows past a few hundred lines, it's overbuilding.

| Script | Owns |
|---|---|
| `world.gd` | Scene wiring, world↔temple transition requests |
| `hand_input.gd` | **The input state machine (Section 10).** Single source of truth for hand state; emits signals (`grabbed`, `released`, `threw`, `gesture_started`, …) |
| `hand_visual.gd` | Hand mesh pose/tilt per state; hover highlight driving |
| `camera_rig.gd` | Pan/orbit/zoom, focus ease, per-state movement damping (Section 11) |
| `grabbable.gd` | Base class: mass category, hover feedback, freeze-while-held, release/throw handoff (Section 12) |
| `villager_proxy.gd` | extends grabbable; witness behavior state machine (Section 17) |
| `throw_sampler.gd` | Pointer/hand velocity ring buffer, smoothing, mass scaling, clamps (Section 13) |
| `gesture_recognizer.gd` | Deterministic geometric recognizer for two glyphs (Section 14) |
| `gesture_trace.gd` | Trail rendering only |
| `shrine.gd` | Dormant/awakened glyph state; trace-to-learn handshake (Section 15) |
| `temple_door.gd` / `temple_interior.gd` | Doorway click, zoom/fade, interior look-navigation, exit (Section 15) |
| `god_identity.gd` (small autoload) | Chosen symbol + learned-miracle flags — the only global state |
| `witness_director.gd` | Event fan-out to villagers |
| `diagnostics.gd` | Dev overlay (Section 18) |
| `tests/verify_headless.gd` | Headless assertions for `verify.sh` (Section 20) |
| `run.sh`, `verify.sh` | Detection + launch; detection + headless checks |

Explicitly absent, on purpose: save system, settings, audio manager, miracle framework, villager needs, terrain editing, symbol propagation system (one painted decal is the stub), any autoload beyond `god_identity.gd`.

---

## 10. Mouse / Hand Control Grammar

Two candidate mappings; **Candidate A is recommended.**

**Candidate A (recommended — "the hand owns the left button, B&W-style"):** LMB is always *the hand acting on the world* — grab objects, or grip-and-drag the ground to pan. RMB-drag orbits. Scroll zooms. Gesture drawing is a deliberate held-key mode (hold **Space**) so sacred drawing can never be triggered by accident. Rationale: one button = one bodily meaning ("my hand touches the world"), which is the strongest possible embodiment signal, and it matches the remembered Black & White grammar of grabbing the land to move.

**Candidate B (alternative):** LMB grabs objects only; MMB-drag (or LMB on empty terrain) pans; RMB-drag draws gestures; orbit on RMB+modifier. Rejected as default because RMB-gesture makes accidental sacred scribbles easy, MMB is miserable on many mice/trackpads, and it splits "hand touches world" across buttons.

Candidate A state table (input action names are the Godot input-map entries the build must define):

| State | Trigger | Input action | Hand pose | Target rules | Failure behavior | Visual feedback | Must NOT happen |
|---|---|---|---|---|---|---|---|
| **Hover / indicate** | Mouse moves; ray hits a grabbable | (passive) | Open hand, fingers slightly spread, drifts over terrain height | Nearest grabbable within pick radius (~0.6 hand-widths) | Nothing hovered → plain open hand | Soft rim-glow on object; hand lowers toward it; subtle finger curl | No tooltips, no text, no outline spam on non-grabbables |
| **Click / engage (ground)** | LMB press over terrain | `hand_press` | Palm flattens toward ground | Terrain only | — | Slight ground-contact dip | Camera must not jump |
| **Pan (ground grip)** | LMB held over terrain + mouse move | `hand_press` + motion | Gripping the world | Terrain | — | World drags under the hand; hand stays planted at grab point | No orbit, no zoom, no accidental object grab mid-pan |
| **Hold / grip (object)** | LMB press while hovering a grabbable | `hand_press` | Grip pose closes around object | The hovered grabbable only | Press on non-grabbable ground → pan instead; press on non-grabbable prop → brief "no-purchase" hand flex, nothing else | Object lifts slightly; glow warms; grip sound later | Never grab through terrain; never grab two things |
| **Drag / carry** | Mouse move while gripping | (held) | Carry pose; object hangs beneath palm | Held object follows hand with slight lag/sway | — | Faint shadow under object; villagers react (Sec. 17) | Object must not clip wildly or jitter |
| **Release / drop** | LMB release, hand velocity below throw threshold | release of `hand_press` | Opens | Held object | — | Object falls with gravity from hand height | No teleport-to-ground |
| **Throw** | LMB release, hand velocity above threshold | release of `hand_press` | Follow-through splay | Held object inherits sampled velocity (Sec. 13) | — | Arc, tumble, landing puff; villagers flee | No absurd launches (clamped) |
| **Orbit** | RMB held + mouse move | `camera_orbit` | Hand eases to screen-rest, semi-relaxed | Camera only | — | World rotates around focus | Hand must not grab anything while orbiting |
| **Zoom** | Scroll wheel | `camera_zoom_in/out` | Unchanged | Camera dolly toward/away from focus/hand point | Clamped min/max | Smooth eased steps | No FOV zoom; no clipping under terrain |
| **Gesture draw mode** | Hold **Space** | `gesture_mode` | Point pose, index extended, hand rises to draw plane | LMB while held draws; no grabbing possible in this mode | Releasing Space mid-stroke cancels cleanly, trace dissolves | Luminous trace ribbon; low vignette/hum to mark sacred mode | Entering must be impossible by accident; grabs must be impossible inside it |
| **Cancel / safe release** | **Esc** at any time | `cancel_action` | Returns to open hover | Drops held object gently (zero velocity), aborts gesture, exits any pending mode | — | Trace/glow fades | Esc must never throw, never open a menu |
| **Temple entry** | LMB click on temple doorway | `hand_press` on doorway Area3D | Reaching-forward pose during zoom | Doorway only; disabled while carrying (must drop first — flagged open question, Sec. 24) | Click while carrying → doorway pulses, nothing happens | Camera zoom + fade (Sec. 11) | Must not trigger from a stray click during pan; require click-release on doorway with minimal drag distance |

Conflict resolution built into A: object-vs-ground on LMB is decided by the hover target at press time (object wins); pan vs. grab is therefore unambiguous. Orbit is a different button entirely. Gesture is a different mode entirely. The remaining ambiguity (click-on-doorway vs. start-of-pan) is resolved by a drag-distance threshold: a press that moves more than a few pixels is a pan, a clean click is an interaction.

---

## 11. Camera Grammar

- **Default angle:** ~35–45° pitch looking down at the island, close enough that villagers read as beings, far enough that the island reads as a miniature world. Initial framing shows village + shrine + temple doorway.
- **Pan:** LMB ground-grip drag (Candidate A). The point grabbed under the hand stays under the hand — "pull the world," not "push a scroll view." Slight inertial glide on release, short and heavily damped.
- **Orbit:** RMB-drag rotates around the current focus point (the terrain point at screen center). Pitch clamped (~15°–80°) to prevent under-terrain and straight-down disorientation.
- **Zoom:** scroll dollies toward/away from the terrain point under the hand (zoom-to-hand, not zoom-to-center). Clamped both ends; eased.
- **Focus:** no auto-focus system in the spike. The camera moves only when the player moves it — with the two scripted exceptions below.
- **Camera/hand conflict prevention:** camera input and hand input never share a button+context. While a hand interaction is active (grip/carry/gesture), pan-by-ground-grip is unavailable by construction (LMB is busy).
- **During grabbing/carrying:** orbit and zoom remain live but with reduced sensitivity (~60%) so carrying feels weighty and precise; no edge-of-screen auto-pan in the spike.
- **During gesture drawing:** camera fully locks. A sacred drawing surface must not slide mid-stroke.
- **Temple doorway transition (scripted exception 1):** click → input locks → camera eases toward the doorway over ~1.2 s → fade to black ~0.4 s → temple interior fades in. Exit (scripted exception 2) reverses: fade out → world exactly as left, camera pulled back to a sane framing near the temple.

Pass condition (feeds Section 21): Andrew can keep the hand near a target while orbiting around it without thinking about the controls.

---

## 12. Grabbable Object Model

| Class | Grabbable | Mass category | Collider | Hover feedback | Held behavior | Release | Throw | Collision/damage placeholder | Cruelty feedback |
|---|---|---|---|---|---|---|---|---|---|
| **VillagerProxy** | Yes | Light | Capsule | Warm glow; villager looks up at hand, freezes | Dangles, squirms gently; nearby villagers react fearfully | Set down gently below a soft height/speed → lands, staggers, resumes | Full momentum; tumbles on flight | On hard landing: knocked flat several seconds, fear burst in others; **no death/gore/health in spike** | **Yes — the special case.** Pre-throw: audible whimper + distinct squirm the moment hand velocity gets throw-fast while holding a villager, so the player always knows they're about to hurl a person. Feedback makes cruelty *legible*, never blocks it |
| **RockProxy** | Yes | Medium | Sphere/box | Neutral glow | Inert, slight sway | Drops, may roll | The baseline satisfying throw; thud + dust puff | Bounces; no destruction system | n/a |
| **TreeProxy** | Yes | Heavy | Cylinder | Glow + root-strain shimmer | Uproots with brief resistance pop; hangs heavy, pronounced lag | Falls over rather than landing upright | Slow, short, weighty arc; heavy ground hit | Stays where it lands (no replanting) | n/a |
| **ShrineOffering** | Yes | Light | Small box | Sacred-tinted glow (reads different from villagers/rocks) | Steady, reverent — minimal sway | Gentle placement; snaps softly if released very near the shrine | Can be thrown (it's physical) but shrine-snap only on gentle placement | Simple bounce | n/a |

**Not grabbable (and must clearly refuse):** terrain, the shrine structure, the temple/doorway, the glyphs, other villagers' effects, the gesture trace, the sky/water bounds. Refusal = the "no-purchase" flex from Section 10 — visible but silent. Per doctrine, the grabbable set is explicit and never changes at runtime.

---

## 13. Momentum / Throwing Rules

- **Sampling window:** ring buffer of hand world-positions over the last ~100 ms (≈6–8 frames at 60 fps), maintained by `throw_sampler.gd` whenever something is held.
- **Smoothing:** average velocity across the window with the oldest samples down-weighted (or simple mean of last 6 — build-time tuning); never use the single last frame (jitter) or the whole hold (mushy).
- **Mass scaling:** release velocity × class multiplier — Light ≈ 1.0, Medium ≈ 0.75, Heavy ≈ 0.4 (tuning values, not contract values).
- **Velocity clamp:** hard cap per class (e.g., ~18 m/s light, ~14 medium, ~8 heavy) plus a minimum-throw threshold below which release = drop. Caps prevent frame-spike super-launches.
- **Arc expectation:** a flung rock should travel a satisfying multiple of hand height in a readable parabola — visible rise, visible fall, honest landing. Trees barely clear their own height. Villagers fly disturbingly easily. That contrast *is* the proof.
- **Godot physics recommendation:** all throwables are `RigidBody3D`. While held: `freeze = true` with kinematic position updates following the hand (slight lag for weight). On release: `freeze = false`, set `linear_velocity` to the computed vector, small random `angular_velocity` for tumble. Villagers: RigidBody while held/airborne, hand back to their simple mover on recovery (implementation detail, build-time).
- **Avoiding absurd launches:** clamps above + ignore any single-frame sample exceeding a sanity bound + zero-velocity release on Esc + no velocity inheritance from camera motion (sample in world space with camera-delta subtracted).
- **Readability:** brief follow-through on the hand, faint motion streak on fast objects, honest gravity (no floaty custom curves), landing effects scaled by impact speed.
- **Dev diagnostics:** overlay shows live sampled velocity vector and the last-throw speed pre/post clamp (Section 18).
- **Pass/fail for "throw feels readable":** Andrew can (a) deliberately lob a rock a short distance, (b) deliberately hurl it far, (c) predict roughly where it lands mid-flight, and (d) drop something gently on the first try, each within a few attempts. Failing (d) is the classic god-game rage failure and fails the gate.

---

## 14. Gesture Miracle Coexistence

- **Entering gesture mode:** hold **Space** (Candidate A). Deliberate, chorded, impossible to hit while mousing. The hand shifts to point-pose and rises to a draw plane; a subtle vignette/tone marks sacred mode. Releasing Space exits instantly.
- **Avoiding accidental grabs:** in gesture mode the grab system is disabled at the state-machine level (not merely masked) — LMB means only "draw." Conversely, gestures cannot begin outside the mode, so ordinary hand work never scribbles sacred marks.
- **Failed recognition without HUD spam:** the trace flares briefly, then dissolves into drifting sparks — the world absorbing a mark it didn't accept. No text, no toast, no error sound harsher than a soft fade. Repeated failure is communicated by the same calm dissolve every time; the diagnostics overlay (dev-only) is where confidence numbers live.
- **Starter miracle placeholder (exactly one):** a **closed circle** glyph → a placeholder "blessing/rain" effect (soft light + particle fall over a small area, villagers pray). Already learned at spike start. Placeholder effect, not a designed miracle.
- **Shrine-learned placeholder (exactly one):** a **vertical zigzag** glyph → placeholder "bolt/scorch" effect (flash + small scorch decal, villagers flee). Locked until learned at the shrine (Section 15). Zigzag is chosen as a nod to the bible's protected `spiral→zigzag = Fireball` rule.
- **Recognizer:** deterministic geometry, no ML: resample the stroke to N points, then classify by total signed rotation + closure (circle) vs. aspect ratio + direction-reversal count (zigzag) — the same *family* of features the old prototype's `analyzeGesture` used. Deterministic means tunable, debuggable, and explainable to Andrew in one sentence each.
- **Old prototype referenced conceptually:** its resample/bounding-box/signed-rotation/turn-count feature approach is validated prior art and may inform the new recognizer's math.
- **Must not be reused:** any actual code from the chunked runtime, the spiral-arming two-stage ritual (single-glyph casting only in this spike — the opener/finisher structure is a later design question, Section 24), the ten-miracle roster, the ritual-state HUD labels, and the spellbook cards.

---

## 15. Shrine / Temple Boundary Proof

**Shrine (the learning boundary):**

- One shrine structure bearing a **dormant zigzag glyph motif** (dim carving).
- **Awakening placeholder:** carrying a `ShrineOffering` to the shrine and placing it gently awakens the glyph (it ignites and glows). This stands in for the full environmental-ritual loop without building a puzzle system.
- **Trace-to-learn placeholder:** with the glyph awakened, entering gesture mode near the shrine and drawing the zigzag "learns" the second miracle — glyph flares, hand glows briefly, `god_identity.learned_bolt = true`, and it is castable everywhere thereafter. Learned means learned; no unlearning, no loadout.

**Temple (the interface boundary):**

- One temple facade with a clickable **doorway** (click target sized generously).
- Click → camera zoom to doorway → fade to black → **static temple interior** scene.
- Interior: central floating viewpoint; look/click **left → Symbol/Identity chamber placeholder** (the three candidate symbols, or the chosen one enthroned); look/click **right → Miracle/Glyph chamber placeholder** (circle glyph displayed; zigzag appears once learned); **center → exit door** back to the world.
- **No settings, save, stats, options, or any other panel anywhere** — not in the world, and not even in the temple beyond the two placeholder chambers. The proof is the *boundary*, not the furniture.

---

## 16. Symbol Identity Stub

- **When it appears:** after the player casts the starter miracle for the first time (the world has now witnessed an act of god). Not at boot — the moment should be *earned*, even in a spike.
- **How it plays:** the nearest villager approaches the hand, looks up, and a short world-space utterance appears (spoken-style text, allowed under doctrine as speech): **"Who are you?"** Three placeholder symbols fade in, floating in world space near the villager. The player touches/clicks one with the hand.
- **Afterward:** the chosen symbol is (a) painted as a simple decal on a village stone/banner by the asking villager, and (b) enthroned in the temple's Symbol/Identity chamber. It also faintly appears in the gesture-mode vignette **[can decide during build]**.
- **Acknowledgment:** nearby villagers turn toward the painting moment and give a brief reverence cue. That's the whole propagation stub.
- **Intentionally NOT included:** five doctrine-suggested symbols tied to dream paths (three generic marks suffice for a stub), symbol changing in the temple (view only), symbol on the hand, organic propagation (flowers/scorch), morality expression, any dream/birth sequence, and any villager dialogue beyond the single question.

---

## 17. Villager Witness Stub

Small state machine per villager — witnesses, not batteries. No resources, needs, jobs, or meters.

- **Idle:** slow wander near the village; occasional pauses.
- **Notice hand:** when the hand hovers low nearby, stop and look up at it; small awe/wary posture. (This single behavior does more for godhood-feel per line of code than anything else in the spike.)
- **React to grab:** the grabbed villager freezes then squirms; nearby villagers back away or flee a short distance and watch.
- **React to throw:** flight path witnesses flee; a hard landing triggers a fear burst (scatter + cower beat) in everyone nearby; the thrown villager gets up woozily and hurries off. Gentle set-down instead earns a brief bow/relief cue.
- **React to miracle:** starter blessing → gather and kneel/pray toward the effect. Bolt → scatter from the strike point, then wary regard of the hand.
- **"Who are you?" moment:** exactly one villager performs the Section 16 approach; the others witness the painting.
- **Symbol display:** the asker paints the chosen symbol decal; done.

Emotion is conveyed by posture, movement, and at most simple world-space cues — no floating bars, no icons that read as UI widgets.

---

## 18. Dev-Only Diagnostics

Toggle: **F3** (dev habit; discoverable in the runbook). **Off by default. Never shown in normal play. This overlay is a debugging instrument and must never evolve into gameplay HUD** — it is deliberately ugly monospace text so no one is tempted to ship it.

Displayed when on: current input state (hover/grip/carry/gesture/pan/orbit) · hovered object name/class · held object name/class/mass category · live sampled hand velocity + last throw speed (pre/post clamp) · camera mode + zoom distance · gesture mode flag · last recognizer result + confidence/feature values · current scene (world/temple) · FPS.

---

## 19. Beginner Runbook Requirements

The build must ship `godot-spike/README_FOR_ANDREW.md` containing, in this order:

1. **The one command:** `cd /Users/andrew/Parable/godot-spike && ./run.sh` — launches straight into the island. (Also: how to quit — Cmd-Q.)
2. **Click-by-click fallback** assuming zero Godot knowledge: open **Godot** from Applications → a "Projects" window appears → click **Import** → navigate to `/Users/andrew/Parable/godot-spike` → choose `project.godot` → click **Import & Edit** → the editor opens (looks complicated; ignore all of it) → press the **▶ play button, top-right** (or **Cmd+B** / F5 depending on binding) → the game window opens. Every step named by what's visible on screen, with "you should now see…" checkpoints.
3. **What you should see:** a small island, a village with wandering villagers, a shrine with a dim carving, a temple with a doorway, and a floating hand that follows your mouse.
4. **What to try first, in order:** move the mouse (watch the hand) → drag the ground to pan → RMB-drag to orbit, scroll to zoom → pick up a rock, carry it, drop it → pick up a rock and *fling* it → gently set a villager down somewhere; then throw one and watch the others → hold Space and draw a circle over the village → answer "Who are you?" → carry the offering to the shrine, then trace the zigzag → cast the bolt → click the temple doorway, look left and right, exit.
5. **Broken/placeholder by design:** ugly proxy shapes, two placeholder miracles only, one shrine trick, no save, no options, no sound (unless trivially cheap), villagers are simple, temple has two chambers. None of this is the test. The test is *feel*.
6. **How to report feel failures:** the Section 21 checklist rendered as fill-in questions, plus: "for anything that felt wrong, say what you did, what happened, and what your hand *expected* to happen." Expectation-vs-result is the tuning signal.

---

## 20. Validation Plan

**A. Codex validates automatically (must all pass before handing to Andrew):**

- Godot detection: binary found, `--version` reports 4.x.
- File presence: `project.godot`, main scene set, all scenes/scripts/launcher/verifier/README present (checked by `verify.sh`).
- `project.godot` sanity: main scene path valid, input actions defined, window config present.
- Project import: `godot --headless --path . --import` exits 0 (proves scenes/resources parse and import).
- Script check: `godot --headless --path . --check-only --script <each .gd>` (or headless load of all scripts via the test script) — no parse errors. **[UNCERTAIN: exact `--check-only` coverage per script in 4.7; the build should use whichever headless syntax-check invocation works and record it.]**
- Headless smoke: `godot --headless --path . --script tests/verify_headless.gd` — instantiates `Main.tscn`, asserts key nodes exist, asserts grabbable group membership, asserts recognizer classifies a synthetic circle and zigzag point-set correctly, exits 0.
- Launcher check: `run.sh` finds Godot and constructs the right invocation (full windowed launch is B, below).
- Runbook exists and matches the actual controls (grep-level cross-check of action names/keys).

**B. Andrew may need to do manually (cheap, pre-review):**

- Run `./run.sh` once — confirm a window opens, the island renders, no crash in the first minute. (Codex cannot verify actual GPU rendering from headless mode.)
- If the launcher fails, run `./verify.sh` and paste the output back.

**C. Human review required (cannot be validated by tools):**

- Everything in Section 21. Hand feel, camera feel, throw readability, sacredness of gestures, temple ceremony, godhood. No script can measure whether a hand feels like a body. The build report must not claim any feel outcome — only that A passed and B/C await Andrew.

---

## 21. Human Review Checklist

Andrew answers each after ~15–20 minutes of play. Yes / No / Almost, plus a note for anything not-Yes.

1. **Does the hand feel like *your body* — do you think "I'll pick that up," not "I'll click that"?**
2. **Does camera movement support the hand?** Could you orbit/zoom around a target while keeping the hand near it, without thinking about controls?
3. **Is grabbing consistent?** Did anything you expected to grab refuse (or vice versa)? Did a grab ever feel random?
4. **Does release velocity feel like throwing?** Could you lob short, hurl far, predict landings, and set things down *gently* on purpose?
5. **Can you tell villager / rock / tree / offering apart by feel alone** (weight, resistance, sway, reaction) without looking at their shapes?
6. **Does gesture drawing feel sacred and physical** — drawing a mark on a living world, not doodling on a dashboard?
7. **Does temple entry feel like entering a sacred interface** — ceremonial, not "a menu opened"?
8. **Does the symbol feel like identity?** Did seeing it painted mean something?
9. **Does the whole scene feel like godhood** — present *in* the world rather than commanding it remotely like an RTS?
10. **Does Godot feel worth continuing** versus trying the browser spike — subtracting placeholder ugliness, is there any engine-level friction (launch, window, input latency, smoothness) that soured it?
11. Bonus signals: did you replay any action just because it felt good? Which one? Did anything make you feel guilty? (Guilt over a thrown villager is a *pass* signal for witness feel.)

---

## 22. Pass / Fail Decision Gate

Evaluated only after Andrew completes Section 21:

- **Pass** (Q1–4 yes/almost-yes, Q9 yes, Q10 yes): next artifact is a **Codex implementation packet for the Godot vertical-slice foundation** (birth-of-god opening, real starter miracle, full temple chambers, shrine ritual — per the design plan's Phases 2–5, now on Godot).
- **Partial pass** (godhood glimmers; specific mechanics fail): next artifact is a **Godot iteration packet** — targeted fixes from the expectation-vs-result notes, same scope, re-review. Iterate, don't expand.
- **Fail due to implementation quality** (grabbing buggy, throws absurd, camera fights — but Godot itself launches and runs fine): **fix the implementation before even discussing engines.** A bad throw sampler is not evidence against Godot.
- **Fail due to engine/export/review friction** (Godot won't launch cleanly for Andrew, macOS rendering problems, input latency inherent to the runtime, review loop too heavy): run the **browser hand-feel spike** already outlined in `PARABLE_PLATFORM_DECISION_PREP_2026-07-02.md`, using this same Section 21 checklist so the two proofs are comparable.
- **Fail due to unclear controls** (Andrew couldn't tell what the buttons did): **revise the control grammar (Section 10) first** — possibly to Candidate B — and re-test before blaming the engine. Control-scheme confusion is the cheapest failure to fix and the easiest to misattribute.

---

## 23. Build Prompt Skeleton For Later

*(Skeleton only — not the build prompt. Filled in after approval.)*

```
CODEX BUILD PACKET — Parable Godot Hand-Feel Spike
Approved plan: docs/PARABLE_GODOT_HAND_FEEL_SPIKE_PLAN_FOR_APPROVAL_2026-07-02.md
  (approved by Andrew on: <DATE>; amendments: <NONE | list>)

Branch: spike/godot-hand-feel-2026-07-02 (create per plan §6, including the
  PROJECT_BIBLE legacy rename — steps 1–4 exactly, stop on any collision)

Allowed files: everything under godot-spike/ (new); docs/<this plan> (read);
  the §6 rename commit. Nothing else.
Forbidden files: all old prototype files (§6 read-only list);
  docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md; origin/main.

Deliverables: <project.godot, scenes per §8, scripts per §9, input map per §10,
  run.sh, verify.sh, tests/verify_headless.gd, README_FOR_ANDREW.md>

Validation commands (§20A): <godot --headless --import; script checks;
  headless smoke; verify.sh; exact invocations recorded in the report>

Beginner runbook: per §19, all six parts, zero assumed Godot knowledge.

Human review script: §21 checklist rendered as fill-in questions in the runbook.

Final report format: what was built; every validation command + actual output;
  what is NOT validated (all §20 B/C items); no feel claims; no "tests passed"
  claims beyond commands actually run; open tuning values chosen and where.

Stop conditions: no scope beyond §4's eleven targets; §5 non-negotiables;
  stop and report on any git collision or Godot failure.
```

---

## 24. Open Questions

**Must decide before build (Andrew, at approval time):**

1. Approve the `docs/PROJECT_BIBLE.md` → `docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md` rename? (Required for any checkout; the file is preserved verbatim. If no — the build needs an alternative worktree strategy, e.g. `git worktree` in a sibling directory.)
2. Control grammar: Candidate A (recommended) or Candidate B?
3. May the build agent add a one-line pointer to `README.md` on the spike branch, or leave README untouched (default: untouched)?

**Can decide during build (agent's judgment, reported afterward):**

- All numeric tuning (grab radius, throw multipliers/clamps, camera speeds, sample window).
- Placeholder mesh construction (primitives vs. tiny authored meshes) and palette.
- Scene-transition mechanism (scene swap vs. sub-viewport), villager body-type switch details, decal vs. textured-quad for the symbol, whether the symbol tints the gesture vignette, whether trivial audio blips are included, exact headless syntax-check invocation, whether temple entry requires empty hands.

**Must wait for human review (nobody decides these on paper):**

- Every Section 21 question; whether the two-glyph recognizer thresholds feel forgiving; whether B&W-style LMB ground-pan actually reads as "hand grips the world" to Andrew; whether Godot continues (Section 22).

---

## 25. Risks And Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Andrew's Godot unfamiliarity** | Any editor-dependent step kills the review loop | Launcher runs the game directly; all wiring in text files; click-by-click fallback; Godot 4.7 already installed **[VERIFIED]** |
| **Agent overbuilding** | Spikes metastasize into engines; the question never gets answered | Eleven fixed targets (§4); explicit absent-systems list (§9); "if it doesn't serve §4, it's out of scope"; small-file discipline |
| **Engine enthusiasm replacing evidence** | "Godot is nice to build in" ≠ "the hand feels like godhood" | Godot is declared non-final (§1); pass/fail rests solely on the human checklist (§21–22); browser route kept alive with the same instrument |
| **Hand feel fails despite correct architecture** | Feel is tuning, not structure; a correct state machine can still feel dead | Diagnostics expose live velocities (§18); runbook collects expectation-vs-result notes (§19); partial-pass route is an iteration packet, not a rewrite (§22) |
| **Accidentally recreating dashboard UI** | Strong gravitational pull of default UI patterns (and Godot's Control nodes make HUDs easy) | §5 bans; diagnostics deliberately ugly, off by default, F3-gated; temple placeholder chambers contain no panels; reviewer question 7 checks it |
| **Old prototype contaminating the spike** | Chunked runtime, HUD shell, and ten-miracle roster are all doctrine violations waiting to be copied | Old files are read-only evidence (§6); "referenced conceptually, never ported" rule (§14); new directory with zero imports from old code |
| **Local/remote worktree conflict** | Careless checkout could destroy the 2021 local bible (irreplaceable user work) | Rename-first, never delete (§6); git-refuses-by-default is treated as a feature; diff audit docs before checkout; stop-and-report on any collision |
| **macOS rendering/permission surprises** (Gatekeeper, Vulkan-on-Metal quirks) **[UNCERTAIN]** | Could block Andrew at launch through no fault of the spike | Homebrew-cask Godot is already installed and version-checked; headless import smoke in §20A; §20B one-minute manual launch check before the real review; classified as engine-friction failure (§22), not hand-feel failure |

---

## 26. Stop Condition

**This document is the deliverable. Work stops here.**

Not done now, by design: no implementation; no code; no `godot-spike/` files; no branch creation or checkout; no rename of any file; no full build prompt (only the §23 skeleton); no campaign content; no miracle-roster expansion; no art prompts; no production lore; no claims that anything was built, run, or tested beyond the read-only evidence checks recorded at the top.

Next action belongs to Andrew: approve, amend, or reject.

---

## 27. Andrew Approval Summary

**Recommended branch:** `spike/godot-hand-feel-2026-07-02`, from `audit/parable-refoundation-2026-07-02`, after renaming (never deleting) your local 2021 `docs/PROJECT_BIBLE.md` to `docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md`.

**Recommended directory:** `godot-spike/` at the repo root, beside the old web prototype, which stays untouched as read-only evidence.

**Exact next build target after approval:** a Godot 4.7 project that opens with one command (`./run.sh`) into a placeholder island where you — through a visible divine hand — pan/orbit/zoom, grab/carry/drop/throw villagers, rocks, trees, and an offering, draw two placeholder miracle glyphs, learn one at a shrine, answer "Who are you?", and enter a two-chamber temple. No HUD. Plus verifier, launcher, and a zero-Godot-knowledge runbook.

**What you are approving:** the scope (§4), the bans (§5), the branch/directory surgery (§6), the control grammar Candidate A (§10) and camera grammar (§11), the architecture as a spike-sized sketch (§8–9), and the review instrument (§20–22). Plus the three §24 pre-build decisions (the rename, A-vs-B controls, README pointer or not).

**What will be built only after approval:** everything under `godot-spike/`, via a separate Codex build prompt derived from §23. Nothing has been built yet.

**What must not drift:** you are the god; the hand is your body; the symbol is your name; villagers witness, they are not batteries; no HUD in the world; the temple holds the interface; miracles are drawn, learned, and never load-outed; no golems here; no creature ever; the old prototype is evidence, not architecture; Godot is on trial, and only your hands can acquit it.
