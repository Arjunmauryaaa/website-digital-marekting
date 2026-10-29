import { describe, expect, it } from "vitest";
import { analyzeHtml, score } from "@/lib/audit/analyze";
import { gradeFor } from "@/lib/audit/types";
import { isPrivateIp, normalizeUrl, UrlRejected } from "@/lib/audit/url";
import { runPsi } from "@/lib/audit/psi";

describe("SSRF protection", () => {
  it("classifies private, loopback, link-local, metadata and reserved addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "::1", "fe80::1", "fd00::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1"]) expect(isPrivateIp(ip), ip).toBe(true);
    for (const ip of ["8.8.8.8", "104.20.23.154", "172.32.0.1", "2606:4700:4700::1111", "::ffff:8.8.8.8"]) expect(isPrivateIp(ip), ip).toBe(false);
  });

  it("rejects dangerous or unsupported addresses with a safe message", () => {
    for (const bad of ["http://127.0.0.1", "localhost", "http://localhost:3000", "http://169.254.169.254/latest/meta-data", "http://10.0.0.5", "http://[::1]/", "ftp://example.com", "file:///etc/passwd", "javascript:alert(1)", "http://user:pass@example.com", "http://example.com:8080", "http://intranet/", "http://db.internal/", "http://printer.local/", ""]) {
      expect(() => normalizeUrl(bad), bad).toThrow(UrlRejected);
    }
  });

  it("accepts ordinary public addresses and normalises them", () => {
    expect(normalizeUrl("example.com").toString()).toBe("https://example.com/");
    expect(normalizeUrl("https://Example.com/path?x=1#frag").toString()).toBe("https://example.com/path?x=1");
    expect(normalizeUrl("http://example.com:80/").hostname).toBe("example.com");
  });

  it("private hosts are only allowed in the test-only mode", () => {
    expect(normalizeUrl("http://localhost:4030/site", true).port).toBe("4030");
  });
});

const GOOD = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sunrise Yoga Studio | Beginner classes in town</title>
<meta name="description" content="Friendly beginner yoga classes in the heart of the neighbourhood. Book your first class online today and feel the difference."><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://x.test/"><link rel="icon" href="/f.ico"><meta property="og:title" content="t"><meta property="og:image" content="/i.jpg"><meta name="twitter:card" content="summary">
<script type="application/ld+json">{}</script></head><body><h1>Yoga for busy people</h1><p>${"Relax, stretch and breathe with small friendly classes. ".repeat(40)}</p>
<h2>Classes</h2><h2>Teachers</h2><a href="/classes">Classes</a><a href="/about">About</a><a href="/contact">Contact us</a><a href="/book">Book a class</a><a href="/privacy">Privacy policy</a><a href="mailto:hi@x.test">Email</a>
<img src="/a.jpg" alt="A class"><form><label for="n">Name</label><input id="n" name="n"></form></body></html>`;
const BAD = `<html><head><meta name="robots" content="noindex"></head><body><a href="x.html"></a><img src="a.jpg"><img src="b.jpg"><input name="q"></body></html>`;
const SECURE = { "strict-transport-security": "max-age=1", "x-content-type-options": "nosniff", "x-frame-options": "DENY", "content-encoding": "br" };

describe("analyzeHtml", () => {
  it("scores a well-built page highly and explains each check", () => {
    const r = analyzeHtml({ finalUrl: "https://x.test/", headers: SECURE, html: GOOD, bytes: 20_000, ms: 400 });
    expect(r.overall).toBeGreaterThanOrEqual(90);
    expect(r.checks).toHaveLength(30);
    expect(new Set(r.checks.map((c) => c.id)).size).toBe(30);
    for (const c of r.checks) {
      expect(c.detail.length).toBeGreaterThan(10);
      expect(["pass", "warn", "fail"]).toContain(c.status);
    }
    expect(r.checks.find((c) => c.id === "title")?.status).toBe("pass");
    expect(r.facts.h1).toEqual(["Yoga for busy people"]);
    expect(r.facts.wordCount).toBeGreaterThan(250);
  });

  it("flags the real problems on a poor page", () => {
    const r = analyzeHtml({ finalUrl: "http://x.test/", headers: {}, html: BAD, bytes: 900_000, ms: 4200 });
    const status = (id: string) => r.checks.find((c) => c.id === id)?.status;
    expect(status("title")).toBe("fail");
    expect(status("meta-description")).toBe("fail");
    expect(status("h1")).toBe("fail");
    expect(status("indexable")).toBe("fail");
    expect(status("viewport")).toBe("fail");
    expect(status("https")).toBe("fail");
    expect(status("response-time")).toBe("fail");
    expect(status("page-size")).toBe("fail");
    expect(status("image-alt")).toBe("fail");
    expect(status("form-labels")).toBe("fail");
    expect(r.overall).toBeLessThan(40);
    expect(gradeFor(r.overall)).toBe("Needs attention");
  });

  it("ignores text inside scripts and styles when counting words", () => {
    const r = analyzeHtml({ finalUrl: "https://x.test/", headers: {}, html: `<html><body><h1>Hi</h1><script>${"word ".repeat(500)}</script><style>${"x ".repeat(500)}</style><p>Just five visible words here.</p></body></html>`, bytes: 1000, ms: 100 });
    expect(r.facts.wordCount).toBeLessThan(15);
  });

  it("score() weights checks and keeps each area between 0 and 100", () => {
    const r = analyzeHtml({ finalUrl: "https://x.test/", headers: {}, html: GOOD, bytes: 1, ms: 1 });
    for (const v of Object.values(r.scores)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(score([]).overall).toBe(0);
    expect(gradeFor(90)).toBe("Strong");
  });
});

describe("PageSpeed (optional)", () => {
  it("parses a lab result and never throws", async () => {
    const ok = async () => new Response(JSON.stringify({ lighthouseResult: { categories: { performance: { score: 0.87 } }, audits: { "largest-contentful-paint": { numericValue: 2450 }, "cumulative-layout-shift": { numericValue: 0.0123 }, "total-blocking-time": { numericValue: 130.4 } } } }), { status: 200 });
    expect(await runPsi("https://x.test", ok as never, "https://psi.test")).toEqual({ performance: 87, lcpSeconds: 2.5, cls: 0.012, tbtMs: 130 });
    expect(await runPsi("https://x.test", (async () => new Response("{}", { status: 429 })) as never, "https://psi.test")).toBeNull();
    expect(await runPsi("https://x.test", (async () => { throw new Error("network"); }) as never, "https://psi.test")).toBeNull();
  });
});
