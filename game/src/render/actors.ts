import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { SIM_HZ } from "../config";
import { fireCellCenter } from "../sim/fire";
import { terrainHeight } from "../sim/terrain";
import type { Item, Settler, World } from "../sim/types";
import { CHARS, NATURE, loadGLB } from "./assets";
import { Particles } from "./particles";

const LOG_SCALE = 3.2;

export class ItemViews {
  readonly group = new THREE.Group();
  private views = new Map<number, THREE.Object3D>();
  private logProto!: THREE.Object3D;
  private fireProto!: THREE.Object3D;
  private fireLight = new THREE.PointLight(new THREE.Color("#ff8a33"), 0, 18, 1.5);
  private t = 0;

  constructor(private flames: Particles) {
    this.group.add(this.fireLight);
  }

  async init(): Promise<void> {
    const g = await loadGLB(`${NATURE}log.glb`);
    const proto = new THREE.Group();
    const inner = g.scene.clone(true);
    inner.scale.setScalar(LOG_SCALE);
    inner.position.y = -0.035 * LOG_SCALE;
    proto.add(inner);
    this.logProto = proto;
    // Fireball: a white-hot core in an orange shell with an additive corona (original procedural art).
    const fb = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.5, 0.45) }));
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 24, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.35, 0.05), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 20, 12),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 0.18, 0.02), transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    fb.add(halo);
    fb.add(core, shell);
    this.fireProto = fb;
  }

  update(world: World, dt: number): void {
    this.t += dt;
    const live = new Set<number>();
    let fire: Item | null = null;
    for (const item of world.items) {
      if (item.state === "gone" || item.state === "stacked") continue;
      live.add(item.id);
      let v = this.views.get(item.id);
      if (!v) {
        v = (item.kind === "log" ? this.logProto : this.fireProto).clone(true);
        v.traverse((o) => {
          o.castShadow = item.kind === "log";
          o.receiveShadow = item.kind === "log";
        });
        v.userData.itemId = item.id;
        this.views.set(item.id, v);
        this.group.add(v);
      }
      v.position.set(item.p[0], item.p[1], item.p[2]);
      v.quaternion.set(item.q[0], item.q[1], item.q[2], item.q[3]);
      if (item.kind === "fireball") {
        fire = item;
        const k = 1 + Math.sin(this.t * 17) * 0.06 + Math.sin(this.t * 7.3) * 0.05;
        v.scale.setScalar(k);
        const speed = Math.hypot(item.v[0], item.v[1], item.v[2]);
        for (let n = 0; n < 3; n += 1) {
          this.flames.emit(
            item.p[0] + (Math.random() - 0.5) * 0.5,
            item.p[1] + (Math.random() - 0.5) * 0.5,
            item.p[2] + (Math.random() - 0.5) * 0.5,
            -item.v[0] * 0.15 + (Math.random() - 0.5) * 0.6,
            1.2 + Math.random() * 0.8 - item.v[1] * 0.1,
            -item.v[2] * 0.15 + (Math.random() - 0.5) * 0.6,
            0.7 + Math.random() * 0.5 + speed * 0.02,
            0.35 + Math.random() * 0.3,
            1.0,
            0.45 + Math.random() * 0.25,
            0.1,
            0.9,
            -0.5,
          );
        }
      }
    }
    for (const [id, v] of this.views) {
      if (!live.has(id)) {
        this.group.remove(v);
        this.views.delete(id);
      }
    }
    if (fire) {
      this.fireLight.position.set(fire.p[0], fire.p[1], fire.p[2]);
      this.fireLight.intensity = 30 + Math.sin(this.t * 23) * 6;
    } else this.fireLight.intensity = 0;
  }

  objectFor(id: number): THREE.Object3D | undefined {
    return this.views.get(id);
  }

  pickables(): THREE.Object3D[] {
    return [...this.views.values()];
  }
}

const STATE_CLIP: Record<Settler["state"], string> = {
  idle: "idle",
  to_log: "walk",
  returning: "walk",
  pickup: "pick-up",
  carrying: "carry-walk",
  stacking: "pick-up",
  flee: "sprint",
  cower: "crouch",
  held: "fall",
  airborne: "fall",
  recover: "crouch",
};

export class SettlerView {
  readonly root = new THREE.Group();
  private model!: THREE.Object3D;
  private mixer!: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private current = "";
  private prev = new THREE.Vector3();
  private curr = new THREE.Vector3();
  private heading = 0;
  private t = 0;
  bubble: HTMLDivElement;

  constructor(readonly settlerId: number) {
    this.bubble = document.createElement("div");
    this.bubble.className = "bubble";
    this.bubble.style.display = "none";
    document.body.appendChild(this.bubble);
  }

  async init(): Promise<void> {
    const g = await loadGLB(`${CHARS}character-female-b.glb`);
    this.model = cloneSkinned(g.scene);
    this.model.scale.setScalar(2.4);
    this.model.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    this.root.add(this.model);
    this.mixer = new THREE.AnimationMixer(this.model);
    for (const clip of g.animations) this.actions.set(clip.name, this.mixer.clipAction(clip));
    // Carry-walk: legs and body from "walk", arms from "holding-both".
    const walk = g.animations.find((c) => c.name === "walk");
    const hold = g.animations.find((c) => c.name === "holding-both");
    if (walk && hold) {
      const tracks = [
        ...walk.tracks.filter((t) => !/arm-/.test(t.name)).map((t) => t.clone()),
        ...hold.tracks.filter((t) => /arm-/.test(t.name)).map((t) => t.clone()),
      ];
      const carry = new THREE.AnimationClip("carry-walk", walk.duration, tracks);
      this.actions.set("carry-walk", this.mixer.clipAction(carry));
    }
    this.play("idle");
  }

  private play(name: string, timeScale = 1): void {
    const next = this.actions.get(name) ?? this.actions.get("idle")!;
    next.timeScale = timeScale;
    if (this.current === name) return;
    const prev = this.actions.get(this.current);
    next.reset();
    if (name === "pick-up") {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
    }
    next.play();
    if (prev) prev.crossFadeTo(next, 0.2, false);
    this.current = name;
  }

  /** Called after each sim tick so rendering can interpolate between ticks. */
  onTick(s: Settler): void {
    this.prev.copy(this.curr);
    this.curr.set(s.x, s.y, s.z);
    if (this.prev.lengthSq() === 0 || this.prev.distanceTo(this.curr) > 6) this.prev.copy(this.curr);
  }

  snap(s: Settler): void {
    this.curr.set(s.x, s.y, s.z);
    this.prev.copy(this.curr);
    this.heading = s.heading;
  }

  update(s: Settler, alpha: number, dt: number, tick: number): void {
    this.t += dt;
    if (s.state === "held") {
      this.root.position.set(s.x, s.y, s.z);
      // Dangling and squirming.
      this.root.rotation.set(Math.sin(this.t * 9) * 0.25, this.heading + Math.sin(this.t * 2.3) * 0.5, Math.sin(this.t * 7) * 0.3);
    } else {
      this.root.position.lerpVectors(this.prev, this.curr, alpha);
      if (s.state !== "airborne") this.root.position.y = Math.max(terrainHeight(this.root.position.x, this.root.position.z), -0.6);
      let d = s.heading - this.heading;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.heading += d * Math.min(1, dt * 10);
      const tumble = s.state === "airborne" ? this.t * 6 : 0;
      this.root.rotation.set(tumble, this.heading, 0);
    }
    const bruised = tick < s.bruisedUntil;
    const clip = STATE_CLIP[s.state];
    this.play(clip, bruised && /walk/.test(clip) ? 0.6 : clip === "sprint" ? 1.15 : 1);
    this.mixer.update(dt);
  }

  showBubble(text: string | null, camera: THREE.Camera, w: number, h: number): void {
    if (!text) {
      this.bubble.style.display = "none";
      return;
    }
    const p = this.root.position.clone();
    p.y += 2.5;
    p.project(camera);
    if (p.z > 1) {
      this.bubble.style.display = "none";
      return;
    }
    this.bubble.textContent = text;
    this.bubble.style.display = "block";
    this.bubble.style.left = `${((p.x + 1) / 2) * w}px`;
    this.bubble.style.top = `${((1 - p.y) / 2) * h}px`;
  }
}

/** Flames, embers and smoke over burning and freshly burnt cells. */
export class FireView {
  private acc = 0;
  private light = new THREE.PointLight(new THREE.Color("#ff7a2a"), 0, 40, 1.4);
  private t = 0;
  constructor(
    private flames: Particles,
    private smoke: Particles,
    scene: THREE.Scene,
  ) {
    scene.add(this.light);
  }

  update(world: World, dt: number): void {
    this.t += dt;
    this.acc += dt;
    const f = world.fire;
    let cx = 0;
    let cz = 0;
    let n = 0;
    const emit = this.acc > 1 / 30;
    if (emit) this.acc = 0;
    for (let i = 0; i < f.burn.length; i += 1) {
      const b = f.burn[i];
      if (b <= 0) continue;
      const [x, z] = fireCellCenter(i);
      cx += x;
      cz += z;
      n += 1;
      if (!emit) continue;
      const y = terrainHeight(x, z);
      const strength = Math.min(1, b / (SIM_HZ * 3)) * (0.4 + f.fuel[i] * 0.6);
      const tall = f.fuel[i] > 0.9 ? 4.2 : 1.6; // tree canopy burns tall
      if (Math.random() < 0.9) {
        this.flames.emit(
          x + (Math.random() - 0.5) * 2,
          y + Math.random() * tall * 0.6,
          z + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.4,
          1.8 + Math.random() * 1.6,
          (Math.random() - 0.5) * 0.4,
          (1.2 + Math.random() * 1.2) * (0.6 + strength),
          0.5 + Math.random() * 0.5,
          1.0,
          0.42 + Math.random() * 0.3,
          0.08,
          0.85,
          -0.4,
        );
      }
      if (Math.random() < 0.25) {
        const g = 0.18 + Math.random() * 0.1;
        this.smoke.emit(x + (Math.random() - 0.5) * 2, y + tall, z + (Math.random() - 0.5) * 2, 0.6 + Math.random() * 0.3, 1.6 + Math.random(), 0.2, 2.2, 4 + Math.random() * 2, g, g, g * 0.95, 0.38, 2.5);
      }
    }
    if (n) {
      this.light.position.set(cx / n, terrainHeight(cx / n, cz / n) + 4, cz / n);
      this.light.intensity = Math.min(220, 40 + n * 6) * (0.85 + Math.sin(this.t * 19) * 0.08 + Math.sin(this.t * 7) * 0.07);
    } else this.light.intensity *= 0.9;
  }
}
