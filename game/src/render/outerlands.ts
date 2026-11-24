// The lands beyond the valley (procedural, low-detail): ridge upon ridge fading into haze, so the miniature sits
// inside a world instead of floating in the sky. The stream leaves through a gorge to the north-west.
// Vertices on the valley's edge take the valley's own height, so the seam is closed; inside, the mesh tucks under.
import * as THREE from "three";
import { WORLD_SIZE } from "../config";
import { LAYOUT, terrainHeight } from "../sim/terrain";

const HALF = WORLD_SIZE / 2;
const FAR = 900;

function hash(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz);
  const b = hash(ix + 1, iz);
  const c = hash(ix, iz + 1);
  const d = hash(ix + 1, iz + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function ridges(x: number, z: number): number {
  let h = 0;
  let amp = 1;
  let f = 1 / 160;
  for (let o = 0; o < 4; o += 1) {
    h += (1 - Math.abs(noise(x * f, z * f) * 2 - 1)) * amp;
    amp *= 0.5;
    f *= 2.1;
  }
  return h / 1.875;
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Distance from the gorge that continues the stream beyond the valley edge. */
function gorge(x: number, z: number): number {
  const s = LAYOUT.stream;
  const dx = s.bx - s.ax;
  const dz = s.bz - s.az;
  const L = Math.hypot(dx, dz);
  const ux = dx / L;
  const uz = dz / L;
  const t = Math.max(0, (x - s.ax) * ux + (z - s.az) * uz);
  const px = s.ax + ux * t;
  const pz = s.az + uz * t;
  return Math.hypot(x - px, z - pz);
}

export function outerHeight(x: number, z: number): number {
  const ex = Math.max(-HALF, Math.min(HALF, x));
  const ez = Math.max(-HALF, Math.min(HALF, z));
  const base = terrainHeight(ex, ez);
  const d = Math.max(Math.abs(x), Math.abs(z)) - HALF; // metres beyond the edge
  if (d <= 0) return base;
  // Ridges rise beyond the rim, highest in the middle distance, then sink toward the horizon line.
  const rise = smooth(0, 90, d) * (18 + ridges(x, z) * 70) * (1 - 0.45 * smooth(350, FAR, d));
  let h = base + rise;
  const g = gorge(x, z);
  const cut = 1 - smooth(6, 26 + d * 0.08, g);
  h = h * (1 - cut) + -1.6 * cut;
  return h;
}

export function buildOuterLands(): THREE.Mesh {
  const coords: number[] = [];
  for (let v = -FAR; v < -HALF - 20; v += 30) coords.push(v);
  for (let v = -HALF - 20; v <= HALF + 20; v += 4) coords.push(v);
  for (let v = HALF + 20 + 30; v <= FAR; v += 30) coords.push(v);
  const n = coords.length;
  const pos = new Float32Array(n * n * 3);
  const col = new Float32Array(n * n * 3);
  const near = new THREE.Color("#a99a4c");
  const rock = new THREE.Color("#8d7d62");
  const haze = new THREE.Color("#a7a89a");
  const c = new THREE.Color();
  for (let j = 0; j < n; j += 1) {
    for (let i = 0; i < n; i += 1) {
      const x = coords[i];
      const z = coords[j];
      const inside = Math.abs(x) < HALF && Math.abs(z) < HALF;
      const h = inside ? terrainHeight(x, z) - 0.8 : outerHeight(x, z);
      const k = (j * n + i) * 3;
      pos[k] = x;
      pos[k + 1] = h;
      pos[k + 2] = z;
      const d = Math.max(0, Math.max(Math.abs(x), Math.abs(z)) - HALF);
      c.copy(near).lerp(rock, smooth(25, 70, h)).lerp(haze, smooth(120, 700, d));
      col[k] = c.r;
      col[k + 1] = c.g;
      col[k + 2] = c.b;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < n - 1; j += 1) {
    for (let i = 0; i < n - 1; i += 1) {
      // Skip quads wholly inside the valley (the real terrain covers them).
      const inner = Math.abs(coords[i]) <= HALF - 4 && Math.abs(coords[i + 1]) <= HALF - 4 && Math.abs(coords[j]) <= HALF - 4 && Math.abs(coords[j + 1]) <= HALF - 4;
      if (inner) continue;
      const a = j * n + i;
      const b = a + 1;
      const cc = a + n;
      const d = cc + 1;
      idx.push(a, cc, b, b, cc, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.name = "outer-lands";
  return mesh;
}

/** The gorge's water: the stream running out of the valley. */
export function gorgeWater(material: THREE.Material): THREE.Mesh {
  const s = LAYOUT.stream;
  const ang = Math.atan2(s.bx - s.ax, s.bz - s.az);
  const geo = new THREE.PlaneGeometry(40, 800, 1, 1);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, 400);
  const m = new THREE.Mesh(geo, material);
  m.rotation.y = ang;
  m.position.set(s.ax, 0.02, s.az);
  m.renderOrder = 1;
  return m;
}
