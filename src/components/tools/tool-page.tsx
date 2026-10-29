import Link from "next/link";
import type { ReactNode } from "react";
import { AiNotice } from "./ai-notice";

/** Shared frame for each tool page: dark hero, the tool, the AI disclosure, and a link back to the hub. */
export function ToolPage({ eyebrow, title, lede, children, how }: { eyebrow: string; title: ReactNode; lede: string; children: ReactNode; how: string[] }) {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/tools">Free tools</Link>
          </nav>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="h1">{title}</h1>
          <p className="lede">{lede}</p>
        </div>
      </section>
      <section className="section toolsec">
        <div className="container toollayout">
          <div>{children}</div>
          <aside className="toolside" aria-label="How it works">
            <h2 className="h3">How it works</h2>
            <ol>
              {how.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ol>
            <AiNotice />
          </aside>
        </div>
      </section>
    </>
  );
}
