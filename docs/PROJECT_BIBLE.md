# Parable Project Bible Notes

`Parable_Bible.md` in the project root is the authoritative append-only ledger. This file is a readable project-state companion for humans and successor tools.

## Core Fantasy

Parable is a browser-playable god-game prototype where the player rules by drawing sacred rituals directly onto a living island. The core interaction is not menu casting. The player draws a clockwise spiral to arm a ritual, then draws a finishing glyph to complete a miracle.

Protected sacred law:

- **clockwise spiral → vertical zigzag = Fireball**

## Current Implementation

The current local project is a static no-build Three.js prototype.

Live:

- `index.html` shell with HUD, spellbook, event log, restart control, ritual status, and world canvas.
- `styles.css` responsive dark mythic interface styling.
- `src/main.js` lightweight runtime loader that fetches `src/runtime/main.partNN.js.txt` chunks and imports the assembled browser module.
- `src/runtime/main.partNN.js.txt` chunks containing the Three.js renderer, procedural terrain, compound placeholder assets, simulation, gesture recognizer, miracle roster, effects, and restart flow.
- `scripts/parable-turn-guard.mjs` start/finish regression guard.
- `scripts/verify-parable.mjs` local verifier.
- `docs/GENERATED_ASSET_LIST.md` future asset-generation plan.
- A visible module-load warning in `index.html` that is hidden by the assembled runtime only after the Three.js module starts successfully.

## Live Systems

### Rendering

- Three.js scene with perspective camera, fog, lighting, shadow-capable renderer, procedural island terrain, shoreline, villages, shrines, trees, standing stones, villagers, rival citadel, golems, and miracle effects.
- Current prototype assets are intentionally procedural and lightweight. They are better than raw debug cubes/spheres, but still placeholders.

### Gesture Casting

- Pointer, mouse, pen, and touch gestures are captured over the world canvas.
- The gesture path is interpolated and simplified for more reliable recognition.
- A clockwise spiral arms the ritual for a short timeout.
- Finishers cast miracles only while the ritual is armed.
- Fireball is bound to the vertical zigzag finisher.

### Miracles

The live roster contains ten miracles, each with worship cost, cooldown pacing, visible effects, and gameplay consequences:

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

### Simulation

- Regions track sacred influence, rival influence, corruption, fertility, scorch, sanctity, shelter, stone, wetness, and food.
- Region ownership is long-lived and resolves into sacred, rival, or contested.
- Villagers can wander, pray, harvest, shelter, or flee.
- Worship generation responds to villager faith, prayer behavior, food, and fear.
- Rival pressure spreads from a visible hostile citadel.
- Golems move toward corrupted/rival regions and cleanse them over time.

## Verification Status

The project can be locally checked with:

```bash
node scripts/verify-parable.mjs
```

The verifier covers:

- required file existence and non-empty status
- syntax checks for JavaScript modules and scripts
- expected implementation hooks in the assembled runtime chunks
- local `index.html` references
- local static serving
- HTTP 200 responses for served core files

Known limit:

- Full visual WebGL/browser behavior is not proven by the local verifier because Three.js is loaded from a CDN. A real browser check is still required after extracting the package or checking out the repo. If a runtime chunk or the CDN import fails, the module-load warning remains visible instead of silently leaving the player confused.

## Known Tradeoffs

- Three.js is imported from `https://esm.sh/three@0.164.1`; offline play requires vendoring the dependency.
- Gesture recognition is conservative and should be tuned through real mouse/touch testing.
- Procedural assets are readable prototype stand-ins, not final art.
- The app runtime is chunked as text files so GitHub connector updates stay manageable while preserving a no-build static browser app. Refactor into true ES modules only after the prototype behavior stabilizes.

## Next Recommended Step

Run the packaged project in a real browser and manually test the full ritual chain:

1. Serve the project with `python3 -m http.server 8000`.
2. Open `http://localhost:8000`.
3. Draw a clockwise spiral over the island.
4. Draw a vertical zigzag before the ritual expires.
5. Confirm Fireball fires, costs worship, triggers cooldown, scorches terrain, frightens villagers, and reduces rival/corruption pressure near impact.
