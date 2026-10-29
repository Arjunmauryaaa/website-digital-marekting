import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/sections/home-sections";
import { AiNotice } from "@/components/tools/ai-notice";
import { Arrow, Icon } from "@/components/ui/icons";
import { aiEnabled } from "@/lib/ai/config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free AI Tools",
  description: "Free, no-sign-up tools for small businesses: a website audit, a digital growth roadmap, a 7-day social content planner and a homepage headline check.",
  path: "/tools",
});

const tools = [
  { href: "/tools/website-audit", icon: "seo", name: "Website audit", body: "30 real checks on your page, then a plain-English plan of what to fix first.", ai: false, time: "About 20 seconds" },
  { href: "/tools/growth-roadmap", icon: "compass", name: "Digital growth roadmap", body: "Ten questions, a score across five areas, and a personalised 30-day plan.", ai: true, time: "About 2 minutes" },
  { href: "/tools/content-calendar", icon: "social", name: "7-day content planner", body: "A week of hooks, captions, visuals and calls to action for your platform.", ai: true, time: "About 20 seconds" },
  { href: "/tools/headline-lab", icon: "pen", name: "Headline lab", body: "See how a stranger reads your homepage headline, and try three stronger ones.", ai: true, time: "About 15 seconds" },
] as const;

// Reads server environment (whether AI is on, and which provider) at request time, so it must not be frozen at build.
export const dynamic = "force-dynamic";

export default function ToolsPage() {
  const live = aiEnabled();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Free tools</p>
          <h1 className="h1">Smart tools that give you <em>real answers.</em></h1>
          <p className="lede">Four free tools to see where your digital presence stands and what to do next. No sign-up, nothing stored, and every result explains itself.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ul className="grid-3 tools-grid">
            {tools.map((t) => (
              <li className="card" key={t.href}>
                <Icon name={t.icon} />
                <h2 className="h3">{t.name}</h2>
                <p>{t.body}</p>
                <p className="fine">
                  {t.time} · {t.ai ? (live ? "AI-assisted" : "AI plan coming soon") : "Measured, with an AI summary"}
                </p>
                <Link className="card-link" href={t.href}>
                  Try it free <Arrow />
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 40, maxWidth: 780 }}>
            <AiNotice />
          </div>
          <p className="fine" style={{ marginTop: 18 }}>You can also ask our AI assistant questions about our services from the button at the bottom of any page.</p>
        </div>
      </section>
      <CtaBand title="Want a person to look at it with you?" />
    </>
  );
}
