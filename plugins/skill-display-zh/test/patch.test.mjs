import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const clientPath = fileURLToPath(new URL("../lib/client.cjs", import.meta.url));
const code = readFileSync(clientPath, "utf8");

let loaded;
globalThis.window = {
  __DSH_BOOT__: { version: "0.2.1-rc.2" },
  __ModuleLoader__: {
    load(module) {
      loaded = module;
    }
  },
  setInterval,
  clearInterval
};
vm.runInThisContext(code, { filename: clientPath });
assert.ok(loaded, "client module did not register");
const exports = loaded.factory(() => {
  throw new Error("unexpected require");
});

assert.equal(exports.inject[0], "inputTriggers");
assert.equal(typeof exports.apply, "function");

function context(sources) {
  const disposers = [];
  return {
    disposers,
    ctx: {
      inputTriggers: { live: { sources } },
      effect(fn) {
        disposers.push(fn());
      }
    }
  };
}

const originalItems = [
  { name: "storytelling-dialogue", description: "English description" },
  { name: "unknown-skill", description: "Leave me alone" }
];
const source = {
  trigger: "/",
  name: "skill",
  candidates: async () => originalItems
};
const first = context([source]);
exports.apply(first.ctx);
assert.equal(globalThis.window.__DSH_SKILL_DISPLAY_ZH__.status, "active");
const diagnostic = globalThis.window.__DSH_SKILL_DISPLAY_ZH__.diagnose();
assert.equal(diagnostic.dshVersion, "0.2.1-rc.2");
assert.equal(diagnostic.sourceSeen, true);
assert.equal(diagnostic.candidates, "function");
assert.equal(diagnostic.storytellingCount, 13);
assert.ok(diagnostic.metadataCount >= 13);

const items = await source.candidates({}, { query: "story" });
assert.equal(items[0].label, "Storytelling · 对白与潜台词");
assert.equal(items[0].name, "storytelling-dialogue");
assert.match(items[0].description, /潜台词/);
assert.equal(items[1].label, undefined);
assert.equal(items[1].description, "Leave me alone");

for (const dispose of first.disposers) dispose();
const restored = await source.candidates({}, { query: "story" });
assert.equal(restored[0].label, undefined);
assert.equal(restored[0].description, "English description");

// A newer DSH that already maps display metadata should make this plugin idle.
const nativeSource = {
  trigger: "/",
  name: "skill",
  candidates: async () => [
    { name: "storytelling-dialogue", label: "Native label", description: "Native description" }
  ]
};
const second = context([nativeSource]);
exports.apply(second.ctx);
const nativeItems = await nativeSource.candidates({}, { query: "story" });
assert.equal(globalThis.window.__DSH_SKILL_DISPLAY_ZH__.status, "native");
assert.equal(nativeItems[0].label, "Native label");
assert.equal(nativeItems[0].description, "Native description");
for (const dispose of second.disposers) dispose();

// A late-arriving source should be patched by the bounded retry loop.
const third = context([]);
exports.apply(third.ctx);
assert.equal(globalThis.window.__DSH_SKILL_DISPLAY_ZH__.status, "waiting");
const lateSource = {
  trigger: "/",
  name: "skill",
  candidates: async () => originalItems
};
third.ctx.inputTriggers.live.sources.push(lateSource);
await new Promise((resolve) => setTimeout(resolve, 150));
assert.equal(globalThis.window.__DSH_SKILL_DISPLAY_ZH__.status, "active");
for (const dispose of third.disposers) dispose();

console.log("patch test passed");
