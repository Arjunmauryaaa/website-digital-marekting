"use client";

import { useMemo, useState } from "react";
import { AREAS, BUSINESS_TYPES, GOALS, QUESTIONS, scoreAnswers, type Answers, type Area } from "@/lib/roadmap";
import { TypeText } from "@/components/ui/type-text";
import { Bar, downloadText, ErrorNote, ScoreRing, Spinner, ToolCta } from "./bits";
import { useApi } from "./use-api";

type Priority = { area: Area; title: string; why: string; firstSteps: string[] };
type Data = {
  areas: Record<Area, number>;
  overall: number;
  level: string;
  priorities: Priority[];
  ai: null | {
    summary: string;
    strengths: string[];
    priorities: Priority[];
    plan: { week: number; focus: string; actions: string[] }[];
    suggestedEngagement: string;
    engagementReason: string;
  };
  aiError: string | null;
};

const SERVICE_FOR: Record<string, string> = { "Social Media Starter": "Social Media Management", "Website Launch": "Website Design and Development", "Growth Partnership": "Multiple Services" };

/** Five-axis radar. Values are also printed beside the chart and in the bars, so it never relies on the graphic alone. */
function Radar({ values }: { values: Record<Area, number> }) {
  const cx = 150;
  const cy = 150;
  const R = 108;
  const pt = (i: number, v: number) => {
    const a = (-90 + (360 / AREAS.length) * i) * (Math.PI / 180);
    return [cx + R * (v / 100) * Math.cos(a), cy + R * (v / 100) * Math.sin(a)];
  };
  const poly = AREAS.map((a, i) => pt(i, values[a]).join(",")).join(" ");
  return (
    <svg className="radar" viewBox="0 0 300 300" role="img" aria-label={`Radar chart. ${AREAS.map((a) => `${a} ${values[a]}`).join(", ")}`}>
      {[25, 50, 75, 100].map((g) => (
        <polygon key={g} points={AREAS.map((_, i) => pt(i, g).join(",")).join(" ")} className="radar__grid" />
      ))}
      {AREAS.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt(i, 100)[0]} y2={pt(i, 100)[1]} className="radar__grid" />
      ))}
      <polygon points={poly} className="radar__shape" />
      {AREAS.map((a, i) => {
        const [x, y] = pt(i, 122);
        return (
          <text key={a} x={x} y={y} textAnchor={x < cx - 5 ? "end" : x > cx + 5 ? "start" : "middle"} dominantBaseline="middle" className="radar__label">
            {a}
          </text>
        );
      })}
    </svg>
  );
}

export function RoadmapTool() {
  const api = useApi<Data>("/api/ai/roadmap");
  const [business, setBusiness] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [formError, setFormError] = useState("");
  const answered = Object.keys(answers).length;
  const live = useMemo(() => (answered ? scoreAnswers(answers) : null), [answers, answered]);
  const d = api.data;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!business || !goal) return setFormError("Please choose your business type and main goal.");
    if (answered < QUESTIONS.length) return setFormError(`Please answer all ${QUESTIONS.length} questions (${QUESTIONS.length - answered} left).`);
    setFormError("");
    void api.run({ business, goal, notes: notes || undefined, answers });
  }

  const planText = d
    ? [
        `Digital growth roadmap (${d.level}, overall ${d.overall}/100)`,
        "",
        ...AREAS.map((a) => `${a}: ${d.areas[a]}/100`),
        "",
        d.ai ? d.ai.summary : "",
        "",
        "Priorities:",
        ...(d.ai?.priorities ?? d.priorities).flatMap((p) => [`- ${p.title} (${p.area})`, `  Why: ${p.why}`, ...p.firstSteps.map((s) => `  * ${s}`)]),
        ...(d.ai ? ["", "30-day plan:", ...d.ai.plan.flatMap((w) => [`Week ${w.week}: ${w.focus}`, ...w.actions.map((a) => `  * ${a}`)]), "", `Suggested starting point: ${d.ai.suggestedEngagement}. ${d.ai.engagementReason}`] : []),
        "",
        "Generated automatically as general guidance, not professional advice.",
      ].join("\n")
    : "";

  return (
    <div className="tool">
      <form className="toolform" onSubmit={submit} noValidate>
        <div className="form__row form__row--2">
          <div className="field">
            <label htmlFor="rm-business">Your business</label>
            <select id="rm-business" value={business} onChange={(e) => setBusiness(e.target.value)} disabled={api.loading}>
              <option value="">Select a type</option>
              {BUSINESS_TYPES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rm-goal">Main goal right now</label>
            <select id="rm-goal" value={goal} onChange={(e) => setGoal(e.target.value)} disabled={api.loading}>
              <option value="">Select a goal</option>
              {GOALS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="progress" role="status" aria-live="polite">
          <div className="progress__bar"><span style={{ width: `${(answered / QUESTIONS.length) * 100}%` }} /></div>
          <small>{answered} of {QUESTIONS.length} questions answered</small>
        </div>

        {AREAS.map((area) => (
          <fieldset className="qgroup" key={area}>
            <legend className="eyebrow">{area}</legend>
            {QUESTIONS.filter((q) => q.area === area).map((q) => (
              <div className="question" key={q.id} role="radiogroup" aria-labelledby={`q-${q.id}`}>
                <p id={`q-${q.id}`}>{q.text}</p>
                <div className="radio-row">
                  {q.options.map((o, i) => (
                    <label className="radio" key={o.label}>
                      <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))} disabled={api.loading} />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>
        ))}

        <div className="field">
          <label htmlFor="rm-notes">Anything else we should know? <span className="opt">(optional)</span></label>
          <textarea id="rm-notes" rows={3} maxLength={400} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={api.loading} />
          <p className="field__hint">Please don&apos;t include confidential details or personal data.</p>
        </div>

        {live && <p className="fine">Your score so far: <b>{live.overall}/100</b> ({live.level})</p>}
        {formError && <p className="field__error" role="alert">{formError}</p>}
        <button className="btn btn--primary" type="submit" disabled={api.loading}>{api.loading ? "Building your roadmap…" : "Build my roadmap"}</button>
      </form>

      {api.loading && <Spinner text="Scoring your answers and writing your 30-day plan…" />}
      {api.error && <ErrorNote message={api.error} code={api.code} />}

      {d && (
        <div className="results" aria-live="polite">
          <section className="scorehead">
            <ScoreRing value={d.overall} label="Digital maturity" />
            <div>
              <p className="eyebrow">Your stage: {d.level}</p>
              <h2 className="h2">Your digital growth <em>roadmap</em></h2>
              {d.ai ? <p className="lede"><TypeText text={d.ai.summary} perChar={13} maxMs={2800} /></p> : <p className="lede">Here is where you stand across five areas, with the first steps for your weakest ones.</p>}
            </div>
          </section>

          <section className="radarwrap" aria-label="Scores by area">
            <Radar values={d.areas} />
            <div className="bars">
              {AREAS.map((a) => (
                <Bar key={a} label={a} value={d.areas[a]} />
              ))}
            </div>
          </section>

          {d.aiError && <p className="notice notice--err" role="status">{d.aiError === "not_configured" ? "The personalised 30-day plan needs our AI service, which isn't switched on yet. Your scores and first steps are below." : "We couldn't write the personalised plan this time. Your scores and first steps are below."}</p>}

          <section aria-labelledby="rm-pri">
            <h3 className="h3" id="rm-pri">Your priorities</h3>
            <ol className="priorities">
              {(d.ai?.priorities ?? d.priorities).map((p) => (
                <li key={p.title}>
                  <div className="priorities__head"><b>{p.title}</b><span className="chip2">{p.area}</span></div>
                  <p>{p.why}</p>
                  <ul className="list-check">
                    {p.firstSteps.map((s) => (
                      <li key={s}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>{s}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          {d.ai && (
            <>
              <section aria-labelledby="rm-plan">
                <h3 className="h3" id="rm-plan">Your first 30 days</h3>
                <ol className="weeks">
                  {d.ai.plan.map((w) => (
                    <li key={w.week}>
                      <span className="weeks__n" aria-hidden="true">W{w.week}</span>
                      <div>
                        <b>Week {w.week}: {w.focus}</b>
                        <ul>{w.actions.map((a) => <li key={a}>{a}</li>)}</ul>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="callout">
                <b>Suggested starting point: {d.ai.suggestedEngagement}</b>
                <p>{d.ai.engagementReason}</p>
              </section>
            </>
          )}

          <div className="actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => downloadText("digital-growth-roadmap.txt", planText)}>Download my plan (.txt)</button>
          </div>
          <p className="fine">Generated automatically as general guidance. It is not professional advice and may contain mistakes.</p>
          <ToolCta service={SERVICE_FOR[d.ai?.suggestedEngagement ?? ""] ?? "Multiple Services"} text="Want a real person to review this roadmap with you?" />
        </div>
      )}
    </div>
  );
}
