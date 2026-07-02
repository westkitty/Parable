# Parable World Function Doctrine - 2026-07-02

## Purpose

This document captures the current planning correction for Parable: the next useful work is not flavor prompts, but world-function doctrine. These decisions define what a god is allowed to be, where player identity lives, where UI is allowed to surface, and how the game should preserve the Black & White-style god fantasy without drifting into a dashboard or character-avatar game.

This file supplements `Parable_Bible.md`. It does not replace the project bible. Future planning, Fable prompts, Codex prompts, and implementation specs should treat these decisions as durable unless superseded by a later project-bible entry.

## Core Correction

The next planning priority is not writing the opening dream prompts. Those are flavor compared to the deeper system questions:

- What is the player's godhood representation?
- Where does identity live?
- Where is UI allowed to appear?
- What must remain world-space and hand-driven?
- How does the temple function as the only major interface surface?

## God Representation Rule

A god should never have a full physical avatar or embodied character representation beyond:

1. the divine hand, and
2. the player's chosen god symbol.

The player is not a creature, hero, body, statue-person, or map avatar. The player is the god acting through the hand and recognized through the symbol.

## Symbol Rule

The god symbol is the player's chosen mark. It should function similarly to the god-symbol idea in Black & White-like god play, while remaining original to Parable.

At the start, the game may suggest a few symbols based on the opening miracle path and the player's first unlocked miracle. For example:

- Fireball start -> symbol options that visually echo or vary the Fireball glyph language.
- Rain start -> symbol options that echo rainfall, cloud, wave, or mercy glyph language.
- Healing start -> symbol options that echo restoration, hand, spiral, life, or mending glyph language.
- Sanctuary/Protection start -> symbol options that echo shelter, ward, ring, dome, shield, or enclosure glyph language.

The player must always be able to change the symbol. The symbol is an identity mark, not a mechanical prison.

## UI Surface Rule

The main world should have basically no conventional UI except the hand and world-space feedback.

The only major place where explicit UI should surface is inside the temple, following the Black & White-like idea that the temple is the god's internal/management space.

The player should click/enter the temple to access major configuration, review, and management surfaces. The temple interior can then present UI through diegetic scenes, rooms, murals, villagers, icons, ritual spaces, and physical metaphors rather than flat menus floating over the world.

## Temple as Interface

The temple should function as Parable's primary diegetic UI container.

Possible temple sections:

- Symbol chamber: villagers painting, carving, or arranging different god symbols.
- Miracle chamber: glyphs, shrine records, learned miracles, upgrade tiers, old-god inscriptions.
- Village chamber: maps, offerings, village temples, allegiance, prayers, and belief flow.
- Golem chamber: assembled golem parts, macro demonstrations, path drawings, construction materials, active golem upkeep.
- History chamber: old gods, found shrines, discovered glyphs, rival god signs, campaign memory.
- World chamber: island travel, conquered/lost villages, shrine construction choices, local island bonuses.

The point is not to create a huge menu. The point is to make necessary management feel sacred, physical, and located inside the god's temple rather than pasted onto the world.

## Symbol UI Example

Changing the god symbol should not be a normal settings screen if avoidable. A better version:

- The player enters the temple.
- A chamber contains villagers, priests, or attendants painting/carving different possible symbols.
- Symbols are shown as banners, wall marks, carved stones, or floating glyph tablets.
- The player selects one by touching/grabbing/placing/confirming it with the hand.
- The chosen symbol updates shrine banners, village markers, temple surfaces, and influence visuals.

This keeps identity UI inside the world and reinforces that sacred things are made sacred by choice, ritual, and repeated social recognition.

## Planning Priority

For the next planning stage, prioritize functional/world-structure questions over flavor text. The dream prompts can come later.

Higher-priority questions:

1. What does the divine hand look like, do, and communicate?
2. What are the exact mouse-first hand controls?
3. What is the temple interior interface model?
4. What sections does the temple contain in the first vertical slice?
5. How does the player choose or change their god symbol?
6. How does the symbol appear in villages, shrines, golems, and influence?
7. What information is forbidden from appearing as normal HUD?
8. What information must remain available inside the temple?
9. What information can appear briefly in world-space near the hand, villagers, shrines, or objects?
10. How does entering/exiting the temple work without breaking immersion?

## Non-Negotiables

- No player god avatar beyond hand and symbol.
- No creature-supervision fantasy.
- No dashboard-first game loop.
- No normal RPG character sheet for the god.
- No persistent conventional HUD as the primary interface.
- No miracle loadouts; learned miracles remain available.
- No arbitrary changes to what the hand can grab.
- Temple UI must support the god fantasy rather than feeling like admin software.

## Fable/Codex Handoff Note

Future Fable work should include this doctrine when preparing the Parable rewrite plan. Fable should treat the temple interface and god-representation model as core architecture, not flavor polish.

Future Codex work should not implement a conventional overlay menu for major systems unless explicitly requested. If UI is needed, first ask whether it belongs in world-space or inside the temple.
