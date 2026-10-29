import Link from "next/link";
import { projects, type Project } from "@/content/portfolio";
import { services, type Service } from "@/content/services";
import { capabilities, devFeatures, heroMessages, packageNote, packages, principles, process, whyUs } from "@/content/site-content";
import { Arrow, Icon } from "@/components/ui/icons";
import { Browser, ChartCard, PhoneMock, SiteMock, SocialCard } from "@/components/ui/mocks";
import { ParallaxStage } from "@/components/ui/parallax-stage";
import { RotatingText } from "@/components/ui/rotating-text";
import { ButtonLink, SectionHead } from "@/components/ui/ui";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero-in" style={{ "--d": "0ms" } as React.CSSProperties}>
            Independent digital agency · Working worldwide
          </p>
          <h1 className="h1" id="hero-title">
            <span className="h-line" style={{ "--d": "90ms" } as React.CSSProperties}>Build a Stronger Digital Presence.</span>{" "}
            <span className="h-line" style={{ "--d": "230ms" } as React.CSSProperties}><em>Turn More Clicks Into Customers.</em></span>
          </h1>
          <RotatingText messages={heroMessages} startDelay={900} />
          <div className="hero__actions hero-in" style={{ "--d": "1100ms" } as React.CSSProperties}>
            <ButtonLink href="/contact">Let&apos;s Talk About Your Project</ButtonLink>
            <ButtonLink href="/work" variant="ghost-dark" arrow={false}>Explore Our Work</ButtonLink>
          </div>
          <p className="hero__trust hero-in" style={{ "--d": "1250ms" } as React.CSSProperties}>
            Digital strategy, creative execution, and development, all working together.
          </p>
        </div>

        <ParallaxStage label="Illustration of a website, a social media post, a growth chart and a mobile site">
          <div className="stage__glow" />
          <div className="stage__main">
            <Browser>
              <SiteMock variant="saas" />
            </Browser>
          </div>
          <div className="stage__social">
            <SocialCard />
          </div>
          <div className="stage__chart">
            <ChartCard />
          </div>
          <div className="stage__phone">
            <PhoneMock variant="salon" />
          </div>
        </ParallaxStage>
      </div>
    </section>
  );
}

export function CapabilityStrip() {
  return (
    <div className="strip">
      <div className="container">
        <ul className="strip__list" aria-label="Core capabilities">
          {capabilities.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const facts = [
  { icon: "compass", title: "Remote-first, worldwide", body: "Built around the working days of the US, UK, Canada, Australia and the UAE." },
  { icon: "pen", title: "Written proposal first", body: "Scope, price, timeline and file ownership agreed before any work begins." },
  { icon: "link", title: "Connected services", body: "Strategy, design, development and marketing planned together, not in silos." },
  { icon: "chat", title: "Plain-English reporting", body: "Clear updates on what was done, what it shows and what comes next." },
] as const;

export function FactsBand() {
  return (
    <section className="facts" aria-label="How we work at a glance">
      <div className="container facts__grid">
        {facts.map((f, i) => (
          <div className="fact" key={f.title} data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
            <Icon name={f.icon} />
            <div>
              <p className="fact__t">{f.title}</p>
              <p>{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  return (
    <li className="card" data-reveal style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      <Icon name={service.icon} />
      <h3 className="h3">{service.name}</h3>
      <p>{service.summary}</p>
      <ul className="tags" aria-label={`${service.name} capabilities`}>
        {service.capabilities.slice(0, 6).map((c) => (
          <li className="tag" key={c}>{c}</li>
        ))}
      </ul>
      <Link className="card-link" href={`/services/${service.slug}`}>
        {service.cta}
        <Arrow />
      </Link>
    </li>
  );
}

export function ServicesSection() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <SectionHead eyebrow="Services" title={<>Everything You Need to <em>Grow Online</em></>} id="services-title">
          From your first website to a more effective marketing strategy, we bring your digital presence together under one roof.
        </SectionHead>
        <ul className="grid-3">
          {services.map((s, i) => (
            <ServiceCard key={s.slug} service={s} delay={(i % 3) * 70} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export function WhyUs() {
  return (
    <section className="section section--soft" aria-labelledby="why-title">
      <div className="container">
        <SectionHead eyebrow="Why work with us" title={<>Your Business Deserves More Than <em>Just Another Agency.</em></>} id="why-title">
          We combine thoughtful strategy, creative execution, and technical expertise to help businesses build a more effective online presence.
        </SectionHead>
        <div className="features">
          {whyUs.map((f, i) => (
            <article className="feature" key={f.title} data-reveal style={{ "--d": `${(i % 2) * 80}ms` } as React.CSSProperties}>
              <Icon name={f.icon} />
              <div>
                <h3 className="h3">{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  return (
    <li className="work" data-reveal style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      <div className="work__media">
        <span className="badge work__badge">{project.kind === "concept" ? "Concept Project" : "Client Project"}</span>
        <Browser label={`${project.name}: illustrative ${project.kind === "concept" ? "concept" : "project"} mockup`}>
          <SiteMock variant={project.mock} />
        </Browser>
      </div>
      <div>
        <div className="work__meta">
          <span>{project.industry}</span>
          <span aria-hidden="true">·</span>
          <span>{project.service}</span>
        </div>
        <h3 className="h3" style={{ marginTop: 6 }}>
          <Link href={`/work/${project.slug}`}>{project.name}</Link>
        </h3>
        <p className="muted" style={{ marginTop: 8 }}>{project.summary}</p>
        <span className="link" style={{ marginTop: 12 }} aria-hidden="true">
          View Project <Arrow />
        </span>
      </div>
    </li>
  );
}

export function WorkSection({ limit = 6, heading = true }: { limit?: number; heading?: boolean }) {
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        {heading && (
          <SectionHead eyebrow="Selected work" title={<>Good Work <em>Speaks for Itself.</em></>} id="work-title">
            Explore selected concepts and projects demonstrating our approach to digital design, marketing, and development.
          </SectionHead>
        )}
        <ul className="work-grid">
          {projects.slice(0, limit).map((p, i) => (
            <ProjectCard key={p.slug} project={p} delay={(i % 3) * 70} />
          ))}
        </ul>
        <p className="fine" style={{ marginTop: 32 }}>
          These are self-initiated design concepts created to show our approach. They are not commissioned client projects, and they don&apos;t show client results.
        </p>
        {limit < projects.length && (
          <div style={{ marginTop: 28 }}>
            <ButtonLink href="/work" variant="ghost">View All Work</ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}

export function ProcessTimeline({ dark }: { dark?: boolean }) {
  return (
    <ol className="timeline">
      {process.map((s, i) => (
        <li className="step" key={s.n} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
          <span className="step__n" aria-hidden="true">{s.n}</span>
          <div>
            <h3 className="h3"><span className="visually-hidden">Step {s.n}: </span>{s.title}</h3>
            <p className={dark ? "" : "muted"}>{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ProcessSection() {
  return (
    <section className="section section--soft" id="process" aria-labelledby="process-title">
      <div className="container">
        <SectionHead eyebrow="Our process" title={<>A Clear Process. <em>From First Conversation to Launch.</em></>} id="process-title" />
        <ProcessTimeline />
      </div>
    </section>
  );
}

export function DevShowcase() {
  return (
    <section className="section section--dark" aria-labelledby="dev-title">
      <div className="container dev">
        <div style={{ display: "grid", gap: 20 }} data-reveal>
          <p className="eyebrow">Website development</p>
          <h2 className="h2" id="dev-title">Your Website Should Work <em>as Hard as You Do.</em></h2>
          <p className="lede">
            From polished business websites to focused landing pages, we build responsive digital experiences that communicate your value and help visitors take action.
          </p>
          <ul className="checks">
            {devFeatures.map((f) => (
              <li key={f}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
                {f}
              </li>
            ))}
          </ul>
          <div>
            <ButtonLink href="/services/website-design-development">Start Your Website Project</ButtonLink>
          </div>
        </div>
        <div className="devstage" data-reveal role="img" aria-label="Illustration of a business website on desktop with its matching mobile version">
          <div className="devstage__desktop">
            <Browser>
              <SiteMock variant="services" tall />
            </Browser>
          </div>
          <div className="devstage__phone">
            <PhoneMock variant="services" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Principles() {
  return (
    <section className="section" aria-labelledby="principles-title">
      <div className="container">
        <SectionHead eyebrow="Working together" title={<>What Working Together <em>Should Feel Like.</em></>} id="principles-title">
          Client stories will appear here once we have permission to share them. Until then, these are the standards we hold ourselves to.
        </SectionHead>
        <div className="principles">
          {principles.map((p, i) => (
            <article className="principle" key={p.title} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
              <span className="principle__n" aria-hidden="true">{i + 1}</span>
              <b>{p.title}</b>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Packages() {
  return (
    <section className="section section--soft" id="engagements" aria-labelledby="packages-title">
      <div className="container">
        <SectionHead eyebrow="Engagements" title={<>Flexible Ways to <em>Work Together</em></>} id="packages-title">
          Choose a starting point. Every engagement is scoped to your goals and confirmed in writing before we begin.
        </SectionHead>
        <div className="packages">
          {packages.map((p, i) => (
            <article className={`package${p.featured ? " package--featured" : ""}`} key={p.name} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
              {p.featured && <span className="badge">Most requested starting point</span>}
              <h3 className="h3">{p.name}</h3>
              <p className="muted">{p.for}</p>
              <p className="package__price">{p.price}</p>
              <ul>
                {p.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <ButtonLink href={`/contact?package=${encodeURIComponent(p.name)}#enquiry`} variant={p.featured ? "primary" : "ghost"}>
                Discuss This Option
              </ButtonLink>
            </article>
          ))}
        </div>
        <p className="fine" style={{ marginTop: 28 }}>{packageNote}</p>
      </div>
    </section>
  );
}

export function CtaBand({ title = "Ready to talk about your project?", children = "Tell us where you want to go. We'll help you work out the best way to get there." }: { title?: string; children?: React.ReactNode }) {
  return (
    <section className="section" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta-band" data-reveal>
          <h2 className="h2" id="cta-title">{title}</h2>
          <p className="lede">{children}</p>
          <div className="actions">
            <ButtonLink href="/contact#enquiry">Send a Project Enquiry</ButtonLink>
            <ButtonLink href="/contact#book" variant="ghost-dark" arrow={false}>Book a Discovery Call</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export const ListCheck = ({ items }: { items: string[] }) => (
  <ul className="list-check">
    {items.map((i) => (
      <li key={i}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
        {i}
      </li>
    ))}
  </ul>
);

