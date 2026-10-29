"use client";

import { useState } from "react";
import { useApi } from "@/components/tools/use-api";
import { TypeText } from "@/components/ui/type-text";

type Data = { brief: string; questions: string[]; suggestedService: string };

/**
 * "Help me write this": turns rough notes in the project description into a clearer brief. The visitor sees the suggestion,
 * can edit or ignore it, and nothing is filled in until they choose "Use this brief".
 */
export function BriefHelper({ getNotes, onUse }: { getNotes: () => string; onUse: (brief: string, service: string) => void }) {
  const api = useApi<Data>("/api/ai/brief");
  const [hint, setHint] = useState("");
  const d = api.data;

  return (
    <div className="brief">
      <button
        type="button"
        className="brief__btn"
        disabled={api.loading}
        onClick={() => {
          const notes = getNotes().trim();
          if (notes.length < 10) return setHint("Jot down a few rough notes in the box above first, then I'll help tidy them up.");
          setHint("");
          void api.run({ notes });
        }}
      >
        <span aria-hidden="true">✦</span> {api.loading ? "Writing a clearer version…" : "Help me write this with AI"}
      </button>
      {hint && <p className="field__hint" role="status">{hint}</p>}
      {api.error && <p className="field__error" role="alert">{api.code === "not_configured" ? "The AI helper isn't switched on yet. You can still write your own description." : api.error}</p>}
      {d && (
        <div className="brief__result" role="region" aria-label="AI suggestion">
          <p className="eyebrow">Suggested brief</p>
          <p className="brief__text"><TypeText text={d.brief} perChar={11} maxMs={2200} /></p>
          {d.questions.length > 0 && (
            <>
              <p className="brief__q">Worth adding if you know it:</p>
              <ul>{d.questions.map((q) => <li key={q}>{q}</li>)}</ul>
            </>
          )}
          <div className="actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={() => { onUse(d.brief, d.suggestedService); api.reset(); }}>Use this brief</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={api.reset}>Keep mine</button>
          </div>
          <p className="fine">AI-written from your notes. Check it says what you mean before sending.</p>
        </div>
      )}
    </div>
  );
}
