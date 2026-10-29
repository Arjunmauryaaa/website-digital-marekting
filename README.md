# Agency website

A complete marketing site for an independent digital marketing and website development agency: home, services (six service pages), work, about, process, contact, privacy and terms. Built with Next.js (App Router), TypeScript and a hand-written CSS design system. It has no external image dependencies; every visual is drawn in code.

This lives in `./agency` and is separate from the Shopify storefront in the repository root.

## Run it

```bash
cd agency
npm install
cp .env.example .env.local   # optional: the site runs without it
npm run dev                  # http://localhost:3000
```

Production: `npm run build && npm run start`.

Checks: `npm run verify` (lint, typecheck, unit tests, build) and `npm run test:e2e` (Playwright on desktop and a phone viewport, including axe accessibility scans).

## What is real, and what you must configure

| Area | Status |
| --- | --- |
| Pages, navigation, mobile menu, FAQ, animations, SEO metadata, sitemap, robots, social preview image | Implemented and tested |
| Contact form: client and server validation, honeypot, minimum-fill-time check, same-origin check, rate limiting | Implemented and tested |
| Contact form email delivery | **Needs your Resend account** (see below). Until configured the form returns an honest "not connected to an inbox" error. It never shows a success message unless the provider accepted the email. |
| Discovery-call booking | **Needs your scheduling link** (`NEXT_PUBLIC_BOOKING_URL`). Without it the page falls back to the enquiry form and says so. |
| Analytics | **Optional.** Google Analytics 4 loads only if `NEXT_PUBLIC_GA4_ID` is set *and* the visitor accepts. With no ID there are no analytics cookies and no banner. |
| Agency name, email, LinkedIn, Instagram | **Placeholders** until you set the environment variables below. Placeholders are visibly marked and are not links. |
| Privacy Policy and Terms | **Drafts** reflecting how this site actually works, with `[bracketed]` items to complete. Have them reviewed by a qualified professional before launch. They are not legal advice. |

Nothing in this repo has been verified against a live email provider, booking tool or analytics property. The end-to-end tests use a local mock of the Resend API.

## Configuration

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_AGENCY_NAME` | Your agency name (logo, titles, footer) |
| `NEXT_PUBLIC_SITE_URL` | Public URL for canonical links, sitemap and social previews |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the footer and legal pages (omit to keep the placeholder) |
| `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` | Footer social links (omit to keep placeholders) |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Enquiry delivery. The from address must be on a domain verified in Resend. **Server-only; never prefix these with `NEXT_PUBLIC_`.** |
| `NEXT_PUBLIC_BOOKING_URL` | Calendly (or similar) link |
| `NEXT_PUBLIC_GA4_ID` | GA4 measurement ID (optional) |

### Setting up the contact form
1. Create a Resend account and verify your sending domain.
2. Create an API key and set the three `RESEND_` / `CONTACT_` variables on your host (not in the repo).
3. Submit a test enquiry from the live site and confirm it arrives.

## Editing content

| What | Where |
| --- | --- |
| Agency name, contact details, booking and analytics | `src/config/site.ts` and environment variables |
| Service cards and every service page | `src/content/services.ts` |
| Portfolio | `src/content/portfolio.ts` |
| Process, FAQ, why-us, engagements, call agenda | `src/content/site-content.ts` |
| Colours, type, spacing | CSS variables at the top of `src/app/globals.css` |

### Adding real work
Every portfolio item is currently an honest **Concept Project**. To add a real one, add an entry with `kind: "client"`, the permissioned `client` name, and only verified `results`. The card badge and project page switch from "Concept Project" to "Client Project" automatically, and results appear on the project page only when present. Replace the code-drawn mockup with a real screenshot when you have one.

### Adding testimonials
The testimonials area currently shows three working principles, not quotes. When you have genuine, permissioned testimonials, replace the `principles` array and the `Principles` component in `src/components/sections/home-sections.tsx` with a quote layout. Don't add placeholder quotes.

## The trust layer

The site is built to look established without inventing anything. Evidence appears **only when you supply it**:

| Slot | Where to add it | What appears |
| --- | --- | --- |
| Founder / team | `team` in `src/content/trust.ts` (name, role, bio, photo in `/public`, LinkedIn) | "Meet the team" on the About page |
| Client testimonials | `testimonials` in `src/content/trust.ts` | Real quotes replace the principles block on the home page |
| Certifications | `credentials` in `src/content/trust.ts`, each with a verification link | "Check us out" chips |
| Review profiles | `NEXT_PUBLIC_GOOGLE_PROFILE_URL`, `_CLUTCH_URL`, `_TRUSTPILOT_URL`, `_LINKEDIN_URL` | Links in the footer and "Check us out" |
| Business identity | `NEXT_PUBLIC_LEGAL_NAME`, `_REGISTRATION`, `_LOCATION` | Footer trust row |
| Response commitment | `NEXT_PUBLIC_RESPONSE_TIME` | "We aim to reply …" on the contact page. Set it only if you will honour it. |
| Case studies | `challenge`, `approach`, `outcome`, `testimonial`, `results`, `image` on a project in `src/content/portfolio.ts` | Case-study sections and a real screenshot on the project page |

Already included and always on: process-based commitments and a "What we won't promise" block, live clocks for the US, UK, Canada, Australia and UAE (with an "overlap now" hint when `NEXT_PUBLIC_AGENCY_TZ` is set), an Insights section with three starter articles (general guidance, no statistics; review and add your own voice), article structured data, a generated favicon, apple icon and web manifest.

Tests assert that the site ships with no invented team, quotes, credentials or review links.

## Videos

"Digital transformation, in motion" (home page, and the process page) shows three **original animated explainers**: *From scattered to connected*, *A website that guides action* and *Plan, create, launch, improve*. They are code-drawn motion graphics, silent, about 15 seconds each, and are labelled on the page as illustrations, not client footage. Each has a poster frame, a text version, and `VideoObject` structured data.

- **Files:** `public/videos/*.mp4` (H.264, plays everywhere), `*.webm` (VP9) and `*.jpg` posters, about 2.3 MB in total.
- **Playback:** muted and silent. They autoplay only while on screen, and never for visitors who prefer reduced motion or have Data Saver on (a play button appears instead). Browsers that can't play them show the poster and the text version.
- **Editing or re-rendering:** the scenes live in `video-src/*.html` (plain HTML and CSS animation). Change the wording or timing, then run `npm run videos` (needs internet for web fonts). It records each scene with Playwright and encodes with `ffmpeg-static`. Update `src/content/videos.ts` if titles or durations change.
- **Real videos later:** add entries to `embeds` in `src/content/videos.ts` (YouTube or Vimeo ID, title, description, optional self-hosted poster, transcript). A "From us" row appears. Embeds are click-to-load, using `youtube-nocookie.com` and Vimeo's do-not-track mode, so nothing third-party loads or sets cookies until the visitor presses play. IDs are validated before they are put in the iframe URL.
- The animations contain no agency name or logo, so they stay valid when you set your real brand name.

## AI features

Everything AI runs on the server. The key is `GEMINI_API_KEY` in `.env.local` (git-ignored) and never reaches the browser; tests check that. With no key, AI switches off honestly: the website audit still runs its 30 measured checks, the roadmap still shows its scores and baseline steps, and the assistant still answers greetings, pricing and out-of-scope questions from fixed text.

| Feature | Where | What the AI does, and what it doesn't |
| --- | --- | --- |
| Website audit | `/tools/website-audit` | 30 checks are measured in code (SSRF-safe page fetch). AI only turns the measured results into a prioritised plan, and can't invent findings. Optional PageSpeed test. |
| Growth roadmap | `/tools/growth-roadmap` | 10-question quiz scored in code. AI writes the personalised 30-day plan and recommends one of your three engagements (never prices). |
| 7-day content planner | `/tools/content-calendar` | Drafts posts. Told not to invent offers, reviews or statistics. |
| Headline lab | `/tools/headline-lab` | Scores a headline on four dimensions and rewrites it without adding claims. |
| Site assistant | "Ask AI" button on every page | Answers only from this site's content (`src/lib/ai/assistant.ts`), links sources from your own data, never states prices, percentages or guarantees (enforced after the model answers), and hands off to the contact form. |
| Brief helper | Contact form | Turns rough notes into a clearer brief. Nothing is filled in until the visitor clicks "Use this brief". |
| Lead summary (opt-in) | Enquiry email to you | Internal summary, priority and draft reply, clearly labelled and never shown to the visitor. Off unless `AI_LEAD_SUMMARY=1`, because it sends enquiry text to the AI provider. |

**Safeguards:** same-origin and JSON-only requests, input limits, per-visitor rate limits per feature, a global daily call cap (`AI_DAILY_LIMIT`), schema-validated model output, untrusted text fenced as data in prompts, model fallback chains, and error messages that never include upstream details. The audit blocks private, loopback and cloud-metadata addresses, re-checks DNS at connection time and on every redirect, and caps size and time.

**Providers:** Gemini by default. Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` to use Claude (that path is covered by unit tests with a mocked API but hasn't been run against the live service). Model names change over time, so each tier takes a comma-separated fallback list.

**Before going live:**
- Free Gemini keys may let Google use submitted text to improve its products. Use a paid key, or say so in the Privacy Policy (section "AI tools and the assistant", which has a bracketed reminder).
- The rate limiter and daily cap are per server instance. On serverless hosting, add a shared store or an edge rule.
- Rotate any key that has been pasted into a chat or ticket.
- AI output can be wrong. Tools label it as automatic, and lead replies are drafts for a person to review.

## Security and privacy notes
- Submissions are validated on the server with the same schema as the browser, and HTML in messages is escaped before it goes into email.
- Secrets exist only in server-side environment variables and don't reach the client bundle (a test checks the page HTML for them).
- The in-memory rate limiter (`src/lib/rate-limit.ts`) works for a single server. On serverless or multi-instance hosting, add a shared limiter (for example Upstash) or an edge rule, or limits won't be shared between instances.
- A honeypot field and a minimum fill time catch simple bots. For heavier abuse, add a CAPTCHA such as Cloudflare Turnstile.
- Don't collect more than the form asks for. Update the privacy policy if you add fields or tools.

## Before launch checklist
- [ ] Set the agency name, site URL, contact email and social links.
- [ ] Configure Resend and send a real test enquiry.
- [ ] Add your booking link, or keep the fallback.
- [ ] Complete and legally review the Privacy Policy and Terms (all `[bracketed]` items).
- [ ] Decide on analytics. If used, set the GA4 ID and review the cookie wording.
- [ ] Replace concept projects with real work as it becomes available; keep anything unverified labelled.
- [ ] Preview social sharing (`/opengraph-image`) with your real name.
- [ ] Run `npm run verify` and `npm run test:e2e`, then check on a real phone.

## Design notes
- Palette follows the brief (navy `#0B1020`, blue, cyan). Primary buttons use `#4A5FF0` rather than `#5267FF` because white text on the brand blue is 4.4:1, below WCAG AA for small text; the brand blue is still used for accents.
- Motion is CSS-first, short (about 150-900 ms) and fully switched off for visitors who prefer reduced motion. Hidden "before" states exist only when JavaScript is running, so content is always visible without it. What moves:
  - Hero headline lines and copy stagger in; the hero visual's layers drift slightly toward the cursor on desktop (`ParallaxStage`, precise pointers only).
  - A thin scroll-progress bar (browsers with scroll-driven animations), and a soft fade on every page change (`src/app/template.tsx`).
  - Cards lift with an icon tilt on hover; buttons press; footer links underline in.
  - The process line draws in and its numbers pop; device mockups slide in; portfolio previews unveil on scroll.
  - Mobile menu links arrive one after another; the cookie banner slides up; form notices ease in, invalid fields nudge once, and arriving at `#enquiry` flashes the form.
  - **"Written by AI" typing** (`src/components/ui/type-text.tsx`): the hero paragraph types in letter by letter with a human-like rhythm (small deterministic jitter, longer pauses at punctuation), a cyan flash on each new letter, and a caret that rides the newest letter then blinks and goes. It is pure CSS, so it stays smooth. The complete text is always in the page for search engines, screen readers and copy/paste, nothing reflows while it types, and reduced-motion visitors just see the text. The same component types out real AI answers (assistant replies, audit and roadmap summaries, headline diagnosis, brief suggestion), using the brand blue on light surfaces. Use it anywhere: `<TypeText text="..." delay={950} />`.
  - No scroll hijacking, no looping backgrounds, and nothing that shifts layout.
- **Matte finish:** flat colour fills, soft neutral shadows, a fine paper grain behind dark surfaces (a pseudo-element, so the solid background colour still drives contrast checks), and no glass blur, glossy highlights or glowing gradients. Tokens are at the top of the "MATTE FINISH" block in `src/app/globals.css`.
- **3D motion** (real CSS perspective and `translateZ`, no 3D library):
  - The hero is a layered scene (browser, post, chart and phone at different depths) that turns with the cursor (`ParallaxStage`) and swings in on load.
  - Service, engagement and portfolio cards tilt toward the cursor, with icons lifting off the surface (`TiltController`, mouse and pen only).
  - The website-development showcase is angled in 3D and turns to face you as you scroll to it (scroll-driven, in supporting browsers).
  - Process step badges flip in like coins.
  - Under reduced motion all of this is flat and still; tests check perspective, transforms and depth are off.
- Fonts: Manrope (headings), Inter (body) and Instrument Serif italic for one emphasised phrase per headline, all through `next/font`. Light surfaces use a warm stone (`#F5F4F0`) rather than a cool grey, which reads as calmer and more established next to the navy. These are small, deliberate departures from the original brief; revert them in the tokens at the top of `src/app/globals.css` if you prefer the brief exactly.
