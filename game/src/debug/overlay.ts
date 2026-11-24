// F3 developer overlay. Off by default; the only on-screen text besides a settler's bubble.
export class DebugOverlay {
  private el: HTMLPreElement;
  visible = false;
  private acc = 0;

  constructor() {
    this.el = document.createElement("pre");
    this.el.id = "f3";
    this.el.style.display = "none";
    document.body.appendChild(this.el);
    window.addEventListener("keydown", (e) => {
      if (e.key === "F3") {
        e.preventDefault();
        this.visible = !this.visible;
        this.el.style.display = this.visible ? "block" : "none";
      }
    });
  }

  update(dt: number, lines: () => string[]): void {
    if (!this.visible) return;
    this.acc += dt;
    if (this.acc < 0.25) return;
    this.acc = 0;
    this.el.textContent = lines().join("\n");
  }
}

export class FrameStats {
  private frames: number[] = [];
  push(ms: number): void {
    this.frames.push(ms);
    if (this.frames.length > 4000) this.frames.shift();
  }
  reset(): void {
    this.frames = [];
  }
  summary(lastN = this.frames.length): { n: number; median: number; p95: number; fps: number } {
    const f = this.frames.slice(-lastN).sort((a, b) => a - b);
    if (!f.length) return { n: 0, median: 0, p95: 0, fps: 0 };
    const median = f[Math.floor(f.length / 2)];
    const p95 = f[Math.min(f.length - 1, Math.floor(f.length * 0.95))];
    return { n: f.length, median, p95, fps: 1000 / median };
  }
}
