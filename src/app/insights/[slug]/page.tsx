import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/sections/home-sections";
import { JsonLd } from "@/components/ui/json-ld";
import { articleBySlug, articles } from "@/content/insights";
import { site } from "@/config/site";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

type Params = { slug: string };

export const dynamicParams = false;
export const generateStaticParams = () => articles.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  if (!a) return {};
  return { ...pageMetadata({ title: a.title, description: a.description, path: `/insights/${a.slug}` }), openGraph: { type: "article", title: `${a.title} | ${site.name}`, description: a.description, url: absoluteUrl(`/insights/${a.slug}`), publishedTime: a.published, siteName: site.name } };
}

const fmt = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const article = articleBySlug((await params).slug);
  if (!article) notFound();
  const more = articles.filter((a) => a.slug !== article.slug);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/insights">Insights</Link>
          </nav>
          <p className="eyebrow">{article.category}</p>
          <h1 className="h1">{article.title}</h1>
          <p className="lede">{article.description}</p>
          <p className="crumbs">
            <span>{site.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.published}>{fmt(article.published)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readMinutes} min read</span>
          </p>
        </div>
      </section>

      <article className="section">
        <div className="container">
          <div className="prose prose--article">
            {article.body.map((b, i) =>
              b.type === "h2" ? <h2 key={i}>{b.text}</h2> : b.type === "p" ? <p key={i}>{b.text}</p> : (
                <ul key={i}>
                  {b.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              ),
            )}
            <p className="callout">This article is general guidance, not advice tailored to your business. If you&apos;d like help applying it, <Link href="/contact#enquiry">send us a project enquiry</Link>.</p>
          </div>
        </div>
      </article>

      <section className="section section--soft" aria-labelledby="more-title">
        <div className="container">
          <h2 className="h2" id="more-title" style={{ marginBottom: 28 }}>More insights</h2>
          <ul className="grid-3">
            {more.map((a) => (
              <li className="card" key={a.slug}>
                <p className="eyebrow">{a.category}</p>
                <h3 className="h3">{a.title}</h3>
                <p>{a.description}</p>
                <Link className="card-link" href={`/insights/${a.slug}`}>Read article</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.published,
          dateModified: article.published,
          author: { "@type": "Organization", name: site.name, url: site.url },
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          mainEntityOfPage: absoluteUrl(`/insights/${article.slug}`),
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: article.title, path: `/insights/${article.slug}` }])} />
    </>
  );
}
