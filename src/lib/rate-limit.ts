type Entry = { count: number; reset: number };
const hits = new Map<string, Entry>();

/**
 * Fixed-window limiter held in memory. It slows casual abuse on a single server instance; serverless or multi-instance
 * deployments should add a shared store (for example Upstash Redis) or an edge rate limit. See README.
 */
export function rateLimit(key: string, limit = 5, windowMs = 10 * 60_000, now = Date.now()): { ok: boolean; retryAfter: number } {
  const entry = hits.get(key);
  if (!entry || entry.reset <= now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  return entry.count > limit ? { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) } : { ok: true, retryAfter: 0 };
}

export const __resetRateLimit = () => hits.clear();
