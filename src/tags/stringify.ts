/**
 * Stringify filter for template rendering.
 * Serializes objects to JSON strings with proper escaping for template embedding.
 */

/**
 * Serialize a value to JSON string.
 * Converts objects to JSON notation suitable for embedding in templates.
 */
export function stringify(value: unknown): string {
  return JSON.stringify(value);
}
