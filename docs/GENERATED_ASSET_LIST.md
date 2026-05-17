# Parable Generated Asset List

This list tracks future non-placeholder assets needed to replace or augment the current procedural prototype assets. Each entry names the gameplay purpose, the current procedural stand-in, desired final direction, priority, and implementation constraints.

## terrain and environment

### Island terrain kit
- Purpose in gameplay: Gives the playable island readable elevation, region ownership, fertility, scorch, and corruption state.
- Current placeholder/procedural representation: Three.js plane terrain with vertex colors and procedural height variation.
- Desired final direction: Stylized hand-sculpted island mesh or modular terrain tiles with painterly sacred/rival biome overlays.
- Priority: high
- Implementation notes or constraints: Must preserve static browser play; keep asset size small or progressively loaded.

### Shoreline and water treatment
- Purpose in gameplay: Frames the island and gives the player orientation around the playable boundary.
- Current placeholder/procedural representation: Torus shoreline glow around the island.
- Desired final direction: Animated low-poly water ring, foam cards, and shallow coast tint.
- Priority: medium
- Implementation notes or constraints: Should not obscure ground gesture readability.

## villagers and population

### Villager model set
- Purpose in gameplay: Makes population state legible at a glance: wander, pray, harvest, shelter, flee.
- Current placeholder/procedural representation: Capsule body, cone hood, small pack, state color tint.
- Desired final direction: Small stylized villagers with 3-5 silhouettes, robes/tools, and readable animation loops.
- Priority: high
- Implementation notes or constraints: Must remain readable from top-down/isometric camera.

### Villager state animation loops
- Purpose in gameplay: Communicates worship, fear, labor, sheltering, and panic without reading HUD text.
- Current placeholder/procedural representation: Bobbing, rotation, hood color changes.
- Desired final direction: Short looping clips or procedural pose states for prayer kneel, harvesting, running, huddling.
- Priority: high
- Implementation notes or constraints: Prefer lightweight skeletal or baked transform animation.

## structures and settlements

### Village hut kit
- Purpose in gameplay: Shows settlement centers and allegiance banners.
- Current placeholder/procedural representation: Cylinder huts with cone roofs and small color banners.
- Desired final direction: Modular huts, hearths, fences, paths, storehouses, and village-specific variations.
- Priority: high
- Implementation notes or constraints: Banners must be tintable for sacred/rival/contested allegiance.

### Village ground decals
- Purpose in gameplay: Shows settlement footprints, paths, work areas, and damage/safety state.
- Current placeholder/procedural representation: Thin torus ring path around village.
- Desired final direction: Decal rings, dirt paths, prayer circles, harvest patches, scorch marks.
- Priority: medium
- Implementation notes or constraints: Must not conflict with gesture trace visibility.

## shrines and sacred architecture

### Shrine model set
- Purpose in gameplay: Anchors worship generation and sacred influence.
- Current placeholder/procedural representation: Cylinder base, cone obelisk, torus halo, offering bowls.
- Desired final direction: Distinct sacred architecture with readable ritual silhouette and animated devotion elements.
- Priority: high
- Implementation notes or constraints: Halo/ritual effects should be separated for animation and tint control.

### Sacred beacon structure
- Purpose in gameplay: Shows Beacon miracle's long-lived sacred projection.
- Current placeholder/procedural representation: Cylinder tower, cone flame, transparent beam.
- Desired final direction: Tall shrine-tower with animated light beam and ground sigil.
- Priority: medium
- Implementation notes or constraints: Needs clear vertical silhouette without blocking play surface.

## rival influence and corruption

### Rival citadel
- Purpose in gameplay: Marks the hostile pressure source and gives corruption a visible origin.
- Current placeholder/procedural representation: Cluster of dark cone spires with red torus ring.
- Desired final direction: Jagged blight citadel, thorn arches, pulsing core, spreading cracks.
- Priority: high
- Implementation notes or constraints: Must remain visually hostile but not noisy enough to hide gestures.

### Corruption ground overlays
- Purpose in gameplay: Shows rival-owned and corrupted regions.
- Current placeholder/procedural representation: Vertex color blend toward red/dark tones.
- Desired final direction: Animated decals, vein textures, cracked ground, smoke wisps, red edge creep.
- Priority: high
- Implementation notes or constraints: Should layer with terrain ownership colors and miracle effects.

## miracles and spell effects

### Fireball impact
- Purpose in gameplay: Confirms spiral-to-zigzag miracle and shows rival burn/scorch consequence.
- Current placeholder/procedural representation: Ring, cone column, radial cone shards.
- Desired final direction: Stylized meteor streak, impact bloom, ember shards, scorch decal.
- Priority: high
- Implementation notes or constraints: Core ritual must remain clockwise spiral → vertical zigzag = Fireball.

### Rain miracle
- Purpose in gameplay: Shows fertility/food restoration and scorch cooling.
- Current placeholder/procedural representation: Blue line raindrops around cast point.
- Desired final direction: Rain sheet, puddle ripples, terrain dampening overlay.
- Priority: medium
- Implementation notes or constraints: Avoid overdraw that hides villagers.

### Sanctuary dome
- Purpose in gameplay: Shows protective shelter zone and rival pressure reduction.
- Current placeholder/procedural representation: Wireframe hemisphere.
- Desired final direction: Soft translucent ward dome with glyph panels and safe ground tint.
- Priority: high
- Implementation notes or constraints: Dome must be transparent and non-blocking.

## UI and HUD icons

### Miracle icons
- Purpose in gameplay: Helps players learn the ten miracle roster.
- Current placeholder/procedural representation: Text-only cards with glyph names.
- Desired final direction: Small monochrome or duotone icons for each miracle and finisher glyph.
- Priority: high
- Implementation notes or constraints: Needs readable 24px and 48px variants.

### Region ownership HUD icons
- Purpose in gameplay: Clarifies sacred/rival/contested state.
- Current placeholder/procedural representation: Text stat labels and region colors.
- Desired final direction: Three symbolic icons: sacred mark, rival thorn, contested split sigil.
- Priority: medium
- Implementation notes or constraints: Must pass contrast on dark panels.

## gesture glyphs and ritual feedback

### Spiral opener glyph
- Purpose in gameplay: Teaches the required ritual opener.
- Current placeholder/procedural representation: Text instruction and temporary line traces.
- Desired final direction: Animated tutorial glyph showing clockwise spiral direction and timing.
- Priority: high
- Implementation notes or constraints: Must make direction unmistakable for mouse, pen, and touch.

### Finisher glyph set
- Purpose in gameplay: Teaches the ten gesture finishers.
- Current placeholder/procedural representation: Text labels such as vertical zigzag, closed circle, roof ward.
- Desired final direction: Hand-drawn glyph icons plus animated stroke-order samples.
- Priority: high
- Implementation notes or constraints: Must avoid false similarity between glyphs.

## sound and music

### Miracle sound palette
- Purpose in gameplay: Confirms casts and distinguishes miracles without relying only on visuals.
- Current placeholder/procedural representation: None.
- Desired final direction: Short layered one-shots for fire, rain, blessing, purge, fertility, stone, beacon, wind, golem, sanctuary.
- Priority: medium
- Implementation notes or constraints: Provide mute option before default-on audio.

### Ambient island loop
- Purpose in gameplay: Gives the prototype atmosphere and communicates sacred/rival tension.
- Current placeholder/procedural representation: None.
- Desired final direction: Low looping ambience with wind, distant bells, water, and subtle corruption drone.
- Priority: low
- Implementation notes or constraints: Keep file size modest.

## accessibility/readability assets

### Gesture tutorial overlays
- Purpose in gameplay: Helps players understand the ritual loop and failed gesture reasons.
- Current placeholder/procedural representation: HUD text only.
- Desired final direction: Optional overlay cards with animated examples and clear failure states.
- Priority: high
- Implementation notes or constraints: Must support reduced motion and text fallback.

### High contrast glyph pack
- Purpose in gameplay: Makes gesture and miracle feedback readable for low vision/colorblind players.
- Current placeholder/procedural representation: Color-coded lines and text.
- Desired final direction: Patterned glyph strokes, outline effects, and shape-coded ownership marks.
- Priority: medium
- Implementation notes or constraints: Do not rely on red/green distinctions alone.

## packaging/marketing screenshots if useful

### Prototype hero screenshot
- Purpose in gameplay: Shows Parable's current browser-playable milestone at a glance.
- Current placeholder/procedural representation: None.
- Desired final direction: Captured island view with shrine, rival citadel, villagers, and active Fireball effect.
- Priority: medium
- Implementation notes or constraints: Requires real browser/WebGL session.

### Gesture explainer image
- Purpose in gameplay: Documents the core ritual for README and future testers.
- Current placeholder/procedural representation: Text only.
- Desired final direction: Two-panel image: clockwise spiral opener then vertical zigzag Fireball finisher.
- Priority: high
- Implementation notes or constraints: Must match actual recognizer grammar.
