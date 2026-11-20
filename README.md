<p align="center">
  <img src="docs/logo.svg" alt="" width="88">
</p>

<h1 align="center">YXY DSH Plugins</h1>

<p align="center">
  Small, focused plugins for <strong>DeepSeek Harness</strong> (DSH). Install by package name — no local checkout needed.
</p>

<p align="center">
  <strong>English</strong>
  &nbsp;·&nbsp;
  <a href="README.zh.md">中文</a>
  &nbsp;·&nbsp;
  <a href="README.ja.md">日本語</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License: MIT"></a>
  <a href="https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/actions/workflows/test.yml"><img src="https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://www.npmjs.com/package/dsh-workspace-collapse-all"><img src="https://img.shields.io/badge/DSH-0.2.x-4D6BFE" alt="DSH 0.2.x"></a>
</p>

## Plugins

| Plugin | What it does | Version |
| --- | --- | --- |
| **[workspace-collapse-all](plugins/workspace-collapse-all/README.md)** | Collapse or expand every workspace group from one entry above the sidebar account row. Drives the sidebar's own rows, so the native animation and saved view state stay intact. | [![npm](https://img.shields.io/npm/v/dsh-workspace-collapse-all?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-workspace-collapse-all) |
| **[skill-display-enrichment](plugins/skill-display-enrichment/README.md)** | Show the localized `display_name` and `short_description` from each skill's `agents/openai.yaml` in the `/` skill menu, while picking a row still inserts the real skill id. Self-disables when a DSH release supports this natively. | [![npm](https://img.shields.io/npm/v/dsh-skill-display-enrichment?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-skill-display-enrichment) |

Both packages are MIT and published to `registry.npmjs.org`. This repository is a
collection, not a single package: each directory under `plugins/` installs on its own.

## Install

**DSH Desktop** — open **Settings → Plugins → Add plugin**, paste a package name, then
restart or reload the plugin list.

| Plugin | Paste this |
| --- | --- |
| workspace-collapse-all | `dsh-workspace-collapse-all` |
| skill-display-enrichment | `dsh-skill-display-enrichment` |

The same dialog also accepts a version (`dsh-workspace-collapse-all@0.1.0`), a tarball,
a Git address of a package root, or an absolute local path — a package name is the
normal route.

**CLI**:

```sh
dsh plugin --profile desktop add dsh-workspace-collapse-all
dsh plugin --profile desktop add dsh-skill-display-enrichment
```

**Development** — a local directory install links the checkout, so edits take effect
immediately:

```sh
git clone https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN.git
cd YXY_DSH_PLUGIN
dsh plugin --profile probe-topic add "$PWD/plugins/workspace-collapse-all"
```

## What each plugin does

### workspace-collapse-all

Adds one icon-only entry to `sidebar.footer.action`, above the account row, laid out like
the `ds-harness-remote` entry: a 36 px cell, a 36×36 hit area, an 8 px radius, the same
hover and focus treatments.

- a double chevron points up while any workspace is open; clicking closes every group;
- once all are closed the chevron points down and clicking opens every group, walking
  nested folders level by level;
- there is no visible text: the wording lives in the tooltip and accessible name —
  **Collapse all workspaces**, **Expand all workspaces**, **No workspaces here**;
- in the flat list or while searching sessions the entry dims and stays focusable;
- in the 56 px rail the entry is hidden, because the sidebar does not render the list there.

It depends on the sidebar's workspace-row markup. If a DSH release changes it, the entry
either disables itself or reports the failure through a screen-reader announcement — it
never clicks blindly, and it never changes a session.

### skill-display-enrichment

Codex-style skills already carry presentation metadata in `agents/openai.yaml`; DSH reads
only `name` and `description`. This plugin finds the `/`-menu source registered by
`ui-skill`, leaves its filtering and insertion logic alone, and fills in `label` and
`description` from that YAML — so the menu reads as a localized name plus a short summary,
while the inserted command stays `/skill-name`.

- Fail-soft: if a future DSH exposes display names itself, the plugin detects it on the
  first non-empty catalog and goes idle.
- Diagnostics: `window.__DSH_SKILL_DISPLAY_ENRICHMENT__.report()` prints the menu source,
  DSH version, metadata count and status.
- Background: [feature proposal](plugins/skill-display-enrichment/docs/dsh-feature-proposal.md)
  · [discussion](https://github.com/deepseek-ai/deepseek-harness/discussions/10375).

## Repository layout

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

Each `plugins/<name>/` is a self-contained DSH bundle: `package.json` (with
`dsh.bundle.patch` and optional `dsh.client`), `cordis.patch.yml`, `lib/`, `locale/`,
`icon.svg`, `LICENSE`, plus its own tests and README. [`plugins/README.md`](plugins/README.md)
documents the layout, naming and publishing checklist;
[`docs/adding-a-plugin.md`](docs/adding-a-plugin.md) is the step-by-step guide.

## Development

Run every plugin's tests from the repository root:

```sh
npm test
```

Each plugin keeps its own commands. For `skill-display-enrichment`:

```sh
cd plugins/skill-display-enrichment
node scripts/sync-metadata.mjs   # regenerate embedded labels
npm test
```

CI runs `npm test` on push and pull requests. Integration testing uses a throwaway DSH
profile; do not modify the `desktop` profile until the probe passes.

## Compatibility

DSH is at 0.2 preview and its plugin API is still moving. These plugins:

- declare peer ranges in `package.json` and stay optional where the host provides the package;
- feature-detect the host surface they need instead of assuming a private field;
- fail soft with a warning, leaving the stock UI in place;
- log their own version and expose a diagnostic report.

Exact status models live in each plugin's README and, for `skill-display-enrichment`,
[`docs/compatibility-diagnostics.md`](plugins/skill-display-enrichment/docs/compatibility-diagnostics.md).

## License

[MIT](LICENSE). This is a community project, not an official DeepSeek product.
DeepSeek and related names and marks belong to their respective owners.
