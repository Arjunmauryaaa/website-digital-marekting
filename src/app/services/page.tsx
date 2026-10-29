import type { Metadata } from "next";
import { CtaBand, Packages, ServicesSection } from "@/components/sections/home-sections";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description: "Social media management, website design and development, paid advertising, SEO, content creation and lead generation for growing businesses worldwide.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Services</p>
          <h1 className="h1">Marketing and websites, working as one.</h1>
          <p className="lede">Six connected services that help you get found, look credible and turn interest into enquiries.</p>
        </div>
      </section>
      <ServicesSection />
      <Packages />
      <CtaBand />
    </>
  );
}
