// The divine hand: original procedural art (no verified CC0 hand model was found).
// A stylised right hand — rounded palm, three-jointed capsule fingers, opposed thumb, warm skin
// with a faint inner glow — posed open / reach / grip. Visual only: targeting never reads the
// eased hand position (see input/controller.ts).
import * as THREE from "three";

export type HandPose = "open" | "reach" | "grip";

interface Finger {
  root: THREE.Group;
  joints: THREE.Group[];
  curlScale: number;
}

const POSE_CURL: Record<HandPose, number> = { open: 0.12, reach: 0.45, grip: 1.0 };

export class Hand {
  readonly group = new THREE.Group();
  private pivot = new THREE.Group();
  private fingers: Finger[] = [];
  private thumb!: Finger;
  private curl = POSE_CURL.open;
  private targetCurl = POSE_CURL.open;
  private glowMat: THREE.SpriteMaterial;
  private skin: THREE.MeshStandardMaterial;
  private glow: THREE.Sprite;
  private armed = 0;
  private time = 0;

  constructor() {
    this.skin = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f0c3a0"),
      roughness: 0.55,
      metalness: 0,
      emissive: new THREE.Color("#ffcf8a"),
      emissiveIntensity: 0.12,
    });
    const nail = new THREE.MeshStandardMaterial({ color: "#f7dccb", roughness: 0.3, metalness: 0 });
    this.group.add(this.pivot);
    // Palm: a squashed rounded capsule lying along the hand's length (+Z = toward fingertips).
    const palmGeo = new THREE.CapsuleGeometry(0.42, 0.42, 6, 16);
    palmGeo.rotateX(Math.PI / 2);
    palmGeo.scale(1.12, 0.48, 1);
    const palm = new THREE.Mesh(palmGeo, this.skin);
    palm.castShadow = true;
    this.pivot.add(palm);
    // Wrist and a hint of sleeve-less forearm fading upward.
    const wristGeo = new THREE.CapsuleGeometry(0.27, 0.9, 6, 14);
    wristGeo.rotateX(Math.PI / 2);
    const wrist = new THREE.Mesh(wristGeo, this.skin);
    wrist.position.set(0, 0.22, -0.95);
    wrist.rotation.x = -0.45;
    wrist.castShadow = true;
    this.pivot.add(wrist);

    const specs = [
      { x: 0.33, len: 0.3, r: 0.085 }, // index (thumb side)
      { x: 0.11, len: 0.36, r: 0.095 }, // middle
      { x: -0.12, len: 0.34, r: 0.092 }, // ring
      { x: -0.33, len: 0.27, r: 0.08 }, // little
    ];
    for (const s of specs) this.fingers.push(this.makeFinger(s.len, s.r, nail, new THREE.Vector3(s.x, 0, 0.6), 1));
    // Right hand, palm down, fingers pointing away from the camera: the hand faces along camera
    // forward, so local +X is screen-left — where a right thumb sits.
    this.thumb = this.makeFinger(0.26, 0.1, nail, new THREE.Vector3(0.5, -0.06, 0.05), 0.8);
    this.thumb.root.rotation.set(0.1, 0.95, -0.35);

    this.glowMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      color: new THREE.Color("#ffd58a"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.35,
    });
    this.glow = new THREE.Sprite(this.glowMat);
    this.glow.scale.setScalar(3.2);
    this.glow.position.set(0, 0.1, 0.25);
    this.pivot.add(this.glow);
    this.group.scale.setScalar(1.25);
  }

  private makeFinger(len: number, r: number, nail: THREE.Material, at: THREE.Vector3, curlScale: number): Finger {
    const root = new THREE.Group();
    root.position.copy(at);
    this.pivot.add(root);
    const joints: THREE.Group[] = [];
    let parent: THREE.Object3D = root;
    const lens = [len, len * 0.72, len * 0.58];
    for (let k = 0; k < 3; k += 1) {
      const j = new THREE.Group();
      parent.add(j);
      const g = new THREE.CapsuleGeometry(r * (1 - k * 0.1), lens[k], 4, 10);
      g.rotateX(Math.PI / 2);
      g.translate(0, 0, lens[k] / 2 + r * 0.4);
      const m = new THREE.Mesh(g, this.skin);
      m.castShadow = true;
      j.add(m);
      if (k === 2) {
        const n = new THREE.Mesh(new THREE.SphereGeometry(r * 0.62, 10, 6), nail);
        n.scale.set(1, 0.4, 1.2);
        n.position.set(0, r * 0.55, lens[k] * 0.8 + r * 0.3);
        j.add(n);
      }
      joints.push(j);
      const next = new THREE.Group();
      next.position.z = lens[k] + r * 0.55;
      j.add(next);
      parent = next;
    }
    return { root, joints, curlScale };
  }

  setPose(pose: HandPose): void {
    this.targetCurl = POSE_CURL[pose];
  }

  /** 0..1 golden ritual glow while the spiral has armed the ritual. */
  setArmed(level: number): void {
    this.armed = level;
  }

  update(dt: number): void {
    this.time += dt;
    this.curl += (this.targetCurl - this.curl) * Math.min(1, dt * 14);
    const all = [...this.fingers, this.thumb];
    all.forEach((f, i) => {
      const spread = this.curl < 0.3 ? (i - 1.5) * 0.06 : 0;
      if (f !== this.thumb) f.root.rotation.y = spread;
      const breathe = Math.sin(this.time * 1.7 + i) * 0.03;
      f.joints[0].rotation.x = (0.25 + this.curl * 1.15) * f.curlScale + breathe;
      f.joints[1].rotation.x = (0.15 + this.curl * 1.35) * f.curlScale;
      f.joints[2].rotation.x = (0.1 + this.curl * 0.9) * f.curlScale;
    });
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 6);
    this.glowMat.opacity = 0.28 + this.armed * (0.45 + 0.25 * pulse);
    this.glowMat.color.set(this.armed > 0 ? "#ffb347" : "#ffe2a8");
    this.skin.emissiveIntensity = 0.1 + this.armed * 0.35 * (0.6 + 0.4 * pulse);
    // Gentle idle hover bob.
    this.pivot.position.y = Math.sin(this.time * 2.1) * 0.05;
  }
}

function makeGlowTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
