"use client";

import Script from "next/script";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/config/site";

const KEY = "consent:v1";
const OPEN_EVENT = "open-cookie-prefs";
type Choice = "granted" | "denied" | null;

const read = (): Choice => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

/** Footer link that opens the cookie preferences dialog. */
export function CookieButton() {
  return (
    <button type="button" className="linklike" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cookie preferences
    </button>
  );
}

/**
 * Analytics only exists when NEXT_PUBLIC_GA4_ID is set, and it loads only after the visitor accepts.
 * With no analytics configured the site sets no non-essential cookies, so no banner is shown.
 */
export function Consent() {
  const gaId = site.ga4Id;
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- the stored choice is only readable after mount */
    setChoice(read());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const open = () => setShowPrefs(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (showPrefs && !d.open) d.showModal();
    if (!showPrefs && d.open) d.close();
  }, [showPrefs]);

  const decide = useCallback(
    (value: Exclude<Choice, null>) => {
      try {
        localStorage.setItem(KEY, value);
      } catch {
        /* storage unavailable: the choice still applies for this visit */
      }
      setChoice(value);
      setShowPrefs(false);
      if (gaId && value === "denied") (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = true;
    },
    [gaId],
  );

  return (
    <>
      {gaId && choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}</Script>
        </>
      )}

      {gaId && ready && choice === null && (
        <div className="consent" role="region" aria-label="Cookie consent">
          <p>
            We&apos;d like to use analytics cookies to understand how the site is used and improve it. They&apos;re optional. See our <Link href="/privacy#cookies" className="link">Privacy Policy</Link>.
          </p>
          <div className="actions">
            <button type="button" className="btn btn--primary" onClick={() => decide("granted")}>Accept analytics</button>
            <button type="button" className="btn btn--ghost" onClick={() => decide("denied")}>Decline</button>
          </div>
        </div>
      )}

      <dialog ref={dialogRef} className="prefs" aria-labelledby="prefs-title" onClose={() => setShowPrefs(false)}>
        <h2 id="prefs-title">Cookie preferences</h2>
        <div className="prefs__row">
          <div>
            <strong>Essential</strong>
            <p>Needed for the site to work, such as remembering this choice. Always on.</p>
          </div>
          <span aria-label="Always on">On</span>
        </div>
        <div className="prefs__row">
          <div>
            <strong>Analytics</strong>
            <p>{gaId ? "Helps us understand which pages are useful. Off unless you accept." : "This site isn't using analytics cookies, so there's nothing to switch on."}</p>
          </div>
          {gaId ? <span>{choice === "granted" ? "On" : "Off"}</span> : <span>Not used</span>}
        </div>
        <div className="actions" style={{ marginTop: 20 }}>
          {gaId ? (
            <>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => decide("granted")}>Accept analytics</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => decide("denied")}>Decline analytics</button>
            </>
          ) : null}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowPrefs(false)}>Close</button>
        </div>
      </dialog>
    </>
  );
}
