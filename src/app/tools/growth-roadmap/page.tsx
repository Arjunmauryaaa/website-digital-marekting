import type { Metadata } from "next";
import { RoadmapTool } from "@/components/tools/roadmap-tool";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Digital Growth Roadmap Quiz",
  description: "Answer 10 quick questions and get a digital maturity score across website, social, search, ads and measurement, plus a personalised 30-day plan.",
  path: "/tools/growth-roadmap",
});

// Reads server environment (whether AI is on, and which provider) at request time, so it must not be frozen at build.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ToolPage
      eyebrow="Free tool"
      title={<>Your digital growth <em>roadmap.</em></>}
      lede="Ten quick questions give you a score across five areas and a practical 30-day plan for your business. Takes about two minutes."
      how={[
        "Your answers are scored in code across website, social media, search, advertising and measurement.",
        "The radar chart shows where you're strong and where to focus first.",
        "AI writes a personalised 30-day plan from your scores and goal. You can download it.",
      ]}
    >
      <RoadmapTool />
    </ToolPage>
  );
}
