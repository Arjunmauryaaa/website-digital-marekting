import type { Metadata } from "next";
import { AuditTool } from "@/components/tools/audit-tool";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free AI Website Audit",
  description: "Check your website in seconds: 30 real checks for search, content, mobile, trust, social sharing and accessibility, with a plain-English plan of what to fix first.",
  path: "/tools/website-audit",
});

// Reads server environment (whether AI is on, and which provider) at request time, so it must not be frozen at build.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ToolPage
      eyebrow="Free tool"
      title={<>Free website audit, <em>in plain English.</em></>}
      lede="Enter your address and we'll run 30 real checks on your page, then explain what matters most and how to fix it. No sign-up."
      how={[
        "We read your public page, the same way a search engine or visitor would.",
        "30 checks are measured and scored in code, so the numbers are real, not guesses.",
        "AI then turns the measured results into a short, prioritised plan. It only sees the results, so it has nothing to invent from.",
      ]}
    >
      <AuditTool />
    </ToolPage>
  );
}
