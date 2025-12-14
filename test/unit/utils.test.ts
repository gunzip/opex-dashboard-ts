/**
 * Unit tests for utility functions.
 */

import { describe, expect, it } from "vitest";

import { overrideWith } from "@/utils/merge.js";

describe("overrideWith", () => {
  it("should merge simple objects", () => {
    const base = { a: 1, b: 2 };
    const override = { b: 3, c: 4 };
    const result = overrideWith(base, override);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it("should merge nested objects", () => {
    const base = { a: { x: 1, y: 2 } };
    const override = { a: { y: 3, z: 4 } };
    const result = overrideWith(base, override);

    expect(result).toEqual({ a: { x: 1, y: 3, z: 4 } });
  });

  it("should handle arrays by replacement", () => {
    const base = { a: [1, 2, 3] };
    const override = { a: [4, 5] };
    const result = overrideWith(base, override);

    expect(result).toEqual({ a: [4, 5] });
  });

  it("should not mutate original objects", () => {
    const base = { a: 1, b: { c: 2 } };
    const override = { b: { d: 3 } };
    const result = overrideWith(base, override);

    expect(base).toEqual({ a: 1, b: { c: 2 } });
    expect(override).toEqual({ b: { d: 3 } });
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3 } });
  });

  it("should handle empty overrides", () => {
    const base = { a: 1, b: 2 };
    const result = overrideWith(base, {});

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should handle null values", () => {
    const base = { a: 1, b: 2 };
    const override = { b: null };
    const result = overrideWith(base, override);

    expect(result).toEqual({ a: 1, b: null });
  });

  it("should replace arrays", () => {
    const base = { a: [1, 2] };
    const override = { a: [3, 4] };
    const result = overrideWith(base, override);

    expect(result).toEqual({ a: [3, 4] });
  });

  it("should handle non-plain objects", () => {
    const base = { a: 1 };
    const override = { a: new Date() };
    const result = overrideWith(base, override);

    expect(result.a).toBeInstanceOf(Date);
  });
});
