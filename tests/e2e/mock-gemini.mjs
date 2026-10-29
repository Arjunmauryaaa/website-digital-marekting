// Local stand-in for the Gemini API plus a tiny "customer website", used only by end-to-end tests.
//   POST /v1beta/models/:model:generateContent  -> canned, schema-shaped answers chosen from the prompt
//   GET  /site                                  -> a small HTML page the audit can read
//   GET  /last                                  -> the last AI request (to assert on auth and prompt hygiene)
//   POST /fail-next?status=503                  -> make the next AI call fail
import http from "node:http";

let last = null;
let failNext = null; // { status, count }
let calls = 0;

const SITE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sunrise Yoga Studio | Beginner classes</title>
<meta name="description" content="Friendly beginner yoga classes in the heart of the neighbourhood. Book your first class online today."><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="http://localhost:4030/site"><meta property="og:title" content="Sunrise Yoga"></head>
<body><h1>Yoga for busy people</h1><p>${"Relax, stretch and breathe with small friendly classes. ".repeat(30)}</p>
<h2>Classes</h2><a href="/classes">Classes</a><a href="/about">About</a><a href="/contact">Contact us</a><a href="/book">Book a class</a><a href="/privacy">Privacy</a>
<img src="/a.jpg" alt="Yoga class"><img src="/b.jpg"><form><input id="n" name="n"><label for="n">Name</label></form></body></html>`;

function answerFor(system, prompt) {
  const sys = system.toLowerCase();
  const factsMatch = /<facts>\s*([\s\S]*?)\s*<\/facts>/.exec(prompt);
  const facts = factsMatch ? JSON.parse(factsMatch[1]) : null;

  if (sys.includes("senior website consultant")) {
    const bad = facts.checks.filter((c) => c.status !== "pass");
    return {
      headline: `Mock audit: score ${facts.overallScore}`,
      summary: "Mock summary based only on the measured results.",
      wins: ["Mock win: the page is served over HTTP in tests."],
      priorities: (bad.length ? bad : facts.checks).slice(0, 3).map((c) => ({ title: `Fix: ${c.label}`, why: c.detail, how: "Mock how-to.", effort: "low", impact: "high", relatedChecks: [c.id, "not-a-real-check"] })),
      closing: "Mock closing.",
    };
  }
  if (sys.includes("pragmatic digital marketing strategist")) {
    const weakest = Object.entries(facts.scores).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([area]) => area);
    return {
      summary: "Mock roadmap summary.",
      strengths: ["Mock strength"],
      priorities: weakest.map((area) => ({ area, title: `Mock priority for ${area}`, why: "Because the score is low.", firstSteps: ["Step one", "Step two"] })),
      plan: [1, 2, 3, 4].map((week) => ({ week, focus: `Mock focus ${week}`, actions: ["Action A", "Action B"] })),
      suggestedEngagement: "Website Launch",
      engagementReason: "Mock reason.",
    };
  }
  if (sys.includes("social media strategist")) {
    return {
      theme: "Mock weekly theme",
      days: [1, 2, 3, 4, 5, 6, 7].map((day) => ({ day, format: day % 2 ? "Reel" : "Carousel", hook: `Mock hook ${day}`, caption: `Mock caption ${day}`, visual: "Mock visual", cta: "Book a class", hashtags: ["yoga", "calm"] })),
      tips: ["Mock tip"],
    };
  }
  if (sys.includes("conversion copywriter")) {
    const s = (n) => ({ score: n, note: "Mock note" });
    return { scores: { clarity: s(2), specificity: s(1), benefit: s(3), nextStep: s(2) }, diagnosis: "Mock diagnosis.", rewrites: ["Direct", "Benefit-led", "Question"].map((style, i) => ({ style, headline: `Mock headline ${i + 1}`, subheadline: "Mock subheadline", whyItWorks: "Mock reason" })) };
  }
  if (sys.includes("turn rough notes into a clear project brief")) {
    const notes = /<user_input name="notes">\s*([\s\S]*?)\s*<\/user_input>/.exec(prompt)?.[1] ?? "";
    return { brief: `Mock brief built from: ${notes.slice(0, 80)}`, questions: ["What is your budget?"], suggestedService: "Website Design and Development" };
  }
  if (sys.includes("website assistant for")) {
    const q = /<user_input name="visitor question">\s*([\s\S]*?)\s*<\/user_input>/.exec(prompt)?.[1] ?? "";
    const firstSource = /\[([\w-]+)\]/.exec(prompt)?.[1];
    if (q.includes("test-unsafe-amount")) return { answer: "It costs $500 per month.", sourceIds: firstSource ? [firstSource] : [], needsHuman: false, followUps: [] };
    if (q.includes("test-unsafe-guarantee")) return { answer: "We guarantee first page rankings.", sourceIds: [], needsHuman: false, followUps: [] };
    if (q.includes("test-fake-source")) return { answer: "Here is an answer.", sourceIds: ["evil-id", firstSource ?? "about"], needsHuman: false, followUps: ["Tell me more"] };
    return { answer: "Mock answer drawn from the site content.", sourceIds: firstSource ? [firstSource] : [], needsHuman: false, followUps: ["What is your process?"] };
  }
  if (sys.includes("triage new website enquiries")) {
    return { summary: "Mock lead summary.", priority: "high", signals: ["Clear need"], questions: ["What is the timeline?"], suggestedReply: "Hello, thanks for getting in touch. (mock draft)" };
  }
  return { error: "unknown prompt" };
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/site") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Encoding": "identity" });
      return res.end(SITE);
    }
    if (req.method === "GET" && url.pathname === "/not-html") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end("{}");
    }
    if (req.method === "GET" && url.pathname === "/last") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ calls, last }));
    }
    if (req.method === "POST" && url.pathname === "/fail-next") {
      failNext = { status: Number(url.searchParams.get("status") ?? 503), count: Number(url.searchParams.get("count") ?? 1) };
      res.writeHead(204);
      return res.end();
    }
    const m = /^\/v1beta\/models\/([^:]+):generateContent$/.exec(url.pathname);
    if (req.method === "POST" && m) {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const json = JSON.parse(body || "{}");
        calls += 1;
        last = { model: m[1], key: req.headers["x-goog-api-key"], urlHasKey: url.search.includes("key="), system: json.systemInstruction?.parts?.[0]?.text, prompt: json.contents?.[0]?.parts?.[0]?.text, config: json.generationConfig };
        if (failNext) {
          const status = failNext.status;
          if (--failNext.count <= 0) failNext = null;
          res.writeHead(status, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: { code: status, message: "SECRET upstream detail that must never reach visitors" } }));
        }
        const out = answerFor(last.system ?? "", last.prompt ?? "");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(out) }] } }], usageMetadata: { totalTokenCount: 100 } }));
      });
      return;
    }
    res.writeHead(404);
    res.end();
  })
  .listen(4030, () => console.log("mock gemini + site on 4030"));
