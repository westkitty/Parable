import * as THREE from "three";
import { LAYOUT, pathDistance, terrainHeight } from "../sim/terrain";
import { NATURE, TOWN, loadGLB } from "./assets";

type Side = "E" | "N" | "W" | "S";
const SIDE_ROT: Record<Side, number> = { E: 0, N: Math.PI / 2, W: Math.PI, S: -Math.PI / 2 };

async function piece(name: string): Promise<THREE.Object3D> {
  const g = await loadGLB(`${TOWN}${name}.glb`);
  return g.scene.clone(true);
}

async function wall(group: THREE.Group, name: string, tx: number, tz: number, side: Side, y = 0): Promise<THREE.Object3D> {
  const p = await piece(name);
  const pivot = new THREE.Group();
  pivot.position.set(tx, y, tz);
  pivot.rotation.y = SIDE_ROT[side];
  pivot.add(p);
  group.add(pivot);
  return pivot;
}

export interface Buildings {
  group: THREE.Group;
  templeDoor: THREE.Vector3;
  temple: THREE.Group;
  woodpile: Woodpile;
}

export async function buildBuildings(): Promise<Buildings> {
  const group = new THREE.Group();
  group.add(await buildCottage());
  const temple = await buildTemple();
  group.add(temple);
  const woodpile = new Woodpile();
  await woodpile.init();
  group.add(woodpile.group);
  const t = LAYOUT.temple;
  return { group, temple, templeDoor: new THREE.Vector3(t.doorX, terrainHeight(t.doorX, t.doorZ), t.doorZ), woodpile };
}

async function buildCottage(): Promise<THREE.Group> {
  const c = LAYOUT.cottage;
  const S = 2.4;
  const house = new THREE.Group();
  const tiles: [number, number][] = [];
  for (const x of [-1, 0, 1]) for (const z of [-0.5, 0.5]) tiles.push([x, z]);
  // Long sides (±Z), short sides (±X). Door faces the yard and the woodpile (+Z).
  for (const x of [-1, 0, 1]) {
    await wall(house, x === 0 ? "wall-wood-door" : "wall-wood-window-shutters", x, 0.5, "S");
    await wall(house, x === 0 ? "wall-wood" : "wall-wood-window-shutters", x, -0.5, "N");
  }
  for (const z of [-0.5, 0.5]) {
    await wall(house, z > 0 ? "wall-wood-window-shutters" : "wall-wood", 1, z, "E");
    await wall(house, "wall-wood", -1, z, "W");
  }
  // Gabled roof running along X, gable ends on the short sides.
  for (const x of [-1, 0, 1]) {
    const name = x === 0 ? "roof-gable" : "roof-gable-end";
    const p = await piece(name);
    const pivot = new THREE.Group();
    pivot.position.set(x, 1, 0);
    pivot.rotation.y = x < 0 ? Math.PI : 0;
    pivot.scale.set(1, 1, 1.9);
    pivot.add(p);
    house.add(pivot);
  }
  const ch = await piece("chimney");
  ch.position.set(0.55, 1.05, -0.35);
  house.add(ch);
  // Floor so the interior never shows terrain through the door.
  const floor = new THREE.Mesh(new THREE.BoxGeometry(3, 0.08, 2), new THREE.MeshStandardMaterial({ color: "#8b6a48", roughness: 0.9 }));
  floor.position.y = 0.02;
  floor.receiveShadow = true;
  house.add(floor);
  const lantern = await piece("lantern");
  lantern.position.set(0.55, 0, 0.75);
  lantern.scale.setScalar(0.6);
  house.add(lantern);
  house.scale.setScalar(S);
  house.position.set(c.x, terrainHeight(c.x, c.z) - 0.05, c.z);
  house.rotation.y = -c.rot;
  house.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  // Fence along the yard edge (nature kit).
  const fenceG = await loadGLB(`${NATURE}fence_simple.glb`);
  const yard = new THREE.Group();
  for (let k = 0; k < 7; k += 1) {
    const f = fenceG.scene.clone(true);
    const x = c.x - 6 + k * 3.2;
    const z = c.z - 7;
    if (pathDistance(x, z) < 2.5) continue;
    f.position.set(x, terrainHeight(x, z), z);
    f.scale.setScalar(3.2);
    yard.add(f);
  }
  const g = new THREE.Group();
  g.add(house, yard);
  return g;
}

async function buildTemple(): Promise<THREE.Group> {
  const t = LAYOUT.temple;
  const S = 3.2;
  const temple = new THREE.Group();
  const sides: [Side, number, number][] = [];
  for (const x of [-1, 0, 1]) {
    sides.push(["S", x, 1], ["N", x, -1]);
  }
  for (const z of [-1, 0, 1]) {
    sides.push(["E", 1, z], ["W", -1, z]);
  }
  for (const [side, x, z] of sides) {
    const name = side === "S" && x === 0 ? "wall-doorway-round" : "wall";
    await wall(temple, name, x, z, side);
  }
  // Corner and door pillars.
  for (const [x, z] of [
    [-1.5, -1.5],
    [1.5, -1.5],
    [-1.5, 1.5],
    [1.5, 1.5],
    [-0.5, 1.55],
    [0.5, 1.55],
  ]) {
    const p = await piece("pillar-stone");
    p.position.set(x, 0, z);
    p.scale.set(2.2, 1.12, 2.2);
    temple.add(p);
  }
  // Stepped stone roof capped by a high point.
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(3.3, 0.16, 3.3),
    new THREE.MeshStandardMaterial({ color: "#b9ab94", roughness: 0.92 }),
  );
  cap.position.y = 1.06;
  temple.add(cap);
  const roof = await piece("roof-high-point");
  roof.position.set(0, 1.12, 0);
  roof.scale.set(3.1, 1.3, 3.1);
  temple.add(roof);
  for (const x of [-0.75, 0.75]) {
    const b = await piece("banner-red");
    const pivot = new THREE.Group();
    pivot.position.set(x, 0, 1.03);
    pivot.rotation.y = SIDE_ROT.S;
    pivot.add(b);
    temple.add(pivot);
    const l = await piece("lantern");
    l.position.set(x * 1.35, 0, 1.9);
    l.scale.setScalar(0.55);
    temple.add(l);
  }
  // Warm light spilling from the doorway.
  const glow = new THREE.PointLight(new THREE.Color("#ffb867"), 6, 9, 1.6);
  glow.position.set(0, 0.35, 1.1);
  temple.add(glow);
  temple.scale.setScalar(S);
  temple.position.set(t.x, terrainHeight(t.x, t.z) - 0.05, t.z);
  temple.rotation.y = Math.atan2(t.doorX - t.x, t.doorZ - t.z);
  temple.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  temple.name = "temple";
  return temple;
}

/** The woodpile grows by exactly one visible log per stacked log. */
export class Woodpile {
  readonly group = new THREE.Group();
  private logs: THREE.InstancedMesh[] = [];
  private shown = -1;
  private slots: THREE.Matrix4[] = [];

  async init(): Promise<void> {
    const w = LAYOUT.woodpile;
    const base = terrainHeight(w.x, w.z);
    const g = await loadGLB(`${NATURE}log.glb`);
    g.scene.updateMatrixWorld(true);
    const meshes: THREE.Mesh[] = [];
    g.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
    });
    const MAX = 40;
    for (const m of meshes) {
      const geo = m.geometry.clone();
      geo.applyMatrix4(m.matrixWorld);
      const inst = new THREE.InstancedMesh(geo, m.material as THREE.Material, MAX);
      inst.castShadow = true;
      inst.receiveShadow = true;
      inst.count = 0;
      this.logs.push(inst);
      this.group.add(inst);
    }
    // Pyramid rows of 5,4,3,2,1 then a second pile beside the first.
    const o = new THREE.Object3D();
    const rows = [5, 4, 3, 2, 1];
    for (let pile = 0; pile < 3; pile += 1) {
      rows.forEach((n, r) => {
        for (let k = 0; k < n; k += 1) {
          o.position.set(w.x + (k - (n - 1) / 2) * 0.58 + pile * 0.0, base + 0.02 + r * 0.48, w.z + pile * 2.5 - 1.2);
          o.rotation.set(0, Math.PI / 2 + (((k * 31 + r * 7) % 5) - 2) * 0.03, 0);
          o.scale.setScalar(3.2);
          o.updateMatrix();
          this.slots.push(o.matrix.clone());
        }
      });
    }
    // Rotate pile so logs lie along the cottage wall.
    this.group.position.set(0, 0, 0);
  }

  setCount(n: number): void {
    const c = Math.min(n, this.slots.length);
    if (c === this.shown) return;
    for (const inst of this.logs) {
      for (let i = 0; i < c; i += 1) inst.setMatrixAt(i, this.slots[i]);
      inst.count = c;
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
    }
    this.shown = c;
  }
}
