# Compatibility self-check and version log

This document describes the diagnostics contract used by dsh-skill-enrichment and recommends the same pattern for other DSH client plugins that patch a host surface.

## Goals

- Make it obvious which plugin version and build is running.
- Make it obvious whether the plugin is active, waiting, native, or inactive.
- Detect when the host already provides the feature and stop patching.
- Fail soft: a shape change should leave the native UI usable.
- Give users one command to produce a copyable report.

## Status model

- starting: apply() has started; no source check yet.
- waiting: the host service exists but the target menu source has not registered yet. The plugin retries for 10 seconds.
- active: the menu source was found and patched.
- native: the host already exposes displayName / shortDescription (or an already-mapped label); the plugin restored the original method and is idle.
- inactive: the service is missing, the source has no candidates(), or the source never appeared. The menu is left unchanged.
- disposed: the plugin was unloaded and its patch was restored.

Only active changes visible behavior. native and inactive are intentional no-ops.

## Version log

One line at startup:

    [skill-enrichment] v0.3.0 loaded (build 2026-10-20T04:38:15.300Z, hash 4439d703fabd); DSH 0.2.1-rc.2; 32 labels (13 storytelling)

The fields are:

- plugin version
- build timestamp (UTC ISO)
- metadata hash (first 12 hex chars of SHA-256 over the generated metadata JSON)
- DSH boot version from window.__DSH_BOOT__.version (or unknown)
- number of embedded labels
- number of storytelling labels

A second line reports the outcome:

    [skill-enrichment] patched /skill menu source; 32 labels available
    [skill-enrichment] native displayName/shortDescription detected; plugin idle
    [skill-enrichment] skill source not found; plugin inactive
    [skill-enrichment] disposed

Warnings use console.warn; normal lifecycle messages use console.info.

## Report object

The plugin exposes:

    window.__DSH_SKILL_ENRICHMENT__.report()

It returns a JSON string with:

    {
      "plugin": "dsh-skill-enrichment",
      "version": "0.3.0",
      "builtAt": "2026-10-20T04:38:15.300Z",
      "metadataHash": "4439d703fabd",
      "dshVersion": "0.2.1-rc.2",
      "status": "active",
      "nativeSupport": false,
      "nativeChecked": true,
      "patched": true,
      "sourceSeen": true,
      "candidates": "function",
      "metadataCount": 32,
      "storytellingCount": 13,
      "error": null
    }

diagnose() returns the same data as an object; build returns the generated build-info object.

## Native support detection

On the first non-empty catalog response, the plugin checks whether any item already has:

- displayName, or
- shortDescription, or
- a label that differs from name.

If so, it assumes the host or another plugin already provides presentation metadata, restores the original candidates method, sets status to native, and leaves the items untouched.

This is deliberately feature detection, not a version check. A version number can tell you what the host claims; the catalog tells you what it actually does.

## Failure handling

- Missing inputTriggers service: log a warning, status inactive, no patch.
- Missing skill source after 10 seconds: log a warning, status inactive, no patch.
- Source without candidates(): log a warning, status inactive, no patch.
- Native fields detected: restore and status native.
- Plugin disposed: clear the timer, restore the patch, status disposed.

In all failure paths, the menu continues to work with the host's own name/description.

## Recommended pattern for other plugins

1. Log plugin version, build, hash, and host version at startup.
2. Feature-detect the exact host surface you need.
3. Keep a state machine with explicit active/native/inactive states.
4. Bound retries; do not poll forever.
5. Expose one diagnostic entry point on window.
6. Restore the original method on dispose or native detection.
7. Never throw from a compatibility patch; warn and fall back.

## Verification

- node test/patch.test.mjs covers active, native, late-source, and dispose paths.
- In a live Web profile, open DevTools and run:
      window.__DSH_SKILL_ENRICHMENT__.report()
- Confirm the startup line and the status match the visible menu behavior.
