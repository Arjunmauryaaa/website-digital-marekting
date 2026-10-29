import { handleAi } from "@/lib/ai/guard";
import { headlineInput, writeHeadlines } from "@/lib/ai/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleAi(req, { feature: "headline", input: headlineInput, run: (input) => writeHeadlines(input) });
}
