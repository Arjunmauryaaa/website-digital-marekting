import type { Metadata } from "next";
import { site } from "@/config/site";

export const absoluteUrl = (path: string) => `${site.url}${path === "/" ? "" : path}`;

export function pageMetadata({ title, description, path, noindex }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | ${site.name}`, description, url, siteName: site.name, type: "website", locale: "en" },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const orgJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.url,
  description: site.description,
  areaServed: ["United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates"],
  serviceType: ["Digital marketing", "Website design and development", "Social media management", "Search engine optimization"],
  ...(site.email ? { email: site.email } : {}),
  ...(site.socials.some((s) => s.href) ? { sameAs: site.socials.flatMap((s) => (s.href ? [s.href] : [])) } : {}),
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
});

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
