# Parable Hand-Feel Spike — Andrew's Runbook

You don't need to know anything about Godot. Your whole job:
run it, move the mouse, and tell us whether you felt like a god.

If you want the shortest awake-session checklist, read
`/Users/andrew/Parable/godot-spike/NEXT_PLAYTEST_PACKET.md` first.

---

## 1. The one command

```bash
cd /Users/andrew/Parable/godot-spike && ./run.sh
```

A game window opens directly — no editor, no import dialogs.
**Quit with Cmd-Q.**

If it complains Godot is missing, it will print the one install command
(`brew install --cask godot`). Install, then run `./run.sh` again.

If anything else goes wrong, run `./verify.sh` and send back what it prints.
If the game launches but an interaction chain breaks, press `F3` and report:
hovered object, held object, right-mouse state, last release mode, miracle armed,
armed timer, last glyph result, shrine awake, offering distance, and temple chamber.
Use this three-line format so the failure is actionable:
`1. I tried: ...`
`2. I expected: ...`
`3. I saw instead: ...`

---

## 2. Fallback: opening it by hand (zero Godot knowledge assumed)

Only needed if `./run.sh` won't work:

1. Open the **Godot** app (it's in your Applications folder; blue robot icon).
2. A window titled **"Godot — Project Manager"** appears, listing projects.
3. Click the **Import** button (top of the window).
4. In the file picker, navigate to `/Users/andrew/Parable/godot-spike`
   and choose the file **`project.godot`**. Click **Open**.
5. Click **Import & Edit**. A big complicated editor opens.
   **Ignore everything in it.** You will not touch any of it.
6. Find the **▶ (play) button in the top-right corner** of the editor.
   Click it. *(Keyboard shortcut: Cmd+B or F5, depending on setup.)*
7. The game window opens. That's the spike. Quit the game with Cmd-Q;
   quit the editor with Cmd-Q too. You never need to save anything.

---

## 3. What you should see

- A small green island in a blue sea, under a morning sky.
- A **village**: a few brown huts, a standing stone, and little
  red-brown **villagers** wandering around.
- Grey **rocks** scattered about, a few **trees**, and two small
  glowing teal **totems** (shrine offerings) west of the village.
- A stone **shrine** on the west side with a dim zigzag carving on it.
- A stone **temple** to the south-east with a dark, faintly glowing doorway.
- A **floating hand** that follows your mouse. That hand is you.

No health bars, no menus, no buttons. That's on purpose.

---

## 4. What to try, in order

The controls (this is everything):

| Input | What it does |
|---|---|
| Move mouse | The hand follows, riding the terrain |
| **Right mouse button on an object** | Grab it. Keep holding to carry it |
| Release right mouse while moving fast | **Throw** (momentum matters) |
| Release right mouse while still | Set down gently |
| **Left mouse button on the ground + drag** | Grip the world and pan it |
| **Left mouse button click** | Interact with the temple doorway, shrine choices, ritual symbols |
| **Middle mouse button + drag** | Orbit the camera |
| **Option/Alt + left drag** | Orbit fallback if middle mouse is unreliable on this Mac |
| **Scroll wheel** | Zoom in/out |
| **Draw a clockwise spiral with the hand** | Arms miracle-casting mode |
| **After the spiral, draw a circle or zigzag** | Cast the learned miracle |
| **Hold Space** | Optional debug/fallback trace mode only |
| **Esc** | Safe release — gently drops anything, cancels any gesture |
| **F3** | Ugly developer numbers overlay (not part of the game) |

Now the actual test, step by step:

1. **Just move the mouse** for ten seconds. Does the hand feel like a
   body, or like a cursor?
2. **Pan** by dragging the ground. **Orbit** with the middle mouse button.
   **Zoom** with the wheel. Try keeping the hand near a villager while
   orbiting around them.
3. **Pick up a rock with the right button.** Carry it around. Set it down gently. Then pick
   it up and *fling* it. Watch the arc. Try to hit a spot on purpose.
4. **Pick up a tree** (it uproots). Feel how much heavier it throws.
5. **Pick up a villager.** Feel the squirm. Set them down *gently* —
   watch the little bow. Then (if your conscience allows) throw one,
   and watch how the others react. If they panic and scatter and you
   feel a pang of guilt — write that down, it's important data.
6. **Draw a deliberate clockwise spiral**, then **draw a circle** over
   the village. That's your one starter miracle (a blessing — light
   and falling motes; villagers should gather and pray).
7. After the blessing, **wait a few seconds**. A villager will walk up
   and ask **"Who are you?"** — three glowing symbols appear.
   **Click one with your hand.** Watch what happens at the standing stone.
8. **Carry a teal totem to the shrine** (west) and set it down *gently*
   at the altar slab. The zigzag carving should ignite and pulse.
9. Stand near the shrine, **draw a clockwise spiral**, then trace a vertical zigzag
   (down-left, down-right, down-left...). The glyph flares — you have
   *learned* your second miracle.
10. Move anywhere, spiral-arm again, and **draw the zigzag again**: a bolt.
    Villagers scatter. It leaves a scorch. That mark stays.
11. **Click the temple doorway** (empty-handed). The camera flies in,
    fades, and you're floating in your temple. Click **left** (symbol
    alcove) and **right** (glyph alcove); click anywhere to come back
    to center; click the **glowing door** to return to the world.

---

## 5. Broken / placeholder BY DESIGN — do not report these

- Everything is ugly proxy shapes. Art is not the test.
- Only two miracles exist, both placeholder effects.
- The shrine "ritual" is just: place totem gently, trace glyph.
- Villagers are simple. No jobs, no needs, no dialogue beyond one question.
- The temple has only two alcoves and a door. No save, no options.
- There is no sound.
- No golems, no rival god, no opening cinematic — later, deliberately.

The **only** question this build asks: *does the hand feel like godhood?*

---

## 6. How to report — the review checklist

Play 15–20 minutes, then answer each with **Yes / Almost / No** plus a
note for anything that isn't a Yes:

1. Does the hand feel like *your body* — "I'll pick that up," not "I'll click that"?
2. Does the camera support the hand? Could you orbit/zoom around a target while keeping the hand near it, without thinking about controls?
3. Is grabbing consistent? Did anything you expected to grab refuse, or feel random?
4. Does release velocity feel like throwing? Could you lob short, hurl far, predict landings, and set things down gently on purpose?
5. Can you tell villager / rock / tree / offering apart by *feel alone* (weight, lag, reaction)?
6. Does gesture drawing feel sacred and physical — a mark on a living world, not a doodle on a dashboard?
7. Does temple entry feel ceremonial — entering a sacred interface, not opening a menu?
8. Does the symbol feel like identity? Did seeing it painted on the stone mean something?
9. Does the whole scene feel like godhood — present *in* the world, not commanding it remotely like an RTS?
10. Does Godot feel worth continuing (subtract the ugly placeholders — any engine-level friction in launch, smoothness, input latency)?
11. Bonus: did you replay any action just because it felt good? Which one? Did anything make you feel guilty?

**For every failure, write three things:** what you did, what happened,
and what your hand *expected* to happen. That expectation gap is exactly
what gets tuned next.
