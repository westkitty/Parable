# Parable Project Bible

## Bootstrap Prompt for Successor AI

Read `Parable_Bible.md` first and treat it as the authoritative project state record. Then inspect the repository itself to verify current state, file layout, and implementation details. If the repository contains work missing from this bible, append a reconciliation entry instead of rewriting prior history. Use the bible plus the repository as the complete handoff source. Continue the project from current state, and after each meaningful completed work unit, append a new additive ledger entry recording files changed, commands run, command intent, outputs, decisions, bugs, corrections, resulting state, and next steps. Never delete or rewrite older entries; when something earlier is wrong, append a correction entry that supersedes it.

## Project Goal

- Primary objective: Build Parable as a browser-playable god-game prototype where miracles are cast by drawing ritual gestures directly over a living island.
- Protected core ritual: clockwise spiral -> vertical zigzag = Fireball.
- Success criteria: The project remains static-browser playable, has guardrails against regression, exposes a meaningful miracle roster, and records project state additively.

## Scope

- Included: Static web app, Three.js procedural prototype world, gesture ritual loop, miracle roster, villager simulation, region ownership, asset planning docs, verification scripts, and turn guard.
- Excluded for now: Build tooling, server backend, final art assets, final audio, save system, production balancing, and full offline dependency vendoring.

## Constraints

- Preserve no-build static browser structure unless there is a strong reason to change it.
- Do not remove the turn guard or verification scripts.
- Do not claim browser/WebGL success unless tested in a real browser.
- Current runtime imports Three.js from `https://esm.sh/three@0.164.1`, so a normal browser with network access is required unless Three.js is vendored locally.

## Assumptions

- Current procedural assets are prototype stand-ins, not final assets.
- Gesture recognition needs real mouse/touch tuning after browser testing.
- The GitHub connector may write one file per commit, so repo history can contain many small publish commits.

## Architecture / Design

- `index.html`: static shell and HUD.
- `styles.css`: responsive dark mythic interface styling.
- `src/main.js`: small runtime loader that fetches chunk files from `src/runtime/` and imports the assembled module.
- `src/runtime/main.partNN.js.txt`: chunked Three.js gameplay runtime.
- `scripts/parable-turn-guard.mjs`: start/finish regression guard.
- `scripts/verify-parable.mjs`: project verifier for required files and implementation hooks.
- `docs/GENERATED_ASSET_LIST.md`: future non-placeholder asset plan.
- `docs/PROJECT_BIBLE.md`: readable project-state companion; this root bible remains authoritative.

## File Map

- `index.html`: Browser entry point.
- `styles.css`: UI and layout styling.
- `src/main.js`: Runtime chunk loader.
- `src/runtime/main.part01.js.txt` through `main.part12.js.txt`: Chunked runtime.
- `README.md`: Run instructions and current feature summary.
- `package.json`: Script aliases for verifier and guard.
- `scripts/parable-turn-guard.mjs`: Start/finish snapshot guard.
- `scripts/verify-parable.mjs`: Project verifier.
- `docs/PROJECT_BIBLE.md`: Human-readable state notes.
- `docs/GENERATED_ASSET_LIST.md`: Asset generation plan.
- `docs/TURN_START_CHECKLIST.md`: Start checklist.
- `docs/TURN_FINISH_CHECKLIST.md`: Finish checklist.

## Current State Summary

- Project status: Browser-playable static prototype by structure; live visual WebGL behavior still requires a real browser check with network access.
- What exists: Three.js procedural island, villages, shrines, villagers, rival citadel, region ownership, ten miracle roster, ritual gesture loop, procedural effects, guard scripts, verifier, asset list, README, docs.
- What is missing: Real browser/WebGL verification, local vendored Three.js, final assets, final audio, better gesture tuning, broader balancing.

## Open Questions

- Should Three.js be vendored locally next to remove CDN failure as a verification blocker?
- Should runtime chunks be refactored into true ES modules once connector publishing pressure is lower?
- Which final visual style should replace the procedural placeholder asset kit?

## Chronological Ledger

### Entry 1 - Remote bible initialized

Summary:
- Created root `Parable_Bible.md` in `westkitty/Parable` after publishing the verified prototype files and anti-regression guardrails through the GitHub connector.

Reason / Intent:
- The repository needed an authoritative root project bible, not only a companion doc under `docs/`.
- The local workspace was not a git checkout, so the GitHub connector was used as the practical push route.

Files Changed:
- `Parable_Bible.md`

Commands Run:
```text
No local git commands changed the remote because `/workspace` was not a git checkout and direct GitHub network access from the container failed DNS resolution.
GitHub connector writes were used instead.
```

Command Intent:
- Preserve project continuity and record the actual remote publish path.

Outputs Generated:
- Root project bible committed to `main`.

Decisions:
- Kept the no-build static architecture.
- Preserved the protected ritual law: clockwise spiral -> vertical zigzag = Fireball.
- Kept the chunked runtime approach because connector-based publishing made large single-file edits brittle.

Bugs / Blockers:
- `/workspace` had no `.git`, so literal local `git add`, `git commit`, and `git push` were unavailable.
- Direct `git ls-remote https://github.com/westkitty/Parable.git HEAD` failed with DNS resolution for `github.com` from the container.
- GitHub connector writes succeeded but created one commit per file operation.

Correction:
- Treat prior claims of local staging/commit ability as inapplicable to this workspace. The remote was updated through GitHub API commits instead.

State After Completion:
- Remote `main` contains the browser app shell, styles, 12-part runtime loader system, guard scripts, verifier, generated asset list, start/finish checklists, README, project-state notes, and this root bible.

Next Step / Handoff:
- Run a real browser test from a normal networked machine: `python3 -m http.server 8000`, open `http://localhost:8000`, then test clockwise spiral -> vertical zigzag = Fireball.
- Next engineering improvement should vendor Three.js locally to remove CDN dependency and make browser verification more deterministic.

### Entry 2 - Golem doctrine clarified

Summary:
- Clarified the design role of golems in Parable. Golems are a presence and automation system, not a replacement core fantasy and not a creature-system clone.

Reason / Intent:
- The user clarified that the old creature idea weakened the god fantasy by making the player feel like a supervisor of a Tamagotchi-like entity instead of the god.
- The user wants the game to remain centered on direct god-perspective abilities even if golems become numerous or strategically useful.
- The golem system should preserve the useful gameplay space of delegated repeated actions without shifting agency away from the player.

Files Changed:
- `Parable_Bible.md`

Commands Run:
```text
GitHub connector update_file was used to append this ledger entry to `Parable_Bible.md` on `main`.
```

Command Intent:
- Preserve a durable design-law correction before future planning, Fable prompts, Codex prompts, or implementation work accidentally re-center the game around creature-like companions.

Outputs Generated:
- Additive project bible entry defining the golem doctrine and player-agency rule.

Decisions:
- Golems are not creatures, pets, avatars, or mandatory companions.
- Golems are optional tools for creating divine presence through delegated automation.
- Golems may be built, invested in, and programmed with repeatable macro-like tasks.
- The player must retain the full god-perspective ability set; golems must not take over core play.
- Golems should create presence through authorship and delegation, not through personality or creature attachment.
- Parable should avoid making the golem feel like the true god while the player merely supervises.

Doctrine:
```text
Golems are optional vessels of delegated divine will. They are not alive, not pets, not creatures, and not the core of Parable. They exist to create presence by letting the god externalize a repeated command into the world. The player remains the god and must retain direct divine abilities regardless of whether any golems are active. A golem may automate a macro-like behavior, but it must never become the central fantasy, the primary avatar, or a mandatory Tamagotchi-style companion.
```

Bugs / Blockers:
- No gameplay implementation was changed in this entry.
- The current runtime still appears to treat `Golem Wake` as a simple cleanse helper; the richer macro-programming doctrine remains a design target, not a verified implemented system.

Correction:
- Any prior framing that treated golems as the main replacement for all creature-system emotional weight is superseded. Golems replace the creature system only as a presence/automation layer, while the core fantasy remains direct godhood.

State After Completion:
- Parable's authoritative project bible now records that golems are optional embodied macros/presence tools and that direct god-perspective power remains primary.

Next Step / Handoff:
- Future Fable or Codex prompts should include this doctrine whenever discussing creature replacement, golem design, automation, tutorial structure, or core fantasy.
- Next design pass should define the player's direct god abilities separately from optional golem macro abilities so automation supports godhood instead of consuming it.

### Entry 3 - Golem resource doctrine clarified

Summary:
- Refined the golem doctrine so golem creation and macro programming are resource-based rather than a reduction of the player's divinity.

Reason / Intent:
- The user clarified that golems should be powerful because they reward planning, materials, aspects, elements, and macro design, not because they tax the god's core divinity.
- The user rejected the idea that investing divine will should function primarily as a cost that takes away from the player's godhood.
- The user noted that a temporary symbolic sacrifice, such as binding one finger of the divine hand until it regrows, could be visually interesting but should not become the default core cost model.
- The core fantasy requires the player to remain fully divine; taking away from divinity would undermine the feeling of being a god.

Files Changed:
- `Parable_Bible.md`

Commands Run:
```text
GitHub connector update_file was used to append this ledger entry to `Parable_Bible.md` on `main`.
```

Command Intent:
- Prevent future design, Fable, or Codex prompts from making golems cost the player's divine identity or baseline god powers.

Outputs Generated:
- Additive project bible entry defining golem power as resource-and-planning driven.

Decisions:
- Golem power should come from resource investment, material choice, elemental/aspect composition, planning, and macro quality.
- Golems should not impose a standing penalty to the player's core divinity, direct god abilities, or baseline god fantasy.
- Divine will may be represented ceremonially, symbolically, or narratively, but should not be a primary mechanical drain that makes the player feel less like a god.
- Optional temporary embodiment costs, such as binding a finger of the divine hand until it regrows, remain possible special-case flavor, not the default economy.
- The reward for a well-built golem is that it is powerful and useful when assembled intelligently.
- The player remains the god before, during, and after golem deployment.

Doctrine:
```text
Golems are powered by resources, materials, elements, aspects, and macro design. They should reward planning and construction skill, not reduce the player's core divinity. Investing divine will should usually mean giving a command sacred authority or identity, not losing baseline god power. Any temporary hand/finger sacrifice mechanic may be used as rare symbolic flavor, but the default rule is that golems cost world-facing resources rather than the godhood fantasy itself.
```

Bugs / Blockers:
- No gameplay implementation was changed in this entry.
- The current runtime still appears to treat `Golem Wake` as a simple cleanse helper; the richer resource/material/aspect macro system remains a future design and implementation target.

Correction:
- Entry 2 remains valid but is refined: golems are optional vessels of delegated divine will, but delegation must not be modeled as subtracting from the player's divinity by default.

State After Completion:
- Parable's authoritative project bible now records that golems should be resource-and-planning based, while direct godhood remains intact.

Next Step / Handoff:
- Future design work should define the direct god ability set separately from optional golem macro abilities, then define golem costs using materials, resources, elements, aspects, construction steps, and macro constraints instead of divine-power penalties.
- Future Fable or Codex prompts should include Entry 2 and Entry 3 together when designing golems.
