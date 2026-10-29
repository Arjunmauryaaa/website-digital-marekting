"use client";

import { useEffect, useRef, useState } from "react";
import { charGap, CUT_TICK, cutStep } from "@/lib/typing";

type Phase = "idle" | "type" | "hold" | "select" | "cut" | "gap";

const TYPE_MS = 26; // base time per letter
const HOLD_MS = 3400; // how long a finished line stays readable
const SELECT_MS = 520; // the line is highlighted (as if selected) before it is cut
const GAP_MS = 380; // beat of silence before the next line starts

/**
 * Endless "AI writing" loop: a line types in, holds, is selected and cut, then the next line types in, forever.
 *
 * - Without JavaScript, or with reduced motion, the first line is plain static text (and it is also what search engines and
 *   screen readers get, in a visually hidden copy), so nothing depends on the animation.
 * - The space for the tallest line is reserved with an invisible stack, so the page never shifts as lines change.
 * - It pauses itself while off-screen or in a background tab, and has a visible Pause button (looping text that runs for more than
 *   five seconds needs one for people who find it distracting or hard to read).
 */
export function RotatingText({ messages, startDelay = 900, className = "lede" }: { messages: string[]; startDelay?: number; className?: string }) {
  const [live, setLive] = useState(false);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const text = messages[index];
  const running = live && !reduced && !paused && visible && tabVisible && messages.length > 0;

  // One-time setup in the browser: reduced motion, tab visibility, and whether the block is on screen.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(mq.matches);
      if (mq.matches) {
        setCount(messages[0].length);
        setPhase("hold");
      }
    };
    /* eslint-disable react-hooks/set-state-in-effect -- browser-only facts are read once after mount */
    setLive(true);
    sync();
    setTabVisible(document.visibilityState === "visible");
    /* eslint-enable react-hooks/set-state-in-effect */
    mq.addEventListener("change", sync);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    if (wrap.current) io.observe(wrap.current);
    const start = window.setTimeout(() => setPhase((p) => (p === "idle" && !mq.matches ? "type" : p)), startDelay);
    return () => {
      mq.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      window.clearTimeout(start);
    };
  }, [messages, startDelay]);

  // The state machine: each step schedules exactly one timer, and nothing is scheduled while paused or hidden.
  useEffect(() => {
    if (!running) return;
    let id: number;
    if (phase === "type") {
      if (count < text.length) id = window.setTimeout(() => setCount(count + 1), charGap(text, count, TYPE_MS));
      else id = window.setTimeout(() => setPhase("hold"), 0);
    } else if (phase === "hold") {
      if (messages.length > 1) id = window.setTimeout(() => setPhase("select"), HOLD_MS);
    } else if (phase === "select") {
      id = window.setTimeout(() => setPhase("cut"), SELECT_MS);
    } else if (phase === "cut") {
      if (count > 0) id = window.setTimeout(() => setCount((c) => Math.max(0, c - cutStep(text.length - c))), CUT_TICK);
      else id = window.setTimeout(() => setPhase("gap"), 0);
    } else if (phase === "gap") {
      id = window.setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setCount(0);
        setPhase("type");
      }, GAP_MS);
    }
    return () => window.clearTimeout(id);
  }, [running, phase, count, text, messages.length]);

  const shown = live && !reduced ? text.slice(0, count) : messages[0];
  const head = shown.slice(0, -1);
  const tail = shown.slice(-1);
  const animating = live && !reduced;

  return (
    <div className="rot-wrap" ref={wrap}>
      <p className={`${className} rot`} data-live={live || undefined} data-phase={animating ? phase : "static"}>
        {/* Screen readers and crawlers get the first line as plain text; the moving copy is hidden from them. */}
        <span className="visually-hidden">{messages[0]}</span>
        {/* Reserves the height of the tallest line so nothing below ever moves. */}
        <span className="rot__sizer" aria-hidden="true">
          {messages.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </span>
        <span className="rot__layer" aria-hidden="true">
          <span className="rot__typed">
            {head}
            {tail && (
              <span key={`${index}-${count}`} className={phase === "type" ? "rot__flash" : undefined}>
                {tail}
              </span>
            )}
          </span>
          <span className="rot__caret" />
        </span>
      </p>
      {messages.length > 1 && (
        <button type="button" className="rot__pause" aria-pressed={paused} onClick={() => setPaused((v) => !v)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{paused ? <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /> : <path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" />}</svg>
          <span>{paused ? "Play" : "Pause"}<span className="visually-hidden"> the changing text</span></span>
        </button>
      )}
    </div>
  );
}
