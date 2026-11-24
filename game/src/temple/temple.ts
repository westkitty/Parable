// The temple's front chamber: Save / Load / Restart as carved stone tablets touched with the hand.
// No words anywhere: each tablet carries a glyph (keep = closed spiral, return = open hand, renew = rising sun).
import * as THREE from "three";
import { Hand } from "../hand/hand";
import { TOWN, loadGLB } from "../render/assets";

export type TabletAction = "save" | "load" | "restart" | "door";

export class TempleChamber {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  readonly hand = new Hand();
  private tablets: { mesh: THREE.Mesh; action: TabletAction; glow: number }[] = [];
  private raycaster = new THREE.Raycaster();
  hovered: TabletAction | null = null;
  private t = 0;
  private torches: THREE.PointLight[] = [];

  async init(): Promise<void> {
    const s = this.scene;
    s.background = new THREE.Color("#120c08");
    s.fog = new THREE.Fog(new THREE.Color("#120c08"), 8, 22);
    s.add(new THREE.HemisphereLight(new THREE.Color("#ffd9a8"), new THREE.Color("#2a1c12"), 0.35));
    const stone = new THREE.MeshStandardMaterial({ color: "#a39377", roughness: 0.95, map: stoneTexture() });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), stone);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    s.add(floor);
    // Walls from the town kit's stone blocks, scaled to a tall room.
    const block = await loadGLB(`${TOWN}wall-block.glb`);
    const arch = await loadGLB(`${TOWN}wall-doorway-round.glb`);
    const pillar = await loadGLB(`${TOWN}pillar-stone.glb`);
    for (let i = -3; i <= 3; i += 1) {
      for (let k = 0; k < 2; k += 1) {
        const b = block.scene.clone(true);
        b.scale.set(2, 2.2, 1);
        b.position.set(i * 2, k * 2.2, -5);
        s.add(b);
        const side = block.scene.clone(true);
        side.scale.set(1, 2.2, 2);
        side.position.set(i < 0 ? -7 : 7, k * 2.2, Math.abs(i) * 2 - 4);
        if (i !== 0) s.add(side);
      }
    }
    for (const x of [-4.5, -1.5, 1.5, 4.5]) {
      const p = pillar.scene.clone(true);
      p.scale.set(4, 4.4, 4);
      p.position.set(x, 0, -4.3);
      s.add(p);
    }
    // The way back out: a lit archway on the left wall.
    const door = arch.scene.clone(true);
    const doorPivot = new THREE.Group();
    doorPivot.add(door);
    door.position.x = -0.45;
    doorPivot.scale.set(3.2, 3.2, 3.2);
    doorPivot.position.set(-6.4, 0, 0.5);
    s.add(doorPivot);
    const daylight = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 2.6),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.9) }),
    );
    daylight.position.set(-6.85, 1.3, 0.5);
    daylight.rotation.y = Math.PI / 2;
    s.add(daylight);
    this.tablets.push({ mesh: daylight, action: "door", glow: 0 });

    const glyphs: [TabletAction, (g: CanvasRenderingContext2D) => void][] = [
      ["save", drawSpiral],
      ["load", drawHand],
      ["restart", drawSun],
    ];
    glyphs.forEach(([action, draw], i) => {
      const glow = glyphTexture(draw, false);
      const carved = glyphTexture(draw, true);
      const mat = new THREE.MeshStandardMaterial({
        color: "#d8c7a4",
        roughness: 0.85,
        map: carved,
        emissive: new THREE.Color("#ffb453"),
        emissiveMap: glow,
        emissiveIntensity: 0.15,
      });
      const slab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.5, 0.35), [stone, stone, stone, stone, mat, stone]);
      slab.position.set((i - 1) * 3, 1.65, -3.6);
      slab.castShadow = true;
      s.add(slab);
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 0.8), stone);
      plinth.position.set((i - 1) * 3, 0.2, -3.6);
      s.add(plinth);
      this.tablets.push({ mesh: slab, action, glow: 0 });
    });
    for (const x of [-4.5, 0, 4.5]) {
      const l = new THREE.PointLight(new THREE.Color("#ff9e4a"), 9, 12, 1.5);
      l.position.set(x, 3.2, -2.5);
      s.add(l);
      this.torches.push(l);
    }
    this.camera.position.set(0, 1.9, 3.4);
    this.camera.lookAt(0, 1.5, -3.6);
    this.hand.group.scale.setScalar(0.6);
    s.add(this.hand.group);
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  pointer(ndc: THREE.Vector2): TabletAction | null {
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.tablets.map((t) => t.mesh), false);
    const hit = hits[0];
    this.hovered = hit ? (this.tablets.find((t) => t.mesh === hit.object)?.action ?? null) : null;
    // The hand floats just in front of whatever it points at.
    const p = hit ? hit.point.clone().add(this.raycaster.ray.direction.clone().multiplyScalar(-0.6)) : this.raycaster.ray.at(4, new THREE.Vector3());
    this.hand.group.position.copy(p).add(new THREE.Vector3(0, 0.15, 0));
    this.hand.group.rotation.set(-0.9, Math.PI, 0);
    this.hand.setPose(this.hovered ? "reach" : "open");
    return this.hovered;
  }

  /** Screen position of a tablet (for tests and the chamber's own hit testing). */
  tabletNdc(action: TabletAction): THREE.Vector2 {
    const t = this.tablets.find((x) => x.action === action)!;
    const p = t.mesh.getWorldPosition(new THREE.Vector3());
    if (action !== "door") p.z += 0.2;
    p.project(this.camera);
    return new THREE.Vector2(p.x, p.y);
  }

  update(dt: number): void {
    this.t += dt;
    for (const tb of this.tablets) {
      tb.glow += ((this.hovered === tb.action ? 1 : 0) - tb.glow) * Math.min(1, dt * 8);
      const mats = Array.isArray(tb.mesh.material) ? tb.mesh.material : [tb.mesh.material];
      const m = mats[4] as THREE.MeshStandardMaterial | undefined;
      if (m && "emissiveIntensity" in m && tb.action !== "door") m.emissiveIntensity = 0.15 + tb.glow * 1.4;
    }
    this.torches.forEach((l, i) => (l.intensity = 8 + Math.sin(this.t * 11 + i * 2) * 0.8 + Math.sin(this.t * 4.3 + i) * 0.6));
    this.hand.update(dt);
  }
}

function glyphTexture(draw: (g: CanvasRenderingContext2D) => void, carved: boolean): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 384;
  const g = c.getContext("2d")!;
  g.fillStyle = carved ? "#e8dcc4" : "#000";
  g.fillRect(0, 0, 256, 384);
  g.strokeStyle = carved ? "#4a3a2a" : "#fff";
  g.fillStyle = g.strokeStyle;
  g.lineWidth = 14;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.translate(128, 190);
  draw(g);
  // Carved border.
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.lineWidth = 6;
  g.strokeRect(18, 18, 220, 348);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  // The glyph is a dark groove in the colour map and glows through the emissive map on touch.
  return t;
}

function drawSpiral(g: CanvasRenderingContext2D): void {
  g.beginPath();
  for (let a = 0; a < Math.PI * 6; a += 0.05) {
    const r = 6 + a * 4.6;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (a === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  g.beginPath();
  g.arc(0, 0, 100, 0, Math.PI * 2);
  g.stroke();
}

function drawHand(g: CanvasRenderingContext2D): void {
  g.beginPath();
  g.ellipse(0, 40, 48, 58, 0, 0, Math.PI * 2);
  g.stroke();
  for (const [x, len] of [
    [-36, 70],
    [-12, 90],
    [12, 86],
    [34, 64],
  ]) {
    g.beginPath();
    g.moveTo(x, -10);
    g.lineTo(x * 1.15, -10 - len);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(-46, 40);
  g.lineTo(-92, 0);
  g.stroke();
  g.beginPath();
  g.moveTo(0, -150 + 270);
  g.lineTo(0, 150);
  g.stroke();
}

function drawSun(g: CanvasRenderingContext2D): void {
  g.beginPath();
  g.arc(0, 30, 52, Math.PI, 0);
  g.stroke();
  g.beginPath();
  g.moveTo(-110, 30);
  g.lineTo(110, 30);
  g.stroke();
  for (let k = 0; k < 7; k += 1) {
    const a = Math.PI + (k / 6) * Math.PI;
    g.beginPath();
    g.moveTo(Math.cos(a) * 72, 30 + Math.sin(a) * 72);
    g.lineTo(Math.cos(a) * 108, 30 + Math.sin(a) * 108);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(0, 70);
  g.lineTo(0, 140);
  g.moveTo(0, 100);
  g.lineTo(-26, 80);
  g.moveTo(0, 112);
  g.lineTo(26, 92);
  g.stroke();
}

function stoneTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#bdb09a";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i += 1) {
    const v = 150 + Math.floor(Math.random() * 70);
    g.fillStyle = `rgba(${v},${v - 8},${v - 20},0.35)`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 6, 2 + Math.random() * 6);
  }
  g.strokeStyle = "rgba(60,50,40,0.5)";
  g.lineWidth = 2;
  for (let y = 0; y <= 256; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y);
    g.stroke();
    for (let x = (y / 64) % 2 ? 0 : 64; x < 256; x += 128) {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x, y + 64);
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
