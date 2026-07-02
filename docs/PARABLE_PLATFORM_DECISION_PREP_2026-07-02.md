# Parable Platform Decision Prep - 2026-07-02

## Decision

Required conclusion: **Greenfield browser prototype**.

This does not mean "keep the current Three.js app." It means the fastest next proof should be a tiny browser-native hand-feel spike, likely using Three.js only if it accelerates the proof instead of dragging along the old prototype. The current implementation should be mined for evidence and small reusable pieces, not preserved as architecture.

## Current Three.js Viability

Three.js remains viable for the first serious browser hand-feel proof because it provides:

- immediate browser deployability;
- raycasting;
- mesh rendering;
- simple procedural scene setup;
- fast iteration by Codex/Fable-style agents;
- easy sharing for human feel review.

But the current Three.js structure is not a good control-feel foundation. It is a static shell with persistent HUD panels and a chunked monolithic runtime. The core interaction is gesture drawing over terrain, not a divine hand body manipulating objects.

Evidence:
- The July 2 plan says the current prototype is evidence, not sacred architecture: `origin/main:docs/PARABLE_PROJECT_DESIGN_AND_PLAN_2026-07-02.md:36-63`.
- The plan explicitly says the prototype has not proven hand control, invariant grabbing, throwing, temple-only UI, shrine discovery, or birth-of-god opening: `origin/main:docs/PARABLE_PROJECT_DESIGN_AND_PLAN_2026-07-02.md:56-63`.
- The current app shell exposes persistent HUD/status/spellbook/event controls in normal world view: `origin/main:index.html:10-80`.
- Pointer input is currently used for gesture traces and raycasting to a ground plane, not object grabbing: `origin/main:src/runtime/main.part05.js.txt:110-132`, `origin/main:src/runtime/main.part06.js.txt:1-39`.

## Risks Of Staying With Three.js

- The current repo may bias future work toward the old HUD/gesture prototype.
- Three.js gives primitives, not a game framework. Physics, grabbing rules, object affordances, camera grammar, and tooling must be built or selected.
- The existing chunked runtime increases architectural friction.
- Without strict scope, a browser prototype can drift into flat UI panels and data displays.
- WebGL/browser input can be excellent, but only after deliberate tuning and human review.

## Benefits Of Staying With Three.js

- Fastest path to a shareable browser proof.
- No engine install or desktop export pipeline.
- Direct control over raycasting, cursor/hand visuals, and custom interaction rules.
- Existing prototype assets/simulation can be referenced or selectively copied.
- Static deploy path remains simple.
- Human reviewers can open a link instead of installing an engine build.

## Risks Of Leaving Three.js

- Godot/Unity/Unreal introduce editor workflows, export pipelines, project files, and agent coordination overhead.
- Browser distribution becomes less direct, especially for 3D web export.
- Engine gravity can encourage conventional game architecture before the hand-feel question is answered.
- Rebuilding basic island/gesture/world evidence may burn time without proving the central control grammar faster.

## Benefits Of Leaving Three.js

- Godot or Unity could provide stronger built-in scene organization, physics, collision, input actions, editor inspection, and asset pipeline.
- A desktop engine may make 3D hand/object experiments easier once the hand feel target is precise.
- If real object physics and manipulation dominate the prototype, a game engine may become cheaper than custom browser work.

## Candidate Ranking

### 1. Greenfield browser hand-feel prototype

Why it may fit:
- Fastest shareable human review loop.
- Keeps the browser-playable promise alive.
- Can ignore the old HUD and runtime chunking.
- Can test only the real question: camera, hand, grab, carry, throw, gesture, shrine/temple stub.

Why it may fail:
- If custom physics/object manipulation becomes complex, hand feel may be expensive to tune from primitives.
- Three.js alone does not provide high-level game input/physics abstractions.

Must test before commitment:
- Hand follows cursor/world ray convincingly.
- Object hover/grab/hold/release rules are stable.
- Release velocity creates readable throws.
- Camera pan/orbit/zoom does not fight hand manipulation.
- Gesture drawing can coexist with grabbing without mode confusion.
- Human reviewer says the hand feels like the player's body, not a cursor.

### 2. Godot hand-feel spike first

Why it may fit:
- Strong editor and scene workflow.
- Built-in physics/collision/input actions.
- Good for rapid tactile experiments if desktop build is acceptable.

Why it may fail:
- Adds engine setup and export friction before the browser/shareability question is settled.
- Godot web 3D export may become a side quest.
- Does not automatically solve Black & White-like hand grammar.

Must test before commitment:
- Mouse-first divine hand control.
- Grab/carry/throw with stable feel.
- Camera and world scale.
- Export/review path for Andrew.

### 3. Heavily restructure current Three.js repo

Why it may fit:
- Preserves existing island, gesture miracles, villagers, rival pressure, and verification script.
- Could become efficient if Fable specifies a clean module split and control architecture.

Why it may fail:
- The old interface and runtime organization are pointed at the wrong proof.
- Refactoring before proving hand feel risks polishing the wrong thing.
- The sparse local checkout conflict must be resolved first.

Must test before commitment:
- Whether the runtime can be split without losing behavior.
- Whether old systems can be isolated from the HUD.
- Whether adding hand/grab/throw into the current model is less work than a focused spike.

### 4. Babylon.js / PlayCanvas / other browser 3D engine

Why it may fit:
- Babylon.js provides more engine-like browser tooling than raw Three.js.
- Could improve inspector, scene organization, cameras, and collisions.

Why it may fail:
- Switching browser engines before defining the hand-feel contract may be churn.
- Existing Three.js evidence becomes less reusable.

Must test before commitment:
- Same hand/camera/grab/throw proof as the greenfield browser spike.
- Whether the engine reduces interaction complexity enough to justify migration.

### 5. Keep current Three.js structure

Why it may fit:
- It already exists.
- It already has world visuals, gesture miracles, and a verifier.

Why it may fail:
- It fails the central doctrine gaps.
- Persistent HUD fights the temple/UI law.
- Chunked runtime is difficult to evolve.
- No divine hand, grabbing, throwing, symbol, temple, or learning loop.

Must test before commitment:
- There is no honest direct commitment test. It should not be the next route except as evidence mining.

### 6. Unity / Unreal

Why they may fit:
- Powerful tools for 3D scenes, physics, input, camera, animation, and production.

Why they may fail:
- Too heavy for the first proof.
- Higher setup/export/review cost.
- Increased risk of architectural waste before the hand grammar is known.

Must test before commitment:
- Only worth testing after a smaller spike proves browser/Godot routes inadequate.

## Are We Clinging To Three.js Because It Is Already There?

If the next pass keeps the current app structure, yes. That would be clinging to Three.js because it is already there.

If the next pass uses a tiny greenfield browser spike, then no. Three.js becomes merely one candidate renderer for proving mouse-first divine hand feel. The distinction matters. Current Three.js code is not the best route; a browser-native hand-feel proof may still be the best route.

## Recommended First Technical Spike

Build a tiny greenfield browser hand-feel spike, separate from the old runtime:

- one island plane or simple sculpted mound;
- one visible divine hand body that follows the cursor through world raycasting;
- three object classes: villager proxy, rock/tree proxy, shrine object;
- consistent hover/grab/hold/carry/release;
- release velocity and momentum throw;
- camera pan/orbit/zoom tuned for mouse-first play;
- gesture mode test that does not break grabbing;
- one shrine/temple stub to prove world UI separation;
- no persistent stat HUD;
- human review checklist for hand, camera, grab, throw, miracle, and godhood feel.

## Recommendation For Andrew

Do not salvage the current prototype as the next foundation. It proves that a browser/Three.js island ritual toy can exist; it does not prove Parable. The least wasteful next move is a greenfield browser hand-feel spike that deliberately ignores the old dashboard shell and tests the divine hand as the player's body. If that spike cannot make grabbing, throwing, camera, and gesture coexist quickly, then run a Godot hand-feel spike with the same test checklist. Three.js is still allowed in the room. It does not get to sit at the head of the table just because it arrived first.

