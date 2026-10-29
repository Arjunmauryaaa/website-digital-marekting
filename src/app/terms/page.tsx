import type { Metadata } from "next";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: `Terms for using the ${site.name} website and how project engagements are agreed.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Legal</p>
          <h1 className="h1">Terms of Service</h1>
          <p className="lede">The basis on which this website is provided, and how projects are agreed.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="prose">
            <p className="draft" role="note">
              <strong>Before launch:</strong> this is a starting template. Complete the bracketed details and have it reviewed by a qualified professional for the places you operate in. It is not legal advice.
            </p>
            <p><em>Last updated: [add date]</em></p>

            <h2>About these terms</h2>
            <p>By using this website you agree to these terms. They cover use of the website only. Project work is governed by a separate written proposal or agreement.</p>

            <h2>Using the website</h2>
            <ul>
              <li>Use the site lawfully and don&apos;t attempt to disrupt it or access it in unauthorised ways.</li>
              <li>Don&apos;t submit false information or use the contact form to send spam or unsolicited advertising.</li>
            </ul>

            <h2>Information on this site</h2>
            <p>The content is general information about our services. Portfolio items marked &ldquo;Concept Project&rdquo; are self-initiated design concepts, not commissioned client work, and they don&apos;t show client results. We don&apos;t guarantee specific business outcomes such as sales, leads, rankings or advertising results.</p>

            <h2>Enquiries and proposals</h2>
            <p>Submitting an enquiry doesn&apos;t create a contract. Any engagement begins only when you accept a written proposal that sets out scope, deliverables, price, timeline, revisions and ongoing support. Advertising spend, third-party subscriptions and premium stock assets are excluded unless the proposal says otherwise.</p>

            <h2>Intellectual property</h2>
            <p>The website&apos;s design, text and code belong to {site.name} or its licensors. Ownership of project deliverables is set out in the relevant proposal.</p>

            <h2>Liability</h2>
            <p>The website is provided &ldquo;as is&rdquo;. To the extent permitted by law, we aren&apos;t liable for losses arising from your use of it. <strong>[have this section reviewed for your jurisdiction]</strong>.</p>

            <h2>Governing law</h2>
            <p>These terms are governed by the laws of <strong>[add jurisdiction]</strong>.</p>

            <h2>Contact</h2>
            <p>Questions about these terms: {site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : <strong>[add contact email]</strong>}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
