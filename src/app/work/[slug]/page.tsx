import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CtaBand, ListCheck } from "@/components/sections/home-sections";
import { JsonLd } from "@/components/ui/json-ld";
import { Browser, PhoneMock, SiteMock } from "@/components/ui/mocks";
import { ButtonLink } from "@/components/ui/ui";
import { projectBySlug, projects } from "@/content/portfolio";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

type Params = { slug: string };

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  if (!p) return {};
  return pageMetadata({ title: `${p.name} (${p.kind === "concept" ? "Concept Project" : "Project"})`, description: p.summary, path: `/work/${p.slug}` });
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const project = projectBySlug((await params).slug);
  if (!project) notFound();
  const isConcept = project.kind === "concept";
  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/work">Work</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{project.name}</span>
          </nav>
          <span className="badge" style={{ background: "var(--cyan)", color: "var(--navy)" }}>{isConcept ? "Concept Project" : "Client Project"}</span>
          <h1 className="h1">{project.name}</h1>
          <p className="lede">{project.summary}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="overview-title">
        <div className="container" style={{ display: "grid", gap: 56 }}>
          {project.image ? (
            <Image className="case-image" src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} priority sizes="(min-width: 1200px) 1200px, 100vw" />
          ) : (
            <div className="devstage" style={{ background: "linear-gradient(135deg,#e8ecf8,#f6f8fc)", borderColor: "var(--border)" }}>
              <div className="devstage__desktop">
                <Browser label={`${project.name}: illustrative mockup`}>
                  <SiteMock variant={project.mock} tall />
                </Browser>
              </div>
              <div className="devstage__phone">
                <PhoneMock variant={project.mock} />
              </div>
            </div>
          )}

          {(project.challenge || project.approach || project.outcome) && (
            <div className="principles" aria-label="Case study">
              {[["The challenge", project.challenge], ["Our approach", project.approach], ["The outcome", project.outcome]].map(([t, body]) =>
                body ? (
                  <article className="principle" key={t}>
                    <b>{t}</b>
                    <p>{body}</p>
                  </article>
                ) : null,
              )}
            </div>
          )}

          {project.testimonial && (
            <figure className="quote">
              <blockquote>&ldquo;{project.testimonial.quote}&rdquo;</blockquote>
              <figcaption>
                <b>{project.testimonial.name}</b>
                <span>{project.testimonial.role}, {project.testimonial.company}</span>
              </figcaption>
            </figure>
          )}

          <div className="split">
            <div style={{ display: "grid", gap: 16 }}>
              <h2 className="h2" id="overview-title">About this {isConcept ? "concept" : "project"}</h2>
              <p className="lede">{project.brief}</p>
              <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 24px", margin: "8px 0 0" }}>
                <dt className="muted">Industry</dt>
                <dd style={{ margin: 0 }}>{project.industry}</dd>
                <dt className="muted">Service</dt>
                <dd style={{ margin: 0 }}><Link className="link" href={`/services/${project.serviceSlug}`}>{project.service}</Link></dd>
                <dt className="muted">Type</dt>
                <dd style={{ margin: 0 }}>{isConcept ? "Self-initiated design concept" : `Client project${project.client ? `: ${project.client}` : ""}`}</dd>
              </dl>
              {isConcept && (
                <p className="callout">
                  This is a design concept created to show our approach. It was not commissioned by a client, and it doesn&apos;t show client results or performance.
                </p>
              )}
            </div>
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <h3 className="h3">What it demonstrates</h3>
              <ListCheck items={project.demonstrates} />
              {project.results && project.results.length > 0 && (
                <>
                  <h3 className="h3">Verified results</h3>
                  <ListCheck items={project.results} />
                </>
              )}
              <div style={{ marginTop: 8 }}>
                <ButtonLink href={`/contact?service=${encodeURIComponent(project.service)}#enquiry`}>Discuss a Similar Project</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--soft" aria-labelledby="more-title">
        <div className="container">
          <h2 className="h2" id="more-title" style={{ marginBottom: 32 }}>More work</h2>
          <ul className="grid-3">
            {others.map((p) => (
              <li className="card" key={p.slug}>
                <span className="badge" style={{ alignSelf: "flex-start" }}>{p.kind === "concept" ? "Concept Project" : "Client Project"}</span>
                <h3 className="h3">{p.name}</h3>
                <p>{p.summary}</p>
                <Link className="card-link" href={`/work/${p.slug}`}>View Project</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: project.name, path: `/work/${project.slug}` }])} />
    </>
  );
}
