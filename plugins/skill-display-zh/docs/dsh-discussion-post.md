# [Feature] Skill display metadata: displayName / shortDescription for localized catalogs

Posted: https://github.com/deepseek-ai/deepseek-harness/discussions/10375

## Original motivation

I have English skills whose routing text should stay English (or whose text comes from upstream and should not be edited), but I want the UI to show a Chinese label and a short Chinese description so I can scan the catalog without translating the ids in my head.

This is the original use case for this proposal, and it applies to any locale: keep routing metadata stable, add presentation metadata for the reader.

## Problem

DSH skill browsing currently uses the same two strings for routing and presentation:

- name: the kebab-case id used by /name;
- description: the routing text shown in the Web slash menu.

Codex authors already maintain localized presentation metadata in agents/openai.yaml:

    interface:
      display_name: "Storytelling · 对白与潜台词"
      short_description: "改善生硬或人物声音雷同的对白……"

DSH ignores that sidecar. A catalog with 32 skills and 13 Chinese storytelling skills still shows English ids and English descriptions in the / menu. Users have to remember the English id, and the visible catalog does not match the localized documentation.

This is not a request to localize the model-facing routing text. The request is to separate routing metadata from presentation metadata.

## Proposal

Add two optional, additive fields to skill metadata:

- displayName: human-facing menu label; defaults to name.
- shortDescription: human-facing short description; defaults to description.

Suggested sources:

1. SKILL.md frontmatter displayName / shortDescription (primary).
2. agents/openai.yaml interface.display_name / interface.short_description (Codex compatibility; optional phase 2).
3. name / description fallback.

Suggested behavior:

- SkillSummary and SkillDefinition gain optional displayName / shortDescription.
- SkillEntry and skills/list carry the same optional fields.
- ui-skill maps displayName to label and shortDescription to description.
- candidate.name stays the raw skill name, so onPick still inserts /name.
- Model-facing description, ranking, provider contracts, and the /name grammar are unchanged.
- Empty strings are treated as absent.
- Both camelCase and snake_case spellings can be accepted during transition.

The slash-menu component already supports label: it renders label (or name), then the raw name as an alias, then description. The missing pieces are metadata and transport, not UI.

## Reference implementation

The reference plugin is public:

- Repository: https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN
- Plugin: https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/tree/main/plugins/skill-display-zh
- Proposal: https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/blob/main/plugins/skill-display-zh/docs/dsh-feature-proposal.md
- Reference patch: https://github.com/YinXiaoyu-1998/YXY_DSH_PLUGIN/blob/main/plugins/skill-display-zh/docs/dsh-patch.diff

The plugin reads agents/openai.yaml at build time, patches the ui-skill candidates method only while native display fields are absent, and restores the original method when native fields appear.

It also implements the diagnostics described below. The core patch is a design sketch at this point, not a CI-verified PR; the client-side reference is the part exercised against 0.2.1-rc.2.

## Compatibility and diagnostics

The fields are optional and additive:

- Old hosts omit them; the client falls back to name / description.
- Old clients ignore them.
- Providers that do not implement them remain valid.

Clients should feature-detect, not version-gate: on the first non-empty skills/list response, check for displayName or shortDescription. If present, use them and do not apply a compatibility patch.

The reference plugin logs one line at startup and exposes a debug report:

    [skill-display-zh] v0.2.0 loaded (build ..., hash ...); DSH 0.2.1-rc.2; 32 labels (13 storytelling)
    [skill-display-zh] patched /skill menu source; 32 labels available

    window.__DSH_SKILL_DISPLAY_ZH__.report()

The report contains plugin version, build time, metadata hash, DSH boot version, status (starting / waiting / active / native / inactive / disposed), nativeSupport, sourceSeen, candidates type, metadata count, and the last error.

If native support appears, the plugin detects it on the first non-empty catalog, restores the original candidates method, and reports status native. This is the migration path I would recommend for other compatibility plugins as well.

## Verification

Client-side reference plugin, against a live Web profile on 0.2.1-rc.2:

- typing /story renders Chinese labels, the English skill id as an alias, and Chinese short descriptions;
- selecting a row inserts /storytelling-dialogue;
- the plugin test covers active, native, and late-source states;
- the report() object exposes version/build/hash/DSH version/status.

The core patch is not included as a PR because CONTRIBUTING.md says external pull requests are not accepted at the moment. This post follows the documented Ideas discussion path.

## Design questions

1. Should the canonical frontmatter names be camelCase (displayName / shortDescription) or snake_case to match Codex? Supporting both during transition is cheap; which should docs recommend?
2. Should the first patch read agents/openai.yaml, or require a one-time frontmatter migration? Sidecar reading needs an extra watch rule for agents/openai.yaml; frontmatter is simpler and more explicit.
3. Should rankByName also match displayName? Localized search is useful, but it changes menu ranking semantics; I would do it as a follow-up.
4. Should skills/list expose a schemaVersion for future breaking changes, or is feature detection sufficient for additive fields?
5. For disable-model-invocation skills, keep the user-only marker outside shortDescription, as the menu does today?

## Files

Production:

- packages/skill/skill/src/index.ts
- packages/skill/skill-filesystem/src/index.ts
- packages/api/session-controller/src/types.ts
- packages/api/session-controller/src/skill-catalog.ts
- packages/client/ui-skill/src/client/index.ts

Tests:

- packages/skill/skill/tests/skill.spec.ts
- packages/skill/skill-filesystem/tests/skill-filesystem.spec.ts
- packages/api/session-controller/tests/session-skills.host.spec.ts
- packages/client/ui-skill tests

Docs:

- packages/skill/README.md
- packages/client/ui-skill/README.md
