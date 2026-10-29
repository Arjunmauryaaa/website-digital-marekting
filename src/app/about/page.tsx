import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/home-sections";
import { Icon } from "@/components/ui/icons";
import { Commitments, GlobalReach, Team, Verify } from "@/components/sections/trust-sections";
import { SectionHead } from "@/components/ui/ui";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `${site.name} is an independent digital agency helping businesses grow through strategy, design, development and marketing. Learn how we work with clients remotely.`,
  path: "/about",
});

const problems = [
  { title: "A website that doesn't explain the offer", body: "Visitors should understand what you do, who it's for and what to do next within moments." },
  { title: "Marketing that's inconsistent", body: "Social posts, ads and web pages work best when they share a message and a look." },
  { title: "Not knowing what's working", body: "Clear reporting turns activity into decisions about what to do more of." },
];

const principlesAbout = [
  { icon: "compass", title: "Clarity", body: "Plain language, clear scope and no jargon for its own sake." },
  { icon: "pen", title: "Creativity", body: "Original ideas and considered design, not recycled templates." },
  { icon: "link", title: "Reliability", body: "We say what we'll do, and then do it, on the dates we agree." },
  { icon: "chat", title: "Continuous improvement", body: "Launch is a milestone, not the end. We look for what to improve next." },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">About</p>
          <h1 className="h1">A digital partner for businesses that want to be taken seriously online.</h1>
          <p className="lede">
            {site.name} is an independent digital marketing and website development agency. We help small and growing businesses build a stronger online presence through strategy, creative work and development, delivered together.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="problems-title">
        <div className="container">
          <SectionHead eyebrow="What we solve" title="The problems we aim to solve" id="problems-title">
            Most of the businesses we speak with are good at what they do. Their online presence just doesn&apos;t show it yet.
          </SectionHead>
          <div className="principles">
            {problems.map((p, i) => (
              <article className="principle" key={p.title} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                <span className="principle__n" aria-hidden="true">{i + 1}</span>
                <b>{p.title}</b>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft" aria-labelledby="approach-title">
        <div className="container split">
          <div data-reveal style={{ display: "grid", gap: 18 }}>
            <p className="eyebrow">Our approach</p>
            <h2 className="h2" id="approach-title">Strategy first. Then design, build and market.</h2>
          </div>
          <div className="prose" data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
            <p>We begin by understanding your business, your customers and what success looks like for you. Only then do we recommend what to build or run.</p>
            <p>Websites, social content and campaigns are planned together, so each piece supports the others instead of competing for attention.</p>
            <p>We keep scope and deliverables explicit and put them in writing, and we report honestly. That includes saying so when something isn&apos;t working.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="values-title">
        <div className="container">
          <SectionHead eyebrow="Principles" title="What guides our work" id="values-title" />
          <div className="features">
            {principlesAbout.map((f, i) => (
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

      <section className="section section--soft" aria-labelledby="remote-title">
        <div className="container split">
          <div data-reveal style={{ display: "grid", gap: 18 }}>
            <p className="eyebrow">Working together</p>
            <h2 className="h2" id="remote-title">How we collaborate remotely</h2>
          </div>
          <div className="prose" data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
            <p>We work with clients around the world, so the whole process is built for remote collaboration:</p>
            <ul>
              <li>A discovery call at a time that suits your time zone.</li>
              <li>A written proposal with scope, deliverables and timeline.</li>
              <li>Shared previews and clear feedback rounds as work progresses.</li>
              <li>Regular written updates, so you always know where things stand.</li>
            </ul>
          </div>
        </div>
      </section>

      <Team />
      <Commitments />
      <Verify />
      <GlobalReach />
      <CtaBand title="Let's talk about your project." />
    </>
  );
}
