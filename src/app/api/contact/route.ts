import { NextResponse } from "next/server";
import { contactSchema, fieldErrors, MIN_FILL_MS } from "@/lib/contact";
import { summariseLead } from "@/lib/ai/lead";
import { emailConfig, sendEnquiry } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200, headers?: HeadersInit) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; still validated and rate limited
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: "forbidden", message: "This request was blocked." }, 403);
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return json({ ok: false, error: "bad_request", message: "Unsupported request." }, 415);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  // FORM_RATE_SCALE lets end-to-end tests send many enquiries from one address. Leave it unset in production.
  const limited = rateLimit(`contact:${ip}`, 5 * (Number(process.env.FORM_RATE_SCALE) || 1));
  if (!limited.ok) {
    return json({ ok: false, error: "rate_limited", message: "Too many enquiries from this connection. Please try again later." }, 429, { "Retry-After": String(limited.retryAfter) });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "bad_request", message: "We couldn't read that request." }, 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    // A filled honeypot gets a generic response so bots learn nothing about why they were rejected.
    if (parsed.error.issues.some((i) => i.path[0] === "nickname")) return json({ ok: false, error: "rejected", message: "We couldn't send your enquiry." }, 400);
    return json({ ok: false, error: "validation", fields: fieldErrors(parsed.error), message: "Please correct the highlighted fields." }, 422);
  }
  if (parsed.data.startedAt && Date.now() - parsed.data.startedAt < MIN_FILL_MS) {
    return json({ ok: false, error: "rejected", message: "That was quick. Please review your details and try again." }, 400);
  }

  const config = emailConfig();
  if (!config) {
    // Never pretend a message was delivered when nothing could be sent.
    return json({ ok: false, error: "not_configured", message: "Our enquiry form isn't connected to an inbox yet, so your message was not sent. Please try again later." }, 503);
  }

  try {
    const ai = await summariseLead(parsed.data); // internal triage note; null when off or on any failure
    if (!(await sendEnquiry(parsed.data, config, fetch, ai))) throw new Error("provider rejected");
    return json({ ok: true });
  } catch (error) {
    console.error("[contact] email delivery failed", error instanceof Error ? error.message : "unknown error");
    return json({ ok: false, error: "delivery_failed", message: "We couldn't send your enquiry right now. Please try again in a moment." }, 502);
  }
}
