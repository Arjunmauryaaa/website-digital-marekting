import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";
import { budgetOptions } from "@/lib/contact";
import { __resetRateLimit, rateLimit } from "@/lib/rate-limit";
import { emailConfig, enquiryMessage, sendEnquiry } from "@/lib/email";

const body = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Co",
  country: "US",
  service: "SEO",
  budget: budgetOptions("SEO", "US")[1],
  message: "We would like help improving our search visibility.",
  contactMethod: "Email",
  startedAt: Date.now() - 60_000,
};

const req = (data: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost:3000/api/contact", { method: "POST", headers: { "Content-Type": "application/json", host: "localhost:3000", ...headers }, body: JSON.stringify(data) });

const ENV_KEYS = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL", "RESEND_API_URL"] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  __resetRateLimit();
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  for (const k of ENV_KEYS) delete process.env[k];
});
afterEach(() => {
  for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
});

const configure = () => {
  process.env.RESEND_API_KEY = "k";
  process.env.CONTACT_FROM_EMAIL = "from@x.test";
  process.env.CONTACT_TO_EMAIL = "to@x.test";
};

describe("POST /api/contact", () => {
  it("never claims success when email isn't configured (503 not_configured)", async () => {
    const res = await POST(req(body));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, error: "not_configured" });
  });

  it("returns field errors for invalid input (422)", async () => {
    configure();
    const res = await POST(req({ ...body, email: "bad" }));
    expect(res.status).toBe(422);
    expect((await res.json()).fields.email).toMatch(/valid email/i);
  });

  it("rejects honeypot fills and instant submissions without leaking why", async () => {
    configure();
    const bot = await POST(req({ ...body, nickname: "x" }));
    expect(bot.status).toBe(400);
    expect((await bot.json()).error).toBe("rejected");
    const fast = await POST(req({ ...body, startedAt: Date.now() }));
    expect(fast.status).toBe(400);
  });

  it("blocks cross-origin browser requests and non-JSON bodies", async () => {
    configure();
    expect((await POST(req(body, { origin: "https://evil.example" }))).status).toBe(403);
    const form = new Request("http://localhost:3000/api/contact", { method: "POST", headers: { "Content-Type": "text/plain", host: "localhost:3000" }, body: "x" });
    expect((await POST(form)).status).toBe(415);
  });

  it("rate limits repeated submissions from one connection", async () => {
    for (let i = 0; i < 5; i++) await POST(req(body, { "x-forwarded-for": "9.9.9.9" }));
    const res = await POST(req(body, { "x-forwarded-for": "9.9.9.9" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("sends through the provider and returns ok only when it accepts", async () => {
    configure();
    const calls: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => (calls.push({ url, init }), new Response("{}", { status: 200 }))));
    const ok = await POST(req(body));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({ to: ["to@x.test"], reply_to: "ada@example.com" });
    vi.unstubAllGlobals();
  });

  it("returns 502 and no success when the provider fails", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));
    const res = await POST(req(body));
    expect(res.status).toBe(502);
    expect((await res.json()).ok).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe("email helpers", () => {
  it("is unconfigured unless all three variables exist", () => {
    expect(emailConfig({} as NodeJS.ProcessEnv)).toBeNull();
    expect(emailConfig({ RESEND_API_KEY: "a", CONTACT_FROM_EMAIL: "b" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(emailConfig({ RESEND_API_KEY: "a", CONTACT_FROM_EMAIL: "b", CONTACT_TO_EMAIL: "c" } as unknown as NodeJS.ProcessEnv)?.apiUrl).toBe("https://api.resend.com/emails");
  });

  it("escapes HTML and strips newlines from the subject", () => {
    const m = enquiryMessage({ ...body, company: "<b>Evil</b>\r\nBcc: x@y.z", message: "<script>alert(1)</script>" } as never);
    expect(m.html).not.toContain("<script>");
    expect(m.html).toContain("&lt;script&gt;");
    expect(m.subject).not.toMatch(/[\r\n]/);
  });

  it("sendEnquiry reports false when the provider rejects", async () => {
    const f = vi.fn(async () => new Response("no", { status: 422 }));
    expect(await sendEnquiry(body as never, { apiKey: "k", from: "f", to: "t", apiUrl: "http://x" }, f as never)).toBe(false);
  });
});

describe("rateLimit", () => {
  it("resets after the window", () => {
    expect(rateLimit("k", 1, 1000, 0).ok).toBe(true);
    expect(rateLimit("k", 1, 1000, 10).ok).toBe(false);
    expect(rateLimit("k", 1, 1000, 1500).ok).toBe(true);
  });
});
