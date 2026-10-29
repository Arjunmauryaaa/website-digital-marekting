import { describe, expect, it } from "vitest";
import { formatClock, inBusinessHours, localParts, MARKET_ZONES, parseHours } from "@/lib/time";
import { articles } from "@/content/insights";
import { credentials, team, testimonials } from "@/content/trust";

describe("time helpers", () => {
  it("parses working hours and falls back safely", () => {
    expect(parseHours("09:00-18:00")).toEqual([9, 18]);
    expect(parseHours("8:30–17:15")).toEqual([8.5, 17.25]);
    expect(parseHours("nonsense")).toEqual([9, 18]);
    expect(parseHours("18:00-09:00")).toEqual([9, 18]);
  });

  it("reads local time in a zone (Tuesday 14:30 UTC)", () => {
    const d = new Date("2026-03-03T14:30:00Z"); // a Tuesday
    expect(localParts("UTC", d)).toEqual({ hour: 14.5, weekday: 2 });
    expect(localParts("Asia/Dubai", d).hour).toBeCloseTo(18.5);
    expect(formatClock("UTC", d)).toMatch(/2:30\s?PM/);
  });

  it("only counts Monday to Friday, inside the hours", () => {
    expect(inBusinessHours("UTC", new Date("2026-03-03T10:00:00Z"))).toBe(true); // Tue 10:00
    expect(inBusinessHours("UTC", new Date("2026-03-03T19:00:00Z"))).toBe(false); // after 18:00
    expect(inBusinessHours("UTC", new Date("2026-03-07T10:00:00Z"))).toBe(false); // Saturday
  });

  it("lists the five target markets with valid time zones", () => {
    expect(MARKET_ZONES.map((z) => z.country)).toEqual(["United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates"]);
    for (const z of MARKET_ZONES) expect(() => localParts(z.tz, new Date())).not.toThrow();
  });
});

describe("trust content honesty", () => {
  it("ships with no invented people, quotes or credentials", () => {
    expect(team).toEqual([]);
    expect(testimonials).toEqual([]);
    expect(credentials).toEqual([]);
  });

  it("starter articles contain no statistics or client claims", () => {
    for (const a of articles) {
      const text = JSON.stringify(a.body);
      expect(text).not.toMatch(/\d+\s?%/);
      expect(text.toLowerCase()).not.toMatch(/our clients|case study showed|we guarantee/);
    }
  });
});
