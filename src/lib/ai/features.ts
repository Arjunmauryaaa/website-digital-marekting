import "server-only";
import { z } from "zod";
import { packages } from "@/content/site-content";
import { AREA_ADVICE, AREAS, BUSINESS_TYPES, GOALS, QUESTIONS, scoreAnswers, type Answers } from "@/lib/roadmap";
import { fence, SAFETY_RULES } from "./prompt";
import { generateJson } from "./provider";

const text = (max: number, min = 1) => z.string().trim().min(min).max(max);

/* ------------------------------------------------------------------ roadmap */
export const roadmapInput = z.object({
  business: z.enum(BUSINESS_TYPES),
  goal: z.enum(GOALS),
  notes: text(400, 0).optional(),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

const ENGAGEMENTS = [...packages.map((p) => p.name), "Not sure yet"] as const;

export const roadmapOutput = z.object({
  summary: z.string().max(700),
  strengths: z.array(z.string().max(200)).max(4),
  priorities: z.array(z.object({ area: z.enum(AREAS), title: z.string().max(120), why: z.string().max(360), firstSteps: z.array(z.string().max(220)).min(2).max(4) })).min(2).max(4),
  plan: z.array(z.object({ week: z.number().int().min(1).max(4), focus: z.string().max(120), actions: z.array(z.string().max(220)).min(2).max(4) })).length(4),
  suggestedEngagement: z.enum(ENGAGEMENTS as unknown as [string, ...string[]]),
  engagementReason: z.string().max(320),
});

export function deterministicRoadmap(answers: Answers) {
  const { areas, overall, level } = scoreAnswers(answers);
  const weakest = [...AREAS].sort((a, b) => areas[a] - areas[b]).slice(0, 3);
  return {
    areas,
    overall,
    level,
    priorities: weakest.map((a) => ({ area: a, title: AREA_ADVICE[a].title, why: AREA_ADVICE[a].why, firstSteps: AREA_ADVICE[a].steps })),
  };
}

export async function writeRoadmap(i: z.infer<typeof roadmapInput>) {
  const base = deterministicRoadmap(i.answers);
  const answered = QUESTIONS.map((q) => ({ question: q.text, area: q.area, answer: q.options[i.answers[q.id]]?.label ?? "(not answered)" }));
  const system = [
    "You are a pragmatic digital marketing strategist creating a first 30-day roadmap for a small business owner.",
    SAFETY_RULES,
    `Only recommend one of these engagements for suggestedEngagement: ${ENGAGEMENTS.join(" | ")}. They are described as: ${packages.map((p) => `${p.name} (${p.for})`).join("; ")}. Never mention prices.`,
    "The scores were computed from the answers and are authoritative. Focus priorities on the weakest areas. Be specific to the business type and goal.",
  ].join("\n");
  const prompt = [
    "Return JSON: {summary (2-3 sentences), strengths (string[] up to 3), priorities [{area, title, why, firstSteps (2-4 strings)}] (2-3 items, area one of " + AREAS.join(" | ") + "), plan [{week: 1..4, focus, actions: 2-4 strings}] (exactly 4 weeks), suggestedEngagement, engagementReason}",
    `Business type: ${i.business}\nMain goal: ${i.goal}`,
    fence("user_input", "extra notes", i.notes ?? "", 400),
    "<facts>",
    JSON.stringify({ scores: base.areas, overall: base.overall, level: base.level, answers: answered }),
    "</facts>",
  ].join("\n");
  const ai = await generateJson({ system, prompt, schema: roadmapOutput, tier: "fast", maxOutputTokens: 2600, temperature: 0.5, timeoutMs: 45_000 });
  return { ...base, ai };
}

/* ------------------------------------------------------------------ content calendar */
export const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "TikTok"] as const;
export const TONES = ["Friendly", "Professional", "Playful", "Inspiring", "Expert"] as const;

export const contentInput = z.object({
  business: text(160, 3),
  audience: text(160, 3),
  goal: z.enum(["Get more enquiries", "Build awareness", "Engage existing customers", "Promote an offer"]),
  platform: z.enum(PLATFORMS),
  tone: z.enum(TONES),
  offer: text(200, 0).optional(),
});

export const contentOutput = z.object({
  theme: z.string().max(160),
  days: z
    .array(z.object({ day: z.number().int().min(1).max(7), format: z.string().max(40), hook: z.string().max(180), caption: z.string().max(700), visual: z.string().max(260), cta: z.string().max(120), hashtags: z.array(z.string().max(40)).max(6) }))
    .length(7),
  tips: z.array(z.string().max(220)).max(3),
});

export async function writeContent(i: z.infer<typeof contentInput>) {
  const system = ["You are a social media strategist who writes practical, original content plans for small businesses.", SAFETY_RULES, "Do not invent offers, discounts, reviews, statistics or customer stories. If an offer is not provided, do not mention one. Keep captions suitable for the platform."].join("\n");
  const prompt = [
    `Create a 7-day content plan as JSON: {theme, days: [{day: 1..7, format (e.g. Reel, Carousel, Story, Photo post, Text post), hook, caption, visual (what to show), cta, hashtags: string[] (without #, max 5)}] (exactly 7), tips: string[] (up to 3)}`,
    `Platform: ${i.platform}\nTone: ${i.tone}\nGoal: ${i.goal}`,
    fence("user_input", "business", i.business, 160),
    fence("user_input", "target audience", i.audience, 160),
    fence("user_input", "offer", i.offer ?? "(none)", 200),
    "Vary formats across the week. Make the first line of each caption a strong hook.",
  ].join("\n");
  return generateJson({ system, prompt, schema: contentOutput, tier: "fast", maxOutputTokens: 3600, temperature: 0.8, timeoutMs: 45_000 });
}

/* ------------------------------------------------------------------ headline lab */
export const headlineInput = z.object({ headline: text(160, 4), subheadline: text(260, 0).optional(), audience: text(160, 0).optional() });

const score5 = z.object({ score: z.number().int().min(1).max(5), note: z.string().max(220) });
export const headlineOutput = z.object({
  scores: z.object({ clarity: score5, specificity: score5, benefit: score5, nextStep: score5 }),
  diagnosis: z.string().max(520),
  rewrites: z.array(z.object({ style: z.string().max(40), headline: z.string().max(120), subheadline: z.string().max(220), whyItWorks: z.string().max(220) })).length(3),
});

export async function writeHeadlines(i: z.infer<typeof headlineInput>) {
  const system = ["You are a conversion copywriter reviewing a website's opening message.", SAFETY_RULES, "Score honestly on a 1-5 scale (5 = excellent). Rewrites must not add claims the original doesn't support (no numbers, awards, years, guarantees)."].join("\n");
  const prompt = [
    'Return JSON: {scores: {clarity, specificity, benefit, nextStep: each {score: 1-5, note}}, diagnosis, rewrites: [{style (e.g. Direct, Benefit-led, Question), headline, subheadline, whyItWorks}] (exactly 3)}',
    "clarity = can a stranger tell what is offered and for whom; specificity = concrete rather than vague; benefit = what the customer gets; nextStep = does the pair point toward an action.",
    fence("user_input", "headline", i.headline, 160),
    fence("user_input", "subheadline", i.subheadline ?? "(none)", 260),
    fence("user_input", "audience", i.audience ?? "(not given)", 160),
  ].join("\n");
  return generateJson({ system, prompt, schema: headlineOutput, tier: "fast", maxOutputTokens: 1600, temperature: 0.7 });
}

/* ------------------------------------------------------------------ brief helper */
export const briefInput = z.object({ notes: text(1200, 10), service: z.string().trim().max(80).optional() });
export const briefOutput = z.object({
  brief: z.string().min(20).max(1400),
  questions: z.array(z.string().max(200)).max(4),
  suggestedService: z.string().max(80),
});

export async function writeBrief(i: z.infer<typeof briefInput>) {
  const system = ["You help a business owner turn rough notes into a clear project brief to send to a digital agency.", SAFETY_RULES, "Use ONLY what the notes say. Do not add details, budgets, deadlines, company names or goals that aren't in the notes. Where something important is missing, list it as a question instead."].join("\n");
  const prompt = [
    'Return JSON: {brief: string (a clear first-person paragraph or two, plain text), questions: string[] (up to 3 things worth deciding or adding), suggestedService: one of "Social Media Management" | "Website Design and Development" | "Paid Advertising" | "SEO" | "Content Creation and Branding" | "Lead Generation" | "Multiple Services" | "Other"}',
    fence("user_input", "notes", i.notes, 1200),
    fence("user_input", "service chosen so far", i.service ?? "(none)", 80),
  ].join("\n");
  return generateJson({ system, prompt, schema: briefOutput, tier: "fast", maxOutputTokens: 900, temperature: 0.4 });
}
