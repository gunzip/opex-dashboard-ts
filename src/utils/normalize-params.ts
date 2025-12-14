/**
 * Parameter normalization utilities using Zod for runtime type validation.
 * Validates and extracts typed parameters from dictionaries, skipping missing optional values.
 */

import { z } from "zod";

/**
 * Normalize and validate parameters against a Zod schema.
 * Lenient: skips validation errors for missing keys by using partial schema.
 */
export function normalizeParams<T extends z.ZodRawShape>(
  values: Record<string, unknown>,
  schema: z.ZodObject<T>,
): z.infer<z.ZodObject<T>> {
  // Make schema partial to allow missing values
  const partialSchema = schema.partial();

  try {
    return partialSchema.parse(values) as z.infer<z.ZodObject<T>>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      if (firstError) {
        throw new TypeError(
          `'${firstError.path.join(".")}' ${firstError.message}`,
        );
      }
    }
    throw error;
  }
}
