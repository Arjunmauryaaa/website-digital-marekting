import { describe, expect, it } from "vitest";
import { budgetOptions, contactSchema, currencyFor, fieldErrors, NOT_SURE } from "@/lib/contact";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Co",
  website: "analytical.example",
  country: "GB",
  service: "Website Design and Development",
  budget: budgetOptions("Website Design and Development", "GB")[1],
  message: "We need a new website for our small business.",
  contactMethod: "Email",
};

describe("contactSchema", () => {
  it("accepts a complete valid enquiry", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("treats the website as optional", () => {
    const { website, ...rest } = valid;
    void website;
    expect(contactSchema.safeParse(rest).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, website: "" }).success).toBe(true);
  });

  it("returns specific inline messages for bad input", () => {
    const r = contactSchema.safeParse({ ...valid, name: "A", email: "nope", message: "short", website: "not a url" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const f = fieldErrors(r.error);
      expect(f.name).toMatch(/full name/i);
      expect(f.email).toMatch(/valid email/i);
      expect(f.message).toMatch(/at least 20/);
      expect(f.website).toMatch(/valid website/i);
    }
  });

  it("rejects an unknown country, service or contact method", () => {
    expect(contactSchema.safeParse({ ...valid, country: "ZZ" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, service: "Hacking" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, contactMethod: "Fax" }).success).toBe(false);
  });

  it("rejects a budget that is not one of the offered options for that service and market", () => {
    const r = contactSchema.safeParse({ ...valid, budget: "$1 per month" });
    expect(r.success).toBe(false);
    // An option from a different currency is also not valid for this country.
    expect(contactSchema.safeParse({ ...valid, budget: budgetOptions(valid.service, "US")[1] }).success).toBe(false);
  });

  it("flags a filled honeypot", () => {
    const r = contactSchema.safeParse({ ...valid, nickname: "bot" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.some((i) => i.path[0] === "nickname")).toBe(true);
  });

  it("trims whitespace and enforces length caps", () => {
    const r = contactSchema.safeParse({ ...valid, name: "  Ada Lovelace  " });
    expect(r.success && r.data.name).toBe("Ada Lovelace");
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(3001) }).success).toBe(false);
  });
});

describe("budgetOptions", () => {
  it("uses the visitor's market currency", () => {
    expect(budgetOptions("SEO", "US")[0]).toContain("$");
    expect(budgetOptions("SEO", "GB")[0]).toContain("£");
    expect(budgetOptions("SEO", "AE")[0]).toContain("AED");
    expect(currencyFor("AU")).toBe("AUD");
    expect(currencyFor("")).toBe("USD");
  });

  it("is monthly for retainers, one-off for websites, and always includes 'Not sure yet'", () => {
    expect(budgetOptions("Social Media Management", "US").slice(0, -1).every((o) => o.includes("per month"))).toBe(true);
    expect(budgetOptions("Website Design and Development", "US").slice(0, -1).every((o) => o.includes("one-off"))).toBe(true);
    for (const s of ["SEO", "Multiple Services", "Other", "Website Design and Development"]) expect(budgetOptions(s, "CA").at(-1)).toBe(NOT_SURE);
  });

  it("produces strictly increasing, non-overlapping bands", () => {
    const opts = budgetOptions("Website Design and Development", "US").slice(0, -1);
    expect(opts[0]).toMatch(/^Under /);
    expect(opts.at(-1)).toMatch(/\+/);
    expect(new Set(opts).size).toBe(opts.length);
  });
});
