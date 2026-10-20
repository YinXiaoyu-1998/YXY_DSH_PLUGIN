# Proposal: first-class localized skill display metadata

Status: published as DSH Ideas discussion #10375 (https://github.com/deepseek-ai/deepseek-harness/discussions/10375), based on DSH 0.2.1-rc.2
Scope: skill catalog metadata, skills/list transport, Web slash-menu rendering
Related: public reference plugin at https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/tree/main/plugins/skill-display-enrichment

## Summary

Add two optional, additive fields to skill metadata:

- **displayName**: a human-facing label for menus and pickers. Defaults to **name**.
- **shortDescription**: a short, localized description for human-facing menus. Defaults to **description**.

The model-facing **description** and the kebab-case **name** stay unchanged. Only the human-facing menu uses the new fields, so routing and the /name invocation grammar are unaffected.

## Motivation

DSH skill catalogs are increasingly used by non-English authors. Codex already supports localized display metadata through a sidecar:

    agents/openai.yaml
    interface:
      display_name: "Storytelling · 对白与潜台词"
      short_description: "改善生硬或人物声音雷同的对白……"

DSH currently reads only SKILL.md frontmatter **name** and **description**. The Web slash menu therefore shows the English id and English description even when the author maintains Chinese metadata. Users must remember English ids, and the visible catalog does not match the localized skill documentation.

This is not a request to localize the model-facing routing text. It is a request to separate:

- **routing metadata** (name, description) used by the model and the /name command;
- **presentation metadata** (displayName, shortDescription) used by the human-facing menu.

## Current behavior

- packages/skill/skill/src/index.ts defines SkillSummary with name, description, whenToUse, invocation, source, provider, resourceBase.
- packages/skill/skill-filesystem/src/index.ts parses only name and description from SKILL.md frontmatter.
- packages/api/session-controller/src/types.ts defines SkillEntry without display fields.
- packages/api/session-controller/src/skill-catalog.ts maps a skill to SkillEntry using name and description.
- packages/client/ui-skill/src/client/index.ts maps each catalog entry to a slash-menu candidate using only name and description.

The slash-menu component already supports a label field: it renders label (or name), then the raw name as an alias, then description. The missing piece is metadata and transport, not UI capability.

## Proposed schema

### SkillSummary / SkillDefinition

Add optional fields:

    readonly displayName?: string
    readonly shortDescription?: string

Both are optional. Empty strings are treated as absent. No existing provider is required to change.

### SKILL.md frontmatter

Primary source:

    ---
    name: storytelling-dialogue
    description: Diagnose flat dialogue, same-voice characters, and lack of subtext.
    displayName: "Storytelling · 对白与潜台词"
    shortDescription: "改善生硬或人物声音雷同的对白，增加潜台词与角色辨识度。"
    ---

Support both camelCase and snake_case spellings during a transition:

- displayName / display_name
- shortDescription / short_description

If both spellings are present and differ, prefer camelCase and log a warning. This keeps Codex-style authors productive without creating two competing schemas.

### agents/openai.yaml

Optional phase 2, not required for the first patch. If implemented, read interface.display_name and interface.short_description when SKILL.md does not provide the fields. Precedence:

1. SKILL.md frontmatter
2. agents/openai.yaml
3. fallback to name / description

Phase 2 needs one extra watch rule for agents/openai.yaml changes; otherwise a sidecar edit would not invalidate the catalog. The first patch can avoid that complexity by supporting frontmatter only, with a migration script that copies sidecar values into frontmatter.

### SkillEntry / skills/list

Add the same optional fields to SkillEntry and map them in SessionSkillCatalog.list. This is an additive Remote schema change: older clients ignore the fields; newer clients fall back when the fields are absent.

### Web slash menu

In the ui-skill source:

- label = skill.displayName, omitted when absent (so the menu falls back to name)
- description = skill.shortDescription, omitted when absent (so the menu falls back to the existing description)
- keep the existing user-only prefix behavior around whichever description is shown

The raw skill name remains candidate.name, so onPick still inserts /name and the prompt path is unchanged.

## Compatibility and diagnostics

### Backward compatibility

- New fields are optional and additive.
- Old hosts: the client falls back to name and description.
- Old clients: extra Remote fields are ignored.
- No change to model-facing description, skill ids, ranking, provider contracts, or the /name grammar.
- Providers that do not implement the fields remain valid.

### Feature detection

Clients must feature-detect, not version-gate:

- A client that wants native display metadata should check for displayName or shortDescription on the first non-empty skills/list response.
- If present, use native fields and do not apply a compatibility patch.
- If absent, use name and description, or a fallback plugin.

The reference client plugin in this repository demonstrates this behavior. It patches the menu only while native fields are absent; on the first non-empty catalog with displayName, shortDescription, or an already-mapped label, it restores the original candidates method and reports status "native".

### Version log and self-check

The reference plugin logs one line at startup and exposes a debug object:

    [skill-display-enrichment] v0.4.0 loaded (build ..., hash ...); DSH 0.2.1-rc.2; 32 labels (13 storytelling)
    [skill-display-enrichment] patched /skill menu source; 32 labels available

    window.__DSH_SKILL_DISPLAY_ENRICHMENT__.report()

The report includes:

- plugin version, build timestamp, metadata hash
- DSH boot version
- status: starting / waiting / active / native / inactive / disposed
- native support detected
- menu source present
- candidates type
- metadata count and storytelling count
- last error

The same pattern is recommended for any compatibility plugin:

1. Log the host version and the plugin build.
2. Feature-detect the API you need.
3. Fail soft and leave the native UI intact.
4. Expose a one-call diagnostic report.
5. Retire the patch automatically when native support appears.

### Optional catalog schema version

Not required for these additive fields, but useful for future breaking changes. If maintainers want one, add an optional schemaVersion to SkillListValue and have clients treat unknown versions conservatively. For this proposal, feature detection is sufficient and avoids a new required field.

## Implementation plan

Production files:

- packages/skill/skill/src/index.ts
  - add displayName / shortDescription to SkillSummary
  - include them in toSummary and runtimeCandidate
  - validate optional strings in validateCandidate, validateRuntimeSkill, and validateDefinition
- packages/skill/skill-filesystem/src/index.ts
  - parse displayName / display_name and shortDescription / short_description in parseSkillFile
  - include the fields in ParsedSkill and the returned SkillDefinition
- packages/api/session-controller/src/types.ts
  - add the optional fields to SkillEntry
- packages/api/session-controller/src/skill-catalog.ts
  - map the fields in SessionSkillCatalog.list
- packages/client/ui-skill/src/client/index.ts
  - map displayName to label and shortDescription to description, with fallbacks

Tests:

- packages/skill/skill/tests/skill.spec.ts
  - summary preserves fields
  - candidate and definition preserve fields
  - non-string and empty values are rejected or omitted consistently
  - missing fields keep current behavior
- packages/skill/skill-filesystem/tests/skill-filesystem.spec.ts
  - camelCase and snake_case parsing
  - precedence when both spellings exist
  - empty strings are absent
  - invalid YAML still fails the skill, not the whole catalog
- packages/api/session-controller/tests/session-skills.host.spec.ts
  - SkillEntry includes the fields when present
  - absent fields are omitted
- packages/client/ui-skill/tests (or existing client tests)
  - label/description mapping
  - fallback when fields are absent
  - user-only prefix preserved
  - onPick still inserts the raw name

Docs:

- packages/skill/README.md: frontmatter table
- packages/client/ui-skill/README.md: label/description mapping
- packages/api/session-controller/README.md: additive Remote fields, if applicable

## Alternatives considered

### Change description to localized text

Simple, but it changes the model-facing routing text and loses English trigger phrases. It also mixes presentation with routing. Rejected.

### Client-side monkey patch only

This is the current reference plugin. It works in 0.2.1-rc.2, but it depends on an internal menu source shape. It is a bridge, not a platform solution. Rejected as the long-term design.

### Separate locale files

A per-locale JSON/YAML sidecar could support many languages, but it adds locale negotiation, caching, and watch complexity. Two optional strings are enough for the reported use case and can be extended later.

## Open questions

1. Should the canonical frontmatter names be displayName / shortDescription, or snake_case to match Codex? Supporting both during transition is cheap; which one should docs recommend?
2. Should the first patch read agents/openai.yaml, or require a one-time frontmatter migration? Sidecar reading needs a watcher change; frontmatter is simpler and more explicit.
3. Should rankByName also match displayName? Matching localized labels is useful, but it changes menu ranking semantics. Recommend a follow-up, not the first patch.
4. Should skills/list expose a schemaVersion for future breaking changes, or is feature detection sufficient?
5. For disable-model-invocation skills, should shortDescription replace the user-only description, or should the user-only marker stay outside it? The current menu composes the prefix around the description; keep that behavior.

## Reference implementation status

A client-side reference plugin is public at https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/tree/main/plugins/skill-display-enrichment (dsh-skill-display-enrichment, v0.4.0). It:

- reads agents/openai.yaml at build time;
- patches the ui-skill candidates method only when native metadata is absent;
- logs version/build/hash/DSH version/status;
- exposes window.__DSH_SKILL_DISPLAY_ENRICHMENT__.report();
- switches to status "native" and restores the original method when native fields appear.

The core patch is intentionally not submitted as a pull request: CONTRIBUTING.md says external pull requests are not accepted at the moment. This document is prepared for the documented Ideas discussion path. If maintainers want, the production diff can be attached as a reference patch and split into the file list above.

The reference patch is plugins/skill-display-enrichment/docs/dsh-patch.diff. It is based on master commit 687f282e8625c6b8d11ff58211a90524be2e4317 and contains the five production files only. It has not been run through the repository test suite here; the test plan above is the intended follow-up.
