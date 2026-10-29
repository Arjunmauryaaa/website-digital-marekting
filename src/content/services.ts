export type ServiceIcon = "social" | "web" | "ads" | "seo" | "content" | "leads";

export type Service = {
  slug: string;
  name: string;
  icon: ServiceIcon;
  summary: string;
  capabilities: string[];
  cta: string;
  /** Service-page content */
  page: {
    title: string;
    headline: string;
    lede: string;
    problems: { title: string; body: string }[];
    solution: string;
    deliverables: string[];
    steps: { title: string; body: string }[];
    faqs: { q: string; a: string }[];
    note?: string;
    related: string[];
  };
};

export const services: Service[] = [
  {
    slug: "social-media-management",
    name: "Social Media Management",
    icon: "social",
    summary: "We help your brand stay consistent, relevant, and engaging across social platforms through thoughtful content planning and creative execution.",
    capabilities: ["Content strategy", "Content calendars", "Social graphics", "Caption writing", "Reel concepts", "Scheduling", "Reporting"],
    cta: "Explore Social Media",
    page: {
      title: "Social Media Management",
      headline: "Social media that feels planned, not improvised.",
      lede: "Consistent, on-brand content that gives your audience a reason to follow, engage and remember you, without you having to think about what to post next.",
      problems: [
        { title: "Posting is sporadic", body: "Great weeks followed by silence make a brand feel unreliable. A plan keeps you visible." },
        { title: "Content doesn't look like you", body: "Mismatched graphics and tone weaken recognition. A simple creative system fixes that." },
        { title: "Nobody knows what's working", body: "Without regular reporting, it's hard to know what to repeat and what to drop." },
      ],
      solution:
        "We agree your goals and audience, build a content strategy and monthly calendar, create the graphics and captions, schedule everything, and report back on what the numbers say, so each month is a little sharper than the last.",
      deliverables: ["Content strategy and pillars", "Monthly content calendar", "Branded social graphics", "Caption writing", "Short-form video and reel concepts", "Publishing and scheduling", "Monthly performance report"],
      steps: [
        { title: "Align", body: "Goals, audience, tone of voice and the platforms worth your time." },
        { title: "Plan", body: "Content pillars and a calendar you approve before anything is published." },
        { title: "Create", body: "Graphics, captions and reel concepts produced to your brand." },
        { title: "Publish and review", body: "Scheduled posting and a monthly report with clear next steps." },
      ],
      faqs: [
        { q: "Which platforms do you cover?", a: "We recommend platforms based on where your audience is. Typical choices are Instagram, Facebook, LinkedIn and TikTok; the exact list is agreed in your proposal." },
        { q: "Do I approve posts before they go live?", a: "Yes. The calendar and creative are shared for approval, with the process confirmed in your written proposal." },
        { q: "Do you guarantee follower growth?", a: "No. Reach and engagement depend on many factors outside anyone's control. We commit to agreed deliverables and clear reporting." },
      ],
      related: ["content-creation-branding", "paid-advertising"],
    },
  },
  {
    slug: "website-design-development",
    name: "Website Design and Development",
    icon: "web",
    summary: "We design and develop modern, responsive websites that communicate your value clearly and make it easy for customers to take the next step.",
    capabilities: ["Business websites", "Landing pages", "Portfolio websites", "Redesigns", "Responsive development", "Contact forms", "Performance optimization"],
    cta: "Build Your Website",
    page: {
      title: "Website Design and Development",
      headline: "A website that explains what you do and makes the next step obvious.",
      lede: "Clear structure, considered design and clean development, so visitors understand your offer quickly and know exactly how to get in touch.",
      problems: [
        { title: "Visitors don't understand the offer", body: "If the value isn't clear in a few seconds, people leave. Structure and copy hierarchy matter as much as looks." },
        { title: "It's slow or broken on phones", body: "Most visits are on mobile. Responsive layouts and lean pages keep people from bouncing." },
        { title: "There's no clear path to enquire", body: "A site without an obvious call to action leaks interest. We design the journey, not just the pages." },
      ],
      solution:
        "We start with your goals and audience, plan the page structure and messaging, design responsive layouts, build them with search-friendly foundations and accessible interfaces, and launch with the forms and basics working.",
      deliverables: ["Discovery and sitemap", "Responsive page design", "Development to the agreed page count", "Contact or enquiry form", "Basic SEO setup", "Performance and accessibility checks", "Launch support"],
      steps: [
        { title: "Discover", body: "Goals, audience, content and examples you like." },
        { title: "Design", body: "Page structure and visual design shared for feedback." },
        { title: "Build", body: "Responsive development, forms and on-page SEO foundations." },
        { title: "Launch", body: "Testing, go-live support and a short list of next improvements." },
      ],
      faqs: [
        { q: "Is every site custom-coded?", a: "Not necessarily. Depending on your needs and budget we may recommend custom development or a CMS or website builder. We'll explain the trade-offs and agree the approach in your proposal." },
        { q: "Can you redesign my existing site?", a: "Yes. We review what you have, keep what works, and recommend what to change." },
        { q: "Who owns the website?", a: "Ownership, hosting and handover terms are set out in the written proposal before work starts." },
      ],
      related: ["seo", "lead-generation"],
    },
  },
  {
    slug: "paid-advertising",
    name: "Paid Advertising",
    icon: "ads",
    summary: "Plan and manage targeted advertising campaigns designed around your business objectives, audience, and budget.",
    capabilities: ["Meta advertising", "Google advertising", "Campaign setup", "Creative testing", "Conversion tracking", "Campaign reporting"],
    cta: "Discuss Advertising",
    page: {
      title: "Paid Advertising",
      headline: "Advertising planned around your goals and your budget.",
      lede: "Targeted campaigns on Meta and Google, set up carefully, tested sensibly and reported plainly.",
      problems: [
        { title: "Budget goes in, little comes back", body: "Unfocused targeting and untested creative waste spend. Structure and testing protect it." },
        { title: "Tracking is missing or unreliable", body: "Without conversion tracking you can't judge a campaign. We set it up where appropriate." },
        { title: "Reports are hard to read", body: "You should know what was spent, what happened and what we'll do next." },
      ],
      solution:
        "We define objectives and audiences, set up accounts and tracking, build campaigns with creative variations to test, and review performance regularly so decisions rest on data.",
      deliverables: ["Objectives and audience plan", "Meta and Google campaign setup", "Creative and copy variations", "Conversion tracking where appropriate", "Ongoing optimisation", "Regular campaign reporting"],
      steps: [
        { title: "Plan", body: "Goals, audiences, budget split and measurement." },
        { title: "Set up", body: "Accounts, tracking and first campaigns built." },
        { title: "Test", body: "Creative and audience variations compared on real data." },
        { title: "Optimise", body: "Budget moved toward what's working, with reports." },
      ],
      note: "Advertising budgets are paid directly to the ad platforms and are separate from our management fees.",
      faqs: [
        { q: "Is my ad spend included in your fee?", a: "No. Advertising budgets are separate from management fees and are paid to the platform." },
        { q: "Can you promise sales or leads?", a: "No. Results depend on your offer, market, budget and many other factors. We focus on sound set-up, testing and transparent reporting." },
        { q: "How much should I spend?", a: "It depends on your goals and market. We'll recommend a starting range after discussing your objectives." },
      ],
      related: ["lead-generation", "content-creation-branding"],
    },
  },
  {
    slug: "seo",
    name: "Search Engine Optimization",
    icon: "seo",
    summary: "Improve your website's technical foundations, content structure, and search visibility with a practical SEO strategy.",
    capabilities: ["Technical SEO basics", "On-page optimization", "Keyword research", "Content recommendations", "Performance checks", "Reporting"],
    cta: "Improve My Website",
    page: {
      title: "Search Engine Optimization",
      headline: "Make your website easier to find, and easier to trust.",
      lede: "A practical SEO plan covering the technical basics, the pages people search for and the content that supports them.",
      problems: [
        { title: "Search engines can't read your site properly", body: "Technical issues like slow pages, poor structure or missing metadata hold sites back." },
        { title: "You don't know what people search for", body: "Keyword research shows the language your customers actually use." },
        { title: "Content isn't organised around intent", body: "Pages need a clear purpose and internal links so both people and search engines understand them." },
      ],
      solution:
        "We audit the essentials, research relevant keywords, improve page structure and metadata, recommend the content worth creating, and track progress with clear reporting.",
      deliverables: ["Technical SEO review", "Keyword research", "On-page optimisation", "Content recommendations", "Website performance checks", "Reporting"],
      steps: [
        { title: "Audit", body: "Technical and content review of the current site." },
        { title: "Research", body: "Keywords and competitors in your market." },
        { title: "Improve", body: "On-page, structure and performance fixes." },
        { title: "Report", body: "Progress and next priorities, in plain English." },
      ],
      note: "We never promise guaranteed rankings. Search results depend on factors no agency controls.",
      faqs: [
        { q: "Can you guarantee first-page rankings?", a: "No. Nobody can. We improve the things within our control and report honestly on progress." },
        { q: "How long does SEO take?", a: "It is typically gradual. Early technical fixes can help sooner, while content and authority take longer." },
        { q: "Do you write the content?", a: "We can recommend topics and structure, and discuss content creation as a separate agreed deliverable." },
      ],
      related: ["website-design-development", "content-creation-branding"],
    },
  },
  {
    slug: "content-creation-branding",
    name: "Content Creation and Branding",
    icon: "content",
    summary: "Build a more consistent brand identity through purposeful visual design and content that communicates your business clearly.",
    capabilities: ["Social graphics", "Brand identity support", "Creative direction", "Promotional assets", "Content concepts", "Marketing materials"],
    cta: "Create My Content",
    page: {
      title: "Content Creation and Branding",
      headline: "A brand that looks and sounds like one business.",
      lede: "Visual design and content that make your business instantly recognisable and easy to understand.",
      problems: [
        { title: "Your materials don't match", body: "Different fonts, colours and tones across channels make a business feel less established." },
        { title: "You're unsure what to say", body: "Clear messaging gives every post, page and flyer a job to do." },
        { title: "Creative takes too long", body: "A small system of templates and guidelines speeds up everything you produce." },
      ],
      solution:
        "We shape a creative direction, build a lightweight identity system and produce the content and assets you need, in a consistent style that's easy to maintain.",
      deliverables: ["Creative direction", "Brand identity support", "Social media graphics", "Promotional assets", "Content concepts", "Marketing materials"],
      steps: [
        { title: "Understand", body: "Your business, audience and the impression you want to make." },
        { title: "Direct", body: "Style, tone and a simple visual system." },
        { title: "Produce", body: "Content and assets built on that system." },
        { title: "Refine", body: "Adjustments after real-world use." },
      ],
      faqs: [
        { q: "Do you design full brand identities?", a: "We can support identity work at the scale your project needs. Scope is agreed before we begin." },
        { q: "Are stock assets included?", a: "Premium stock assets and third-party subscriptions are extra unless expressly included in your proposal." },
        { q: "Who owns the final files?", a: "Usage rights and file handover are covered in your written proposal." },
      ],
      related: ["social-media-management", "website-design-development"],
    },
  },
  {
    slug: "lead-generation",
    name: "Lead Generation",
    icon: "leads",
    summary: "Create a more structured path from initial interest to a qualified enquiry using landing pages, campaign strategy, and conversion improvements.",
    capabilities: ["Landing page recommendations", "Lead form setup", "Campaign planning", "Conversion tracking", "Enquiry journey optimization", "Performance analysis"],
    cta: "Generate More Enquiries",
    page: {
      title: "Lead Generation",
      headline: "Turn interest into qualified enquiries.",
      lede: "A clearer journey from first click to conversation: focused landing pages, well-built forms and measurement you can trust.",
      problems: [
        { title: "Visitors don't enquire", body: "Unclear offers, long forms and weak calls to action cost you enquiries." },
        { title: "Enquiries aren't qualified", body: "The right questions up front save everyone time." },
        { title: "You can't see where leads come from", body: "Tracking shows which channels and pages deserve more effort." },
      ],
      solution:
        "We map the enquiry journey, recommend and build focused landing pages and forms, plan campaigns that drive the right visitors, and analyse performance to keep improving the path.",
      deliverables: ["Landing page recommendations", "Lead form setup", "Campaign planning", "Conversion tracking", "Enquiry journey optimisation", "Performance analysis"],
      steps: [
        { title: "Map", body: "Your current journey from first visit to enquiry." },
        { title: "Build", body: "Landing pages and forms that fit the offer." },
        { title: "Drive", body: "Campaign planning to bring the right audience." },
        { title: "Improve", body: "Analysis and focused changes over time." },
      ],
      note: "We don't guarantee a specific number of leads or sales.",
      faqs: [
        { q: "How many leads will I get?", a: "We can't promise a number. It depends on your offer, market and budget. We focus on building a clear, measurable path." },
        { q: "Do you build landing pages?", a: "Yes. Landing pages can be part of a lead-generation project or a standalone website engagement." },
        { q: "Can you connect forms to my CRM?", a: "Often, yes. We'll confirm what's possible for your tools during scoping." },
      ],
      related: ["paid-advertising", "website-design-development"],
    },
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
