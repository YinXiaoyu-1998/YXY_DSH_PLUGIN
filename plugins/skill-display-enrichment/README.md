# dsh-skill-display-enrichment

> 本文档为中文。仓库总览与语言切换：[English](../../README.md) · [中文](../../README.zh.md) · [日本語](../../README.ja.md)

让 DSH 的 `/` 技能菜单显示 skill 自带的本地化名称和简短说明，而不是一行英文 id 加英文描述。

![技能菜单效果](docs/preview.png)

> 示意图：菜单里显示 displayName（例如「大肥鱼审代码」），旁边保留原始 id（`code-review`）；
> 选中后插入的仍然是 `/code-review`。

## 怎么用

敲 `/` 打开技能菜单时，每一行显示：

- **名称**：skill 在 `agents/openai.yaml` 里写的 `display_name`（可以是翻译，也可以是任意别名）；
- **简短说明**：同一文件里的 `short_description`；
- **原始 id**：仍然显示，方便你知道插入的是什么。

选中一行后，插入的仍然是真实命令，例如 `/skill-name`——显示名只影响菜单外观，不影响调用。

## 安装

在 **设置 → 插件 → 添加插件** 里填包名：

```
dsh-skill-display-enrichment
```

安装后重启 DSH 或重新加载插件列表。想固定版本就在包名后加版本号，例如
`dsh-skill-display-enrichment@0.4.0`。用中国大陆镜像源安装时，镜像可能比 npm 慢，需要最新版
请把安装源切到官方源。

## 开启 / 关闭

在 **设置 → 插件** 里启用或停用。停用后菜单恢复成 DSH 原生的「id + 英文描述」。

## 已知限制

- 菜单里的文案来自插件自带的一份清单，**不会**读取你本机新增或修改过的 `agents/openai.yaml`；
  想让新 skill 也显示本地化名称，需要插件发布一个包含它的新版本。
- 只改「显示名和简述」，不改变 skill 的路由 id，也不改变模型看到的描述。
- 如果某个 DSH 版本自己开始支持显示名，插件会自动退让，用回原生菜单。

## 出问题时

插件会在 Web 控制台打印一行加载日志和当前状态；需要完整自检时，在控制台运行：

```js
window.__DSH_SKILL_DISPLAY_ENRICHMENT__.report()
```

输出里包含插件版本、DSH 版本、当前状态、是否检测到 DSH 原生支持、以及实际生效的 skill 条数。
把这段输出发给维护者即可定位问题。
