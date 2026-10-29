import { parse } from "node-html-parser";

import { CATEGORIES, type AuditResult, type Category, type Check, type PageFacts, type Status } from "./types";
export { CATEGORIES };
export type { AuditResult, Category, Check, PageFacts, Status };

type Input = { finalUrl: string; headers: Record<string, string>; html: string; bytes: number; ms: number };

const CTA = /\b(contact|book|get started|get a quote|request|call us|call now|buy|shop|subscribe|sign up|enquir|inquir|schedule|free trial|demo|appointment)\b/i;
const PRIVACY = /privacy/i;

export function analyzeHtml({ finalUrl, headers, html, bytes, ms }: Input): AuditResult {
  const root = parse(html, { blockTextElements: { script: false, style: false, noscript: false, pre: true } });
  const checks: Check[] = [];
  const add = (id: string, category: Category, label: string, status: Status, detail: string, weight = 1) => checks.push({ id, category, label, status, detail, weight });

  const u = new URL(finalUrl);
  const https = u.protocol === "https:";
  const title = (root.querySelector("title")?.text ?? "").replace(/\s+/g, " ").trim();
  const meta = (name: string) => root.querySelector(`meta[name="${name}"]`)?.getAttribute("content")?.trim() ?? "";
  const prop = (p: string) => root.querySelector(`meta[property="${p}"]`)?.getAttribute("content")?.trim() ?? "";
  const description = meta("description");
  const h1s = root.querySelectorAll("h1").map((h) => h.text.replace(/\s+/g, " ").trim()).filter(Boolean);
  const h2s = root.querySelectorAll("h2").length;
  const lang = root.querySelector("html")?.getAttribute("lang")?.trim() ?? "";

  // visible text: drop scripts, styles and hidden template content
  root.querySelectorAll("script, style, noscript, template, svg").forEach((n) => n.remove());
  const text = (root.querySelector("body")?.text ?? root.text).replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;

  // --- Search basics
  if (!title) add("title", "Search basics", "Page title", "fail", "No page title was found. The title is the headline people see in search results.", 2);
  else if (title.length < 25 || title.length > 65) add("title", "Search basics", "Page title", "warn", `The title is ${title.length} characters. Around 30 to 60 usually displays well in search results.`, 2);
  else add("title", "Search basics", "Page title", "pass", `Good length (${title.length} characters).`, 2);

  if (!description) add("meta-description", "Search basics", "Meta description", "fail", "No meta description. Search engines will pick a snippet for you, which is often not the one you'd choose.", 2);
  else if (description.length < 70 || description.length > 165) add("meta-description", "Search basics", "Meta description", "warn", `The description is ${description.length} characters. Around 70 to 160 usually displays fully.`, 2);
  else add("meta-description", "Search basics", "Meta description", "pass", `Good length (${description.length} characters).`, 2);

  if (h1s.length === 0) add("h1", "Search basics", "Main heading (H1)", "fail", "No H1 heading found. Every page should have one clear main heading.", 2);
  else if (h1s.length > 1) add("h1", "Search basics", "Main heading (H1)", "warn", `${h1s.length} H1 headings found. One clear main heading is usually best.`, 2);
  else add("h1", "Search basics", "Main heading (H1)", "pass", "Exactly one H1 heading.", 2);

  add("headings", "Search basics", "Section headings (H2)", h2s >= 2 ? "pass" : h2s === 1 ? "warn" : "fail", h2s >= 2 ? `${h2s} section headings give the page structure.` : "Few or no H2 headings. Section headings help visitors and search engines scan the page.");

  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute("href");
  add("canonical", "Search basics", "Canonical link", canonical ? "pass" : "warn", canonical ? "A canonical URL is set." : "No canonical link. It helps avoid duplicate-page confusion.", 0.5);

  const robots = meta("robots").toLowerCase();
  add("indexable", "Search basics", "Allowed in search results", /noindex/.test(robots) ? "fail" : "pass", /noindex/.test(robots) ? "This page tells search engines NOT to index it (noindex)." : "Nothing blocks search engines from listing this page.", 2);

  add("lang", "Search basics", "Page language", lang ? "pass" : "warn", lang ? `Language is declared (${lang}).` : "No language declared on the page. Add lang to the html tag.", 0.5);

  const ld = html.includes("application/ld+json");
  add("structured-data", "Search basics", "Structured data", ld ? "pass" : "warn", ld ? "Structured data (JSON-LD) was found." : "No structured data. It can help search engines understand your business and show richer results.", 0.5);

  // --- Content
  add("word-count", "Content", "Amount of content", words >= 250 ? "pass" : words >= 80 ? "warn" : "fail", `About ${words} words of visible text.${words < 250 ? " Pages with very little text often struggle to explain the offer or rank." : ""}`, 1.5);

  const imgs = root.querySelectorAll("img");
  const noAlt = imgs.filter((i) => !(i.getAttribute("alt") ?? "").trim() && i.getAttribute("role") !== "presentation" && i.getAttribute("alt") !== "").length;
  add("image-alt", "Content", "Image descriptions (alt text)", imgs.length === 0 ? "warn" : noAlt === 0 ? "pass" : noAlt / imgs.length <= 0.25 ? "warn" : "fail", imgs.length === 0 ? "No images found. Relevant visuals help people trust and understand a page." : noAlt === 0 ? `All ${imgs.length} images have alt text.` : `${noAlt} of ${imgs.length} images have no alt text.`, 1.5);

  const anchors = root.querySelectorAll("a[href]");
  const internal = anchors.filter((a) => {
    const h = a.getAttribute("href") ?? "";
    if (/^(mailto:|tel:|javascript:|#)/i.test(h)) return false;
    try {
      return new URL(h, u).hostname === u.hostname;
    } catch {
      return false;
    }
  }).length;
  add("internal-links", "Content", "Links to other pages", internal >= 3 ? "pass" : internal >= 1 ? "warn" : "fail", `${internal} links to other pages on the site.${internal < 3 ? " Clear navigation helps visitors and search engines." : ""}`, 1);

  const ctaText = [...root.querySelectorAll("a, button")].some((e) => CTA.test(e.text) || CTA.test(e.getAttribute("aria-label") ?? ""));
  add("call-to-action", "Content", "Clear next step", ctaText ? "pass" : "warn", ctaText ? "The page offers an obvious next step (such as contact, book or buy)." : "No obvious call to action found. Visitors should always know what to do next.", 1.5);

  // --- Mobile and speed
  const viewport = root.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? "";
  add("viewport", "Mobile and speed", "Mobile viewport", /width\s*=\s*device-width/i.test(viewport) ? "pass" : "fail", /width\s*=\s*device-width/i.test(viewport) ? "The page is set up for phone screens." : "No mobile viewport setting. The page may display as a tiny desktop layout on phones.", 2);

  add("response-time", "Mobile and speed", "Server response time", ms < 1500 ? "pass" : ms < 3000 ? "warn" : "fail", `The page took ${(ms / 1000).toFixed(1)} s to start and finish loading from our test server.${ms >= 1500 ? " Slow responses cost visitors." : ""}`, 1.5);

  add("page-size", "Mobile and speed", "HTML size", bytes < 300_000 ? "pass" : bytes < 800_000 ? "warn" : "fail", `The page HTML is ${Math.round(bytes / 1024)} KB.${bytes >= 300_000 ? " Large pages are slower on mobile connections." : ""}`, 1);

  const enc = headers["content-encoding"] ?? "";
  add("compression", "Mobile and speed", "Compression", /(gzip|br|zstd|deflate)/i.test(enc) ? "pass" : "warn", /(gzip|br|zstd|deflate)/i.test(enc) ? `Responses are compressed (${enc}).` : "Responses don't appear to be compressed, which makes pages slower to load.", 0.5);

  const scripts = html.match(/<script\b/gi)?.length ?? 0;
  add("scripts", "Mobile and speed", "Number of scripts", scripts <= 15 ? "pass" : scripts <= 30 ? "warn" : "fail", `${scripts} script tags.${scripts > 15 ? " Many scripts slow pages down, especially on phones." : ""}`, 0.5);

  // --- Trust and security
  add("https", "Trust and security", "Secure connection (HTTPS)", https ? "pass" : "fail", https ? "The site uses HTTPS." : "The site is not using HTTPS. Browsers label it \"Not secure\", and visitors notice.", 2);
  add("hsts", "Trust and security", "HSTS security header", headers["strict-transport-security"] ? "pass" : "warn", headers["strict-transport-security"] ? "HSTS is enabled." : "No HSTS header. It tells browsers to always use the secure version of your site.", 0.5);
  add("security-headers", "Trust and security", "Basic security headers", headers["x-content-type-options"] && (headers["x-frame-options"] || /frame-ancestors/i.test(headers["content-security-policy"] ?? "")) ? "pass" : "warn", headers["x-content-type-options"] ? "Core protective headers are present." : "Some common protective headers (such as X-Content-Type-Options and frame protection) are missing.", 0.5);

  const mixed = https ? (html.match(/(?:src|href)=["']http:\/\/[^"']+/gi)?.filter((m) => /src=/i.test(m)).length ?? 0) : 0;
  add("mixed-content", "Trust and security", "Mixed content", mixed === 0 ? "pass" : "fail", mixed === 0 ? "No insecure resources loaded on the secure page." : `${mixed} resources are loaded over insecure HTTP on a secure page.`, 1);

  const hasPrivacy = anchors.some((a) => PRIVACY.test(a.text) || PRIVACY.test(a.getAttribute("href") ?? ""));
  add("privacy-link", "Trust and security", "Privacy policy link", hasPrivacy ? "pass" : "warn", hasPrivacy ? "A privacy policy link is present." : "No privacy policy link found. It builds trust and is often legally required.", 1);

  const hasContact = anchors.some((a) => /^(mailto:|tel:)/i.test(a.getAttribute("href") ?? "")) || anchors.some((a) => /contact/i.test(a.text));
  add("contact-details", "Trust and security", "Easy ways to get in touch", hasContact ? "pass" : "warn", hasContact ? "Contact details or a contact link are present." : "No visible email, phone or contact link. Visitors want to know they can reach a real business.", 1);

  // --- Social sharing
  add("og-title", "Social sharing", "Share title (Open Graph)", prop("og:title") ? "pass" : "warn", prop("og:title") ? "A share title is set." : "No Open Graph title. Links shared on social media may look plain.", 0.5);
  add("og-image", "Social sharing", "Share image", prop("og:image") ? "pass" : "warn", prop("og:image") ? "A share image is set." : "No share image. Posts linking to your site will show without a picture.", 1);
  add("twitter-card", "Social sharing", "Social card", meta("twitter:card") || prop("twitter:card") ? "pass" : "warn", meta("twitter:card") || prop("twitter:card") ? "A social card type is set." : "No Twitter/X card tag.", 0.5);
  const icon = root.querySelector('link[rel~="icon"]') || root.querySelector('link[rel="shortcut icon"]');
  add("favicon", "Social sharing", "Favicon", icon ? "pass" : "warn", icon ? "A favicon is set." : "No favicon link. Browsers show a generic icon in tabs and bookmarks.", 0.5);

  // --- Accessibility
  const fields = root.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea");
  const labelled = fields.filter((f) => {
    const id = f.getAttribute("id");
    return Boolean(f.getAttribute("aria-label") || f.getAttribute("aria-labelledby") || (id && root.querySelector(`label[for="${id}"]`)) || f.closest("label"));
  }).length;
  add("form-labels", "Accessibility", "Form field labels", fields.length === 0 ? "pass" : labelled === fields.length ? "pass" : labelled / fields.length >= 0.6 ? "warn" : "fail", fields.length === 0 ? "No form fields on this page." : `${labelled} of ${fields.length} form fields have a label.`, 1.5);

  const emptyLinks = anchors.filter((a) => !a.text.trim() && !a.getAttribute("aria-label") && !a.getAttribute("title") && !a.querySelector("img[alt]:not([alt=''])")).length;
  add("link-names", "Accessibility", "Descriptive links", emptyLinks === 0 ? "pass" : emptyLinks <= 3 ? "warn" : "fail", emptyLinks === 0 ? "Every link has a name that screen readers can announce." : `${emptyLinks} links have no readable name.`, 1);
  add("lang-a11y", "Accessibility", "Language for screen readers", lang ? "pass" : "warn", lang ? "The page language is declared." : "No language declared, so screen readers may use the wrong voice.", 0.5);

  const facts: PageFacts = { url: finalUrl, title, metaDescription: description, h1: h1s.slice(0, 3), wordCount: words, lang, images: imgs.length, imagesMissingAlt: noAlt, internalLinks: internal, scripts, bytes, responseMs: ms, https };
  return { facts, checks, ...score(checks) };
}

const POINTS: Record<Status, number> = { pass: 1, warn: 0.5, fail: 0 };

export function score(checks: Check[]): { scores: Record<Category, number>; overall: number } {
  const scores = {} as Record<Category, number>;
  let totalW = 0;
  let totalP = 0;
  for (const c of CATEGORIES) {
    const list = checks.filter((k) => k.category === c);
    const w = list.reduce((s, k) => s + k.weight, 0);
    const p = list.reduce((s, k) => s + k.weight * POINTS[k.status], 0);
    scores[c] = w ? Math.round((p / w) * 100) : 0;
    totalW += w;
    totalP += p;
  }
  return { scores, overall: totalW ? Math.round((totalP / totalW) * 100) : 0 };
}

