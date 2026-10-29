/** Shared audit types and constants. Kept free of heavy imports so the browser bundle can use them. */
export type Status = "pass" | "warn" | "fail";
export type Category = "Search basics" | "Content" | "Mobile and speed" | "Trust and security" | "Social sharing" | "Accessibility";

export type Check = { id: string; category: Category; label: string; status: Status; detail: string; weight: number };

export type PageFacts = {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  wordCount: number;
  lang: string;
  images: number;
  imagesMissingAlt: number;
  internalLinks: number;
  scripts: number;
  bytes: number;
  responseMs: number;
  https: boolean;
};

export type AuditResult = {
  facts: PageFacts;
  checks: Check[];
  scores: Record<Category, number>;
  overall: number;
};

export const CATEGORIES: Category[] = ["Search basics", "Content", "Mobile and speed", "Trust and security", "Social sharing", "Accessibility"];


export const gradeFor = (n: number) => (n >= 85 ? "Strong" : n >= 70 ? "Good" : n >= 50 ? "Needs work" : "Needs attention");
