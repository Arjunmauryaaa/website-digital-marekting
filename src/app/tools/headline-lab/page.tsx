import type { Metadata } from "next";
import { HeadlineTool } from "@/components/tools/headline-tool";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Headline Lab: Homepage Message Check",
  description: "Paste your homepage headline and see how a first-time visitor reads it: scored for clarity, specificity, benefit and next step, with three stronger rewrites.",
  path: "/tools/headline-lab",
});

// Reads server environment (whether AI is on, and which provider) at request time, so it must not be frozen at build.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ToolPage
      eyebrow="Free tool"
      title={<>Does your headline <em>make sense</em> to a stranger?</>}
      lede="You have a few seconds to explain what you do. Paste your headline and see how a first-time visitor reads it, then try three stronger versions."
      how={[
        "Paste the headline and supporting line from your homepage.",
        "It's scored on four things visitors judge in seconds: clarity, specificity, benefit and next step.",
        "You get three rewrites that don't add claims your original doesn't support.",
      ]}
    >
      <HeadlineTool />
    </ToolPage>
  );
}
