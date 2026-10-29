import { describe, expect, it } from "vitest";
import { pace } from "@/components/ui/type-text";

describe("typing pace", () => {
  const text = "We help ambitious businesses grow through strategic digital marketing, engaging social media, and high-performing websites.";

  it("is deterministic, so server and browser always agree", () => {
    expect(pace(text, 24, 4800)).toEqual(pace(text, 24, 4800));
  });

  it("types in order, never backwards, one entry per character", () => {
    const { delays } = pace(text, 24, 4800);
    expect(delays).toHaveLength(text.length);
    expect(delays[0]).toBe(0);
    for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
  });

  it("pauses at punctuation like a person would", () => {
    const { delays } = pace("Hello, world. Done", 20, 99999);
    const gap = (i: number) => delays[i + 1] - delays[i];
    expect(gap(5)).toBeGreaterThan(gap(1) * 2); // after the comma
    expect(gap(12)).toBeGreaterThan(gap(1) * 3); // after the full stop
  });

  it("speeds up long text so nobody waits longer than the cap", () => {
    const long = "A fairly long sentence that keeps going and going. ".repeat(20);
    const { total, delays } = pace(long, 24, 3000);
    expect(total).toBeLessThanOrEqual(3000);
    expect(delays[delays.length - 1]).toBeLessThanOrEqual(3000);
    expect(pace("short text", 24, 3000).total).toBeLessThan(3000); // short text keeps its natural pace
  });
});
