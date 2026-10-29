import "server-only";
import type { LeadSummary } from "./ai/lead";
import type { ContactInput } from "./contact";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Strips CR/LF so user input can never inject headers or extra subject lines. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export type EmailConfig = { apiKey: string; from: string; to: string; apiUrl: string };

export function emailConfig(env: NodeJS.ProcessEnv = process.env): EmailConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !from || !to) return null;
  // RESEND_API_URL exists so tests can point at a local mock. It is a server-side variable only.
  return { apiKey, from, to, apiUrl: env.RESEND_API_URL?.trim() || "https://api.resend.com/emails" };
}

export function enquiryMessage(data: ContactInput, ai?: LeadSummary | null) {
  const rows: [string, string][] = [
    ["Name", data.name],
    ["Email", data.email],
    ["Company", data.company],
    ["Website", data.website ?? "-"],
    ["Country", data.country],
    ["Service", data.service],
    ["Budget", data.budget],
    ["Preferred contact", data.contactMethod],
  ];
  const aiText = ai
    ? [
        "",
        "--- AI summary (INTERNAL. Generated automatically from the enquiry and may be wrong. Please verify. Not sent to the visitor.) ---",
        `Summary: ${ai.summary}`,
        `Priority: ${ai.priority}`,
        ...(ai.signals.length ? ["Signals:", ...ai.signals.map((x) => `- ${x}`)] : []),
        ...(ai.questions.length ? ["Questions to ask:", ...ai.questions.map((x) => `- ${x}`)] : []),
        "Suggested reply (draft, edit before sending):",
        ai.suggestedReply,
      ].join("\n")
    : "";
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", "Project description:", data.message, aiText].join("\n");
  const html = `<table cellpadding="6" style="font-family:sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td>${esc(v)}</td></tr>`)
    .join("")}</table><h3 style="font-family:sans-serif">Project description</h3><p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${esc(data.message)}</p>${
    ai
      ? `<hr><h3 style="font-family:sans-serif">AI summary <small style="font-weight:normal;color:#8a1c1c">(internal, automatic, may be wrong, verify before use)</small></h3><p style="font-family:sans-serif;font-size:14px"><strong>Summary:</strong> ${esc(ai.summary)}<br><strong>Priority:</strong> ${esc(ai.priority)}</p>${ai.signals.length ? `<p style="font-family:sans-serif;font-size:14px"><strong>Signals:</strong></p><ul>${ai.signals.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${ai.questions.length ? `<p style="font-family:sans-serif;font-size:14px"><strong>Questions to ask:</strong></p><ul>${ai.questions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}<p style="font-family:sans-serif;font-size:14px"><strong>Suggested reply (draft):</strong></p><p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;background:#f5f4f0;padding:10px">${esc(ai.suggestedReply)}</p>`
      : ""
  }`;
  return { subject: oneLine(`New project enquiry: ${data.service} - ${data.company}`).slice(0, 200), text, html };
}

/** Returns true only when the provider accepted the message. */
export async function sendEnquiry(data: ContactInput, config: EmailConfig, fetchImpl: typeof fetch = fetch, ai?: LeadSummary | null): Promise<boolean> {
  const { subject, text, html } = enquiryMessage(data, ai);
  const res = await fetchImpl(config.apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.from, to: [config.to], reply_to: data.email, subject, text, html }),
    signal: AbortSignal.timeout(10_000),
  });
  return res.ok;
}
