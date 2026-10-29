"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="page-hero" role="alert">
      <div className="container">
        <h1 className="h1">Something went wrong.</h1>
        <p className="lede">We couldn&apos;t load this page. Please try again.</p>
        <button type="button" className="btn btn--primary" onClick={reset}>Try again</button>
      </div>
    </section>
  );
}
