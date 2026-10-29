import "server-only";
import { z } from "zod";
import { articles } from "@/content/insights";
import { services } from "@/content/services";
import { faqs, packageNote, packages, process as processSteps } from "@/content/site-content";
import { commitments, wontPromise } from "@/content/trust";
import { site } from "@/config/site";
import { fence, SAFETY_RULES } from "./prompt";
import { generateJson } from "./provider";

export type Chunk = { id: string; title: string; url: string; text: string };

/** Everything the assistant is allowed to know. It answers from these passages only. */
export function buildKnowledge(): Chunk[] {
  const c: Chunk[] = [];
  c.push({ id: "about", title: "About us", url: "/about", text: `${site.name} is an independent digital marketing and website development agency. We work remotely with businesses in the US, UK, Canada, Australia, the UAE and other international markets. ${site.description}` });
  for (const s of services) {
    c.push({ id: `svc-${s.slug}`, title: s.name, url: `/services/${s.slug}`, text: `${s.name}. ${s.summary} Includes: ${s.capabilities.join(", ")}. ${s.page.lede} ${s.page.solution} Deliverables: ${s.page.deliverables.join("; ")}. ${s.page.note ?? ""}` });
    s.page.faqs.forEach((f, i) => c.push({ id: `svc-${s.slug}-faq${i}`, title: `${s.name}: ${f.q}`, url: `/services/${s.slug}`, text: `${f.q} ${f.a}` }));
  }
  faqs.forEach((f, i) => c.push({ id: `faq${i}`, title: f.q, url: "/#faq", text: `${f.q} ${f.a}` }));
  c.push({ id: "process", title: "Our process", url: "/process", text: processSteps.map((p) => `${p.n} ${p.title}: ${p.body}`).join(" ") });
  c.push({ id: "commitments", title: "How we work", url: "/about", text: commitments.map((x) => `${x.title}: ${x.body}`).join(" ") });
  c.push({ id: "wont", title: "What we won't promise", url: "/about", text: `We don't promise: ${wontPromise.join("; ")}.` });
  c.push({ id: "engagements", title: "Ways to work together", url: "/#engagements", text: `${packages.map((p) => `${p.name}: ${p.for} Includes ${p.items.join(", ")}.`).join(" ")} ${packageNote}` });
  for (const a of articles) c.push({ id: `art-${a.slug}`, title: a.title, url: `/insights/${a.slug}`, text: `${a.title}. ${a.description} ${a.body.filter((b) => b.type === "h2").map((b) => (b as { text: string }).text).join("; ")}` });
  return c;
}

const STOP = new Set("a an and are as at be by can could do does for from have how i if in is it its me my of on or our so that the their them then there these they this to us we what when where which who will with would you your".split(" "));
const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t));
const stem = (t: string) => t.replace(/(ing|ers|er|ed|es|s)$/, "");

export function retrieve(query: string, knowledge: Chunk[] = buildKnowledge(), k = 5): { chunk: Chunk; score: number }[] {
  const q = [...new Set(tokens(query).map(stem))];
  if (q.length === 0) return [];
  const docs = knowledge.map((c) => ({ c, t: tokens(`${c.title} ${c.text}`).map(stem) }));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d.t)) df.set(t, (df.get(t) ?? 0) + 1);
  const N = docs.length;
  return docs
    .map(({ c, t }) => {
      const tf = new Map<string, number>();
      for (const w of t) tf.set(w, (tf.get(w) ?? 0) + 1);
      let score = 0;
      for (const w of q) score += Math.log(1 + (tf.get(w) ?? 0)) * Math.log(1 + N / (df.get(w) ?? N));
      const titleTokens = new Set(tokens(c.title).map(stem));
      for (const w of q) if (titleTokens.has(w)) score += 1.5; // a title match matters more than a passing mention
      return { chunk: c, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

const GREETING = /^(hi|hello|hey|hiya|good (morning|afternoon|evening)|thanks|thank you|ok|okay)[\s!.?]*$/i;
const PRICE = /\b(price|prices|pricing|cost|costs|how much|quote|fee|fees|rate|rates|cheap|afford|budget|charge)\b/i;
const OFF_LIMITS = /([$£€]\s?\d|\d\s?(usd|gbp|eur|aed|cad|aud)\b|\d+\s?%|\bwithin \d+ (?:days|weeks|hours)\b)/i;
const NEGATION = /(n't|\bnot\b|\bno\b|\bnever\b|\bnobody\b|\bcannot\b|\bunable\b|\bwithout\b|\bnone\b)/i;

/** True if the text promises something ("we guarantee..."), false if it only says we don't or can't. */
export function makesGuarantee(text: string): boolean {
  for (const m of text.matchAll(/\bguarante(?:e|ed|es|eing)\b/gi)) {
    const before = text.slice(Math.max(0, (m.index ?? 0) - 60), m.index ?? 0);
    const sentenceStart = Math.max(before.lastIndexOf("."), before.lastIndexOf("!"), before.lastIndexOf("?"));
    if (!NEGATION.test(before.slice(sentenceStart + 1))) return true;
  }
  return false;
}
export const isOffLimits = (text: string) => OFF_LIMITS.test(text) || makesGuarantee(text);

export const assistantInput = z.object({
  message: z.string().trim().min(2, "Please type a question.").max(500, "Please keep your question under 500 characters."),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(600) })).max(6).optional(),
});

export const assistantOutput = z.object({
  answer: z.string().min(1).max(900),
  sourceIds: z.array(z.string()).max(4),
  needsHuman: z.boolean(),
  followUps: z.array(z.string().max(80)).max(3),
});

export type AssistantReply = { answer: string; sources: { title: string; url: string }[]; handoff: boolean; followUps: string[] };

const HANDOFF_TEXT = "I'm not able to answer that reliably, and I'd rather not guess. The quickest way to get a proper answer is to send us a short enquiry.";

/** Safe canned replies, used for greetings, pricing questions, and questions outside our content. No AI call, so no cost and no risk. */
export function cannedReply(message: string, hits: { chunk: Chunk; score: number }[]): AssistantReply | null {
  if (GREETING.test(message.trim())) return { answer: "Hello! I can answer questions about our services, process and how we work. What would you like to know?", sources: [], handoff: false, followUps: ["What services do you offer?", "How does your process work?", "Do you work with international clients?"] };
  if (PRICE.test(message)) return { answer: `Pricing depends on the scope of your project, so we don't publish fixed prices. ${packageNote} The best next step is a short enquiry or discovery call, and we'll come back with a written proposal.`, sources: [{ title: "Ways to work together", url: "/#engagements" }], handoff: true, followUps: [] };
  if (hits.length === 0) return { answer: HANDOFF_TEXT, sources: [], handoff: true, followUps: ["What services do you offer?", "How does your process work?"] };
  return null;
}

export async function answerQuestion(i: z.infer<typeof assistantInput>): Promise<AssistantReply> {
  const knowledge = buildKnowledge();
  const history = (i.history ?? []).map((h) => `${h.role}: ${h.content}`).join("\n");
  const hits = retrieve(`${i.message} ${i.history?.filter((h) => h.role === "user").slice(-1)[0]?.content ?? ""}`.trim(), knowledge, 5);
  // Score the new message alone for the canned checks so older turns can't mask an off-topic question.
  const canned = cannedReply(i.message, retrieve(i.message, knowledge, 5));
  if (canned) return canned;

  const system = [
    `You are the website assistant for ${site.name}, a digital marketing and website development agency. You are an AI, and you must say so if asked.`,
    SAFETY_RULES,
    "Answer ONLY from the numbered sources provided. If they don't contain the answer, set needsHuman to true and say you're not sure.",
    "Never state prices, fees, timelines, discounts, percentages, results or guarantees. Never claim experience, clients, awards or credentials that aren't in the sources.",
    "Keep answers short: 2-4 sentences, plain language, no markdown.",
  ].join("\n");
  const prompt = [
    'Return JSON: {answer: string, sourceIds: string[] (ids of sources you used), needsHuman: boolean, followUps: string[] (up to 3 short follow-up questions the visitor might ask)}',
    "<sources>",
    ...hits.map((h) => `[${h.chunk.id}] ${h.chunk.title}: ${h.chunk.text.slice(0, 900)}`),
    "</sources>",
    history ? fence("user_input", "conversation so far", history, 1200) : "",
    fence("user_input", "visitor question", i.message, 500),
  ].join("\n");

  const out = await generateJson({ system, prompt, schema: assistantOutput, tier: "fast", maxOutputTokens: 700, temperature: 0.3 });

  // Safety net: never let a price, percentage or guarantee through, whatever the model said.
  if (isOffLimits(out.answer) || out.followUps.some((f) => isOffLimits(f))) return { answer: HANDOFF_TEXT, sources: [], handoff: true, followUps: [] };

  const byId = new Map(knowledge.map((c) => [c.id, c]));
  // Source links come from our own data by id, never from text the model wrote.
  const sources = [...new Set(out.sourceIds)].flatMap((id) => (byId.get(id) ? [{ title: byId.get(id)!.title, url: byId.get(id)!.url }] : [])).slice(0, 3);
  return { answer: out.answer, sources, handoff: out.needsHuman, followUps: out.followUps };
}
