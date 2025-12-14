/**
 * URI to regex filter for template rendering.
 * Converts OpenAPI path parameters like {id} to regex patterns [^/]+.
 */

/**
 * Convert URI path parameters to regex pattern.
 * Example: /api/{serviceId}/items/{itemId} -> /api/[^/]+/items/[^/]+$
 */
export function uriToRegex(uri: string): string {
  // Replace {paramName} with [^/]+ regex pattern and add $ anchor at end
  return uri.replace(/\{[^/]+\}/g, "[^/]+") + "$";
}
