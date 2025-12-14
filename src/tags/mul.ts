/**
 * Multiply filter for template rendering.
 * Used in dashboard templates to calculate positions and indices.
 */

export interface MulInput {
  factor: number;
  value: number;
}

/**
 * Multiply a number by a factor.
 */
export function mul(value: number, factor: number): number {
  return value * factor;
}
