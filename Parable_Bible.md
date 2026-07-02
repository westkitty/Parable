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

### Entry 4 - Black and White control grammar target

Summary:
- Clarified that Parable should target the exact kind of control feel and world feel associated with Black & White-style god play, while remaining a distinct original game.

Reason / Intent:
- The user wants Parable to feel like loading into a god game where the player immediately inhabits divine control over a tactile world.
- The requested target is not merely a generic god-game influence system; it is a direct manipulation control grammar and world presentation style close to the remembered Black & White feeling.
- This reinforces earlier doctrine: the player is the god, not a supervisor of a creature or an abstract dashboard.

Files Changed:
- `Parable_Bible.md`

Commands Run:
```text
GitHub connector update_file was used to append this ledger entry to `Parable_Bible.md` on `main`.
```

Command Intent:
- Preserve the design target before future implementation planning, so Parable does not drift into button-driven RTS, abstract sim UI, or detached strategy-map controls.

Outputs Generated:
- Additive project bible entry defining the control/world-feel target.

Decisions:
- Parable should inherit the control philosophy of direct god-hand manipulation: touching, grabbing, dragging, throwing, blessing, punishing, shaping, and gesturing over the living world.
- The world should feel like a tactile miniature island under divine control, not a flat strategy dashboard.
- The camera/world style should favor readable 3D diorama/island presentation, strong sense of scale, villages and worshippers visible as living miniatures, and a ceremonial feeling when loading in.
- UI should be minimized or made diegetic where possible; primary play should occur through the hand/world, not through spell buttons or panels.
- Gesture miracles remain compatible with this goal only if they feel like physical divine ritual performed over the world rather than abstract drawing on a HUD.
- Golems remain optional automation/presence tools and must not replace the player's direct control grammar.
- Parable must avoid copying proprietary Black & White assets, names, code, exact content, or protected expression; the target is control feel, world grammar, and god-fantasy design, not IP duplication.

Doctrine:
```text
Parable's control and world-feel north star is Black & White-style god play: a tactile divine hand over a living 3D island, with direct manipulation, physical-feeling gestures, villagers that visibly react, and a world that feels like a miniature sacred place under the player's godhood. Parable must not become a button-first RTS, a detached dashboard sim, or a creature-supervision game. The player should feel like the god from the moment the world loads. This is an experiential and control-grammar target, not permission to copy proprietary Black & White assets or protected content.
```

Bugs / Blockers:
- No gameplay implementation was changed in this entry.
- The current runtime still uses HUD panels and gesture drawing; future implementation must evaluate whether the controls feel like direct god-hand manipulation in a real browser session.

Correction:
- Earlier framing around browser prototype, gesture roster, and golem automation remains valid but is subordinate to the higher experiential target: the player must feel like a god directly controlling a living world.

State After Completion:
- Parable's authoritative project bible now records Black & White-style direct control and tactile 3D world feel as the control/world north star.

Next Step / Handoff:
- Future design work should define a direct hand-control specification: camera movement, grab/drag/throw, object interaction, villager manipulation, miracle gesture feel, world-space UI, and onboarding.
- Future Fable or Codex prompts should include Entry 4 whenever planning controls, camera, UI, world presentation, tutorial, or moment-to-moment feel.

### Entry 5 - Visual-mechanical target split

Summary:
- Clarified the Parable target split: graphically aim closer to Black & White 2, while mechanically aiming closer to Black & White 1 or an imagined Black & White 1.5.

Reason / Intent:
- The user wants the game to preserve the tactile god-control and systemic feel of the first Black & White era while benefiting from a richer, more readable, more polished world presentation associated with the sequel.
- This prevents future planning from flattening the target into either a pure Black & White 1 nostalgia clone or a prettier but mechanically shallower sequel-like direction.
- The phrase "1.5" means Parable should feel like a natural mechanical evolution of the first game: more modern and legible, but still centered on god-hand agency, living-world reactivity, worship, villagers, miracles, and direct divine presence.

Files Changed:
- `Parable_Bible.md`

Commands Run:
```text
GitHub connector update_file was used to append this ledger entry to `Parable_Bible.md` on `main`.
```

Command Intent:
- Preserve the visual/mechanical split before future Fable prompts, Codex prompts, asset direction, control design, or engine/app architecture work.

Outputs Generated:
- Additive project bible entry defining the graphics-vs-mechanics target.

Decisions:
- Visual direction should lean toward a polished, readable, cinematic, lively 3D island presentation closer to the remembered appeal of Black & White 2.
- Mechanical direction should lean toward Black & White 1-style god play, direct hand control, systemic reactivity, worship, miracles, villagers, and toybox divine manipulation.
- "Black & White 1.5" is the preferred shorthand for the mechanical ambition: not a remake, not a sequel clone, but a more legible evolution of the first game's god-fantasy mechanics.
- UI, golems, automation, and future systems must support the B&W 1 / 1.5 god-fantasy mechanics rather than turning the game into an RTS, city builder, or creature-management sequel imitation.
- Parable must still remain original and must not copy proprietary assets, names, exact content, code, or protected expression from Black & White or Black & White 2.

Doctrine:
```text
Parable should be graphically closer to the remembered strength of Black & White 2: richer 3D island presentation, clearer settlements, stronger visual spectacle, and a more polished sense of place. Mechanically, Parable should be closer to Black & White 1 or an imagined Black & White 1.5: tactile god-hand control, living-world reactivity, villagers and worship, miracles, moral consequence, and direct divine agency. The target is not Black & White 2's mechanical direction if that weakens the god fantasy; it is Black & White 1's soul with a more modern visual body.
```

Bugs / Blockers:
- No gameplay implementation was changed in this entry.
- Current procedural assets remain placeholders and do not yet meet the richer B&W2-like visual target.
- Current mechanics still need direct hand-control proof and expansion before they can satisfy the B&W1/1.5 mechanical target.

Correction:
- Entry 4 remains valid and is refined: the Black & White-style control/world target now has a split reference point, with B&W2 influencing graphics and B&W1/1.5 influencing mechanics.

State After Completion:
- Parable's authoritative project bible now records the visual/mechanical split as a durable target.

Next Step / Handoff:
- Future design work should produce two separate specs: a visual target brief for the richer island/world presentation, and a mechanical/control spec for B&W1/1.5-style god play.
- Future Fable or Codex prompts should include Entries 4 and 5 together whenever planning graphics, controls, world feel, UI, mechanics, or scope.

### Entry 6 - Core control and opening doctrine

Summary:
- Captured a major design-answer pass covering direct miracle access, invariant object interaction, Black & White-like mouse/touch grammar, birth-of-god opening, golem limits, golem resource economy, villager reactions, opposition, minimal UI, and likely rewrite/Fable direction.

Reason / Intent:
- The user answered the current design discovery queue with specific rules that materially define the game.
- These rules clarify that Parable should prioritize exact-feeling direct control and god embodiment, not a generic inspired-by god-game layout.
- Future Fable/Codex work must not reinterpret these decisions as optional flavor.

Files Changed:
- `Parable_Bible.md`

Commands Run:
```text
GitHub connector update_file was used to append this ledger entry to `Parable_Bible.md` on `main`.
```

Command Intent:
- Preserve the user's core control and system answers before generating Fable prompts, rewrite plans, implementation specs, or revised architecture.

Outputs Generated:
- Additive project bible entry defining concrete gameplay laws and unanswered follow-up areas.

Decisions:
- Every miracle the player has learned should always remain available, without exception. Learned miracles should not be temporarily removed, hidden, disabled by loadout, or displaced by golem use.
- The player should always be able to grab interactable things consistently. What the player can grab should not change unpredictably or depend on arbitrary modes.
- The player should always be able to interact with things in the same way. Direct manipulation grammar must be stable.
- Mouse and touch control grammar should chase the Black & White feeling as closely as legally and practically possible: click/press, hold, drag, throw with momentum, scroll-wheel zoom, pan, zoom, orbit, and physical-feeling hand/world interaction.
- Grabbing and throwing should be the same interaction family: hold the button/touch, move with intent, release/throw using momentum.
- The first five minutes should show the birth of a god.
- Because things become sacred because people choose to make them sacred, the opening can begin from a villager's dream that spreads socially: dream -> telling a friend -> belief growth -> god-presence emergence.
- The dream seed can vary based on player input, including nightmare, blessing, fear, awe, or other early tonal pathways.
- The smallest vertical slice proving the fantasy is the ability to move around the island with B&W-like controls while casting miracles as the god.
- Golems can never cast miracles. Only the god can cast miracles.
- Golems may perform many non-miracle physical actions the god can perform, such as picking things up and moving them, but much slower and as delegated automation.
- Golem triggers may include proximity, time of day, village resource need, villager requests, and enemy presence.
- Golems should cost belief/faith/worship as a persistent running cost, scaling with macro complexity.
- Golem construction costs should use material resources. Wood-like materials suit labor-focused golems; hardened materials suit combat, structural, or serious-duty golems.
- Villagers should physically react and emote comfortably, with stylized emoji-like readable expression cues allowed.
- Rival/opposition space may include new gods, other gods, old gods, and different gods. A new god may appear partway through a campaign level.
- UI target is basically no UI except the hand. Any unavoidable information should be minimal, diegetic, or subordinate to hand/world play.
- A major rewrite is likely, and Fable is expected to be used for planning it.

Doctrine:
```text
Parable's core play should be stable, direct, and god-centered. Learned miracles are always available. Grabbable things remain consistently grabbable. Interaction rules do not drift by arbitrary mode. The hand-control grammar should chase Black & White-style physicality: hold, drag, throw with momentum, pan, zoom, orbit, and act directly on a living island. The opening should dramatize the birth of a god through belief emerging from a villager dream that spreads socially. Golems may automate many non-miracle physical actions, but they can never cast miracles. Only the god casts miracles. Golems cost material resources to build and belief/faith/worship to keep running, with macro complexity increasing the ongoing cost. The UI should be nearly absent except for the hand and world-space feedback.
```

Bugs / Blockers:
- No gameplay implementation was changed in this entry.
- The current prototype does not yet prove Black & White-like hand control, invariant grabbing, momentum throwing, minimal UI, or birth-of-god opening.
- The current runtime's golem behavior remains much simpler than the desired macro-trigger/resource-cost design.

Open Questions Raised:
- What exact learned-miracle list exists in the first real vertical slice?
- What are the legal/practical boundaries for closely chasing the Black & White control grammar without copying protected implementation or content?
- What is the exact dream-input structure in the opening: how many choices, what tones, what downstream effects?
- What physical object classes can both god and golems manipulate in the first slice?
- What are the first golem materials and how do they map to labor, defense, structure, combat, or other duties?
- How is belief/faith/worship generated, stored, spent, and drained by active golem macros?
- How should minimal hand-only UI communicate miracle availability, golem macro cost, resource need, and villager emotion without becoming a dashboard?
- What engine/platform best proves the hand-control feel fastest if significant rewrite is likely?

Correction:
- Entries 4 and 5 remain valid and are made more concrete: the Black & White-like control target now specifically includes stable grabbing, momentum throwing, scroll/pan/zoom/orbit grammar, always-available learned miracles, and almost no UI except the hand.
- Entries 2 and 3 remain valid and are made more concrete: golems are optional automation/presence tools, cannot cast miracles, can perform non-miracle physical actions slowly, and are powered by material build costs plus ongoing belief/faith/worship cost.

State After Completion:
- Parable's authoritative project bible now records the core interaction laws, opening concept, golem action boundaries, golem economy direction, opposition concept, and minimal-UI target.

Next Step / Handoff:
- Future Fable work should synthesize these entries into a rewrite-ready design plan, not code.
- The next artifact should be a Fable-ready context packet or prompt for a `Parable Direct Godhood Rewrite Plan`, focused on hand controls, miracle access, first-five-minutes birth-of-god opening, golem macro boundaries, and a vertical slice architecture.

### Entry 7 - Miracle discovery and shrine progression doctrine

Summary:
- Captured the miracle discovery/progression model: miracles and their upgrades should be found in the world through old-god shrines, glyph motifs, environmental rituals, and player tracing, rather than primarily unlocked through quest rewards.

Reason / Intent:
- The user identified found miracles as a beloved Black & White-like element that should be expanded.
- Parable's world has had gods for a very long time; many gods existed, left marks, and eventually vanished or lost power.
- Miracle discovery should make the world feel ancient, sacred, and investigable instead of using a generic quest-unlock or level-up menu.

Files Changed:
- `Parable_Bible.md`

Commands Run:
```text
GitHub connector update_file was used to append this ledger entry to `Parable_Bible.md` on `main`.
```

Command Intent:
- Preserve the miracle discovery, upgrade, shrine, village-temple, object-grabbing, golem-pathing, and first-rival-god doctrine before Fable rewrite planning.

Outputs Generated:
- Additive project bible entry defining miracle acquisition, upgrade tiers, starting miracles, shrine bonuses, village temples, draggable object classes, golem path teaching, and first rival-god reveal direction.

Decisions:
- Miracles should often be discovered in the world, not simply awarded by quests.
- Ancient/older-god shrines throughout islands can contain gesture glyphs as part of their motif, giving the player visual access to a miracle's required symbol.
- Discovery should involve an interactive environmental ritual or puzzle. Example: a lightning shrine near a perpetual storm could require carrying metal, ore, or a pole to a clear altar, causing lightning to strike and awaken the glyph.
- Once a shrine glyph is awakened, the player should trace the glyph to learn the miracle.
- Miracles should have upgrade tiers. It is more important to support strong core miracles with upgrades than to create dozens of separate miracles.
- First core miracle family should start with four candidates: Healing, Rain, Fireball, and one undecided fourth miracle.
- The player should start with only one miracle, determined by the opening dream/character-direction input. A destructive dream can funnel toward Fireball; a flood/storm dream can funnel toward Rain; a plague-rescue dream can funnel toward Healing; the fourth path remains undecided.
- Other starting miracles should be discoverable nearby as part of the tutorial island's learning structure.
- Miracle upgrades should be found throughout the worlds through shrines/glyphs, then retained permanently after being learned.
- Once the player learns how to upgrade a miracle, building a compatible shrine on an island should grant island-local benefits such as cheaper casting near/on that island.
- Upgrade shrines should be expensive enough to incentivize meaningful construction choices, but learned upgrades should not disappear when the player leaves an island.
- Building shrines should contribute to the living world; abandoning or moving beyond an island should not erase the player's learned progress.
- Each village can have a temple. Destroying a village temple means the god in charge loses that village. This replaces the single-central-temple problem and avoids forcing villagers to wander huge distances to one global temple.
- The hand should be able to grab villagers, rocks, trees, food, wood, shrine objects, golems, enemies, and golem parts.
- Buildings should be placeable, but not freely grabbable without major damage; grabbing or wrenching a building should be destructive or exceptional.
- Sculpting and terrain chunk manipulation are desirable as miracle-tier powers, but implementation feasibility remains open.
- Golem programming should include teach-by-demonstration and direct path drawing: the player can click/select a golem and literally draw the line/path it will walk.
- Golem behavior should avoid spreadsheet-like rule editing.
- First rival-god reveal can occur during an old-god shrine activation: while the player is working to awaken a compelling glyph, another god appears, steals or seizes the opportunity, and defeats or humiliates the player enough to establish threat.
- Black & White-like control specificity must be documented in extreme detail.
- Mouse-first control proof is required. Touch parity is desirable but not expected to be reliable or equal at first.

Doctrine:
```text
Parable's miracle progression should be archaeological and sacred. The world is full of old gods, dead gods, forgotten gods, and their shrines. Miracles and upgrades are discovered by reading shrine glyphs, solving physical environmental rituals, awakening symbols, and tracing the glyph with the divine hand. The game should prefer a small set of strong miracles with upgrade tiers over dozens of shallow miracles. The player begins with one dream-seeded miracle, then discovers nearby tutorial miracles before encountering older, stranger, and more contested shrine knowledge across islands. Learned miracles and upgrades persist, while compatible island shrines provide local bonuses such as cheaper casting. Village temples define village allegiance: if a god's village temple is destroyed, that god loses the village.
```

Bugs / Blockers:
- No gameplay implementation was changed in this entry.
- Current prototype does not yet support shrine-based miracle discovery, environmental glyph puzzles, miracle upgrades, village temples, destructive building grabbing, terrain-sculpting miracle tiers, or path-drawn golem macros.

Open Questions Raised:
- What is the fourth starter miracle family alongside Healing, Rain, and Fireball?
- What exact dream inputs map to the four starter miracle paths?
- How many upgrade tiers should each miracle have, and what does each tier change: power, radius, duration, cost, precision, side effects, or moral interpretation?
- Which shrine benefits are local-only versus permanently retained?
- What are the first tutorial-island shrine puzzles for Healing, Rain, Fireball, and the fourth miracle?
- What object physics and damage rules govern grabbing buildings or terrain chunks?
- What are the first old-god shrine types and visual motifs?
- What is the identity, tone, and first action of the rival god that interrupts the shrine activation?

Correction:
- Entry 6's open question about the first learned miracle list is partially answered: start with one dream-selected miracle from a set of four, with Healing, Rain, Fireball, and one undecided fourth as the early core.
- Entry 6's object-grabbing question is partially answered: the hand can grab villagers, rocks, trees, food, wood, shrine objects, golems, enemies, and golem parts; buildings are placeable but not safely grabbable; terrain sculpting/chunks are miracle-tier aspirations.
- Entry 6's golem-programming question is refined: use teach-by-demonstration plus direct path drawing, not spreadsheet conditions.
- Entry 6's engine/control question is refined: mouse-first proof is the priority; touch parity is secondary and may not be fully achievable.

State After Completion:
- Parable's authoritative project bible now records the miracle discovery loop, old-god shrine progression, upgrade doctrine, starter miracle structure, village-temple allegiance model, object grabbing list, golem pathing direction, rival-god reveal concept, and mouse-first control priority.

Next Step / Handoff:
- Future Fable work should integrate Entries 4-7 into a coherent rewrite plan and vertical slice brief.
- The next artifact should probably be a Fable-ready `Parable Direct Godhood Rewrite Context Packet` followed by a Fable prompt for the control scheme, miracle discovery tutorial island, shrine upgrade system, and first rival-god event.
