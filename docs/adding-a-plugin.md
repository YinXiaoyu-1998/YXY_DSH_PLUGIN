# Adding a plugin

This repository is a collection of independent DSH plugins. Follow these steps to add one without turning the root into a bundler.

## 1. Create the plugin directory

    plugins/<purpose>/

Use a short kebab-case name. The directory is the install path used by dsh plugin add.

## 2. Add package.json

Minimum fields:

    {
      "name": "dsh-<purpose>",
      "version": "0.1.0",
      "private": true,
      "type": "module",
      "main": "lib/index.mjs",
      "exports": {
        ".": "./lib/index.mjs",
        "./client": "./lib/client.cjs",
        "./package.json": "./package.json"
      },
      "dsh": {
        "bundle": { "patch": "./cordis.patch.yml" },
        "client": {
          "platform": "web",
          "inject": ["@deepseek-ai/dsh-client-ui-input-trigger"]
        }
      },
      "peerDependencies": {
        "@deepseek-ai/cordis": "^4.0.0"
      }
    }

Omit dsh.client for a host-only plugin. Keep peer ranges narrow enough to catch real incompatibilities, but not so narrow that a preview patch release blocks loading.

## 3. Add the host row

cordis.patch.yml:

    - insert:
        - id: <short-id>
          name: dsh-<purpose>

The package name must be the specifier DSH can resolve from the target profile. A local install uses a path; a published package uses its npm name.

## 4. Add the host entry

lib/index.mjs exports a Cordis plugin. A client-only plugin can keep the host entry empty:

    export const name = "<short-id>"
    export function apply() {}

## 5. Add the client module (optional)

Use the DSH client module format:

    window.__ModuleLoader__.load({
      id: "dsh-<purpose>",
      factory: (require) => {
        // ...
        exports.apply = apply
        exports.inject = ["inputTriggers"]
        return module.exports
      }
    })

Keep the id equal to the package name. Feature-detect the service you need; do not assume a private field exists forever.

## 6. Add tests and a diagnostic report

At minimum:

- a Node test for the pure mapping/patch logic;
- a status machine with active / native / inactive / disposed;
- a version log and a window diagnostic object;
- a clear fallback when the host surface is missing.

## 7. Test in a throwaway profile

    DSH="dsh"
    "$DSH" --profile probe-topic --from-default-profile web --dump-config
    "$DSH" plugin --profile probe-topic add "$PWD/plugins/purpose"
    "$DSH" --profile probe-topic --no-open --port 0

Delete the probe profile after testing. Do not edit the desktop profile until the probe passes.

## 8. Update the repository docs

- Add the plugin to README.md and README.zh.md.
- Add it to plugins/README.md.
- Bump the plugin version when behavior changes.
- Keep the plugin README focused on usage; put design notes in the plugin docs/ directory.
