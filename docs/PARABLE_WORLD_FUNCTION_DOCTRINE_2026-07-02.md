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

## Hand Appearance Rule

The player may have complete control over the appearance of the divine hand from a set of in-game options. The hand may be humanoid, clawlike, made of light, abstract, elemental, skeletal, carved, radiant, shadowed, or any other authored form included by the game.

The hand is the player's only embodied god-presence. Changing the hand's appearance is therefore an identity customization feature, not a cosmetic side menu. It belongs in the temple.

Morality/world-state may affect the hand's appearance over time. A benevolent, protective, cruel, feared, neglected, corrupted, or awe-inspiring god may gradually alter the hand's surface, aura, gesture traces, light, color, shadow, texture, or small adornments. This should enrich identity without making the hand unusable or overriding the player's chosen base form.

## Hand Control Rule

The exact mouse-first hand controls should chase the Black & White-style control grammar in extreme detail. Mouse comes first. Touch parity is desirable later, but not equal priority.

Core control expectations:

- click/press to engage with the world;
- hold to grip;
- drag to carry, pull, push, or position;
- release with motion to throw using momentum;
- scroll wheel to zoom;
- mouse movement and/or edge/drag behavior for pan/orbit/zoom navigation as specified in the eventual control spec;
- miracle gesture input must feel like drawing with the hand over the world, not clicking a spell button.

Future specs should document this control grammar behaviorally and exhaustively.

## Symbol Rule

The god symbol is the player's chosen mark. It should function similarly to the god-symbol idea in Black & White-like god play, while remaining original to Parable.

At the start, the game may present a small glowing pop-up or ritual choice with around five initial symbol options. These can be suggested based on the opening miracle path and first unlocked miracle. For example:

- Fireball start -> symbol options that visually echo or vary the Fireball glyph language.
- Rain start -> symbol options that echo rainfall, cloud, wave, or mercy glyph language.
- Healing start -> symbol options that echo restoration, hand, spiral, life, or mending glyph language.
- Sanctuary/Protection start -> symbol options that echo shelter, ward, ring, dome, shield, or enclosure glyph language.

The player must always be able to change the symbol later inside the temple. The symbol is an identity mark, not a mechanical prison.

## Symbol Expression in the World

The god symbol should propagate into the living world through physical, social, and moral expression.

Examples:

- villagers paint the symbol on walls, stones, doors, temple surfaces, banners, and shrine objects;
- golems bear the symbol as marks, carvings, glowing glyphs, or constructed motifs;
- flags, village markers, shrine banners, and ritual objects carry the symbol;
- influence visuals may echo the symbol in subtle terrain, light, smoke, wind, water, or flower patterns;
- morally good/protective villages may develop organic symbol expressions, such as flowers growing in the shape of the player's symbol in a meadow;
- fearful or corrupted expressions may show the symbol as scorch marks, ash, cracks, shadow, warning carvings, or harsh banners.

The symbol should feel like something people recognize, repeat, paint, fear, celebrate, and accidentally grow into the world.

## UI Surface Rule

The main world should have basically no conventional UI except the hand and world-space feedback.

No normal persistent HUD should carry numbers, letters, stats, options, save controls, settings, tutorials, or management panels during regular play.

Letters, words, or numbers may briefly appear only when they function like a cutscene, speech, prayer, dialogue, or direct communication moment. Brief language is acceptable when someone is speaking or the world is explicitly communicating; it should not become an always-on dashboard.

The only major place where explicit UI should surface is inside the temple, following the Black & White-like idea that the temple is the god's internal/management space.

The player should click/enter the temple to access major configuration, review, and management surfaces. The temple interior can then present UI through diegetic scenes, rooms, murals, villagers, icons, ritual spaces, and physical metaphors rather than flat menus floating over the world.

## Temple Entry / Exit Rule

Entering the temple may include a small, acceptable immersion break.

Preferred transition:

1. The player clicks the temple doorway or an equivalent temple entry point.
2. The world camera zooms into the doorway.
3. The screen fades to black.
4. The view fades into a more static temple interior interface.

This is acceptable because the temple is a special god-space and not ordinary world traversal. The transition should still feel ceremonial rather than like opening a settings menu.

## Temple as Interface

The temple should function as Parable's primary diegetic UI container.

The temple interior can be a more static area with directional navigation. The player may click left/front/right or other clear directions to rotate or shift between temple chambers.

Examples:

- click left -> symbol chamber, with people painting, carving, or arranging god symbols;
- click front -> save/history/world-state chamber;
- click right -> options/settings/accessibility chamber;
- other chambers may be added for miracles, villages, golems, world travel, and history.

Possible temple sections:

- Symbol chamber: villagers painting, carving, or arranging different god symbols.
- Miracle chamber: glyphs, shrine records, learned miracles, upgrade tiers, old-god inscriptions.
- Village chamber: maps, offerings, village temples, allegiance, prayers, and belief flow.
- Golem chamber: assembled golem parts, macro demonstrations, path drawings, construction materials, active golem upkeep.
- History chamber: old gods, found shrines, discovered glyphs, rival god signs, campaign memory.
- World chamber: island travel, conquered/lost villages, shrine construction choices, local island bonuses.
- Save chamber: save/load, campaign memory, world-state records.
- Options chamber: settings, accessibility, input tuning, display/audio preferences.
- Tutorial chamber: replayable teachings, control diagrams, discovered glyph references.

The point is not to create a huge menu. The point is to make necessary management feel sacred, physical, and located inside the god's temple rather than pasted onto the world.

## Symbol UI Example

Changing the god symbol should not be a normal settings screen if avoidable. A better version:

- The player enters the temple.
- A chamber contains villagers, priests, or attendants painting/carving different possible symbols.
- Symbols are shown as banners, wall marks, carved stones, or floating glyph tablets.
- The player selects one by touching/grabbing/placing/confirming it with the hand.
- The chosen symbol updates shrine banners, village markers, temple surfaces, golem markings, influence visuals, and organic village expressions.

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
11. What hand forms ship in the first vertical slice?
12. How much can morality alter the hand without overriding player choice?
13. Which temple chambers exist in the first slice versus later?
14. What minimal symbol-selection pop-up is allowed at the start before the player has entered the temple?

## First-Slice Temple Minimum

The first vertical slice does not need every temple chamber. The minimum useful temple could include:

1. Symbol chamber: choose/change god symbol.
2. Hand chamber or identity chamber: choose hand appearance if included in the first slice.
3. Save/front chamber: save/load or campaign-state representation.
4. Options chamber: input, audio, display, accessibility.
5. Miracle chamber: learned starter miracles and discovered glyph references.

If this is still too much, prioritize symbol, options/input tuning, and miracle references first.

## Non-Negotiables

- No player god avatar beyond hand and symbol.
- No creature-supervision fantasy.
- No dashboard-first game loop.
- No normal RPG character sheet for the god.
- No persistent conventional HUD as the primary interface.
- No numbers/letters/stats/options/saving/tutorial panels in the normal world HUD.
- No miracle loadouts; learned miracles remain available.
- No arbitrary changes to what the hand can grab.
- Mouse-first Black & White-style controls must be specified in extreme detail.
- Hand appearance may be customizable, but the hand remains the god's only embodied presence.
- Morality can affect the hand, but must not erase player choice or make the hand hard to read/use.
- Temple UI must support the god fantasy rather than feeling like admin software.

## Fable/Codex Handoff Note

Future Fable work should include this doctrine when preparing the Parable rewrite plan. Fable should treat the temple interface and god-representation model as core architecture, not flavor polish.

Future Codex work should not implement a conventional overlay menu for major systems unless explicitly requested. If UI is needed, first ask whether it belongs in world-space or inside the temple.
