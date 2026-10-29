export const capabilities = ["Strategy", "Design", "Development", "Marketing", "Optimization"];

export const whyUs = [
  { icon: "compass", title: "Strategy Before Execution", body: "Understand the business, its audience, and its goals before recommending solutions." },
  { icon: "pen", title: "Design With Purpose", body: "Create clear, attractive digital experiences that support the user's journey and business objectives." },
  { icon: "link", title: "Connected Digital Services", body: "Bring websites, content, and marketing together instead of treating them as disconnected activities." },
  { icon: "chat", title: "Clear Communication", body: "Set expectations, agree on deliverables, and provide clear updates throughout the project." },
] as const;

export const process = [
  { n: "01", title: "Discover", body: "We discuss your business, target audience, goals, challenges, and expectations." },
  { n: "02", title: "Plan", body: "We define the scope, priorities, deliverables, timeline, and project milestones." },
  { n: "03", title: "Create", body: "We design, develop, and implement the agreed solution while keeping you informed." },
  { n: "04", title: "Launch and Improve", body: "We launch or deliver the project, review performance where relevant, and identify opportunities for improvement." },
];

export const devFeatures = [
  "Responsive design",
  "Clear user journeys",
  "Fast-loading pages",
  "Accessible interfaces",
  "Search-friendly foundations",
  "Conversion-focused layouts",
  "Maintainable development",
];

/** Replace these with genuine, permissioned testimonials when you have them (see README). */
export const principles = [
  { title: "Clear expectations", body: "Scope, deliverables and timelines are agreed in writing before work begins." },
  { title: "Collaborative communication", body: "Regular updates and straightforward feedback loops, across time zones." },
  { title: "Thoughtful execution", body: "Careful, considered work that serves your goals rather than our portfolio." },
];

export const packages = [
  {
    name: "Social Media Starter",
    for: "Suitable for businesses seeking consistent social media content.",
    price: "Request a Quote",
    items: ["Monthly content planning", "Agreed number of posts", "Captions", "Basic monthly reporting"],
  },
  {
    name: "Website Launch",
    for: "Suitable for small businesses that need a professional online presence.",
    price: "Request a Quote",
    items: ["Discovery and planning", "Responsive page design", "Agreed number of pages", "Contact form", "Basic SEO setup", "Launch support"],
    featured: true,
  },
  {
    name: "Growth Partnership",
    for: "Suitable for businesses requiring ongoing marketing support.",
    price: "Let's Discuss Your Goals",
    items: ["Agreed marketing priorities", "Content and campaign planning", "Website improvement recommendations", "Regular reporting", "Monthly review"],
  },
];

export const packageNote =
  "Every package's exact scope, price, timeline, revisions, and ongoing support are confirmed in a written proposal. Advertising spend, third-party subscriptions, premium stock assets, and additional services are excluded unless expressly included.";

export const faqs = [
  { q: "What types of businesses do you work with?", a: "We work with businesses seeking help with their websites, social media, content, and digital marketing. Project suitability depends on the scope and goals." },
  { q: "Do you work with international clients?", a: "Yes. Our services are designed for remote collaboration with businesses in international markets." },
  { q: "Can you build a website from scratch?", a: "Yes, depending on project requirements. We can discuss the right approach for a business website, landing page, or redesign." },
  { q: "How long does a website take to build?", a: "Timelines depend on the size of the project, required features, content availability, and approval process. A timeline is confirmed after the scope is agreed." },
  { q: "Do you manage social media accounts?", a: "We can help with agreed content planning, creation, scheduling, and reporting. The exact responsibilities are confirmed before the engagement begins." },
  { q: "Do you guarantee results?", a: "No responsible agency can guarantee specific sales, leads, rankings, or advertising outcomes. We focus on clear deliverables, informed decisions, and ongoing improvement." },
  { q: "How do we get started?", a: "Submit a project enquiry with a few details about your business and goals. We will review the requirements and discuss the next steps." },
];

export const callCovers = ["Business goals", "Current online presence", "Required services", "Project scope", "Potential next steps"];

/**
 * The hero paragraph cycles through these lines (type, hold, cut, next). The FIRST line is also the static text that search
 * engines, screen readers, reduced-motion visitors and no-JavaScript visitors get, so keep it a complete, accurate summary.
 * Every line must stay true: no results, numbers or claims you can't back up.
 */
export const heroMessages = [
  "We help ambitious businesses grow through strategic digital marketing, engaging social media, and high-performing websites designed to turn attention into meaningful action.",
  "From your first website to a smarter marketing strategy, we bring your digital presence together under one roof.",
  "Clear strategy, thoughtful design and clean development, planned together and built for the way your customers search, scroll and buy.",
  "Try our free AI tools: audit your website, plan a week of social content and get a 30-day growth roadmap in minutes.",
];
