"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { budgetOptions, CONTACT_METHODS, COUNTRIES, contactSchema, fieldErrors, NOT_SURE, SERVICES } from "@/lib/contact";
import { Arrow } from "@/components/ui/icons";
import { BriefHelper } from "./brief-helper";

type Status = "idle" | "sending" | "success" | "error";

const guessCountry = (): string => {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return COUNTRIES.some((c) => c.code === region) ? region! : "";
  } catch {
    return "";
  }
};

const budgetHint = (service: string) =>
  service === "Website Design and Development"
    ? "One-off project budget."
    : service && service !== "Multiple Services" && service !== "Other"
      ? "Monthly management budget, excluding any advertising spend."
      : `A rough guide only. Choose "${NOT_SURE}" if you'd like our advice.`;

export function ContactForm({ initialService = "" }: { initialService?: string }) {
  const [service, setService] = useState(initialService);
  const [country, setCountry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const startedAt = useRef(0);
  const summary = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the visitor's locale is only known in the browser
    setCountry(guessCountry());
  }, []);

  const budgets = useMemo(() => budgetOptions(service, country), [service, country]);
  const busy = status === "sending";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const payload = { ...raw, startedAt: startedAt.current };
    const check = contactSchema.safeParse(payload);
    if (!check.success) {
      const fields = fieldErrors(check.error);
      setErrors(fields);
      setStatus("error");
      setMessage("Please correct the highlighted fields.");
      // Move focus to the first invalid field so keyboard and screen-reader users land on the problem.
      const first = Object.keys(fields)[0];
      requestAnimationFrame(() => (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus());
      return;
    }
    setErrors({});
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        formRef.current?.reset();
        setService("");
        setStatus("success");
        setMessage("Thank you. Your enquiry has been sent, and we'll be in touch soon.");
      } else {
        setErrors(body.fields ?? {});
        setStatus("error");
        setMessage(body.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("We couldn't reach the server. Check your connection and try again.");
    }
    requestAnimationFrame(() => summary.current?.focus());
  }

  const err = (k: string) => errors[k];
  const describe = (k: string, hint?: string) => [err(k) ? `${k}-err` : "", hint ?? ""].filter(Boolean).join(" ") || undefined;

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate aria-describedby="form-legal">
      <div ref={summary} tabIndex={-1} role={status === "error" ? "alert" : "status"} aria-live="polite">
        {message && <p className={`notice ${status === "success" ? "notice--ok" : "notice--err"}`}>{message}</p>}
      </div>

      <div className="form__row form__row--2">
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(err("name"))} aria-describedby={describe("name")} disabled={busy} />
          <p id="name-err" className="field__error">{err("name")}</p>
        </div>
        <div className="field">
          <label htmlFor="email">Business email</label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={Boolean(err("email"))} aria-describedby={describe("email")} disabled={busy} />
          <p id="email-err" className="field__error">{err("email")}</p>
        </div>
      </div>

      <div className="form__row form__row--2">
        <div className="field">
          <label htmlFor="company">Company name</label>
          <input id="company" name="company" autoComplete="organization" required aria-invalid={Boolean(err("company"))} aria-describedby={describe("company")} disabled={busy} />
          <p id="company-err" className="field__error">{err("company")}</p>
        </div>
        <div className="field">
          <label htmlFor="website">
            Website URL <span className="opt">(optional)</span>
          </label>
          <input id="website" name="website" inputMode="url" autoComplete="url" placeholder="yourcompany.com" aria-invalid={Boolean(err("website"))} aria-describedby={describe("website")} disabled={busy} />
          <p id="website-err" className="field__error">{err("website")}</p>
        </div>
      </div>

      <div className="form__row form__row--2">
        <div className="field">
          <label htmlFor="country">Country</label>
          <select id="country" name="country" value={country} onChange={(e) => setCountry(e.target.value)} required aria-invalid={Boolean(err("country"))} aria-describedby={describe("country")} disabled={busy}>
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <p id="country-err" className="field__error">{err("country")}</p>
        </div>
        <div className="field">
          <label htmlFor="service">Service required</label>
          <select id="service" name="service" value={service} onChange={(e) => setService(e.target.value)} required aria-invalid={Boolean(err("service"))} aria-describedby={describe("service")} disabled={busy}>
            <option value="">Select a service</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p id="service-err" className="field__error">{err("service")}</p>
        </div>
      </div>

      <div className="field">
        <label htmlFor="budget">Approximate project budget</label>
        <select id="budget" name="budget" key={`${service}-${country}`} defaultValue="" required aria-invalid={Boolean(err("budget"))} aria-describedby={describe("budget", "budget-hint")} disabled={busy}>
          <option value="">Select a range</option>
          {budgets.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <p id="budget-hint" className="field__hint">{budgetHint(service)}</p>
        <p id="budget-err" className="field__error">{err("budget")}</p>
      </div>

      <div className="field">
        <label htmlFor="message">Project description</label>
        <textarea id="message" name="message" ref={messageRef} required aria-invalid={Boolean(err("message"))} aria-describedby={describe("message", "message-hint")} disabled={busy} />
        <p id="message-hint" className="field__hint">What you do, what you&apos;d like to achieve, and any dates that matter.</p>
        <BriefHelper
          getNotes={() => messageRef.current?.value ?? ""}
          onUse={(brief, suggested) => {
            if (messageRef.current) messageRef.current.value = brief;
            if (!service && (SERVICES as readonly string[]).includes(suggested)) setService(suggested);
          }}
        />
        <p id="message-err" className="field__error">{err("message")}</p>
      </div>

      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }} aria-describedby={describe("contactMethod")}>
        <legend>Preferred contact method</legend>
        <div className="radio-row">
          {CONTACT_METHODS.map((m, i) => (
            <label className="radio" key={m}>
              <input type="radio" name="contactMethod" value={m} defaultChecked={i === 0} disabled={busy} />
              <span>{m}</span>
            </label>
          ))}
        </div>
        <p id="contactMethod-err" className="field__error">{err("contactMethod")}</p>
      </fieldset>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="nickname">Leave this field empty</label>
        <input id="nickname" name="nickname" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="btn btn--primary" disabled={busy} style={{ justifySelf: "start" }}>
        {busy ? (
          <>
            <span className="spinner" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            Send Project Enquiry <Arrow />
          </>
        )}
      </button>
      <p id="form-legal" className="form__legal">
        We&apos;ll use your details to respond to your enquiry. See our <a href="/privacy">Privacy Policy</a> for more information.
      </p>
    </form>
  );
}
