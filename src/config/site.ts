/**
 * Single place for agency details. Everything marked PLACEHOLDER must be replaced before launch.
 * Nothing here is invented business information: unknown details stay visibly marked as placeholders.
 */
const env = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export const site = {
  /** PLACEHOLDER: set NEXT_PUBLIC_AGENCY_NAME, or edit this default. */
  name: env(process.env.NEXT_PUBLIC_AGENCY_NAME) ?? "Agency Name",
  tagline: "Websites and marketing that bring you customers",
  description:
    "We build clear, fast websites and run focused marketing, so the right people find your business, trust it and get in touch. Working remotely with clients in the US, UK, Canada, Australia, UAE and beyond.",
  url: (env(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Public contact email. Leave unset to show the placeholder instead of a link. */
  email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  emailPlaceholder: "hello@your-domain.com",
  socials: [
    { label: "LinkedIn", href: env(process.env.NEXT_PUBLIC_LINKEDIN_URL) },
    { label: "Instagram", href: env(process.env.NEXT_PUBLIC_INSTAGRAM_URL) },
  ],
  /** Scheduling link (Calendly or similar). When unset the booking buttons fall back to the contact form. */
  bookingUrl: env(process.env.NEXT_PUBLIC_BOOKING_URL),
  ga4Id: env(process.env.NEXT_PUBLIC_GA4_ID),

  /** Business identity shown in the footer and About page only when you set it. Leave unset rather than guess. */
  legal: {
    name: env(process.env.NEXT_PUBLIC_LEGAL_NAME),
    registration: env(process.env.NEXT_PUBLIC_REGISTRATION),
    location: env(process.env.NEXT_PUBLIC_LOCATION),
  },
  /** Your working time zone (IANA, e.g. "Europe/London") and hours. Enables the "overlap now" hint on the time-zone clocks. */
  timeZone: env(process.env.NEXT_PUBLIC_AGENCY_TZ),
  hours: env(process.env.NEXT_PUBLIC_WORKING_HOURS) ?? "09:00-18:00",
  /** A commitment you must be able to keep. Shown as written; set it to what you really do. */
  responseTime: env(process.env.NEXT_PUBLIC_RESPONSE_TIME),
  /** Independent profiles visitors can check. Only the ones you set are shown. */
  profiles: [
    { label: "Google Business Profile", href: env(process.env.NEXT_PUBLIC_GOOGLE_PROFILE_URL) },
    { label: "Clutch", href: env(process.env.NEXT_PUBLIC_CLUTCH_URL) },
    { label: "Trustpilot", href: env(process.env.NEXT_PUBLIC_TRUSTPILOT_URL) },
    { label: "LinkedIn", href: env(process.env.NEXT_PUBLIC_LINKEDIN_URL) },
  ],
} as const;

export type NavItem = { label: string; href: string; /** A tiny tag shown beside the label, e.g. "AI". Decorative. */ badge?: string };

export const nav: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Process", href: "/process" },
  { label: "Free tools", href: "/tools", badge: "AI" },
  { label: "Contact", href: "/contact" },
];
