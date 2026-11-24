import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { LAYOUT } from "../sim/terrain";

export const SUN_DIR = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 24), THREE.MathUtils.degToRad(215));

export function buildEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer): { sun: THREE.DirectionalLight; water: Water } {
  const sky = new Sky();
  sky.scale.setScalar(1500);
  const u = sky.material.uniforms;
  u.turbidity.value = 6;
  u.rayleigh.value = 1.6;
  u.mieCoefficient.value = 0.006;
  u.mieDirectionalG.value = 0.86;
  u.sunPosition.value.copy(SUN_DIR);
  scene.add(sky);

  // Soft sky light comes from the hemisphere light below (a PMREM of the Sky shader rendered
  // black under SwiftShader and costs a cube render; the hemisphere is cheaper on an M1 Air).
  void renderer;

  scene.fog = new THREE.Fog(new THREE.Color("#e9c9a0"), 90, 260);

  const hemi = new THREE.HemisphereLight(new THREE.Color("#ffe9cc"), new THREE.Color("#6b7a45"), 1.35);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(new THREE.Color("#ffc58a"), 2.6);
  sun.position.copy(SUN_DIR).multiplyScalar(120);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -60;
  sc.right = 60;
  sc.top = 60;
  sc.bottom = -60;
  sc.near = 10;
  sc.far = 320;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  scene.add(sun.target);

  const water = new Water();
  scene.add(water.mesh);
  return { sun, water };
}

/** Keep the shadow frustum centred on what the camera is looking at. */
export function followSun(sun: THREE.DirectionalLight, focus: THREE.Vector3, dist: number): void {
  const extent = Math.min(70, Math.max(18, dist * 0.9));
  const sc = sun.shadow.camera;
  if (sc.right !== extent) {
    sc.left = -extent;
    sc.right = extent;
    sc.top = extent;
    sc.bottom = -extent;
    sc.updateProjectionMatrix();
  }
  sun.target.position.copy(focus);
  sun.position.copy(focus).addScaledVector(SUN_DIR, 150);
}

/** Pond + stream surface: a transparent sheet with two scrolling procedural normal maps. */
export class Water {
  readonly mesh: THREE.Mesh;
  private normalA: THREE.Texture;
  private normalB: THREE.Texture;

  constructor() {
    this.normalA = makeNormalTexture(1);
    this.normalB = makeNormalTexture(2);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#3f7f8a"),
      roughness: 0.12,
      metalness: 0,
      transmission: 0,
      transparent: true,
      opacity: 0.82,
      normalMap: this.normalA,
      normalScale: new THREE.Vector2(0.35, 0.35),
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      clearcoatNormalMap: this.normalB,
      clearcoatNormalScale: new THREE.Vector2(0.25, 0.25),
    });
    const p = LAYOUT.pond;
    const geo = new THREE.PlaneGeometry(90, 110, 1, 1);
    geo.rotateX(-Math.PI / 2);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(p.x - 14, 0.02, p.z + 30);
    this.mesh.receiveShadow = true;
    this.mesh.renderOrder = 1;
  }

  update(t: number): void {
    this.normalA.offset.set(t * 0.012, t * 0.008);
    this.normalB.offset.set(-t * 0.009, t * 0.014);
  }
}

function makeNormalTexture(seed: number): THREE.Texture {
  const s = 128;
  const data = new Uint8Array(s * s * 4);
  const h = (x: number, y: number) =>
    Math.sin((x * 0.19 + seed) * 1.3 + Math.sin(y * 0.11 * seed)) * 0.5 + Math.sin(y * 0.23 - x * 0.07 + seed * 2) * 0.5;
  for (let y = 0; y < s; y += 1) {
    for (let x = 0; x < s; x += 1) {
      const sx = (x / s) * Math.PI * 2 * 3;
      const sy = (y / s) * Math.PI * 2 * 3;
      const dx = Math.cos(sx + seed) * 0.5 + Math.cos(sx * 2 + sy) * 0.25 + h(x, y) * 0.05;
      const dy = Math.cos(sy - seed) * 0.5 + Math.cos(sy * 2 - sx) * 0.25;
      const k = (y * s + x) * 4;
      data[k] = 128 + dx * 90;
      data[k + 1] = 128 + dy * 90;
      data[k + 2] = 255;
      data[k + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, s, s);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(9, 11);
  t.needsUpdate = true;
  return t;
}
