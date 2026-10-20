# Plugins

Each direct child directory is a self-contained DSH plugin package. Keep plugin-specific code, tests, docs, and build scripts inside its directory; keep shared repository docs at the root.

## Naming

- Directory: short kebab-case purpose, for example skill-display-zh.
- package.json name: dsh-<purpose>, for example dsh-skill-display-zh.
- Host plugin id: short stable id, for example skill-display-zh.

The directory name and package name do not have to be identical, but keeping them close avoids confusion. The package name is what DSH resolves; the directory is only the install path.

## Required files

    plugins/<name>/
    ├── package.json          # name, version, dsh.bundle.patch, optional dsh.client
    ├── cordis.patch.yml      # host row inserted into the profile
    ├── lib/index.mjs         # host plugin entry (may be a no-op)
    ├── lib/client.cjs        # optional web client module
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
| skill-display-zh | dsh-skill-display-zh | Chinese display names / short descriptions in the DSH / skill menu. |
