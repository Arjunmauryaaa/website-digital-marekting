import "server-only";
import { z } from "zod";
import type { ContactInput } from "@/lib/contact";
import { aiConfig } from "./config";
import { fence, SAFETY_RULES } from "./prompt";
import { generateJson } from "./provider";

export const leadSummarySchema = z.object({
  summary: z.string().max(500),
  priority: z.enum(["low", "medium", "high"]),
  signals: z.array(z.string().max(160)).max(4),
  questions: z.array(z.string().max(200)).max(4),
  suggestedReply: z.string().max(1200),
});
export type LeadSummary = z.infer<typeof leadSummarySchema>;

/**
 * INTERNAL ONLY. Summarises an enquiry for the agency's inbox with a suggested reply for a human to review.
 * It is opt-in (AI_LEAD_SUMMARY=1) because the enquiry text is sent to the AI provider. Never blocks or delays delivery for long:
 * any failure or timeout simply returns null and the plain enquiry is sent.
 */
export async function summariseLead(d: ContactInput): Promise<LeadSummary | null> {
  if (!aiConfig()?.leadSummary) return null;
  const system = [
    "You help a small digital agency triage new website enquiries. Your output is read only by the agency's staff, never by the sender.",
    SAFETY_RULES,
    "Priority reflects how well the enquiry matches a typical agency project (clear need, realistic budget, ready to start), not the sender's importance. Use only the details given.",
    "suggestedReply is a short, warm, professional draft email in the first person plural. It must not quote prices, timelines or guarantees, and should propose a discovery call.",
  ].join("\n");
  const prompt = [
    "Return JSON: {summary (2 sentences), priority: low|medium|high, signals: string[] (what suggests fit or risk), questions: string[] (what to ask first), suggestedReply: string}",
    `Country: ${d.country}\nService: ${d.service}\nBudget band: ${d.budget}\nContact preference: ${d.contactMethod}`,
    fence("user_input", "company", d.company, 150),
    fence("user_input", "website", d.website ?? "(none)", 300),
    fence("user_input", "project description", d.message, 3000),
  ].join("\n");
  try {
    return await Promise.race([
      generateJson({ system, prompt, schema: leadSummarySchema, tier: "fast", maxOutputTokens: 1100, temperature: 0.3, timeoutMs: 9_000 }),
      new Promise<null>((r) => setTimeout(() => r(null), 9_500)),
    ]);
  } catch {
    return null;
  }
}
