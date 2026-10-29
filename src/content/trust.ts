/**
 * Evidence slots. These are intentionally EMPTY until you have the real thing.
 * Every component that uses them renders nothing (or an honest fallback) while they're empty,
 * so the site never shows invented people, quotes or credentials.
 */

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  /** Put the photo in /public and reference it here, e.g. "/team/ada.jpg". */
  photo?: { src: string; alt: string };
  linkedin?: string;
};

export type Testimonial = { quote: string; name: string; role: string; company: string; photo?: string; link?: string };

export type Credential = { name: string; issuer: string; /** Link to the public credential so visitors can verify it. */ href: string };

/** Founder and team. Add real entries, with permission, and an About-page "Meet the team" section appears. */
export const team: TeamMember[] = [];

/** Genuine, permissioned client quotes. Add one and the homepage swaps the principles block for real testimonials. */
export const testimonials: Testimonial[] = [];

/** Certifications you actually hold (Google Ads, Meta Blueprint, HubSpot, etc.), each with a verification link. */
export const credentials: Credential[] = [];

/** How we work: commitments that are about process, not results, so they're safe to state. */
export const commitments = [
  { title: "Everything in writing first", body: "Scope, deliverables, price, timeline, revisions and file ownership are agreed in a written proposal before work begins." },
  { title: "One accountable contact", body: "You deal with a person who knows your project, not a ticket queue." },
  { title: "Honest, regular reporting", body: "Plain-English updates on what was done, what the numbers say, and what we'd do next, including when something isn't working." },
  { title: "Your accounts stay yours", body: "We work inside accounts you own wherever possible, so you're never locked in. Exceptions are agreed in writing." },
];

/** What we won't promise: an honest differentiator for experienced buyers. */
export const wontPromise = [
  "Guaranteed rankings, leads or sales",
  "Overnight results from SEO or social media",
  "Vanity metrics presented as business results",
  "Hidden fees: advertising spend and third-party costs are always listed separately",
];
