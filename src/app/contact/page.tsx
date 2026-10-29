import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/contact-section";
import { SERVICES } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Send a project enquiry or book a discovery call. We work with businesses in the US, UK, Canada, Australia, UAE and other international markets.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string; package?: string }> }) {
  const { service, package: pkg } = await searchParams;
  const wanted = pkg === "Website Launch" ? "Website Design and Development" : pkg === "Social Media Starter" ? "Social Media Management" : service;
  const initialService = (SERVICES as readonly string[]).includes(wanted ?? "") ? wanted : pkg === "Growth Partnership" ? "Multiple Services" : "";
  return (
    <ContactSection initialService={initialService} top />
  );
}
