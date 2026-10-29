"use client";

import { useState } from "react";
import { CopyButton, downloadText, ErrorNote, Spinner, ToolCta } from "./bits";
import { useApi } from "./use-api";

type Data = { theme: string; days: { day: number; format: string; hook: string; caption: string; visual: string; cta: string; hashtags: string[] }[]; tips: string[] };

const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "TikTok"];
const TONES = ["Friendly", "Professional", "Playful", "Inspiring", "Expert"];
const GOALS = ["Get more enquiries", "Build awareness", "Engage existing customers", "Promote an offer"];

export function ContentTool() {
  const api = useApi<Data>("/api/ai/content");
  const [f, setF] = useState({ business: "", audience: "", goal: GOALS[0], platform: PLATFORMS[0], tone: TONES[0], offer: "" });
  const d = api.data;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const body = () => ({ ...f, offer: f.offer || undefined });

  const asText = d
    ? [`7-day ${f.platform} content plan: ${d.theme}`, "", ...d.days.flatMap((x) => [`DAY ${x.day} (${x.format})`, `Hook: ${x.hook}`, x.caption, `Visual: ${x.visual}`, `CTA: ${x.cta}`, x.hashtags.length ? x.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ") : "", ""]), "Generated automatically. Review before posting."].join("\n")
    : "";

  return (
    <div className="tool">
      <form className="toolform" onSubmit={(e) => { e.preventDefault(); void api.run(body()); }}>
        <div className="field">
          <label htmlFor="ct-business">Your business, in a sentence</label>
          <input id="ct-business" value={f.business} onChange={set("business")} maxLength={160} placeholder="e.g. A neighbourhood yoga studio offering beginner classes" required disabled={api.loading} />
        </div>
        <div className="field">
          <label htmlFor="ct-audience">Who are you talking to?</label>
          <input id="ct-audience" value={f.audience} onChange={set("audience")} maxLength={160} placeholder="e.g. Busy professionals aged 25 to 45 who want to de-stress" required disabled={api.loading} />
        </div>
        <div className="form__row form__row--2">
          <div className="field">
            <label htmlFor="ct-platform">Platform</label>
            <select id="ct-platform" value={f.platform} onChange={set("platform")} disabled={api.loading}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          <div className="field">
            <label htmlFor="ct-tone">Tone of voice</label>
            <select id="ct-tone" value={f.tone} onChange={set("tone")} disabled={api.loading}>{TONES.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
        </div>
        <div className="form__row form__row--2">
          <div className="field">
            <label htmlFor="ct-goal">Goal</label>
            <select id="ct-goal" value={f.goal} onChange={set("goal")} disabled={api.loading}>{GOALS.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          <div className="field">
            <label htmlFor="ct-offer">An offer to promote <span className="opt">(optional)</span></label>
            <input id="ct-offer" value={f.offer} onChange={set("offer")} maxLength={200} placeholder="Only if it's real" disabled={api.loading} />
          </div>
        </div>
        <button className="btn btn--primary" type="submit" disabled={api.loading || f.business.trim().length < 3 || f.audience.trim().length < 3}>{api.loading ? "Writing…" : d ? "Make a new plan" : "Create my 7-day plan"}</button>
      </form>

      {api.loading && <Spinner text="Writing seven days of content…" />}
      {api.error && <ErrorNote message={api.error} code={api.code} />}

      {d && (
        <div className="results" aria-live="polite">
          <header>
            <p className="eyebrow">Your 7-day {f.platform} plan</p>
            <h2 className="h2">{d.theme}</h2>
          </header>
          <ol className="days">
            {d.days.map((x) => (
              <li key={x.day} className="day">
                <div className="day__head">
                  <span className="day__n">Day {x.day}</span>
                  <span className="chip2">{x.format}</span>
                </div>
                <p className="day__hook">{x.hook}</p>
                <p className="day__caption">{x.caption}</p>
                <dl>
                  <dt>Visual</dt><dd>{x.visual}</dd>
                  <dt>Call to action</dt><dd>{x.cta}</dd>
                </dl>
                {x.hashtags.length > 0 && <p className="fine">{x.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}</p>}
                <CopyButton text={`${x.hook}\n\n${x.caption}\n\n${x.cta}\n${x.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}`} label="Copy caption" />
              </li>
            ))}
          </ol>
          {d.tips.length > 0 && (
            <section className="callout">
              <b>Tips for this week</b>
              <ul className="prose" style={{ marginTop: 8 }}>{d.tips.map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
          )}
          <div className="actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => downloadText("content-plan.txt", asText)}>Download plan (.txt)</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => void api.run(body())}>Regenerate</button>
          </div>
          <p className="fine">Generated automatically. Check facts, claims and tone before you post anything.</p>
          <ToolCta service="Social Media Management" text="Want a team to plan, create and schedule this for you every month?" />
        </div>
      )}
    </div>
  );
}
