import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, ListCheck, ProjectCard } from "@/components/sections/home-sections";
import { Faq } from "@/components/sections/faq";
import { Arrow, Icon } from "@/components/ui/icons";
import { JsonLd } from "@/components/ui/json-ld";
import { ButtonLink, SectionHead } from "@/components/ui/ui";
import { projects } from "@/content/portfolio";
import { serviceBySlug, services } from "@/content/services";
import { site } from "@/config/site";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, absoluteUrl } from "@/lib/seo";

type Params = { slug: string };

export const dynamicParams = false;
export const generateStaticParams = () => services.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const service = serviceBySlug((await params).slug);
  if (!service) return {};
  return pageMetadata({ title: service.page.title, description: `${service.page.headline} ${service.page.lede}`.slice(0, 200), path: `/services/${service.slug}` });
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const service = serviceBySlug((await params).slug);
  if (!service) notFound();
  const { page } = service;
  const examples = projects.filter((p) => p.serviceSlug === service.slug);
  const related = page.related.map((s) => serviceBySlug(s)).filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/services">Services</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{page.title}</span>
          </nav>
          <p className="eyebrow">{service.name}</p>
          <h1 className="h1">{page.headline}</h1>
          <p className="lede">{page.lede}</p>
          <div className="actions">
            <ButtonLink href={`/contact?service=${encodeURIComponent(service.name)}#enquiry`}>Discuss This Service</ButtonLink>
            <ButtonLink href="/contact#book" variant="ghost-dark" arrow={false}>Book a Discovery Call</ButtonLink>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="problems-title">
        <div className="container">
          <SectionHead eyebrow="The challenge" title="Where businesses usually get stuck" id="problems-title" />
          <div className="principles">
            {page.problems.map((p, i) => (
              <article className="principle" key={p.title} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                <span className="principle__n" aria-hidden="true">{i + 1}</span>
                <b>{p.title}</b>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft" aria-labelledby="solution-title">
        <div className="container split">
          <div data-reveal style={{ display: "grid", gap: 20, alignContent: "start" }}>
            <Icon name={service.icon} />
            <p className="eyebrow">Our approach</p>
            <h2 className="h2" id="solution-title">How we help</h2>
            <p className="lede">{page.solution}</p>
            {page.note && <p className="callout">{page.note}</p>}
          </div>
          <div data-reveal style={{ "--d": "100ms", display: "grid", gap: 18, alignContent: "start" } as React.CSSProperties}>
            <h3 className="h3">What&apos;s included</h3>
            <ListCheck items={page.deliverables} />
            <p className="fine">Exact deliverables, timelines and pricing are confirmed in a written proposal.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="steps-title">
        <div className="container">
          <SectionHead eyebrow="How it works" title="Our process for this service" id="steps-title" />
          <ol className="timeline">
            {page.steps.map((s, i) => (
              <li className="step" key={s.title} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                <span className="step__n" aria-hidden="true">0{i + 1}</span>
                <div>
                  <h3 className="h3"><span className="visually-hidden">Step {i + 1}: </span>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {examples.length > 0 && (
        <section className="section section--soft" aria-labelledby="examples-title">
          <div className="container">
            <SectionHead eyebrow="Examples" title="Related concept work" id="examples-title">
              Self-initiated concepts that show how we approach this kind of project. They aren&apos;t client projects and don&apos;t show client results.
            </SectionHead>
            <ul className="work-grid">
              {examples.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="faq-title">
        <div className="container">
          <SectionHead eyebrow="FAQ" title={`${page.title}: common questions`} center id="faq-title" />
          <Faq items={page.faqs} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--soft" aria-labelledby="related-title">
          <div className="container">
            <SectionHead eyebrow="Pairs well with" title="Related services" id="related-title" />
            <ul className="grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {related.map((r) => (
                <li className="card" key={r.slug}>
                  <Icon name={r.icon} />
                  <h3 className="h3">{r.name}</h3>
                  <p>{r.summary}</p>
                  <Link className="card-link" href={`/services/${r.slug}`}>
                    {r.cta} <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand title={`Interested in ${page.title.toLowerCase()}?`}>Tell us about your business and what you&apos;d like to achieve, and we&apos;ll suggest the right next step.</CtaBand>
      <JsonLd data={faqJsonLd(page.faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          description: service.summary,
          provider: { "@type": "ProfessionalService", name: site.name, url: site.url },
          url: absoluteUrl(`/services/${service.slug}`),
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: page.title, path: `/services/${service.slug}` }])} />
    </>
  );
}
