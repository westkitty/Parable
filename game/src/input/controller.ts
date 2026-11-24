// Pointer state machine: hover | pan | orbit | carry (+ gesture while hovering with no button).
// Targeting always uses this frame's raycast, never the eased visual hand.
import * as THREE from "three";
import {
  ACCEPT_COUNTERCLOCKWISE,
  CLICK_DRAG_THRESHOLD_PX,
  GESTURE_IDLE_RESET_MS,
  GESTURE_MAX_STROKE_MS,
  GESTURE_POINT_STEP_PX,
  RITUAL_ARM_MS,
  THROW_MAX_SPEED,
  THROW_MIN_SPEED,
  THROW_SAMPLE_WINDOW_MS,
  THROW_VERTICAL_LIFT,
} from "../config";
import { CameraRig, rayTerrain } from "../render/camera";
import { Ritual, analyzeGesture, pathLength, type GesturePoint, type GestureResult } from "./gesture";

export type Grabbable = { kind: "item" | "settler"; id: number };
export type InputMode = "hover" | "pan" | "orbit" | "carry";

export interface GameApi {
  rig: CameraRig;
  pick(ground: THREE.Vector3 | null, ray: THREE.Ray): Grabbable | null;
  grab(g: Grabbable): boolean;
  /** Release whatever is held; gentle = set down at `ground`, otherwise thrown with `v`. */
  release(v: [number, number, number], gentle: boolean, ground: THREE.Vector3 | null, safe: boolean): void;
  holding(): Grabbable | null;
  /** A completed ritual: spiral then zigzag = Fireball, spiral then wave = Rain, spiral then ring = Sanctuary. */
  cast(kind: "fireball" | "rain" | "sanctuary"): boolean;
  interact(ray: THREE.Ray, ground: THREE.Vector3 | null): boolean;
  blocked(): boolean; // temple transition / chamber: world input off
  chamberPointer(ndc: THREE.Vector2, click: boolean): void;
  onTrace(points: THREE.Vector3[], style: "drawing" | "drawing-armed" | "armed" | "cast"): void;
  onGesture(r: GestureResult): void;
}

interface Sample {
  x: number;
  z: number;
  t: number;
}

export class Controller {
  mode: InputMode = "hover";
  readonly ndc = new THREE.Vector2();
  readonly ray = new THREE.Ray();
  ground: THREE.Vector3 | null = null;
  hover: Grabbable | null = null;
  readonly ritual = new Ritual(RITUAL_ARM_MS, ACCEPT_COUNTERCLOCKWISE);
  lastRelease: { speed: number; gentle: boolean; v: [number, number, number]; samples: number; staleMs: number } | null = null;
  private raycaster = new THREE.Raycaster();
  private leftDown: { x: number; y: number; dragging: boolean; alt: boolean } | null = null;
  private panAnchor: THREE.Vector3 | null = null;
  private orbitLast: { x: number; y: number } | null = null;
  private samples: Sample[] = [];
  private stroke: (GesturePoint & { w: THREE.Vector3 | null })[] = [];
  private rightHeld = false;
  private px = 0;
  private py = 0;
  nowMs = () => performance.now();

  constructor(
    private canvas: HTMLCanvasElement,
    private game: GameApi,
  ) {
    canvas.addEventListener("pointerdown", (e) => this.down(e));
    window.addEventListener("pointermove", (e) => this.move(e));
    window.addEventListener("pointerup", (e) => this.up(e));
    canvas.addEventListener("wheel", (e) => this.wheel(e), { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("auxclick", (e) => e.preventDefault());
    window.addEventListener("keydown", (e) => this.key(e));
    window.addEventListener("blur", () => this.safeRelease());
  }

  private updateRay(clientX: number, clientY: number): void {
    const r = this.canvas.getBoundingClientRect();
    this.ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.game.rig.camera);
    this.ray.copy(this.raycaster.ray);
    this.ground = rayTerrain(this.ray);
  }

  /** Re-raycast with the last pointer position (camera moved). */
  refresh(): void {
    this.updateRay(this.px, this.py);
    if (this.mode === "hover" && !this.game.holding()) this.hover = this.game.blocked() ? null : this.game.pick(this.ground, this.ray);
    this.checkStrokeIdle();
  }

  private down(e: PointerEvent): void {
    this.px = e.clientX;
    this.py = e.clientY;
    this.updateRay(e.clientX, e.clientY);
    this.canvas.setPointerCapture?.(e.pointerId);
    if (this.game.blocked()) {
      if (e.button === 0) this.game.chamberPointer(this.ndc, true);
      return;
    }
    this.finishStroke(false);
    if (e.button === 2) {
      this.rightHeld = true;
      if (this.game.holding()) {
        // Already gripping (a summoned fireball): this press firms the grip; release throws.
        this.mode = "carry";
        return;
      }
      // First-press grab: pick from this frame's ray, not from any eased hand state.
      const target = this.game.pick(this.ground, this.ray);
      if (target && this.game.grab(target)) {
        this.mode = "carry";
        this.samples = [];
        this.sample(e.timeStamp);
      }
      return;
    }
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      this.mode = this.game.holding() ? this.mode : "orbit";
      this.orbitLast = { x: e.clientX, y: e.clientY };
      return;
    }
    if (e.button === 0) {
      this.leftDown = { x: e.clientX, y: e.clientY, dragging: false, alt: false };
      this.panAnchor = this.ground ? this.ground.clone() : null;
    }
  }

  private move(e: PointerEvent): void {
    const events = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
    const list = events.length ? events : [e];
    for (const ev of list) this.moveOne(ev.clientX, ev.clientY, ev.timeStamp || e.timeStamp, e.buttons);
  }

  private moveOne(x: number, y: number, t: number, buttons: number): void {
    this.px = x;
    this.py = y;
    if (this.game.blocked()) {
      this.updateRay(x, y);
      this.game.chamberPointer(this.ndc, false);
      return;
    }
    if (this.orbitLast && this.mode === "orbit") {
      this.game.rig.orbit(-(x - this.orbitLast.x) * 0.006);
      this.orbitLast = { x, y };
      this.updateRay(x, y);
      return;
    }
    if (this.leftDown) {
      const d = Math.hypot(x - this.leftDown.x, y - this.leftDown.y);
      if (!this.leftDown.dragging && d > CLICK_DRAG_THRESHOLD_PX) {
        this.leftDown.dragging = true;
        if (this.mode === "hover") this.mode = "pan";
      }
      if (this.leftDown.dragging && this.panAnchor && (this.mode === "pan" || this.game.holding())) {
        // Grab the land: the point first touched stays under the cursor.
        this.updateRay(x, y);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.panAnchor.y);
        const hit = new THREE.Vector3();
        if (this.ray.intersectPlane(plane, hit) && hit.distanceTo(this.ray.origin) < 900) {
          this.game.rig.panBy(this.panAnchor.x - hit.x, this.panAnchor.z - hit.z);
          this.game.rig.camera.updateMatrixWorld();
        }
      }
    }
    this.updateRay(x, y);
    if (this.game.holding()) this.sample(t);
    if (this.mode === "hover" && !this.game.holding()) this.hover = this.game.pick(this.ground, this.ray);
    if (this.mode === "hover" && buttons === 0 && !this.game.holding()) this.gesturePoint(x, y, t);
  }

  private up(e: PointerEvent): void {
    this.px = e.clientX;
    this.py = e.clientY;
    if (this.game.blocked()) return;
    this.updateRay(e.clientX, e.clientY);
    if (e.button === 2) {
      this.rightHeld = false;
      if (this.game.holding()) {
        this.sample(e.timeStamp);
        this.releaseHeld(e.timeStamp, false);
      }
      if (this.mode === "carry") this.mode = "hover";
      return;
    }
    if (e.button === 1 || (this.mode === "orbit" && e.button === 0)) {
      this.orbitLast = null;
      if (this.mode === "orbit") this.mode = "hover";
      return;
    }
    if (e.button === 0 && this.leftDown) {
      const wasDrag = this.leftDown.dragging;
      this.leftDown = null;
      this.panAnchor = null;
      if (this.mode === "pan") this.mode = this.game.holding() ? "carry" : "hover";
      if (!wasDrag) this.game.interact(this.ray, this.ground);
    }
  }

  private wheel(e: WheelEvent): void {
    e.preventDefault();
    if (this.game.blocked()) return;
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    this.game.rig.zoom(Math.exp(dy * 0.0014), this.ground ?? undefined);
  }

  private key(e: KeyboardEvent): void {
    if (e.key === "r" || e.key === "R") {
      if (!this.game.blocked()) this.game.rig.reset();
    } else if (e.key === "Escape") {
      this.safeRelease();
    }
  }

  /** Esc / focus loss: gentle drop, cancel gesture, disarm. Never throws. */
  safeRelease(): void {
    if (this.game.holding()) this.game.release([0, 0, 0], true, this.ground, true);
    this.stroke = [];
    this.ritual.disarm();
    this.game.onTrace([], "drawing");
    if (this.mode === "carry") this.mode = "hover";
    this.rightHeld = false;
  }

  // ---- throw sampling (rig-local: camera pans add no throw velocity) ----
  private sample(t: number): void {
    if (!this.ground) return;
    const tg = this.game.rig.target;
    this.samples.push({ x: this.ground.x - tg.x, z: this.ground.z - tg.z, t });
    while (this.samples.length > 2 && this.samples[0].t < t - 400) this.samples.shift();
  }

  releaseVelocity(t: number): { v: [number, number, number]; speed: number } {
    const win = this.samples.filter((s) => s.t >= t - THROW_SAMPLE_WINDOW_MS);
    const s = win.length >= 2 ? win : this.samples.slice(-2);
    if (s.length < 2) return { v: [0, 0, 0], speed: 0 };
    const a = s[0];
    const b = s[s.length - 1];
    const dt = Math.max(1, b.t - a.t) / 1000;
    const avg = new THREE.Vector2((b.x - a.x) / dt, (b.z - a.z) / dt);
    let peak = 0;
    for (let i = 1; i < s.length; i += 1) {
      const d = (s[i].t - s[i - 1].t) / 1000;
      if (d > 0.004) peak = Math.max(peak, Math.hypot(s[i].x - s[i - 1].x, s[i].z - s[i - 1].z) / d);
    }
    // Stale samples mean the hand had stopped before release.
    if (t - b.t > 90) return { v: [0, 0, 0], speed: 0 };
    let speed = avg.length();
    if (peak > speed * 1.4) speed = speed * 0.65 + peak * 0.35;
    speed = Math.min(speed, THROW_MAX_SPEED);
    const dir = avg.lengthSq() > 0 ? avg.normalize() : new THREE.Vector2();
    return { v: [dir.x * speed, THROW_VERTICAL_LIFT + speed * 0.22, dir.y * speed], speed };
  }

  private releaseHeld(t: number, safe: boolean): void {
    const { v, speed } = this.releaseVelocity(t);
    const gentle = safe || speed < THROW_MIN_SPEED;
    const last = this.samples[this.samples.length - 1];
    this.lastRelease = { speed, gentle, v, samples: this.samples.length, staleMs: last ? t - last.t : -1 };
    this.game.release(v, gentle, this.ground, safe);
    this.samples = [];
  }

  // ---- gestures: drawn with the empty hand and no button held ----
  private gesturePoint(x: number, y: number, t: number): void {
    const last = this.stroke[this.stroke.length - 1];
    if (last && t - last.t > GESTURE_IDLE_RESET_MS) {
      this.finishStroke(true);
    }
    const prev = this.stroke[this.stroke.length - 1];
    if (prev && Math.hypot(x - prev.x, y - prev.y) < GESTURE_POINT_STEP_PX) return;
    this.stroke.push({ x, y, t, w: this.ground ? this.ground.clone() : null });
    while (this.stroke.length > 2 && this.stroke[0].t < t - GESTURE_MAX_STROKE_MS) this.stroke.shift();
    if (this.stroke.length > 12 && pathLength(this.stroke) > 260) {
      this.game.onTrace(this.worldTrace(), this.armed() ? "drawing-armed" : "drawing");
    }
  }

  private worldTrace(): THREE.Vector3[] {
    return this.stroke.filter((p) => p.w).map((p) => p.w!);
  }

  armed(now = this.nowMs()): boolean {
    return this.ritual.armed(now);
  }

  private checkStrokeIdle(): void {
    const last = this.stroke[this.stroke.length - 1];
    // Event timestamps share performance.now()'s time origin.
    if (last && performance.now() - last.t > GESTURE_IDLE_RESET_MS) this.finishStroke(true);
  }

  private finishStroke(analyze: boolean): void {
    const pts = this.stroke;
    this.stroke = [];
    if (!analyze || pts.length < 12) return;
    const r = analyzeGesture(pts);
    this.game.onGesture(r);
    const outcome = this.ritual.feed(r, this.nowMs());
    if (outcome === "armed") {
      this.game.onTrace(pts.filter((p) => p.w).map((p) => p.w!), "armed");
    } else if (outcome) {
      if (this.game.cast(outcome)) {
        if (outcome === "fireball") this.mode = this.rightHeld ? "carry" : "hover";
        this.game.onTrace(pts.filter((p) => p.w).map((p) => p.w!), "cast");
      }
    }
  }

  get isRightHeld(): boolean {
    return this.rightHeld;
  }
}
