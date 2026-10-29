import type { MockVariant } from "@/content/portfolio";

/**
 * Original, code-drawn interface mockups. They are illustrations, not screenshots of real client work, so the
 * portfolio labels them as concept projects. Nothing here depends on external images.
 */
type Copy = { logo: string; links: string[]; cta: string; headline: string; sub: string; tiles: [string, string][] };

const COPY: Record<MockVariant, Copy> = {
  salon: { logo: "Salon Concept", links: ["Treatments", "About", "Contact"], cta: "Request a visit", headline: "Care that feels like you.", sub: "Hair, skin and nails in a calm space.", tiles: [["Hair", "Cut and colour"], ["Skin", "Facials"], ["Nails", "Manicures"]] },
  fitness: { logo: "Studio Concept", links: ["Classes", "Coaches"], cta: "Book a session", headline: "Start with an intro session.", sub: "Small-group classes. All levels.", tiles: [["Mon", "Strength"], ["Wed", "Cardio"], ["Fri", "Mobility"]] },
  services: { logo: "Home Pro Concept", links: ["Services", "Areas", "Reviews"], cta: "Get a quote", headline: "Reliable help for your home.", sub: "Tell us the job. We'll reply with next steps.", tiles: [["Repairs", "Fixes"], ["Installs", "Upgrades"], ["Maintenance", "Plans"]] },
  restaurant: { logo: "Kitchen Concept", links: ["Menu", "Events"], cta: "Reserve", headline: "Seasonal food, shared.", sub: "A month of content ideas, planned.", tiles: [["Post", "Dish of the week"], ["Story", "Behind the pass"], ["Reel", "Chef's table"]] },
  shop: { logo: "Shop Concept", links: ["New", "Collections", "Sale"], cta: "Shop now", headline: "Everyday pieces, made to last.", sub: "Free returns information shown clearly.", tiles: [["Tops", "From the range"], ["Bags", "From the range"], ["Home", "From the range"]] },
  saas: { logo: "Product Concept", links: ["Features", "Pricing"], cta: "Request a demo", headline: "Work that runs itself.", sub: "See the product in a short walkthrough.", tiles: [["Plan", "Projects"], ["Track", "Reports"], ["Share", "Teams"]] },
};

export function SiteMock({ variant, tall }: { variant: MockVariant; tall?: boolean }) {
  const c = COPY[variant];
  const center = variant === "saas" || variant === "restaurant";
  return (
    <div className={`mock mock--${variant}${tall ? " mock--tall" : ""}`} aria-hidden="true">
      <div className="mock__nav">
        <span className="mock__logo">{c.logo}</span>
        {c.links.map((l) => (
          <span className="mock__link" key={l}>
            {l}
          </span>
        ))}
        <span className="mock__btn">{c.cta}</span>
      </div>
      <div className={`mock__hero${center ? " mock__hero--center" : ""}`}>
        <div>
          <h4>{c.headline}</h4>
          <p>{c.sub}</p>
        </div>
        {!center && <div className="mock__art" />}
      </div>
      <div className="mock__row">
        {c.tiles.map(([t, s]) => (
          <div className="mock__tile" key={t}>
            <i />
            <b>{t}</b>
            <span className="mock__link">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Browser({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="browser" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <div className="browser__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="browser__url" />
      </div>
      {children}
    </div>
  );
}

export function PhoneMock({ variant }: { variant: MockVariant }) {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone__screen">
        <SiteMock variant={variant} />
      </div>
    </div>
  );
}

export function SocialCard() {
  return (
    <div className="social-card" aria-hidden="true">
      <div className="social-card__head">
        <span className="social-card__avatar" />
        <span>brand</span>
      </div>
      <div className="social-card__img" />
      <div className="social-card__bar" style={{ width: "86%" }} />
      <div className="social-card__bar" style={{ width: "58%" }} />
    </div>
  );
}

/** Abstract data visual with no numbers, so it cannot read as a performance claim. */
export function ChartCard() {
  return (
    <div className="chart-card" aria-hidden="true">
      <small>Illustrative chart</small>
      <svg viewBox="0 0 160 70" fill="none">
        <defs>
          <linearGradient id="cg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#4DE2D0" stopOpacity=".5" />
            <stop offset="1" stopColor="#4DE2D0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 58 C20 52 30 40 48 42 S78 24 96 28 S130 8 160 10 V70 H0Z" fill="url(#cg)" />
        <path d="M0 58 C20 52 30 40 48 42 S78 24 96 28 S130 8 160 10" stroke="#4DE2D0" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
