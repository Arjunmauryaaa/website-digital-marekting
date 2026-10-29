import Image from "next/image";
import Link from "next/link";
import { Arrow, Icon } from "@/components/ui/icons";
import { SectionHead } from "@/components/ui/ui";
import { articles } from "@/content/insights";
import { commitments, credentials, team, testimonials, wontPromise } from "@/content/trust";
import { site } from "@/config/site";
import { TimeZones } from "./time-zones";

/** Process-based commitments, plus what we won't promise: a straight-talking, established feel. */
export function Commitments() {
  return (
    <section className="section" aria-labelledby="commit-title">
      <div className="container">
        <SectionHead eyebrow="How we work with you" title={<>Clear commitments. <em>Honest limits.</em></>} id="commit-title">
          The things you can hold us to, and the promises we won&apos;t make because no honest agency can.
        </SectionHead>
        <div className="features">
          {commitments.map((c, i) => (
            <article className="feature" key={c.title} data-reveal style={{ "--d": `${(i % 2) * 80}ms` } as React.CSSProperties}>
              <Icon name={(["link", "chat", "compass", "pen"] as const)[i % 4]} />
              <div>
                <h3 className="h3">{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="wont" data-reveal>
          <h3 className="h3">What we won&apos;t promise</h3>
          <ul>
            {wontPromise.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Real testimonials when you have them; otherwise nothing (the Principles block stands in). */
export function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <section className="section section--soft" aria-labelledby="testi-title">
      <div className="container">
        <SectionHead eyebrow="Client stories" title="What Working Together Feels Like." id="testi-title" />
        <div className="principles">
          {testimonials.map((t) => (
            <figure className="quote" key={t.name + t.company} data-reveal>
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption>
                <b>{t.name}</b>
                <span>
                  {t.role}, {t.company}
                </span>
                {t.link && (
                  <a className="link" href={t.link} target="_blank" rel="noopener noreferrer">
                    Verify <span className="visually-hidden">(opens in a new tab)</span>
                  </a>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export const hasTestimonials = testimonials.length > 0;

/** Founder / team section: appears only when real people are added in src/content/trust.ts. */
export function Team() {
  if (team.length === 0) return null;
  return (
    <section className="section" aria-labelledby="team-title">
      <div className="container">
        <SectionHead eyebrow="The people" title="Meet the team" id="team-title" />
        <ul className="team">
          {team.map((m) => (
            <li className="person" key={m.name} data-reveal>
              {m.photo ? <Image src={m.photo.src} alt={m.photo.alt} width={320} height={320} className="person__photo" /> : <div className="person__photo person__photo--empty" aria-hidden="true">{m.name.charAt(0)}</div>}
              <h3 className="h3">{m.name}</h3>
              <p className="eyebrow">{m.role}</p>
              <p className="muted">{m.bio}</p>
              {m.linkedin && (
                <a className="link" href={m.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn <span className="visually-hidden">(opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Verifiable credentials and independent profiles. Renders only what has been supplied. */
export function Verify() {
  const profiles = site.profiles.filter((p) => p.href);
  if (credentials.length === 0 && profiles.length === 0) return null;
  return (
    <section className="section section--soft" aria-labelledby="verify-title">
      <div className="container">
        <SectionHead eyebrow="Check us out" title="Don't just take our word for it." id="verify-title">
          Find us on independent platforms and verify our credentials yourself.
        </SectionHead>
        <ul className="chips" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {credentials.map((c) => (
            <li key={c.name}>
              <a className="chip-link" href={c.href} target="_blank" rel="noopener noreferrer">
                {c.name} <small>{c.issuer}</small>
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
          ))}
          {profiles.map((p) => (
            <li key={p.label}>
              <a className="chip-link" href={p.href} target="_blank" rel="noopener noreferrer">
                {p.label}
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Live clocks for the markets we serve, with an honest overlap hint when a working time zone is set. */
export function GlobalReach({ compact }: { compact?: boolean }) {
  return (
    <section className={compact ? undefined : "section"} aria-labelledby="reach-title">
      <div className={compact ? undefined : "container"}>
        {!compact && (
          <SectionHead eyebrow="Working worldwide" title={<>Remote by design. <em>Across time zones.</em></>} id="reach-title">
            We work with businesses in the US, UK, Canada, Australia and the UAE, and plan calls and updates around your working day.
          </SectionHead>
        )}
        {compact && <h2 className="h3" id="reach-title" style={{ marginBottom: 12 }}>Working across time zones</h2>}
        <TimeZones agencyTz={site.timeZone} hours={site.hours} />
      </div>
    </section>
  );
}

export function InsightsTeaser() {
  return (
    <section className="section" aria-labelledby="insights-title">
      <div className="container">
        <SectionHead eyebrow="Insights" title={<>Practical guidance, <em>in plain English.</em></>} id="insights-title">
          Short, useful articles on websites, social media and search, with no hype and no made-up statistics.
        </SectionHead>
        <ul className="grid-3">
          {articles.map((a, i) => (
            <li className="card" key={a.slug} data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <p className="eyebrow">{a.category}</p>
              <h3 className="h3">{a.title}</h3>
              <p>{a.description}</p>
              <Link className="card-link" href={`/insights/${a.slug}`}>
                Read article <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const toolList = [
  { href: "/tools/website-audit", icon: "seo", name: "Free website audit", body: "30 real checks and a plain-English fix list for your site." },
  { href: "/tools/growth-roadmap", icon: "compass", name: "Digital growth roadmap", body: "A maturity score and a personalised 30-day plan." },
  { href: "/tools/content-calendar", icon: "social", name: "7-day content planner", body: "A week of ready-to-use social posts for your business." },
  { href: "/tools/headline-lab", icon: "pen", name: "Headline lab", body: "See how a stranger reads your homepage headline." },
] as const;

/** Home page teaser for the free AI tools. */
export function ToolsTeaser() {
  return (
    <section className="section section--soft" id="tools" aria-labelledby="tools-title">
      <div className="container">
        <SectionHead eyebrow="Free AI tools" title={<>Try it before you <em>talk to us.</em></>} id="tools-title">
          Four free, no-sign-up tools that give you real answers about your own business in seconds, built on measured data, not guesses.
        </SectionHead>
        <ul className="grid-3 tools-grid">
          {toolList.map((t, i) => (
            <li className="card" key={t.href} data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <Icon name={t.icon} />
              <h3 className="h3">{t.name}</h3>
              <p>{t.body}</p>
              <Link className="card-link" href={t.href}>
                Try it free <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
