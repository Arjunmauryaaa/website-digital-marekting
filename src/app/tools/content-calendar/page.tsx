import type { Metadata } from "next";
import { ContentTool } from "@/components/tools/content-tool";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free 7-Day Social Content Planner",
  description: "Tell us about your business and get a ready-to-use 7-day social media plan with hooks, captions, visual ideas and calls to action.",
  path: "/tools/content-calendar",
});

// Reads server environment (whether AI is on, and which provider) at request time, so it must not be frozen at build.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ToolPage
      eyebrow="Free tool"
      title={<>A week of social content, <em>planned.</em></>}
      lede="Describe your business and audience, and get seven days of hooks, captions, visuals and calls to action you can copy straight into your posts."
      how={[
        "Tell us your business, audience, platform and tone.",
        "AI drafts seven varied posts. It's told not to invent offers, reviews or statistics.",
        "Copy any caption or download the whole plan. Always review before posting.",
      ]}
    >
      <ContentTool />
    </ToolPage>
  );
}
