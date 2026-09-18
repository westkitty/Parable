# Parable Project Recovery Source

**Date created:** 2026-08-18  
**Project:** Parable (god game)  
**Purpose:** Durable recovery, authority, implementation-state, and restart source for future Parable work.  
**Status:** **Current recovery baseline — READY AFTER SPECIFIC VALIDATION**  
**Primary repository:** `westkitty/Parable`  
**Known local repository path:** `/Users/andrew/Parable`  
**Current implementation frontier:** `spike/godot-hand-feel-2026-07-02` at `d6f66b705c0be43be791585b2b6953450ecbd9c1`  
**Current default branch:** `main` at `6c96ce7dd08e2a064dfe77ae59016bcc7d139e66`

---

## 0. How to use this document

Read this document **before planning, coding, prompting another agent, or reopening old Parable assumptions**.

This is not a claim that every historical Parable source agrees. It exists because they do not.

Use this authority rule:

1. **Newest explicit Andrew instruction** wins.
2. A **newer accepted Parable source document** may supersede an older one in its own domain.
3. This recovery source governs the reconstructed current state unless superseded by newer direct evidence.
4. For **miracle-system specifics**, `PARABLE_MIRACLE_SYSTEM_ADDENDUM_2026-07-03.md` is the newest governing miracle source found during recovery.
5. For **overall game identity, hand-first godhood, temple UI, shrine learning, and world-function doctrine**, use the July 2 design plan and world-function doctrine.
6. For **what is actually implemented**, inspect the repository source and exact branch/commit. Documentation claims do not outrank code or executed evidence.
7. For **subjective feel**, only human play evidence counts. Headless tests cannot establish that the game feels like godhood.
8. Historical prompts remain evidence of previous goals. They do **not** automatically remain requirements.

When new evidence materially changes project state, **update this document instead of starting another archaeology pass**. Preserve old findings by marking them superseded rather than silently deleting them.

---

# 1. Executive recovery verdict

Parable has two major implementation generations and one newer miracle-design generation:

1. **Historical browser/Three.js prototype on `main`**  
   A broad early god-game prototype with procedural island simulation, ten prototype miracles, villages, shrines, rival pressure, simple golems, and a persistent HUD. It is useful evidence, but current July design documents explicitly say it does not prove the final control fantasy and should not be treated as sacred architecture.

2. **Godot hand-feel spike on `spike/godot-hand-feel-2026-07-02`**  
   A later, real implementation experiment focused on the Divine Hand, camera, grabbing, throwing, gesture coexistence, shrine/temple boundaries, symbols, and villager witness behavior. It was built and repeatedly patched through Patch 11. Automated/headless contracts passed in recorded runs. The final human hand-feel/platform verdict is not preserved in the evidence recovered here.

3. **July 3 miracle-system addendum**  
   A newer source-document direction that supersedes the flat ten-miracle thinking. It defines six deep miracle families, universal spiral charge in either direction, physically held miracles, upgrade spirals, shake-to-dissolve refunds, terrain memory, villager witness behavior, and a Fire/Water vertical slice. This source was available in the Parable Project materials but was **not found in the inspected GitHub repository**.

Therefore the project is **not lost**, but it must not resume by simply adding more features.

The immediate governing question remains:

> **Does the final Godot hand-feel spike actually feel like Parable's godhood fantasy strongly enough to become the production foundation?**

Until that is explicitly answered, do not merge the spike into `main`, do not rebuild the full miracle system, and do not reopen the old web prototype as if it were current architecture.

---

# 2. Project purpose

## 2.1 Central fantasy

Parable is a hand-first god game built around one experiential law:

> **The player loads into a living island and feels like the god.**

The player is not a humanoid avatar, creature, hero, or RTS commander.

The player's direct identity is:

- the **Divine Hand**, and
- the chosen **god symbol**.

Everything else exists to support the player's direct divine presence in a living miniature world.

## 2.2 Mechanical north star

The intended split is:

- **Graphics:** closer to the remembered richness/readability of *Black & White 2*.
- **Mechanics:** closer to *Black & White 1* or an imagined *Black & White 1.5*.
- **Core feeling:** tactile hand control, living-world reactivity, discovered miracles, belief, villages, shrines, consequences, and minimal conventional UI.

This is an experiential/control target, not permission to copy proprietary assets, code, names, exact protected content, or presentation.

## 2.3 Forbidden drift

Parable must not become:

- a button-first RTS;
- a dashboard sim;
- a normal city builder with divine paint;
- a creature-management or creature-babysitting game;
- a normal avatar RPG;
- a menu-heavy spellcasting sandbox;
- a persistent-HUD management game;
- a clone of Black & White content or assets.

---

# 3. Core design laws

These are the strongest protected laws recovered from the July 2 plan/doctrine and the later miracle addendum.

## 3.1 Godhood laws

- The player is the god.
- The god has no full physical avatar beyond hand and symbol.
- Direct god powers remain primary.
- The player must never feel like a supervisor of the real main character.
- Learned miracles remain available once learned.
- No miracle loadouts.
- Golems may never cast miracles.

## 3.2 Control laws

- Mouse-first control is mandatory.
- Touch support is desirable later, but secondary to mouse-first proof.
- Interaction grammar must be stable and predictable.
- What is grabbable must not change arbitrarily.
- Grabbing and throwing are one interaction family: **hold → move → release with momentum**.
- Miracles should feel drawn/formed through the hand over the world, not selected from a spell toolbar.

## 3.3 UI laws

Normal world gameplay should have almost no conventional HUD.

Do not put persistent:

- resource bars;
- spell hotbars;
- objective panels;
- settings buttons;
- save/load menus;
- stats dashboards;
- tutorial panels;
- miracle loadouts

into ordinary world play.

Major explicit interface belongs in the **temple**.

## 3.4 Progression laws

- Miracles and upgrades should often be **found**, not merely awarded by quests.
- Old-god shrines teach glyph knowledge.
- Environmental rituals awaken or reveal that knowledge.
- The player learns through world interaction and tracing.
- Prefer fewer deep miracle families over many shallow one-off buttons.
- Learned knowledge persists.

## 3.5 World laws

- The world has had gods for a long time.
- Islands should feel layered, ancient, sacred, and investigable.
- Villagers are emotional and social witnesses, not decorative dots.
- Belief/worship is a meaningful resource.
- Morality is visible consequence, not a judgment meter.
- The world should remember divine action through scars, growth, weather, symbols, fear, worship, restoration, and other persistent or semi-persistent states.

---

# 4. Source and authority map

## 4.1 Project sources recovered

### `Remastering Black & White.txt`

Historical early/full prototype brief.

Important historical requirements included:

- one self-contained HTML file;
- touchscreen and mouse support;
- a visible resource/UI layer;
- at least ten separate miracles;
- one autonomous golem as an automation core;
- rival pressure;
- villages and worship simulation.

**Current status:** historical evidence; many central requirements are superseded.

### `Parable Plan Review.txt`

A July 2 review describing an implementation patch/appendix and confirming the then-current direction:

- hand-first godhood;
- temple-contained UI;
- shrine-learned miracles;
- villagers as witnesses;
- golems as optional non-miracle macros.

**Current status:** supporting historical evidence. It references generated artifacts that were not all found as current GitHub authorities.

### `PARABLE_MIRACLE_SYSTEM_ADDENDUM_2026-07-03.md`

Status inside the source itself:

> **Source-document addendum / current miracle design direction**

It explicitly replaces the earlier loose ten-separate-miracles thinking as the working miracle-system target.

**Current status:** governing miracle-specific source unless newer direct instruction supersedes it.

## 4.2 GitHub design sources

### `docs/PARABLE_PROJECT_DESIGN_AND_PLAN_2026-07-02.md`

Governs overall project identity and refoundation direction.

Key rule:

> The current prototype is useful evidence, not sacred architecture.

### `docs/PARABLE_WORLD_FUNCTION_DOCTRINE_2026-07-02.md`

Governs:

- hand + symbol representation;
- mouse-first hand-control philosophy;
- temple-contained major UI;
- world-space feedback;
- fixed temple chamber direction;
- minimal-HUD doctrine.

### `Parable_Bible.md`

Useful additive project history, but its top-level current-state header describes the older browser era while later entries record the July refoundation. Read it chronologically and do not let its stale header override later entries/source docs.

## 4.3 GitHub implementation evidence

### `main`

Head recovered:

`6c96ce7dd08e2a064dfe77ae59016bcc7d139e66`

Commit message:

`Add comprehensive Parable project design plan`

This branch still contains the older Three.js/browser prototype.

### `spike/godot-hand-feel-2026-07-02`

Final recovered head:

`d6f66b705c0be43be791585b2b6953450ecbd9c1`

Commit message:

`fix: make held objects read as gripped not stored`

This is the latest substantial implementation frontier recovered.

### Relevant Godot evidence files

- `godot-spike/BUILD_REPORT.md`
- `godot-spike/PATCH_01_REPORT.md` through `PATCH_11_REPORT.md`
- `godot-spike/NEXT_PLAYTEST_PACKET.md`
- `godot-spike/README_FOR_ANDREW.md`
- `godot-spike/tests/verify_playability_surrogates.gd`
- `godot-spike/scripts/hand_input.gd`
- `godot-spike/scripts/camera_rig.gd`
- `godot-spike/scripts/grabbable.gd`
- `godot-spike/scripts/hand_visual.gd`
- `godot-spike/scripts/world.gd`
- `godot-spike/scripts/gesture_recognizer.gd`
- `godot-spike/scripts/miracle_fx.gd`
- `godot-spike/scripts/villager_proxy.gd`

---

# 5. Current architecture

## 5.1 Historical Three.js/browser architecture on `main`

The browser prototype is a static no-build web app.

Execution shape:

```text
index.html
  -> src/main.js
    -> fetches src/runtime/main.part01.js.txt ... main.part12.js.txt
      -> concatenates runtime
        -> imports assembled Blob ES module
          -> Three.js world/simulation
```

Important current interpretation:

- It proves a browser ritual/island prototype can exist.
- It does not prove Parable's final hand-control fantasy.
- Its persistent HUD conflicts with current July doctrine.
- Its ten-miracle model is superseded by the July 3 family model.
- It should remain historical/reference evidence unless a future platform decision deliberately returns to web.

## 5.2 Godot hand-feel spike architecture

The Godot spike was built specifically to answer whether a Divine Hand can feel like the player's body.

Current system map:

| Area | Primary files / behavior |
|---|---|
| World | `scenes/Main.tscn`, `scripts/world.gd` |
| Divine Hand input | `hand_input.gd` |
| Hand visual/poses | `hand_visual.gd` |
| Camera | `camera_rig.gd` |
| Physical objects | `grabbable.gd` + object proxy scripts |
| Throw velocity | `throw_sampler.gd` |
| Gesture recognition | `gesture_recognizer.gd` |
| Gesture visuals | `gesture_trace.gd` |
| Shrine teaching | `shrine.gd` |
| Temple | `temple_door.gd`, `temple_interior.gd` |
| God identity | `god_identity.gd`, symbol scripts |
| Villager witnessing | `villager_proxy.gd`, `witness_director.gd` |
| Placeholder miracle effects | `miracle_fx.gd` |
| Diagnostics | `diagnostics.gd`, F3 |
| Verification | `verify.sh`, headless tests, playability surrogates |

The spike is deliberately small and centralized. Do not refactor it into production architecture merely because it looks imperfect. First determine whether the underlying interaction works.

---

# 6. What is verified, what is not

## 6.1 Verified in source / repository state

The Godot spike contains real implementations for:

- Divine Hand representation;
- right-button grab/carry/release;
- left-drag empty-space pan;
- left-click interaction;
- middle-button orbit;
- scroll-wheel zoom;
- Escape safe cancellation/release;
- object-specific grippable classes;
- object-specific grip contacts;
- throw/drop distinction;
- gesture trace and recognition;
- clockwise-spiral arming in the current spike;
- circle and zigzag placeholder glyph paths;
- shrine awakening/teaching;
- symbol choice stub;
- temple entry/interior stub;
- villager witness reactions;
- placeholder blessing and bolt effects;
- F3 diagnostics.

## 6.2 Historically observed automated validation

Recorded reports show successful runs of:

- Godot version detection;
- headless import;
- script loading/syntax checks;
- headless main-scene execution;
- structural smoke tests;
- interaction contract tests;
- playability surrogate tests;
- drop/throw math tests;
- shrine/teaching path checks;
- camera pan/orbit/zoom checks;
- focus-state cleanup checks;
- held-object alignment checks.

These are meaningful engineering evidence.

They do **not** prove feel.

## 6.3 Still unverified

The following remain human-review claims unless newer direct evidence appears:

- the hand feels like the player's body rather than a cursor;
- camera movement becomes transparent rather than intrusive;
- grabbing feels consistently intentional;
- throws are predictable and satisfying;
- gentle placement is controllable;
- gesture drawing feels sacred/physical;
- shrine learning is readable without developer diagnostics;
- temple entry feels ceremonial rather than menu-like;
- symbol selection feels meaningful;
- Godot is the correct production platform;
- Patch 11's final visual grip changes passed a conclusive human sign-off.

## 6.4 Touch status

Historical early work required touch compatibility.

Current July doctrine prioritizes **mouse-first proof** and makes touch secondary.

The recovered Godot spike should be treated as **not proven for touch parity**.

Do not make touch the next blocker unless Andrew explicitly changes priority.

---

# 7. Current implementation frontier

## 7.1 Final Godot branch state recovered

Branch:

`spike/godot-hand-feel-2026-07-02`

Head:

`d6f66b705c0be43be791585b2b6953450ecbd9c1`

Final commit focus:

> held objects should read as **gripped**, not as if stored inside the palm.

Patch 11 specifically changed the model to explicit `GripContact` semantics.

Object intent:

- rock: gripped from top/front side;
- villager: upper body/head contact so body dangles;
- offering: upper/mid totem contact, readable/upright;
- tree: trunk contact.

F3 can display grip-contact diagnostics.

The final committed `NEXT_PLAYTEST_PACKET.md` still asks Andrew to validate these areas in the rendered game.

That is the strongest evidence that the final human gate had **not been durably closed in the repository itself**.

---

# 8. Superseded or stale project directions

These must not silently return as current requirements.

| Historical direction | Current status |
|---|---|
| One self-contained `parable.html` | **Superseded** |
| Canvas/2D as mandatory final foundation | **Superseded** |
| Ten independent core miracle buttons | **Superseded** |
| Persistent world HUD / spell hotbar | **Superseded** |
| Golems as the defining central mechanic | **Superseded** |
| Villagers primarily as anonymous resource agents | **Superseded** |
| Creature-like emotional proxy for godhood | **Rejected** |
| Learned miracle loadouts | **Rejected** |
| Golems casting miracles | **Forbidden** |
| Current Three.js chunked runtime as architecture to preserve | **Superseded as default foundation** |
| Godot already accepted as permanent platform | **Not established** |
| Clockwise-only universal miracle charge | **Superseded by July 3 miracle addendum** |
| Vertical zigzag = production Fireball selector | **Superseded** |

Historical implementation may still contain useful technical patterns. Do not confuse reusable technique with current design authority.

---

# 9. Major contradictions and their resolution

## 9.1 Browser prototype vs July refoundation

**Conflict:** broad browser/HUD prototype versus hand-first/minimal-HUD godhood.

**Resolution:** July 2 plan explicitly demotes the browser prototype to useful evidence rather than sacred architecture.

## 9.2 Ten miracles vs six miracle families

**Conflict:** early prototype demanded at least ten separate miracles.

**Resolution:** July 3 miracle addendum explicitly replaces that flat structure with six deep families.

## 9.3 Clockwise-only spiral vs either direction

**Conflict:** current Godot recognizer treats clockwise spiral as semantic arming behavior.

**Resolution:** July 3 miracle addendum says **clockwise and counterclockwise are both valid** and direction is non-semantic for now.

## 9.4 Zigzag Fireball vs Godot Bolt vs new Fire ritual

Historical states:

- old ritual concept: `clockwise spiral -> vertical zigzag = Fireball`;
- Godot spike: zigzag teaches/casts a placeholder Bolt;
- July 3 production direction: universal spiral -> **family-specific Fire symbol** -> physically held Fireball.

**Resolution:** neither the old Fireball mapping nor the Godot Bolt mapping is the final Fire-family contract.

The exact Fire-family symbol is still open and must not be invented casually.

## 9.5 Main branch vs latest implementation work

`main` stops before the later Godot implementation series.

**Resolution:** treat `main` as the default historical web branch and the Godot spike branch as the current implementation frontier. Do not merge until the platform gate is passed.

## 9.6 Bible header vs later ledger entries

`Parable_Bible.md` has older browser-prototype language near its top, while later entries record the refoundation.

**Resolution:** treat the bible as chronological/additive. Later accepted entries and July design sources supersede stale top-level summaries.

---

# 10. Miracle system — current governing direction

This section summarizes `PARABLE_MIRACLE_SYSTEM_ADDENDUM_2026-07-03.md` and should not be flattened back into the old spell-button model.

## 10.1 Core law

> **Miracles are not selected; they are held, intensified, handled, and released.**

A proper Parable miracle should have:

1. a visible held form in the Divine Hand;
2. a clear gesture/handling method;
3. visible world consequence;
4. worship cost/reserve/refund behavior;
5. upgrade behavior that changes handling, materiality, persistence, or consequence;
6. interactions with other miracle families;
7. readable villager response.

## 10.2 Universal ritual grammar

Current production grammar:

```text
Universal Spiral
    -> Family Symbol
        -> Held Tier I Miracle
            -> cast at Tier I
            OR Spiral Upgrade -> Held Tier II
                -> cast at Tier II
                OR Spiral Upgrade -> Held Tier III
                    -> cast at Tier III
```

At a charged/held stage:

```text
Shake Hand -> Dissolve -> refund eligible unused worship reserve
```

### Spiral direction

- clockwise accepted;
- counterclockwise accepted;
- direction currently non-semantic.

## 10.3 Worship reserve model

Recommended behavior:

- initial spiral: no/tiny cost;
- recognized Tier I: reserve Tier I cost;
- upgrade: reserve additional cost;
- shake before use: refund reserved cost;
- released/cast portion: cost becomes final;
- partially used channel: refund unused reserve only.

## 10.4 Six core families

| Family | Tier I | Tier II | Tier III |
|---|---|---|---|
| Fire | Fireball | Divine Napalm | Meteor |
| Water / Weather | Rain Cloud | Downpour | Hurricane or Freeze candidate |
| Lightning | Lightning Bolt | Chain Lightning | Thunderclap / Kinetic Judgment |
| Nature / Growth | Growth Touch | Bloom Trail | Verdant Surge |
| Protection / Ward | Ward Touch | Circle Ward | Sanctuary Dome |
| Force | Divine Breath | Pressure Wave | Vortex |

## 10.5 Parked old miracle ideas

Do not build these as current core miracles without a new decision:

- Quake;
- Convert / Inspire Worship;
- standalone Purify;
- Influence Spike;
- standalone Fear;
- Plague;
- standalone Heal;
- Flood as default Water III;
- Harvest Blessing;
- Curse;
- Summon Echo.

## 10.6 Shared terrain/material states

Minimum current target:

- Neutral;
- Fertile;
- Wet;
- Burning;
- Scorched;
- Overgrown;
- Shielded;
- Frozen only if Water Tier III becomes Freeze.

The island should remember divine action through shared states rather than private per-spell flags.

## 10.7 First miracle vertical slice

Do **not** build all six families shallowly.

The recommended first production miracle slice is:

1. universal spiral recognition;
2. Fire symbol recognition;
3. held Fireball;
4. throwable Fireball;
5. worship reserve/spend;
6. shake-to-dissolve refund;
7. upgrade spiral while holding Fireball;
8. Divine Napalm Tier II transformation;
9. pour/smear Napalm;
10. Burning terrain state;
11. Rain Cloud Tier I;
12. Rain extinguishes Fire;
13. Wet and Scorched terrain states;
14. villagers flee Fire;
15. villagers calm when danger is gone.

This proves the actual production miracle grammar without recreating the old breadth-first spellbook mistake.

---

# 11. Central ritual status

The old recovery question included the historical sequence:

```text
clockwise spiral -> armed state -> vertical zigzag -> Fireball -> visible consequence
```

Current status:

| Stage | Status | Current interpretation |
|---|---|---|
| Clockwise spiral | **Stale as exclusive rule** | Either spiral direction should eventually charge divine miracle state. |
| Armed state | **Current concept** | Universal spiral still enters charged miracle state. |
| Vertical zigzag | **Superseded as Fireball selector** | Exact Fire family symbol remains unresolved. |
| Fireball | **Current Tier I Fire miracle** | Must appear physically held, then be aimed/thrown. |
| Visible world consequence | **Current and strengthened** | Fire creates hazard/scorch, villagers flee, Rain can extinguish. |
| Touch proof | **Absent / later** | Mouse-first remains priority. |

Do not use the old zigzag Fireball sequence as the next implementation contract.

---

# 12. Protected capabilities

Future work must preserve these unless Andrew explicitly changes them or stronger direct evidence proves a replacement.

## 12.1 Experience invariants

- Player is the god.
- Divine Hand is the primary embodied interface.
- Symbol is identity, not a mechanical prison.
- Normal world remains minimal-HUD.
- Temple remains the major explicit interface container.
- Villagers visibly witness divine action.

## 12.2 Interaction invariants

- Mouse-first direct manipulation.
- Stable grab rules.
- Hold/move/release momentum family.
- Escape cancels safely.
- Camera supports hand interaction rather than taking over.
- Held objects must read as physically gripped, not stored inside the palm.

## 12.3 Miracle invariants

- No primary spell-button casting.
- Learned miracles remain available.
- Miracle knowledge is world/shrine discoverable.
- Production miracles must eventually appear held in the hand.
- Miracle use must create visible world or witness consequence.
- Golems do not cast miracles.

## 12.4 Golem boundary

Golems are optional vessels of delegated non-miracle behavior.

They may eventually:

- carry/move resources;
- patrol;
- repair/build;
- follow drawn paths;
- repeat demonstrated physical actions;
- respond to simple triggers.

They are not:

- pets;
- creatures;
- avatars;
- the emotional center;
- miracle casters;
- the source of the player's godhood.

---

# 13. Fragile implementation areas

Do not casually refactor these before the hand-feel/platform gate.

## `godot-spike/scripts/hand_input.gd`

High-risk convergence point for:

- grabbing;
- carry;
- click-vs-pan;
- gesture mode;
- miracle arming;
- cancellation;
- focus recovery;
- camera cooperation.

## `godot-spike/scripts/camera_rig.gd`

Repeated patches touched:

- orbit;
- pan;
- zoom;
- fallback controls;
- drift;
- camera/held-object coexistence.

## Grip-contact path

Sensitive files:

- `grabbable.gd`;
- `hand_visual.gd`;
- rock/villager/offering/tree proxies;
- hold diagnostics/tests.

Patch 11 exists because previous alignment could be technically close while visually wrong.

## Gesture recognizer

Two separate issues exist:

1. live human tolerance is not fully proven;
2. its current clockwise-only semantic rule is stale relative to July 3.

Do not optimize old semantics into permanence.

## `world.gd`

Central wiring for:

- glyph casting;
- shrine teaching;
- symbol ritual;
- temple flow.

Production miracle work will eventually cross this boundary.

---

# 14. Do-not-touch warnings before the platform gate

Until a final Godot human verdict is recorded:

- do not merge the Godot spike into `main`;
- do not delete/archive the browser prototype;
- do not redesign the Godot controls;
- do not refactor `hand_input.gd` or `camera_rig.gd` for cleanliness;
- do not implement the six-family miracle system;
- do not switch clockwise-only recognition to bidirectional as an isolated patch;
- do not invent a Fire-family glyph;
- do not add touch solely to satisfy the May prototype prompt;
- do not build golems;
- do not add rival-god systems;
- do not revive persistent HUD panels;
- do not claim Godot is accepted because automated tests pass;
- do not treat the old ten-miracle prototype as current product scope.

---

# 15. Current blockers

## Blocker 1 — human hand-feel/platform verdict

This is the immediate blocker.

The current design plan intentionally gates platform commitment on whether the Divine Hand feels right.

Automated validation can prove objective contracts but cannot answer:

- body vs cursor;
- tactile satisfaction;
- camera transparency;
- ritual sacredness;
- godhood feeling.

## Blocker 2 — miracle source-of-truth drift

The July 3 miracle addendum is newer than the repo's current production documents/implementation and was not found in the inspected GitHub repository.

Before production miracle implementation, make sure future agents can actually read it as an authoritative source.

## Blocker 3 — unresolved Fire-family symbol

The exact Fire family symbol shape remains an explicit open question.

Do not invent one during an implementation task unless Andrew or a controlling design source resolves it.

---

# 16. What is not currently blocking progress

These are important later, but are **not** the next gate:

- touch parity;
- final art;
- final audio;
- six full miracle families;
- golem economy;
- village allegiance;
- rival gods;
- save/load;
- multi-island progression;
- campaign structure;
- production-grade architecture refactor.

Do not use future breadth as an excuse to avoid the immediate interaction proof.

---

# 17. Last known working state

The last recovered implementation state with substantial evidence is:

```text
branch: spike/godot-hand-feel-2026-07-02
HEAD:   d6f66b705c0be43be791585b2b6953450ecbd9c1
focus:  final grip-contact / grasp-not-storage repair
```

Recorded evidence establishes:

- project/source exists;
- objective Godot tests passed at their recorded runs;
- the main Godot scene executed headlessly;
- camera/grab/drop/throw/focus/gesture/shrine/temple contracts existed;
- the branch underwent repeated live-finding repair cycles.

What the evidence does **not** establish:

- final human PASS;
- production-platform acceptance;
- production miracle grammar;
- touch compatibility.

The correct phrase is:

> **Structurally runnable and heavily contract-tested Godot hand-feel spike; production foundation still awaiting explicit human acceptance.**

---

# 18. Recommended restart sequence

## Phase 1 — Final Godot hand-feel/platform gate

**Goal:** Decide whether the existing Godot spike is a viable production foundation.

### Do

- verify exact repo/branch/HEAD;
- verify clean or understood worktree state;
- run existing verifier;
- run actual rendered spike;
- perform human checklist;
- record explicit verdict: **PASS / PARTIAL / FAIL**.

### Do not

- expand scope;
- redesign miracles;
- add touch;
- refactor;
- commit/merge unless separately authorized.

### Pass condition

Andrew explicitly confirms that the hand/camera/grab/throw/gesture experience is strong enough to continue in Godot.

## Phase 2 — Miracle authority propagation + first production Fire ritual

Only after Phase 1 passes or a bounded interaction repair passes.

**Goal:** Replace placeholder miracle semantics with the July 3 production ritual grammar.

Required preparation:

- make the July 3 miracle addendum available as a governing project/repo source;
- resolve exact Fire family symbol;
- define shared miracle state machine and worship reserve/refund ownership.

Then implement only:

- either-direction universal spiral;
- Fire family symbol;
- held Fireball;
- aim/throw;
- world consequence;
- safe shake dissolve/refund.

## Phase 3 — Fire/Water interaction vertical slice

Add:

- Fire Tier II Divine Napalm;
- pour/smear handling;
- Burning and Scorched terrain;
- Rain Cloud Tier I;
- Wet terrain;
- Rain extinguishing Fire;
- villagers flee Fire and calm afterward.

Stop again and validate before adding Lightning, Force, or breadth.

---

# 19. Final Godot hand-feel gate checklist

Use this exact subjective gate unless superseded by a newer explicit test plan.

1. Does the hand feel like **your body**, not a cursor?
2. Does camera movement support the hand instead of fighting it?
3. Is grabbing consistent?
4. Can you deliberately set objects down gently?
5. Can you deliberately throw objects with predictable strength/direction?
6. Does the rock read as gripped from the top/side?
7. Does the villager dangle visibly rather than disappear into the palm?
8. Does the offering remain readable/upright?
9. Does the tree read as trunk-gripped?
10. Does gesture drawing feel physical/sacred enough to build the production miracle system on?
11. Are shrine and temple interactions understandable without relying on F3?
12. Does F3 explain grip contacts only when enabled?
13. Is the temple free of unexplained stray-circle artifacts?
14. Subtracting placeholder ugliness, is there enough actual **godhood** to continue Parable in Godot?

Verdict meanings:

- **PASS:** Godot becomes the current production foundation; move to miracle authority/Fire slice.
- **PARTIAL:** Godot is viable, but one bounded interaction defect requires repair before feature expansion.
- **FAIL:** Do not expand the Godot version. Determine whether failure is implementation-specific or platform/review-loop friction before choosing another engine.

---

# 20. Immediate next Codex task contract

This is the next coding-agent task unless a newer human verdict already exists.

```text
PARABLE FINAL GODOT HAND-FEEL / PLATFORM GATE

Repository: /Users/andrew/Parable
Expected branch: spike/godot-hand-feel-2026-07-02
Expected HEAD: d6f66b705c0be43be791585b2b6953450ecbd9c1

Objective:
Validate the existing final Godot hand-feel spike and prepare it for Andrew's human PASS/PARTIAL/FAIL verdict. Do not expand the game.

Read first:
1. godot-spike/NEXT_PLAYTEST_PACKET.md
2. godot-spike/README_FOR_ANDREW.md
3. godot-spike/PATCH_11_REPORT.md
4. docs/PARABLE_GODOT_HAND_FEEL_SPIKE_PLAN_FOR_APPROVAL_2026-07-02.md
5. godot-spike/tests/verify_playability_surrogates.gd
6. godot-spike/scripts/hand_input.gd
7. godot-spike/scripts/camera_rig.gd
8. godot-spike/scripts/grabbable.gd
9. godot-spike/scripts/hand_visual.gd

Protected behavior:
- right mouse = grab/carry/release
- left empty-space drag = pan
- left click = interaction
- middle mouse = orbit
- scroll = zoom
- Escape = safe cancel/release
- object-specific grip behavior remains intact
- held objects read as gripped, not stored
- normal world remains free of conventional persistent HUD
- F3 remains dev-only

Non-goals:
- no miracle redesign
- no Fireball production implementation
- no bidirectional spiral migration yet
- no new Fire glyph
- no touch
- no golems
- no rival system
- no broad refactor
- no dependency/version changes
- no merge/commit/push

Validation order:
1. verify branch/HEAD/status
2. run godot-spike/verify.sh
3. run godot-spike/run.sh --dry-run
4. launch actual rendered spike if environment permits
5. Andrew performs the human hand-feel checklist

Primary pass is validation-only.
If an objective reproducible blocker exists, allow one minimal implementation pass and one bounded repair pass only.

Completion report:
- starting branch/HEAD/status
- commands actually run and results
- whether rendered GUI was actually observed
- files changed, if any
- Andrew's verdict only if Andrew actually supplied it
- earliest unresolved issue or missing proof

Stop after the gate. Do not begin the next feature.
```

---

# 21. After a PASS: production miracle handoff requirements

Do not send Codex directly from the old Godot placeholder ritual to full miracle implementation.

First freeze these production requirements:

- either spiral direction charges divine state;
- family-specific symbol identifies Fire;
- Fireball appears physically held;
- Fireball is thrown, not auto-fired on symbol recognition;
- held miracle can be shaken away safely;
- worship reserve/refund logic is centralized;
- Fire produces Burning and later Scorched world state;
- villagers flee active Fire;
- Rain can suppress/extinguish Fire;
- bad recognition must not cause accidental catastrophe;
- exact Fire symbol is explicitly resolved rather than invented.

Then build the smallest coherent Fire slice.

---

# 22. Open questions that remain legitimately unresolved

Do not pretend these were already decided:

1. Exact symbol shape for Fire.
2. Exact symbol shapes for the other five core families.
3. Final family-symbol recognizer approach.
4. Water Tier III: Hurricane vs Freeze vs another later decision.
5. Final Force Tier III if Vortex changes.
6. Maximum safe held-miracle duration.
7. Whether Tier III has gameplay risk while held or only warning presentation.
8. Worship costs/reserve values.
9. Long-term villager memory/trauma/blessing depth.
10. Final post-PASS branch strategy: merge into `main`, create a production Godot branch, or preserve `main` as historical web branch.
11. When touch parity should re-enter the roadmap.

These are real design questions. They are not blockers for the current hand-feel gate.

---

# 23. Evidence discipline for future work

Use these proof labels:

- **VERIFIED:** directly inspected source or directly observed runtime/test evidence proves the claim.
- **IMPLEMENTED-UNVERIFIED:** source exists but the relevant real user path has not been proven.
- **HISTORICALLY OBSERVED:** a prior report contains executed output, but the current runtime has not been re-run now.
- **CLAIMED:** documentation/agent report states it, without sufficient direct proof.
- **UNKNOWN:** decisive evidence is missing.
- **SUPERSEDED:** later accepted design or direct instruction replaced it.

Never promote:

- source-code presence into subjective feel;
- a headless run into rendered visual proof;
- an agent completion claim into human acceptance;
- a historical prompt into current requirements without authority checking.

---

# 24. Project continuity maintenance rule

To avoid losing the path again:

After every meaningful Parable milestone, update this source with a dated **Continuity Update** containing:

- branch/commit;
- what actually changed;
- what was actually validated;
- what remains unverified;
- new decisions;
- superseded rules;
- new blockers;
- exact next milestone.

Do not rewrite history to make it look cleaner.

If a later decision changes the project, add:

```text
SUPERSEDES: <old rule or section>
NEW RULE: <new rule>
EVIDENCE: <user decision, file, commit, runtime proof>
DATE: <date>
```

A future session should be able to resume from this file plus the repository without needing hidden chat memory.

---

# 25. Recovery baseline summary

```text
PROJECT: Parable

CURRENT PRODUCT IDENTITY:
Hand-first living-island god game.
Player = Divine Hand + chosen symbol.
Minimal world HUD.
Temple holds major UI.
Villagers are witnesses.
Golems are optional non-miracle macros.

HISTORICAL IMPLEMENTATION:
main @ 6c96ce7dd08e2a064dfe77ae59016bcc7d139e66
Static Three.js/browser prototype.
Useful evidence, not current architecture authority.

CURRENT IMPLEMENTATION FRONTIER:
spike/godot-hand-feel-2026-07-02
@ d6f66b705c0be43be791585b2b6953450ecbd9c1
Godot Divine Hand/camera/grab/throw/gesture/shrine/temple spike.
Automated contracts historically passed.
Final human platform verdict not durably recovered.

CURRENT MIRACLE AUTHORITY:
PARABLE_MIRACLE_SYSTEM_ADDENDUM_2026-07-03.md
Six miracle families.
Either-direction universal spiral.
Family symbol.
Physically held miracle.
Spiral upgrades.
Shake dissolve/refund.
Terrain memory + villager witness + combos.

IMMEDIATE NEXT ACTION:
Final rendered Godot hand-feel/platform gate.

DO NOT DO NEXT:
Do not build full miracle system.
Do not merge branches.
Do not invent Fire glyph.
Do not add golems/touch/rival systems.
Do not revive old ten-button spellbook/HUD.

AFTER GODOT PASS:
Propagate July 3 miracle authority, resolve Fire symbol, then build the Fire/Water vertical slice.
```

---

# 26. Continuity updates

## 2026-08-18 — Recovery source initialized

- Reconciled Parable Project sources, prior recovery findings, and `westkitty/Parable` repository evidence.
- Established the Godot spike as the latest implementation frontier rather than `main`.
- Kept Godot platform acceptance explicitly unverified pending human feel evidence.
- Promoted the July 3 miracle addendum as the newest miracle-specific design authority found.
- Marked the old ten-miracle/single-HTML/HUD-centered design as historical/superseded.
- Locked the immediate next milestone to the final Godot hand-feel/platform gate.
- Locked the post-PASS next feature direction to the July 3 Fire/Water miracle vertical slice, not the historical zigzag Fireball ritual.


## 2026-08-21 — M1 implemented (agent-validated, human acceptance pending)

**Branch / commits**

- Branch: `spike/godot-hand-feel-2026-07-02` (pushed to `origin`, not merged to `main`).
- `04b2f2c` — checkpoint preserving the human-verified current-frame targeting repair.
- `c5bc674` — M1 implementation, "hands on the world".

**Targeting behaviour preserved**

Andrew's 2026-08-21 rendered playtest verified first-attempt pickup, rapid
A → B acquisition, and throwing. All three are preserved and now carry
surrogate coverage. Throw physics were deliberately not touched: the throw
sampler still reads the unsmoothed hand target.

**Agent-verified M1 behaviour**

- LMB pressed inside a grabbable's hover halo arms a pan instead of dying.
  Hover decides only what RMB would grab.
- A press begun on a clickable target promotes to a pan past the drag
  threshold; releasing under the threshold still delivers the click.
- Any live press blocks miracle stroke tracking, so panning cannot seed or
  finish a gesture.
- Hovering makes the hand ease onto the object's own grip contact, so
  hover → reach → grip is a visible movement.
- Targeting reads from a separate pick pose, never from the eased reach
  pose, so reaching cannot feed back into what is targeted.
- Grip sockets biased downward instead of forward; the palm no longer
  renders under the object it is gripping.
- Tree gripped low on the trunk instead of mid-trunk, which had buried the
  entire hand inside the canopy.

**Validation performed**

- 317 playability surrogate checks, `verify_headless`, `verify_contracts`
  and `verify.sh`: all pass.
- New surrogates were confirmed to FAIL against the previous grip geometry
  and the previous hover gate, so they are not vacuous.
- Rendered offscreen QA: `godot-spike/tests/qa_tour_m1.gd` drives the real
  hand update seam in a rendered window and saves PNGs of hover, reach,
  acquisition, all four held classes, and camera state before/after a pan
  begun on top of a rock. Frames were inspected, not inferred. The tree
  canopy defect was found this way and by nothing else.

**Human acceptance: PENDING.** Andrew has not yet played the M1 build. M1 is
not complete until he does.

**Known deferred failures (M2+, deliberately untouched)**

- Altar / shrine offering progression.
- Temple functionality (`SYMBOL` / `GLYPHS` hotspots unreachable from the
  player camera; missing ceiling; exit ring renders vertical).
- Explicit villager water outcome — no drowning system exists; a villager
  thrown out to sea is currently left alive, frozen and submerged.
- Production miracle system.
- Hand scale at default camera distance, and default camera framing. Not in
  the M1 acceptance criteria; recorded as an observation, not a regression.

**Next milestone: M2 — The Offering.**

**Missing authority (before M4):** `PARABLE_MIRACLE_SYSTEM_ADDENDUM_2026-07-03.md`
is still absent from this repository. It was not reconstructed or invented
during M1. Either copy it in or formally declare section 10 of this document
the sole miracle authority before M4 begins.

**New process rule (supersedes prior practice)**

> Parable advances through coherent playable milestones. Related defects are
> repaired as milestone clusters. Automated and rendered QA precede one
> concise Andrew acceptance playtest per milestone.

This supersedes the previous practice of treating every isolated interaction
defect as a complete project-wide blocker, and supersedes section 18's
Phase 1 standalone hand-feel gate, section 19's gate checklist, and section
20's next-task contract as the controlling sequencing rules.


## 2026-09-17 — Godhood quality machinery added

**Live repository observation before this documentation pass**

- Branch: `spike/godot-hand-feel-2026-07-02`
- HEAD: `9336c68` — `docs: track recovery source and record M1 continuity update`
- Worktree: clean before the new documentation files were written.

**New controlling/supporting documents**

- `docs/PARABLE_GODHOOD_CONTRACT_2026-09-17.md`
  - compiles protected godhood behavior into stable invariant IDs and proof obligations;
  - distinguishes human, agent, implemented-unverified, pending, and superseded evidence;
  - requires impact-radius validation instead of project-wide ritual rechecking.

- `docs/PARABLE_GODHOOD_GAUNTLET_2026-09-17.md`
  - defines a reusable human acceptance journey;
  - M1 uses only the Hand-on-the-World subset;
  - later milestones extend the same action/checkpoint/expectation-gap grammar;
  - does **not** reinstate the superseded standalone project-wide hand-feel gate.

- `docs/PARABLE_DIVINE_GRACE_REPAIR_GATE_2026-09-17.md`
  - authorizes invisible intention assistance only after a recorded PARTIAL/FAIL checkpoint;
  - permits one bounded repair at a time;
  - forbids using assistance to hide broken mappings, progression bugs, placeholder semantics, or engine-level performance failures.

- `docs/PARABLE_POST_PASS_FIRE_WATER_HANDOFF_2026-09-17.md`
  - preserves the correct later production miracle direction without starting it early;
  - keeps the exact Fire family symbol unresolved;
  - requires the July 3 miracle authority to be placed in-repo or explicitly replaced before implementation.

- `OPERATIONAL_STATE.md`
  - initialized as the current resumable control plane;
  - records M1 as agent-validated / human acceptance pending;
  - keeps M2 "The Offering" as the next implementation milestone after M1 acceptance.

**Sequencing preserved**

The 2026-08-21 milestone rule remains controlling. This update improves how milestones are accepted and protected; it does not replace the milestone sequence.

**Immediate next action**

Andrew runs the M1 subset of the Godhood Gauntlet and supplies PASS / PARTIAL / FAIL.

**No gameplay code changed in this documentation pass.**


## 2026-09-17 — Fresh verifier exposed Godot 4.7.1 surrogate incompatibility

A fresh verification run on the live MacBook environment found:
- Godot: `4.7.1.stable.official.a13da4feb`
- headless import: PASS
- headless smoke: PASS
- contract verification: PASS
- playability surrogate suite: FAIL (29 failures on initial run)

Repository comparison established that the M1 surrogate file is byte-identical to `c5bc674`, and no relevant Godot-spike gameplay changes exist between `c5bc674` and current HEAD `9336c68`.

The earliest failure chain is concentrated in synthetic mouse edge handling used by the headless playability surrogate. Historical reports recorded green runs on Godot `4.7.stable.official.5b4e0cb0f`; the machine now runs Godot `4.7.1`. Upstream Godot 4.7 has documented regressions involving `Input.parse_input_event` button handling.

One bounded harness adaptation was tested, failed to restore the suite, and was reverted. No gameplay-code repair was accepted.

**Current state:**
- M1 implementation remains the current baseline.
- M1 human acceptance remains pending.
- The playability surrogate evidence is now marked **EVIDENCE-STALE on Godot 4.7.1** until the harness is compatibly repaired or an equivalent proof path is established.
- Do not advance to M2 on the strength of stale automated evidence.
- Do not alter hand/camera gameplay merely to appease the suspect harness.
