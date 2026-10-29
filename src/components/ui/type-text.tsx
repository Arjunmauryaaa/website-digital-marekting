import type { CSSProperties } from "react";
import { charGap } from "@/lib/typing";

/**
 * "Written by AI" typing effect, done entirely in CSS so it is smooth (compositor-friendly opacity and colour only).
 * - The complete text is always in the page, in order, so search engines, screen readers and copy/paste are unaffected.
 * - Every letter already occupies its space, so nothing reflows while it types.
 * - A caret follows the newest letter, then blinks a few times and goes.
 * - Pace is human-like and deterministic (no randomness, so server and browser always agree): small jitter, longer pauses at punctuation.
 * - Visitors who prefer reduced motion simply see the text (see "Typing" in globals.css).
 */
export function pace(text: string, perChar: number, maxMs: number): { delays: number[]; total: number } {
  const raw: number[] = [];
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    raw.push(t);
    t += charGap(text, i, perChar);
  }
  const scale = t > maxMs ? maxMs / t : 1; // long texts speed up so nobody waits more than maxMs
  return { delays: raw.map((d) => Math.round(d * scale)), total: Math.round(t * scale) };
}

export function TypeText({ text, delay = 0, perChar = 24, maxMs = 4800, animate = true, className }: { text: string; delay?: number; perChar?: number; maxMs?: number; animate?: boolean; className?: string }) {
  if (!animate) return <span className={className}>{text}</span>;
  const { delays, total } = pace(text, perChar, maxMs);
  // Split into words and spaces up front, remembering where each starts (no mutation inside the render callbacks).
  const parts: { part: string; start: number }[] = [];
  let pos = 0;
  for (const part of text.split(/(\s+)/)) {
    parts.push({ part, start: pos });
    pos += part.length;
  }

  return (
    <span className={`tw${className ? ` ${className}` : ""}`} style={{ "--tw-total": `${total + delay}ms` } as CSSProperties}>
      {parts.map(({ part: word, start }, w) => {
        if (/^\s+$/.test(word)) return word; // spaces stay plain text, so line breaking and copy/paste behave normally
        return (
          <span className="tw__w" key={w}>
            {Array.from(word).map((ch, i) => {
              const at = start + i;
              const d = delays[at] + delay;
              const next = at + 1 < delays.length ? delays[at + 1] + delay : d + 2600;
              const last = at === text.length - 1;
              return (
                <span key={i} className={`tw__c${last ? " tw__c--last" : ""}`} style={{ "--d": d, "--g": Math.max(60, next - d) } as CSSProperties}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
