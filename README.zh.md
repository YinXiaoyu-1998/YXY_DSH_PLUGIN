<p align="center">
  <img src="docs/logo.svg" alt="" width="88">
</p>

<h1 align="center">YXY DSH 插件集</h1>

<p align="center">
  为 <strong>DeepSeek Harness</strong>（DSH）写的小而专注的插件。按包名安装，不需要先克隆仓库。
</p>

<p align="center">
  <a href="README.md">English</a>
  &nbsp;·&nbsp;
  <strong>中文</strong>
  &nbsp;·&nbsp;
  <a href="README.ja.md">日本語</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License: MIT"></a>
  <a href="https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/actions/workflows/test.yml"><img src="https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://www.npmjs.com/package/dsh-workspace-collapse-all"><img src="https://img.shields.io/badge/DSH-0.2.x-4D6BFE" alt="DSH 0.2.x"></a>
</p>

## 插件列表

| 插件 | 作用 | 版本 |
| --- | --- | --- |
| **[workspace-collapse-all](plugins/workspace-collapse-all/README.md)** | 在侧栏账号行上方加一个常驻入口，一键收起或展开所有工作区（项目）。它点的是侧栏自己的行，所以原生展开动画和保存的视图状态都保留。 | [![npm](https://img.shields.io/npm/v/dsh-workspace-collapse-all?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-workspace-collapse-all) |
| **[skill-display-enrichment](plugins/skill-display-enrichment/README.md)** | 把每个 skill 的 `agents/openai.yaml` 里本地化的 `display_name` / `short_description` 显示到 `/` 技能菜单，选中后插入的仍然是真实 skill 名。若某个 DSH 版本原生支持，它会自动退让。 | [![npm](https://img.shields.io/npm/v/dsh-skill-display-enrichment?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-skill-display-enrichment) |

两个包都是 MIT，发布在 `registry.npmjs.org`。这个仓库是插件集合，不是单一 npm 包：
`plugins/` 下每个目录都能独立安装。

## 安装

**DSH Desktop** —— 打开 **设置 → 插件 → 添加插件**，填包名，安装后重启或重新加载插件列表。

| 插件 | 填这个 |
| --- | --- |
| workspace-collapse-all | `dsh-workspace-collapse-all` |
| skill-display-enrichment | `dsh-skill-display-enrichment` |

同一个输入框也接受带版本（`dsh-workspace-collapse-all@0.1.0`）、压缩包、指向包根的 Git
地址，或本地绝对路径；日常安装用包名即可。

**命令行**：

```sh
dsh plugin --profile desktop add dsh-workspace-collapse-all
dsh plugin --profile desktop add dsh-skill-display-enrichment
```

**开发时**用本地目录安装，它会 link 仓库，改动即时生效：

```sh
git clone https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN.git
cd YXY_DSH_PLUGIN
dsh plugin --profile probe-topic add "$PWD/plugins/workspace-collapse-all"
```

## 各插件做什么

### workspace-collapse-all

在 `sidebar.footer.action`（账号行上方）加一个**纯图标**常驻入口，排版与 `ds-harness-remote`
的入口一致：36px 行、36×36 命中区、8px 圆角，悬停与聚焦处理相同。

- 有项目展开时双 chevron 向上，点一下全部收起；
- 全部收起后 chevron 向下，点一下逐层展开（含嵌套文件夹）；
- 不显示文字，文案放在悬停提示与无障碍名称里：**收起全部工作区**、**展开全部工作区**、
  **当前没有工作区**；
- 扁平列表模式或正在搜索会话时变暗，仍可聚焦；
- 侧栏收成 56px 窄条（rail）时隐藏，因为那里根本不渲染列表。

它依赖侧栏工作区行的结构。某个 DSH 版本改了这些标记时，入口会自行禁用，或通过读屏
播报失败原因——不会乱点，也不会改动任何会话。

### skill-display-enrichment

Codex 风格的 skill 本来就在 `agents/openai.yaml` 里带显示元数据，而 DSH 只读 `name` 和
`description`。这个插件找到 `ui-skill` 注册的 `/` 菜单源，保留它的筛选与插入逻辑，只用
YAML 补上 `label` 和 `description`：菜单显示为本地化名称 + 简短说明，插入的仍然是
`/skill-name`。

- 失败即退让：如果将来某个 DSH 自己支持显示名，插件会在第一个非空目录上检测到并保持空闲。
- 诊断：`window.__DSH_SKILL_DISPLAY_ENRICHMENT__.report()` 会给出菜单源、DSH 版本、元数据条数和状态。
- 背景：[功能建议](plugins/skill-display-enrichment/docs/dsh-feature-proposal.zh.md)
  · [讨论](https://github.com/deepseek-ai/deepseek-harness/discussions/10375)。

## 仓库结构

```text
YXY_DSH_PLUGIN/
├── README.md  README.zh.md  README.ja.md
├── docs/
│   ├── adding-a-plugin.md
│   └── logo.svg
└── plugins/
    ├── README.md
    ├── skill-display-enrichment/
    └── workspace-collapse-all/
```

`plugins/<name>/` 每个目录都是一个自包含的 DSH bundle：`package.json`（含
`dsh.bundle.patch`，可选 `dsh.client`）、`cordis.patch.yml`、`lib/`、`locale/`、
`icon.svg`、`LICENSE`，加上自己的测试与 README。目录约定、命名与发布清单见
[`plugins/README.md`](plugins/README.md)，逐步操作见
[`docs/adding-a-plugin.md`](docs/adding-a-plugin.md)。

## 开发

在仓库根目录跑全部插件测试：

```sh
npm test
```

每个插件仍然负责自己的命令。以 `skill-display-enrichment` 为例：

```sh
cd plugins/skill-display-enrichment
node scripts/sync-metadata.mjs   # 重新生成内嵌的显示文案
npm test
```

CI 会在 push 和 pull request 时运行 `npm test`。集成测试请用一次性的 DSH profile，
探针通过之前不要改 `desktop` profile。

## 兼容性

DSH 0.2 还是预览版，插件 API 仍在演化。本仓库的插件会：

- 在 `package.json` 声明 peer 范围，宿主已内置的包按 optional 处理；
- 对需要的宿主接口做 feature detection，不假设私有字段存在；
- 失败时打印警告并回退，保持原生 UI 可用；
- 记录自身版本，并提供一致的诊断入口。

具体状态机见各插件 README；`skill-display-enrichment` 另见
[`docs/compatibility-diagnostics.md`](plugins/skill-display-enrichment/docs/compatibility-diagnostics.md)。

## 许可

[MIT](LICENSE)。这是社区项目，不是 DeepSeek 官方产品；DeepSeek 及相关名称与标识
归其各自所有者。
