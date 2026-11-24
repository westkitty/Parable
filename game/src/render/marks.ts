// World marks for the later miracles and the golems:
// - the five old-god glyph stones (Kenney CC0 stone_tallA; the glowing glyph face is a procedural canvas),
// - the golem ring (Kenney CC0 stone_smallC), and golems assembled procedurally from Kenney CC0 log and rock pieces,
// - Stone Shape rings (Kenney CC0 stone_tallA), the Beacon pillar and Wind Lash streaks (procedural).
import * as THREE from "three";
import type { Miracle } from "../input/gesture";
import { LAYOUT, terrainHeight } from "../sim/terrain";
import type { Golem, World } from "../sim/types";
import { NATURE, loadGLB } from "./assets";
import { MIRACLE_COLOUR, drawGesture } from "./glyphs";

async function obj(url: string, scale: number): Promise<THREE.Object3D> {
  const o = (await loadGLB(url)).scene.clone(true);
  o.scale.setScalar(scale);
  return o;
}

/** A Kenney piece re-fitted so its longest axis is vertical (Y), `length` long and `thick` across, centred on the origin. */
function fitLong(proto: THREE.Object3D, length: number, thick: number): THREE.Group {
  const box = new THREE.Box3().setFromObject(proto);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const o = proto.clone(true);
  const axis = size.x >= size.y && size.x >= size.z ? "x" : size.z >= size.y ? "z" : "y";
  const long = size[axis];
  const others = (["x", "y", "z"] as const).filter((a) => a !== axis);
  const inner = new THREE.Group();
  o.position.copy(centre).multiplyScalar(-1);
  inner.add(o);
  inner.scale.set(1, 1, 1);
  inner.scale[axis] = length / long;
  for (const a of others) inner.scale[a] = thick / Math.max(1e-3, size[a]);
  const wrap = new THREE.Group();
  if (axis === "x") inner.rotation.z = Math.PI / 2;
  else if (axis === "z") inner.rotation.x = Math.PI / 2;
  wrap.add(inner);
  return wrap;
}

/** Scale a piece so its largest dimension is `size`, resting on y = 0. */
function fitSize(proto: THREE.Object3D, size: number): THREE.Object3D {
  const box = new THREE.Box3().setFromObject(proto);
  const s = box.getSize(new THREE.Vector3());
  const o = proto.clone(true);
  const k = size / Math.max(s.x, s.y, s.z);
  o.scale.multiplyScalar(k);
  o.position.y = -box.min.y * k;
  const g = new THREE.Group();
  g.add(o);
  return g;
}

function glyphFace(m: Miracle): THREE.MeshBasicMaterial {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#fff";
  g.lineWidth = 12;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.translate(128, 132);
  drawGesture(g, m);
  const tex = new THREE.CanvasTexture(c);
  return new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.07, 0.07, 0.07), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
}

interface GolemView {
  root: THREE.Group;
  body: THREE.Group;
  legs: THREE.Object3D[];
  arms: THREE.Object3D[];
  eyes: THREE.MeshBasicMaterial;
  water: THREE.Mesh;
  phase: number;
}

export class WorldMarks {
  readonly group = new THREE.Group();
  private stones = new Map<string, { mat: THREE.MeshBasicMaterial; colour: THREE.Color; point: THREE.Vector3 }>();
  private golems = new Map<number, GolemView>();
  private stoneRings = new Map<number, THREE.Group>();
  private beacon!: THREE.Mesh;
  private beaconLight!: THREE.PointLight;
  private streaks!: THREE.Points;
  private streakPos!: Float32Array;
  private t = 0;
  private logProto!: THREE.Object3D;
  private rockProto!: THREE.Object3D;
  private tallProto!: THREE.Object3D;
  readonly ringPoint = new THREE.Vector3();

  async init(): Promise<void> {
    this.tallProto = await obj(`${NATURE}stone_tallA.glb`, 1);
    this.logProto = await obj(`${NATURE}log.glb`, 1);
    this.rockProto = await obj(`${NATURE}rock_smallA.glb`, 1);
    for (const gs of LAYOUT.glyphStones) {
      const y = terrainHeight(gs.x, gs.z);
      const st = this.tallProto.clone(true);
      st.scale.setScalar(3.2);
      st.position.set(gs.x, y - 0.1, gs.z);
      this.group.add(st);
      const mat = glyphFace(gs.miracle as Miracle);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), mat);
      // The face looks toward the village so it reads from the default view.
      const yaw = Math.atan2(LAYOUT.villageCentre.x - gs.x, LAYOUT.villageCentre.z - gs.z);
      face.position.set(gs.x + Math.sin(yaw) * 0.75, y + 1.9, gs.z + Math.cos(yaw) * 0.75);
      face.rotation.y = yaw;
      this.group.add(face);
      this.stones.set(gs.miracle, { mat, colour: new THREE.Color(MIRACLE_COLOUR[gs.miracle as Miracle]), point: face.position.clone() });
    }
    // The old golem ring: six low stones.
    const r = LAYOUT.golemForm;
    this.ringPoint.set(r.x, terrainHeight(r.x, r.z), r.z);
    const small = fitSize(await obj(`${NATURE}stone_smallC.glb`, 1), 1.1);
    for (let k = 0; k < 6; k += 1) {
      const a = (k / 6) * Math.PI * 2;
      const s = small.clone(true);
      const x = r.x + Math.cos(a) * 3.4;
      const z = r.z + Math.sin(a) * 3.4;
      s.position.set(x, terrainHeight(x, z) - 0.05, z);
      s.rotation.y = a;
      this.group.add(s);
    }
    // Beacon pillar.
    this.beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.6, 60, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.0, 1.2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    );
    this.beacon.visible = false;
    this.beaconLight = new THREE.PointLight(new THREE.Color("#fff2a8"), 0, 40, 1.2);
    this.group.add(this.beacon, this.beaconLight);
    // Wind streaks.
    this.streakPos = new Float32Array(160 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.streakPos, 3));
    this.streaks = new THREE.Points(geo, new THREE.PointsMaterial({ color: "#eef6ff", size: 0.35, transparent: true, opacity: 0.7, depthWrite: false }));
    this.streaks.visible = false;
    this.streaks.frustumCulled = false;
    this.group.add(this.streaks);
  }

  stonePoint(m: string): THREE.Vector3 | undefined {
    return this.stones.get(m)?.point;
  }

  /** Every golem mesh, for the hand's picking. */
  golemPickables(): THREE.Object3D[] {
    return [...this.golems.values()].map((g) => g.root);
  }

  private makeGolem(g: Golem): GolemView {
    const root = new THREE.Group();
    root.userData.golemId = g.id;
    const body = new THREE.Group();
    root.add(body);
    // Sized to stand a little taller than a villager's house door (about 3.8 m).
    const log = (len: number, thick: number, x: number, y: number, z: number) => {
      const l = fitLong(this.logProto, len, thick);
      l.position.set(x, y, z);
      return l;
    };
    // Torso: two upright logs; hips and shoulders: logs across; head: a rock; arms and legs: logs on pivots.
    body.add(log(1.9, 0.6, -0.33, 2.35, 0), log(1.9, 0.6, 0.33, 2.35, 0));
    const shoulders = log(1.9, 0.45, 0, 3.25, 0);
    shoulders.rotation.z = Math.PI / 2;
    const hips = log(1.3, 0.45, 0, 1.45, 0);
    hips.rotation.z = Math.PI / 2;
    body.add(shoulders, hips);
    const head = fitSize(this.rockProto, 0.95);
    head.position.set(0, 3.4, 0);
    body.add(head);
    const eyes = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.1, 0.08, 0.05) });
    for (const k of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), eyes);
      e.position.set(k * 0.2, 3.85, 0.45);
      body.add(e);
    }
    const legs: THREE.Object3D[] = [];
    const arms: THREE.Object3D[] = [];
    for (const k of [-1, 1]) {
      const legPivot = new THREE.Group();
      legPivot.position.set(k * 0.42, 1.45, 0);
      legPivot.add(log(1.5, 0.5, 0, -0.72, 0));
      root.add(legPivot);
      legs.push(legPivot);
      const armPivot = new THREE.Group();
      armPivot.position.set(k * 1.05, 3.2, 0);
      armPivot.add(log(1.7, 0.42, 0, -0.8, 0.05));
      body.add(armPivot);
      arms.push(armPivot);
    }
    const water = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), new THREE.MeshStandardMaterial({ color: "#5aa7e6", transparent: true, opacity: 0.75, roughness: 0.2 }));
    water.position.set(0, 2.2, 1.1);
    water.visible = false;
    body.add(water);
    root.traverse((o) => {
      o.castShadow = true;
    });
    // An invisible hit box so the hand can take hold of the whole body (the log limbs leave gaps).
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4, 2.4), new THREE.MeshBasicMaterial({ visible: false }));
    proxy.position.set(0, 2, 0.3);
    proxy.castShadow = false;
    root.add(proxy);
    this.group.add(root);
    return { root, body, legs, arms, eyes, water, phase: 0 };
  }

  update(world: World, dt: number): void {
    this.t += dt;
    const village = world.scenario === "village";
    this.group.visible = village;
    if (!village) return;
    for (const gs of world.glyphStones) {
      const v = this.stones.get(gs.miracle);
      if (!v) continue;
      const learned = world.learned.includes(gs.miracle);
      const k = gs.awake ? (learned ? 0.9 : 1.4 + Math.sin(this.t * 3) * 0.4) : 0.07;
      v.mat.color.copy(gs.awake ? v.colour : new THREE.Color(1, 1, 1)).multiplyScalar(k);
    }
    // Golems.
    const seen = new Set<number>();
    for (const g of world.golems) {
      seen.add(g.id);
      let v = this.golems.get(g.id);
      if (!v) {
        v = this.makeGolem(g);
        this.golems.set(g.id, v);
      }
      v.root.position.set(g.x, g.state === "held" ? g.y : terrainHeight(g.x, g.z), g.z);
      v.root.rotation.y = g.heading;
      const moving = ["walking", "carrying", "fetching"].includes(g.state);
      if (moving) v.phase += dt * 3.2;
      const swing = moving ? Math.sin(v.phase) * 0.5 : 0;
      v.legs[0].rotation.x = swing;
      v.legs[1].rotation.x = -swing;
      const carrying = g.carrying != null || g.carryWater;
      const armX = carrying ? -1.2 : g.state === "building" ? -0.6 + Math.sin(this.t * 6) * 0.6 : g.state === "dousing" ? -1.6 : -swing * 0.6;
      v.arms[0].rotation.x = armX;
      v.arms[1].rotation.x = g.state === "building" ? -0.6 - Math.sin(this.t * 6) * 0.6 : carrying ? -1.2 : swing * 0.6;
      // Dormant: slumped on its knees, eyes dark. Awake: upright, eyes glow.
      v.body.rotation.x = g.awake ? 0 : 0.5;
      v.body.position.y = g.awake ? 0 : -0.9;
      v.eyes.color.setRGB(g.awake ? 1.6 : 0.1, g.awake ? 1.1 : 0.08, g.awake ? 0.4 : 0.05);
      v.water.visible = g.carryWater;
    }
    for (const [id, v] of this.golems) {
      if (seen.has(id)) continue;
      this.group.remove(v.root);
      this.golems.delete(id);
    }
    // Stone Shape rings.
    const stoneSeen = new Set<number>();
    for (const sw of world.stoneworks) {
      stoneSeen.add(sw.id);
      if (this.stoneRings.has(sw.id)) continue;
      const ring = new THREE.Group();
      for (let k = 0; k < 8; k += 1) {
        const a = (k / 8) * Math.PI * 2 + sw.id;
        const x = sw.x + Math.cos(a) * sw.r;
        const z = sw.z + Math.sin(a) * sw.r;
        const s = this.tallProto.clone(true);
        s.scale.setScalar(1.6 + ((k * 7) % 3) * 0.2);
        s.position.set(x, terrainHeight(x, z) - 0.2, z);
        s.rotation.y = a;
        ring.add(s);
      }
      this.group.add(ring);
      this.stoneRings.set(sw.id, ring);
    }
    for (const [id, ring] of this.stoneRings) {
      if (stoneSeen.has(id)) continue;
      this.group.remove(ring);
      this.stoneRings.delete(id);
    }
    // Beacon.
    const b = world.beacon;
    this.beacon.visible = !!b;
    if (b) {
      const fade = Math.min(1, b.ttl / 90);
      (this.beacon.material as THREE.MeshBasicMaterial).opacity = (0.35 + Math.sin(this.t * 4) * 0.06) * fade;
      this.beacon.position.set(b.x, terrainHeight(b.x, b.z) + 30, b.z);
      this.beaconLight.position.set(b.x, terrainHeight(b.x, b.z) + 4, b.z);
      this.beaconLight.intensity = 40 * fade;
    } else this.beaconLight.intensity = 0;
    // Wind streaks.
    const gust = world.gust;
    this.streaks.visible = !!gust;
    if (gust) {
      const p = this.streakPos;
      for (let i = 0; i < 160; i += 1) {
        const s = (i * 0.618 + this.t * 0.7) % 1;
        const lane = ((i * 37) % 29) / 29 - 0.5;
        const along = (s - 0.5) * 28;
        const x = gust.x + gust.dx * along - gust.dz * lane * 18;
        const z = gust.z + gust.dz * along + gust.dx * lane * 18;
        p[i * 3] = x;
        p[i * 3 + 1] = terrainHeight(x, z) + 1 + ((i * 13) % 7) * 0.4;
        p[i * 3 + 2] = z;
      }
      (this.streaks.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  }
}
