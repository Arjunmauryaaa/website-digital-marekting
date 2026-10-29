import "server-only";

export type Psi = { performance: number; lcpSeconds: number | null; cls: number | null; tbtMs: number | null };

/**
 * Optional lab speed test from Google PageSpeed Insights. Best effort: it can be slow or rate-limited,
 * and any failure just means the report omits it. Only public URLs reach this (they've already passed audit validation).
 */
export async function runPsi(url: string, fetchImpl: typeof fetch = fetch, base = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"): Promise<Psi | null> {
  try {
    const res = await fetchImpl(`${base}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`, { signal: AbortSignal.timeout(28_000) });
    if (!res.ok) return null;
    const d = (await res.json()) as {
      lighthouseResult?: { categories?: { performance?: { score?: number } }; audits?: Record<string, { numericValue?: number }> };
    };
    const lh = d.lighthouseResult;
    const perf = lh?.categories?.performance?.score;
    if (typeof perf !== "number") return null;
    const num = (k: string) => (typeof lh?.audits?.[k]?.numericValue === "number" ? lh!.audits![k].numericValue! : null);
    const lcp = num("largest-contentful-paint");
    return { performance: Math.round(perf * 100), lcpSeconds: lcp === null ? null : Math.round(lcp / 100) / 10, cls: num("cumulative-layout-shift") === null ? null : Math.round(num("cumulative-layout-shift")! * 1000) / 1000, tbtMs: num("total-blocking-time") === null ? null : Math.round(num("total-blocking-time")!) };
  } catch {
    return null;
  }
}
