/**
 * Web client half of dsh-workspace-collapse-all.
 *
 * Why this shape: DSH 0.2.x declares no seat inside the workspace section
 * header (`工作区`), and the browser's group-expansion state lives in
 * ui-workspace's private persisted store (`dsh.workspace.view.v5`), not in a
 * Client service. The supported, stable part of that boundary is the rendered
 * workspace rows: every project row is a treeitem whose own click toggles its
 * group. This entry therefore reads `aria-expanded` from those rows and clicks
 * the ones that must flip, which keeps the sidebar's animation, nested-tree
 * handling and persistence in the host's hands.
 */
window.__ModuleLoader__.load({
  id: "dsh-workspace-collapse-all",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const React = require("react");
    const h = React.createElement;

    const VERSION = "0.1.0";
    const NS = "workspace-collapse-all";
    const STYLE_ID = "dsh-workspace-collapse-all-style";
    /** The browser renders every group header with this key prefix. */
    const ROW_SELECTOR = "[data-row-key^=\"workspace:\"]";
    /** The list seat that owns the rows. */
    const LIST_AREA_SELECTOR = "[data-sidebar-list-area]";
    /** Nesting bound for tree mode: one pass per level, plus slack. */
    const MAX_EXPAND_PASSES = 8;
    /** How many frames a click gets to reach the row's attributes. */
    const SETTLE_FRAMES = 3;
    /** Attachment retry for a sidebar that mounts after this entry. */
    const ATTACH_ATTEMPTS = 25;
    const ATTACH_INTERVAL_MS = 200;

    const zh = {
      collapse: "收起全部工作区",
      expand: "展开全部工作区",
      empty: "当前没有工作区",
      collapsed: "已收起 {n} 个工作区",
      expanded: "已展开 {n} 个工作区",
      failed: "未能切换工作区，侧栏结构可能已变化",
    };
    const en = {
      collapse: "Collapse workspaces",
      expand: "Expand workspaces",
      empty: "No workspaces here",
      collapsed: "Collapsed {n} workspaces",
      expanded: "Expanded {n} workspaces",
      failed: "Could not toggle workspaces; the sidebar layout may have changed",
    };

    const state = {
      status: "idle",
      lastAction: null,
      lastCount: 0,
      lastError: null,
    };

    function listArea() {
      if (typeof document === "undefined" || document === null) return null;
      return document.querySelector(LIST_AREA_SELECTOR);
    }

    /** Read the visible group rows under `root`, in document order. */
    function workspaceRows(root) {
      if (!root || typeof root.querySelectorAll !== "function") return [];
      return Array.prototype.slice.call(root.querySelectorAll(ROW_SELECTOR));
    }

    function isExpanded(row) {
      return row.getAttribute("aria-expanded") === "true";
    }

    function rowKey(row) {
      const key = typeof row.getAttribute === "function" ? row.getAttribute("data-row-key") : null;
      return key === null ? "" : key;
    }

    /** Count visible groups and how many are currently open. */
    function summarize(root) {
      const rows = workspaceRows(root);
      let expanded = 0;
      for (const row of rows) if (isExpanded(row)) expanded += 1;
      return { total: rows.length, expanded };
    }

    function click(row) {
      if (row && typeof row.click === "function") row.click();
    }

    function nextFrame() {
      return new Promise((resolve) => {
        if (typeof requestAnimationFrame === "function") {
          requestAnimationFrame(() => { resolve(); });
        } else {
          setTimeout(resolve, 16);
        }
      });
    }

    /**
     * Give the host time to write `aria-expanded` back. Some builds flush the
     * view store after a frame, so a single wait could leave a row looking
     * closed and get it clicked again on the next pass.
     */
    async function settle(rows) {
      for (let attempt = 0; attempt < SETTLE_FRAMES; attempt += 1) {
        if (rows.every((row) => isExpanded(row))) return;
        await nextFrame();
      }
    }

    function collapseAll(root) {
      const rows = workspaceRows(root).filter(isExpanded);
      for (const row of rows) click(row);
      return rows.length;
    }

    /**
     * Open every group, including groups that only mount after their parent
     * opens. Each row is clicked at most once per run, so a late attribute
     * write cannot make the same row flip back.
     */
    async function expandAll(root) {
      const clicked = new Set();
      let count = 0;
      for (let pass = 0; pass < MAX_EXPAND_PASSES; pass += 1) {
        const rows = workspaceRows(root).filter((row) => !isExpanded(row) && !clicked.has(rowKey(row)));
        if (rows.length === 0) break;
        for (const row of rows) {
          clicked.add(rowKey(row));
          click(row);
        }
        count += rows.length;
        await settle(rows);
      }
      return count;
    }

    /**
     * Flip every visible group: collapse while any group is open, expand once
     * they are all closed. The direction comes from the rows themselves, so a
     * stale render can never send the action the other way.
     */
    async function toggleAll() {
      const root = listArea();
      if (root === null) {
        state.lastError = "list-area-missing";
        return null;
      }
      const before = summarize(root);
      if (before.total === 0) {
        state.lastError = "no-rows";
        return null;
      }
      state.lastError = null;
      const action = before.expanded > 0 ? "collapse" : "expand";
      const count = action === "collapse" ? collapseAll(root) : await expandAll(root);
      await nextFrame();
      const after = summarize(root);
      // A click that changed nothing means this release no longer routes the
      // row through a plain click; report it instead of looking inert.
      const failed = action === "collapse"
        ? before.expanded > 0 && after.expanded >= before.expanded
        : after.expanded <= before.expanded && after.total <= before.total;
      state.status = "active";
      state.lastAction = action;
      state.lastCount = count;
      if (failed) state.lastError = "no-effect";
      return { action, count, before, after, failed };
    }

    const CSS = [
      ".dshwca-entry{box-sizing:border-box;position:relative;flex:0 1 auto;display:flex;align-items:center;min-width:36px;max-width:100%;height:36px;margin:0}",
      ".dshwca-button{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:auto;max-width:100%;min-width:0;height:36px;min-height:36px;margin:0;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:20px;text-align:start;cursor:pointer}",
      ".dshwca-button:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshwca-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}",
      ".dshwca-button[aria-disabled=\"true\"]{opacity:.45;cursor:default}",
      ".dshwca-button[aria-disabled=\"true\"]:hover{background:transparent}",
      ".dshwca-icon{box-sizing:border-box;flex:0 0 16px;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary)}",
      ".dshwca-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dshwca-status{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;white-space:nowrap;clip:rect(0 0 0 0);clip-path:inset(50%)}",
    ].join("");

    /** Insert the entry stylesheet once; the returned disposer removes it. */
    function installStyles() {
      if (typeof document === "undefined" || document === null) return () => {};
      if (document.getElementById(STYLE_ID) !== null) return () => {};
      const element = document.createElement("style");
      element.id = STYLE_ID;
      element.textContent = CSS;
      document.head.appendChild(element);
      return () => {
        if (element.parentNode !== null && element.parentNode !== undefined) {
          element.parentNode.removeChild(element);
        }
      };
    }

    function scheduleFrame(callback) {
      if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
      return setTimeout(callback, 16);
    }

    function cancelFrame(handle) {
      if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(handle);
      else clearTimeout(handle);
    }

    /**
     * Track the visible groups so the label states what the next click does.
     *
     * The rows are host markup that the sidebar replaces as it changes width,
     * so the row observer follows the current list seat: a body-level observer
     * re-attaches when that seat is re-created, and reads are frame-coalesced
     * and only committed when the counts actually change.
     */
    function useWorkspaceSummary() {
      const [summary, setSummary] = React.useState({ total: 0, expanded: 0 });
      React.useEffect(() => {
        let root = null;
        let rowObserver = null;
        let bodyObserver = null;
        let retry = null;
        let frame = null;
        let attempts = 0;
        const commit = () => {
          frame = null;
          const next = summarize(listArea());
          setSummary((previous) => (
            previous.total === next.total && previous.expanded === next.expanded ? previous : next
          ));
        };
        const schedule = () => {
          if (frame === null) frame = scheduleFrame(commit);
        };
        const attach = () => {
          const next = listArea();
          if (next === root) return root !== null;
          if (rowObserver !== null) {
            rowObserver.disconnect();
            rowObserver = null;
          }
          root = next;
          if (root === null) return false;
          if (typeof MutationObserver === "function") {
            rowObserver = new MutationObserver(schedule);
            rowObserver.observe(root, {
              subtree: true,
              childList: true,
              attributes: true,
              attributeFilter: ["aria-expanded", "data-row-key"],
            });
          }
          commit();
          return true;
        };
        if (!attach()) {
          retry = setInterval(() => {
            attempts += 1;
            if (attach() || attempts >= ATTACH_ATTEMPTS) {
              clearInterval(retry);
              retry = null;
            }
          }, ATTACH_INTERVAL_MS);
        }
        if (typeof MutationObserver === "function" && typeof document !== "undefined" && document.body) {
          bodyObserver = new MutationObserver(() => { attach(); });
          bodyObserver.observe(document.body, { childList: true, subtree: true });
        }
        return () => {
          if (retry !== null) clearInterval(retry);
          if (frame !== null) cancelFrame(frame);
          if (rowObserver !== null) rowObserver.disconnect();
          if (bodyObserver !== null) bodyObserver.disconnect();
        };
      }, []);
      return summary;
    }

    /** Double chevron: up while collapsing, down while expanding. */
    function EntryIcon(props) {
      const up = props.up === true;
      const near = up ? "M4 9.5 8 5.5l4 4" : "M4 2.5 8 6.5l4-4";
      const far = up ? "M4 14 8 10l4 4" : "M4 7 8 11l4-4";
      return h("span", { className: "dshwca-icon", "aria-hidden": "true" },
        h("svg", {
          viewBox: "0 0 16 16", width: 16, height: 16, fill: "none",
          stroke: "currentColor", strokeWidth: 1.4,
          strokeLinecap: "round", strokeLinejoin: "round",
        },
        h("path", { d: near }),
        h("path", { d: far })));
    }

    function Entry(props) {
      // Fail closed: a release that stops passing `wide` must not paint a
      // text button inside the 56px rail.
      const wide = props.wide === true;
      const t = typeof props.t === "function" ? props.t : (key) => key;
      const summary = useWorkspaceSummary();
      const [busy, setBusy] = React.useState(false);
      const [frozen, setFrozen] = React.useState(null);
      const [notice, setNotice] = React.useState("");
      if (!wide) return null;
      const empty = summary.total === 0;
      const collapsing = summary.expanded > 0;
      // While a multi-level expansion runs, the live counts flip after the
      // first pass; freeze the label so it keeps naming the action in flight.
      const held = busy && frozen !== null ? frozen : null;
      const label = held !== null
        ? held.label
        : empty ? t("empty") : collapsing ? t("collapse") : t("expand");
      const up = held !== null ? held.up : collapsing;
      const blocked = empty || busy;
      const title = empty ? t("empty") : label;
      const activate = () => {
        if (blocked) return;
        setFrozen({ label: collapsing ? t("collapse") : t("expand"), up: collapsing });
        setBusy(true);
        setNotice("");
        Promise.resolve(toggleAll()).then((result) => {
          if (result === null || result.failed === true) {
            setNotice(t("failed"));
          } else {
            setNotice(result.action === "collapse"
              ? t("collapsed", { n: result.count })
              : t("expanded", { n: result.count }));
          }
        }).catch(() => {
          setNotice(t("failed"));
        }).finally(() => {
          setBusy(false);
          setFrozen(null);
        });
      };
      return h("div", { className: "dshwca-entry" },
        h("button", {
          type: "button",
          className: "dshwca-button",
          title,
          "aria-label": label,
          "aria-disabled": blocked ? "true" : undefined,
          onClick: activate,
          "data-dsh-workspace-collapse-all": "",
        },
        h(EntryIcon, { up }),
        h("span", { className: "dshwca-label" }, label)),
        h("span", { className: "dshwca-status", role: "status", "aria-live": "polite" }, notice));
    }

    function publish() {
      window.__DSH_WORKSPACE_COLLAPSE_ALL__ = {
        version: VERSION,
        state,
        toggleAll,
        summarize: () => summarize(listArea()),
        rows: () => workspaceRows(listArea()).length,
        report: () => JSON.stringify({
          version: VERSION,
          status: state.status,
          lastAction: state.lastAction,
          lastCount: state.lastCount,
          lastError: state.lastError,
          summary: summarize(listArea()),
        }, null, 2),
      };
    }

    function apply(ctx) {
      state.status = "starting";
      state.lastError = null;
      if (ctx === undefined || ctx === null || ctx.slots === undefined) {
        state.status = "inactive";
        state.lastError = "slots-unavailable";
        console.warn("workspace-collapse-all: slots service unavailable; plugin inactive");
        return;
      }
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "workspace-collapse-all: dictionaries");
      ctx.effect(installStyles, "workspace-collapse-all: styles");
      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
        name: "sidebar.footer.action",
        id: "workspace-collapse-all",
        order: -10,
        locale: NS,
      }, Entry));
      ctx.effect(() => () => { state.status = "disposed"; }, "workspace-collapse-all: status");
      state.status = "active";
      publish();
      console.log("workspace-collapse-all v" + VERSION + " loaded; sidebar.footer.action registered");
    }

    exports.inject = ["slots", "locale"];
    exports.apply = apply;
    return module.exports;
  },
});
