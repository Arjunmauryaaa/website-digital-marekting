import { describe, expect, it } from "vitest";
import { charGap, cutStep } from "@/lib/typing";

describe("typing rhythm", () => {
  const text = "Hello, world. Done";
  it("is deterministic", () => {
    for (let i = 0; i < text.length; i++) expect(charGap(text, i, 24)).toBe(charGap(text, i, 24));
  });
  it("varies between letters but stays within a human range", () => {
    const gaps = Array.from({ length: 5 }, (_, i) => charGap("abcdefghij", i, 20));
    expect(new Set(gaps.map((g) => Math.round(g))).size).toBeGreaterThan(1);
    for (const g of gaps) {
      expect(g).toBeGreaterThanOrEqual(20 * 0.65);
      expect(g).toBeLessThanOrEqual(20 * 1.35);
    }
  });
  it("pauses longer after punctuation", () => {
    expect(charGap(text, 5, 20)).toBeGreaterThan(charGap(text, 1, 20) * 2);
    expect(charGap(text, 12, 20)).toBeGreaterThan(charGap(text, 1, 20) * 3);
  });
  it("cutting starts gently and accelerates, like holding Backspace", () => {
    expect(cutStep(0)).toBe(1);
    expect(cutStep(10)).toBeGreaterThan(cutStep(0));
    expect(cutStep(100)).toBeGreaterThan(cutStep(10));
  });
});
