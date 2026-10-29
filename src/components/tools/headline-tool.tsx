"use client";

import { useState } from "react";
import { TypeText } from "@/components/ui/type-text";
import { CopyButton, ErrorNote, Spinner, ToolCta } from "./bits";
import { useApi } from "./use-api";

type S = { score: number; note: string };
type Data = {
  scores: { clarity: S; specificity: S; benefit: S; nextStep: S };
  diagnosis: string;
  rewrites: { style: string; headline: string; subheadline: string; whyItWorks: string }[];
};

const LABELS: [keyof Data["scores"], string][] = [
  ["clarity", "Clarity"],
  ["specificity", "Specificity"],
  ["benefit", "Benefit"],
  ["nextStep", "Next step"],
];

function Meter({ label, s }: { label: string; s: S }) {
  return (
    <li className="meter">
      <div className="meter__head">
        <b>{label}</b>
        <span aria-label={`${s.score} out of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} className={n <= s.score ? "on" : ""} aria-hidden="true" />
          ))}
          <span className="visually-hidden">{s.score} out of 5</span>
        </span>
      </div>
      <p>{s.note}</p>
    </li>
  );
}

export function HeadlineTool() {
  const api = useApi<Data>("/api/ai/headline");
  const [headline, setHeadline] = useState("");
  const [sub, setSub] = useState("");
  const [audience, setAudience] = useState("");
  const d = api.data;

  return (
    <div className="tool">
      <form
        className="toolform"
        onSubmit={(e) => {
          e.preventDefault();
          void api.run({ headline, subheadline: sub || undefined, audience: audience || undefined });
        }}
      >
        <div className="field">
          <label htmlFor="hl-h">Your homepage headline</label>
          <input id="hl-h" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={160} placeholder="e.g. We help businesses grow online" required disabled={api.loading} />
        </div>
        <div className="field">
          <label htmlFor="hl-s">Supporting line <span className="opt">(optional)</span></label>
          <input id="hl-s" value={sub} onChange={(e) => setSub(e.target.value)} maxLength={260} disabled={api.loading} />
        </div>
        <div className="field">
          <label htmlFor="hl-a">Who is it for? <span className="opt">(optional)</span></label>
          <input id="hl-a" value={audience} onChange={(e) => setAudience(e.target.value)} maxLength={160} placeholder="e.g. Independent dental practices" disabled={api.loading} />
        </div>
        <button className="btn btn--primary" type="submit" disabled={api.loading || headline.trim().length < 4}>{api.loading ? "Reviewing…" : "Review my headline"}</button>
      </form>

      {api.loading && <Spinner text="Reading your headline like a first-time visitor…" />}
      {api.error && <ErrorNote message={api.error} code={api.code} />}

      {d && (
        <div className="results" aria-live="polite">
          <header>
            <p className="eyebrow">First-impression check</p>
            <h2 className="h2">How a stranger reads <em>your headline</em></h2>
            <p className="lede"><TypeText text={d.diagnosis} perChar={13} maxMs={2800} /></p>
          </header>
          <ul className="meters">
            {LABELS.map(([k, label]) => (
              <Meter key={k} label={label} s={d.scores[k]} />
            ))}
          </ul>
          <h3 className="h3">Three ways to say it</h3>
          <ol className="rewrites">
            {d.rewrites.map((r) => (
              <li key={r.headline}>
                <span className="chip2">{r.style}</span>
                <p className="rewrites__h">{r.headline}</p>
                <p className="rewrites__s">{r.subheadline}</p>
                <p className="fine">Why it works: {r.whyItWorks}</p>
                <CopyButton text={`${r.headline}\n${r.subheadline}`} />
              </li>
            ))}
          </ol>
          <p className="fine">Generated automatically. Use these as starting points and keep every claim true.</p>
          <ToolCta service="Website Design and Development" text="Want your whole homepage to read this clearly?" />
        </div>
      )}
    </div>
  );
}
