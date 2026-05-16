# Parable

Parable is a browser-first god-game prototype about ruling an island as a disembodied divine force. The player acts through a hovering holy hand, eventually drawing rituals directly onto the land to cast miracles.

This repository currently contains a runnable Three.js prototype with a gesture-first miracle roster:

- a browser-playable shell with a stylized Three.js world view
- a living island simulation with villagers, shrines, worship, player influence, rival influence, rival blight pressure, and awakened golems
- ten meaningful miracles with worship cost, cooldown pacing, visual feedback, gameplay consequences, and ritual glyphs
- a restartable prototype loop with no build step
- a project bible that tracks the current playable state and next ritual milestone

## Run locally

Serve the folder with any static file server from the project root.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Note: the current renderer imports a pinned Three.js module URL in the browser because this environment blocked local package download during the build. The game code itself remains local and build-free.

## Current controls

- Move the mouse or drag a finger over the world to guide the divine hand.
- Hold and draw a clockwise spiral on the world to arm a ritual.
- Finish with a second glyph before the trace fades to cast a miracle from that anchored site.
- Hold `Shift` while dragging, or use right mouse drag, to pan the camera.
- Scroll to zoom.
- Use hotkeys `1` through `0` to highlight miracle vocabulary for learning.
- Use **Restart World** to rebuild the simulation cleanly.

## Current milestone

This pass now includes:

1. Runnable world shell
2. Procedural Three.js terrain and structures
3. A playable miracle roster using spiral-plus-glyph ritual casting
4. Ongoing simulation consequences for villagers, mutable terrain, player influence, worship, and rival pressure
5. A useful autonomous golem awakened by miracle

The sacred spiral-to-zigzag Fireball chain is now the core live ritual loop for Fireball, and the rest of the roster extends from that same spiral-armed grammar.
