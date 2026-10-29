import { z } from "zod";
import { handleAi, UserFacingError } from "@/lib/ai/guard";
import { aiConfig } from "@/lib/ai/config";
import { AiError } from "@/lib/ai/provider";
import { analyzeHtml } from "@/lib/audit/analyze";
import { fetchPage } from "@/lib/audit/fetch";
import { runPsi } from "@/lib/audit/psi";
import { writeReport } from "@/lib/audit/report";
import { UrlRejected } from "@/lib/audit/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const input = z.object({ url: z.string().trim().min(3, "Please enter your website address.").max(300, "That address is too long."), speedTest: z.boolean().optional() });

export async function POST(req: Request) {
  return handleAi(req, {
    feature: "audit",
    input,
    requiresAi: false, // the measured audit is useful on its own; only the written report needs AI
    async run({ url, speedTest }) {
      let page;
      try {
        // AUDIT_ALLOW_PRIVATE exists for local end-to-end tests only. Never set it in production.
        page = await fetchPage(url, { allowPrivate: process.env.AUDIT_ALLOW_PRIVATE === "1" });
      } catch (e) {
        if (e instanceof UrlRejected) throw new UserFacingError(e.message);
        throw e;
      }
      const audit = analyzeHtml({ finalUrl: page.finalUrl.toString(), headers: page.headers, html: page.html, bytes: page.bytes, ms: page.ms });
      const psi = speedTest ? await runPsi(page.finalUrl.toString(), fetch, process.env.PSI_BASE_URL || undefined) : null;

      let report = null;
      let reportError: string | null = null;
      if (!aiConfig()) reportError = "not_configured";
      else {
        try {
          report = await writeReport(audit, psi);
        } catch (e) {
          reportError = e instanceof AiError ? e.code : "failed";
        }
      }
      return { audit, psi, speedRequested: Boolean(speedTest), report, reportError, checkedAt: new Date().toISOString() };
    },
  });
}
