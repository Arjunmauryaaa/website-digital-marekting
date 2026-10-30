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

/** A verified figure about your real track record, e.g. { value: "42", label: "Clients served since 2021" }. */
export type ClientStat = { value: string; label: string; /** Where the number comes from, shown small underneath so visitors can trust it. */ note?: string };

/** A client you have written permission to name. Add a logo (put it in /public) or leave it out to show the name as text. */
export type ClientLogo = { name: string; logo?: { src: string; alt: string; width: number; height: number }; href?: string };

/**
 * Real numbers only: clients served, years trading, countries, projects delivered. Each must be something you can prove.
 * Add at least one and a "Trusted by" band appears on the homepage. Leave empty to show nothing.
 */
export const clientStats: ClientStat[] = [];

/** Clients you may name publicly. Add them and their names or logos appear in the same band. */
export const clientLogos: ClientLogo[] = [];

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
