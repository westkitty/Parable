// The village's buildings and works: houses (standing, burning, ruined, rising), the building site,
// the wheat field, granary, well, the painted wall, and the old shrine. Kenney CC0 pieces, except
// where noted as procedural (the mural painting, the shrine glyph, scaffold glow).
import * as THREE from "three";
import { LAYOUT, terrainHeight } from "../sim/terrain";
import type { World } from "../sim/types";
import { NATURE, TOWN, loadGLB, loadParts } from "./assets";
import { buildHouse, cottageView, type HouseView } from "./buildings";

const CHAR = new THREE.Color("#2a211b");

async function obj(url: string, scale: number): Promise<THREE.Object3D> {
  const g = await loadGLB(url);
  const o = g.scene.clone(true);
  o.scale.setScalar(scale);
  o.traverse((c) => {
    c.castShadow = true;
    c.receiveShadow = true;
  });
  return o;
}

interface HouseSlot {
  id: number;
  view: HouseView;
  shown: string;
  baseColors: THREE.Color[];
  scaffold: THREE.Group | null;
}

export class VillageView {
  readonly group = new THREE.Group();
  private houses = new Map<number, HouseSlot>();
  private wheat: { mesh: THREE.InstancedMesh; ears: boolean }[] = [];
  private wheatKey = "";
  private sacks!: THREE.InstancedMesh[];
  private sackSlots: THREE.Matrix4[] = [];
  private shownFood = -1;
  private muralCanvas!: HTMLCanvasElement;
  private muralTex!: THREE.CanvasTexture;
  private muralShown = -1;
  private muralGlow!: THREE.MeshBasicMaterial;
  private shrineGlyph!: THREE.Mesh;
  private shrineLight = new THREE.PointLight(new THREE.Color("#7fc8ff"), 0, 14, 1.4);
  private wellWater: THREE.Mesh | null = null;
  private t = 0;
  readonly muralPoint = new THREE.Vector3();
  readonly shrinePoint = new THREE.Vector3();

  async init(world: World): Promise<void> {
    if (cottageView) this.houses.set(0, this.slot(0, cottageView));
    for (let i = 1; i < LAYOUT.houses.length; i += 1) {
      const h = LAYOUT.houses[i];
      const v = await buildHouse(h.x, h.z, h.rot, i);
      this.group.add(v.group);
      this.houses.set(i, this.slot(i, v));
    }
    // The house the villagers are building.
    const s = LAYOUT.site;
    const sv = await buildHouse(s.x, s.z, s.rot, 3);
    this.group.add(sv.group);
    const siteSlot = this.slot(LAYOUT.houses.length, sv);
    siteSlot.scaffold = await this.scaffold(s.x, s.z, s.rot);
    this.group.add(siteSlot.scaffold);
    this.houses.set(LAYOUT.houses.length, siteSlot);
    await this.buildField();
    await this.buildGranary();
    await this.buildWell();
    await this.buildMural();
    await this.buildShrine();
    this.update(world, 0);
  }

  private slot(id: number, view: HouseView): HouseSlot {
    return { id, view, shown: "", baseColors: view.materials.map((m) => m.color.clone()), scaffold: null };
  }

  private async scaffold(x: number, z: number, rot: number): Promise<THREE.Group> {
    const g = new THREE.Group();
    const poles = await loadGLB(`${TOWN}poles.glb`);
    const planks = await loadGLB(`${TOWN}planks.glb`);
    for (const [px, pz] of [[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1]]) {
      const p = poles.scene.clone(true);
      p.position.set(px, 0, pz);
      p.scale.set(0.6, 1.6, 0.6);
      g.add(p);
    }
    for (let k = 0; k < 3; k += 1) {
      const p = planks.scene.clone(true);
      p.position.set(2.2, 0.05 + k * 0.08, -0.2 + k * 0.1);
      p.scale.set(0.5, 0.5, 0.5);
      g.add(p);
    }
    g.scale.setScalar(2.4);
    g.position.set(x, terrainHeight(x, z) - 0.05, z);
    g.rotation.y = -rot;
    g.traverse((o) => (o.castShadow = true));
    return g;
  }

  private async buildField(): Promise<void> {
    const f = LAYOUT.field;
    const rows = await loadParts(`${NATURE}crops_dirtRow.glb`);
    const o = new THREE.Object3D();
    for (const part of rows) {
      const mesh = new THREE.InstancedMesh(part.geometry, part.material, f.cols * f.rows * 2);
      let k = 0;
      for (let r = 0; r < f.rows; r += 1)
        for (let c = 0; c < f.cols; c += 1)
          for (const dz of [-0.55, 0.55]) {
            const x = f.x - f.w / 2 + (c + 0.5) * (f.w / f.cols);
            const z = f.z - f.d / 2 + (r + 0.5) * (f.d / f.rows) + dz;
            o.position.set(x, terrainHeight(x, z) - 0.02, z);
            o.rotation.set(0, Math.PI / 2, 0);
            o.scale.set(2.4, 2, 2.4);
            o.updateMatrix();
            mesh.setMatrixAt(k++, o.matrix);
          }
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    const parts = await loadParts(`${NATURE}crops_wheatStageB.glb`);
    for (const part of parts) {
      const mat = part.material.clone();
      const mesh = new THREE.InstancedMesh(part.geometry, mat, f.cols * f.rows * 6);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      this.wheat.push({ mesh, ears: /wheat|yellow|crop/i.test(part.name) });
    }
    // Fence round the field.
    const fence = await loadGLB(`${NATURE}fence_simple.glb`);
    for (let k = 0; k < 4; k += 1) {
      const fz = f.z + f.d / 2 + 1.2;
      const fx = f.x - f.w / 2 + 1.5 + k * 2.6;
      const p = fence.scene.clone(true);
      p.position.set(fx, terrainHeight(fx, fz), fz);
      p.scale.setScalar(2.6);
      this.group.add(p);
    }
  }

  private updateField(world: World): void {
    const key = world.plots.map((p) => `${p.growth.toFixed(1)}${p.moisture > 0.25 ? 1 : 0}${p.dead ? 1 : 0}`).join("");
    if (key === this.wheatKey) return;
    this.wheatKey = key;
    const f = LAYOUT.field;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    world.plots.forEach((p, i) => {
      for (let k = 0; k < 6; k += 1) {
        const dx = ((k % 3) - 1) * 0.75;
        const dz = (Math.floor(k / 3) - 0.5) * 1.1;
        const x = p.x + dx;
        const z = p.z + dz;
        const g = p.dead ? 0.35 : Math.max(0.12, p.growth);
        o.position.set(x, terrainHeight(x, z) - 0.02, z);
        o.rotation.set(p.dead ? 0.5 : 0, (i * 7 + k) * 1.3, 0);
        o.scale.set(1.9, 1.9 * g, 1.9);
        o.updateMatrix();
        if (p.dead) col.setRGB(0.32, 0.22, 0.12);
        else if (p.moisture < 0.25) col.setRGB(1.1, 0.85, 0.45); // parched, yellowing
        else col.setRGB(1, 1, 1);
        for (const w of this.wheat) {
          w.mesh.setMatrixAt(i * 6 + k, o.matrix);
          w.mesh.setColorAt(i * 6 + k, col);
        }
      }
    });
    for (const w of this.wheat) {
      w.mesh.instanceMatrix.needsUpdate = true;
      if (w.mesh.instanceColor) w.mesh.instanceColor.needsUpdate = true;
      w.mesh.computeBoundingSphere();
    }
    void f;
  }

  private async buildGranary(): Promise<void> {
    const g = LAYOUT.granary;
    const cart = await obj(`${TOWN}cart.glb`, 3);
    cart.position.set(g.x, terrainHeight(g.x, g.z), g.z);
    cart.rotation.y = 0.4;
    this.group.add(cart);
    const sheaf = await loadParts(`${NATURE}crops_wheatStageA.glb`);
    this.sacks = sheaf.map((part) => {
      const m = new THREE.InstancedMesh(part.geometry, part.material, 40);
      m.count = 0;
      m.castShadow = true;
      this.group.add(m);
      return m;
    });
    const o = new THREE.Object3D();
    for (let k = 0; k < 40; k += 1) {
      const lx = ((k % 4) - 1.5) * 0.32;
      const lz = ((Math.floor(k / 4) % 5) - 2) * 0.36;
      const ly = 1.15 + Math.floor(k / 20) * 0.35;
      const v = new THREE.Vector3(lx, ly, lz).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.4);
      o.position.set(g.x + v.x, terrainHeight(g.x, g.z) + v.y, g.z + v.z);
      o.rotation.set(0.25, k, 0);
      o.scale.setScalar(1.5);
      o.updateMatrix();
      this.sackSlots.push(o.matrix.clone());
    }
  }

  private async buildWell(): Promise<void> {
    const w = LAYOUT.well;
    const well = await obj(`${TOWN}fountain-round.glb`, 1.4);
    well.position.set(w.x, terrainHeight(w.x, w.z), w.z);
    this.group.add(well);
    well.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && /water/i.test(((o as THREE.Mesh).material as THREE.Material).name)) this.wellWater = o as THREE.Mesh;
    });
    const pot = await obj(`${NATURE}pot_small.glb`, 3);
    pot.position.set(w.x + 1.7, terrainHeight(w.x + 1.7, w.z + 0.6), w.z + 0.6);
    this.group.add(pot);
  }

  private async buildMural(): Promise<void> {
    const m = LAYOUT.mural;
    const wallG = new THREE.Group();
    const block = await loadGLB(`${TOWN}wall-block.glb`);
    for (let k = 0; k < 4; k += 1) {
      const b = block.scene.clone(true);
      b.position.set((k - 1.5) * 2, 0, 0);
      b.scale.set(2, 1.6, 0.6);
      b.traverse((o) => {
        o.castShadow = true;
        o.receiveShadow = true;
      });
      wallG.add(b);
    }
    // The painting (procedural: canvas-drawn), revealed as the faithful paint it.
    this.muralCanvas = document.createElement("canvas");
    this.muralCanvas.width = 1024;
    this.muralCanvas.height = 192;
    this.muralTex = new THREE.CanvasTexture(this.muralCanvas);
    this.muralTex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 1.46), new THREE.MeshStandardMaterial({ map: this.muralTex, roughness: 0.9 }));
    face.position.set(0, 0.8, 0.32);
    wallG.add(face);
    this.muralGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.25, 0.6), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, map: this.muralTex });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 1.46), this.muralGlow);
    glow.position.set(0, 0.8, 0.34);
    wallG.add(glow);
    wallG.position.set(m.x, terrainHeight(m.x, m.z) - 0.05, m.z);
    wallG.rotation.y = m.rot;
    this.group.add(wallG);
    this.muralPoint.set(m.x + 1.5, terrainHeight(m.x, m.z) + 1.2, m.z);
  }

  private paintMural(progress: number, read: boolean): void {
    const c = this.muralCanvas;
    const g = c.getContext("2d")!;
    g.fillStyle = "#d9cdb4"; // lime plaster
    g.fillRect(0, 0, c.width, c.height);
    const reveal = progress * c.width;
    g.save();
    g.beginPath();
    g.rect(0, 0, reveal, c.height);
    g.clip();
    // Ochre ground, a row of villagers, and in the middle the glyph of Sanctuary: spiral, then the ring.
    const grd = g.createLinearGradient(0, 0, 0, c.height);
    grd.addColorStop(0, "#c98a4a");
    grd.addColorStop(1, "#8a4f2a");
    g.fillStyle = grd;
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#3b2a1e";
    for (let k = 0; k < 12; k += 1) {
      const x = 60 + k * 78 + (k >= 5 ? 120 : 0);
      if (x > c.width - 30) continue;
      g.beginPath();
      g.arc(x, 70, 13, 0, Math.PI * 2);
      g.fill();
      g.fillRect(x - 11, 85, 22, 50);
      g.fillRect(x - 22, 92, 44, 8);
    }
    const cx = 512;
    const cy = 96;
    g.strokeStyle = read ? "#fff2b0" : "#f1d37a";
    g.lineWidth = 9;
    g.lineCap = "round";
    g.beginPath();
    for (let a = 0; a < Math.PI * 4.2; a += 0.05) {
      const r = 4 + a * 3.2;
      const x = cx - 70 + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (a === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.beginPath();
    g.arc(cx + 60, cy, 50, 0, Math.PI * 2);
    g.stroke();
    // little roofs sheltered under the ring
    g.fillStyle = "#f1d37a";
    g.beginPath();
    g.moveTo(cx + 38, cy + 18);
    g.lineTo(cx + 60, cy - 6);
    g.lineTo(cx + 82, cy + 18);
    g.fill();
    g.restore();
    // Wet edge of the paint.
    if (progress > 0 && progress < 1) {
      g.fillStyle = "rgba(90,50,25,0.5)";
      g.fillRect(reveal - 4, 0, 4, c.height);
    }
    this.muralTex.needsUpdate = true;
  }

  private async buildShrine(): Promise<void> {
    const sh = LAYOUT.shrine;
    const y = terrainHeight(sh.x, sh.z);
    const g = new THREE.Group();
    const base = await obj(`${NATURE}platform_stone.glb`, 3.2);
    g.add(base);
    for (const k of [-1, 1]) {
      const ob = await obj(`${NATURE}statue_obelisk.glb`, 4.2);
      ob.position.set(k * 2.6, 0, -1.2);
      g.add(ob);
    }
    const altar = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 1.1, 8), new THREE.MeshStandardMaterial({ color: "#9d9380", roughness: 0.95, flatShading: true }));
    altar.position.set(0, 0.85, 0);
    altar.castShadow = true;
    altar.receiveShadow = true;
    g.add(altar);
    // The Rain glyph carved in a stone face behind the altar (procedural canvas): dark until the shrine wakes.
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const x = c.getContext("2d")!;
    x.fillStyle = "#000";
    x.fillRect(0, 0, 512, 256);
    x.strokeStyle = "#fff";
    x.lineWidth = 14;
    x.lineCap = "round";
    x.beginPath();
    for (let a = 0; a < Math.PI * 4.2; a += 0.05) {
      const r = 4 + a * 6.5;
      const px = 140 + Math.cos(a) * r;
      const py = 128 + Math.sin(a) * r;
      if (a === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.stroke();
    x.beginPath();
    for (let k = 0; k <= 4; k += 1) {
      const px = 270 + k * 48;
      const py = k % 2 ? 80 : 176;
      if (k === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.stroke();
    const tex = new THREE.CanvasTexture(c);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 2),
      new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.08, 0.1, 0.12), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    face.position.set(0, 3.2, -1.25);
    g.add(face);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.4, 0.4), new THREE.MeshStandardMaterial({ color: "#7d7466", roughness: 0.95 }));
    slab.position.set(0, 3.2, -1.5);
    slab.castShadow = true;
    g.add(slab);
    this.shrineGlyph = face;
    this.shrineLight.position.set(0, 3.4, 0.5);
    g.add(this.shrineLight);
    g.position.set(sh.x, y, sh.z);
    // Face the village.
    g.rotation.y = Math.atan2(LAYOUT.villageCentre.x - sh.x, LAYOUT.villageCentre.z - sh.z);
    this.group.add(g);
    this.shrinePoint.set(sh.x, y + 1.5, sh.z);
  }

  update(world: World, dt: number): void {
    this.t += dt;
    // Houses.
    const siteFor = new Map(world.sites.filter((s) => !s.done).map((s) => [s.house, s]));
    for (const [id, slot] of this.houses) {
      const h = world.houses.find((x) => x.id === id);
      const site = siteFor.get(id);
      const state = h ? h.state : "unbuilt";
      const work = site ? site.work : 1;
      const key = `${state}:${site ? Math.round(work * 14) : "x"}`;
      if (state === "burning") {
        const k = 0.6 + 0.4 * Math.sin(this.t * 13 + id);
        slot.view.materials.forEach((m, i) => {
          m.color.copy(slot.baseColors[i]).lerp(CHAR, 0.4);
          m.emissive.setRGB(0.9 * k, 0.28 * k, 0.05 * k);
        });
      }
      if (key === slot.shown) continue;
      slot.shown = key;
      const pieces = slot.view.pieces;
      if (state === "unbuilt" || (state === "ruin" && site && work > 0)) {
        // Rising: walls first, then the roof, as wood arrives and builders work.
        const n = Math.floor(work * pieces.length);
        pieces.forEach((p, i) => (p.visible = i < n));
        slot.view.group.visible = true;
        slot.view.materials.forEach((m, i) => {
          m.color.copy(slot.baseColors[i]);
          m.emissive.setRGB(0, 0, 0);
        });
        if (slot.scaffold) slot.scaffold.visible = true;
      } else if (state === "ruin") {
        pieces.forEach((p, i) => (p.visible = i < 6 && i % 2 === 0)); // charred stubs of wall
        slot.view.materials.forEach((m) => {
          m.color.copy(CHAR);
          m.emissive.setRGB(0, 0, 0);
        });
      } else {
        pieces.forEach((p) => (p.visible = true));
        slot.view.group.visible = true;
        if (state === "standing")
          slot.view.materials.forEach((m, i) => {
            m.color.copy(slot.baseColors[i]);
            m.emissive.setRGB(0, 0, 0);
          });
        if (slot.scaffold) slot.scaffold.visible = false;
      }
    }
    this.updateField(world);
    // Granary sheaves: one per two food, up to 40.
    const shown = Math.min(40, Math.ceil(world.granary.food / 2));
    if (shown !== this.shownFood) {
      this.shownFood = shown;
      for (const m of this.sacks) {
        for (let k = 0; k < shown; k += 1) m.setMatrixAt(k, this.sackSlots[k]);
        m.count = shown;
        m.instanceMatrix.needsUpdate = true;
        m.computeBoundingSphere();
      }
    }
    // Mural.
    const mk = Math.round(world.mural.progress * 50) + (world.mural.read ? 1000 : 0);
    if (mk !== this.muralShown) {
      this.muralShown = mk;
      this.paintMural(world.mural.progress, world.mural.read);
    }
    this.muralGlow.opacity = world.mural.progress >= 1 && !world.mural.read ? 0.25 + 0.2 * Math.sin(this.t * 3) : world.mural.read ? 0.12 : 0;
    // Shrine.
    const glyph = this.shrineGlyph.material as THREE.MeshBasicMaterial;
    if (world.shrine.awakened) {
      const k = world.learned.includes("rain") ? 0.8 : 1.4 + 0.5 * Math.sin(this.t * 2.4);
      glyph.color.setRGB(0.5 * k, 1.0 * k, 1.6 * k);
      this.shrineLight.intensity = 16 * k;
    } else {
      glyph.color.setRGB(0.07, 0.08, 0.09);
      this.shrineLight.intensity = 0;
    }
    if (this.wellWater) this.wellWater.visible = world.climate.dryness < 0.85;
  }
}
