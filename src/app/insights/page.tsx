import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/sections/home-sections";
import { Arrow } from "@/components/ui/icons";
import { articles } from "@/content/insights";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Insights",
  description: "Practical, plain-English guidance on websites, social media and SEO for growing businesses.",
  path: "/insights",
});

const fmt = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));

export default function InsightsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Insights</p>
          <h1 className="h1">Practical guidance, in plain English.</h1>
          <p className="lede">Short, useful articles on websites, social media and search. No hype, no made-up statistics.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ul className="grid-3">
            {articles.map((a) => (
              <li className="card" key={a.slug}>
                <p className="eyebrow">{a.category}</p>
                <h2 className="h3">{a.title}</h2>
                <p>{a.description}</p>
                <p className="fine">
                  <time dateTime={a.published}>{fmt(a.published)}</time> · {a.readMinutes} min read
                </p>
                <Link className="card-link" href={`/insights/${a.slug}`}>
                  Read article <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
