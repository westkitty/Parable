#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const required = [
  "index.html",
  "styles.css",
  "src/main.js",
  "README.md",
  "Parable_Bible.md",
  "docs/PROJECT_BIBLE.md",
  "docs/GENERATED_ASSET_LIST.md",
  "scripts/parable-turn-guard.mjs",
  "scripts/verify-parable.mjs",
];

const requiredRuntimeParts = Array.from({ length: 12 }, (_, index) => `src/runtime/main.part${String(index + 1).padStart(2, "0")}.js.txt`);
const failures = [];

function fail(message) {
  failures.push(message);
}

for (const file of [...required, ...requiredRuntimeParts]) {
  const abs = join(root, file);
  if (!existsSync(abs)) {
    fail(`Missing required file: ${file}`);
  } else if (readFileSync(abs, "utf8").trim().length === 0) {
    fail(`Required file is empty: ${file}`);
  }
}

const index = readFileSync(join(root, "index.html"), "utf8");
for (const reference of ["./styles.css", "./src/main.js", "game-canvas", "module-load-warning", "ritual-state-label", "gesture-label", "miracle-list", "event-log"]) {
  if (!index.includes(reference)) fail(`index.html missing reference: ${reference}`);
}

const loader = readFileSync(join(root, "src/main.js"), "utf8");
if (!loader.includes("length: 12")) fail("src/main.js should load 12 runtime chunks.");
if (!loader.includes("module-load-warning")) fail("src/main.js should expose module-load warning on boot failure.");

const assembled = requiredRuntimeParts.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
for (const token of [
  "import * as THREE",
  "clockwise-spiral",
  "vertical zigzag",
  "fireball",
  "MIRACLES",
  "createVillageView",
  "createShrineView",
  "createRivalCitadel",
  "updateRegionOwnership",
  "castMiracle",
]) {
  if (!assembled.includes(token)) fail(`Assembled runtime missing token: ${token}`);
}

const docs = readFileSync(join(root, "docs/GENERATED_ASSET_LIST.md"), "utf8");
for (const heading of [
  "terrain and environment",
  "villagers and population",
  "structures and settlements",
  "shrines and sacred architecture",
  "rival influence and corruption",
  "miracles and spell effects",
  "UI and HUD icons",
  "gesture glyphs and ritual feedback",
  "sound and music",
  "accessibility/readability assets",
  "packaging/marketing screenshots",
]) {
  if (!docs.toLowerCase().includes(heading.toLowerCase())) fail(`Asset list missing category: ${heading}`);
}

if (failures.length) {
  console.error("Parable verification failed:");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Parable verification passed. Checked ${required.length + requiredRuntimeParts.length} required files.`);
console.log(`Runtime parts present: ${readdirSync(join(root, "src/runtime")).filter((name) => name.startsWith("main.part")).length}`);
console.log("Note: this verifier does not prove live WebGL rendering; run a real browser check for that.");
