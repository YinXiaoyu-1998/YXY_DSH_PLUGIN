#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pluginsDir = fileURLToPath(new URL("../plugins", import.meta.url));
let failed = 0;
let ran = 0;

for (const entry of readdirSync(pluginsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
  if (!entry.isDirectory()) continue;
  const dir = pluginsDir + "/" + entry.name;
  const pkgPath = dir + "/package.json";
  if (!existsSync(pkgPath)) continue;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (!pkg.scripts || !pkg.scripts.test) continue;
  ran += 1;
  console.log("== " + pkg.name + " ==");
  const result = spawnSync("npm", ["test", "--silent"], { cwd: dir, stdio: "inherit" });
  if (result.status !== 0) failed += 1;
}

console.log("ran " + ran + " plugin test suite(s), " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
