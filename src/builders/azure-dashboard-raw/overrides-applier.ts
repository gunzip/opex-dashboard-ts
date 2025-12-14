/**
 * Overrides applier for endpoint configurations.
 * Applies user-specified override values to endpoint defaults.
 */

import type { EndpointConfig } from "./builder.schema.js";

import { overrideWith } from "../../utils/index.js";

/**
 * Apply override values to endpoints configuration.
 * Uses deep merge to preserve unspecified defaults.
 */
export function applyOverrides(
  endpoints: Record<string, EndpointConfig>,
  overrides: Record<string, unknown>,
): Record<string, EndpointConfig> {
  return overrideWith(endpoints, overrides) as Record<string, EndpointConfig>;
}
