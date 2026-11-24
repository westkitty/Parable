// Rain clouds, Sanctuary domes and lightning. All procedural (Three.js primitives and particles),
// styled to sit with the low-poly Kenney valley.
import * as THREE from "three";
import { RAIN_RADIUS } from "../config";
import { terrainHeight } from "../sim/terrain";
import type { World } from "../sim/types";
import { Particles } from "./particles";

const CLOUD_HEIGHT = 13;

export class MiracleViews {
  readonly group = new THREE.Group();
  readonly rain = new Particles(2400, THREE.NormalBlending, 0.02);
  private clouds = new Map<number, THREE.Group>();
  private domes = new Map<number, THREE.Group>();
  private puffGeo = new THREE.IcosahedronGeometry(1, 1);
  private cloudMat = new THREE.MeshStandardMaterial({ color: "#d9dee4", roughness: 1, flatShading: true, transparent: true, opacity: 0.94 });
  private bolt: THREE.Line | null = null;
  private boltT = 0;
  private flash = new THREE.PointLight(new THREE.Color("#cfe4ff"), 0, 160, 1);
  private t = 0;

  constructor(scene: THREE.Scene) {
    scene.add(this.group, this.rain.points, this.flash);
  }

  /** Position of a held cloud follows the hand (set by the caller before update). */
  update(world: World, dt: number): void {
    this.t += dt;
    const live = new Set<number>();
    for (const c of world.clouds) {
      live.add(c.id);
      let g = this.clouds.get(c.id);
      if (!g) {
        g = new THREE.Group();
        for (let k = 0; k < 9; k += 1) {
          const m = new THREE.Mesh(this.puffGeo, this.cloudMat);
          const a = (k / 9) * Math.PI * 2;
          const r = k === 0 ? 0 : 2.2 + (k % 3) * 0.9;
          m.position.set(Math.cos(a) * r, (k % 2) * 0.6, Math.sin(a) * r * 0.8);
          m.scale.setScalar(k === 0 ? 3.2 : 2 + (k % 3) * 0.5);
          m.castShadow = true;
          g.add(m);
        }
        this.group.add(g);
        this.clouds.set(c.id, g);
      }
      const ground = Math.max(terrainHeight(c.x, c.z), 0);
      g.position.lerp(new THREE.Vector3(c.x, ground + CLOUD_HEIGHT, c.z), g.position.lengthSq() ? Math.min(1, dt * 6) : 1);
      const fade = Math.min(1, c.ttl / 40);
      g.scale.setScalar(0.4 + 0.6 * fade);
      // Rain: grey-blue streaks falling to the ground under the cloud.
      for (let n = 0; n < 26; n += 1) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * RAIN_RADIUS * 0.9;
        this.rain.emit(g.position.x + Math.cos(a) * r, g.position.y - 1, g.position.z + Math.sin(a) * r, 0, -22, 0, 0.32, 0.55, 0.55, 0.66, 0.82, 0.75, 0);
      }
    }
    for (const [id, g] of this.clouds) if (!live.has(id)) {
      this.group.remove(g);
      this.clouds.delete(id);
    }
    // Sanctuary: a pale gold dome with a bright rim on the ground.
    const liveD = new Set<number>();
    for (const s of world.sanctuaries) {
      liveD.add(s.id);
      let g = this.domes.get(s.id);
      if (!g) {
        g = new THREE.Group();
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            uniforms: { uT: { value: 0 }, uA: { value: 1 } },
            vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
              void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition-wp.xyz); vY = position.y; gl_Position = projectionMatrix*viewMatrix*wp; }`,
            fragmentShader: `uniform float uT; uniform float uA; varying vec3 vN; varying vec3 vV; varying float vY;
              void main(){ float f = pow(1.0-abs(dot(vN,vV)),2.2); float bands = 0.5+0.5*sin(vY*18.0-uT*2.0);
                vec3 c = vec3(1.0,0.82,0.45)*(0.12+f*0.9+bands*0.05); gl_FragColor = vec4(c*uA, (0.08+f*0.7)*uA); }`,
          }),
        );
        g.add(dome);
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1.02, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.6, 0.8), transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        g.add(ring);
        this.group.add(g);
        this.domes.set(s.id, g);
      }
      g.position.set(s.x, Math.max(terrainHeight(s.x, s.z), 0), s.z);
      g.scale.setScalar(s.r);
      const mat = (g.children[0] as THREE.Mesh).material as THREE.ShaderMaterial;
      mat.uniforms.uT.value = this.t;
      mat.uniforms.uA.value = Math.min(1, s.ttl / 60);
    }
    for (const [id, g] of this.domes) if (!liveD.has(id)) {
      this.group.remove(g);
      this.domes.delete(id);
    }
    this.rain.update(dt);
    // Lightning bolt fades.
    if (this.bolt) {
      this.boltT -= dt;
      (this.bolt.material as THREE.LineBasicMaterial).opacity = Math.max(0, this.boltT / 0.5);
      this.flash.intensity = Math.max(0, this.boltT / 0.5) * 900;
      if (this.boltT <= 0) {
        this.group.remove(this.bolt);
        this.bolt = null;
      }
    }
  }

  strike(x: number, z: number): void {
    const y0 = Math.max(terrainHeight(x, z), 0);
    const pts: THREE.Vector3[] = [];
    let px = x;
    let pz = z;
    for (let k = 0; k <= 12; k += 1) {
      pts.push(new THREE.Vector3(px, y0 + 60 - k * 5, pz));
      px = x + (Math.random() - 0.5) * 4 * (1 - k / 12);
      pz = z + (Math.random() - 0.5) * 4 * (1 - k / 12);
    }
    pts[pts.length - 1].set(x, y0, z);
    if (this.bolt) this.group.remove(this.bolt);
    this.bolt = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(3, 3, 3.5), transparent: true, opacity: 1 }));
    this.group.add(this.bolt);
    this.boltT = 0.5;
    this.flash.position.set(x, y0 + 20, z);
  }

  setViewport(h: number, fov: number): void {
    this.rain.setViewportHeight(h, fov);
  }
}
