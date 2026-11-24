import * as THREE from "three";
import { WORLD_SIZE } from "../config";
import { fireCellIndex } from "../sim/fire";
import { LAYOUT, fbm, pathDistance, terrainHeight } from "../sim/terrain";
import type { FireGrid } from "../sim/types";

const RES = 1; // metres per vertex
const N = WORLD_SIZE / RES + 1;

export class TerrainView {
  readonly mesh: THREE.Mesh;
  private base: Float32Array;
  private colors: THREE.BufferAttribute;
  private cellOfVertex: Int32Array;
  private lastScorch = new Uint8Array(0);
  private lastBurn = new Uint8Array(0);

  constructor() {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, N - 1, N - 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const count = pos.count;
    this.base = new Float32Array(count * 3);
    this.cellOfVertex = new Int32Array(count);
    const col = new THREE.Color();
    const grassA = new THREE.Color("#7fa04a");
    const grassB = new THREE.Color("#a7b456");
    const meadow = new THREE.Color("#b9b95e");
    const groveFloor = new THREE.Color("#5b6e33");
    const dirt = new THREE.Color("#a8835a");
    const sand = new THREE.Color("#cdb88a");
    const mud = new THREE.Color("#6f6a4e");
    const stone = new THREE.Color("#b3a58e");
    const hill = new THREE.Color("#8a9a4f");
    for (let i = 0; i < count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);
      const n = fbm(x * 1.7 + 40, z * 1.7 - 13);
      col.copy(grassA).lerp(grassB, Math.min(1, Math.max(0, n * 1.6 - 0.3)));
      const dm = Math.hypot(x - LAYOUT.meadow.x, z - LAYOUT.meadow.z);
      if (dm < 20) col.lerp(meadow, (1 - dm / 20) * 0.55);
      const dg = Math.hypot(x - LAYOUT.grove.x, z - LAYOUT.grove.z);
      if (dg < LAYOUT.grove.r + 4) col.lerp(groveFloor, Math.min(1, (LAYOUT.grove.r + 4 - dg) / 5) * 0.75);
      if (h > 4) col.lerp(hill, Math.min(1, (h - 4) / 10) * 0.6);
      const pd = pathDistance(x, z);
      if (pd < 2.2) col.lerp(dirt, Math.min(1, (2.2 - pd) / 1.2) * (0.75 + n * 0.3));
      if (h < 0.9) col.lerp(sand, Math.min(1, (0.9 - h) / 0.6));
      if (h < 0.05) col.lerp(mud, Math.min(1, -h / 1.2 + 0.4));
      const dt = Math.hypot(x - LAYOUT.temple.x, z - LAYOUT.temple.z);
      if (dt < 9.5) col.lerp(stone, Math.min(1, (9.5 - dt) / 1.5));
      this.base[i * 3] = col.r;
      this.base[i * 3 + 1] = col.g;
      this.base[i * 3 + 2] = col.b;
      this.cellOfVertex[i] = fireCellIndex(Math.min(x, 79.9), Math.min(z, 79.9));
    }
    geo.computeVertexNormals();
    this.colors = new THREE.BufferAttribute(this.base.slice(), 3);
    geo.setAttribute("color", this.colors);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
  }

  /** Repaint scorched (and glowing, burning) cells when the fire grid changes. */
  updateFire(f: FireGrid): void {
    if (this.lastScorch.length !== f.scorched.length) {
      this.lastScorch = new Uint8Array(f.scorched.length).fill(255);
      this.lastBurn = new Uint8Array(f.burn.length).fill(255);
    }
    let dirty = false;
    for (let i = 0; i < f.scorched.length; i += 1) {
      const s = f.scorched[i] ? 1 : 0;
      const b = f.burn[i] > 0 ? 1 : 0;
      if (s !== this.lastScorch[i] || b !== this.lastBurn[i]) dirty = true;
      this.lastScorch[i] = s;
      this.lastBurn[i] = b;
    }
    if (!dirty) return;
    const arr = this.colors.array as Float32Array;
    for (let v = 0; v < this.cellOfVertex.length; v += 1) {
      const c = this.cellOfVertex[v];
      let r = this.base[v * 3];
      let g = this.base[v * 3 + 1];
      let b = this.base[v * 3 + 2];
      if (c >= 0 && f.burn[c] > 0) {
        r = 0.42;
        g = 0.16;
        b = 0.05;
      } else if (c >= 0 && f.scorched[c]) {
        const k = 0.17 + ((v * 2654435761) >>> 0) / 4294967296 * 0.06;
        r = r * 0.12 + k;
        g = g * 0.1 + k * 0.92;
        b = b * 0.08 + k * 0.85;
      }
      arr[v * 3] = r;
      arr[v * 3 + 1] = g;
      arr[v * 3 + 2] = b;
    }
    this.colors.needsUpdate = true;
  }
}

export const TERRAIN_RES = RES;
