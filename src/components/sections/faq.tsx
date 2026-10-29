"use client";

import { useId, useState } from "react";

/** Accessible accordion: real buttons with aria-expanded/aria-controls, regions labelled by their question. Works with keyboard and screen readers. */
export function Faq({ items, headingLevel = 3 }: { items: { q: string; a: string }[]; headingLevel?: 2 | 3 }) {
  const base = useId();
  const [open, setOpen] = useState<number | null>(0);
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <div className="faq">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div className="faq__item" key={it.q} data-reveal>
            <H className="faq__q">
              <button type="button" className="faq__btn" id={`${base}-b${i}`} aria-expanded={isOpen} aria-controls={`${base}-p${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                {it.q}
              </button>
            </H>
            <div className="faq__panel" id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-b${i}`} data-open={isOpen}>
              <div>
                <p>{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
