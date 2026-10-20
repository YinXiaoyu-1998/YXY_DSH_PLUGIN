window.__ModuleLoader__.load({
  id: "dsh-skill-enrichment",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    // Generated from ~/.agents/skills/*/agents/openai.yaml by scripts/sync-metadata.mjs.
    const META = __SKILL_META__;
    const BUILD = __BUILD_INFO__;

    const inject = ["inputTriggers"];
    const SOURCE = { trigger: "/", name: "skill" };
    const MARK = "__dsh_skill_display_zh__";

    const state = {
      status: "starting",
      patched: false,
      nativeChecked: false,
      nativeSupport: false,
      sourceSeen: false,
      lastCheck: null,
      error: null
    };

    function dshVersion() {
      const boot = window.__DSH_BOOT__;
      if (!boot || typeof boot !== "object") return "unknown";
      return String(boot.version || boot.dshVersion || "unknown");
    }

    function log(message) {
      console.info("[skill-enrichment] " + message);
    }

    function warn(message) {
      console.warn("[skill-enrichment] " + message);
    }

    function counts() {
      const names = Object.keys(META);
      return {
        metadataCount: names.length,
        storytellingCount: names.filter((name) => name.indexOf("storytelling-") === 0).length
      };
    }

    function findSource(service) {
      if (!service || !service.live || !Array.isArray(service.live.sources)) return undefined;
      return service.live.sources.find(
        (item) => item.trigger === SOURCE.trigger && item.name === SOURCE.name
      );
    }

    function diagnose(service) {
      const source = findSource(service);
      const c = counts();
      state.lastCheck = new Date().toISOString();
      return {
        plugin: "dsh-skill-enrichment",
        version: BUILD.version,
        builtAt: BUILD.builtAt,
        metadataHash: BUILD.metadataHash,
        dshVersion: dshVersion(),
        status: state.status,
        nativeSupport: state.nativeSupport,
        nativeChecked: state.nativeChecked,
        patched: state.patched,
        sourceSeen: source !== undefined,
        candidates: source ? typeof source.candidates : "missing",
        metadataCount: c.metadataCount,
        storytellingCount: c.storytellingCount,
        error: state.error
      };
    }

    function publish(service) {
      window.__DSH_SKILL_ENRICHMENT__ = {
        version: BUILD.version,
        build: BUILD,
        get status() { return state.status; },
        diagnose: () => diagnose(service),
        report: () => JSON.stringify(diagnose(service), null, 2)
      };
    }

    function isNative(items) {
      return items.some((item) =>
        typeof item.displayName === "string" ||
        typeof item.shortDescription === "string" ||
        (typeof item.label === "string" && item.label !== item.name)
      );
    }

    /**
     * Add display_name/short_description to the existing slash-menu candidates.
     * The actual skill name stays in item.name, so picking a row still inserts
     * "/<skill-name> " through the original onPick implementation.
     *
     * If a newer DSH already exposes displayName/shortDescription (or maps them
     * to label), this patch detects it on the first non-empty catalog and
     * restores the original method, leaving native behavior alone.
     */
    function apply(ctx) {
      state.status = "starting";
      state.patched = false;
      state.nativeChecked = false;
      state.nativeSupport = false;
      state.sourceSeen = false;
      state.lastCheck = null;
      state.error = null;
      const service = ctx.inputTriggers ?? (ctx.get ? ctx.get("inputTriggers") : undefined);
      const c = counts();
      log(
        "v" + BUILD.version + " loaded (build " + BUILD.builtAt + ", hash " + BUILD.metadataHash + "); " +
        "DSH " + dshVersion() + "; " + c.metadataCount + " labels (" + c.storytellingCount + " storytelling)"
      );
      if (dshVersion() !== "unknown" && dshVersion().indexOf("0.2.") !== 0) {
        log("note: this build targets DSH 0.2.x; running " + dshVersion() + " - verify the menu shape");
      }
      publish(service);

      if (!service || !service.live || !Array.isArray(service.live.sources)) {
        state.status = "inactive";
        state.error = "inputTriggers service unavailable";
        warn("inputTriggers service is unavailable; plugin inactive");
        return;
      }

      let restore = null;
      let timer = null;
      let attempts = 0;

      const patch = (source) => {
        if (source[MARK] === true) return true;
        if (typeof source.candidates !== "function") {
          state.status = "inactive";
          state.error = "skill source has no candidates()";
          warn("skill source has no candidates(); plugin inactive");
          return false;
        }

        const original = source.candidates;
        const patched = async function (session, options) {
          const items = await original.call(this, session, options);
          if (!Array.isArray(items)) return items;

          if (!state.nativeChecked && items.length > 0) {
            state.nativeChecked = true;
            if (isNative(items)) {
              state.nativeSupport = true;
              state.status = "native";
              state.error = null;
              if (restore) restore();
              log("native displayName/shortDescription detected; plugin idle");
              return items;
            }
          }

          state.patched = true;
          return items.map((item) => {
            const meta = META[item.name];
            if (!meta) return item;
            return { ...item, label: meta.label, description: meta.description };
          });
        };

        source.candidates = patched;
        source[MARK] = true;
        state.sourceSeen = true;
        state.patched = true;
        state.status = "active";
        state.error = null;
        restore = () => {
          if (source.candidates === patched) source.candidates = original;
          delete source[MARK];
          state.patched = false;
        };
        log("patched /skill menu source; " + c.metadataCount + " labels available");
        return true;
      };

      const attempt = () => {
        const source = findSource(service);
        if (source === undefined) return false;
        state.sourceSeen = true;
        return patch(source);
      };

      if (!attempt()) {
        state.status = "waiting";
        timer = window.setInterval(() => {
          attempts += 1;
          if (attempt()) {
            window.clearInterval(timer);
            timer = null;
          } else if (attempts >= 100) {
            window.clearInterval(timer);
            timer = null;
            state.status = "inactive";
            state.error = "skill source not found after 10s";
            warn("skill source not found; plugin inactive");
          }
        }, 100);
      }

      ctx.effect(() => () => {
        if (timer) window.clearInterval(timer);
        if (restore) restore();
        state.status = "disposed";
        log("disposed");
      }, "skill-enrichment");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
