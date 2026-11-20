<p align="center">
  <img src="docs/logo.svg" alt="" width="88">
</p>

<h1 align="center">YXY DSH 插件集</h1>

<p align="center">
  给 <strong>DeepSeek Harness</strong> 用的插件。在应用里按包名安装，不用下载、不用编译。
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
</p>

## 插件列表

| 插件 | 它带来什么 |
| --- | --- |
| **[workspace-collapse-all](plugins/workspace-collapse-all/README.md)** | 在侧栏底部加一个按钮，一键收起或展开所有工作区。 |
| **[skill-display-enrichment](plugins/skill-display-enrichment/README.md)** | 让 `/` 技能菜单显示本地化的名称和简短说明。 |

## 安装

1. 打开 **设置 → 插件 → 添加插件**。
2. 填包名，点**安装**。
3. 重启 DSH，或重新加载插件列表。

| 插件 | 填这个 | 最新版本 |
| --- | --- | --- |
| workspace-collapse-all | `dsh-workspace-collapse-all` | [![npm](https://img.shields.io/npm/v/dsh-workspace-collapse-all?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-workspace-collapse-all) |
| skill-display-enrichment | `dsh-skill-display-enrichment` | [![npm](https://img.shields.io/npm/v/dsh-skill-display-enrichment?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-skill-display-enrichment) |

两个包都在 npm 上，MIT 许可。想固定某个版本，在包名后面加版本号即可，例如
`dsh-workspace-collapse-all@0.1.4`。

**用中国大陆镜像源安装时注意：** 镜像可能比 npm 慢几分钟到几小时，它的“最新版”也可能
仍指向旧版本。需要最新版时，把安装源切到官方源，或者直接写死版本号。

**习惯用终端**的话，用 `dsh` 命令装同样的包：

```sh
dsh plugin --profile desktop add dsh-workspace-collapse-all
dsh plugin --profile desktop add dsh-skill-display-enrichment
```

## 怎么用

### workspace-collapse-all

按钮在侧栏底部、头像上方、Remote 入口旁边。

- **双箭头向上**——还有项目是展开的，点一下全部收起。
- **双箭头向下**——已经全部收起，点一下全部展开；嵌套文件夹会逐层打开。
- 按钮上没有文字，鼠标悬停会显示这个动作的名字，读屏也会读出来。
- 侧栏处于扁平列表模式、或正在搜索会话时，按钮变暗不可点——此时没有工作区分组可操作。
- 侧栏收成窄条（rail）时按钮隐藏。

### skill-display-enrichment

输入框里敲 `/` 打开技能菜单时，每一行会显示本地化名称和简短说明（文案来自各 skill 的
`agents/openai.yaml`），读起来是「本地化名称 + 简短说明」，而不是一行裸 id。当前版本覆盖
哪些 skill，取决于插件内置的清单。

- 选中一行，插入的仍然是真实命令，例如 `/skill-name`。
- 如果某个 DSH 版本开始原生支持显示名，这个插件会自动退让，用回原生菜单。

## 兼容性

这两个插件面向 **DSH 0.2.x**。以后 DSH 更新可能改掉插件依赖的界面结构，遇到这种情况它们
只会安静地失效，而不会把界面弄坏：

- `workspace-collapse-all` 会禁用按钮，或者提示切换失败；
- `skill-display-enrichment` 会保持 DSH 原生的菜单表现，并在控制台留一条警告。

两个插件都不会改动你的会话，也不会把任何内容发到本机之外。

## 许可

[MIT](LICENSE)。这是社区项目，不是 DeepSeek 官方产品；DeepSeek 及相关名称与标识归其各自所有者。
