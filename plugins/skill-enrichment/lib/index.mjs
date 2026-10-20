/**
 * Host-side no-op plugin.
 *
 * The visible work happens in the web client module (lib/client.cjs). The host
 * row exists so the profile bundle can load the package and so the plugin can
 * be enabled or disabled like any other DSH plugin.
 */
export const name = "skill-enrichment";

export function apply() {
  // Intentionally empty: the client module patches the slash-menu source.
}
