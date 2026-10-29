import "server-only";
import type { z } from "zod";
import { aiConfig, type AiConfig } from "./config";

export type AiErrorCode = "not_configured" | "busy" | "blocked" | "invalid" | "timeout" | "upstream";

export class AiError extends Error {
  constructor(
    public code: AiErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export type GenerateOptions<T> = {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  tier?: "fast" | "strong";
  maxOutputTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

/** Removes a ```json fence if the model added one, then parses. */
export function parseJsonLoose(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

type Raw = { text: string; finish?: string };

async function callGemini(cfg: AiConfig, model: string, o: GenerateOptions<unknown>, retryHint: boolean, fetchImpl: typeof fetch): Promise<Raw> {
  const res = await fetchImpl(`${cfg.baseUrl}/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    signal: AbortSignal.timeout(o.timeoutMs ?? 40_000),
    headers: { "x-goog-api-key": cfg.key, "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: o.system }] },
      contents: [{ role: "user", parts: [{ text: retryHint ? `${o.prompt}\n\nReturn ONLY valid JSON that matches the requested shape.` : o.prompt }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: o.maxOutputTokens ?? 1800, temperature: o.temperature ?? 0.5 },
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: { code?: number; message?: string };
    promptFeedback?: { blockReason?: string };
    candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  };
  if (!res.ok || body.error) throw Object.assign(new Error(body.error?.message ?? `HTTP ${res.status}`), { status: res.status });
  if (body.promptFeedback?.blockReason) throw new AiError("blocked", "That input can't be processed.");
  const cand = body.candidates?.[0];
  const text = (cand?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
  if (cand?.finishReason === "SAFETY") throw new AiError("blocked", "That input can't be processed.");
  return { text, finish: cand?.finishReason };
}

async function callAnthropic(cfg: AiConfig, model: string, o: GenerateOptions<unknown>, retryHint: boolean, fetchImpl: typeof fetch): Promise<Raw> {
  const res = await fetchImpl(`${cfg.baseUrl}/messages`, {
    method: "POST",
    signal: AbortSignal.timeout(o.timeoutMs ?? 40_000),
    headers: { "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: o.maxOutputTokens ?? 1800,
      temperature: o.temperature ?? 0.5,
      system: o.system,
      messages: [{ role: "user", content: retryHint ? `${o.prompt}\n\nReturn ONLY valid JSON that matches the requested shape.` : o.prompt }],
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string }; content?: { type: string; text?: string }[]; stop_reason?: string };
  if (!res.ok || body.error) throw Object.assign(new Error(body.error?.message ?? `HTTP ${res.status}`), { status: res.status });
  return { text: (body.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join(""), finish: body.stop_reason };
}

/**
 * Asks the model for JSON and validates it against a zod schema, so the UI only ever receives data of the expected shape.
 * Tries each model in the tier's fallback chain when one is retired (404) or overloaded (429/503), and re-asks once if the JSON is malformed.
 */
export async function generateJson<T>(o: GenerateOptions<T>, cfg: AiConfig | null = aiConfig(), fetchImpl: typeof fetch = fetch): Promise<T> {
  if (!cfg) throw new AiError("not_configured", "AI features aren't switched on yet.");
  const models = cfg[o.tier ?? "fast"];
  let lastError: unknown;

  for (const model of models) {
    for (const retryHint of [false, true]) {
      try {
        const raw = cfg.provider === "anthropic" ? await callAnthropic(cfg, model, o, retryHint, fetchImpl) : await callGemini(cfg, model, o, retryHint, fetchImpl);
        if (!raw.text.trim()) throw new AiError("invalid", "The AI returned an empty answer.");
        const parsed = o.schema.safeParse(parseJsonLoose(raw.text));
        if (parsed.success) return parsed.data;
        lastError = new AiError("invalid", "The AI returned an answer in an unexpected format.");
        continue; // re-ask once with a stricter reminder
      } catch (e) {
        if (e instanceof AiError && e.code === "blocked") throw e;
        if (e instanceof SyntaxError) {
          lastError = new AiError("invalid", "The AI returned an answer in an unexpected format.");
          continue;
        }
        lastError = e;
        const status = (e as { status?: number }).status;
        if ((e as Error).name === "TimeoutError" || (e as Error).name === "AbortError") break; // try the next model
        if (status === 404 || status === 429 || status === 503 || status === 500) break; // model unavailable or busy: next in chain
        throw mapError(e);
      }
    }
  }
  throw mapError(lastError);
}

function mapError(e: unknown): AiError {
  if (e instanceof AiError) return e;
  const status = (e as { status?: number })?.status;
  const name = (e as Error)?.name;
  if (name === "TimeoutError" || name === "AbortError") return new AiError("timeout", "The AI took too long to respond. Please try again.");
  if (status === 429 || status === 503) return new AiError("busy", "The AI service is busy right now. Please try again in a minute.");
  // Never forward upstream error text to visitors: it can contain account or key details.
  return new AiError("upstream", "The AI service couldn't complete that request.");
}
