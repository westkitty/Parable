import * as THREE from "three";
import { CAM_DEFAULT_DIST, CAM_MAX_DIST, CAM_MIN_DIST, CAM_PITCH_FAR, CAM_PITCH_NEAR } from "../config";
import type { CameraState } from "../sim/save";
import { terrainHeight } from "../sim/terrain";

export const DEFAULT_CAMERA: CameraState = { tx: 6, tz: 2, yaw: -0.96, dist: CAM_DEFAULT_DIST };

/** God camera: a target on the land, a yaw, and a distance; pitch flattens as you zoom in. */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  readonly target = new THREE.Vector3();
  yaw = DEFAULT_CAMERA.yaw;
  dist = DEFAULT_CAMERA.dist;
  goalDist = DEFAULT_CAMERA.dist;
  private goalTarget = new THREE.Vector3();
  private smoothY = 0;
  flyTo: { target: THREE.Vector3; dist: number; yaw: number; t: number; dur: number; from: CameraState; done?: () => void } | null = null;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.2, 3000);
    this.reset();
  }

  reset(): void {
    this.set(DEFAULT_CAMERA);
  }

  set(s: CameraState): void {
    this.target.set(s.tx, 0, s.tz);
    this.goalTarget.copy(this.target);
    this.yaw = s.yaw;
    this.dist = this.goalDist = s.dist;
    this.smoothY = terrainHeight(s.tx, s.tz);
    this.flyTo = null;
    this.apply();
  }

  state(): CameraState {
    return { tx: this.target.x, tz: this.target.z, yaw: this.yaw, dist: this.goalDist };
  }

  pitch(dist = this.dist): number {
    const f = (dist - CAM_MIN_DIST) / (CAM_MAX_DIST - CAM_MIN_DIST);
    const s = Math.sqrt(Math.min(1, Math.max(0, f)));
    return CAM_PITCH_NEAR + (CAM_PITCH_FAR - CAM_PITCH_NEAR) * s;
  }

  zoom(factor: number, toward?: THREE.Vector3): void {
    const before = this.goalDist;
    this.goalDist = Math.min(CAM_MAX_DIST, Math.max(CAM_MIN_DIST, this.goalDist * factor));
    if (toward && this.goalDist < before) {
      const k = (1 - this.goalDist / before) * 0.85;
      this.goalTarget.x += (toward.x - this.goalTarget.x) * k;
      this.goalTarget.z += (toward.z - this.goalTarget.z) * k;
    }
    this.clamp(this.goalTarget);
  }

  panBy(dx: number, dz: number): void {
    this.target.x += dx;
    this.target.z += dz;
    this.clamp(this.target);
    this.goalTarget.copy(this.target);
  }

  orbit(dYaw: number): void {
    this.yaw += dYaw;
  }

  private clamp(v: THREE.Vector3): void {
    v.x = Math.max(-68, Math.min(68, v.x));
    v.z = Math.max(-68, Math.min(68, v.z));
  }

  update(dt: number): void {
    if (this.flyTo) {
      const f = this.flyTo;
      f.t += dt;
      const k = Math.min(1, f.t / f.dur);
      const e = k * k * (3 - 2 * k);
      this.target.set(f.from.tx + (f.target.x - f.from.tx) * e, 0, f.from.tz + (f.target.z - f.from.tz) * e);
      this.goalTarget.copy(this.target);
      this.dist = this.goalDist = f.from.dist + (f.dist - f.from.dist) * e;
      this.yaw = f.from.yaw + (f.yaw - f.from.yaw) * e;
      if (k >= 1) {
        const done = f.done;
        this.flyTo = null;
        done?.();
      }
    } else {
      const a = 1 - Math.exp(-dt * 9);
      this.dist += (this.goalDist - this.dist) * a;
      this.target.x += (this.goalTarget.x - this.target.x) * a;
      this.target.z += (this.goalTarget.z - this.target.z) * a;
    }
    this.apply(dt);
  }

  private apply(dt = 1): void {
    const ground = Math.max(terrainHeight(this.target.x, this.target.z), 0);
    this.smoothY += (ground - this.smoothY) * Math.min(1, dt * 6);
    this.target.y = this.smoothY;
    const p = this.pitch();
    const cam = this.camera;
    cam.position.set(
      this.target.x + Math.sin(this.yaw) * Math.cos(p) * this.dist,
      this.target.y + Math.sin(p) * this.dist,
      this.target.z + Math.cos(this.yaw) * Math.cos(p) * this.dist,
    );
    const floor = Math.max(terrainHeight(cam.position.x, cam.position.z), 0) + 1.2;
    if (cam.position.y < floor) cam.position.y = floor;
    // Close up, aim a little above the ground so the horizon and the settler's face stay in view.
    const lift = Math.max(0, 1 - this.dist / 14) * 1.3;
    cam.lookAt(this.target.x, this.target.y + lift, this.target.z);
  }

  height(): number {
    return this.camera.position.y - this.target.y;
  }
}

/** March a ray against the analytic height field (cheap and exact enough for the hand). */
export function rayTerrain(ray: THREE.Ray, maxDist = 600): THREE.Vector3 | null {
  const p = new THREE.Vector3();
  let prevT = 0;
  let t = 0;
  const step = 0.6;
  let prevAbove = true;
  while (t < maxDist) {
    ray.at(t, p);
    const h = Math.max(terrainHeight(p.x, p.z), 0);
    const above = p.y > h;
    if (!above && prevAbove && t > 0) {
      let lo = prevT;
      let hi = t;
      for (let i = 0; i < 18; i += 1) {
        const mid = (lo + hi) / 2;
        ray.at(mid, p);
        if (p.y > Math.max(terrainHeight(p.x, p.z), 0)) lo = mid;
        else hi = mid;
      }
      ray.at(hi, p);
      p.y = Math.max(terrainHeight(p.x, p.z), 0);
      return p;
    }
    prevAbove = above;
    prevT = t;
    t += step * (1 + t / 60);
  }
  return null;
}
