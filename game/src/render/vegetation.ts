import * as THREE from "three";
import { fireCellIndex } from "../sim/fire";
import { props, trees, type Tree } from "../sim/scenery";
import type { FireGrid } from "../sim/types";
import { NATURE, loadParts } from "./assets";

export const windUniform = { value: 0 };

/** Add a wind sway to a material: displacement grows with model-space height, phase from world position. */
function addWind(mat: THREE.Material, strength: number): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniform;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ip = instanceMatrix[3].xyz;
        #else
          vec3 ip = vec3(0.0);
        #endif
        float hgt = max(0.0, transformed.y);
        float ph = uTime * 1.25 + ip.x * 0.21 + ip.z * 0.17;
        transformed.x += (sin(ph) * 0.7 + sin(ph * 2.3) * 0.3) * ${strength.toFixed(3)} * hgt * hgt;
        transformed.z += cos(ph * 0.8) * ${(strength * 0.6).toFixed(3)} * hgt * hgt;`,
      );
  };
  mat.customProgramCacheKey = () => `wind${strength}`;
}

const LEAF = /leaf|leafs/i;
const TINTS = ["#ffffff", "#f2f7dc", "#e4f0d2", "#fff3d6"].map((c) => new THREE.Color(c));

interface TreeInstanceSet {
  parts: { mesh: THREE.InstancedMesh; leaf: boolean }[];
  trees: Tree[];
  cells: number[];
  state: Uint8Array; // 0 alive, 1 burning, 2 charred, 3 felled
  global: number[]; // index of each tree in trees()
}

export class Vegetation {
  readonly group = new THREE.Group();
  private sets: TreeInstanceSet[] = [];
  private tmp = new THREE.Object3D();
  private flicker = 0;

  async build(): Promise<void> {
    const all = trees();
    const kinds = [...new Set(all.map((t) => t.kind))];
    for (const kind of kinds) {
      const list = all.filter((t) => t.kind === kind);
      const parts = await loadParts(`${NATURE}${kind}.glb`);
      const set: TreeInstanceSet = { parts: [], trees: list, cells: list.map((t) => fireCellIndex(t.x, t.z)), state: new Uint8Array(list.length), global: list.map((t) => all.indexOf(t)) };
      for (const part of parts) {
        const leaf = LEAF.test(part.name);
        if (leaf) addWind(part.material, 0.035);
        const mesh = new THREE.InstancedMesh(part.geometry, part.material, list.length);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        list.forEach((t, i) => {
          this.place(t, 1);
          mesh.setMatrixAt(i, this.tmp.matrix);
          mesh.setColorAt(i, leaf ? TINTS[i % TINTS.length] : new THREE.Color("#ffffff"));
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
        this.group.add(mesh);
        set.parts.push({ mesh, leaf });
      }
      this.sets.push(set);
    }
    await this.buildProps();
    // Stumps for felled trees (Kenney stump), hidden until a woodcutter fells the tree.
    const stumpParts = await loadParts(`${NATURE}stump_old.glb`);
    for (const part of stumpParts) {
      const mesh = new THREE.InstancedMesh(part.geometry, part.material, all.length);
      mesh.castShadow = true;
      mesh.count = 0;
      this.group.add(mesh);
      this.stumps.push(mesh);
    }
  }

  private stumps: THREE.InstancedMesh[] = [];
  private felledShown = -1;

  private updateStumps(felled: number[]): void {
    if (felled.length === this.felledShown) return;
    this.felledShown = felled.length;
    const all = trees();
    felled.forEach((gi, k) => {
      const t = all[gi];
      this.tmp.position.set(t.x, t.y - 0.05, t.z);
      this.tmp.rotation.set(0, t.rot, 0);
      this.tmp.scale.setScalar(t.scale * 0.55);
      this.tmp.updateMatrix();
      for (const m of this.stumps) m.setMatrixAt(k, this.tmp.matrix);
    });
    for (const m of this.stumps) {
      m.count = felled.length;
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    }
  }

  private place(t: { x: number; y: number; z: number; rot: number; scale: number }, leafScale: number): void {
    this.tmp.position.set(t.x, t.y - 0.05, t.z);
    this.tmp.rotation.set(0, t.rot, 0);
    this.tmp.scale.set(t.scale * leafScale, t.scale * (leafScale < 1 ? 0.7 + leafScale * 0.3 : 1), t.scale * leafScale);
    this.tmp.updateMatrix();
  }

  private async buildProps(): Promise<void> {
    const list = props();
    const kinds = [...new Set(list.map((p) => p.kind))];
    for (const kind of kinds) {
      const items = list.filter((p) => p.kind === kind);
      const parts = await loadParts(`${NATURE}${kind}.glb`);
      const sway = /grass|flower|bush|crops/.test(kind);
      for (const part of parts) {
        if (sway) addWind(part.material, kind.startsWith("grass") ? 0.6 : 0.25);
        const mesh = new THREE.InstancedMesh(part.geometry, part.material, items.length);
        mesh.castShadow = !kind.startsWith("grass") && !kind.startsWith("flower");
        mesh.receiveShadow = true;
        items.forEach((p, i) => {
          this.tmp.position.set(p.x, p.y - 0.03, p.z);
          this.tmp.rotation.set(0, p.rot, 0);
          this.tmp.scale.setScalar(p.scale);
          this.tmp.updateMatrix();
          mesh.setMatrixAt(i, this.tmp.matrix);
          if (LEAF.test(part.name) || /grass/.test(kind)) mesh.setColorAt(i, TINTS[(i * 7) % TINTS.length]);
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
        this.group.add(mesh);
      }
    }
  }

  /** Burning trees glow and lose leaves; burnt-out trees stand charred and bare. */
  updateFire(f: FireGrid, dt: number, felled: number[] = []): void {
    this.flicker += dt;
    this.updateStumps(felled);
    const felledSet = felled.length ? new Set(felled) : null;
    const burnCol = new THREE.Color();
    for (const set of this.sets) {
      let changed = false;
      set.trees.forEach((t, i) => {
        const c = set.cells[i];
        const s = felledSet?.has(set.global[i]) ? 3 : c < 0 ? 0 : f.burn[c] > 0 ? 1 : f.scorched[c] ? 2 : 0;
        if (s === set.state[i] && s !== 1) return;
        changed = true;
        for (const { mesh, leaf } of set.parts) {
          if (s === 3) {
            this.place(t, 0.001);
            this.tmp.scale.setScalar(0.0001);
            this.tmp.updateMatrix();
            burnCol.set("#ffffff");
          } else if (s === 1) {
            const k = 0.5 + 0.5 * Math.sin(this.flicker * 13 + i * 1.7);
            const remain = c >= 0 ? f.burn[c] / 180 : 1;
            if (leaf) {
              burnCol.setRGB(1.6 + k * 0.6, 0.55 + k * 0.25, 0.12);
              this.place(t, 0.4 + 0.6 * Math.max(0, remain));
            } else {
              burnCol.setRGB(0.35, 0.18, 0.1);
              this.place(t, 1);
            }
          } else if (s === 2) {
            burnCol.setRGB(0.09, 0.075, 0.065);
            this.place(t, leaf ? 0.001 : 1);
          } else {
            burnCol.set(leaf ? TINTS[i % TINTS.length] : "#ffffff");
            this.place(t, 1);
          }
          mesh.setMatrixAt(i, this.tmp.matrix);
          mesh.setColorAt(i, burnCol);
        }
        set.state[i] = s;
      });
      if (changed)
        for (const { mesh } of set.parts) {
          mesh.instanceMatrix.needsUpdate = true;
          if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        }
    }
  }
}
