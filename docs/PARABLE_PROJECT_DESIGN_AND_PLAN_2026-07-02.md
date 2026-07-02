# Parable Project Design and Implementation Plan

Date: 2026-07-02  
Status: Planning source document  
Repository: `westkitty/Parable`  
Companion sources: `Parable_Bible.md`, `docs/PARABLE_WORLD_FUNCTION_DOCTRINE_2026-07-02.md`, existing prototype files, and current design conversation.

---

## 1. Executive Summary

Parable is a god-game project built around one central feeling:

> The player loads into a living island and feels like the god.

The game should graphically aim toward a richer, readable, cinematic 3D island presentation inspired by the remembered strength of Black & White 2, while mechanically aiming closer to Black & White 1 or an imagined Black & White 1.5: tactile god-hand control, direct world manipulation, discovered miracles, worship, villages, rival gods, living consequences, and minimal conventional UI.

Parable must not become:

- a button-first RTS;
- a dashboard sim;
- a creature-management game;
- a city builder with divine paint;
- a normal avatar RPG;
- a menu-heavy spellcasting sandbox;
- a Black & White asset/content clone.

Parable should become:

- a hand-first divine control game;
- a living miniature island world;
- a sacred archaeological miracle-discovery game;
- a godhood simulator where belief, worship, symbols, shrines, villages, and old gods matter;
- a game where the player acts directly through a divine hand and is recognized by a chosen symbol.

The current prototype is useful evidence, not sacred architecture. The protected sacred law is the core fantasy and control feel, especially the direct god-hand experience. A significant rewrite or restructuring is likely, and Fable should be used to plan that rewrite before Codex or another coding agent implements it.

---

## 2. Current Project State

The existing repository contains a browser-playable-by-structure prototype using a static no-build Three.js setup. It includes:

- `index.html` static app shell;
- `styles.css` interface styling;
- `src/main.js` runtime loader;
- chunked runtime files in `src/runtime/`;
- a procedural island;
- villages, shrines, villagers, rival citadel, and region ownership;
- a ten-miracle prototype roster;
- gesture-based miracle casting;
- golem helpers in a very early form;
- verification and turn-guard scripts;
- README and project bible documents.

Important caveat: the current prototype does not prove the final control fantasy. It does not yet prove Black & White-like hand control, invariant grabbing, momentum throwing, birth-of-god opening, temple-only UI, village-temple allegiance, shrine-based miracle discovery, or real golem macro programming.

Therefore, the prototype should be treated as:

- a useful seed;
- evidence that a browser/Three.js version can exist;
- a temporary implementation surface;
- not the final architecture unless it can support the hand-first fantasy.

---

## 3. Core Design Thesis

Parable is a mythic god-game where the player rules a living island through hand, symbol, worship, miracle, shrine, and consequence.

The player is not represented by a humanoid avatar, creature, hero, or character body. The player is represented by:

1. the divine hand, and
2. the chosen god symbol.

The world recognizes the god through repeated acts, village belief, shrine construction, painted symbols, miracle traces, flowers, scorches, golem marks, temple banners, and living consequence.

The game is about direct divine presence. Everything else exists to support that.

---

## 4. Non-Negotiable Design Laws

### 4.1 Godhood Laws

- The player is the god.
- The god has no physical avatar beyond the hand and symbol.
- The player should never feel like they are supervising the real main character.
- Golems are optional tools of presence and automation, not pets, creatures, or avatars.
- Direct god powers must remain primary.
- Learned miracles are always available once learned.
- No miracle loadouts.
- No learned miracle should be temporarily removed, hidden, displaced, or disabled because of golems.

### 4.2 Control Laws

- Mouse-first control is mandatory.
- Touch support is desirable but secondary.
- The hand-control grammar must chase the Black & White-style feeling in extreme detail.
- The player must be able to consistently grab interactable things.
- What is grabbable must not change arbitrarily.
- The same interaction should behave the same way across the game.
- Grabbing and throwing are one interaction family: hold, move, release with momentum.
- Miracles should feel like drawing sacred gestures over the world, not clicking spell buttons.

### 4.3 UI Laws

- Normal world gameplay should have basically no conventional HUD.
- No persistent numbers, letters, stats, options, save controls, settings, tutorials, or management panels in the normal world HUD.
- Text may appear briefly only as speech, prayer, cutscene, communication, or direct world expression.
- Major UI belongs inside the temple.
- The temple is the diegetic interface container.
- UI must feel sacred, physical, and located in the world, not pasted onto it.

### 4.4 Progression Laws

- Miracles and upgrades should often be found, not quest-awarded.
- Old-god shrines teach miracle glyphs.
- Environmental rituals awaken glyphs.
- The player traces awakened glyphs to learn miracles.
- Prefer fewer stronger miracles with upgrade tiers over dozens of shallow miracles.
- Learned miracles and upgrades persist across islands.
- Compatible island shrines can provide local bonuses, such as cheaper casting, but should not be required to retain learned knowledge.

### 4.5 World Laws

- The world has had gods for a long time.
- Many gods existed, vanished, lost power, or left signs behind.
- Islands should feel ancient, sacred, layered, and investigable.
- Villages should have their own temples.
- Destroying a village temple causes the god in charge to lose that village.
- Belief/worship should function as a core resource.
- Morality is not a judgment meter; it is the visible effect of choices and repeated actions.

---

## 5. Visual and Mechanical Target Split

### 5.1 Graphics Target

Graphically, Parable should aim toward the remembered appeal of Black & White 2:

- richer 3D island presentation;
- readable settlements;
- stronger lighting;
- more cinematic miracle spectacle;
- visible village life;
- polished terrain and shrine forms;
- clear scale between hand, villagers, buildings, golems, and terrain.

This is a visual ambition, not permission to copy proprietary assets, names, code, designs, or protected content.

### 5.2 Mechanics Target

Mechanically, Parable should aim closer to Black & White 1 or an imagined Black & White 1.5:

- tactile god-hand control;
- direct manipulation;
- villagers as emotional witnesses;
- worship and belief;
- miracles drawn as gestures;
- old-god shrine discovery;
- village allegiance;
- moral consequence shown through world state;
- optional automation through golems;
- hand/world first, UI second.

The shorthand is:

```text
Graphics: B&W2-like ambition
Mechanics: B&W1 / imagined B&W1.5 soul
Fantasy: you are the god
Forbidden drift: RTS / dashboard / creature babysitter
```

---

## 6. Player Representation

### 6.1 The Hand

The divine hand is the player's only embodied presence. It is not a cursor skin in spirit; it is the visible interface between god and world.

First shippable hand set:

- default humanlike hand;
- masculine rough-looking hand;
- elegant feminine hand;
- left-hand and right-hand variants for each.

Later hand forms may include:

- clawlike;
- made of light;
- elemental;
- skeletal;
- stone/carved;
- radiant;
- shadowed;
- abstract miracle-trace forms.

Hand customization belongs in the temple, not a generic settings overlay.

### 6.2 Morality and Hand Consequence

Morality is not a judgment score. It is consequence.

The player's repeated actions may affect:

- hand aura;
- gesture trace color/texture;
- skin/surface texture;
- light or shadow;
- minor adornments;
- scorch, flowers, cracks, glow, ash, rain shimmer, blessing motes, etc.

Rules:

- never override the player's chosen base hand form;
- never make the hand unreadable;
- never make the hand mechanically worse because of moral state;
- changes should express history, not wag a finger at the player.

### 6.3 The Symbol

The god symbol is the player's chosen mark.

The first symbol selection occurs early as a ritual moment:

1. a villager asks, "Who are you?";
2. a small glowing symbol choice appears;
3. around five suggested symbols are presented;
4. suggestions may echo the opening miracle path;
5. the player selects a symbol;
6. later changes happen inside the temple.

The symbol is identity, not a mechanical prison.

### 6.4 Symbol Expression

The symbol should appear throughout the world:

- painted by villagers;
- carved into shrines;
- on village flags;
- on golems;
- on banners;
- in temple murals;
- in influence patterns;
- in flowers growing in its shape;
- in scorch marks, ash, cracks, shadows, or warning signs in feared/corrupted villages.

The symbol should feel socially repeated and spiritually recognized.

---

## 7. Mouse-First Control Design

The control spec must be written in extreme detail before implementation. The goal is to recreate the feeling of the classic god-hand control grammar while remaining original in implementation and content.

### 7.1 Required Control Verbs

Core verbs:

- hover / indicate;
- click / engage;
- hold / grip;
- drag / carry;
- drag along ground / pull or push;
- release / drop;
- release with velocity / throw;
- scroll / zoom;
- pan / move view;
- orbit / rotate view;
- draw gesture / cast miracle;
- enter temple;
- select / inspect object;
- cancel / release safely.

### 7.2 Grabbing

The player should be able to grab:

- villagers;
- rocks;
- trees;
- food;
- wood;
- shrine objects;
- golems;
- enemies;
- golem parts;
- physical ritual objects;
- resource objects.

Buildings:

- may be placeable;
- should not be freely grabbable without major damage;
- wrenching or grabbing a building should be destructive, exceptional, or miracle-tier.

Terrain:

- terrain sculpting and terrain chunk manipulation are desirable;
- these should likely be miracle-tier powers rather than always-on base grabbing;
- feasibility remains open.

### 7.3 Throwing

Throwing is not a separate mode. Throwing is the natural result of release velocity.

Expected behavior:

- click/hold object;
- move hand while holding;
- release while moving;
- object inherits velocity/momentum;
- mass and object type affect arc, damage, and distance;
- villagers and fragile objects require special readable feedback to prevent accidental cruelty unless intended.

### 7.4 Gesture Miracles

Miracle input should feel like the hand drawing sacred shapes over the world.

Rules:

- no spell buttons as primary casting;
- learned miracles always available;
- glyph recognition must be reliable and teachable;
- glyphs should be learned from shrine motifs;
- gesture traces should feel physical, luminous, and divine;
- failed recognition should be readable without dumping text into the HUD.

### 7.5 Camera

Camera controls must support the miniature-island fantasy.

Required behaviors:

- zoom in/out with scroll wheel;
- pan around island comfortably;
- orbit/rotate without disorientation;
- focus on villages, shrines, and hand targets;
- allow temple doorway click and zoom transition;
- support direct manipulation without fighting camera movement.

Open technical question: whether current Three.js controls can support the required feel quickly enough, or whether a different engine/pipeline should be chosen after Fable planning.

---

## 8. Temple Interface Design

### 8.1 Temple Purpose

The temple is the major diegetic interface surface.

It contains things the player needs to engage with the game but which should not pollute the normal world:

- saving/loading;
- options;
- input tuning;
- tutorials/control references;
- symbol selection;
- hand appearance;
- miracle glyph references;
- upgrade records;
- village/belief information;
- golem construction and macro review;
- old-god history;
- island/world memory.

### 8.2 Temple Entry

Preferred transition:

1. click temple doorway;
2. camera zooms toward doorway;
3. fade to black;
4. fade into static temple interior.

A small immersion break is acceptable because the temple is a sacred interface space.

### 8.3 Temple Navigation

The player floats into the center of the temple.

Navigation is static/directional, not free-roam:

- look/click left to face one chamber;
- look/click right to face another chamber;
- look/click front to face central/save/world-state chamber;
- additional directions only if needed.

This keeps the temple readable and avoids building a walking simulator.

### 8.4 Fixed Temple Chambers

Core chamber set:

1. Symbol / Identity Chamber
   - change god symbol;
   - change divine hand appearance;
   - villagers/attendants painting, carving, arranging, presenting marks and hand forms.

2. Save / World-State Chamber
   - save/load;
   - campaign state;
   - island memory;
   - records of living-world changes;
   - natural front/central chamber.

3. Options / Settings Chamber
   - input tuning;
   - mouse/control settings;
   - audio/display/accessibility;
   - replaces normal settings menu.

4. Miracle / Glyph Chamber
   - learned miracles;
   - discovered glyphs;
   - upgrade tiers;
   - old-god shrine records;
   - tutorial glyph references.

5. Village / Belief Chamber
   - village temples;
   - allegiance;
   - prayers;
   - belief/worship flow;
   - statistics that should not appear in the world HUD.

6. Golem Chamber
   - golem parts;
   - construction materials;
   - macro demonstrations;
   - path drawings;
   - active golem upkeep.

Later or combinable:

- History / Old Gods;
- World / Island;
- Tutorial.

Minimum first-slice temple:

- Symbol / Identity;
- Save / World-State;
- Options / Settings;
- Miracle / Glyph.

Village/Belief and Golem chambers become required once those systems are active.

---

## 9. World Model

### 9.1 Island Structure

The world should be composed of islands or island-like lands. The first version should prove one strong island before a campaign structure is expanded.

The first island should contain:

- one starting village;
- a village temple;
- at least one main player temple;
- old-god shrines;
- tutorial miracle shrines;
- environmental ritual spaces;
- resources;
- a rival/old-god sign;
- room for hand movement, zoom, shrine discovery, and miracle casting.

### 9.2 Villages

Villages are not just resource nodes. They are emotional witnesses to godhood.

Villagers should:

- worship;
- pray;
- fear;
- celebrate;
- flee;
- tell each other stories;
- paint symbols;
- build/maintain temples;
- react physically;
- show stylized readable emotion cues;
- trigger belief flow;
- request help;
- respond to miracles and neglect.

### 9.3 Village Temples

Each village can have a temple.

Rules:

- a village temple anchors allegiance;
- the god in control of the temple controls the village;
- destroying a village temple causes that god to lose the village;
- this avoids the single-central-temple problem where villagers travel absurd distances;
- village temples may display the controlling god's symbol;
- village temple state should be visible in world and temple interface.

### 9.4 Belief / Worship Resource

Belief/worship is a major resource.

Known uses:

- casting miracles;
- sustaining active golem macros;
- possibly building/upgrading shrines;
- maintaining divine influence.

Golems:

- cost material resources to build;
- cost ongoing belief/faith/worship to run;
- macro complexity increases upkeep cost.

Open question:

- whether belief is global, village-local, island-local, or some hybrid.

Recommended initial model:

- island-level belief pool for simplicity;
- village contribution tracked in temple but not shown as normal HUD;
- later upgrade to local village belief if design needs deeper allegiance mechanics.

---

## 10. Miracle System

### 10.1 Core Rules

- Learned miracles are always available.
- Miracles are cast by gesture, not primary spell buttons.
- Golems can never cast miracles.
- Only the god casts miracles.
- Miracles should have gameplay effects and emotional/social effects.
- Miracles should be discovered and upgraded through shrines and glyphs.

### 10.2 Starter Miracle Families

Opening starter set:

1. Fireball
   - wrath;
   - destruction;
   - punishment;
   - dangerous intervention.

2. Rain
   - mercy;
   - fertility;
   - relief;
   - flood/storm imagery.

3. Healing
   - salvation;
   - restoration;
   - care;
   - rescue from plague/injury.

4. Sanctuary / Protection
   - shelter;
   - guardianship;
   - warding;
   - safety;
   - god as protector.

The player begins with one dream-seeded miracle from these four. The other three are discovered nearby through tutorial shrine learning.

Lightning should not be a default starter. It is better saved for later discovery through a storm/metal/altar shrine puzzle.

### 10.3 Miracle Discovery Loop

Core loop:

1. Player finds old-god shrine.
2. Shrine has visible glyph motif.
3. Environmental ritual awakens the glyph.
4. Example: bring ore/metal/pole to storm altar; lightning strikes; glyph lights up.
5. Player traces glyph with divine hand.
6. Miracle or upgrade is learned permanently.
7. Compatible island shrine can be built for local bonus.

### 10.4 Upgrade Philosophy

Prefer strong upgrade tiers over huge miracle count.

Each starter miracle should probably have three tiers:

- Tier 1: basic learned form;
- Tier 2: stronger, wider, cheaper, longer, or safer form;
- Tier 3: signature form with strong spectacle or strategic identity.

Upgrade axes:

- power;
- radius;
- duration;
- cost;
- precision;
- side effects;
- moral/social interpretation;
- environmental persistence.

Upgrade knowledge persists between islands. Local shrines may improve cost/strength on that island but should not be required to keep the upgrade.

---

## 11. Golem System

### 11.1 Doctrine

Golems are optional vessels of delegated divine will. They are not alive, not pets, not creatures, and not the core of Parable.

They exist to create presence by allowing the god to externalize a repeated non-miracle task into the world.

### 11.2 Limits

- Golems can never cast miracles.
- Golems should never replace direct god powers.
- Golems should not become the emotional center of the game.
- Golems are not Tamagotchi-like companions.
- Golems should not require the player to lose baseline godhood.

### 11.3 Capabilities

Golems may perform many non-miracle physical actions the god can perform, but slower:

- pick up objects;
- move resources;
- carry wood/food/stone;
- patrol paths;
- respond to enemy presence;
- respond to village need;
- move shrine objects;
- help build/repair;
- cleanse or guard if designed into their material/aspect.

### 11.4 Programming

Preferred programming modes:

- teach-by-demonstration;
- direct path drawing.

Avoid spreadsheet-like programming.

Example:

1. select golem;
2. pick up wood with hand;
3. carry wood to storehouse;
4. mark/repeat demonstration;
5. draw path the golem should walk;
6. golem repeats slowly while belief upkeep is paid.

Potential triggers:

- proximity;
- time of day;
- village resource need;
- villager request;
- enemy presence.

The interface for reviewing golem macros belongs in the temple's Golem Chamber once golems are active.

### 11.5 Cost Model

Construction cost:

- physical materials;
- wood-like materials for labor;
- hardened materials for combat/structure/serious-duty;
- later elemental/aspect materials possible.

Running cost:

- belief/faith/worship upkeep;
- macro complexity increases upkeep.

This makes golems powerful because of planning and investment, not because the player sacrificed divinity.

---

## 12. Opening and First Five Minutes

### 12.1 Opening Thesis

The first five minutes should show the birth of a god.

Because things become sacred because people choose to make them sacred, the beginning can start with a villager's dream that spreads socially.

Core sequence idea:

1. a villager dreams;
2. the dream is shaped by the player's initial input;
3. the villager tells another villager;
4. belief begins to spread;
5. the world starts recognizing a presence;
6. a symbol choice occurs;
7. the villager asks, "Who are you?";
8. the player chooses a symbol;
9. the first miracle path is seeded;
10. the player performs the first act as god.

### 12.2 Dream-to-Miracle Path

Starter miracle families map to opening dream tones:

- destructive dream -> Fireball;
- flood/storm/rain dream -> Rain;
- plague-rescue/healing dream -> Healing;
- danger/shelter/protection dream -> Sanctuary.

Exact prompt flavor is not the current priority. The structure is what matters.

### 12.3 First Vertical Slice Fantasy Proof

The smallest vertical slice proving "I am the god" should include:

- load into island;
- birth-of-god opening;
- choose symbol;
- see/operate divine hand;
- move camera with Black & White-like mouse-first controls;
- grab and throw at least one object;
- cast one learned miracle;
- discover at least one shrine glyph;
- learn at least one additional miracle through tracing;
- see villagers physically react;
- enter temple;
- use temple to view/change symbol or miracle reference;
- no normal HUD clutter.

---

## 13. Rival Gods and Opposition

### 13.1 Opposition Types

Opposition can include:

- new gods;
- old gods;
- other gods;
- different gods;
- forgotten divine forces;
- rival village cults;
- corrupted shrines;
- disasters;
- hostile miracles.

### 13.2 First Rival-God Reveal

The first rival god can appear during an old-god shrine activation.

Scenario:

1. player finds a compelling old-god shrine;
2. player begins the environmental ritual to awaken a powerful glyph;
3. the player is invested and expects discovery;
4. another god appears or manifests;
5. the rival seizes/steals/corrupts the opportunity;
6. the rival defeats or humiliates the player enough to establish threat;
7. the player learns there are other gods competing for old power.

The goal is not random punishment. The goal is to make the world feel contested, ancient, and alive.

---

## 14. UI and Information Rules

### 14.1 World-Space Allowed

Allowed in normal world:

- hand state;
- object affordance feedback;
- gesture trails;
- shrine glyphs;
- villager emotion icons/cues;
- spoken/prayer/cutscene text when appropriate;
- world-space symbols;
- banners/paintings/flowers/scorches;
- short tutorial prompts only if unavoidable and diegetic.

### 14.2 World-Space Forbidden

Forbidden or strongly discouraged in normal world:

- persistent resource bars;
- spell hotbars;
- minimap-heavy overlay;
- stats panel;
- normal settings button;
- save/load menu;
- text-heavy tutorial panel;
- RPG character sheet;
- miracle loadout UI;
- always-on objective list.

### 14.3 Temple-Only Systems

Belong inside temple:

- statistics;
- options/settings;
- save/load;
- symbol changes;
- hand appearance;
- tutorials/control references;
- miracle records;
- glyph references;
- upgrade records;
- village allegiance summaries;
- belief/worship summaries;
- golem macro review;
- discovered old-god history;
- island travel/world records.

---

## 15. Art Direction

### 15.1 World

The world should feel like a living sacred miniature.

Traits:

- readable 3D island;
- lush but clear terrain;
- visible villages;
- shrines as memorable landmarks;
- old-god ruins with glyph motifs;
- strong weather and light;
- moral/world consequence visible in terrain and villages;
- hand scale should make the player feel enormous but precise.

### 15.2 Villagers

Villagers should be readable at a distance:

- body language;
- physical reaction;
- stylized emotion cues;
- praying, painting, fleeing, celebrating;
- visible response to the hand and miracles.

Stylized emoji-like cues are allowed if they improve readability without cheapening the world.

### 15.3 Miracles

Miracles should be spectacular, but legible.

- Fireball should feel dangerous and consequential.
- Rain should feel relieving and fertile.
- Healing should feel restorative and intimate.
- Sanctuary should feel protective and sacred.
- Lightning should feel like a later ancient shrine power, not starter filler.

### 15.4 Symbols

Symbols should spread organically and socially.

A good/protective village might grow flowers in the god's symbol. A feared village might paint harsh banners or burn the mark into wood. Golems should carry the symbol physically.

---

## 16. Audio Direction

Audio is not optional polish. For god fantasy it is part of presence.

Needed audio categories:

- ambient island sound;
- village murmurs;
- prayer voices;
- worship chants;
- fear reactions;
- hand movement/interaction sounds;
- object grab/drop/throw sounds;
- miracle gesture tracing;
- miracle cast sounds;
- shrine awakening;
- temple entry transition;
- temple interior ambience;
- rival god arrival;
- golem construction and movement.

The opening should use audio to sell the birth of a god: dream, whisper, villagers telling each other, first worship, first miracle.

---

## 17. Technical Direction

### 17.1 Current Technical Reality

Current repo uses a static browser/Three.js prototype. It may be a useful starting point but does not yet prove the required control feel.

### 17.2 Rewrite Position

A rewrite or major restructuring is likely.

Do not rewrite blindly. The correct path is:

1. use Fable to produce a rewrite-ready design/architecture plan;
2. define the hand-control proof target;
3. decide whether Three.js can support it quickly;
4. if yes, restructure web prototype;
5. if no, select a better engine/pipeline for the hand feel;
6. then use Codex or another implementation agent to build staged packets.

### 17.3 Platform Decision Gate

The platform choice should be made by the answer to this question:

> Which platform proves the mouse-first divine hand feel fastest and most reliably?

Candidates:

- existing Three.js web prototype;
- rewritten modular Three.js app;
- Godot or another engine;
- desktop wrapper later only after core feel is proven.

Do not choose final app shell before proving the hand.

### 17.4 Engineering Principles

- Build a tiny correct vertical slice before full architecture.
- Keep controls testable.
- Keep miracle recognition inspectable.
- Keep interaction classes explicit.
- Keep UI separation strict: world versus temple.
- Do not implement conventional HUD by accident.
- Do not implement creature systems.
- Do not make golems cast miracles.
- Keep source-of-truth documents updated.

---

## 18. Vertical Slice Definition

### 18.1 Goal

Prove the central fantasy:

> I can move around a living island with Black & White-like hand controls, act directly on the world, cast miracles, be recognized by villagers, enter my temple, and discover divine knowledge from old shrines.

### 18.2 Required Content

World:

- one island;
- one village;
- one player temple;
- one village temple;
- at least three grabbable object types;
- at least one shrine discovery puzzle;
- at least one old-god sign;
- one simple rival-god tease or event.

Hand/control:

- visible/customizable default hand;
- click/hold/grab;
- drag/carry;
- release/drop;
- momentum throw;
- scroll zoom;
- pan/orbit;
- gesture miracle casting.

Miracles:

- one dream-started miracle;
- one shrine-learned miracle;
- glyph tracing;
- always-available learned miracle access;
- visible villager/world reaction.

Temple:

- enter via doorway zoom/fade;
- static interior hub;
- symbol/identity chamber;
- save/world-state chamber;
- options/settings chamber;
- miracle/glyph chamber.

Villagers:

- ask "Who are you?" during symbol selection;
- react to first miracle;
- worship or fear visibly;
- paint/display symbol after selection.

UI:

- no persistent conventional HUD;
- world-space feedback only;
- temple contains non-gameplay interface.

### 18.3 Vertical Slice Acceptance Criteria

The slice passes only if:

- a player can understand they are a god without a character avatar;
- the hand feels like the main interface;
- at least one object can be grabbed and thrown with momentum;
- at least one miracle can be cast by gesture;
- learned miracle access remains stable;
- villagers visibly react;
- the symbol appears in the world;
- entering the temple feels ceremonial;
- temple UI replaces normal menu UI;
- the normal world does not become a dashboard;
- the old-god shrine discovery loop is present in at least one basic form.

---

## 19. Phased Plan

### Phase 0 - Source Consolidation

Goal: Make sure future work has a stable source of truth.

Tasks:

- Read `Parable_Bible.md`.
- Read `docs/PARABLE_WORLD_FUNCTION_DOCTRINE_2026-07-02.md`.
- Read this document.
- Audit current prototype against design laws.
- Identify which current files are reusable and which are likely throwaway.

Output:

- architecture gap report;
- keep/replace decision table;
- Fable-ready context packet.

Acceptance:

- no implementation claims without actual testing;
- no design-law drift.

### Phase 1 - Fable Rewrite Plan

Goal: Use Fable for high-level synthesis, not code.

Fable should produce:

- hand-control specification outline;
- temple interface specification;
- vertical slice architecture;
- miracle discovery tutorial island plan;
- golem boundary rules;
- platform decision gate;
- staged Codex implementation packets.

Acceptance:

- preserves all non-negotiables;
- separates world-space gameplay from temple UI;
- does not propose creature system;
- does not make golems cast miracles;
- does not hide learned miracles behind loadouts;
- names open questions clearly.

### Phase 2 - Hand-Control Proof

Goal: Prove mouse-first hand feel before building more systems.

Tasks:

- implement or prototype camera movement;
- implement hand appearance baseline;
- implement object hover feedback;
- implement grab/hold/drag/drop/throw;
- implement scroll zoom and pan/orbit;
- test with villagers/rocks/trees/food/wood at minimum.

Acceptance:

- interaction feels physical;
- throw inherits momentum;
- grabbable classes are consistent;
- controls do not fight camera;
- no major HUD required.

### Phase 3 - Miracle Gesture Proof

Goal: Prove gesture casting over world.

Tasks:

- implement glyph trace input;
- implement one starter miracle;
- implement glyph learning state;
- implement always-available learned miracle access;
- implement failed/uncertain gesture feedback;
- implement villagers reacting.

Acceptance:

- miracle feels drawn with the hand;
- no spell button required;
- learned miracle remains available;
- villagers/world react legibly.

### Phase 4 - Birth-of-God Opening

Goal: Establish the emotional identity of the game.

Tasks:

- villager dream seed structure;
- villager asks "Who are you?";
- symbol selection ritual;
- first miracle path assignment;
- first worship/belief moment;
- symbol appears in village.

Acceptance:

- player understands they are a god;
- no avatar needed;
- symbol selection feels sacred;
- first miracle path is clear.

### Phase 5 - Temple UI Slice

Goal: Replace conventional menus with temple interior.

Tasks:

- implement temple doorway click;
- zoom/fade transition;
- static central temple interior;
- left/front/right chamber navigation;
- Symbol/Identity chamber;
- Save/World-State chamber;
- Options/Settings chamber;
- Miracle/Glyph chamber.

Acceptance:

- no normal settings/save overlay needed in world;
- symbol can be changed in temple;
- miracle glyphs can be reviewed;
- controls/options are accessible.

### Phase 6 - Shrine Discovery Slice

Goal: Prove found-miracle loop.

Tasks:

- build old-god shrine;
- display glyph motif;
- add simple environmental ritual;
- awaken glyph;
- trace glyph;
- learn miracle;
- persist learned state.

Acceptance:

- discovery feels archaeological/sacred;
- player learns by interacting with world;
- no quest reward menu needed.

### Phase 7 - Village Temple and Belief

Goal: Prove village allegiance and worship economy.

Tasks:

- implement village temple;
- track allegiance;
- generate belief from worship;
- show belief summaries in temple, not HUD;
- display symbol in village;
- define temple destruction/loss behavior.

Acceptance:

- village allegiance is readable;
- belief exists without dashboard spam;
- destroying/losing temple has clear meaning.

### Phase 8 - Golem Macro Prototype

Goal: Prove optional automation without stealing godhood.

Tasks:

- construct one simple golem;
- add material cost;
- add belief upkeep;
- implement simple path drawing;
- implement one demonstration macro;
- prevent miracle casting;
- show golem mark/symbol.

Acceptance:

- golem performs non-miracle action slowly;
- upkeep scales with macro complexity in basic form;
- player remains fully powerful without golem;
- no spreadsheet UI.

### Phase 9 - First Rival God Event

Goal: Establish divine opposition.

Tasks:

- create old-god shrine event;
- rival appears during activation;
- rival steals/seizes/corrupts opportunity;
- player is defeated/humbled without feeling cheated;
- future conflict is established.

Acceptance:

- rival feels like another god, not a random enemy unit;
- event builds world history;
- player understands old divine knowledge is contested.

---

## 20. Agent Handoff Strategy

### 20.1 Fable

Use Fable for:

- design synthesis;
- contradiction reconciliation;
- rewrite architecture planning;
- control spec reasoning;
- vertical slice scope;
- system boundary planning;
- Fable-ready context packet compression.

Do not use Fable for:

- directly editing repo code;
- claiming tests passed;
- writing final implementation without validation.

### 20.2 Codex / Coding Agent

Use Codex or a coding agent for:

- repo edits;
- implementation packets;
- tests;
- verification scripts;
- file refactors;
- prototype builds.

Each Codex packet should include:

- source documents to read;
- exact scope;
- forbidden changes;
- acceptance criteria;
- validation commands;
- reporting requirements.

### 20.3 Human Review

Human review is mandatory for:

- hand feel;
- camera feel;
- temple feel;
- miracle gesture feel;
- first five minutes;
- whether the game actually feels like godhood.

These cannot be verified by code alone.

---

## 21. Risk Register

| Risk | Severity | Why It Matters | Mitigation |
|---|---:|---|---|
| Hand controls feel wrong | Critical | The entire project depends on hand feel | Build hand-control proof before full systems |
| UI drifts into dashboard | Critical | Breaks god fantasy | Temple-only UI doctrine; review every UI addition |
| Golems become creatures | High | Recreates rejected Tamagotchi problem | Golems cannot cast miracles; optional non-miracle automation only |
| Too many miracles | Medium | Shallow list weakens identity | Fewer core miracles with upgrade tiers |
| Tutorial becomes text-heavy | Medium | Kills opening mood | Teach through dream, villager, shrine, hand action |
| Engine chosen too early | High | May cause rewrite waste | Platform decision gate after hand proof planning |
| Symbol becomes cosmetic only | Medium | Loses sacred social identity | Make symbol propagate into villages/golems/world |
| Morality becomes dumb meter | High | Undermines consequence | Show world/hand effects, not judgment score |
| Temple becomes giant menu | Medium | Breaks diegetic UI goal | Static chambers, physical metaphors, minimal first slice |
| IP confusion | High | Legal/creative risk | Chase control feel and genre grammar, not protected assets/content |

---

## 22. Open Questions

These are real remaining questions, not already-settled categories.

### Control

- What exact mouse button combinations correspond to camera pan/orbit versus grab?
- How does the player cancel a grab or gesture?
- How close must an object be to grab?
- How does the hand show affordance without text?
- How does the game prevent accidental villager throwing while still allowing it?

### Hand / Identity

- Are default/rough/elegant hands enough for the first slice?
- Does the symbol appear on the hand itself?
- How quickly do morality/world-state effects appear?
- Can the player suppress morality visual effects if they dislike them?

### Miracles

- What are the exact glyphs for Fireball, Rain, Healing, Sanctuary?
- What are Tier 2 and Tier 3 upgrades for each starter miracle?
- What are the costs and cooldown rules, if any?
- How is miracle failure communicated without normal HUD?

### Shrines

- What are the first tutorial shrine puzzles?
- What does an awakened glyph look like?
- How does the player know tracing is now possible?
- What is the first later-found miracle after the starter set? Lightning is a strong candidate.

### Villages / Belief

- Is belief local, island-wide, global, or hybrid?
- How does a village visually show worship versus fear?
- What happens when a village temple is destroyed?
- Can villagers rebuild a destroyed temple?

### Golems

- What materials ship first?
- What is the simplest macro that proves the system?
- How does direct path drawing look?
- What does belief upkeep failure do to a golem?

### Temple

- What exact camera angles define left/front/right chambers?
- How does the player exit the temple?
- How does the temple look different based on morality/world state?
- Which chambers are locked until relevant systems exist?

### Rival Gods

- Who is the first rival god?
- What do they steal, corrupt, or awaken?
- How do they communicate without becoming a normal villain dialogue box?
- How does their symbol/influence differ from the player symbol?

---

## 23. Immediate Next Artifact

The next best artifact is not a flavor document.

The next best artifact is:

> Parable Direct Godhood Rewrite Context Packet for Fable

It should include:

- source documents;
- confirmed design laws;
- current prototype state;
- contradictions;
- non-goals;
- open questions;
- Fable task boundary;
- required output format.

Then Fable should produce:

- a rewrite-ready design plan;
- a hand-control specification outline;
- a vertical slice architecture;
- a platform decision gate;
- staged Codex implementation packets.

---

## 24. Final Project Spine

Parable's spine is:

```text
You are the god.
The hand is your body.
The symbol is your name.
Villagers make you sacred by believing, fearing, painting, praying, and remembering.
Miracles are learned from old gods through shrine glyphs and physical rituals.
The temple holds the interface so the world can remain alive.
Golems are optional embodied macros, never miracle casters.
Morality is not judgment; it is consequence made visible.
The first proof is not a campaign. The first proof is the hand, the island, the miracle, the village, the symbol, and the temple.
```

If a proposed feature does not strengthen that spine, it should wait.
