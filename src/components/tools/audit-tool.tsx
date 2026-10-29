"use client";

import { useState } from "react";
import { CATEGORIES, gradeFor, type AuditResult, type Check, type Status } from "@/lib/audit/types";
import type { Psi } from "@/lib/audit/psi";
import type { Report } from "@/lib/audit/report";
import { TypeText } from "@/components/ui/type-text";
import { Bar, ErrorNote, ScoreRing, Spinner, ToolCta } from "./bits";
import { useApi } from "./use-api";

type Data = { audit: AuditResult; psi: Psi | null; speedRequested: boolean; report: Report | null; reportError: string | null; checkedAt: string };

const ICON: Record<Status, string> = { pass: "✓", warn: "!", fail: "✕" };
const LABEL: Record<Status, string> = { pass: "Pass", warn: "Could be better", fail: "Needs fixing" };

export function AuditTool() {
  const api = useApi<Data>("/api/ai/audit");
  const [url, setUrl] = useState("");
  const [speed, setSpeed] = useState(false);
  const d = api.data;

  return (
    <div className="tool">
      <form
        className="toolform"
        onSubmit={(e) => {
          e.preventDefault();
          void api.run({ url, speedTest: speed });
        }}
      >
        <div className="field">
          <label htmlFor="audit-url">Your website address</label>
          <input id="audit-url" name="url" inputMode="url" autoComplete="url" placeholder="yourcompany.com" value={url} onChange={(e) => setUrl(e.target.value)} disabled={api.loading} required />
        </div>
        <label className="check">
          <input type="checkbox" checked={speed} onChange={(e) => setSpeed(e.target.checked)} disabled={api.loading} />
          <span>Also run a mobile speed test (slower, up to 30 seconds)</span>
        </label>
        <button className="btn btn--primary" type="submit" disabled={api.loading || url.trim().length < 3}>
          {api.loading ? "Checking…" : "Audit my website"}
        </button>
      </form>

      {api.loading && <Spinner text={speed ? "Reading your page and running the speed test. This can take up to 30 seconds…" : "Reading your page and running 30 checks…"} />}
      {api.error && <ErrorNote message={api.error} code={api.code} />}

      {d && (
        <div className="results" aria-live="polite">
          <section className="scorehead">
            <ScoreRing value={d.audit.overall} label="Overall website score" />
            <div>
              <p className="eyebrow">Audit of {new URL(d.audit.facts.url).hostname}</p>
              <h2 className="h2">{d.report?.headline ?? `${gradeFor(d.audit.overall)}: ${d.audit.overall} out of 100`}</h2>
              {d.report ? <p className="lede"><TypeText text={d.report.summary} perChar={13} maxMs={2800} /></p> : <p className="lede">Here is what we measured on your page. Each result below explains what it means.</p>}
              <p className="fine">Measured on {new Date(d.checkedAt).toLocaleString()}. This checks the page you entered, not your whole site.</p>
            </div>
          </section>

          <section className="bars" aria-label="Scores by area">
            {CATEGORIES.map((c) => (
              <Bar key={c} label={c} value={d.audit.scores[c]} />
            ))}
          </section>

          {d.psi && (
            <section className="psi" aria-label="Mobile speed test">
              <h3 className="h3">Mobile speed test (Google PageSpeed)</h3>
              <ul>
                <li><b>{d.psi.performance}</b><span>Performance score</span></li>
                {d.psi.lcpSeconds !== null && <li><b>{d.psi.lcpSeconds}s</b><span>Largest content shown</span></li>}
                {d.psi.tbtMs !== null && <li><b>{d.psi.tbtMs}ms</b><span>Blocking time</span></li>}
                {d.psi.cls !== null && <li><b>{d.psi.cls}</b><span>Layout shift</span></li>}
              </ul>
            </section>
          )}
          {d.speedRequested && !d.psi && <p className="notice notice--err" role="status">The speed test wasn&apos;t available right now, so it&apos;s left out. The rest of the audit is unaffected.</p>}

          {d.report ? (
            <section aria-labelledby="priorities-h">
              <h3 className="h3" id="priorities-h">What to fix first</h3>
              <ol className="priorities">
                {d.report.priorities.map((p) => (
                  <li key={p.title}>
                    <div className="priorities__head">
                      <b>{p.title}</b>
                      <span className="chip2">Impact: {p.impact}</span>
                      <span className="chip2">Effort: {p.effort}</span>
                    </div>
                    <p>{p.why}</p>
                    <p className="priorities__how"><strong>How:</strong> {p.how}</p>
                  </li>
                ))}
              </ol>
              {d.report.wins.length > 0 && (
                <>
                  <h3 className="h3" style={{ marginTop: 28 }}>Already working well</h3>
                  <ul className="list-check">
                    {d.report.wins.map((w) => (
                      <li key={w}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>{w}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="fine" style={{ marginTop: 20 }}>{d.report.closing}</p>
            </section>
          ) : (
            d.reportError && <p className="notice notice--err" role="status">{d.reportError === "not_configured" ? "The written plan needs our AI service, which isn't switched on yet. Your measured results are below." : "We couldn't write the plain-English summary this time. Your measured results are below."}</p>
          )}

          <section aria-labelledby="all-checks">
            <h3 className="h3" id="all-checks">All {d.audit.checks.length} checks</h3>
            {CATEGORIES.map((cat) => (
              <details key={cat} className="checks-group" open={d.audit.checks.some((c) => c.category === cat && c.status !== "pass")}>
                <summary>
                  {cat} <span className="chip2">{d.audit.scores[cat]}/100</span>
                </summary>
                <ul>
                  {d.audit.checks.filter((c: Check) => c.category === cat).map((c) => (
                    <li key={c.id} className={`check-row check-row--${c.status}`}>
                      <span className="check-row__icon" aria-hidden="true">{ICON[c.status]}</span>
                      <span>
                        <b>{c.label}</b> <span className="visually-hidden">{LABEL[c.status]}.</span>
                        <small>{c.detail}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </section>
          <ToolCta service="Website Design and Development" text="Want a hand fixing these? We can turn this list into a plan." />
        </div>
      )}
    </div>
  );
}
