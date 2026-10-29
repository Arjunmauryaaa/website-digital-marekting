export type AiProvider = "gemini" | "anthropic";

export type AiConfig = {
  provider: AiProvider;
  key: string;
  baseUrl: string;
  /** cheap, quick model for short answers */
  fast: string[];
  /** better writer for longer reports */
  strong: string[];
  dailyLimit: number;
  leadSummary: boolean;
};

const list = (v: string | undefined, fallback: string[]) => (v?.trim() ? v.split(",").map((s) => s.trim()).filter(Boolean) : fallback);

/**
 * Reads AI settings from server-side environment variables only (never NEXT_PUBLIC_). Returns null when no key is set,
 * which switches every AI feature to an honest "not switched on yet" state.
 * Model names change over time, so each slot accepts a comma-separated fallback chain.
 */
export function aiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig | null {
  const provider: AiProvider = env.AI_PROVIDER === "anthropic" ? "anthropic" : "gemini";
  const key = (provider === "anthropic" ? env.ANTHROPIC_API_KEY : env.GEMINI_API_KEY)?.trim();
  if (!key) return null;
  return {
    provider,
    key,
    // AI_BASE_URL exists so tests can point at a local mock. Server-side only.
    baseUrl: (env.AI_BASE_URL?.trim() || (provider === "anthropic" ? "https://api.anthropic.com/v1" : "https://generativelanguage.googleapis.com/v1beta")).replace(/\/$/, ""),
    fast: list(env.AI_MODEL_FAST, provider === "anthropic" ? ["claude-haiku-5-5"] : ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]),
    strong: list(env.AI_MODEL_STRONG, provider === "anthropic" ? ["claude-sonnet-5-5"] : ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]),
    dailyLimit: Math.max(1, Number(env.AI_DAILY_LIMIT) || 300),
    leadSummary: env.AI_LEAD_SUMMARY === "1",
  };
}

export const aiEnabled = () => aiConfig() !== null;
