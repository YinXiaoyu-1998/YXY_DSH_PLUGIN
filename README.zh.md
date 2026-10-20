# YXY DSH 插件集

这是尹晓宇的 **DeepSeek Harness (DSH)** 公共插件仓库。

第一个插件 **skill-display-zh** 解决一个多语言可读性问题：一个 skill 的
路由元数据可能必须保持英文（或者来自上游、不适合直接改），但 UI 上希望
用中文显示名称和简短说明，方便浏览。插件读取 Codex 风格的
agents/openai.yaml，把中文 label / short description 加到 DSH 的 / 技能
菜单里，不改变 skill id，也不改变模型路由用的 description。

## 插件列表

| 插件 | 用途 | 文档 |
|---|---|---|
| **skill-display-zh** | 用 agents/openai.yaml 在 DSH 的 / 技能菜单显示中文名称和简述；带兼容性自检和版本日志。 | [README](plugins/skill-display-zh/README.md) · [DSH 功能建议](plugins/skill-display-zh/docs/dsh-feature-proposal.zh.md) · [Discussion](https://github.com/deepseek-ai/deepseek-harness/discussions/10375) |

## 仓库结构

    YXY_DSH_PLUGIN/
    ├── README.md
    ├── README.zh.md
    ├── LICENSE
    ├── .gitignore
    ├── docs/
    │   └── adding-a-plugin.md
    └── plugins/
        ├── README.md
        └── skill-display-zh/

plugins/ 下每个目录都是一个完整、可独立安装的 DSH 插件包。这个仓库是
插件集合，不是单一 npm 包；需要哪个就安装哪个目录。

## 安装

    git clone https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN.git
    cd YXY_DSH_PLUGIN
    DSH="dsh"   # 或 dsh CLI 的完整路径
    "$DSH" plugin --profile your-profile add "$PWD/plugins/skill-display-zh"

然后重启 profile，或在“设置 → 插件”里重新加载。

插件没有发布到 npm；GitHub 仓库就是分发渠道。

## 开发

在仓库根目录运行所有插件测试：

    npm test

每个插件仍然自己负责构建和测试。以 skill-display-zh 为例：

    cd plugins/skill-display-zh
    node scripts/sync-metadata.mjs
    node test/patch.test.mjs

CI 会在 push 和 pull request 时运行 npm test。集成测试请用一次性的
DSH probe profile，不要直接改 desktop profile。

## 兼容性

DSH 0.2 还是预览版，插件 API 仍在演化。本仓库的插件会：

- 在 package.json 声明 peer 范围；
- 对需要的 host 接口做 feature detection；
- 失败时打印警告并回退，不把 UI 弄崩；
- 记录插件版本、构建 hash、host 版本和状态。

具体状态机见插件 README 和 docs/compatibility-diagnostics.md。

## 许可

MIT，见 LICENSE。

这是社区项目，不是 DeepSeek 官方项目。
