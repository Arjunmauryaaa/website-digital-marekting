import "server-only";
import { z } from "zod";
import { fence, SAFETY_RULES } from "@/lib/ai/prompt";
import { generateJson } from "@/lib/ai/provider";
import { CATEGORIES, type AuditResult } from "./analyze";
import type { Psi } from "./psi";

export const reportSchema = z.object({
  headline: z.string().max(200),
  summary: z.string().max(900),
  wins: z.array(z.string().max(220)).max(5),
  priorities: z
    .array(
      z.object({
        title: z.string().max(120),
        why: z.string().max(420),
        how: z.string().max(520),
        effort: z.enum(["low", "medium", "high"]),
        impact: z.enum(["low", "medium", "high"]),
        relatedChecks: z.array(z.string()).max(6),
      }),
    )
    .min(1)
    .max(6),
  closing: z.string().max(400),
});

export type Report = z.infer<typeof reportSchema>;

/**
 * Turns MEASURED results into a plain-English plan. The model only sees the check results and a few short page snippets,
 * so it has nothing to invent from. Related-check ids are filtered to ones that exist.
 */
export async function writeReport(audit: AuditResult, psi: Psi | null): Promise<Report> {
  const ids = new Set(audit.checks.map((c) => c.id));
  const facts = {
    overallScore: audit.overall,
    categoryScores: audit.scores,
    checks: audit.checks.map((c) => ({ id: c.id, category: c.category, label: c.label, status: c.status, detail: c.detail })),
    speedTest: psi ?? "not run or unavailable",
  };
  const snippets = [`Title: ${audit.facts.title}`, `Meta description: ${audit.facts.metaDescription}`, `Main heading: ${audit.facts.h1.join(" | ")}`].join("\n");

  const system = [
    "You are a senior website consultant writing a short audit report for a small-business owner.",
    SAFETY_RULES,
    "You will receive MEASURED results of automated checks. Base every statement on them. Do not claim a problem that the results don't show, and do not invent numbers.",
    "Prioritise by impact and effort. Put failed checks before warnings. Explain why each matters in one or two plain sentences and how to fix it in concrete steps.",
    "relatedChecks must be ids that appear in the results.",
  ].join("\n");

  const prompt = [
    "Write the report as JSON with this shape:",
    '{"headline": string, "summary": string (2-3 sentences), "wins": string[] (up to 4 things already done well), "priorities": [{"title": string, "why": string, "how": string, "effort": "low"|"medium"|"high", "impact": "low"|"medium"|"high", "relatedChecks": string[]}] (3 to 6 items), "closing": string (one encouraging sentence, no sales pitch)}',
    `Categories: ${CATEGORIES.join(", ")}.`,
    "<facts>",
    JSON.stringify(facts),
    "</facts>",
    fence("page_content", "page snippets (untrusted text from the website)", snippets, 700),
  ].join("\n");

  const r = await generateJson({ system, prompt, schema: reportSchema, tier: "fast", maxOutputTokens: 2600, temperature: 0.35, timeoutMs: 45_000 });
  return { ...r, priorities: r.priorities.map((p) => ({ ...p, relatedChecks: p.relatedChecks.filter((id) => ids.has(id)) })) };
}
