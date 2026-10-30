import type { Metadata } from "next";
import { Faq } from "@/components/sections/faq";
import { ContactSection } from "@/components/sections/contact-section";
import { CapabilityStrip, DevShowcase, FactsBand, Hero, Packages, Principles, ProblemsSolved, ProcessSection, ServicesSection, WhyUs, WorkSection } from "@/components/sections/home-sections";
import { VideoShowcase } from "@/components/sections/video-showcase";
import { ClientNumbers, Commitments, GlobalReach, hasTestimonials, InsightsTeaser, Testimonials, ToolsTeaser, Verify } from "@/components/sections/trust-sections";
import { SectionHead } from "@/components/ui/ui";
import { JsonLd } from "@/components/ui/json-ld";
import { faqs } from "@/content/site-content";
import { site } from "@/config/site";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} | Digital Marketing and Website Development Agency`,
  description: site.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilityStrip />
      <FactsBand />
      <ClientNumbers />
      <ProblemsSolved />
      <ServicesSection />
      <WhyUs />
      <VideoShowcase />
      <ToolsTeaser />
      <WorkSection limit={6} />
      <ProcessSection />
      <DevShowcase />
      {hasTestimonials ? <Testimonials /> : <Principles />}
      <Commitments />
      <Packages />
      <Verify />
      <InsightsTeaser />
      <section className="section section--soft" id="faq" aria-labelledby="faq-title">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Questions, Answered." center id="faq-title" />
          <Faq items={faqs} />
        </div>
      </section>
      <GlobalReach />
      <ContactSection />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
