import { handleAi } from "@/lib/ai/guard";
import { deterministicRoadmap, roadmapInput, writeRoadmap } from "@/lib/ai/features";
import { AiError } from "@/lib/ai/provider";
import { QUESTIONS } from "@/lib/roadmap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleAi(req, {
    feature: "roadmap",
    input: roadmapInput,
    requiresAi: false, // scores and baseline advice are computed in code; only the personalised plan needs AI
    async run(input) {
      const known = new Set(QUESTIONS.map((q) => q.id));
      const answers = Object.fromEntries(Object.entries(input.answers).filter(([k]) => known.has(k)));
      if (Object.keys(answers).length < QUESTIONS.length) return { ...deterministicRoadmap(answers), ai: null, aiError: "incomplete" };
      try {
        return { ...(await writeRoadmap({ ...input, answers })), aiError: null };
      } catch (e) {
        return { ...deterministicRoadmap(answers), ai: null, aiError: e instanceof AiError ? e.code : "failed" };
      }
    },
  });
}
