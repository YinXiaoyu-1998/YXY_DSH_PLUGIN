window.__ModuleLoader__.load({
  id: "dsh-skill-display-enrichment",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    // Generated from ~/.agents/skills/*/agents/openai.yaml by scripts/sync-metadata.mjs.
    const META = {
  "alexross-illustration": {
    "label": "AlexRoss 插画",
    "description": "写实手绘史诗插画：文字生成、角色外观检索、参考图组合与照片重绘"
  },
  "codex-reset-credits": {
    "label": "Codex Reset Credits",
    "description": "Query Codex banked reset credits and expiration times."
  },
  "diagram-design": {
    "label": "Diagram Design",
    "description": "绘制44类品牌风格图表，涵盖架构、流程、组织关系与数据图，支持导入重绘及HTML/SVG输出。"
  },
  "download-meituan-business-data": {
    "label": "美团营业数据下载",
    "description": "按营业日期下载美团营业数据原始报表，并按需上传 SMEDC"
  },
  "download-meituan-delivery-ledger": {
    "label": "美团收货单下载",
    "description": "按收货日期逐页下载美团收货单原文件，并按需上传 SMEDC"
  },
  "download-meituan-dish-sales": {
    "label": "美团菜品销售下载",
    "description": "按营业日期下载美团菜品销售原始报表，并按需上传 SMEDC"
  },
  "fetch-meituan-complete-dataset": {
    "label": "Fetch Meituan Complete Dataset",
    "description": "Export full Meituan SaaS report datasets to the Desktop."
  },
  "hatch-pet": {
    "label": "Hatch Pet",
    "description": "Hatch style-flexible Codex pets"
  },
  "json-canvas": {
    "label": "Obsidian · 关系画布",
    "description": "创建和编辑节点、连线与分组画布，绘制关系图、事件图和时间线示意。"
  },
  "obsidian-bases": {
    "label": "Obsidian · 资料筛选表",
    "description": "创建可筛选的 Obsidian 资料表，用属性、公式和分组整理笔记信息。"
  },
  "obsidian-markdown": {
    "label": "Obsidian · 笔记与档案",
    "description": "维护 Obsidian 笔记、属性与双向链接，组织角色、地点和事件档案。"
  },
  "pdf": {
    "label": "PDF Skill",
    "description": "Create, edit, and review PDFs"
  },
  "positioning-diagnosis": {
    "label": "Positioning Diagnosis",
    "description": "Diagnose product positioning from materials"
  },
  "reply-meituan-reviews": {
    "label": "美团评价回复",
    "description": "双渠道九列审阅表，保留已有回复、标记本次新稿，仅为未回复有正文评价起草，审核后发布"
  },
  "review-responder": {
    "label": "Review Responder",
    "description": "以自然的店主口吻撰写好评、中评和差评回复，回应具体细节，减少套话并避免公开争辩。"
  },
  "site-selection-report": {
    "label": "商业选址报告",
    "description": "从多类选址材料生成专业中文餐饮门店评估HTML报告"
  },
  "smedc-business-analysis": {
    "label": "SMEDC Business Analysis",
    "description": "SMEDC reports with evidence-backed operating advice"
  },
  "smedc-delivery-ledger": {
    "label": "SMEDC Delivery Ledger",
    "description": "SMEDC daily PDF archives and certificate photos"
  },
  "smedc-mcp": {
    "label": "企业数据中枢 SMEDC MCP",
    "description": "管理员上传文件，员工按权限查询企业资料（通过官方远程 MCP 启动器）"
  },
  "storytelling-belief-systems": {
    "label": "Storytelling · 宗教与信仰设定",
    "description": "为虚构世界设计宗教、神话、仪式与信仰组织，连接社会结构和人物动机。"
  },
  "storytelling-character-arc": {
    "label": "Storytelling · 人物成长与转变",
    "description": "设计人物成长、堕落或坚守信念的过程，让动机与性格转变更有说服力。"
  },
  "storytelling-dialogue": {
    "label": "Storytelling · 对白与潜台词",
    "description": "改善生硬或人物声音雷同的对白，增加潜台词、关系张力与角色辨识度。"
  },
  "storytelling-outline-collaborator": {
    "label": "Storytelling · 大纲与章节结构",
    "description": "一起设计故事大纲、章节结构与情节节点，梳理人物线并调整叙事节奏。"
  },
  "storytelling-prose-style": {
    "label": "Storytelling · 语言与文风打磨",
    "description": "打磨用词、句式、段落节奏与叙述声音，解决语言平淡和文风不一致的问题。"
  },
  "storytelling-revision": {
    "label": "Storytelling · 初稿修改",
    "description": "从结构、人物和节奏到句子与一致性，分层修改小说初稿并确定修改重点。"
  },
  "storytelling-scene-sequencing": {
    "label": "Storytelling · 场景安排与节奏",
    "description": "梳理场景目标、冲突与后果，调整场景衔接和快慢节奏，增强阅读动力。"
  },
  "storytelling-settlement-design": {
    "label": "Storytelling · 城市与城镇设定",
    "description": "为虚构世界设计城市、城镇与街区，让地理布局、发展历史和生活逻辑可信。"
  },
  "storytelling-shared-world": {
    "label": "Storytelling · 故事设定库管理",
    "description": "维护人物、地点、历史与设定档案，区分正式设定和提议，记录来源并提示冲突。"
  },
  "storytelling-story-collaborator": {
    "label": "Storytelling · 正文创作与续写",
    "description": "一起创作小说正文、对白和场景，续写已有片段并探索不同的剧情方案。"
  },
  "storytelling-story-sense": {
    "label": "Storytelling · 故事问题诊断",
    "description": "诊断故事卡住或情节失效的原因，判断当前最需要解决的问题并提出改法。"
  },
  "storytelling-systemic-worldbuilding": {
    "label": "Storytelling · 世界观构建",
    "description": "从科技、魔法或历史变化出发，推演对经济、文化与社会制度的连锁影响。"
  },
  "storytelling-worldbuilding": {
    "label": "Storytelling · 世界观问题诊断",
    "description": "检查虚构世界的制度、经济、文化与设定逻辑，找出单薄或不合理之处。"
  }
};
    const BUILD = {
  "plugin": "dsh-skill-display-enrichment",
  "version": "0.4.0",
  "builtAt": "2026-10-20T05:00:52.716Z",
  "metadataHash": "4439d703fabd",
  "metadataCount": 32,
  "storytellingCount": 13
};

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
      console.info("[skill-display-enrichment] " + message);
    }

    function warn(message) {
      console.warn("[skill-display-enrichment] " + message);
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
        plugin: "dsh-skill-display-enrichment",
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
      window.__DSH_SKILL_DISPLAY_ENRICHMENT__ = {
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
      }, "skill-display-enrichment");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
