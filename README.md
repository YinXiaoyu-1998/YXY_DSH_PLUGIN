# YXY DSH Plugins

A small, public collection of **DeepSeek Harness (DSH)** plugins by Yin Xiaoyu.

The first plugin, **skill-display-zh**, solves a multilingual readability problem: a skill's routing metadata often has to stay English (or comes from upstream and should not be edited), while the UI should show a Chinese label and short description. The plugin reads the Codex-style agents/openai.yaml and adds a Chinese label / short description to the DSH slash menu, without changing the skill id or the model-facing description.

## Plugins

| Plugin | Purpose | Docs |
|---|---|---|
| **skill-display-zh** | Show Chinese display names and short descriptions in the DSH / skill menu using agents/openai.yaml. Includes compatibility self-check and version log. | [README](plugins/skill-display-zh/README.md) · [DSH proposal](plugins/skill-display-zh/docs/dsh-feature-proposal.md) · [Discussion](https://github.com/deepseek-ai/deepseek-harness/discussions/10375) |

## Repository layout

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
            ├── package.json
            ├── cordis.patch.yml
            ├── lib/
            ├── scripts/
            ├── test/
            ├── docs/
            └── README.md

Each directory under plugins/ is a self-contained DSH plugin package. The repository is a collection, not a single package: install the plugin directory you need.

## Install

Clone the repository, then install a plugin directory into a DSH profile:

    git clone https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN.git
    cd YXY_DSH_PLUGIN
    DSH="dsh"   # or the full path to the dsh CLI
    "$DSH" plugin --profile your-profile add "$PWD/plugins/skill-display-zh"

Then restart the profile (or reload the plugin from Settings → Plugins).

The plugin is not published to npm. The repository is the distribution channel.

## Development

Run every plugin test from the repository root:

    npm test

Each plugin still owns its build/test commands. For skill-display-zh:

    cd plugins/skill-display-zh
    node scripts/sync-metadata.mjs
    node test/patch.test.mjs

CI runs npm test on push and pull requests. Use a throwaway DSH profile for integration testing; do not modify the desktop profile until the probe passes.

## Compatibility

DSH is at 0.2 preview and its plugin API is still evolving. These plugins:

- declare peer ranges in package.json;
- feature-detect the host surface they need;
- fail soft with a warning instead of breaking the UI;
- log their own version, build hash, host version, and status.

See the plugin README and docs/compatibility-diagnostics.md for the exact status model.

## License

MIT. See LICENSE.

This is a community project, not an official DeepSeek project.
