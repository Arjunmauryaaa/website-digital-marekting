"use client";

import { useEffect } from "react";

const SELECTOR = ".card, .package, .work__media";

/**
 * Gives cards a gentle 3D tilt toward the cursor by setting --tx / --ty on the hovered card (see "3D MOTION" in globals.css).
 * One delegated listener serves every card. Mouse and pen only; off for touch and for reduced motion.
 */
export function TiltController() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    let active: HTMLElement | null = null;
    let raf = 0;

    const reset = (el: HTMLElement | null) => {
      if (!el) return;
      el.classList.remove("is-tilting");
      el.style.removeProperty("--tx");
      el.style.removeProperty("--ty");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(SELECTOR) ?? null;
      if (el !== active) {
        reset(active);
        active = el;
      }
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.classList.add("is-tilting");
        el.style.setProperty("--tx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
        el.style.setProperty("--ty", String(((e.clientY - r.top) / r.height - 0.5) * 2));
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      reset(active);
      active = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      reset(active);
    };
  }, []);
  return null;
}
