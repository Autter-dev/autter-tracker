import { describe, it, expect } from "vitest";

import { truncate, formatDate, padRight } from "../src/utils";

describe("truncate", () => {
  it("returns string unchanged when within limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and adds ellipsis", () => {
    const result = truncate("a very long string here", 10);
    expect(result).toHaveLength(10);
    expect(result.endsWith("\u2026")).toBe(true);
  });

  it("handles exact length", () => {
    expect(truncate("12345", 5)).toBe("12345");
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2026-04-04T10:00:00Z");
    expect(result).toContain("2026");
    expect(result).toContain("Apr");
  });
});

describe("padRight", () => {
  it("pads shorter strings", () => {
    expect(padRight("hi", 5)).toBe("hi   ");
  });

  it("returns string unchanged when already at length", () => {
    expect(padRight("hello", 5)).toBe("hello");
  });

  it("returns string unchanged when longer than length", () => {
    expect(padRight("hello world", 5)).toBe("hello world");
  });
});
