import * as THREE from "three";

/** One draw call for many soft round particles (flames, smoke, embers, the golden trace). */
export class Particles {
  readonly points: THREE.Points;
  private pos: Float32Array;
  private col: Float32Array;
  private size: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private maxLife: Float32Array;
  private baseSize: Float32Array;
  private baseCol: Float32Array;
  private grow: Float32Array;
  private next = 0;
  private geo: THREE.BufferGeometry;

  constructor(
    readonly capacity: number,
    blending: THREE.Blending,
    private fadeIn = 0.15,
  ) {
    this.pos = new Float32Array(capacity * 3);
    this.col = new Float32Array(capacity * 4);
    this.size = new Float32Array(capacity);
    this.vel = new Float32Array(capacity * 3);
    this.life = new Float32Array(capacity);
    this.maxLife = new Float32Array(capacity);
    this.baseSize = new Float32Array(capacity);
    this.baseCol = new Float32Array(capacity * 4);
    this.grow = new Float32Array(capacity);
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute("color", new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute("size", new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 400 } },
      vertexShader: `
        attribute float size; attribute vec4 color; varying vec4 vColor; uniform float uScale;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uScale / max(0.1, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec4 vColor;
        void main() {
          vec2 d = gl_PointCoord - 0.5;
          float r = length(d) * 2.0;
          float a = smoothstep(1.0, 0.0, r);
          a *= a;
          if (a * vColor.a < 0.003) discard;
          gl_FragColor = vec4(vColor.rgb, vColor.a * a);
        }`,
      transparent: true,
      depthWrite: false,
      blending,
    });
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
  }

  setViewportHeight(px: number, fovDeg: number): void {
    (this.points.material as THREE.ShaderMaterial).uniforms.uScale.value = px / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
  }

  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number, life: number, r: number, g: number, b: number, a: number, grow = 0): void {
    const i = this.next;
    this.next = (this.next + 1) % this.capacity;
    this.pos.set([x, y, z], i * 3);
    this.vel.set([vx, vy, vz], i * 3);
    this.life[i] = life;
    this.maxLife[i] = life;
    this.baseSize[i] = size;
    this.grow[i] = grow;
    this.baseCol.set([r, g, b, a], i * 4);
  }

  clear(): void {
    this.life.fill(0);
  }

  update(dt: number): void {
    for (let i = 0; i < this.capacity; i += 1) {
      if (this.life[i] <= 0) {
        this.col[i * 4 + 3] = 0;
        this.size[i] = 0;
        continue;
      }
      this.life[i] -= dt;
      const t = 1 - Math.max(0, this.life[i]) / this.maxLife[i]; // 0..1 age
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      const fade = Math.min(1, t / this.fadeIn) * (1 - t);
      this.col[i * 4] = this.baseCol[i * 4];
      this.col[i * 4 + 1] = this.baseCol[i * 4 + 1] * (1 - t * 0.5);
      this.col[i * 4 + 2] = this.baseCol[i * 4 + 2];
      this.col[i * 4 + 3] = this.baseCol[i * 4 + 3] * fade;
      this.size[i] = this.baseSize[i] * (1 + this.grow[i] * t);
    }
    (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
  }
}
