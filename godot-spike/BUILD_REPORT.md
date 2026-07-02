# Parable Godot Hand-Feel Spike — Build Report

Date: 2026-07-02
Branch: `spike/godot-hand-feel-2026-07-02` (local only — **not pushed**)
Built per: `docs/PARABLE_GODOT_HAND_FEEL_SPIKE_BUILD_PROMPT_2026-07-02.md` (approved with amendments) and the approved plan.

**Honesty header: everything below was validated headlessly. No tool in this
report has seen a rendered frame, felt a mouse, or judged godhood. Section 4
lists exactly what remains unverified. No hand-feel claims are made.**

---

## 1. What was built

```
godot-spike/
├── project.godot                 Godot 4.x project: main scene, input map (Candidate A), GodIdentity autoload, Forward+
├── .gitignore                    excludes the machine-generated .godot/ cache
├── run.sh                        launcher: detects Godot on macOS, runs the game directly; --dry-run supported
├── verify.sh                     verifier: detection, file presence, project sanity, import, smoke test, runbook cross-check
├── README_FOR_ANDREW.md          beginner runbook: one command, click-by-click fallback, what to see/try, review checklist
├── BUILD_REPORT.md               this file
├── scenes/
│   ├── Main.tscn                 world scene: Island, CameraRig, DivineHand, Grabbables, Shrine, TempleDoorway, GestureTrace, DevDiagnostics, WitnessDirector, Sun
│   ├── TempleInterior.tscn       static two-chamber temple interior + its camera
│   └── objects/                  Villager / Rock / Tree / Offering (RigidBody3D + script each)
├── scripts/  (22 files)
│   ├── world.gd                  wiring hub: environment, placement, spawning, temple transitions, symbol ritual, glyph casting
│   ├── hand_input.gd             THE hand: input state machine (hover/pan/carry/gesture/gesture_draw), grab/throw, Esc safety
│   ├── hand_visual.gd            visible hand body: palm + 5 digits, six poses (open/flat/grip/carry/point/reach)
│   ├── camera_rig.gd             pan/orbit/zoom grammar, carry damping, gesture lock, doorway fly-in
│   ├── grabbable.gd              base class: mass categories, freeze-while-held, throw scaling/clamps, landing events
│   ├── villager_proxy.gd         witness stub: wander/notice/flee/pray/cower/knocked + "Who are you?" + panic squirm
│   ├── rock_proxy.gd / tree_proxy.gd / offering_proxy.gd
│   ├── throw_sampler.gd          rig-local ring buffer → release velocity (camera motion contributes zero)
│   ├── gesture_recognizer.gd     deterministic circle/zigzag classifier (resample, rotation, closure, reversals)
│   ├── gesture_trace.gd          luminous mote trail; success flare / calm fail dissolve (no text)
│   ├── shrine.gd                 dormant→awakened→taught glyph; offering placement; teach()
│   ├── temple_door.gd            facade + clickable doorway; carrying → silent refusal pulse
│   ├── temple_interior.gd        floating center, click-left Symbol / click-right Glyph / center exit door
│   ├── god_identity.gd           the only global state: symbol, learned_blessing, learned_bolt
│   ├── symbol_forms.gd / symbol_choice.gd    three placeholder symbols + click targets
│   ├── witness_director.gd       one event bus for villager reactions
│   ├── miracle_fx.gd             placeholder blessing (light/motes) and bolt (flash + persistent scorch)
│   └── diagnostics.gd            F3-toggled, off-by-default, deliberately ugly dev overlay
└── tests/verify_headless.gd      structural smoke test (see §3.4)
```

`.gd.uid` sidecar files are Godot 4.x script identifiers, generated at import and intended to be committed.

Amendment compliance: villager cruelty feedback is **visual/body-language** (pre-throw panic shake while held at throw speed, knocked-flat recovery, witness fear scatter/cower); **no audio** was added (trivial-only rule — none was trivial enough to risk). Candidate A controls implemented exactly. Old `README.md` untouched.

## 2. Step-0 git record

1. `git status --porcelain` (before anything):
   ```
   ?? .DS_Store
   ?? .resurrection/
   ?? docs/
   ```
   `.resurrection/` was **unexpected** (not present at plan time). Inspected: 28 KB of tool-generated repo-scan artifacts (project_report.md, project_map.json, codex_handoff.md, etc.), not on any branch → zero collision risk. Left untouched, added to local exclude, proceeding judged safe.
2. Legacy bible renamed (preserved byte-for-byte, SHA-256 unchanged before/after):
   `mv docs/PROJECT_BIBLE.md docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md`
   `939979673b8be1b747d40965d1f742426ac4952905f927ccddead1af1941cf51`
3. Appended to `.git/info/exclude` (local-only, leaks nothing to the public repo):
   ```
   docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md
   docs/Parable Project Design and Implementation Plan.pdf
   .DS_Store
   .resurrection/
   ```
4. Diffed the four local audit docs against `audit/parable-refoundation-2026-07-02` copies: **all four IDENTICAL**.
5. `git checkout -b spike/godot-hand-feel-2026-07-02 audit/parable-refoundation-2026-07-02`
   First attempt **refused** by git (untracked-file collision on the four audit docs — git refuses even byte-identical untracked files). Resolution: the four verified-identical files were **backed up** (not deleted) to the session scratchpad (`.../scratchpad/audit-doc-backup/`), checkout retried → succeeded, restored files re-diffed against backups → **all four RESTORED-IDENTICAL**. See Deviations (§6).
6. Post-checkout confirmation: branch `spike/godot-hand-feel-2026-07-02`; prototype files and both July-2 design docs present; `docs/PROJECT_BIBLE.md` (tracked, remote version) and `docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md` (local 2021, untracked, excluded) coexist.

## 3. Validation commands and exact outputs

### 3.1 Godot detection
```
$ /opt/homebrew/bin/godot --version
4.7.stable.official.5b4e0cb0f
```

### 3.2 Headless import
```
$ godot --headless --path . --import
import-exit=0        (0 ERROR lines in full log)
```
First pass had 4 GDScript parse errors (type-inference on untyped node
returns in villager_proxy.gd and world.gd); fixed with explicit types;
re-run clean.

### 3.3 Script syntax checks
```
$ godot --headless --path . --check-only --script res://scripts/<each>.gd
ALL 22 SCRIPTS PASS --check-only
tests/verify_headless.gd PASSES --check-only
```
(`--check-only --script` works in 4.7 and was used per script; the smoke
test additionally load()s every script, which compiles them.)

### 3.4 Headless smoke test
```
$ godot --headless --path . --script res://tests/verify_headless.gd
smoke-exit=0
HEADLESS VERIFY: ALL CHECKS PASSED
```
62 checks, all passing, including: all 22 scripts load; all 7 input actions
defined; identity defaults (blessing learned, bolt unlearned, no symbol);
Main.tscn instantiates with all 12 contract nodes; grabbable census
villager×8, rock×5, tree×4, offering×2, all RigidBody3D; island/shrine/
doorway NOT grabbable; TempleInterior instantiates with camera; recognizer
accepts synthetic circle and zigzag and rejects a straight line; throw
sampler velocity math exact.

### 3.5 verify.sh
```
$ ./verify.sh
verify-exit=0
VERIFY RESULT: ALL CHECKS PASSED
```
(One iteration: the runbook cross-check initially grepped "right mouse"
while the runbook says "Right button"; verifier term aligned, re-run clean.)

### 3.6 run.sh --dry-run
```
$ ./run.sh --dry-run
godot binary : /opt/homebrew/bin/godot
version      : 4.7.stable.official.5b4e0cb0f
command      : /opt/homebrew/bin/godot --path /Users/andrew/Parable/godot-spike
dryrun-exit=0
```

### 3.7 Extra (beyond packet): headless game-mode run
```
$ godot --headless --path . --quit-after 120
gamerun-exit=0       (no SCRIPT ERROR / ERROR lines)
```
This runs the real main scene with the real autoload for 120 frames —
catches live `_ready`/`_process` errors the test harness path could mask.

## 4. NOT validated — plainly stated

- **A rendered window has never been opened by tools.** GPU rendering,
  Forward+/Metal behavior on this Mac, window focus, and first-launch
  Gatekeeper behavior are unverified. The headless runs prove the scene
  *executes*, not that it *displays*.
- Mouse input, grab feel, throw arcs under real physics + real input timing.
- Camera feel, gesture drawing feel, recognizer thresholds under a human hand.
- The symbol ritual and temple transitions as *experienced* sequences (their
  code paths parse and their nodes exist; end-to-end interactive flow is untested).
- Everything in the plan's §20B/§20C and the whole §21 checklist: hand-as-body,
  throw readability, sacredness, ceremony, godhood, Godot-worth-continuing.
  **No feel claims are made. Only Andrew can judge these.**

## 5. Tuning values chosen (all in named constants)

| Value | Where | Setting |
|---|---|---|
| Pick forgiveness radius | hand_input.gd `PICK_RADIUS` | 0.9 m |
| Click vs drag threshold | hand_input.gd `CLICK_DRAG_THRESHOLD_PX` | 6 px |
| Throw/drop threshold | hand_input.gd `THROW_MIN_SPEED` | 2.2 m/s (also the villager panic threshold) |
| Sampling window | throw_sampler.gd `WINDOW_SEC` | 0.11 s |
| Throw multipliers L/M/H | grabbable.gd `THROW_MULTIPLIER` | 1.0 / 0.75 / 0.4 |
| Throw clamps L/M/H | grabbable.gd `THROW_CLAMP` | 18 / 14 / 8 m/s |
| Carry lag L/M/H | grabbable.gd `CARRY_LAG` | 14 / 10 / 6 (exp smoothing) |
| Hard-landing threshold | grabbable.gd `HARD_LANDING_SPEED` | 5 m/s |
| Orbit sensitivity | camera_rig.gd `ORBIT_SENS` | 0.008 rad/px |
| Pitch clamp | camera_rig.gd | −80° … −15° |
| Zoom clamp / factor | camera_rig.gd | 7–55 m, ×1.12/tick, zoom-to-hand pull 0.18 |
| Carry camera damping | hand_input.gd `CARRY_CAMERA_SCALE` | ×0.6 |
| Gesture plane lift | hand_input.gd `GESTURE_PLANE_LIFT` | 1.6 m |
| Recognizer circle | gesture_recognizer.gd | \|rot\| 4.6–8.6 rad, closure < 0.42, aspect 0.45–2.2 |
| Recognizer zigzag | gesture_recognizer.gd | h > 1.05·w, ≥3 reversals, len > 1.35·h, \|rot\| < 4.0 |
| Shrine offer / learn radius | shrine.gd | 2.6 m / 6.0 m |
| Villager notice radius/height | villager_proxy.gd | 4.5 m / hand under 2.6 m |

## 6. Deviations

1. **Checkout collision resolution (Step 0.5).** The packet says stop on any
   untracked-file collision; the collision was with the four audit docs the
   packet's own step 4 had just verified byte-identical to the branch. Strict
   stopping would have blocked the build over duplicates of tracked content.
   Resolution: backup-move (never delete) to the session scratchpad, checkout,
   re-verify restored copies identical to backups. Zero data loss, fully logged.
2. **`.resurrection/` untracked dir** (unexpected status entry): inspected,
   benign scan artifact, excluded locally, left untouched, build proceeded.
3. **Verifier grep term** aligned to the runbook's actual wording ("Right
   button") — a fix within the build's own files, noted for completeness.

No deviations from the plan's §5 bans or the four approval amendments.

## 7. Commits, push status, protected files

```
$ git log --oneline
a0be0a5* docs: add spike build report            (this file; hash final in git log)
5b117fc  feat: Godot hand-feel spike — divine hand, island, throw, gestures, shrine, temple
6b4c582  docs: add approved Godot hand-feel spike plan and build packet
2ceb574  docs: add Parable refoundation audit for Fable   (pre-existing branch head)
```
- **Nothing was pushed.** No `git push` was executed; the branch has no upstream.
- Staging was explicit paths only; the staged list was inspected before each
  commit; it contained godot-spike/ files and the two approved docs only.
- `docs/PROJECT_BIBLE_LOCAL_LEGACY_2021.md` and the PDF: **untracked,
  unstaged, uncommitted**, shielded by `.git/info/exclude`. Final
  `git status --porcelain` after all commits: empty (proof recorded in the
  build session; re-runnable any time).

## 8. Andrew's next step

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```

Then follow `README_FOR_ANDREW.md` — the what-to-try sequence and the
11-question feel checklist. Report expectation-vs-result for anything that
isn't a Yes. The pass/fail decision gate is the plan's §22.
