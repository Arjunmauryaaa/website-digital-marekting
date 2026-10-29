/**
 * Starter articles written as general guidance. They contain no statistics or client claims.
 * Review them, add your own voice and examples, and replace or extend them as you publish.
 */
export type Block = { type: "h2"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  published: string; // ISO date
  readMinutes: number;
  body: Block[];
};

export const articles: Article[] = [
  {
    slug: "what-a-small-business-homepage-needs",
    title: "What a small business homepage actually needs",
    description: "A practical checklist for a homepage that explains what you do, builds trust and makes the next step obvious.",
    category: "Websites",
    published: "2026-10-29",
    readMinutes: 4,
    body: [
      { type: "p", text: "Most small business homepages try to say everything. The ones that work say a few things clearly, in the right order. Here is what we look for when we review or plan a homepage." },
      { type: "h2", text: "1. A headline that says what you do and who it's for" },
      { type: "p", text: "A visitor should understand your offer within a few seconds. Skip clever slogans and name the service and the customer: \"Bookkeeping for independent clinics\" beats \"Numbers, simplified\"." },
      { type: "h2", text: "2. One clear primary action" },
      { type: "p", text: "Decide what you most want a visitor to do (request a quote, book a call, buy) and make that the most prominent button on the page. Secondary actions can exist, but they shouldn't compete with it." },
      { type: "h2", text: "3. Proof that's real and specific" },
      { type: "p", text: "Trust comes from evidence. Use real client names with permission, genuine reviews, photographs of your actual work or team, and verifiable credentials. If you don't have these yet, say less rather than invent them, and start collecting them." },
      { type: "h2", text: "4. A short explanation of how it works" },
      { type: "p", text: "People hesitate when they can't picture the process. Three or four plain steps, from first contact to delivery, reduce uncertainty more than another paragraph of benefits." },
      { type: "h2", text: "5. Answers to the questions people actually ask" },
      { type: "ul", items: ["How long does it take?", "How does pricing work?", "What do you need from me?", "What happens if something goes wrong?"] },
      { type: "h2", text: "6. Fast, readable and usable on a phone" },
      { type: "p", text: "Most visitors will arrive on a phone. Check that text is easy to read, buttons are easy to tap, images are sized sensibly and the page doesn't jump around while loading." },
      { type: "h2", text: "7. Easy ways to get in touch" },
      { type: "p", text: "Put contact options where people expect them, keep forms short, and tell visitors what happens after they submit one. A form that asks for ten details will lose people who would have written to you." },
      { type: "p", text: "If your homepage covers these seven points honestly, it will already be ahead of many of its competitors." },
    ],
  },
  {
    slug: "planning-a-month-of-social-media-content",
    title: "How to plan a month of social media content without burning out",
    description: "A simple, repeatable way to plan, create and schedule a month of content that stays consistent with your brand.",
    category: "Social media",
    published: "2026-10-29",
    readMinutes: 4,
    body: [
      { type: "p", text: "Consistency matters more than volume. A manageable plan you can keep up for months will do more for your brand than a burst of posts that fizzles out. This is the approach we use." },
      { type: "h2", text: "Start with a goal and an audience" },
      { type: "p", text: "Write one sentence for each: what you want social media to do for the business (for example, bring in enquiries or keep past customers engaged) and who you're talking to. Everything else follows from those two lines." },
      { type: "h2", text: "Choose three or four content pillars" },
      { type: "p", text: "Pillars are the recurring themes your content covers. They stop you from staring at a blank page. For a salon they might be treatments, aftercare tips, behind the scenes and client stories (with permission)." },
      { type: "h2", text: "Map the month on one page" },
      { type: "ul", items: ["Pick a realistic posting rhythm, such as three posts a week.", "Assign each slot a pillar so the mix stays balanced.", "Mark fixed dates: launches, holidays, events and promotions.", "Leave a little space for timely, unplanned posts."] },
      { type: "h2", text: "Batch the creation" },
      { type: "p", text: "Write captions and design graphics in one or two focused sessions rather than daily. Keep a simple template for each content type so the look stays consistent and production is faster." },
      { type: "h2", text: "Schedule, then review" },
      { type: "p", text: "Use a scheduling tool so posts go out without daily effort, and set a regular time to review. Look at which posts were saved, shared or led to messages, and let that shape next month's plan." },
      { type: "p", text: "Social media rewards patience. Keep the plan small enough to sustain, measure what matters to your goal, and adjust gradually." },
    ],
  },
  {
    slug: "seo-basics-for-small-businesses",
    title: "SEO basics for small businesses: where to start",
    description: "The practical foundations of search engine optimization, without jargon or promises about rankings.",
    category: "SEO",
    published: "2026-10-29",
    readMinutes: 5,
    body: [
      { type: "p", text: "Search engine optimization can sound mysterious, but the foundations are straightforward. Nobody can guarantee a ranking, but you can make your site easier to find, understand and trust. Start here." },
      { type: "h2", text: "Make sure search engines can read your site" },
      { type: "ul", items: ["Pages load quickly and work well on phones.", "Each page has a clear, unique title and description.", "Your site uses HTTPS.", "You have a sitemap, and important pages aren't accidentally blocked."] },
      { type: "h2", text: "Work out what your customers search for" },
      { type: "p", text: "Think about how a customer would describe their problem, not how you describe your service. Free tools such as Google Search Console and Google's own search suggestions show real phrases people use." },
      { type: "h2", text: "Give each important page one clear purpose" },
      { type: "p", text: "A page about \"emergency plumbing\" should be about that, with the details a customer needs: what's covered, where you work, how to contact you. Avoid cramming many services onto one page." },
      { type: "h2", text: "Write for people first" },
      { type: "p", text: "Use natural language, answer real questions and explain things clearly. Repeating a keyword unnaturally doesn't help readers, and it doesn't help you." },
      { type: "h2", text: "Set up the local basics if you serve a local area" },
      { type: "p", text: "Claim and complete your Google Business Profile, keep your name, address and phone details consistent across the web, and encourage genuine customer reviews. Don't buy reviews or links." },
      { type: "h2", text: "Link your pages together" },
      { type: "p", text: "Internal links help visitors and search engines find related pages. Link from articles to the relevant service pages, and use descriptive link text." },
      { type: "h2", text: "Be patient and measure" },
      { type: "p", text: "SEO usually builds gradually. Track visits, enquiries and the queries bringing people to your site, and improve the pages that are close to performing well." },
    ],
  },
];

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);
