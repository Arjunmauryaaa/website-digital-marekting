/**
 * Portfolio entries. Until real projects exist, every entry is an honest "Concept Project".
 * To add a real project later: set `kind: "client"`, fill `client` and verified `results`, and replace the mockup
 * with a screenshot (see README, "Adding real work").
 */
export type MockVariant = "salon" | "fitness" | "services" | "restaurant" | "shop" | "saas";

export type Project = {
  slug: string;
  name: string;
  industry: string;
  service: string;
  serviceSlug: string;
  kind: "concept" | "client";
  summary: string;
  mock: MockVariant;
  demonstrates: string[];
  brief: string;
  /** Only for kind: "client". Must be verified and permissioned. */
  client?: string;
  results?: string[];
  /** Case-study fields. Shown on the project page only when provided. */
  challenge?: string;
  approach?: string;
  outcome?: string;
  testimonial?: { quote: string; name: string; role: string; company: string };
  /** Real screenshot (put it in /public). Replaces the code-drawn mockup when set. */
  image?: { src: string; alt: string; width: number; height: number };
};

export const projects: Project[] = [
  {
    slug: "beauty-salon-website",
    name: "Beauty Salon Website",
    industry: "Beauty and wellness",
    service: "Website Design and Development",
    serviceSlug: "website-design-development",
    kind: "concept",
    summary: "A calm, image-led website that makes treatments easy to browse and appointments easy to request.",
    mock: "salon",
    brief: "A self-initiated design concept exploring how a local salon could present treatments, pricing guidance and a simple enquiry path.",
    demonstrates: ["Treatment menu with clear categories", "Prominent booking call to action", "Mobile-first layout", "Soft, premium visual language"],
  },
  {
    slug: "fitness-studio-landing-page",
    name: "Fitness Studio Landing Page",
    industry: "Fitness",
    service: "Lead Generation",
    serviceSlug: "lead-generation",
    kind: "concept",
    summary: "A focused landing page built around a single action: claiming an introductory session.",
    mock: "fitness",
    brief: "A self-initiated concept showing how a studio could turn campaign traffic into enquiries with one focused page.",
    demonstrates: ["Single, repeated call to action", "Short, qualifying enquiry form", "Class schedule preview", "High-contrast, energetic styling"],
  },
  {
    slug: "home-services-website",
    name: "Home Services Website",
    industry: "Local services",
    service: "Website Design and Development",
    serviceSlug: "website-design-development",
    kind: "concept",
    summary: "A trust-building site for a local trade business, designed to bring in quote requests.",
    mock: "services",
    brief: "A self-initiated concept exploring service pages, service-area information and quote-request flows for a local business.",
    demonstrates: ["Service pages with clear structure", "Quote request journey", "Local SEO-friendly page structure", "Click-to-call on mobile"],
  },
  {
    slug: "restaurant-social-campaign",
    name: "Restaurant Social Media Campaign",
    industry: "Food and hospitality",
    service: "Social Media Management",
    serviceSlug: "social-media-management",
    kind: "concept",
    summary: "A month of coordinated post, story and reel concepts for a neighbourhood restaurant.",
    mock: "restaurant",
    brief: "A self-initiated content concept showing a themed monthly calendar with a consistent visual identity.",
    demonstrates: ["Monthly content calendar", "Consistent post templates", "Story and reel concepts", "Offer and event promotion"],
  },
  {
    slug: "ecommerce-homepage",
    name: "E-commerce Homepage",
    industry: "E-commerce",
    service: "Website Design and Development",
    serviceSlug: "website-design-development",
    kind: "concept",
    summary: "A homepage concept that gets shoppers from landing to a product quickly.",
    mock: "shop",
    brief: "A self-initiated concept exploring collection merchandising, trust signals and a clear path to product pages.",
    demonstrates: ["Collection-led navigation", "Featured product merchandising", "Shipping and returns reassurance", "Fast, image-forward layout"],
  },
  {
    slug: "saas-landing-page",
    name: "SaaS Landing Page",
    industry: "Software",
    service: "Website Design and Development",
    serviceSlug: "website-design-development",
    kind: "concept",
    summary: "A product landing page that explains the value in seconds and guides visitors to a demo request.",
    mock: "saas",
    brief: "A self-initiated concept showing how a software product could present its value, features and a demo call to action.",
    demonstrates: ["Clear value proposition above the fold", "Feature sections with product visuals", "Demo request call to action", "Dark, modern interface styling"],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
