# Plugins

Each direct child directory is a self-contained DSH plugin package. Keep plugin-specific code, tests, docs, and build scripts inside its directory; keep shared repository docs at the root.

## Naming

- Directory: short kebab-case purpose, for example skill-display-enrichment.
- package.json name: dsh-<purpose>, for example dsh-skill-display-enrichment.
- Host plugin id: short stable id, for example skill-display-enrichment.

The directory name and package name do not have to be identical, but keeping them close avoids confusion. The package name is what DSH resolves; the directory is only the install path.

## Distribution

Plugins are published to npm and installed by package name
(`dsh plugin --profile <profile> add dsh-<purpose>`). A local directory install
is for development only: it links the checkout instead of the packed tarball,
so it does not prove the published file list is complete.

Publishing checklist:

- `private` absent, `license` set, `LICENSE` copied into the plugin directory;
- `publishConfig.registry` pinned to `https://registry.npmjs.org` (this machine's
  default registry is a read-only mirror, which cannot accept a publish);
- `files` covers every runtime file, plus `LICENSE`, `locale/*.json`, `icon.svg`;
- run `npm test`, then `npm pack --dry-run` and check the file list;
- `npm publish`, then verify by installing the package name in a throwaway profile;
- published versions are immutable: bump `version` for any change.

## Required files

    plugins/<name>/
    ├── package.json          # name, version, dsh.bundle.patch, optional dsh.client
    ├── cordis.patch.yml      # host row inserted into the profile
    ├── lib/index.mjs         # host plugin entry (may be a no-op)
    ├── lib/client.cjs        # optional web client module
    ├── locale/               # meta.title / meta.description for the plugin page
    ├── icon.svg              # plugin icon (falls back to default artwork)
    ├── LICENSE               # MIT text shipped in the tarball
    ├── test/                 # unit tests for the plugin logic
    ├── scripts/              # metadata sync / build helpers
    └── README.md             # what it does, install, toggle, diagnostics

## Checklist for a new plugin

1. Copy the shape of an existing plugin; do not add root-level build steps that every plugin must share.
2. Declare peer ranges for the DSH packages you need.
3. Feature-detect the host surface; fail soft if it is missing.
4. Add a version/build log and a one-call diagnostic report.
5. Add unit tests and a probe-profile integration note.
6. Update the root README and README.zh plugin table.
7. Keep secrets, tokens, and machine-specific absolute paths out of the repository.

## Current plugins

| Directory | Package | Purpose |
|---|---|---|
| skill-display-enrichment | dsh-skill-display-enrichment | Localized display names / short descriptions in the DSH / skill menu. |
| workspace-collapse-all | dsh-workspace-collapse-all | Collapse or expand every sidebar workspace group from one footer entry. |
