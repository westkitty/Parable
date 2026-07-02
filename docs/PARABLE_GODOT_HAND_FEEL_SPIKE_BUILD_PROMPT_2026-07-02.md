# Codex Build Packet — Parable Godot Hand-Feel Spike

Date: 2026-07-02
Status: **BUILD PROMPT — awaiting Andrew's approval. Do not execute until approved.**
Audience: Codex (or another coding agent) executing on `/Users/andrew/Parable`
Authoritative spec: `docs/PARABLE_GODOT_HAND_FEEL_SPIKE_PLAN_FOR_APPROVAL_2026-07-02.md` (referenced below as **the Plan**, by section number)

---

## 0. Approval Record And Amendments

The Plan was approved by Andrew on 2026-07-02 **with the following amendments, which override the Plan wherever they conflict**:

1. **Legacy bible stays out of the public repo.** The local conflicting `docs/PROJECT_BIBLE.md` (the 2021/2023 choose-your-own-adventure bible) must be preserved. It may be moved/renamed **only** to prevent checkout collision. It must **not** be committed, staged, or pushed unless Andrew explicitly approves that later. This supersedes Plan §6 step 4, which proposed committing the rename — do not do that. You must inspect `git status` before every commit and must never accidentally add it.
2. **Villager cruelty feedback is visual/body-language first.** Posture, squirm, freeze, flee, cower — those carry the signal. Audio is optional, allowed only if trivial to add, and must never block or delay the spike. (Supersedes the "audible whimper" wording in Plan §12; a whimper may be added only if it costs nearly nothing.)
3. **Control grammar: Candidate A, locked.** LMB = divine hand acting on the world (grab objects; grip-and-drag ground to pan). RMB-drag = orbit. Scroll = zoom. Hold **Space** = gesture mode. **Esc** = safe release/cancel. Candidate B is off the table for this spike.
4. **Old `README.md` stays untouched.** No pointer line. Only a later build report proving necessity can reopen this.

Everything else in the Plan stands as approved.

---

## 1. Mission

Build the Godot hand-feel spike defined by the Plan: a Godot 4.x project under `godot-spike/` that opens with one command into a placeholder island where Andrew — through a visible divine hand — pans/orbits/zooms, grabs/carries/drops/throws four object classes, draws two placeholder miracle glyphs, learns one at a shrine, answers "Who are you?", and enters a two-chamber temple. No HUD. Plus launcher, verifier, and a beginner runbook assuming zero Godot knowledge.

The spike answers exactly one question: **can Godot make the player feel like a god through a mouse-first divine hand?** You are building the instrument for that test, not the game.

---

## 2. Required Reading Before Any Edit

Read in this order:

1. **The Plan** — `docs/PARABLE_GODOT_HAND_FEEL_SPIKE_PLAN_FOR_APPROVAL_2026-07-02.md` — the full spec. Sections cited throughout this packet are binding.
2. `docs/PARABLE_WORLD_FUNCTION_DOCTRINE_2026-07-02.md` and `docs/PARABLE_PROJECT_DESIGN_AND_PLAN_2026-07-02.md` (on the spike branch after checkout) — doctrine context.
3. `docs/PARABLE_REPO_REALITY_AUDIT_2026-07-02.md` and `docs/PARABLE_KEEP_REPLACE_TABLE_2026-07-02.md` — repo reality.

Evidence only, never to be edited or ported: `index.html`, `styles.css`, `src/`, `scripts/`, `package.json`, `README.md`, `Parable_Bible.md`. The old prototype's gesture-feature math (resample / bounding box / signed rotation / turn count in `src/runtime/main.part06.js.txt`) may inform your recognizer conceptually; **no code is copied or ported** (Plan §14).

If any listed file is missing, stop and report. Do not invent contents.

---

## 3. Repo State Facts (verified 2026-07-02)

- Local worktree: unborn `main`, zero commits. Untracked only: `.DS_Store`, `docs/` (four audit docs, local 2021 `PROJECT_BIBLE.md`, a 151 KB PDF, the Plan, this packet).
- Full prototype + July 2 design docs live on local ref `audit/parable-refoundation-2026-07-02` (= `origin/main` per the audit).
- Godot 4.7 stable installed: `/Applications/Godot.app` (Homebrew cask), CLI `/opt/homebrew/bin/godot`, reports `4.7.stable.official.5b4e0cb0f`. Re-detect at runtime anyway (Plan §7).
- GitHub: `westkitty/Parable`, public, SSH remote configured, `gh` authenticated.

---

## 4. Step 0 — Worktree Reconciliation And Branch (do this first, exactly)

1. `git -C /Users/andrew/Parable status --porcelain` — record the output in your report.
2. Rename the local conflicting bible to prevent checkout collision, preserving it byte-for-byte:
   `mv docs/PROJECT_BIBLE.md docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md`
   **Never delete it. Never `git add` it. Never commit it** (Amendment 1).
3. Keep it (and the local PDF) out of accidental staging using the **local-only** exclude file — not the tracked `.gitignore` (a tracked ignore entry would leak the file's existence into the public repo):
   append to `.git/info/exclude`:
   ```
   docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md
   docs/Parable Project Design and Implementation Plan.pdf
   .DS_Store
   ```
4. Diff the four local audit docs against their branch copies (`git diff --no-index` vs `git show audit/...:docs/<file>`). If any differ, **stop and report** — do not overwrite either side.
5. `git checkout -b spike/godot-hand-feel-2026-07-02 audit/parable-refoundation-2026-07-02`
   If git reports **any** untracked-file collision, **stop and report**. Never use `-f`, never `git clean`.
6. Confirm the two July 2 design docs and the old prototype files now exist in the worktree; confirm `docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md` still exists untouched.
7. First commit on the branch: this packet and the Plan only, if they are not already tracked —
   `git add docs/PARABLE_GODOT_HAND_FEEL_SPIKE_PLAN_FOR_APPROVAL_2026-07-02.md docs/PARABLE_GODOT_HAND_FEEL_SPIKE_BUILD_PROMPT_2026-07-02.md`

**Git hygiene for the whole build (binding):**

- Never `git add -A`, `git add .`, or `git add docs/`. Stage explicit paths only.
- Run `git status --porcelain` and read it before **every** commit. If `PROJECT_BIBLE_LOCAL_LEGACY_2021.md`, the PDF, or `.DS_Store` appears staged, unstage and fix before committing.
- Conventional commits (`feat:`, `chore:`, `docs:`), atomic.
- **Do not push to origin.** The branch stays local until Andrew reviews the build report and says push. (The repo is public; Amendment 1's spirit applies to everything.)

---

## 5. Allowed / Forbidden Files

**Allowed to create/edit:**

- Everything under `godot-spike/` (new directory).
- `.git/info/exclude` (Step 0 only).

**Forbidden (read-only evidence or protected):**

- All old prototype files: `index.html`, `styles.css`, `src/**`, `scripts/**`, `package.json`, `README.md` (Amendment 4), `Parable_Bible.md`, `codex-write-check.txt`.
- All existing `docs/**` including both PROJECT_BIBLE variants, the PDF, the audit docs, the Plan, this packet (beyond the Step-0 commit).
- `.gitignore` (do not create or modify — use `.git/info/exclude`).
- Anything on `origin/main`; any push.

---

## 6. Deliverables

Directory layout per Plan §6:

```
godot-spike/
├── project.godot            main scene set; input map per §7 below; window title "Parable — Hand-Feel Spike"; Forward+; Godot 4.x
├── run.sh                   launcher: detect Godot (Plan §7 search order), verify 4.x, exec `godot --path <dir>`; on missing Godot print `brew install --cask godot` + download link, never auto-install
├── verify.sh                verifier entry: detection + all §8 headless checks, non-zero exit on any failure, readable output
├── README_FOR_ANDREW.md     beginner runbook, all six parts of Plan §19, zero assumed Godot vocabulary, plus the §21 review checklist as fill-in questions
├── scenes/                  Main.tscn + TempleInterior.tscn + object scenes — node tree, responsibilities, and must-nots per Plan §8, ALL wiring in text files
├── scripts/                 GDScript modules per Plan §9 (hand_input, hand_visual, camera_rig, grabbable, villager_proxy, throw_sampler, gesture_recognizer, gesture_trace, shrine, temple_door, temple_interior, god_identity autoload, witness_director, diagnostics)
├── assets/                  placeholder materials/meshes only if primitives can't cut it
└── tests/verify_headless.gd headless assertions per §8 below
```

Behavioral contracts (each binding, detail in the cited Plan section):

- **Hand & input state machine** — Plan §10 Candidate A table, every state, trigger, failure behavior, and "must not happen" column. Drag-distance threshold separates click from pan.
- **Camera** — Plan §11: LMB ground-grip pan, RMB orbit (pitch clamped), scroll zoom-to-hand, reduced sensitivity while carrying, full lock during gesture, scripted doorway/exit transitions.
- **Grabbables** — Plan §12 table: four classes, mass categories, hover/held/release/throw behavior, explicit not-grabbable set with silent "no-purchase" refusal. **Cruelty feedback per Amendment 2: body-language first (distinct pre-throw squirm/panic pose when hand velocity crosses the throw threshold while holding a villager, knocked-flat recovery, fear burst in witnesses); audio only if trivial.**
- **Throwing** — Plan §13: ~100 ms ring-buffer sampling, smoothing, per-class multipliers and clamps, freeze-while-held RigidBody3D pattern, camera-delta excluded from samples, Esc = zero-velocity drop.
- **Gestures** — Plan §14: hold-Space mode, grab system disabled at state-machine level inside the mode, circle → starter blessing placeholder, zigzag → shrine-learned bolt placeholder, deterministic geometric recognizer, failure = calm trace-dissolve, no text.
- **Shrine & temple** — Plan §15: offering-placement awakens glyph, trace-to-learn near shrine, doorway click → zoom → fade → static two-chamber interior (Symbol left, Glyph right, exit center), return to world exactly as left. No panels anywhere.
- **Symbol stub** — Plan §16: triggers after first starter-miracle cast; one villager asks "Who are you?" (world-space speech text allowed); three placeholder symbols; choice painted on a village stone/banner and enthroned in the Symbol chamber.
- **Villager witnesses** — Plan §17: idle / notice-hand / grab / throw / miracle / symbol-moment states. Posture and movement, no UI-widget cues.
- **Diagnostics** — Plan §18: F3 toggle, off by default, deliberately ugly monospace, full field list.
- **No HUD** — Plan §5. The world screen is world, hand, and world-space feedback only.

Tuning values (grab radius, multipliers, clamps, camera speeds) are yours to choose within Plan §13's intent; record every chosen value in the report.

---

## 7. Input Map (locked — Amendment 3)

Define these actions in `project.godot`:

| Action | Binding | Meaning |
|---|---|---|
| `hand_press` | Left mouse button | Hand acts on world: grab hovered object, else grip-drag ground to pan; click doorway/symbols |
| `camera_orbit` | Right mouse button (held) | Orbit around focus |
| `camera_zoom_in` / `camera_zoom_out` | Scroll up / down | Dolly zoom toward/away from point under hand |
| `gesture_mode` | Space (held) | Sacred draw mode; LMB draws while held |
| `cancel_action` | Escape | Safe release: gentle drop, abort gesture, exit pending modes; never throws, never opens anything |
| `toggle_diagnostics` | F3 | Dev overlay only |

No other player-facing bindings. Do not add "helpful" extras (WASD, edge pan, hotkeys).

---

## 8. Validation Commands (Plan §20A — all must pass before reporting)

Run from `godot-spike/` with the detected binary (record exact invocations and full output):

1. `godot --version` → 4.x confirmed.
2. `godot --headless --path . --import` → exit 0 (scenes/resources import cleanly).
3. Script syntax check per `.gd` file — use whichever headless invocation works in 4.7 (`--check-only --script <file>`, or headless load-all via the test script); record which you used.
4. `godot --headless --path . --script tests/verify_headless.gd` → exit 0. Must assert at minimum: `Main.tscn` instantiates; DivineHand, CameraRig, Island, Grabbables (with all four classes), Shrine, TempleDoorway, GestureTrace, DevDiagnostics nodes exist; all grabbables are in the grabbable group and nothing else is; recognizer classifies a synthetic circle point-set as circle and a synthetic zigzag as zigzag, and rejects a straight line; `god_identity` starts with starter learned, bolt unlearned.
5. `./verify.sh` → exit 0 (wraps 1–4 + file-presence + `project.godot` sanity + runbook/action-name cross-check).
6. `./run.sh --dry-run` (implement a dry-run flag: detection + command construction without launching) → prints the resolved binary and command.

You cannot validate rendering, input feel, or anything in Plan §20B/§20C. Do not claim you did.

---

## 9. Scope Guards (Plan §4–5, binding)

Eleven proof targets (Plan §4) and nothing else. Absolute bans: HUD/panels/bars/counters in world view; spell buttons or hotbars; creature systems; avatars; campaign/opening cinematic; more than two placeholder miracles; city-builder/economy systems; dashboard stats; reuse of old app shell/runtime code; golems (a heavy inert "boulder" is allowed if needed for throw testing); save/settings/audio-manager frameworks; autoloads beyond `god_identity.gd`. If a task doesn't serve a §4 target, don't do it. If a script exceeds a few hundred lines, you are overbuilding — split scope, not the file.

---

## 10. Final Report Format

Deliver a markdown report (`godot-spike/BUILD_REPORT.md`, committed) containing:

1. **What was built** — file list with one-line purposes.
2. **Step-0 record** — `git status` outputs, the rename, exclude entries, diff results, checkout result.
3. **Every validation command + actual output** (§8), verbatim.
4. **Not validated** — explicitly list all Plan §20B/§20C items as awaiting Andrew. **No feel claims. No "tests passed" claims beyond commands actually run.**
5. **Tuning values chosen** and where they live (file:line).
6. **Deviations** from Plan/packet, if any, each with reason (deviations from §5 bans or the amendments are not permitted).
7. **Commit list** (`git log --oneline`) and confirmation that nothing was pushed and the legacy bible/PDF are untracked (`git status` proof).
8. **Andrew's next step** — run `./run.sh`, then the checklist in `README_FOR_ANDREW.md`.

---

## 11. Stop Conditions

Stop immediately and report (no improvising) if: any git collision or unexpected `git status` entry at Step 0; the audit-doc diff fails; Godot is missing or only 3.x; headless import cannot be made to pass; any action would require editing a forbidden file; any action would stage the legacy bible or PDF; scope pressure suggests adding a system not in Plan §4.

On completion: commit, write the report, **do not push**, do not tag, do not open a PR, do not modify the old README, do not begin any vertical-slice work. The next move after your report is Andrew's launch-and-feel review (Plan §21) and the decision gate (Plan §22).
