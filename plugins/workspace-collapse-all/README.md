# dsh-workspace-collapse-all · 工作区一键收起 / 展开

在 DSH 侧栏**账号行上方**常驻一个入口，一键把所有工作区（项目）收起或展开。

位置与 `ds-harness-remote` 的常驻入口相同：`sidebar.footer.action` 槽位，宽态显示
「图标 + 文字」，文字随当前状态变化。

![插件图标](icon.svg)

## 它做什么

| 侧栏当前状态 | 入口显示 | 点一下 |
| --- | --- | --- |
| 至少一个项目是展开的 | 收起全部工作区 | 收起所有项目 |
| 所有项目都已收起 | 展开全部工作区 | 展开所有项目（含嵌套文件夹，逐层展开） |
| 扁平列表模式 / 正在搜索会话 | 当前没有工作区（变暗但可聚焦） | 无动作 |
| 侧栏收成窄条（rail） | 不显示 | — |

「展开全部工作区」会逐层进行：收起的文件夹展开后才会出现子文件夹，因此需要多轮点击。
插件每一轮都会等宿主把 `aria-expanded` 写回（最多 3 帧），同一行在一次操作里只点一次，
最多 8 层，避免把刚展开的行又点回去。

点击完成后，入口会用读屏播报结果（「已收起 N 个工作区」/「已展开 N 个工作区」）；
如果点了却没有任何变化（宿主改版、不再通过普通点击切换），会播报
「未能切换工作区，侧栏结构可能已变化」，而不是静默无反应。

## 为什么这样做

DSH 0.2.x 里，`工作区` 标题行（搜索 / 筛选 / 新建那一行）由
`@deepseek-ai/dsh-client-ui-workspace` 私有渲染，**没有对外槽位**；项目的开合状态存在
该包的私有持久化 store（`dsh.workspace.view.v5`），**不在任何 Client Service 上**。

所以本插件走官方可见的那一侧：每个项目行是 `[data-row-key^="workspace:"][role="treeitem"][aria-expanded]`，
点击即切换自己的分组。插件只读 `aria-expanded`、点需要翻转的行，动画、嵌套与状态持久化
全部交给侧栏本身，因此刷新后开合状态保留。

## 已知限制

- 依赖侧栏工作区行的结构（`data-sidebar-list-area`、`data-row-key`、`aria-expanded`）。
  某个 DSH 版本改了这些标记时，按钮不会乱点：要么置灰，要么播报失败原因。
- 一次性动作：收起后不记得你原来的混合展开状态，再点只会全部展开。
- 不改变会话本身，不写会话日志，不联网。
- 侧栏窄条（rail）模式下不渲染列表，因此入口隐藏（同槽位的其他插件仍显示图标入口）。
- 按钮文案在 `lib/client.cjs` 的 `zh` / `en` 字典里；`locale/*.json` 只管插件页的
  标题、描述与详情。

## 安装

打包为 bundle，`cordis.patch.yml` 插入一行 Host 插件；界面全在 web 客户端
（`lib/client.cjs`），Host 侧是空实现。

- 设置页 **插件 → 添加插件**，选择本目录（本地目录安装会直接链接本仓库）；
- 或在启用了 `plugin_manager` 权限的会话里，用工作区绝对路径安装本目录。

启用后无需重启即可通过 HMR 生效；若替换了同名包的新版本，需要重启一次加载新的客户端模块。

## 诊断

客户端加载后会在页面挂一个诊断对象，便于确认状态与排查：

    window.__DSH_WORKSPACE_COLLAPSE_ALL__.report()
    // { version, status: "active" | "inactive" | "disposed",
    //   lastAction: "collapse" | "expand" | null, lastCount, lastError,
    //   summary: { total, expanded } }

- `summary.total === 0` 说明当前视图没有工作区行（扁平列表 / 搜索 / 未展开侧栏），入口此时不可点。
- `lastError: "list-area-missing"` 说明侧栏列表区不存在；`"no-rows"` 说明没有可见分组。
- `lastError: "no-effect"` 说明点了行但 `aria-expanded` 没变：宿主可能改了交互方式，界面已播报失败。

## 开发

    npm test        # 客户端 bundle 形状 + 收起/展开逻辑（假 DOM）

`test/client.test.mjs` 覆盖：模块注册 id、`inject`、槽位注册参数、中英词典、结果文案插值、
样式只用主题 token、无列表区 / 无项目行两种空态、收起全部、逐层展开全部、
迟到写回不被重复点击、点击无效时上报失败、组件在 rail / 空态 / 展开 / 收起四种渲染、
以及样式条目的清理。

## 发布到 npm

包名 `dsh-workspace-collapse-all`，MIT，registry 固定 `https://registry.npmjs.org`。

    cd plugins/workspace-collapse-all
    npm publish            # publishConfig 已指定 registry 与 access: public

发布后按包名安装（不再需要本地目录）：

    dsh plugin --profile your-profile add dsh-workspace-collapse-all

注意两点：

- 本机默认 registry 是 npmmirror，刚发布的版本在镜像上可能有延迟；急着验证时用
  `npm publish --registry=https://registry.npmjs.org` 发布、或用 `npm view --registry=https://registry.npmjs.org` 查。
- npm 上已发布的版本不能覆盖，改动要先 bump `version`。

## 探针验证

界面只能在运行中的 DSH 里看，仓库约定先用一次性 profile：

    DSH="dsh"
    "$DSH" --profile probe-collapse --from-default-profile web --dump-config
    "$DSH" plugin --profile probe-collapse add "$PWD/plugins/workspace-collapse-all"
    "$DSH" --profile probe-collapse --no-open --port 0

确认入口出现、点一下全收 / 再点全展、刷新后状态保留，然后删掉该 profile：

    rm -rf ~/.dsh/profiles/probe-collapse

不要直接改 desktop profile。
