import { handleAi } from "@/lib/ai/guard";
import { briefInput, writeBrief } from "@/lib/ai/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleAi(req, { feature: "brief", input: briefInput, run: (input) => writeBrief(input) });
}
