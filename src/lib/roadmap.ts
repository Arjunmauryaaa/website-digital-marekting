/**
 * Digital Growth Roadmap: a 10-question self-assessment scored in code (so the scores are never AI guesses),
 * with an optional AI-written plan. Shared by the browser and the server.
 */
export const AREAS = ["Website", "Social media", "Search (SEO)", "Advertising", "Measurement"] as const;
export type Area = (typeof AREAS)[number];

export type Question = { id: string; area: Area; text: string; options: { label: string; points: 0 | 1 | 2 | 3 }[] };

export const QUESTIONS: Question[] = [
  { id: "web-clarity", area: "Website", text: "How clearly does your website explain what you offer and who it's for?", options: [{ label: "I don't have a website", points: 0 }, { label: "It exists but is unclear or outdated", points: 1 }, { label: "Mostly clear", points: 2 }, { label: "Very clear, with an obvious next step", points: 3 }] },
  { id: "web-mobile", area: "Website", text: "How well does your website work on a phone?", options: [{ label: "Not sure, or poorly", points: 0 }, { label: "It works but feels clumsy", points: 1 }, { label: "Fine on most pages", points: 2 }, { label: "Fast and designed phone-first", points: 3 }] },
  { id: "social-consistency", area: "Social media", text: "How consistent is your social media posting?", options: [{ label: "We don't post", points: 0 }, { label: "Occasionally, with no plan", points: 1 }, { label: "Regularly, but without a clear strategy", points: 2 }, { label: "On a planned calendar tied to goals", points: 3 }] },
  { id: "social-brand", area: "Social media", text: "Does your content look and sound like one brand?", options: [{ label: "No set style", points: 0 }, { label: "Sometimes", points: 1 }, { label: "Mostly", points: 2 }, { label: "Yes, with templates and guidelines", points: 3 }] },
  { id: "seo-basics", area: "Search (SEO)", text: "Can people find you when they search for what you do?", options: [{ label: "I don't know", points: 0 }, { label: "Only if they search my name", points: 1 }, { label: "For a few relevant searches", points: 2 }, { label: "For many relevant searches, and I track it", points: 3 }] },
  { id: "seo-content", area: "Search (SEO)", text: "Do you publish helpful content (articles, guides, service pages) for your customers?", options: [{ label: "Never", points: 0 }, { label: "Rarely", points: 1 }, { label: "Sometimes", points: 2 }, { label: "Regularly, based on what customers ask", points: 3 }] },
  { id: "ads-use", area: "Advertising", text: "How do you use paid advertising today?", options: [{ label: "We don't", points: 0 }, { label: "We've tried it without a clear plan", points: 1 }, { label: "We run some campaigns", points: 2 }, { label: "Structured campaigns with tested creative", points: 3 }] },
  { id: "ads-landing", area: "Advertising", text: "Do your campaigns or posts lead to a page built for that offer?", options: [{ label: "No", points: 0 }, { label: "They go to the homepage", points: 1 }, { label: "Sometimes to a relevant page", points: 2 }, { label: "Yes, focused landing pages", points: 3 }] },
  { id: "measure-track", area: "Measurement", text: "Do you know where your enquiries or sales come from?", options: [{ label: "No idea", points: 0 }, { label: "A rough guess", points: 1 }, { label: "For some channels", points: 2 }, { label: "Yes, tracked and reviewed", points: 3 }] },
  { id: "measure-review", area: "Measurement", text: "How often do you review marketing results and change course?", options: [{ label: "Never", points: 0 }, { label: "Once a year or less", points: 1 }, { label: "Quarterly", points: 2 }, { label: "Monthly or more", points: 3 }] },
];

export const BUSINESS_TYPES = ["Beauty or wellness", "Fitness or sport", "Local services (trades, repairs, cleaning)", "Professional services (consulting, legal, finance)", "Restaurant, cafe or food", "E-commerce or retail", "Software or tech", "Education or coaching", "Other"] as const;
export const GOALS = ["Get more enquiries or bookings", "Launch or redesign a website", "Build a social media presence", "Rank better in search", "Run profitable ads", "Understand what's working"] as const;

export type Answers = Record<string, number>; // question id -> option index

export function scoreAnswers(answers: Answers): { areas: Record<Area, number>; overall: number; level: string } {
  const areas = {} as Record<Area, number>;
  let total = 0;
  let max = 0;
  for (const area of AREAS) {
    const qs = QUESTIONS.filter((q) => q.area === area);
    const got = qs.reduce((s, q) => s + (q.options[answers[q.id]]?.points ?? 0), 0);
    areas[area] = Math.round((got / (qs.length * 3)) * 100);
    total += got;
    max += qs.length * 3;
  }
  const overall = Math.round((total / max) * 100);
  const level = overall >= 75 ? "Optimising" : overall >= 50 ? "Growing" : overall >= 25 ? "Building" : "Foundation";
  return { areas, overall, level };
}

/** Always-available guidance (used as the fallback when AI is off, and as grounding when it is on). */
export const AREA_ADVICE: Record<Area, { title: string; why: string; steps: string[] }> = {
  Website: { title: "Make your website clearer and phone-friendly", why: "Your website is where every other channel sends people, so unclear messaging here wastes the effort everywhere else.", steps: ["Write one sentence that says what you do and who it's for, and put it at the top of the homepage.", "Add one obvious main button (for example Book a call) and repeat it down the page.", "Open your site on a phone and fix anything hard to read or tap."] },
  "Social media": { title: "Build a simple, repeatable content rhythm", why: "Consistency builds recognition and trust faster than occasional bursts of posts.", steps: ["Pick two or three content themes your customers care about.", "Plan a month at a time, with a manageable number of posts per week.", "Create a few reusable templates so everything looks like one brand."] },
  "Search (SEO)": { title: "Make your site easier to find in search", why: "Search brings people who are already looking for what you offer.", steps: ["List the phrases a customer would type, and give each main service its own page.", "Check each page has a clear title, description and one main heading.", "Claim and complete your Google Business Profile if you serve a local area."] },
  Advertising: { title: "Put a plan and a landing page behind your ads", why: "Ads multiply whatever happens after the click, so a focused page and clear goal protect your budget.", steps: ["Set one clear goal and a modest test budget.", "Send ad clicks to a page built for that offer, not the homepage.", "Test two or three creative variations and review results weekly."] },
  Measurement: { title: "Know where your enquiries come from", why: "Without measurement you can't tell what to do more of.", steps: ["Add simple analytics and track form submissions and calls.", "Ask every new customer how they found you and write it down.", "Hold a monthly 30-minute review: what worked, what didn't, what next."] },
};
