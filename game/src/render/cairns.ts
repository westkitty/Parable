import * as THREE from "three";
import { terrainHeight } from "../sim/terrain";

/** One villager who died in an earlier Dry Year, where they fell. */
export interface Fallen {
  name: string;
  cause: string;
  x: number;
  z: number;
  year: number;
}

/**
 * The land remembers: a small cairn of stacked field stones (procedural low-poly stones, not a Kenney
 * model) where each villager fell in an earlier year. Hovering the hand over one names them.
 */
export class Cairns {
  readonly group = new THREE.Group();
  private fallen: Fallen[] = [];
  private readonly stone = new THREE.DodecahedronGeometry(1, 0);
  private readonly mats = [new THREE.MeshLambertMaterial({ color: "#8e8778", flatShading: true }), new THREE.MeshLambertMaterial({ color: "#a39b88", flatShading: true }), new THREE.MeshLambertMaterial({ color: "#b8b09a", flatShading: true })];

  set(fallen: Fallen[]): void {
    for (const c of [...this.group.children]) this.group.remove(c);
    this.fallen = fallen;
    fallen.forEach((f, k) => {
      const cairn = new THREE.Group();
      const y = Math.max(terrainHeight(f.x, f.z), 0);
      let h = 0;
      const sizes = [0.95, 0.78, 0.6, 0.44, 0.3];
      sizes.forEach((r, i) => {
        const m = new THREE.Mesh(this.stone, this.mats[(i + k) % 3]);
        m.scale.set(r * 1.15, r * 0.7, r);
        m.rotation.set(0.2 * i, (k * 1.7 + i * 2.1) % 6.28, 0.15 * (i % 2));
        m.position.set(0.06 * Math.sin(k + i), h + r * 0.6, 0.06 * Math.cos(k * 2 + i));
        m.castShadow = true;
        h += r * 1.05;
        cairn.add(m);
      });
      cairn.position.set(f.x, y, f.z);
      cairn.userData.fallen = k;
      this.group.add(cairn);
    });
  }

  /** The cairn nearest the hand's touch point within reach, if any. */
  near(x: number, z: number, reach: number): { fallen: Fallen; top: THREE.Vector3 } | null {
    let best = -1;
    let bd = reach;
    this.fallen.forEach((f, k) => {
      const d = Math.hypot(f.x - x, f.z - z);
      if (d < bd) [bd, best] = [d, k];
    });
    if (best < 0) return null;
    const f = this.fallen[best];
    return { fallen: f, top: new THREE.Vector3(f.x, Math.max(terrainHeight(f.x, f.z), 0) + 3.6, f.z) };
  }
}

/** Gather every fallen villager from the temple records (oldest first), at most `max`. */
export function fallenFromRecords(records: { fallen?: { name: string; cause: string; x: number; z: number }[] }[], max = 36): Fallen[] {
  const out: Fallen[] = [];
  records.forEach((r, i) => {
    for (const f of r.fallen ?? []) out.push({ ...f, year: i + 1 });
  });
  return out.slice(-max);
}
