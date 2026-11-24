import * as THREE from "three";
import { CAM_MAX_DIST, HAND_CARRY_HEIGHT, HAND_HOVER_HEIGHT, HAND_HOVER_PICK_RADIUS, MIRACLE_COST, RITUAL_ARM_MS, SIM_DT, SIM_HZ, STUDY_MURAL_S, DAY_S } from "./config";
import { DebugOverlay, FrameStats } from "./debug/overlay";
import { Hand } from "./hand/hand";
import { Controller, type GameApi, type Grabbable } from "./input/controller";
import type { GestureResult } from "./input/gesture";
import { buildWalkable, makePathFinder } from "./nav/grid";
import { readSave, writeSave } from "./persist/storage";
import { LOG_HALF_LENGTH, LOG_RADIUS, Physics } from "./physics/physics";
import { ItemViews, FireView, SettlerViews } from "./render/actors";
import { MiracleViews } from "./render/miracles";
import { VillageView } from "./render/village";
import { buildBuildings } from "./render/buildings";
import { CameraRig, DEFAULT_CAMERA } from "./render/camera";
import { buildEnvironment, followSun, type Water } from "./render/environment";
import { Particles } from "./render/particles";
import { TerrainView } from "./render/terrain";
import { Vegetation, windUniform } from "./render/vegetation";
import { burningCount, createFireGrid, igniteAt, scorchedCount } from "./sim/fire";
import { computeOutcome } from "./sim/economy";
import { beliefSummary, villageBelief } from "./sim/belief";
import { deserialize, hashWorld, serialize } from "./sim/save";
import { trees } from "./sim/scenery";
import { describeAll, describeDetail, describeSettler, grabSettler, releaseSettler } from "./sim/settler";
import { canAfford, castRain, castSanctuary, dissolveFireball, fireballImpact, learn, spend, stepWorld } from "./sim/step";
import { LAYOUT, terrainHeight } from "./sim/terrain";
import type { Item, Settler, World } from "./sim/types";
import { addItem, createWorld, getItem, getSettler } from "./sim/world";
import { TempleChamber, type TabletAction, type TempleRecord } from "./temple/temple";

const params = new URLSearchParams(location.search);
const TEST = params.get("test") === "1";
const SEED = Number(params.get("seed") ?? 7) || 7;
// ?scenario=solo is the M1 sandbox (Ilse alone, free Fireball); the default is the M2-M4 village and its Dry Year.
const SCENARIO = params.get("scenario") === "solo" ? "solo" : "village";
const RECORDS_KEY = "parable.records.v1";
const DAY_TICKS = DAY_S * SIM_HZ;

type TempleMode = "world" | "flying" | "fading-in" | "chamber" | "fading-out";

async function boot(): Promise<void> {
  const canvas = document.getElementById("c") as HTMLCanvasElement;
  const fade = document.getElementById("fade") as HTMLDivElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  // ?lowres=1 renders at half resolution: used only by the headless software-GPU test runs to keep them fast.
  const LOWRES = params.get("lowres") === "1";
  renderer.setPixelRatio(LOWRES ? 0.5 : Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const rig = new CameraRig(window.innerWidth / window.innerHeight);
  const { sun, water } = buildEnvironment(scene, renderer) as { sun: THREE.DirectionalLight; water: Water };
  const terrain = new TerrainView();
  scene.add(terrain.mesh);

  const flames = new Particles(1800, THREE.AdditiveBlending, 0.12);
  const smoke = new Particles(900, THREE.NormalBlending, 0.25);
  const trace = new Particles(1400, THREE.AdditiveBlending, 0.05);
  scene.add(smoke.points, flames.points, trace.points);

  const [physics, vegetation, buildings, itemViews] = await Promise.all([
    Physics.create(),
    (async () => {
      const v = new Vegetation();
      await v.build();
      return v;
    })(),
    buildBuildings(),
    (async () => {
      const v = new ItemViews(flames);
      await v.init();
      return v;
    })(),
  ]);
  scene.add(vegetation.group, buildings.group, itemViews.group);
  const villageView = new VillageView();
  const miracles = new MiracleViews(scene);
  const settlerViews = new SettlerViews();
  scene.add(villageView.group, settlerViews.group);
  const fireView = new FireView(flames, smoke, scene);
  const chamber = new TempleChamber();
  await chamber.init();

  const hand = new Hand();
  scene.add(hand.group);
  // Soft ring on the ground under the hand: where it will touch.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.72, 0.95, 40),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff1c9"), transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.renderOrder = 2;
  scene.add(ring);

  const findPath = makePathFinder(buildWalkable());
  let world: World = createWorld(SEED, SCENARIO);
  await settlerViews.sync(world);
  await villageView.init(world);
  let baseFuel = createFireGrid(world.scenario === "village").fuel;
  const showVillage = () => {
    villageView.group.visible = world.scenario === "village";
    // The M1 cottage stays in both scenarios (it is house 0 of the village).
  };
  showVillage();

  let held: Grabbable | null = null;
  let settlerAi = true; // test hook can pause Ilse to isolate hand-control checks
  let lastReleasePoint: [number, number, number] | null = null;
  let templeMode: TempleMode = "world";
  let simAcc = 0;
  let hoverSettlerTime = 0;
  let lastGesture: GestureResult | null = null;
  let lastSimMs = 0;
  const frameStats = new FrameStats();
  const overlay = new DebugOverlay();
  const handTarget = new THREE.Vector3(0, 3, 0);
  const lastGround = new THREE.Vector3(DEFAULT_CAMERA.tx, 1, DEFAULT_CAMERA.tz);
  const log: string[] = [];
  const note = (s: string) => {
    log.push(`${world.tick}: ${s}`);
    if (log.length > 240) log.shift();
  };

  /** The settler the hand is over / holding; Ilse (the first settler) for the M1 hooks. */
  const settler = () => world.settlers[0];
  const settlerOf = (id: number): Settler | undefined => getSettler(world, id);
  const pickableSettler = (s: Settler) => s.alive && s.state !== "airborne" && s.state !== "dead";
  let heldCloud: number | null = null;
  let studyTime = 0;
  let endShown = false;
  const endCard = document.createElement("div");
  endCard.id = "endcard";
  endCard.style.display = "none";
  document.body.appendChild(endCard);
  const pickRadius = () => Math.max(HAND_HOVER_PICK_RADIUS, rig.dist * 0.03);
  const raycaster = new THREE.Raycaster();

  const game: GameApi = {
    rig,
    pick(ground, ray) {
      if (held) return null;
      raycaster.ray.copy(ray);
      raycaster.far = 400;
      // Exact hits on meshes win.
      const hits = raycaster.intersectObjects([settlerViews.group, ...itemViews.pickables()], true);
      for (const h of hits) {
        let o: THREE.Object3D | null = h.object;
        while (o) {
          if (o.userData.settlerId != null) {
            const s = settlerOf(o.userData.settlerId as number);
            if (s && pickableSettler(s)) return { kind: "settler", id: s.id };
            break;
          }
          if (o.userData.itemId != null) {
            const it = getItem(world, o.userData.itemId as number);
            if (it && (it.kind === "log" || it.kind === "bellstone") && (it.state === "loose" || it.state === "carried")) return { kind: "item", id: it.id };
            break;
          }
          o = o.parent;
        }
      }
      if (!ground) return null;
      // Otherwise: nearest grabbable to the hand's touch point.
      let best: Grabbable | null = null;
      let bestD = pickRadius();
      for (const it of world.items) {
        if ((it.kind !== "log" && it.kind !== "bellstone") || (it.state !== "loose" && it.state !== "carried")) continue;
        const d = Math.hypot(it.p[0] - ground.x, it.p[2] - ground.z);
        if (d < bestD) {
          bestD = d;
          best = { kind: "item", id: it.id };
        }
      }
      let bestS = Math.max(1.2, pickRadius() * 0.8);
      for (const s of world.settlers) {
        if (!pickableSettler(s)) continue;
        const ds = Math.hypot(s.x - ground.x, s.z - ground.z);
        if (ds < bestS && ds < bestD + 0.4) {
          bestS = ds;
          best = { kind: "settler", id: s.id };
        }
      }
      return best;
    },
    grab(g) {
      if (held) return false;
      if (g.kind === "item") {
        const it = getItem(world, g.id);
        if (!it) return false;
        for (const s of world.settlers) {
          if (s.carrying === it.id) {
            s.carrying = null;
            s.state = "idle";
            s.stateTicks = 0;
          }
          if (s.targetItem === it.id) s.targetItem = null;
        }
        it.state = "held";
        it.claimedBy = null;
        it.godTouched = true;
        physics.sync(world);
      } else {
        const s = settlerOf(g.id);
        if (!s || !pickableSettler(s)) return false;
        grabSettler(world, s);
      }
      held = g;
      hand.setPose("grip");
      note(`grab ${g.kind} ${g.id}`);
      return true;
    },
    release(v, gentle, ground, safe) {
      if (!held) return;
      const g = held;
      held = null;
      const gp = ground ?? lastGround;
      lastReleasePoint = [gp.x, gp.y, gp.z];
      if (g.kind === "settler") {
        const s = settlerOf(g.id);
        if (!s) return;
        if (gentle) releaseSettler(world, s, gp.x, Math.max(terrainHeight(gp.x, gp.z), 0), gp.z, [0, 0, 0], false);
        else releaseSettler(world, s, s.x, s.y, s.z, v, true);
        settlerViews.get(s.id)?.snap(s);
      } else {
        const it = getItem(world, g.id);
        if (!it) return;
        if (it.kind === "fireball" && (gentle || safe)) {
          dissolveFireball(it);
          puff(it.p);
        } else if (gentle) {
          it.state = "loose";
          // Rest height from the land under the log's centre and both ends, so it never starts buried on a slope.
          const ax = new THREE.Vector3(0, 0, 1).applyQuaternion(new THREE.Quaternion(it.q[0], it.q[1], it.q[2], it.q[3]));
          ax.y = 0;
          if (ax.lengthSq() < 1e-6) ax.set(0, 0, 1);
          ax.normalize().multiplyScalar(LOG_HALF_LENGTH);
          const hs = [0, 1, -1].map((k) => Math.max(terrainHeight(gp.x + ax.x * k, gp.z + ax.z * k), 0));
          it.p = [gp.x, Math.max(...hs) + (it.kind === "log" ? LOG_RADIUS : 0.5) + 0.02, gp.z];
          it.v = [0, 0, 0];
          it.w = [0, 0, 0];
          // Fresh dynamic body at the set-down point (no leftover kinematic motion).
          physics.remove(it.id);
          physics.sync(world);
          physics.place(it.id, it.p);
        } else {
          it.state = "loose";
          it.v = v;
          // Tumble about the horizontal axis across the throw (deterministic: no random spin).
          it.w = it.kind === "log" ? [v[2] * 0.35, 0.6, -v[0] * 0.35] : [0, 0, 0];
          // Leaves from where the hand is this instant (this event's touch point at carry height).
          it.p = [gp.x, gp.y + HAND_CARRY_HEIGHT + 0.35 - (it.kind === "log" ? 0.85 : 0.75), gp.z];
          physics.sync(world);
          physics.launch(it.id, it.p, it.v, it.w);
        }
      }
      hand.setPose("open");
      note(`release ${g.kind} ${gentle ? "gentle" : "throw"} v=${v.map((x) => x.toFixed(1)).join(",")}`);
    },
    holding: () => held,
    cast(kind) {
      return castMiracle(kind);
    },
    interact(_ray, ground) {
      if (heldCloud != null) {
        dropCloud();
        return true;
      }
      return interactWorld(ground);
    },
    blocked: () => templeMode !== "world",

    chamberPointer(ndc, click) {
      if (templeMode !== "chamber") return;
      const a = chamber.pointer(ndc);
      if (click && a) void tablet(a);
    },
    onTrace(points, style) {
      if (!points.length) {
        trace.clear();
        return;
      }
      if (style === "drawing" || style === "drawing-armed") {
        // Only the newest segment: the glyph appears under the hand as it is drawn.
        const a = points[points.length - 2] ?? points[points.length - 1];
        const b = points[points.length - 1];
        const hot = style === "drawing-armed";
        for (let k = 0; k < 4; k += 1) {
          const p = a.clone().lerp(b, k / 4);
          trace.emit(p.x, p.y + 0.15, p.z, 0, 0.05, 0, hot ? 0.6 : 0.5, hot ? 1.2 : 0.7, 1.0, hot ? 0.55 : 0.85, hot ? 0.15 : 0.45, hot ? 0.5 : 0.35);
        }
        return;
      }
      const life = style === "armed" ? RITUAL_ARM_MS / 1000 : 1.4;
      const [r, g, b] = style === "armed" ? [1.0, 0.8, 0.3] : [0.9, 0.4, 0.1];
      for (let i = 1; i < points.length; i += 1) {
        for (let k = 0; k < 3; k += 1) {
          const p = points[i - 1].clone().lerp(points[i], k / 3);
          trace.emit(p.x, p.y + 0.2, p.z, 0, style === "cast" ? 1.5 : 0.05, 0, style === "cast" ? 0.9 : 0.8, life, r, g, b, style === "cast" ? 0.45 : 0.9);
        }
      }
    },
    onGesture(r) {
      lastGesture = r;
      note(`gesture ${r.kind}${r.kind === "spiral" ? (r.clockwise ? " cw" : " ccw") : ""}`);
    },
  };

  const controller = new Controller(canvas, game);

  function summonFireball(): boolean {
    if (held || templeMode !== "world") return false;
    const p = handTarget.clone().add(new THREE.Vector3(0, -0.9, 0));
    const it = addItem(world, "fireball", p.x, p.y, p.z);
    it.state = "held";
    it.godTouched = true;
    it.restTicks = 0;
    physics.sync(world);
    held = { kind: "item", id: it.id };
    hand.setPose("grip");
    note("fireball summoned");
    return true;
  }

  function interactWorld(ground: THREE.Vector3 | null): boolean {
    if (!ground) return false;
    if (ground.distanceTo(buildings.templeDoor) < 4.5 || Math.hypot(ground.x - LAYOUT.temple.x, ground.z - LAYOUT.temple.z) < 6) {
      enterTemple();
      return true;
    }
    return false;
  }

  /** A fizzle: the glyph was right but the god lacks the power (or the knowledge). */
  function fizzle(why: string): void {
    const p = handTarget;
    for (let i = 0; i < 18; i += 1) smoke.emit(p.x, p.y - 0.6, p.z, (Math.random() - 0.5) * 1.5, Math.random(), (Math.random() - 0.5) * 1.5, 0.8, 1.1, 0.6, 0.6, 0.65, 0.45, 1);
    note(`fizzle: ${why}`);
  }

  function nearShrine(): boolean {
    return world.shrine.awakened && Math.hypot(lastGround.x - LAYOUT.shrine.x, lastGround.z - LAYOUT.shrine.z) < 14;
  }

  function castMiracle(kind: "fireball" | "rain" | "sanctuary"): boolean {
    if (templeMode !== "world" || world.outcome?.ended) return false;
    if (kind === "rain" && !world.learned.includes("rain") && nearShrine()) {
      // Tracing the shrine's glyph beside it teaches Rain.
      learn(world, "rain");
      note("learned rain at the shrine");
    }
    if (!world.learned.includes(kind)) {
      fizzle(`${kind} not learned`);
      return false;
    }
    if (!canAfford(world, kind)) {
      fizzle(`${kind} needs ${MIRACLE_COST[kind]} power, have ${Math.floor(world.power)}`);
      return false;
    }
    if (kind === "fireball") {
      if (!summonFireball()) return false;
    } else if (kind === "rain") {
      if (held || heldCloud != null) return false;
      heldCloud = castRain(world, lastGround.x, lastGround.z);
      note("rain cloud summoned");
    } else {
      castSanctuary(world, lastGround.x, lastGround.z);
      note(`sanctuary at ${lastGround.x.toFixed(0)},${lastGround.z.toFixed(0)}`);
    }
    spend(world, kind);
    return true;
  }

  function dropCloud(): void {
    const c = world.clouds.find((x) => x.id === heldCloud);
    if (c) {
      c.held = false;
      c.x = lastGround.x;
      c.z = lastGround.z;
      note(`rain dropped at ${c.x.toFixed(0)},${c.z.toFixed(0)}`);
    }
    heldCloud = null;
  }

  function loadRecords(): TempleRecord[] {
    try {
      return JSON.parse(localStorage.getItem(RECORDS_KEY) ?? "[]") as TempleRecord[];
    } catch {
      return [];
    }
  }
  function addRecord(): void {
    const o = world.outcome;
    if (!o) return;
    const rs = loadRecords();
    rs.push({ survived: o.survived, alive: o.alive, dead: o.dead, housesStanding: o.housesStanding, belief: o.belief, day: o.day });
    localStorage.setItem(RECORDS_KEY, JSON.stringify(rs.slice(-20)));
  }
  function showEndCard(): void {
    const o = world.outcome!;
    endCard.innerHTML = "";
    const h = document.createElement("h1");
    h.textContent = o.title;
    endCard.appendChild(h);
    for (const line of o.lines) {
      const p = document.createElement("p");
      p.textContent = line;
      endCard.appendChild(p);
    }
    const b = document.createElement("button");
    b.id = "restart";
    b.textContent = "Begin a new year";
    b.addEventListener("click", () => restart());
    endCard.appendChild(b);
    endCard.style.display = "block";
    endCard.classList.toggle("lost", !o.survived);
  }
  function restart(): void {
    applyWorld(createWorld(SEED, world.scenario));
    note("restarted");
  }

  function puff(p: [number, number, number]): void {
    for (let i = 0; i < 24; i += 1) {
      smoke.emit(p[0], p[1], p[2], (Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2, 1.2, 1.5, 0.9, 0.85, 0.8, 0.5, 1.5);
    }
  }

  // ---------------- temple ----------------
  function enterTemple(): void {
    if (templeMode !== "world") return;
    controller.safeRelease();
    templeMode = "flying";
    const t = LAYOUT.temple;
    const yaw = Math.atan2(t.doorX - t.x, t.doorZ - t.z);
    rig.flyTo = {
      target: new THREE.Vector3(t.doorX, 0, t.doorZ),
      dist: 7,
      yaw,
      t: 0,
      dur: TEST ? 0.5 : 1.3,
      from: rig.state(),
      done: () => {
        fadeTo(1, () => {
          templeMode = "chamber";
          fadeTo(0, () => undefined);
        });
      },
    };
  }

  function exitTemple(): void {
    if (templeMode !== "chamber") return;
    templeMode = "fading-out";
    chamber.recordsOpen = false;
    fadeTo(1, () => {
      const t = LAYOUT.temple;
      const yaw = Math.atan2(t.doorX - t.x, t.doorZ - t.z);
      rig.set({ tx: t.doorX + Math.sin(yaw) * 4, tz: t.doorZ + Math.cos(yaw) * 4, yaw, dist: 26 });
      templeMode = "world";
      fadeTo(0, () => undefined);
    });
  }

  let fadeAnim: { from: number; to: number; t: number; dur: number; done: () => void } | null = null;
  let fadeValue = 1; // start black, fade in once ready
  function fadeTo(to: number, done: () => void): void {
    fadeAnim = { from: fadeValue, to, t: 0, dur: TEST ? 0.2 : 0.45, done };
  }

  async function doSave(): Promise<string> {
    const text = serialize(world, rig.state());
    await writeSave(text);
    note(`saved ${hashWorld(world)}`);
    return hashWorld(world);
  }
  async function doLoad(): Promise<boolean> {
    const text = await readSave();
    if (!text) return false;
    const { world: w, camera } = deserialize(text);
    applyWorld(w);
    if (templeMode === "world") rig.set(camera);
    note(`loaded ${hashWorld(world)}`);
    return true;
  }
  function applyWorld(w: World): void {
    controller.safeRelease();
    held = null;
    heldCloud = null;
    world = w;
    for (const c of world.clouds) c.held = false;
    baseFuel = createFireGrid(world.scenario === "village").fuel;
    showVillage();
    endShown = !!world.outcome?.ended;
    if (endShown) showEndCard();
    else endCard.style.display = "none";
    void settlerViews.sync(world);
    physics.clear();
    physics.sync(world);
    flames.clear();
    smoke.clear();
    trace.clear();
    for (const s of world.settlers) settlerViews.get(s.id)?.snap(s);
    simAcc = 0;
  }
  async function tablet(a: TabletAction): Promise<void> {
    if (a === "door") return exitTemple();
    if (a === "records") {
      chamber.toggleRecords();
      return;
    }
    if (a === "save") await doSave();
    else if (a === "load") await doLoad();
    else restart();
    exitTemple();
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && templeMode === "chamber") exitTemple();
  });

  // ---------------- frame loop ----------------
  const clock = new THREE.Timer();
  let time = 0;
  function simTick(): void {
    const t0 = performance.now();
    stepWorld(world, findPath, { settlers: settlerAi });
    lastSimMs = performance.now() - t0;
    const nameOf = (id: number) => (settlerOf(id)?.name ?? `#${id}`).toLowerCase();
    for (const e of world.events) {
      if (e.type === "ignite") note(`ignite ${e.cells} cells`);
      else if (e.type === "stacked") note(`stacked -> ${e.count}`);
      else if (e.type === "settler_state") {
        if (world.scenario === "solo") note(`${nameOf(e.settler)} ${e.state}`);
      } else if (e.type === "cant_reach") note(`${nameOf(e.settler)} can't reach`);
      else if (e.type === "lightning") {
        miracles.strike(e.x, e.z);
        note(`lightning at ${e.x.toFixed(0)},${e.z.toFixed(0)}`);
      } else if (e.type === "felled") note(`${nameOf(e.settler)} felled a tree`);
      else if (e.type === "delivered") note(`${nameOf(e.settler)} delivered ${e.res} to ${e.to}`);
      else if (e.type === "site_done") note(`house ${e.house} finished`);
      else if (e.type === "house_burned") note(`house ${e.house} burned`);
      else if (e.type === "harvest") note(`harvest +${e.food}`);
      else if (e.type === "died") note(`${nameOf(e.settler)} died (${e.cause})`);
      else if (e.type === "learned") note(`learned ${e.miracle}`);
      else if (e.type === "shrine_awake") note("shrine awake");
      else if (e.type === "mural_done") note("mural finished");
      else if (e.type === "day") note(`day ${e.day} dryness ${e.dryness.toFixed(2)}`);
      else if (e.type === "doused") note(`${nameOf(e.settler)} doused ${e.cells}`);
      else if (e.type === "prayed") note(`${nameOf(e.settler)} prayed`);
      else if (e.type === "outcome") note(`outcome ${e.survived ? "survived" : "lost"}`);
    }
    world.events = [];
    for (const s of world.settlers) settlerViews.get(s.id)?.onTick(s);
  }

  function updateHeld(): void {
    if (!held) return;
    const yaw = rig.yaw + Math.PI;
    if (held.kind === "settler") {
      const s = settlerOf(held.id);
      if (!s) return;
      s.x = handTarget.x;
      s.z = handTarget.z;
      s.y = handTarget.y - 2.25;
      return;
    }
    const it = getItem(world, held.id);
    if (!it) return;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw + Math.PI / 2, 0));
    // Logs hang under the palm; a fireball sits cupped at the fingertips where the camera can see it.
    const reach = it.kind === "fireball" ? 2.1 * hand.group.scale.x : 0;
    const p: [number, number, number] = [
      handTarget.x - Math.sin(rig.yaw) * reach,
      handTarget.y - (it.kind === "log" ? 0.85 : it.kind === "bellstone" ? 0.9 : 0.7 * hand.group.scale.x),
      handTarget.z - Math.cos(rig.yaw) * reach,
    ];
    physics.setHeldTarget(it.id, p, [q.x, q.y, q.z, q.w]);
  }

  function checkFireballs(): void {
    for (const it of world.items) {
      if (it.kind !== "fireball" || it.state !== "loose") continue;
      const ground = terrainHeight(it.p[0], it.p[2]);
      const overWater = ground < 0.1;
      let hitTree = false;
      for (const t of trees()) {
        if (Math.abs(t.x - it.p[0]) < 1.6 && Math.abs(t.z - it.p[2]) < 1.6 && it.p[1] < t.y + t.scale * 1.2) {
          hitTree = true;
          break;
        }
      }
      const low = it.p[1] - Math.max(ground, 0) < 0.75;
      const slow = Math.hypot(...it.v) < 0.6 && it.restTicks > 2;
      const lost = Math.abs(it.p[0]) > 79 || Math.abs(it.p[2]) > 79;
      if (overWater && it.p[1] < 0.6) {
        dissolveFireball(it);
        puff(it.p);
        note("fireball quenched in water");
      } else if (low || hitTree || slow || lost) {
        const n = fireballImpact(world, it);
        for (let k = 0; k < 60; k += 1)
          flames.emit(it.p[0], it.p[1], it.p[2], (Math.random() - 0.5) * 8, Math.random() * 6, (Math.random() - 0.5) * 8, 1.4, 0.7, 1, 0.55, 0.15, 1, 0.5);
        note(`fireball impact ${n} cells`);
      }
    }
  }

  function resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    rig.camera.aspect = w / h;
    rig.camera.updateProjectionMatrix();
    chamber.resize(w / h);
    const ph = h * renderer.getPixelRatio();
    for (const p of [flames, smoke, trace]) p.setViewportHeight(ph, rig.camera.fov);
    miracles.setViewport(ph, rig.camera.fov);
  }
  window.addEventListener("resize", resize);
  resize();

  let physicsMs = 0;
  function frame(): void {
    const frameStart = performance.now();
    clock.update();
    const rawDt = clock.getDelta();
    const dt = Math.min(0.1, rawDt);
    time += dt;
    windUniform.value = time;

    if (fadeAnim) {
      fadeAnim.t += dt;
      const k = Math.min(1, fadeAnim.t / fadeAnim.dur);
      fadeValue = fadeAnim.from + (fadeAnim.to - fadeAnim.from) * k;
      if (k >= 1) {
        const d = fadeAnim.done;
        fadeAnim = null;
        d();
      }
    }
    fade.style.opacity = fadeValue.toFixed(3);
    fade.style.display = fadeValue > 0.001 ? "block" : "none";

    rig.update(dt);
    if (templeMode === "world") controller.refresh();
    if (controller.ground) lastGround.copy(controller.ground);

    // Hand: follows this frame's touch point; lower to reach over a grabbable; higher when carrying.
    const hover = templeMode === "world" ? controller.hover : null;
    const lift = held ? HAND_CARRY_HEIGHT + (held.kind === "settler" ? 1.6 : 0) : hover ? HAND_HOVER_HEIGHT * 0.75 : HAND_HOVER_HEIGHT;
    handTarget.set(lastGround.x, lastGround.y + lift + 0.35, lastGround.z);
    if (!held) hand.setPose(hover ? "reach" : "open");
    hand.setArmed(controller.armed() ? 1 : 0);
    // A held rain cloud rides with the hand.
    if (heldCloud != null) {
      const c = world.clouds.find((x) => x.id === heldCloud);
      if (c) {
        c.x = lastGround.x;
        c.z = lastGround.z;
      } else heldCloud = null;
    }
    // Studying the finished mural: hold the empty hand over it.
    if (world.scenario === "village" && templeMode === "world" && !held && world.mural.progress >= 1 && !world.learned.includes("sanctuary")) {
      const m = LAYOUT.mural;
      const near = Math.hypot(lastGround.x - m.x, lastGround.z - m.z) < m.len / 2 + 2.5;
      studyTime = near ? studyTime + dt : 0;
      if (studyTime >= STUDY_MURAL_S) {
        world.mural.read = true;
        learn(world, "sanctuary");
        note("learned sanctuary from the mural");
        studyTime = 0;
      }
    } else studyTime = 0;
    const handEase = 1 - Math.exp(-dt * 22);
    hand.group.position.lerp(handTarget, handEase);
    hand.group.rotation.set(0.32, rig.yaw + Math.PI, 0);
    // Hand scale grows when zoomed out so it stays readable (B&W style).
    hand.group.scale.setScalar(1.0 + (rig.dist / CAM_MAX_DIST) * 1.6);
    hand.update(dt);
    hand.group.visible = templeMode === "world" || templeMode === "flying";
    ring.position.set(lastGround.x, lastGround.y + 0.08, lastGround.z);
    const ringMat = ring.material as THREE.MeshBasicMaterial;
    ringMat.opacity = hover ? 0.75 : held ? 0.2 : 0.3;
    ring.scale.setScalar(hover ? 1.4 : 1 + rig.dist * 0.012);
    ring.visible = hand.group.visible;

    if (templeMode !== "chamber") {
      updateHeld();
      physics.sync(world);
      const p0 = performance.now();
      physics.step(dt);
      physicsMs = performance.now() - p0;
      physics.writeBack(world);
      checkFireballs();
      simAcc += dt;
      let n = 0;
      while (simAcc >= SIM_DT && n < 5) {
        simTick();
        simAcc -= SIM_DT;
        n += 1;
      }
      if (n === 5) simAcc = 0;
    }

    // Views.
    const s = settler();
    const alpha = Math.min(1, simAcc / SIM_DT);
    for (const st of world.settlers) settlerViews.get(st.id)?.update(st, alpha, dt, world.tick);
    itemViews.update(world, dt);
    fireView.update(world, dt);
    const village = world.scenario === "village";
    terrain.updateFire(world.fire, village ? world.climate.dryness : 0, village ? baseFuel : null);
    vegetation.updateFire(world.fire, dt, world.felled);
    if (village) villageView.update(world, dt);
    miracles.update(world, dt);
    buildings.woodpile.setCount(world.woodpile.count);
    water.update(time);
    flames.update(dt);
    smoke.update(dt);
    trace.update(dt);
    followSun(sun, rig.target, rig.dist);

    // Inspect bubble: hover the empty hand over a villager for 0.6 s.
    const hoveredId = hover?.kind === "settler" && !held ? hover.id : null;
    if (hoveredId != null && hoveredId === hoverSettlerId) hoverSettlerTime += dt;
    else hoverSettlerTime = 0;
    hoverSettlerId = hoveredId;
    let bubble: string | null = null;
    let bubbleDetail = "";
    let bubbleId: number | null = null;
    if (templeMode === "world") {
      const cant = world.settlers.find((x) => world.tick < x.cantReachShownUntil);
      if (cant) {
        bubble = "I can't reach that.";
        bubbleId = cant.id;
      } else if (hoveredId != null && hoverSettlerTime >= 0.6) {
        const hs = settlerOf(hoveredId)!;
        bubble = describeSettler(world, hs);
        if (village) bubbleDetail = describeDetail(world, hs);
        bubbleId = hs.id;
      }
    }
    for (const [id, v] of settlerViews.views) v.showBubble(id === bubbleId ? bubble : null, rig.camera, window.innerWidth, window.innerHeight, bubbleDetail);
    currentBubble = bubble;
    currentBubbleDetail = bubbleDetail;
    // The hand glows warmer with more prayer power (village only).
    hand.setPower(village ? world.power / 100 : 1);
    if (templeMode === "chamber" || templeMode === "fading-in") chamber.setState({ learned: world.learned, power: village ? world.power : 100, records: loadRecordsCached() });
    // The year's end: a card with what happened, saved to the temple records.
    if (world.outcome?.ended && !endShown) {
      endShown = true;
      addRecord();
      recordsCache = null;
      showEndCard();
      controller.safeRelease();
    }

    if (templeMode === "chamber" || templeMode === "fading-out") {
      chamber.update(dt);
      renderer.render(chamber.scene, chamber.camera);
    } else renderer.render(scene, rig.camera);

    overlay.update(dt, () => {
      const st = frameStats.summary(240);
      const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
      return [
        `PARABLE ${world.scenario}  seed ${world.seed}  tick ${world.tick}  day ${world.climate.day} dry ${world.climate.dryness.toFixed(2)}  power ${Math.floor(world.power)}  (F3 to hide)`,
        `frame median ${st.median.toFixed(1)} ms  p95 ${st.p95.toFixed(1)} ms  ~${st.fps.toFixed(0)} fps`,
        `sim tick ${lastSimMs.toFixed(2)} ms  physics ${physics.lastStepMs.toFixed(2)} ms/step  heap ${mem ? (mem.usedJSHeapSize / 1048576).toFixed(0) + " MB" : "n/a"}`,
        `camera dist ${rig.dist.toFixed(1)} height ${rig.height().toFixed(1)}  mode ${controller.mode}  temple ${templeMode}`,
        `held ${held ? held.kind + " " + held.id : "-"}  hover ${hover ? hover.kind + " " + hover.id : "-"}  armed ${controller.armed()}`,
        `${s.name} ${s.state}  carrying ${s.carrying ?? "-"}  memories ${s.memories.length}  woodpile ${world.woodpile.count}  food ${world.granary.food}  alive ${world.settlers.filter((x) => x.alive).length}/${world.settlers.length}  belief ${village ? villageBelief(world) : "-"}`,
        `fire burning ${burningCount(world.fire)}  scorched ${scorchedCount(world.fire)}  hash ${hashWorld(world)}`,
        `last gesture ${lastGesture ? JSON.stringify(lastGesture) : "-"}`,
        ...log.slice(-8),
      ];
    });
    frameStats.push(performance.now() - frameStart + 0); // CPU time of this frame
    frameIntervals.push(rawDt * 1000);
    requestAnimationFrame(frame);
  }
  let currentBubble: string | null = null;
  let currentBubbleDetail = "";
  let hoverSettlerId: number | null = null;
  let recordsCache: TempleRecord[] | null = null;
  function loadRecordsCached(): TempleRecord[] {
    if (!recordsCache) recordsCache = loadRecords();
    return recordsCache;
  }
  const frameIntervals = new FrameStats();
  fadeTo(0, () => undefined);
  requestAnimationFrame(frame);
  void physicsMs;

  // ---------------- test hooks (?test=1 only) ----------------
  if (TEST) {
    const screenOf = (x: number, y: number, z: number) => {
      const v = new THREE.Vector3(x, y, z).project(rig.camera);
      const r = canvas.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height, visible: v.z < 1 };
    };
    const itemSummary = (it: Item) => ({ id: it.id, kind: it.kind, state: it.state, p: it.p.map((n) => +n.toFixed(3)), v: it.v.map((n) => +n.toFixed(3)) });
    (window as unknown as { __parable: unknown }).__parable = {
      ready: true,
      seed: SEED,
      state: () => {
        const s = settler();
        return {
          tick: world.tick,
          items: world.items.map(itemSummary),
          settler: { state: s.state, x: s.x, y: s.y, z: s.z, carrying: s.carrying, memories: s.memories, bruisedUntil: s.bruisedUntil },
          woodpile: world.woodpile.count,
          burning: burningCount(world.fire),
          scorched: scorchedCount(world.fire),
          camera: { ...rig.state(), height: rig.height(), y: rig.camera.position.y },
          held,
          hover: controller.hover,
          mode: controller.mode,
          armed: controller.armed(),
          templeMode,
          bubble: currentBubble,
          lastGesture,
          lastRelease: controller.lastRelease,
          lastReleasePoint,
          settlerAi,
          log: log.slice(),
        };
      },
      hash: () => hashWorld(world),
      stepTicks: (n: number) => {
        for (let i = 0; i < n; i += 1) {
          updateHeld();
          physics.sync(world);
          physics.step(SIM_DT);
          physics.writeBack(world);
          checkFireballs();
          simTick();
        }
        return world.tick;
      },
      screenOf,
      itemScreen: (id: number) => {
        const it = getItem(world, id);
        return it ? screenOf(it.p[0], it.p[1], it.p[2]) : null;
      },
      settlerScreen: () => {
        const s = settler();
        return screenOf(s.x, s.y + 1, s.z);
      },
      groundScreen: (x: number, z: number) => screenOf(x, Math.max(terrainHeight(x, z), 0), z),
      tabletScreen: (a: TabletAction) => {
        const v = chamber.tabletNdc(a);
        return { x: ((v.x + 1) / 2) * window.innerWidth, y: ((1 - v.y) / 2) * window.innerHeight };
      },
      templeDoorScreen: () => screenOf(buildings.templeDoor.x, buildings.templeDoor.y + 0.5, buildings.templeDoor.z),
      setCamera: (c: { tx: number; tz: number; yaw: number; dist: number }) => rig.set(c),
      placeItem: (id: number, x: number, z: number) => {
        const it = getItem(world, id);
        if (!it) return false;
        it.state = "loose";
        it.p = [x, Math.max(terrainHeight(x, z), 0) + 0.4, z];
        it.v = [0, 0, 0];
        physics.remove(id);
        physics.sync(world);
        physics.place(id, it.p, false);
        return true;
      },
      placeSettler: (x: number, z: number, id?: number) => {
        const s = id != null ? settlerOf(id)! : settler();
        s.x = x;
        s.z = z;
        s.y = terrainHeight(x, z);
        s.path = [];
        settlerViews.get(s.id)?.snap(s);
      },
      // ---- M2-M4 hooks ----
      village: () => ({
        scenario: world.scenario,
        day: world.climate.day,
        dayTick: world.climate.dayTick,
        dryness: world.climate.dryness,
        wind: world.climate.wind,
        lightningDone: world.climate.lightningDone,
        power: world.power,
        learned: world.learned.slice(),
        food: world.granary.food,
        woodpile: world.woodpile.count,
        houses: world.houses.map((h) => ({ id: h.id, state: h.state })),
        sites: world.sites.map((x) => ({ id: x.id, have: x.have, need: x.need, work: x.work, done: x.done })),
        felled: world.felled.length,
        clouds: world.clouds.map((c) => ({ id: c.id, x: c.x, z: c.z, held: c.held, ttl: c.ttl })),
        sanctuaries: world.sanctuaries.map((x) => ({ id: x.id, x: x.x, z: x.z, ttl: x.ttl })),
        shrine: { ...world.shrine },
        mural: { ...world.mural },
        outcome: world.outcome,
        belief: world.scenario === "village" ? villageBelief(world) : 0,
        heldCloud,
        endCardVisible: endCard.style.display !== "none",
        bubbleDetail: currentBubbleDetail,
        alive: world.settlers.filter((x) => x.alive).length,
      }),
      settlers: () =>
        world.settlers.map((x) => ({
          id: x.id,
          name: x.name,
          job: x.job,
          state: x.state,
          alive: x.alive,
          x: x.x,
          y: x.y,
          z: x.z,
          hunger: x.hunger,
          energy: x.energy,
          injury: x.injury,
          home: x.home,
          belief: x.belief,
          mood: beliefSummary(x),
          memories: x.memories.length,
          memoryKinds: x.memories.map((m) => m.kind),
          carryRes: x.carryRes, task: x.task?.kind ?? null,
        })),
      describe: () => describeAll(world),
      settlerScreenOf: (id: number) => {
        const x = settlerOf(id);
        return x ? screenOf(x.x, x.y + 1, x.z) : null;
      },
      setPower: (n: number) => {
        world.power = n;
      },
      learn: (m: string) => learn(world, m),
      castMiracle: (k: "fireball" | "rain" | "sanctuary") => castMiracle(k),
      setDay: (day: number, frac = 0) => {
        world.climate.day = day;
        world.climate.dayTick = Math.floor(frac * DAY_TICKS);
      },
      setMuralProgress: (p: number) => {
        world.mural.progress = p;
      },
      shrineScreen: () => screenOf(villageView.shrinePoint.x, villageView.shrinePoint.y, villageView.shrinePoint.z),
      muralScreen: () => screenOf(villageView.muralPoint.x, villageView.muralPoint.y, villageView.muralPoint.z),
      itemOfKind: (k: string) => world.items.find((x) => x.kind === k)?.id ?? null,
      igniteAt: (x: number, z: number, r = 2.5) => igniteAt(world, x, z, r, false),
      records: () => loadRecords(),
      clearRecords: () => localStorage.removeItem(RECORDS_KEY),
      templeLit: (m: string) => chamber.learnedLit(m),
      recordsOpen: () => chamber.recordsOpen,
      endOutcome: (survived: boolean) => {
        world.outcome = computeOutcome(world, survived);
        world.events.push({ type: "outcome", survived: world.outcome.survived });
      },
      setSettlerAi: (on: boolean) => {
        settlerAi = on;
      },
      setPixelRatio: (r: number) => {
        renderer.setPixelRatio(r);
        resize();
      },
      save: () => doSave(),
      load: () => doLoad(),
      restart: () => restart(),
      perf: () => ({ cpu: frameStats.summary(), interval: frameIntervals.summary(), physicsStepMs: physics.lastStepMs, simTickMs: lastSimMs }),
      resetPerf: () => {
        frameStats.reset();
        frameIntervals.reset();
      },
      exportSave: () => serialize(world, rig.state()),
      importSave: (text: string) => applyWorld(deserialize(text).world),
      overlayVisible: () => overlay.visible,
      three: { scene, renderer, rig, THREE },
    };
  }
}

boot().catch((e) => {
  console.error(e);
  const pre = document.createElement("pre");
  pre.id = "fatal";
  pre.textContent = `Parable failed to start: ${String(e)}`;
  document.body.appendChild(pre);
});
