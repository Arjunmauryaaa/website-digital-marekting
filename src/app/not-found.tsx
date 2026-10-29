import { ButtonLink } from "@/components/ui/ui";

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="eyebrow">Error 404</p>
        <h1 className="h1">This page doesn&apos;t exist.</h1>
        <p className="lede">The link may be out of date, or the page may have moved.</p>
        <div className="actions">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/contact" variant="ghost-dark">Contact us</ButtonLink>
        </div>
      </div>
    </section>
  );
}
