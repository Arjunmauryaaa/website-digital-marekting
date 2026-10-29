import type { Metadata } from "next";
import { site } from "@/config/site";
import { aiConfig } from "@/lib/ai/config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects personal information submitted through this website.`,
  path: "/privacy",
});

const aiCfg = aiConfig();
const aiProvider = aiCfg ? (aiCfg.provider === "anthropic" ? "Anthropic (Claude)" : "Google (Gemini)") : "[your AI provider]";
const leadAi = Boolean(aiCfg?.leadSummary);
const contact = site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : <strong>[add your privacy contact email]</strong>;

// Describes live AI configuration, so it is rendered per request.
export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Legal</p>
          <h1 className="h1">Privacy Policy</h1>
          <p className="lede">What we collect through this website, why, and the choices you have.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="prose">
            <p className="draft" role="note">
              <strong>Before launch:</strong> this policy describes how this website is built to work. Complete the bracketed details, and have it reviewed against the laws that apply to your business (for example UK/EU GDPR, CCPA/CPRA, PIPEDA, the Australian Privacy Act and the UAE PDPL). It is not legal advice.
            </p>
            <p><em>Last updated: [add date]</em></p>

            <h2>Who we are</h2>
            <p>{site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates this website. Our contact for privacy matters is {contact}. Registered business details: <strong>[add legal name and address, if you have a public one]</strong>.</p>

            <h2>What we collect</h2>
            <h3>When you send a project enquiry</h3>
            <ul>
              <li>Your name, business email address and company name.</li>
              <li>Your website address (optional), country, the service you&apos;re interested in, your approximate budget and preferred contact method.</li>
              <li>The project description you write.</li>
            </ul>
            <p>We collect this only to respond to your enquiry and discuss a possible project. We don&apos;t ask for sensitive information, and please don&apos;t include any in your message.</p>

            <h3>Technical data</h3>
            <p>Our hosting provider and servers may log technical information such as IP address, browser type and the pages requested, for security, reliability and abuse prevention. Our contact form limits how often one connection can submit enquiries.</p>

            <h2>How we use it</h2>
            <ul>
              <li>To reply to your enquiry and take steps you ask for before entering a contract.</li>
              <li>To keep the website secure and prevent spam and abuse.</li>
              <li>To understand how the site is used, only if you accept analytics cookies.</li>
            </ul>

            <h2>Who receives it</h2>
            <p>
              Enquiries are delivered to our team by email through our email delivery provider (Resend), which processes the message on our behalf. Our hosting provider stores and serves the website. If you book a call through our scheduling tool, that provider receives the details you enter there. We don&apos;t sell personal information.
            </p>

            <h2 id="cookies">Cookies and similar technologies</h2>
            <p>
              <strong>Essential:</strong> we store your cookie choice in your browser&apos;s local storage so we can remember it.
            </p>
            <p>
              <strong>Analytics (optional):</strong> {site.ga4Id ? "if you accept, we load Google Analytics 4 to measure site usage. It stays off unless you accept, and you can change your mind at any time with “Cookie preferences” in the footer." : "this website is not currently using analytics cookies. If that changes, they will stay off until you accept them, and you will be able to change your choice with “Cookie preferences” in the footer."}
            </p>

            <h2 id="ai">AI tools and the assistant</h2>
            <p>
              Parts of this website use artificial intelligence: the free tools (website audit, growth roadmap, content planner and headline lab), the &ldquo;Ask AI&rdquo; assistant, and a feature that helps us summarise enquiries. When you use one, the text you type (for example your website address, your business description or your question) is sent to our AI provider, {aiProvider}, so it can produce a result.
            </p>
            <ul>
              <li>We do not store what you enter in these tools or the results they produce. Our server only keeps short-lived, anonymous usage counts to prevent abuse.</li>
              <li>The audit fetches the public web page you enter, from our server. It does not log in to anything or access private pages.</li>
              <li>AI results are generated automatically, can be wrong, and are general guidance, not professional advice.</li>
              <li>Please don&apos;t enter confidential or personal information into these tools.</li>
              <li>{leadAi ? "Enquiries sent through the contact form are also summarised by AI for our team's internal use. A person reviews every reply before it is sent." : "Enquiries sent through the contact form are not processed by AI."}</li>
            </ul>
            <p><strong>[Check your AI provider&apos;s current data terms. Free tiers of some providers may use submitted content to improve their products. If you use one, say so here, or use a paid plan that doesn&apos;t.]</strong></p>

            <h2>How long we keep it</h2>
            <p>We keep enquiry details for as long as needed to respond and, if we work together, to manage the project and meet legal obligations. <strong>[state your retention period, for example 24 months for enquiries that don&apos;t become projects]</strong>.</p>

            <h2>Your rights</h2>
            <p>Depending on where you live, you may have the right to access, correct, delete or export your personal information, to object to or restrict certain uses, and to withdraw consent. To exercise these rights, contact {contact}. You can also complain to your local data protection authority.</p>

            <h2>International transfers</h2>
            <p>We work with clients worldwide, and our service providers may process data in countries other than yours. Where required, we rely on appropriate safeguards. <strong>[confirm with your providers&apos; data processing terms]</strong>.</p>

            <h2>Security</h2>
            <p>We validate and sanitise form submissions on the server, transmit data over HTTPS and keep service credentials out of the website&apos;s public code. No method of transmission is perfectly secure, so we can&apos;t guarantee absolute security.</p>

            <h2>Changes</h2>
            <p>We may update this policy and will change the date above when we do.</p>
          </div>
        </div>
      </section>
    </>
  );
}
