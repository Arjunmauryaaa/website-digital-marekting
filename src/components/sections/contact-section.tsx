import { site } from "@/config/site";
import { callCovers } from "@/content/site-content";
import { ContactForm } from "@/components/forms/contact-form";
import { ButtonLink } from "@/components/ui/ui";
import { TimeZones } from "./time-zones";

/** "Book a Discovery Call": uses the configured scheduling link, otherwise falls back to the enquiry form. */
export function BookCall() {
  return (
    <div className="call-box" id="book">
      <h3 className="h3">Book a Discovery Call</h3>
      <p style={{ color: "var(--muted-dark)" }}>A relaxed first conversation, no obligation. We&apos;ll cover:</p>
      <ul>
        {callCovers.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      {site.bookingUrl ? (
        <>
          <ButtonLink href={site.bookingUrl} external variant="ghost-dark">Choose a Time</ButtonLink>
          <p className="fine" style={{ color: "var(--muted-dark)" }}>Available times are shown in your own time zone, so booking works from anywhere.</p>
        </>
      ) : (
        <>
          <ButtonLink href="#enquiry" variant="ghost-dark" arrow={false}>Request a Call via the Form</ButtonLink>
          <p className="fine" style={{ color: "var(--muted-dark)" }}>Online booking isn&apos;t switched on yet. Send an enquiry and choose &ldquo;Video call&rdquo; and we&apos;ll arrange a time with you.</p>
        </>
      )}
    </div>
  );
}

export function ContactSection({ initialService, top }: { initialService?: string; top?: boolean }) {
  const Title = top ? "h1" : "h2";
  return (
    <section className={`section section--dark dark${top ? " contact--top" : ""}`} id="contact" aria-labelledby="contact-title">
      <div className="container contact">
        <div className="contact__side" data-reveal>
          <p className="eyebrow">Contact</p>
          <Title className="h2" id="contact-title">Let&apos;s Build Something That Moves Your Business Forward.</Title>
          <p className="lede">Tell us what you&apos;re working on, where you want to go, and how we can help.</p>
          <BookCall />
          <div className="call-box" aria-labelledby="clocks-title">
            <h3 className="h3" id="clocks-title">Working across time zones</h3>
            <TimeZones agencyTz={site.timeZone} hours={site.hours} />
            {site.responseTime && <p className="fine" style={{ color: "var(--muted-dark)" }}>We aim to reply {site.responseTime}.</p>}
          </div>
        </div>
        <div id="enquiry" data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
          <ContactForm initialService={initialService} />
        </div>
      </div>
    </section>
  );
}
