// Usage (run ONCE from your project root, ideally on a clean git tree):
//   node bump-font-sizes.mjs src
// Bumps every text-[Npx], text-xs/sm and CSS `font-size: Npx` by roughly +2px.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const PX = { 9: 11, 10: 12, 11: 13, 12: 14, 13: 15, 14: 16, 15: 17, 16: 18, 20: 22, 34: 36, 38: 41, 48: 51, 52: 55, 62: 65 };
const NAMED = { xs: "sm", sm: "base" };

const bump = (source) =>
  source
    .replace(/text-\[(\d+)px\]/g, (m, n) => (PX[n] ? `text-[${PX[n]}px]` : m))
    .replace(/\btext-(xs|sm)\b/g, (_, size) => `text-${NAMED[size]}`)
    .replace(/font-size:\s*(\d+)px/g, (m, n) => (PX[n] ? `font-size: ${PX[n]}px` : m));

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { walk(path); continue; }
    if (![".jsx", ".js", ".css"].includes(extname(path))) continue;
    const before = readFileSync(path, "utf8");
    const after = bump(before);
    if (after !== before) { writeFileSync(path, after); console.log("updated", path); }
  }
};

walk(process.argv[2] || "src");
