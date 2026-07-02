# Parable World Function Doctrine - 2026-07-02

## Purpose

This document captures the current planning correction for Parable: the next useful work is not flavor prompts, but world-function doctrine. These decisions define what a god is allowed to be, where player identity lives, where UI is allowed to surface, and how the game should preserve the Black & White-style god fantasy without drifting into a dashboard or character-avatar game.

This file supplements `Parable_Bible.md`. It does not replace the project bible. Future planning, Fable prompts, Codex prompts, and implementation specs should treat these decisions as durable unless superseded by a later project-bible entry.

## Core Correction

The planning priority is not writing dream flavor first. Those prompts are later-layer flavor compared to the deeper system questions:

- What is the player's godhood representation?
- Where does identity live?
- Where is UI allowed to appear?
- What must remain world-space and hand-driven?
- How does the temple function as the major interface surface?

## God Representation Rule

A god should never have a full physical avatar or embodied character representation beyond:

1. the divine hand, and
2. the player's chosen god symbol.

The player is not a creature, hero, body, statue-person, or map avatar. The player is the god acting through the hand and recognized through the symbol.

## Hand Appearance Rule

The player may control the appearance of the divine hand from a set of authored in-game options. The hand is the player's only embodied god-presence. Changing the hand's appearance is therefore an identity customization feature, not a cosmetic side menu. It belongs in the temple.

The first shippable hand set should include at least:

- a default humanlike hand;
- a masculine, rough-looking hand;
- an elegant, feminine hand;
- left-hand and right-hand variants for each.

Later hand forms may include clawlike, made of light, abstract, elemental, skeletal, carved, radiant, shadowed, or other authored forms.

Morality is not a judgment meter. Morality/world-state is the visible effect of the player's choices and repeated actions. A benevolent, protective, cruel, feared, neglected, corrupted, or awe-inspiring god may gradually alter the hand's surface, aura, gesture traces, light, color, shadow, texture, or small adornments. These effects should show consequence without overriding the player's chosen base hand form or making the hand unusable.

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

The first symbol selection should occur as a short ritual moment. A villager asks: "Who are you?" Then a small glowing symbol choice appears, offering around five initial god symbols. These can be suggested based on the opening miracle path and first unlocked miracle. For example:

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

## Temple Navigation Model

The temple interior should feel like the player floats into the center of the temple and looks toward static chamber directions.

The temple is not free-roam exploration in the first version. It is a central sacred hub with directional navigation:

- look/click left to face one chamber;
- look/click right to face another chamber;
- look/click forward/front to face the central/save/world-state chamber;
- additional directions can be added only if needed.

This keeps the temple readable, stable, and Black & White-like instead of turning it into a walking simulator or normal menu screen.

## Fixed Temple Chambers

The temple chamber map should be treated as mostly settled. Do not keep re-opening this as a vague design question.

First-slice / core chambers:

1. Symbol / Identity Chamber
   - Change god symbol.
   - Change divine hand appearance if hand customization is included.
   - Visual: villagers or attendants painting, carving, arranging, or presenting symbols and hand forms.

2. Save / World-State Chamber
   - Save/load.
   - Campaign state.
   - Island/world memory.
   - Records of living-world changes.
   - This is the natural front/central chamber.

3. Options / Settings Chamber
   - Input tuning.
   - Mouse/control settings.
   - Audio/display/accessibility.
   - This replaces normal settings menus in the world.

4. Miracle / Glyph Chamber
   - Learned miracles.
   - Discovered glyphs.
   - Upgrade tiers.
   - Old-god shrine records.
   - Tutorial glyph references.

5. Village / Belief Chamber
   - Village temples.
   - Allegiance.
   - Prayers.
   - Belief/worship flow.
   - Statistics that should not appear in the normal world HUD.

6. Golem Chamber
   - Golem parts.
   - Construction materials.
   - Macro demonstrations.
   - Path drawings.
   - Active golem upkeep.

Later or combinable chambers:

- History / Old Gods Chamber: old gods, rival signs, discovered shrine lore, campaign memory.
- World / Island Chamber: island travel, conquered/lost villages, shrine construction choices, local island bonuses.
- Tutorial Chamber: replayable teachings, control diagrams, discovered glyph references. This can be merged into Miracle/Glyph and Options in the first slice.

If scope must be cut, the minimum first-slice temple is Symbol/Identity, Save/World-State, Options/Settings, and Miracle/Glyph. Village/Belief and Golem chambers become required once those systems are active.

## Temple as Interface Principle

The point is not to create a huge menu. The point is to make necessary management feel sacred, physical, and located inside the god's temple rather than pasted onto the world.

Systems that are not direct moment-to-moment gameplay, but are important for engaging with the game, belong in the temple. This includes:

- statistics;
- options;
- saving/loading;
- symbols;
- hand appearance;
- tutorials/control references;
- miracle records and glyph references;
- village allegiance and belief summaries;
- golem construction and macro review once golems exist.

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

Remaining high-priority questions:

1. What exact mouse-first control grammar is required to recreate the Black & White-like hand feel behaviorally?
2. Which hand appearances ship first beyond the default/rough/elegant left-right set?
3. How does morality/world-state visually affect each hand form without overriding player choice?
4. What precise camera positions and click targets define the temple's left/front/right navigation?
5. Which chambers are required in the first playable vertical slice versus unlocked later?
6. How much tutorial/reference content belongs in Miracle/Glyph versus Options/Settings?

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
- Morality is effect/consequence, not judgment.
- Morality can affect the hand, but must not erase player choice or make the hand hard to read/use.
- Temple UI must support the god fantasy rather than feeling like admin software.

## Fable/Codex Handoff Note

Future Fable work should include this doctrine when preparing the Parable rewrite plan. Fable should treat the temple interface and god-representation model as core architecture, not flavor polish.

Future Codex work should not implement a conventional overlay menu for major systems unless explicitly requested. If UI is needed, first ask whether it belongs in world-space or inside the temple.
