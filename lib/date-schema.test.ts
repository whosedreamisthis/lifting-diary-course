import { describe, expect, it } from "vitest";

import { dateStringSchema, isValidDateString } from "./date-schema";

describe("isValidDateString", () => {
  it("accepts real dates", () => {
    expect(isValidDateString("2024-02-29")).toBe(true);
    expect(isValidDateString("2024-12-31")).toBe(true);
  });

  it("rejects dates that roll over", () => {
    expect(isValidDateString("2024-02-31")).toBe(false);
    expect(isValidDateString("2023-02-29")).toBe(false);
    expect(isValidDateString("2024-13-01")).toBe(false);
  });

  it("rejects out-of-range years", () => {
    expect(isValidDateString("0000-01-01")).toBe(false);
    expect(isValidDateString("9999-01-01")).toBe(false);
  });

  it("rejects malformed strings", () => {
    expect(isValidDateString("2024-2-1")).toBe(false);
    expect(isValidDateString("not-a-date")).toBe(false);
  });
});

describe("dateStringSchema", () => {
  it("parses valid and rejects invalid input", () => {
    expect(dateStringSchema.safeParse("2024-06-15").success).toBe(true);
    expect(dateStringSchema.safeParse("2024-02-31").success).toBe(false);
  });
});
