import type { MetadataRoute } from "next";
import { articles } from "@/content/insights";
import { projects } from "@/content/portfolio";
import { services } from "@/content/services";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = ["/", "/services", "/work", "/insights", "/tools", "/tools/website-audit", "/tools/growth-roadmap", "/tools/content-calendar", "/tools/headline-lab", "/about", "/process", "/contact", "/privacy", "/terms"];
  return [
    ...fixed.map((p) => ({ url: absoluteUrl(p), lastModified: now, changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: absoluteUrl(`/services/${s.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...articles.map((a) => ({ url: absoluteUrl(`/insights/${a.slug}`), lastModified: new Date(a.published), changeFrequency: "yearly" as const, priority: 0.6 })),
    ...projects.map((p) => ({ url: absoluteUrl(`/work/${p.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
