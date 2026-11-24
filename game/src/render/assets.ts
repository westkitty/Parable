import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const cache = new Map<string, Promise<GLTF>>();

export const NATURE = "assets/kenney-nature-kit/";
export const TOWN = "assets/kenney-fantasy-town-kit/";
export const CHARS = "assets/kenney-mini-characters/";

export function loadGLB(url: string): Promise<GLTF> {
  let p = cache.get(url);
  if (!p) {
    p = loader.loadAsync(url).then((g) => {
      g.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.castShadow = true;
        m.receiveShadow = true;
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        for (const mat of mats) {
          const s = mat as THREE.MeshStandardMaterial;
          // Kenney nature kit ships metallicFactor 1, which renders black without an env map.
          if ("metalness" in s) s.metalness = 0;
          if ("roughness" in s) s.roughness = Math.max(s.roughness, 0.8);
          if (s.color && !s.map) warmGreen(s.color);
        }
      });
      return g;
    });
    cache.set(url, p);
  }
  return p;
}

export interface MeshPart {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
  name: string;
}

/** Flatten a GLB into geometry+material parts with node transforms baked in (for instancing). */
export async function loadParts(url: string): Promise<MeshPart[]> {
  const g = await loadGLB(url);
  g.scene.updateMatrixWorld(true);
  const parts: MeshPart[] = [];
  g.scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    if (mats.length === 1) {
      const geo = m.geometry.clone();
      geo.applyMatrix4(m.matrixWorld);
      parts.push({ geometry: geo, material: (mats[0] as THREE.MeshStandardMaterial).clone(), name: mats[0].name });
    } else {
      for (const grp of m.geometry.groups) {
        const geo = m.geometry.clone();
        geo.clearGroups();
        const index = geo.index!;
        const arr = (index.array as Uint16Array | Uint32Array).slice(grp.start, grp.start + grp.count);
        geo.setIndex(new THREE.BufferAttribute(arr, 1));
        geo.applyMatrix4(m.matrixWorld);
        const mat = mats[grp.materialIndex ?? 0] as THREE.MeshStandardMaterial;
        parts.push({ geometry: geo, material: mat.clone(), name: mat.name });
      }
    }
  });
  return parts;
}

const hsl = { h: 0, s: 0, l: 0 };
/** Kenney's nature palette is teal; pull teal/cyan greens toward the warm meadow greens of a golden-hour valley. */
export function warmGreen(c: THREE.Color): void {
  c.getHSL(hsl);
  if (hsl.h > 0.36 && hsl.h < 0.56 && hsl.s > 0.25) {
    c.setHSL(0.24 + (hsl.h - 0.36) * 0.25, Math.min(0.62, hsl.s * 0.85), hsl.l * 0.92);
  }
}
