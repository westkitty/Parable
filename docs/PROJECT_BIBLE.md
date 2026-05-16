# Parable Project Bible

## Core fantasy

Parable is a god-game prototype where the player is a disembodied god acting through a divine hand, casting miracles by drawing rituals directly onto the world. The experience should feel like stewardship, pressure, and intervention over a living island rather than menu-driven spell selection.

## Non-negotiable pillars

1. Gesture-first miracle casting remains the primary fantasy-facing interaction.
2. A clockwise spiral followed by a vertical zigzag must cast Fireball once the ritual system is in scope.
3. Villagers, terrain, worship, influence, and rival pressure must matter mechanically, not just cosmetically.
4. The prototype must stay browser-runnable and easy to restart at every milestone.

## Current milestone

**Playable state: Runnable world shell plus live ritual casting**

Live in the current build:

- Browser-runnable project with no build step
- Stylized Three.js terrain and world rendering on a central play surface
- Divine-hand hover feedback
- Sacred minimum ritual loop: clockwise spiral arms a ritual and vertical zigzag casts Fireball
- Living simulation: villagers, shrines, worship, player influence, rival influence, fear, rival corruption, and rival blight seeds
- Ten meaningful miracles with worship cost, cooldown pacing, visible VFX, gameplay consequences, and ritual glyph vocabulary
- One useful autonomous golem awakened through miracle casting
- Restart flow that rebuilds the world cleanly
- Project structure suitable for further iteration

Not yet live:

- More robust touch-first gesture recognition and broader multi-stroke ritual grammar
- More sophisticated territorial ownership and settlement growth

## Next milestone

**Next milestone: Deeper ritual and territory systems**

Required outcomes:

1. Refine the live gesture recognizer for higher reliability on touch and mouse
2. Expand the ritual vocabulary beyond the current spiral-plus-glyph single-stroke finishers
3. Push village allegiance and contested territory into longer-lived spatial systems
4. Grow rival action variety beyond blight seeding
5. Keep the sacred Fireball chain stable while broadening the rest of the ritual grammar

## Gesture vocabulary

Reserved gesture chain:

- Clockwise spiral: arms ritual state
- Vertical zigzag before expiration: casts Fireball

Current live glyph finishers after the spiral:

- Vertical zigzag: Fireball
- Downward line: Rain
- Closed circle: Blessing
- Horizontal line: Purge
- Sprout caret: Fertility
- Stone square: Stone Shape
- Upward line: Beacon
- Horizontal zigzag: Wind Lash
- Raising arch: Golem Wake
- Protective dome: Sanctuary

## Miracle rules

Current roster:

1. Fireball
2. Rain
3. Blessing
4. Purge
5. Fertility
6. Stone Shape
7. Beacon
8. Wind Lash
9. Golem Wake
10. Sanctuary

Current policy:

- Do not count a miracle unless it has a gesture or valid cast rule, visible feedback, world consequence, and pacing cost.
- Fireball is the first required miracle and must affect terrain, villagers, and contested state together.
- The current build uses spiral-armed ritual casting as the primary loop.
- Hotkey-based miracle focus is now a learning aid only, not the main casting path.

## Simulation rules

Current simulation pass:

- Villagers are finite-state agents with `wander`, `harvest`, `pray`, `shelter`, and `flee` states.
- Shrines create worship opportunities.
- Rival corruption pulses from a hostile core and periodically seeds frontier blight zones.
- Villages track hearth strength, faith, and rival pressure.
- Worship and influence rise when villagers pray, settle, harvest fertile ground, and gather near sacred zones.
- Fear rises near corruption and scorch zones, then falls under rain, blessing, beacon, and sanctuary pressure.
- Golems automatically cleanse harmful zones or mend weak villages.

Planned extensions:

- More reliable touch-first gesture recognition and broader rune vocabulary
- Stronger terrain-aware villager pathing
- Settlement growth and collapse thresholds
- Additional rival event variety beyond blight seeding

## Rendering approach

Current build uses a browser-playable Three.js scene with procedural terrain, structures, villagers, shrine beams, rival blight effects, and no build tooling. The Three.js module is currently loaded from a pinned browser import URL because the environment blocked local package vendoring.

Upgrade path:

- Keep the Three.js scene lightweight and code-generated while gesture readability remains the primary interaction requirement.
- Vendor the library locally later if environment access allows, but do not block milestone work on that packaging concern.

## Architecture notes

Current file layout:

- `index.html`: shell markup and HUD layout
- `styles.css`: responsive presentation and atmosphere
- `src/main.js`: lightweight runtime loader for the browser entrypoint
- `src/runtime/main.part*.js.txt`: split local runtime chunks that reconstruct the full game module
- `docs/PROJECT_BIBLE.md`: durable project direction

Near-term refactor targets after Fireball lands:

- Split configuration from world state
- Split renderer, input, and simulation systems
- Isolate gesture recognition into its own module

## Known issues and tradeoffs

- The sacred spiral-to-zigzag Fireball interaction is live, but the recognizer still needs tuning for edge cases and touch reliability.
- The ritual recognizer is still heuristic and likely needs more tuning for touch reliability and edge cases.
- Terrain is now modified by miracle zones, but the terrain system is still lightweight and not yet built around durable region ownership.
- Rival pressure is more active than before, but still centered on blight seeding and pressure waves rather than a wider event catalog.
