import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const clientPath = fileURLToPath(new URL("../lib/client.cjs", import.meta.url));
const code = readFileSync(clientPath, "utf8");

/* ---------------------------------------------------------------- fake DOM */

function makeRow(key, expanded) {
  return {
    attrs: new Map([
      ["data-row-key", "workspace:" + key],
      ["aria-expanded", String(expanded)],
    ]),
    clicks: 0,
    afterClick: null,
    getAttribute(name) {
      return this.attrs.has(name) ? this.attrs.get(name) : null;
    },
    click() {
      this.clicks += 1;
      const open = this.attrs.get("aria-expanded") === "true";
      this.attrs.set("aria-expanded", open ? "false" : "true");
      if (this.afterClick) this.afterClick(this);
    },
  };
}

/** A row that ignores clicks: models a release that no longer toggles on click. */
function makeInertRow(key, expanded) {
  return {
    attrs: new Map([
      ["data-row-key", "workspace:" + key],
      ["aria-expanded", String(expanded)],
    ]),
    clicks: 0,
    getAttribute(name) {
      return this.attrs.has(name) ? this.attrs.get(name) : null;
    },
    click() {
      this.clicks += 1;
    },
  };
}

function makeArea(rows) {
  return {
    rows,
    querySelectorAll() {
      return this.rows.slice();
    },
  };
}

const styles = [];
let area = null;

const document = {
  querySelector(selector) {
    assert.equal(selector, "[data-sidebar-list-area]");
    return area;
  },
  getElementById(id) {
    return styles.some((style) => style.id === id) ? styles[0] : null;
  },
  createElement(tag) {
    assert.equal(tag, "style");
    const element = { id: "", textContent: "", parentNode: null };
    element.parentNode = {
      appendChild(node) {
        styles.push(node);
      },
      removeChild(node) {
        const index = styles.indexOf(node);
        if (index >= 0) styles.splice(index, 1);
      },
    };
    return element;
  },
  head: {
    appendChild(node) {
      styles.push(node);
    },
  },
};

function makeReact(summaryState) {
  let firstUseState = true;
  return {
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children };
    },
    useState(initial) {
      if (firstUseState && summaryState !== undefined) {
        firstUseState = false;
        return [summaryState, () => {}];
      }
      firstUseState = false;
      return [initial, () => {}];
    },
    useEffect() {},
  };
}

let loaded;
globalThis.window = {
  __ModuleLoader__: {
    load(module) {
      loaded = module;
    },
  },
};
globalThis.document = document;

vm.runInThisContext(code, { filename: clientPath });

/* ------------------------------------------------------------- registration */

assert.ok(loaded, "client module did not register");
assert.equal(loaded.id, "dsh-workspace-collapse-all");

function load(react) {
  return loaded.factory((name) => {
    assert.equal(name, "react");
    return react;
  });
}

function mount(exports) {
  const effects = [];
  const registrations = [];
  const injected = [];
  const dictionaries = new Map();
  const ctx = {
    locale: {
      register(namespace, dicts) {
        dictionaries.set(namespace, dicts);
        return () => {};
      },
    },
    slots: {
      inject(key, callback) {
        injected.push(key);
        return callback();
      },
      register(options, component) {
        registrations.push({ options, component });
        return () => {};
      },
    },
    effect(callback, label) {
      assert.equal(typeof label, "string");
      effects.push(callback());
    },
  };
  exports.apply(ctx);
  return { ctx, effects, registrations, injected, dictionaries };
}

const exports = load(makeReact());
assert.deepEqual(Array.from(exports.inject), ["slots", "locale"]);
assert.equal(typeof exports.apply, "function");

const first = mount(exports);
assert.deepEqual(first.injected, ["sidebar.footer.action"]);
assert.equal(first.registrations.length, 1);
assert.equal(first.registrations[0].options.name, "sidebar.footer.action");
assert.equal(first.registrations[0].options.id, "workspace-collapse-all");
assert.equal(first.registrations[0].options.locale, "workspace-collapse-all");
assert.equal(typeof first.registrations[0].component, "function");

const dicts = first.dictionaries.get("workspace-collapse-all");
assert.ok(dicts.zh && dicts.en, "both dictionaries registered");
for (const key of ["collapse", "expand", "empty", "collapsed", "expanded", "failed"]) {
  assert.equal(typeof dicts.zh[key], "string");
  assert.equal(typeof dicts.en[key], "string");
}
assert.match(dicts.zh.collapsed, /\{n\}/, "result copy interpolates the count");

/* ------------------------------------------------------------------- styles */

assert.equal(styles.length, 1, "one stylesheet inserted");
assert.match(styles[0].textContent, /--dsw-alias-label-primary/);
assert.match(styles[0].textContent, /--dsw-alias-interactive-bg-hover/);
assert.match(styles[0].textContent, /:focus-visible/);
assert.doesNotMatch(styles[0].textContent, /#[0-9a-fA-F]{3,8}\b/, "no literal colors");

/* ----------------------------------------------------------------- toggle */

const api = globalThis.window.__DSH_WORKSPACE_COLLAPSE_ALL__;
assert.ok(api, "diagnostics handle published");
assert.equal(api.state.status, "active");

area = null;
assert.equal(await api.toggleAll(), null);
assert.equal(api.state.lastError, "list-area-missing");

area = makeArea([]);
assert.equal(await api.toggleAll(), null);
assert.equal(api.state.lastError, "no-rows");

// Two open groups collapse; nothing expanded means expand instead.
const a = makeRow("a", true);
const b = makeRow("b", true);
area = makeArea([a, b]);
const collapsed = await api.toggleAll();
assert.equal(collapsed.action, "collapse");
assert.equal(collapsed.failed, false);
assert.equal(collapsed.count, 2);
assert.equal(a.clicks, 1);
assert.equal(b.clicks, 1);
assert.equal(a.getAttribute("aria-expanded"), "false");

// Nested folders: a closed group reveals a child row that is still closed.
const parent = makeRow("parent", false);
const child = makeRow("child", false);
parent.afterClick = () => {
  if (!area.rows.includes(child)) area.rows.push(child);
};
area = makeArea([parent]);
const expanded = await api.toggleAll();
assert.equal(expanded.action, "expand");
assert.equal(expanded.failed, false);
assert.equal(parent.clicks, 1);
assert.equal(child.clicks, 1, "nested row opened on the follow-up pass");
assert.equal(child.getAttribute("aria-expanded"), "true");
assert.equal(api.state.lastAction, "expand");
assert.equal(api.state.lastCount, 2);

// A host that writes aria-expanded late must not get its row clicked twice.
const lateFlip = makeRow("late", false);
lateFlip.afterClick = null;
lateFlip.click = () => {
  lateFlip.clicks += 1; // count the click only; the attribute lands later
  setTimeout(() => { lateFlip.attrs.set("aria-expanded", "true"); }, 32);
};
area = makeArea([lateFlip]);
const late = await api.toggleAll();
assert.equal(late.action, "expand");
assert.equal(lateFlip.clicks, 1, "late attribute write does not re-click the row");
assert.equal(lateFlip.getAttribute("aria-expanded"), "true");

// A click that changes nothing is reported instead of looking inert.
const inert = makeInertRow("inert", true);
area = makeArea([inert]);
const noEffect = await api.toggleAll();
assert.equal(noEffect.action, "collapse");
assert.equal(noEffect.failed, true);
assert.equal(api.state.lastError, "no-effect");
assert.equal(inert.clicks, 1);

assert.deepEqual(api.summarize(), { total: 1, expanded: 1 });

const report = JSON.parse(api.report());
assert.equal(report.version, "0.1.0");
assert.equal(report.lastError, "no-effect");

const styleDisposer = first.effects[1];
styleDisposer();
assert.equal(styles.length, 0);

/* ------------------------------------------------------------- component */

function render(summaryState, props) {
  const instance = load(makeReact(summaryState));
  const mounted = mount(instance);
  const t = (key, params) => {
    const text = dicts.zh[key];
    if (params === undefined) return text;
    return text.replace("{n}", String(params.n));
  };
  return mounted.registrations[0].component({ ...props, t });
}

// Rail mode renders nothing, so a missing `wide` must not paint a text button.
assert.equal(render(undefined, { wide: false }), null);
assert.equal(render(undefined, {}), null);

// Empty view: the label explains the state instead of naming an action, and
// the control stays focusable through aria-disabled.
const emptyTree = render({ total: 0, expanded: 0 }, { wide: true });
const emptyButton = emptyTree.children[0];
const emptyLabel = emptyButton.children[1];
assert.equal(emptyLabel.children[0], dicts.zh.empty);
assert.equal(emptyButton.props["aria-disabled"], "true");
assert.equal(emptyButton.props.disabled, undefined, "native disabled would drop focus");
assert.equal(emptyTree.children[1].props.role, "status");

// Some groups open: the label names the collapse action and the control is live.
const openTree = render({ total: 3, expanded: 2 }, { wide: true });
const openButton = openTree.children[0];
assert.equal(openButton.children[1].children[0], dicts.zh.collapse);
assert.equal(openButton.props["aria-disabled"], undefined);
assert.match(openButton.props["aria-label"], /收起全部工作区/);

// All groups closed: the same control now expands.
const closedTree = render({ total: 3, expanded: 0 }, { wide: true });
assert.equal(closedTree.children[0].children[1].children[0], dicts.zh.expand);

console.log("workspace-collapse-all: client tests passed");
