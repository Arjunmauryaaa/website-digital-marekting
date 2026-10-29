import { z } from "zod";

export const SERVICES = [
  "Social Media Management",
  "Website Design and Development",
  "Paid Advertising",
  "SEO",
  "Content Creation and Branding",
  "Lead Generation",
  "Multiple Services",
  "Other",
] as const;

export const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "IE", name: "Ireland", currency: "EUR" },
  { code: "NZ", name: "New Zealand", currency: "NZD" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "OTHER", name: "Other country", currency: "USD" },
] as const;

export const CONTACT_METHODS = ["Email", "Video call"] as const;

/** Approximate conversion from USD, used only to present familiar budget bands. Not a quote. */
const RATE: Record<string, number> = { USD: 1, GBP: 0.8, CAD: 1.37, AUD: 1.52, AED: 3.67, EUR: 0.92, NZD: 1.65, SGD: 1.35, ZAR: 18, INR: 84 };
const SYMBOL: Record<string, string> = { USD: "$", GBP: "£", CAD: "CA$", AUD: "A$", AED: "AED ", EUR: "€", NZD: "NZ$", SGD: "S$", ZAR: "R", INR: "₹" };

export const currencyFor = (countryCode: string) => COUNTRIES.find((c) => c.code === countryCode)?.currency ?? "USD";

/** Rounds to a tidy figure for display (e.g. 1,096 -> 1,100). */
function tidy(value: number): number {
  const step = value < 1000 ? 50 : value < 10000 ? 100 : value < 100000 ? 500 : 5000;
  return Math.round(value / step) * step;
}

const fmt = (currency: string, usd: number) => `${SYMBOL[currency] ?? ""}${tidy(usd * (RATE[currency] ?? 1)).toLocaleString("en-US")}`;

type Kind = "project" | "monthly" | "mixed";
const kindFor = (service: string): Kind =>
  service === "Website Design and Development" ? "project" : service === "Multiple Services" || service === "Other" || !service ? "mixed" : "monthly";

const BANDS: Record<Kind, number[]> = {
  project: [1500, 3000, 6000, 12000],
  monthly: [500, 1000, 2000, 4000],
  mixed: [2000, 5000, 10000],
};

export const NOT_SURE = "Not sure yet";

/** Budget choices adapt to the service (one-off vs monthly) and the visitor's market currency. */
export function budgetOptions(service: string, countryCode: string): string[] {
  const currency = currencyFor(countryCode);
  const kind = kindFor(service);
  const cuts = BANDS[kind];
  const suffix = kind === "monthly" ? " per month" : kind === "project" ? " (one-off)" : "";
  const out = [`Under ${fmt(currency, cuts[0])}${suffix}`];
  for (let i = 0; i < cuts.length - 1; i++) out.push(`${fmt(currency, cuts[i])} – ${fmt(currency, cuts[i + 1])}${suffix}`);
  out.push(`${fmt(currency, cuts[cuts.length - 1])}+${suffix}`);
  out.push(NOT_SURE);
  return out;
}

const trimmed = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters.`);

export const contactSchema = z
  .object({
    name: trimmed(100).min(2, "Please enter your full name."),
    email: trimmed(200).pipe(z.email("Please enter a valid email address.")),
    company: trimmed(150).min(1, "Please enter your company name."),
    website: trimmed(300)
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v), "Please enter a valid website address, or leave this blank."),
    country: z.enum(COUNTRIES.map((c) => c.code) as [string, ...string[]], { error: "Please choose your country." }),
    service: z.enum(SERVICES, { error: "Please choose a service." }),
    budget: trimmed(80).min(1, "Please choose an approximate budget."),
    message: trimmed(3000).min(20, "Please tell us a little more (at least 20 characters)."),
    contactMethod: z.enum(CONTACT_METHODS, { error: "Please choose how you'd like to be contacted." }),
    /** Honeypot: real visitors never see or fill this. */
    nickname: z.string().max(0).optional(),
    /** Epoch ms when the form was shown, used to reject instant bot submissions. */
    startedAt: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.budget && !budgetOptions(data.service, data.country).includes(data.budget)) {
      ctx.addIssue({ code: "custom", path: ["budget"], message: "Please choose one of the budget options." });
    }
  });

export type ContactInput = z.infer<typeof contactSchema>;

/** Flattens zod issues into { field: firstMessage } for inline errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const MIN_FILL_MS = 3000;
