# [Feature] 为 skill 增加本地化展示元数据（displayName / shortDescription）

Posted: https://github.com/deepseek-ai/deepseek-harness/discussions/10375

## 原始动机

我有一些英文 skill，routing 文本需要保持英文（或者来自上游，不适合直接修改），但我希望 UI 菜单能显示中文名称和简短说明，方便浏览和选择。

这个需求不限于中文，任何语言都适用：routing 元数据保持稳定，展示元数据按读者语言提供。

## 当前问题

DSH 目前把 routing 和展示混在同一组字段里：

- name：/name 使用的 kebab-case id；
- description：Web 斜杠菜单显示的 routing 文本。

Codex 已经在 agents/openai.yaml 里维护展示元数据：

    interface:
      display_name: "代码审查"
      short_description: "审查变更的正确性、边界条件和安全风险。"

DSH 不读这个 sidecar。一个包含几十个英文 skill 的目录，在 / 菜单里仍然显示英文 id 和英文 description。用户需要记住英文 id，界面和本地化文档也对不上。

这不是要求把模型路由文本中文化，而是把两类元数据分开：

- routing 元数据：name、description，给模型和 /name 命令用；
- 展示元数据：displayName、shortDescription，给人看的菜单用。

## 建议

给 skill 元数据增加两个可选字段：

- displayName：人类可读的菜单标题；缺省回退 name；
- shortDescription：人类可读的短描述；缺省回退 description。

建议的来源优先级：

1. SKILL.md frontmatter 的 displayName / shortDescription（主方案）；
2. agents/openai.yaml 的 interface.display_name / interface.short_description（兼容 Codex，可选第二阶段）；
3. name / description 回退。

SKILL.md 示例：

    ---
    name: code-review
    description: Review a change for correctness, edge cases, and security risks.
    displayName: "代码审查"
    shortDescription: "审查变更的正确性、边界条件和安全风险。"
    ---

建议行为：

- SkillSummary 和 SkillDefinition 增加可选 displayName / shortDescription；
- SkillEntry 和 skills/list 透传这两个字段；
- ui-skill 把 displayName 映射到 label，把 shortDescription 映射到 description；
- candidate.name 仍然是原始 skill 名，onPick 仍然插入 /name；
- 模型路由用的 description、排序、provider 契约和 /name 语法都不变；
- 空字符串视为未提供；
- 过渡期同时接受 camelCase 和 snake_case。

斜杠菜单组件已经支持 label：它会渲染 label（没有则 name），再显示原始 name 作为别名，再显示 description。缺的是元数据和传输，不是 UI。

## 参考实现

参考插件已公开：

- 仓库：https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN
- 插件：https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/tree/main/plugins/skill-display-enrichment
- Proposal：https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/blob/main/plugins/skill-display-enrichment/docs/dsh-feature-proposal.zh.md
- Reference patch：https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/blob/main/plugins/skill-display-enrichment/docs/dsh-patch.diff

插件在构建时读取 agents/openai.yaml，只在没有原生展示字段时 patch ui-skill 的 candidates，检测到原生字段后会自动 restore 原始方法。

## 兼容性与诊断

字段可选、纯增量：

- 旧 host 没有字段时，客户端回退 name / description；
- 旧 client 忽略新字段；
- 不实现这些字段的 provider 仍然有效。

客户端应该做 feature detection，而不是用版本号硬判断：第一次拿到非空 skills/list 结果时检查 displayName / shortDescription；有就使用原生字段，不要再 patch。

参考插件会在启动时打印版本日志，并暴露一个调试报告：

    [skill-display-enrichment] v0.4.0 loaded (build ..., hash ...); DSH 0.2.1-rc.2; ...
    window.__DSH_SKILL_DISPLAY_ENRICHMENT__.report()

报告包含插件版本、构建时间、metadata hash、DSH 版本、状态（starting / waiting / active / native / inactive / disposed）、nativeSupport、sourceSeen、candidates 类型、metadata 数量和最后一次错误。

如果 DSH 原生支持这些字段，插件会在第一次非空 catalog 时检测到，恢复原始 candidates，并进入 native 状态。这个模式也建议其他兼容性插件采用。

## 验证

在 DSH 0.2.1-rc.2 的 Web profile 中验证：

- 菜单显示中文 label 和中文简述；
- 选择后插入原始 /name；
- 插件测试覆盖 active、native、late-source、dispose 四种状态；
- report() 能返回版本、构建、DSH 版本和状态。

核心 patch 没有作为 PR 提交，因为 CONTRIBUTING.md 明确说目前不接受外部 pull request。本文按官方推荐的 Ideas discussion 路径提交。

## 设计问题

1. frontmatter 规范字段名用 camelCase 还是 snake_case？过渡期可以都支持，但文档应该推荐一个。
2. 第一版是否读 agents/openai.yaml，还是只做 frontmatter + 迁移脚本？sidecar 需要额外的 watch 规则。
3. rankByName 是否也应该匹配 displayName？本地化搜索有用，但会改变菜单排序语义，建议作为后续改进。
4. skills/list 是否需要 schemaVersion？对于纯增量字段，feature detection 可能已经足够。
5. disable-model-invocation 的 user-only 前缀应该放在 shortDescription 外面，保持现有行为。

## 涉及文件

生产代码：

- packages/skill/skill/src/index.ts
- packages/skill/skill-filesystem/src/index.ts
- packages/api/session-controller/src/types.ts
- packages/api/session-controller/src/skill-catalog.ts
- packages/client/ui-skill/src/client/index.ts

测试：

- packages/skill/skill/tests/skill.spec.ts
- packages/skill/skill-filesystem/tests/skill-filesystem.spec.ts
- packages/api/session-controller/tests/session-skills.host.spec.ts
- packages/client/ui-skill tests

文档：

- packages/skill/README.md
- packages/client/ui-skill/README.md
