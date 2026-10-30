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
  { q: "What will it cost?", a: "Every business is different, so we don't publish one-size-fits-all prices. After a free first call we send a written quote showing exactly what is included, the price and the timeline. There is no obligation to accept it." },
  { q: "How do contracts and payments work?", a: "Everything is agreed in a written proposal before work starts: scope, price, payment schedule, revisions and who owns the final files. We will confirm with you which payment options suit your country." },
  { q: "Who owns my website, content and accounts?", a: "You do. We work inside accounts you own wherever possible, and ownership of the final work is stated in your proposal, so you are never locked in." },
  { q: "Can we work together across time zones?", a: "Yes. We work remotely and schedule calls at times that suit you. Our contact page shows the working hours we overlap with your location." },
  { q: "Is there a minimum contract?", a: "One-off projects such as a website have a fixed scope and price. Ongoing support, such as social media or marketing, is agreed in the proposal, including how long it runs and how either side can end it." },
  { q: "How do we get started?", a: "Submit a project enquiry with a few details about your business and goals. We will review the requirements and discuss the next steps." },
];

/** Everyday problems a visitor recognises, each with a plain answer. Keep these as process promises, never promised results. */
export const problems = [
  { q: "My website looks outdated and doesn't bring enquiries.", a: "We build a clear, fast website that explains what you do in seconds and makes it easy to contact you.", href: "/services/website-design-development" },
  { q: "I post on social media, but nothing comes of it.", a: "We plan content around your customers and your goals, not just likes, and keep it consistent.", href: "/services/social-media-management" },
  { q: "People visit my site, then leave without calling or buying.", a: "We improve your page layout, wording and buttons so visitors know exactly what to do next.", href: "/services/website-design-development" },
  { q: "I can't be found on Google.", a: "We fix the search basics: clear pages, the right words, and fast loading on phones.", href: "/services" },
  { q: "I spend on ads and can't tell if they work.", a: "We set up tracking and report in plain English what is working, what isn't, and what to change.", href: "/services" },
  { q: "I don't have time to manage all of this.", a: "One team handles your website, content and campaigns. You get one contact and regular updates.", href: "/contact" },
];

export const callCovers = ["Business goals", "Current online presence", "Required services", "Project scope", "Potential next steps"];

/**
 * The hero paragraph cycles through these lines (type, hold, cut, next). The FIRST line is also the static text that search
 * engines, screen readers, reduced-motion visitors and no-JavaScript visitors get, so keep it a complete, accurate summary.
 * Every line must stay true: no results, numbers or claims you can't back up.
 */
export const heroMessages = [
  "Is your website not bringing enquiries, or your social media not bringing customers? We fix that. We build clear, fast websites and run focused marketing, so the right people find you, trust you and get in touch.",
  "One team for your website, your content and your campaigns, with one person who knows your project and keeps you updated in plain English.",
  "You get a written plan, a fixed scope and a clear price before any work begins. No surprises, no jargon.",
  "Try our free AI tools: audit your website, plan a week of social content and get a 30-day growth roadmap in minutes.",
];
