#!/usr/bin/env node
/**
 * Regenerate lib/client.cjs and lib/build-info.json from the Codex-style
 * agents/openai.yaml files.
 *
 * The client bundle cannot read the user's filesystem, so the labels are
 * embedded at build time. Re-run this after adding or renaming a skill.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL("..", import.meta.url));
const skillsRoot = join(homedir(), ".agents", "skills");
const outputPath = join(here, "lib", "metadata.json");
const buildPath = join(here, "lib", "build-info.json");
const clientPath = join(here, "lib", "client.cjs");
const templatePath = join(here, "lib", "client.template.cjs");
const pkg = JSON.parse(readFileSync(join(here, "package.json"), "utf8"));

function field(text, key) {
  const match = new RegExp("^\\s*" + key + ":\\s*(.*)$", "m").exec(text);
  if (!match) return null;
  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.length > 0 ? value : null;
}

const entries = {};
for (const name of readdirSync(skillsRoot)) {
  const file = join(skillsRoot, name, "agents", "openai.yaml");
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");
  const label = field(text, "display_name");
  const description = field(text, "short_description");
  if (label && description) entries[name] = { label, description };
}

const sorted = Object.fromEntries(
  Object.keys(entries).sort().map((key) => [key, entries[key]])
);
const json = JSON.stringify(sorted, null, 2);
const names = Object.keys(sorted);
const build = {
  plugin: pkg.name,
  version: pkg.version,
  builtAt: new Date().toISOString(),
  metadataHash: createHash("sha256").update(json).digest("hex").slice(0, 12),
  metadataCount: names.length,
};

writeFileSync(outputPath, json + "\n", "utf8");
writeFileSync(buildPath, JSON.stringify(build, null, 2) + "\n", "utf8");

const template = readFileSync(templatePath, "utf8");
if (!template.includes("__SKILL_META__") || !template.includes("__BUILD_INFO__")) {
  throw new Error("client template is missing a required placeholder");
}
const client = template
  .replace("__SKILL_META__", json)
  .replace("__BUILD_INFO__", JSON.stringify(build, null, 2));
writeFileSync(clientPath, client, "utf8");
console.log(
  "synced " + build.metadataCount + " skills, " +
  "hash " + build.metadataHash
);
