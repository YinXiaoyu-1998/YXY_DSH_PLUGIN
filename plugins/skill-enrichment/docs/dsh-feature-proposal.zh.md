# 功能建议：给 skill 增加本地化显示元数据

状态：已发布为 DSH Ideas Discussion #10375（https://github.com/deepseek-ai/deepseek-harness/discussions/10375），基于 DSH 0.2.1-rc.2
范围：skill 元数据、skills/list、Web 斜杠菜单
相关：本仓库的客户端参考插件 dsh-skill-enrichment

## 一句话

给 skill 增加两个可选字段：

- displayName：人类可读的菜单标题，缺省回退到 name；
- shortDescription：人类可读的短描述，缺省回退到 description。

模型路由用的 description 和调用用的 name 都不变，只改“人看的菜单”。

## 为什么

Codex 已经支持 agents/openai.yaml：

    interface:
      display_name: "Storytelling · 对白与潜台词"
      short_description: "改善生硬或人物声音雷同的对白……"

DSH 目前只读 SKILL.md 的 name 和 description，所以菜单里显示
storytelling-dialogue 和英文描述。中文作者必须记住英文 id，界面和
本地化文档也对不上。

这不是要把模型路由文本中文化，而是把两类元数据分开：

- 路由元数据：name、description，给模型和 /name 命令用；
- 展示元数据：displayName、shortDescription，给人看的菜单用。

## 现状

- SkillSummary 只有 name / description / whenToUse 等字段；
- 文件系统 provider 只解析 name 和 description；
- SkillEntry 没有展示字段；
- skills/list 只传 name / description；
- ui-skill 只把 name 和 description 映射到菜单候选。

菜单组件其实已经支持 label 字段：它会渲染 label（没有则 name），
再显示原始 name 作为别名，再显示 description。缺的是元数据和传输。

## 建议

### 1. 元数据

SkillSummary / SkillDefinition 增加可选字段：

    displayName?: string
    shortDescription?: string

空字符串视为未提供，不需要所有 provider 都实现。

### 2. SKILL.md

    ---
    name: storytelling-dialogue
    description: Diagnose flat dialogue...
    displayName: "Storytelling · 对白与潜台词"
    shortDescription: "改善生硬或人物声音雷同的对白……"
    ---

过渡期同时接受 display_name / short_description；两者都有且不一致时，
优先 camelCase 并打警告。

### 3. agents/openai.yaml

可以作为第二阶段：当 SKILL.md 没有字段时，读
interface.display_name / interface.short_description。

优先级：

1. SKILL.md
2. agents/openai.yaml
3. name / description

第二阶段需要额外 watch agents/openai.yaml；第一版可以只做 SKILL.md，
再提供一个把 sidecar 同步进 frontmatter 的迁移脚本。

### 4. skills/list 与 UI

SkillEntry 增加同样两个字段；SessionSkillCatalog.list 透传；
ui-skill 映射成：

- label = displayName（没有就不传，回退 name）
- description = shortDescription（没有就不传，回退原 description）
- candidate.name 仍是原始 name，onPick 仍然插入 /name

## 兼容性与诊断

- 字段可选、纯增量；旧 host 没有字段时客户端回退；旧客户端忽略新字段。
- 不改模型 description、skill id、排序、provider 契约或 /name 语法。
- 客户端应做 feature detection：第一次拿到非空 catalog 时检查
  displayName / shortDescription；有就使用原生字段，不要再 patch。
- 参考插件的做法：有原生字段时自动 restore 原来的 candidates，状态记为
  native，不再覆盖官方行为。
- 版本日志：启动时打印插件版本、构建时间、metadata hash、DSH 版本、
  覆盖数量；在 window.__DSH_SKILL_ENRICHMENT__.report() 里返回状态、
  nativeSupport、sourceSeen、candidates 类型、错误等。
- 失败要软：菜单源不存在或形状变了就打印警告并回退英文，不要让界面崩。

## 实现文件

- packages/skill/skill/src/index.ts
- packages/skill/skill-filesystem/src/index.ts
- packages/api/session-controller/src/types.ts
- packages/api/session-controller/src/skill-catalog.ts
- packages/client/ui-skill/src/client/index.ts

测试：

- skill.spec.ts：summary / candidate / definition 保留字段、校验、缺省回退
- skill-filesystem.spec.ts：camelCase / snake_case、空值、非法 YAML
- session-skills.host.spec.ts：SkillEntry 透传、缺省省略
- ui-skill client 测试：label/description 映射、user-only 前缀、onPick 仍用 raw name

## 备选方案

1. 直接把 description 改成中文：会影响模型路由，丢失英文触发词，不推荐。
2. 只做客户端 patch：能解决眼前问题，但依赖内部菜单源，长期不稳。
3. 独立 locale 文件：更通用，但引入语言协商、缓存和 watch 复杂度；
   两个可选字段足够覆盖当前需求。

## 待讨论

1. frontmatter 规范名用 camelCase 还是 snake_case？过渡期可以都支持。
2. 第一版是否读 agents/openai.yaml，还是只做 frontmatter + 迁移脚本？
3. rankByName 是否也要匹配 displayName？会改变菜单排序语义，建议后续再做。
4. 是否需要给 skills/list 增加 schemaVersion？当前纯增量字段用 feature detection 即可。
5. disable-model-invocation 的 user-only 前缀应放在 shortDescription 外面，保持现状。

## 参考实现状态

本地有一个客户端参考插件（dsh-skill-enrichment v0.3.0）：它读取
agents/openai.yaml、只在没有原生字段时 patch 菜单、打印版本日志、
暴露 report()，并在检测到原生字段时自动进入 native 状态。

核心 patch 没有提交 PR：CONTRIBUTING.md 明确说目前不接受外部 pull request。
本文按官方推荐的 Ideas discussion 路径准备；如果维护者需要，可以附上
生产代码 diff 并按上面的文件清单拆分。
