import type { Metadata } from "next";
import { CtaBand, ProcessTimeline } from "@/components/sections/home-sections";
import { Faq } from "@/components/sections/faq";
import { VideoShowcase } from "@/components/sections/video-showcase";
import { SectionHead } from "@/components/ui/ui";
import { faqs } from "@/content/site-content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Process",
  description: "A clear four-step process, from discovery and planning to creation, launch and improvement, designed for remote collaboration with international clients.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Our process</p>
          <h1 className="h1">A clear process. From first conversation to launch.</h1>
          <p className="lede">Four steps, clear expectations at each one, and no surprises about scope, timing or cost.</p>
        </div>
      </section>
      <section className="section" aria-labelledby="steps-title">
        <div className="container">
          <SectionHead eyebrow="How it works" title="What to expect" id="steps-title">
            The steps stay the same whether you need a website, a content plan or an ongoing marketing partner. Only the detail changes.
          </SectionHead>
          <ProcessTimeline />
        </div>
      </section>
      <VideoShowcase initial={2} />
      <section className="section section--soft" aria-labelledby="faq-title">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Before you get in touch" center id="faq-title" />
          <Faq items={faqs.slice(3, 7)} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
