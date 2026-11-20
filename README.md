<p align="center">
  <img src="docs/logo.svg" alt="" width="88">
</p>

<h1 align="center">YXY DSH Plugins</h1>

<p align="center">
  Plugins for <strong>DeepSeek Harness</strong>. Install by package name from the app — nothing to download or build.
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
</p>

## Plugins

| Plugin | What it adds |
| --- | --- |
| **[workspace-collapse-all](plugins/workspace-collapse-all/README.md)** | One button at the bottom of the sidebar that collapses or expands every workspace at once. |
| **[skill-display-enrichment](plugins/skill-display-enrichment/README.md)** | Localized names and short descriptions in the `/` skill menu. |

## Install

1. Open **Settings → Plugins → Add plugin**.
2. Paste a package name and click **Install**.
3. Restart DSH, or reload the plugin list.

| Plugin | Paste this | Latest version |
| --- | --- | --- |
| workspace-collapse-all | `dsh-workspace-collapse-all` | [![npm](https://img.shields.io/npm/v/dsh-workspace-collapse-all?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-workspace-collapse-all) |
| skill-display-enrichment | `dsh-skill-display-enrichment` | [![npm](https://img.shields.io/npm/v/dsh-skill-display-enrichment?color=CB3837&logo=npm)](https://www.npmjs.com/package/dsh-skill-display-enrichment) |

Both packages live on npm under the MIT license. To stay on a specific release, add the
version to the name, for example `dsh-workspace-collapse-all@0.1.4`.

**If you install from the mainland China mirror:** it can trail npm by minutes to hours, and
its "latest" may still point at an older release. When you need the newest version, switch
the install source to the official registry, or pin the version explicitly.

**Terminal users** can install the same package with the `dsh` CLI:

```sh
dsh plugin --profile desktop add dsh-workspace-collapse-all
dsh plugin --profile desktop add dsh-skill-display-enrichment
```

## Using the plugins

### workspace-collapse-all

The button sits at the bottom of the sidebar, above your avatar, next to the Remote entry.

- **Double chevron up** — some workspace is open; click to collapse all of them.
- **Double chevron down** — everything is closed; click to open all of them, including
  nested folders, one level at a time.
- There is no visible text. Hovering shows the action name, and screen readers read it too.
- The button dims while the sidebar shows the flat list or session search results, because
  there are no workspace groups to act on.
- The button is hidden while the sidebar is collapsed into the narrow rail.

### skill-display-enrichment

The `/` menu in the composer shows localized names and short descriptions for the skills
this release covers; the text comes from each skill's `agents/openai.yaml`. Rows read as a
localized name plus a short summary instead of a bare id.

- Choosing a row still inserts the real command, such as `/skill-name`.
- If a DSH release starts showing display names itself, this plugin steps aside and the
  stock menu takes over.

## Compatibility

These plugins are built for **DSH 0.2.x**. A future DSH update can change the parts of the
app they attach to; when that happens they stay quiet rather than breaking the UI:

- `workspace-collapse-all` disables its button, or reports that the switch failed.
- `skill-display-enrichment` leaves the menu as DSH renders it and logs a warning.

Neither plugin changes your sessions or sends anything off your machine.

## License

[MIT](LICENSE). This is a community project, not an official DeepSeek product. DeepSeek and
related names and marks belong to their respective owners.
