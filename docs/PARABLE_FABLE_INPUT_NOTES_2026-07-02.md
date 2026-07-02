# Parable Fable Input Notes - 2026-07-02

## Exact Questions For Claude Fable 5

1. What is the smallest behavioral specification for mouse-first divine hand feel?
2. What camera grammar best supports grab/carry/throw plus miracle drawing without mode confusion?
3. What object classes must be grabbable in the first proof, and what must not be grabbable?
4. How should gesture miracles coexist with physical hand manipulation?
5. What is the minimum temple/interface proof that keeps major UI out of normal world play?
6. Should the first proof use a greenfield browser spike, Godot spike, or a two-spike comparison?
7. What evidence would justify returning to the existing Three.js runtime instead of starting fresh?
8. What human review checklist decides whether the player feels like the god?

## Source Files / Docs Fable Must Read

Must read from `origin/main` or a reconciled local checkout:
- `docs/PARABLE_PROJECT_DESIGN_AND_PLAN_2026-07-02.md`
- `docs/PARABLE_WORLD_FUNCTION_DOCTRINE_2026-07-02.md`
- `Parable_Bible.md`
- `README.md`
- `docs/PROJECT_BIBLE.md`
- `index.html`
- `styles.css`
- `src/main.js`
- `src/runtime/main.part01.js.txt` through `src/runtime/main.part12.js.txt`
- `scripts/verify-parable.mjs`
- `scripts/parable-turn-guard.mjs`

Must also read these audit outputs:
- `docs/PARABLE_REPO_REALITY_AUDIT_2026-07-02.md`
- `docs/PARABLE_KEEP_REPLACE_TABLE_2026-07-02.md`
- `docs/PARABLE_PLATFORM_DECISION_PREP_2026-07-02.md`
- `docs/PARABLE_FABLE_INPUT_NOTES_2026-07-02.md`

Missing expected files:
- `docs/PARABLE_SALVAGED_TECHNICAL_PATTERNS_APPENDIX_2026-07-02.md`
- `AGENTS.md`
- `CLAUDE.md`
- `tests/`

## Repo Evidence Fable Should Trust

- The July 2 design docs are the current source of truth.
- The current prototype is evidence only.
- Remote `origin/main` contains the actual app files; local worktree was sparse at audit start.
- Local `docs/PROJECT_BIBLE.md` differs from remote tracked `docs/PROJECT_BIBLE.md`; do not overwrite it casually.
- Existing prototype has gesture miracle logic, procedural island, villagers, shrines, rival pressure, worship, and simple golems.
- Existing prototype lacks divine hand embodiment, consistent grabbing, throwing/momentum, symbol system, temple UI, birth-of-god opening, shrine-learning progression, and macro golems.

## What Remains Uncertain

- Whether the current remote prototype actually runs in a live browser today.
- Whether its gesture recognition feels good under a mouse.
- Whether a Three.js greenfield hand spike can reach acceptable feel faster than Godot.
- Whether browser deployability is mandatory for the next proof or merely preferred.
- Whether the conflicting local `docs/PROJECT_BIBLE.md` contains user-important material not present in remote.

## What Fable Must Not Assume

- Do not assume Three.js is the final platform.
- Do not assume Godot is better without a hand-feel proof.
- Do not assume the current app shell should be preserved.
- Do not assume the current ten-miracle roster is the opening progression.
- Do not assume persistent HUD panels are acceptable.
- Do not assume golems can cast miracles.
- Do not assume any browser/WebGL success unless a browser test actually happened.
- Do not assume the local worktree is already reconciled with GitHub.

## Recommended Fable Task

Write a concrete hand-feel spike specification for a greenfield browser prototype. The spec must define mouse input states, raycast targets, hand pose/hover/grip states, grabbable object classes, release velocity/throw rules, camera controls, gesture/miracle coexistence, minimum temple stub, human review gates, and stop conditions. It must decide whether to use Three.js, Babylon.js, or plain browser primitives for the spike. It must include a fallback Godot spike only if the browser path fails specific checks.

## Stop Condition For Fable

Stop when Fable has produced an implementation-ready spike contract with:
- exact controls;
- expected feel outcomes;
- allowed files/scope;
- test checklist;
- human review checklist;
- pass/fail criteria for continuing browser work versus trying Godot.

Do not let Fable produce campaign design, miracle roster expansion, art prompts, or a full rewrite plan before the hand-feel spike contract exists.

## Human Review Gates

Human review is mandatory before calling the spike successful:
- hand feels like the player's body;
- camera supports the hand instead of fighting it;
- grabbing is consistent;
- throwing has readable momentum;
- gesture miracle input feels sacred and physical, not like drawing on a dashboard;
- temple/interface stub keeps major UI out of the normal world;
- the total experience reads as godhood, not remote strategy control.

## Suggested Implementation Order After Fable Decides

1. Reconcile local worktree with remote without overwriting the conflicting local `docs/PROJECT_BIBLE.md`.
2. Create a fresh spike branch.
3. Build the tiny hand-feel scene.
4. Add minimal verification for file presence and syntax.
5. Add browser smoke check if tooling is available.
6. Run human review.
7. Only then decide whether to port old gesture/world systems into the new foundation.

## GitHub / Repo Setup Facts

- Local path: `/Users/andrew/Parable`
- GitHub repository: `westkitty/Parable`
- GitHub visibility: public before this audit; unchanged.
- Remote: `git@github.com:westkitty/Parable.git`
- GitHub CLI authenticated as `westkitty`
- Audit branch ref: `audit/parable-refoundation-2026-07-02`
- Audit branch was created from `origin/main`.
- Worktree was not switched because local untracked `docs/PROJECT_BIBLE.md` conflicts with remote tracked `docs/PROJECT_BIBLE.md`.

## Compact Fable-Ready Task Paragraph

You are Claude Fable 5 preparing Parable's next technical pass. Read the July 2 design docs, project bible, and the four 2026-07-02 audit docs. Treat the current Three.js prototype as evidence only. Produce an implementation-ready greenfield browser hand-feel spike specification that proves whether the player can feel like a god through a mouse-first divine hand: visible hand body, camera, hover/grab/hold/carry/release, momentum throwing, gesture miracle coexistence, shrine/temple UI separation, and human review gates. Do not design a campaign, expand the miracle roster, preserve the current HUD, or choose Godot/Unity/Unreal without evidence from the hand-feel proof criteria.

