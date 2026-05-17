#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const stateDir = join(root, ".parable-turn");
const startPath = join(stateDir, "start-snapshot.json");
const requiredFiles = [
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

const ignoredDirs = new Set([".git", ".parable-turn", "node_modules"]);
const ignoredFiles = new Set(["parable_package.zip"]);
const mode = process.argv[2] || "help";
const summaryIndex = process.argv.indexOf("--summary");
const summary = summaryIndex >= 0 ? process.argv.slice(summaryIndex + 1).join(" ").trim() : "No summary provided.";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name) || ignoredFiles.has(name)) continue;
    const abs = join(dir, name);
    const rel = relative(root, abs).replaceAll("\\\\", "/");
    const stats = statSync(abs);
    if (stats.isDirectory()) walk(abs, out);
    else out.push(rel);
  }
  return out.sort();
}

function hashFile(path) {
  return createHash("sha256").update(readFileSync(join(root, path))).digest("hex");
}

function latestBibleEntry() {
  if (!existsSync(join(root, "Parable_Bible.md"))) return "Missing root bible";
  const text = readFileSync(join(root, "Parable_Bible.md"), "utf8");
  const matches = [...text.matchAll(/^### Entry\s+\d+\s+-\s+.+$/gm)];
  return matches.length ? matches.at(-1)[0].replace(/^###\s+/, "") : "No ledger entry found";
}

function snapshot() {
  const files = walk(root);
  const fileMap = Object.fromEntries(files.map((file) => [file, hashFile(file)]));
  const missing = requiredFiles.filter((file) => !existsSync(join(root, file)));
  return { createdAt: new Date().toISOString(), root, requiredFiles, missing, latestBibleEntry: latestBibleEntry(), files: fileMap };
}

function diff(before, after) {
  const beforeFiles = new Set(Object.keys(before.files));
  const afterFiles = new Set(Object.keys(after.files));
  const added = [...afterFiles].filter((file) => !beforeFiles.has(file)).sort();
  const removed = [...beforeFiles].filter((file) => !afterFiles.has(file)).sort();
  const changed = [...afterFiles].filter((file) => beforeFiles.has(file) && before.files[file] !== after.files[file]).sort();
  return { added, removed, changed };
}

function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function writeStartChecklist(data) {
  const content = `# Parable Turn Start Checklist\n\nGenerated: ${data.createdAt}\n\n## Required Files\n${data.missing.length ? "Missing files detected. Fix before substantive work." : "All required files are present."}\n\n### Missing\n${list(data.missing)}\n\n## Latest Bible Entry\n- ${data.latestBibleEntry}\n\n## Starting Files Snapshotted\n- ${Object.keys(data.files).length} files tracked.\n- Snapshot path: \`.parable-turn/start-snapshot.json\`\n\n## Required Start Behavior\n- Read \`Parable_Bible.md\`.\n- Inspect actual files before editing.\n- Compare requested work against this starting state.\n- Do not claim browser verification unless it was actually performed.\n`;
  writeFileSync(join(root, "docs/TURN_START_CHECKLIST.md"), content);
}

function writeFinishChecklist(start, end, changes) {
  const content = `# Parable Turn Finish Checklist\n\nGenerated: ${end.createdAt}\n\n## Work Summary\n${summary}\n\n## Required Files\n${end.missing.length ? "Missing files remain. Do not package as complete." : "All required files are present."}\n\n### Missing\n${list(end.missing)}\n\n## Bible State\n- Start latest entry: ${start.latestBibleEntry}\n- Finish latest entry before final append: ${end.latestBibleEntry}\n\n## File Delta Since Turn Start\n\n### Added\n${list(changes.added)}\n\n### Changed\n${list(changes.changed)}\n\n### Removed\n${list(changes.removed)}\n\n## Required Finish Behavior\n- Verify syntax and static files.\n- Record any unverified browser/runtime limits honestly.\n- Append \`Parable_Bible.md\` last after this checklist.\n- Package only after verification and docs are in place.\n`;
  writeFileSync(join(root, "docs/TURN_FINISH_CHECKLIST.md"), content);
}

if (mode === "start") {
  mkdirSync(stateDir, { recursive: true });
  const data = snapshot();
  writeFileSync(startPath, JSON.stringify(data, null, 2));
  writeStartChecklist(data);
  console.log(`[turn-start] tracked ${Object.keys(data.files).length} files; missing ${data.missing.length}`);
  if (data.missing.length) console.log(data.missing.join("\n"));
} else if (mode === "finish") {
  if (!existsSync(startPath)) {
    console.error("[turn-finish] missing .parable-turn/start-snapshot.json; run start first.");
    process.exit(1);
  }
  const start = JSON.parse(readFileSync(startPath, "utf8"));
  const end = snapshot();
  const changes = diff(start, end);
  writeFinishChecklist(start, end, changes);
  console.log(`[turn-finish] added ${changes.added.length}, changed ${changes.changed.length}, removed ${changes.removed.length}; missing ${end.missing.length}`);
  if (end.missing.length) process.exitCode = 1;
} else {
  console.log("Usage: node scripts/parable-turn-guard.mjs start | finish --summary <text>");
}
