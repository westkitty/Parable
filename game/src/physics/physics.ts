// Rapier owns loose-object motion only. The sim stays the source of truth: when bodies move,
// their transforms are written back into sim items every frame.
import RAPIER from "@dimforge/rapier3d-compat";
import { PHYSICS_HZ, WATER_LEVEL } from "../config";
import { LAYOUT, terrainHeight } from "../sim/terrain";
import { trees } from "../sim/scenery";
import type { Item, World } from "../sim/types";

export const LOG_HALF_LENGTH = 1.0;
export const LOG_RADIUS = 0.27;
export const FIREBALL_RADIUS = 0.55;

export class Physics {
  readonly world: RAPIER.World;
  private bodies = new Map<number, RAPIER.RigidBody>();
  private kinds = new Map<number, Item["kind"]>();
  private acc = 0;
  lastStepMs = 0;

  private constructor() {
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.world.timestep = 1 / PHYSICS_HZ;
    this.buildStatic();
  }

  static async create(): Promise<Physics> {
    await RAPIER.init();
    return new Physics();
  }

  private buildStatic(): void {
    // Ground trimesh at 1 m resolution, same height function the renderer uses.
    const n = 161;
    const verts = new Float32Array(n * n * 3);
    for (let j = 0; j < n; j += 1) {
      for (let i = 0; i < n; i += 1) {
        const x = i - 80;
        const z = j - 80;
        const k = (j * n + i) * 3;
        verts[k] = x;
        verts[k + 1] = terrainHeight(x, z);
        verts[k + 2] = z;
      }
    }
    const idx = new Uint32Array((n - 1) * (n - 1) * 6);
    let p = 0;
    for (let j = 0; j < n - 1; j += 1) {
      for (let i = 0; i < n - 1; i += 1) {
        const a = j * n + i;
        const b = a + 1;
        const c = a + n;
        const d = c + 1;
        idx.set([a, c, b, b, c, d], p);
        p += 6;
      }
    }
    const ground = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    this.world.createCollider(RAPIER.ColliderDesc.trimesh(verts, idx).setFriction(0.9).setRestitution(0.05), ground);
    // Tree trunks.
    for (const t of trees()) {
      const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(t.x, t.y + 1.5, t.z));
      this.world.createCollider(RAPIER.ColliderDesc.cylinder(1.5, 0.08 * t.scale).setFriction(0.7), body);
    }
    // Cottage (rotated box) and temple drum.
    const c = LAYOUT.cottage;
    const cb = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed()
        .setTranslation(c.x, terrainHeight(c.x, c.z) + 2.2, c.z)
        .setRotation({ x: 0, y: Math.sin(-c.rot / 2), z: 0, w: Math.cos(-c.rot / 2) }),
    );
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(3.6, 2.4, 2.4), cb);
    const t = LAYOUT.temple;
    const tb = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(t.x, terrainHeight(t.x, t.z) + 3, t.z));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(4.8, 3, 4.8), tb);
  }

  has(id: number): boolean {
    return this.bodies.has(id);
  }

  body(id: number): RAPIER.RigidBody | undefined {
    return this.bodies.get(id);
  }

  private create(item: Item, kinematic: boolean): RAPIER.RigidBody {
    const desc = (kinematic ? RAPIER.RigidBodyDesc.kinematicPositionBased() : RAPIER.RigidBodyDesc.dynamic())
      .setTranslation(item.p[0], item.p[1], item.p[2])
      .setRotation({ x: item.q[0], y: item.q[1], z: item.q[2], w: item.q[3] })
      .setLinearDamping(item.kind === "log" ? 0.12 : 0.02)
      .setAngularDamping(item.kind === "log" ? 1.6 : 0.4) // logs are rough bark: they tumble, then settle instead of rolling forever
      .setCcdEnabled(true);
    const body = this.world.createRigidBody(desc);
    if (!kinematic) {
      body.setLinvel({ x: item.v[0], y: item.v[1], z: item.v[2] }, true);
      body.setAngvel({ x: item.w[0], y: item.w[1], z: item.w[2] }, true);
    }
    const col =
      item.kind === "log"
        ? // A rounded box rather than a capsule: Kenney's log is faceted, and a faceted log rests on a
          // gentle slope instead of rolling away like a perfect cylinder.
          RAPIER.ColliderDesc.roundCuboid(LOG_RADIUS - 0.08, LOG_RADIUS - 0.08, LOG_HALF_LENGTH - 0.08, 0.08)
            .setDensity(600 / 1000)
            .setFriction(0.85)
            .setRestitution(0.1)
        : RAPIER.ColliderDesc.ball(FIREBALL_RADIUS).setDensity(0.4).setSensor(false);
    this.world.createCollider(col, body);
    this.bodies.set(item.id, body);
    this.kinds.set(item.id, item.kind);
    return body;
  }

  remove(id: number): void {
    this.settling.delete(id);
    const b = this.bodies.get(id);
    if (b) this.world.removeRigidBody(b);
    this.bodies.delete(id);
    this.kinds.delete(id);
  }

  clear(): void {
    for (const id of [...this.bodies.keys()]) this.remove(id);
    this.acc = 0;
  }

  /** Make physics bodies match the sim's item states (create, convert, remove). */
  sync(world: World): void {
    const live = new Set<number>();
    for (const item of world.items) {
      if (item.state !== "loose" && item.state !== "held") continue;
      live.add(item.id);
      const wantKinematic = item.state === "held";
      let b = this.bodies.get(item.id);
      if (b && b.isKinematic() !== wantKinematic) {
        if (wantKinematic) {
          this.settling.delete(item.id);
          b.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
        }
        else {
          b.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
          b.setLinvel({ x: item.v[0], y: item.v[1], z: item.v[2] }, true);
          b.setAngvel({ x: item.w[0], y: item.w[1], z: item.w[2] }, true);
        }
      }
      if (!b) b = this.create(item, wantKinematic);
      // Fireballs fly true (no gravity drag-down while held, light gravity in flight for a readable arc).
      if (item.kind === "fireball") b.setGravityScale(item.state === "held" ? 0 : 0.6, false);
    }
    for (const id of [...this.bodies.keys()]) if (!live.has(id)) this.remove(id);
  }

  setHeldTarget(id: number, p: [number, number, number], q: [number, number, number, number]): void {
    const b = this.bodies.get(id);
    if (!b || !b.isKinematic()) return;
    b.setNextKinematicTranslation({ x: p[0], y: p[1], z: p[2] });
    b.setNextKinematicRotation({ x: q[0], y: q[1], z: q[2], w: q[3] });
  }

  private settling = new Map<number, number>();

  /** Teleport a dynamic body (gentle set-down, test hooks). A placed object settles where it was put. */
  place(id: number, p: [number, number, number], settle = true): void {
    const b = this.bodies.get(id);
    if (!b) return;
    if (settle) {
      this.settling.set(id, PHYSICS_HZ);
      b.setAngularDamping(10);
      b.setLinearDamping(4);
    }
    b.setTranslation({ x: p[0], y: p[1], z: p[2] }, true);
    b.setLinvel({ x: 0, y: 0, z: 0 }, true);
    b.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }

  /** Throw: the object leaves from the hand's position with the release velocity. */
  launch(id: number, p: [number, number, number], v: [number, number, number], w: [number, number, number]): void {
    const b = this.bodies.get(id);
    if (!b) return;
    b.setTranslation({ x: p[0], y: p[1], z: p[2] }, true);
    b.setLinvel({ x: v[0], y: v[1], z: v[2] }, true);
    b.setAngvel({ x: w[0], y: w[1], z: w[2] }, true);
  }

  /** Advance by real elapsed seconds in fixed 60 Hz steps. Returns steps taken. */
  step(dt: number): number {
    this.acc = Math.min(this.acc + dt, 0.25);
    let steps = 0;
    const t0 = performance.now();
    while (this.acc >= 1 / PHYSICS_HZ) {
      for (const [id, n] of this.settling) {
        const b = this.bodies.get(id);
        if (!b || n <= 1) {
          this.settling.delete(id);
          if (b && this.kinds.get(id) === "log") {
            b.setAngularDamping(1.6);
            b.setLinearDamping(0.12);
          }
        } else this.settling.set(id, n - 1);
      }
      this.applyForces();
      this.world.step();
      this.acc -= 1 / PHYSICS_HZ;
      steps += 1;
    }
    if (steps) this.lastStepMs = (performance.now() - t0) / steps;
    return steps;
  }

  private applyForces(): void {
    for (const [id, b] of this.bodies) {
      if (b.isKinematic() || this.kinds.get(id) !== "log") continue;
      const t = b.translation();
      // Rolling resistance: bark on grass. Slow logs bleed spin so they settle instead of rolling downhill forever.
      const lv = b.linvel();
      if (Math.hypot(lv.x, lv.y, lv.z) < 1.2) {
        const av = b.angvel();
        b.setAngvel({ x: av.x * 0.86, y: av.y * 0.86, z: av.z * 0.86 }, true);
        b.setLinvel({ x: lv.x * 0.94, y: lv.y, z: lv.z * 0.94 }, true);
      }
      const depth = WATER_LEVEL + 0.05 - t.y;
      if (depth <= 0) continue;
      const m = b.mass();
      const lift = Math.min(depth / (LOG_RADIUS * 2), 1) * 9.81 * 1.9 * m;
      b.applyImpulse({ x: 0, y: lift / PHYSICS_HZ, z: 0 }, true);
      const v = b.linvel();
      b.setLinvel({ x: v.x * 0.985, y: v.y * 0.95, z: v.z * 0.985 }, true);
    }
  }

  /** Copy body transforms back into the sim's loose items. */
  writeBack(world: World): void {
    for (const item of world.items) {
      if (item.state !== "loose" && item.state !== "held") continue;
      const b = this.bodies.get(item.id);
      if (!b) continue;
      const t = b.translation();
      const r = b.rotation();
      item.p = [t.x, t.y, t.z];
      item.q = [r.x, r.y, r.z, r.w];
      if (item.state === "loose") {
        const v = b.linvel();
        const w = b.angvel();
        item.v = [v.x, v.y, v.z];
        item.w = [w.x, w.y, w.z];
        // Safety net: anything that tunnels below the land is lifted back on top.
        const ground = terrainHeight(t.x, t.z);
        if (t.y < ground - 1.5) this.place(item.id, [t.x, Math.max(ground, WATER_LEVEL) + 1, t.z]);
      }
    }
  }
}
