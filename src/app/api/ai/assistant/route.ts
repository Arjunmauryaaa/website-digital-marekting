import { answerQuestion, assistantInput, buildKnowledge, cannedReply, retrieve } from "@/lib/ai/assistant";
import { aiConfig } from "@/lib/ai/config";
import { handleAi } from "@/lib/ai/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleAi(req, {
    feature: "assistant",
    input: assistantInput,
    // Greetings, pricing and out-of-scope questions are answered from fixed text, so they work (and cost nothing) even without AI.
    requiresAi: false,
    async run(input) {
      if (!aiConfig()) {
        const canned = cannedReply(input.message, retrieve(input.message, buildKnowledge(), 5));
        if (canned) return canned;
        return { answer: "Our AI assistant isn't switched on yet. Please send us a short enquiry and we'll answer personally.", sources: [], handoff: true, followUps: [] };
      }
      return answerQuestion(input);
    },
  });
}
