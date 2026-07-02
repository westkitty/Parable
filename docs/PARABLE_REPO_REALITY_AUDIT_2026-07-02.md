# Parable Repo Reality Audit - 2026-07-02

## Summary

Conclusion: **Greenfield browser prototype**.

The local directory at `/Users/andrew/Parable` exists and Git was initialized safely, but the local worktree is not a normal checkout of the existing GitHub repository yet. The fetched remote `origin/main` contains the actual static Three.js prototype. The local worktree only contained `.DS_Store`, `docs/PROJECT_BIBLE.md`, and `docs/Parable Project Design and Implementation Plan.pdf` before this audit. Local `docs/PROJECT_BIBLE.md` conflicts with the remote tracked `docs/PROJECT_BIBLE.md`, so checkout/switch was not performed to avoid overwriting user work.

The current remote prototype is useful evidence, but it does not prove the July 2 doctrine's core hand-first control fantasy. It has gesture miracles, a procedural island, villagers, shrines, rival pressure, worship, and simple golems. It does not have a divine hand body, consistent object grabbing, throw momentum, symbol selection/propagation, shrine-based miracle learning, birth-of-god opening, temple-only major user interface (UI), or golem macro programming.

## Working Directory

- Required working directory: `/Users/andrew/Parable`
- Confirmed `pwd`: `/Users/andrew/Parable`
- Initial local files:
  - `.DS_Store`
  - `docs/PROJECT_BIBLE.md`
  - `docs/Parable Project Design and Implementation Plan.pdf`

## Branch And Git Status

- Initial state: not a Git repository.
- Action taken: `git init -b main`.
- Remote fetched: `origin/main` from `git@github.com:westkitty/Parable.git`.
- Audit branch ref created: `audit/parable-refoundation-2026-07-02`, tracking `origin/main`.
- Worktree was not switched to the audit branch because local untracked `docs/PROJECT_BIBLE.md` differs from remote tracked `docs/PROJECT_BIBLE.md`.
- Current local untracked state after audit creation includes `.DS_Store`, local docs, and these audit files.

## GitHub / Remote Status

- GitHub command-line interface (CLI): available, version `2.95.0`.
- Authentication: logged in as `westkitty`.
- Preferred repository: `westkitty/Parable`.
- Repository status: exists.
- Visibility: public already. No visibility change was made.
- Preferred remote: `git@github.com:westkitty/Parable.git`.
- Secure Shell (SSH) remote check succeeded with `git ls-remote`.
- Local remote added:
  - `origin git@github.com:westkitty/Parable.git`

Bootstrap result: **partially succeeded**.

Succeeded:
- Initialized local Git.
- Verified Git identity:
  - `user.name`: `WestKitty`
  - `user.email`: `westkitty@users.noreply.github.com`
- Verified GitHub CLI and authentication.
- Verified existing GitHub repository.
- Added preferred SSH remote.
- Fetched `origin/main`.
- Created audit branch ref from `origin/main`.

Blocked / intentionally not done:
- Did not checkout/switch to the audit branch because it would risk overwriting the local untracked `docs/PROJECT_BIBLE.md`.
- Did not stage or commit all project files.
- Did not edit source/gameplay files.

## Repo Structure Reality

Local worktree before audit:
- Sparse and incomplete.
- Missing the tracked remote app files.
- Contains a local older-looking `docs/PROJECT_BIBLE.md` whose opening says the bible was created in 2021 and updated in 2023.

Fetched `origin/main` tree:
- `README.md`
- `Parable_Bible.md`
- `package.json`
- `index.html`
- `styles.css`
- `src/main.js`
- `src/runtime/main.part01.js.txt` through `src/runtime/main.part12.js.txt`
- `scripts/verify-parable.mjs`
- `scripts/parable-turn-guard.mjs`
- `docs/GENERATED_ASSET_LIST.md`
- `docs/PARABLE_PROJECT_DESIGN_AND_PLAN_2026-07-02.md`
- `docs/PARABLE_WORLD_FUNCTION_DOCTRINE_2026-07-02.md`
- `docs/PROJECT_BIBLE.md`
- turn checklist docs

Missing from `origin/main`:
- `docs/PARABLE_SALVAGED_TECHNICAL_PATTERNS_APPENDIX_2026-07-02.md`
- `AGENTS.md`
- `CLAUDE.md`
- `tests/`
- dedicated test/spec files beyond `scripts/verify-parable.mjs`

## Current App / Runtime Architecture

Remote `origin/main` is a static no-build browser app:

- `index.html` defines the app shell, persistent world HUD panels, play canvas, miracle list, event log, control text, and restart button.
- `styles.css` styles a three-column interface with topbar, left status panel, canvas surface, right miracle/event panel, and responsive mobile layout.
- `src/main.js` loads 12 text chunks from `src/runtime/`, concatenates them, creates a Blob URL, and imports the assembled module.
- The runtime imports Three.js from `https://esm.sh/three@0.164.1`, so live browser play depends on a networked browser unless Three.js is vendored.
- Runtime chunks contain renderer setup, procedural island/world generation, gesture recognition, miracle casting, simulation, villagers, shrines, rival pressure, golems, and visual effects.

Evidence:
- `origin/main:README.md:23` says a normal internet-connected browser is required because Three.js is loaded from a pinned content delivery network (CDN) URL.
- `origin/main:src/main.js:1-18` fetches the 12 runtime chunks, joins them, creates a Blob, and imports it.
- `origin/main:src/runtime/main.part01.js.txt:1` imports Three.js from `https://esm.sh/three@0.164.1`.
- `origin/main:src/runtime/main.part01.js.txt:44-132` defines ten miracles.
- `origin/main:src/runtime/main.part06.js.txt:88-130` implements gesture recognition.
- `origin/main:src/runtime/main.part07.js.txt:20-107` casts and applies miracles.
- `origin/main:src/runtime/main.part09.js.txt:5-24` updates simulation.
- `origin/main:src/runtime/main.part09.js.txt:92-110` updates simple golem cleansing behavior.

## Dependency / Tooling Summary

- Runtime dependency: Three.js from CDN.
- Local build system: none.
- `package.json` has:
  - `verify`: `node scripts/verify-parable.mjs`
  - `turn:start`: `node scripts/parable-turn-guard.mjs start`
  - `turn:finish`: `node scripts/parable-turn-guard.mjs finish --summary "Verified Parable work turn."`
- `package.json` declares `"type": "module"` and no package dependencies.

Evidence:
- `origin/main:package.json:1-12`
- `origin/main:README.md:69-89`
- `origin/main:scripts/verify-parable.mjs:6-18`

## Available Run / Test / Verification Commands

Available in `origin/main`:
- `python3 -m http.server 8000`
- `node scripts/verify-parable.mjs`
- `npm run verify`
- `node scripts/parable-turn-guard.mjs start`
- `node scripts/parable-turn-guard.mjs finish --summary "..."`

Local reality:
- These commands are not currently runnable from the local worktree because the tracked app files are not checked out locally.
- The fetched remote tree proves the commands exist in Git history, not that this sparse local directory can execute them today.
- `npm run verify` was attempted from `/Users/andrew/Parable` and failed with `ENOENT` because `/Users/andrew/Parable/package.json` is absent from the sparse local worktree.

## Commands Actually Run

- `cd /Users/andrew/Parable`
- `pwd`
- `ls -la`
- `git status --short || true`
- `git branch --show-current || true`
- `git remote -v || true`
- `git config user.name || true`
- `git config user.email || true`
- `gh --version || true`
- `gh auth status || true`
- `gh repo view westkitty/Parable --json nameWithOwner,visibility,sshUrl,url`
- `git init -b main`
- `GIT_SSH_COMMAND='ssh -o BatchMode=yes -o ConnectTimeout=10' git ls-remote git@github.com:westkitty/Parable.git HEAD`
- `git remote add origin git@github.com:westkitty/Parable.git`
- `git fetch origin --prune`
- `git branch -a`
- `git ls-tree -r --name-only origin/main`
- `find . -maxdepth 4 -type f | sort`
- `cat package.json 2>/dev/null || true`
- `npm run 2>/dev/null || true`
- `npm run verify`
- Git history/recon commands against `origin/main`
- `git grep` searches across `origin/main`
- `git show origin/main:<path>` file inspections
- SHA-256 comparison of local and remote `docs/PROJECT_BIBLE.md`

## What Appears To Work

From remote evidence:
- Static shell and canvas wiring exist.
- Runtime chunk loader exists.
- Three.js import exists.
- Gesture capture and analysis exist.
- Clockwise spiral opener and vertical zigzag Fireball path exist.
- Ten miracle definitions exist.
- Miracle costs/cooldowns and region effects exist.
- Procedural villages, shrines, rival citadel, villagers, golems, and region ownership exist.
- Verification script exists and checks required files, chunk syntax, expected implementation hooks, static serving, and HTTP responses.

## What Is Unverified

- Live WebGL rendering in a real browser.
- Actual mouse feel.
- Camera feel.
- Gesture feel under human testing.
- Whether the old interface feels like godhood.
- Whether CDN import works in the user's browser/network.
- Whether the sparse local worktree can be safely reconciled with `origin/main` without preserving/reviewing the local conflicting `docs/PROJECT_BIBLE.md`.

## Implementation Reality Against July 2 Doctrine

| System | Current Evidence | Reality |
|---|---|---|
| Divine hand | No runtime/source evidence found for a hand body or hand model. | Missing. Current interaction is canvas pointer gesture, not embodied hand. |
| Camera | Three.js camera/rendering exists, but no inspected evidence of Black & White-like pan/orbit/zoom grammar. | Unproven. |
| Grabbing | No `grab`/`grabbable` runtime evidence found. | Missing. |
| Throwing / momentum | No `throw`/`momentum` runtime evidence found. | Missing. |
| Gesture miracles | Gesture analyzer and miracle casting exist. | Present, but still HUD-supported and untested by human feel. |
| Miracle learning | Ten miracles are predefined in runtime. | Missing as progression. Learned miracle doctrine not implemented. |
| Shrine discovery | Shrines exist as world objects. Shrine-based miracle discovery not found. | Partial world prop, missing learning loop. |
| Birth-of-god opening | No implementation evidence found. | Missing. |
| Symbol selection / propagation | No implementation evidence found. | Missing. |
| Temple UI | Persistent world HUD exists. No temple UI implementation found. | Missing and current UI fights doctrine. |
| Villagers / reactions | Villagers and state changes exist. | Partial. Simulation exists, emotional/social witness quality unproven. |
| Village temple / belief | Worship/faith exist. Village temples as allegiance anchors not found. | Partial/missing. |
| Golems / macros | Golem Wake creates simple cleansing helpers. | Partial. No macro programming, no resource/material/aspect system. |
| Rival god / opposition | Rival citadel and spreading pressure exist. | Partial. Rival god drama not implemented. |
| HUD / UI separation | `index.html` has persistent topbar, stats, miracle list, event log, controls, restart button. | Fails July 2 doctrine for normal world play. |

## Major Gaps Relative To July 2 Design

- No embodied divine hand.
- No invariant grabbable object model.
- No hold/drag/release-with-momentum throwing.
- No camera/control proof for mouse-first hand feel.
- No temple as diegetic major UI container.
- No symbol ritual, symbol selection, or world symbol propagation.
- No birth-of-god opening.
- No shrine-based miracle learning.
- No persistent learned miracle progression.
- No village temple allegiance implementation.
- No golem teach-by-demonstration or path-drawn macro system.
- No human review evidence for feel.
- Local checkout itself is not reconciled with remote app files.

## Repo Recon

Repo Vitals:
- Age: 2026-05-16 to 2026-07-02
- Commits: 51
- Branches: 2
- Analysis window: all time

Hotspots:
- `Parable_Bible.md`: 8 changes
- `docs/PARABLE_WORLD_FUNCTION_DOCTRINE_2026-07-02.md`: 3 changes
- runtime chunks and `styles.css`: 2 changes each

Bug magnets:
- No files found through `fix|bug|broken` commit search.

High-risk files:
- No file appears in both hotspot and bug-magnet lists.
- Practical risk is architectural, not fix-commit churn: chunked runtime and doctrine mismatch.

Bus factor:
- Contributors: `westkitty` only.
- Active contributors in last 3 months: 1 of 1.

Momentum:
- 2026-05: 40 commits
- 2026-07: 11 commits
- Trend: sparse/erratic due short history, not enough months for a serious trend claim.

Firefighting:
- No `revert|hotfix|emergency|rollback` commits found.
