// The ten miracle glyphs as drawn gestures: the clockwise spiral that wakes the hand, then the finisher.
// Shared by the temple plaques and the old-god glyph stones in the world. Coordinates: centred, about ±100.
import type { Miracle } from "../input/gesture";

export function drawGesture(g: CanvasRenderingContext2D, m: Miracle): void {
  // The opening spiral (top).
  g.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.05) {
    const r = 3 + a * 3.2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r - 52;
    if (a === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  // The finisher (bottom).
  const cy = 46;
  g.beginPath();
  switch (m) {
    case "fireball":
      g.moveTo(-40, cy - 30);
      for (let k = 1; k <= 4; k += 1) g.lineTo(-40 + k * 20, cy - 30 + (k % 2 ? 50 : 0));
      break;
    case "rain":
      g.moveTo(-60, cy);
      for (let a = 0; a <= Math.PI * 4; a += 0.1) g.lineTo(-60 + (a / (Math.PI * 4)) * 120, cy - Math.sin(a) * 18);
      break;
    case "sanctuary":
      g.arc(0, cy, 38, 0, Math.PI * 2);
      break;
    case "heal":
      g.moveTo(-36, cy - 34);
      g.lineTo(0, cy + 34);
      g.lineTo(36, cy - 34);
      break;
    case "lightning":
      g.moveTo(0, cy - 40);
      g.lineTo(0, cy + 34);
      g.moveTo(-14, cy + 18);
      g.lineTo(0, cy + 36);
      g.lineTo(14, cy + 18);
      break;
    case "fertility":
      g.moveTo(0, cy + 40);
      g.lineTo(0, cy - 34);
      g.moveTo(-14, cy - 18);
      g.lineTo(0, cy - 36);
      g.lineTo(14, cy - 18);
      break;
    case "wind":
      g.moveTo(-50, cy);
      g.lineTo(50, cy);
      g.moveTo(34, cy - 14);
      g.lineTo(52, cy);
      g.lineTo(34, cy + 14);
      break;
    case "stone":
      g.rect(-34, cy - 34, 68, 68);
      break;
    case "beacon":
      g.moveTo(-36, cy + 34);
      g.lineTo(0, cy - 34);
      g.lineTo(36, cy + 34);
      break;
    case "golem":
      g.moveTo(0, cy - 38);
      g.lineTo(38, cy + 30);
      g.lineTo(-38, cy + 30);
      g.closePath();
      break;
  }
  g.stroke();
}

/** Plain-language name of each miracle (for logs; the world itself shows no words). */
export const MIRACLE_NAME: Record<Miracle, string> = {
  fireball: "Fireball",
  rain: "Rain",
  sanctuary: "Sanctuary",
  heal: "Healing",
  lightning: "Lightning",
  fertility: "Fertility",
  wind: "Wind Lash",
  stone: "Stone Shape",
  beacon: "Beacon",
  golem: "Golem Wake",
};

/** Plaque colour per miracle. */
export const MIRACLE_COLOUR: Record<Miracle, string> = {
  fireball: "#ff8a3a",
  rain: "#7fc8ff",
  sanctuary: "#ffd27a",
  heal: "#9dffb0",
  lightning: "#d9e6ff",
  fertility: "#b6e35a",
  wind: "#c8f0ff",
  stone: "#d0b48a",
  beacon: "#fff2a8",
  golem: "#c08a52",
};
