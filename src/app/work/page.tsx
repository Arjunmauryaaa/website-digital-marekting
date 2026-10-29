import type { Metadata } from "next";
import { CtaBand, WorkSection } from "@/components/sections/home-sections";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Work",
  description: "Selected design concepts showing our approach to websites, social media and digital marketing. Clearly labelled concept projects.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Selected work</p>
          <h1 className="h1">Good work speaks for itself.</h1>
          <p className="lede">Selected concepts and projects demonstrating our approach to digital design, marketing, and development.</p>
        </div>
      </section>
      <WorkSection limit={99} heading={false} />
      <CtaBand title="Want to see what we could build for you?" />
    </>
  );
}
