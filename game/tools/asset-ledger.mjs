// Regenerates the file table in ASSET_LEDGER.md from public/assets: bytes, SHA-256, and whether src/ references it.
// Usage: node tools/asset-ledger.mjs  (run from game/)
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = "public/assets";
const PACKS = {
  "kenney-fantasy-town-kit": ["Fantasy Town Kit", "https://kenney.nl/assets/fantasy-town-kit"],
  "kenney-nature-kit": ["Nature Kit", "https://kenney.nl/assets/nature-kit"],
  "kenney-mini-characters": ["Mini Characters", "https://kenney.nl/assets/mini-characters"],
};
const src = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f)) src.push(fs.readFileSync(p, "utf8"));
  }
})("src");
const code = src.join("\n");
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d).sort()) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(root);
let total = 0;
const rows = files.map((p) => {
  const buf = fs.readFileSync(p);
  total += buf.length;
  const rel = path.relative("public", p);
  const pack = rel.split(path.sep)[1];
  const [name, url] = PACKS[pack] ?? [pack, ""];
  const base = path.basename(p);
  const stem = base.replace(/\.[^.]+$/, "");
  let used;
  if (base === "License.txt") used = "yes (licence)";
  else if (/Textures/.test(rel)) used = "yes (texture of the pack's models)";
  else if (code.includes(`${stem}.glb`) || code.includes(`"${stem}"`) || code.includes(`'${stem}'`) || code.includes(`\`${stem}`)) used = "yes";
  else if (stem.startsWith("character-") && code.includes("character-")) used = code.includes(stem.replace("character-", "")) ? "yes" : "no — kept, not referenced";
  else used = "no — kept, not referenced";
  return `| \`${rel}\` | ${name} | ${url} | CC0 1.0 | ${buf.length} | \`${crypto.createHash("sha256").update(buf).digest("hex")}\` | ${used} |`;
});
const md = fs.readFileSync("ASSET_LEDGER.md", "utf8");
const head = md.split("| File |")[0].replace(/Total third-party asset size: [0-9.]+ MB/, `Total third-party asset size: ${(total / 1048576).toFixed(2)} MB`);
const table = ["| File | Pack | Source | License | Bytes | SHA-256 | Used |", "|---|---|---|---|---|---|---|", ...rows].join("\n");
fs.writeFileSync("ASSET_LEDGER.md", `${head}${table}\n`);
console.log(`${rows.length} files, ${(total / 1048576).toFixed(2)} MB, unused: ${rows.filter((r) => r.includes("no —")).length}`);
