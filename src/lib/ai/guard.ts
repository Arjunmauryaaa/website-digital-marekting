import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { aiConfig } from "./config";
import { AiError } from "./provider";

export type Feature = "audit" | "roadmap" | "content" | "headline" | "assistant" | "brief";

/** Per-visitor limits: [requests, window in minutes]. Outbound-fetch and long-output features are tighter. */
const LIMITS: Record<Feature, [number, number]> = {
  audit: [4, 10],
  roadmap: [6, 10],
  content: [6, 10],
  headline: [10, 10],
  assistant: [24, 10],
  brief: [10, 10],
};

let day = "";
let used = 0;
/** A global daily ceiling so a bot swarm (or a bug) can't run up the bill. Resets at UTC midnight; per-instance on serverless. */
export function takeDailyBudget(limit: number, now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  if (day !== today) {
    day = today;
    used = 0;
  }
  if (used >= limit) return false;
  used += 1;
  return true;
}
export const __resetBudget = () => {
  day = "";
  used = 0;
};

const json = (body: unknown, status = 200, headers?: HeadersInit) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export const clientIp = (req: Request) => (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

type Handler<I, O> = (input: I, ctx: { ip: string }) => Promise<O>;

/**
 * Shared wrapper for every AI endpoint: same-origin check, JSON only, size cap, per-visitor rate limit, validation,
 * the global daily budget, and mapping of failures to honest, non-leaky responses.
 * `requiresAi: false` lets a feature (the audit) still return its non-AI results when no key is configured.
 */
export async function handleAi<S extends z.ZodTypeAny, O>(req: Request, opts: { feature: Feature; input: S; requiresAi?: boolean; run: Handler<z.infer<S>, O> }): Promise<NextResponse> {
  if (!sameOrigin(req)) return json({ ok: false, error: "forbidden", message: "This request was blocked." }, 403);
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return json({ ok: false, error: "bad_request", message: "Unsupported request." }, 415);
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > 20_000) return json({ ok: false, error: "too_large", message: "That request is too large." }, 413);

  const cfg = aiConfig();
  if ((opts.requiresAi ?? true) && !cfg) return json({ ok: false, error: "not_configured", message: "This AI tool isn't switched on yet." }, 503);

  const ip = clientIp(req);
  const [limit, minutes] = LIMITS[opts.feature];
  // AI_RATE_SCALE lets end-to-end tests run many requests from one address. Leave it unset in production.
  const rl = rateLimit(`ai:${opts.feature}:${ip}`, limit * (Number(process.env.AI_RATE_SCALE) || 1), minutes * 60_000);
  if (!rl.ok) return json({ ok: false, error: "rate_limited", message: `You've used this tool a lot. Please try again in ${Math.ceil(rl.retryAfter / 60)} minute(s).` }, 429, { "Retry-After": String(rl.retryAfter) });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "bad_request", message: "We couldn't read that request." }, 400);
  }
  const parsed = opts.input.safeParse(payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
    return json({ ok: false, error: "validation", fields, message: Object.values(fields)[0] ?? "Please check your input." }, 422);
  }

  if (cfg && !takeDailyBudget(cfg.dailyLimit)) {
    return json({ ok: false, error: "busy", message: "Our AI tools are very busy today. Please try again tomorrow, or contact us directly." }, 503);
  }

  try {
    return json({ ok: true, data: await opts.run(parsed.data, { ip }) });
  } catch (e) {
    if (e instanceof AiError) {
      const status = e.code === "not_configured" ? 503 : e.code === "busy" ? 503 : e.code === "blocked" ? 422 : e.code === "timeout" ? 504 : 502;
      if (e.code === "upstream" || e.code === "invalid") console.error(`[ai:${opts.feature}]`, e.code);
      return json({ ok: false, error: e.code, message: e.message }, status);
    }
    if (e instanceof Error && e.name === "UserFacingError") return json({ ok: false, error: "rejected", message: e.message }, 422);
    console.error(`[ai:${opts.feature}] unexpected`, e instanceof Error ? e.message : "unknown error");
    return json({ ok: false, error: "failed", message: "Something went wrong. Please try again." }, 500);
  }
}

/** For errors we want visitors to see verbatim (for example "that address can't be checked"). */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}
