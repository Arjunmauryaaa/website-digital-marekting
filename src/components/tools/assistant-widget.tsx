"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TypeText } from "@/components/ui/type-text";

type Msg = { role: "user" | "assistant"; content: string; sources?: { title: string; url: string }[]; handoff?: boolean; followUps?: string[] };

const STARTERS = ["What services do you offer?", "How does your process work?", "Do you work with international clients?"];

/**
 * A small "Ask us" assistant that answers only from this site's own content, links its sources, and hands off to the
 * contact form when it isn't sure. It never quotes prices or promises results (enforced on the server too).
 */
export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcher.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(message: string) {
    const q = message.trim();
    if (!q || busy) return;
    const history = msgs.slice(-6).map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setText("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q, history }) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) setMsgs((m) => [...m, { role: "assistant", content: json.data.answer, sources: json.data.sources, handoff: json.data.handoff, followUps: json.data.followUps }]);
      else setMsgs((m) => [...m, { role: "assistant", content: json.message ?? "Sorry, something went wrong. Please try again.", handoff: true }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "I couldn't connect just now. Please try again in a moment.", handoff: true }]);
    } finally {
      setBusy(false);
    }
  }

  const last = msgs[msgs.length - 1];

  return (
    <div className="asst" data-open={open}>
      {open && (
        <section className="asst__panel" role="dialog" aria-modal="false" aria-label="Ask our AI assistant">
          <header className="asst__head">
            <div>
              <b>Ask us anything</b>
              <small>AI assistant · answers from this site only</small>
            </div>
            <button type="button" className="icon-x" aria-label="Close assistant" onClick={() => { setOpen(false); launcher.current?.focus(); }}>×</button>
          </header>

          <div className="asst__list" ref={list} role="log" aria-live="polite" aria-relevant="additions">
            {msgs.length === 0 && (
              <div className="asst__intro">
                <p>Hi! I&apos;m an AI assistant. I can answer questions about our services, process and how we work. I can&apos;t give quotes, so for pricing I&apos;ll point you to a proposal.</p>
                <div className="asst__chips">
                  {STARTERS.map((s) => (
                    <button type="button" key={s} onClick={() => void send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`asst__msg asst__msg--${m.role}`}>
                <p>{m.role === "assistant" ? <TypeText text={m.content} perChar={14} maxMs={2400} animate={i === msgs.length - 1} /> : m.content}</p>
                {m.sources && m.sources.length > 0 && (
                  <p className="asst__src">
                    Sources:{" "}
                    {m.sources.map((s) => (
                      <Link key={s.url + s.title} href={s.url} onClick={() => setOpen(false)}>{s.title}</Link>
                    ))}
                  </p>
                )}
                {m.handoff && (
                  <Link className="asst__handoff" href="/contact#enquiry" onClick={() => setOpen(false)}>Send us an enquiry</Link>
                )}
              </div>
            ))}
            {busy && <p className="asst__typing" role="status">Thinking…</p>}
            {!busy && last?.role === "assistant" && last.followUps && last.followUps.length > 0 && (
              <div className="asst__chips">
                {last.followUps.map((s) => (
                  <button type="button" key={s} onClick={() => void send(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <form
            className="asst__form"
            onSubmit={(e) => {
              e.preventDefault();
              void send(text);
            }}
          >
            <label htmlFor="asst-input" className="visually-hidden">Your question</label>
            <input id="asst-input" ref={input} value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Type your question…" autoComplete="off" disabled={busy} />
            <button type="submit" className="btn btn--primary btn--sm" disabled={busy || text.trim().length < 2}>Send</button>
          </form>
          <p className="asst__note">AI can make mistakes. Please don&apos;t share confidential information.</p>
        </section>
      )}
      <button ref={launcher} type="button" className="asst__btn" aria-expanded={open} aria-label={open ? "Close AI assistant" : "Open AI assistant"} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H10l-5 4V5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 9.5h6M9 12h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        <span>Ask AI</span>
      </button>
    </div>
  );
}
