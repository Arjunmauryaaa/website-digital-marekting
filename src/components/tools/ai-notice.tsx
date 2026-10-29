import Link from "next/link";
import { aiConfig } from "@/lib/ai/config";

const NAME = { gemini: "Google's Gemini API", anthropic: "Anthropic's Claude API" } as const;

/** Plain-language disclosure shown on every AI tool. Names the provider from server config, so it stays accurate if you switch. */
export function AiNotice() {
  const cfg = aiConfig();
  const provider = cfg ? NAME[cfg.provider] : "an AI provider";
  return (
    <aside className="ainote" aria-label="About the AI">
      <p>
        <strong>AI-assisted.</strong> Results are generated automatically and can contain mistakes, so treat them as a starting point. Please don&apos;t enter confidential or personal information. What you type is sent to {provider} to produce the result, and we don&apos;t store it.{" "}
        <Link href="/privacy#ai">How we handle AI and data</Link>
      </p>
    </aside>
  );
}
