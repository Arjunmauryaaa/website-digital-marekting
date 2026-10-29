"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          /* clipboard unavailable: the text is still selectable on the page */
        }
      }}
    >
      {done ? "Copied" : label}
      <span className="visually-hidden" role="status">{done ? "Copied to clipboard" : ""}</span>
    </button>
  );
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Circular score meter. The number is also in the text, so it never relies on colour or the graphic alone. */
export function ScoreRing({ value, label, size = 148 }: { value: number; label: string; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value} out of 100`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className="ring__track" />
        <circle cx="60" cy="60" r={r} className="ring__bar" style={{ strokeDasharray: c, strokeDashoffset: c * (1 - value / 100) }} transform="rotate(-90 60 60)" />
      </svg>
      <div className="ring__num">
        <b>{value}</b>
        <small>/100</small>
      </div>
    </div>
  );
}

export function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bar">
      <div className="bar__head">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <div className="bar__track" role="presentation">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Spinner({ text }: { text: string }) {
  return (
    <p className="working" role="status" aria-live="polite">
      <span className="working__dots" aria-hidden="true"><i /><i /><i /></span>
      {text}
    </p>
  );
}

export function ErrorNote({ message, code }: { message: string; code: string | null }) {
  return (
    <div className="notice notice--err" role="alert">
      <strong>{code === "not_configured" ? "Not switched on yet" : "That didn't work"}</strong>
      <span>{message}</span>
    </div>
  );
}

export function ToolCta({ service, text = "Want help turning this into results?" }: { service: string; text?: string }) {
  return (
    <div className="toolcta">
      <p>{text}</p>
      <a className="btn btn--primary btn--sm" href={`/contact?service=${encodeURIComponent(service)}#enquiry`}>Talk to us about this</a>
    </div>
  );
}
