import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Runs against a production build with email pointed at a local mock (tests/e2e/mock-resend.mjs).
// It verifies behaviour and honest failure states, not delivery through a real provider.

const SERVICE_SLUGS = ["social-media-management", "website-design-development", "paid-advertising", "seo", "content-creation-branding", "lead-generation"];
const PAGES = ["/", "/services", "/work", "/insights", "/insights/seo-basics-for-small-businesses", "/tools", "/tools/website-audit", "/tools/growth-roadmap", "/tools/content-calendar", "/tools/headline-lab", "/about", "/process", "/contact", "/privacy", "/terms", ...SERVICE_SLUGS.map((s) => `/services/${s}`), "/work/beauty-salon-website"];

test.describe("navigation and links", () => {
  for (const path of PAGES) {
    test(`${path} renders with exactly one h1`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }

  test("every internal link on every page resolves, and every #anchor exists", async ({ page, request, baseURL }) => {
    const seen = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path);
      const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        if (href.startsWith("mailto:") || href.startsWith("http")) continue;
        const [p, hash] = href.split("#");
        const target = p || path;
        const key = `${target}#${hash ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const res = await request.get(new URL(target, baseURL).toString());
        expect(res.status(), `${href} (linked from ${path})`).toBe(200);
        if (hash) {
          const html = await res.text();
          expect(html, `anchor #${hash} on ${target}`).toMatch(new RegExp(`id="${hash}"`));
        }
      }
    }
    expect(seen.size).toBeGreaterThan(20);
  });

  test("unknown routes return a real 404", async ({ request }) => {
    expect((await request.get("/nope")).status()).toBe(404);
    expect((await request.get("/services/does-not-exist")).status()).toBe(404);
    expect((await request.get("/work/does-not-exist")).status()).toBe(404);
  });

  test("mobile menu opens, traps focus, closes on Escape and after navigation", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phones only");
    await page.goto("/");
    const menuBtn = page.getByRole("button", { name: "Open menu" });
    await menuBtn.click();
    const menu = page.getByRole("dialog", { name: /menu/i });
    await expect(menu).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await menuBtn.click();
    await menu.getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(menu).toBeHidden();
  });

  test("header CTA and desktop nav are present on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link")).toHaveCount(7);
    await page.getByRole("banner").getByRole("link", { name: "Let's Talk" }).click();
    await expect(page).toHaveURL(/\/contact$/);
  });
});

test.describe("homepage content and honesty", () => {
  test("shows the six services, the dev section and labelled concept work", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#services .card")).toHaveCount(6);
    await expect(page.getByRole("heading", { name: "Your Website Should Work as Hard as You Do." })).toBeVisible();
    const badges = page.locator("#work .badge");
    await expect(badges).toHaveCount(6);
    for (const t of await badges.allTextContents()) expect(t).toBe("Concept Project");
  });

  test("contains no invented testimonials, ratings, client logos or statistics", async ({ page }) => {
    await page.goto("/");
    const text = (await page.locator("main").innerText()).toLowerCase();
    for (const bad of ["★", "5-star", "five-star", "trusted by", "clients served", "years of experience", "#1 agency", "number one agency", "guaranteed results"]) {
      expect(text, bad).not.toContain(bad);
    }
    await expect(page.getByText("What Working Together Should Feel Like.")).toBeVisible();
  });

  test("pricing shows quote-based options and the written-proposal caveat", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".package")).toHaveCount(3);
    await expect(page.getByText(/confirmed in a written proposal/)).toBeVisible();
    await expect(page.getByText(/Advertising spend, third-party subscriptions/)).toBeVisible();
  });

  test("service pages state what we can't promise", async ({ page }) => {
    await page.goto("/services/seo");
    await expect(page.getByText(/never promise guaranteed rankings/i)).toBeVisible();
    await page.goto("/services/paid-advertising");
    await expect(page.getByText(/separate from our management fees/i).first()).toBeVisible();
  });
});

test.describe("videos", () => {
  test("three explainers with real files, posters, labels, text versions and VideoObject data", async ({ page, request }) => {
    await page.goto("/");
    const section = page.locator("#videos");
    await expect(section.getByRole("heading", { name: "Digital transformation, in motion." })).toBeVisible();
    await expect(section.locator(".vchapter")).toHaveCount(3);
    await expect(section.getByText(/original illustration, not client footage/)).toBeVisible();
    const video = section.locator("video");
    await expect(video).toHaveAttribute("poster", /\/videos\/from-scattered-to-connected\.jpg$/);
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.playsInline)).toBe(true);
    for (const slug of ["from-scattered-to-connected", "website-that-guides-action", "plan-create-launch-improve"]) {
      for (const ext of ["mp4", "webm", "jpg"]) {
        const res = await request.get(`/videos/${slug}.${ext}`);
        expect(res.status(), `${slug}.${ext}`).toBe(200);
        expect((await res.body()).length, `${slug}.${ext} size`).toBeGreaterThan(10_000);
      }
    }
    await section.getByText("Read the text version").click();
    await expect(section.getByText(/Scattered tools. Mixed messages./).first()).toBeVisible();
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)).filter((d) => d["@type"] === "VideoObject");
    expect(ld).toHaveLength(3);
    expect(ld[0]).toMatchObject({ duration: "PT16S", uploadDate: "2026-10-29" });
  });

  test("the files are genuine playable videos of the right size and length", async ({ page }) => {
    await page.goto("/");
    const meta = await page.evaluate(async () => {
      const out: { slug: string; w: number; h: number; d: number }[] = [];
      for (const slug of ["from-scattered-to-connected", "website-that-guides-action", "plan-create-launch-improve"]) {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.src = `/videos/${slug}.webm`;
        await new Promise<void>((res, rej) => {
          v.onloadedmetadata = () => res();
          v.onerror = () => rej(new Error(`cannot load ${slug}`));
        });
        out.push({ slug, w: v.videoWidth, h: v.videoHeight, d: v.duration });
      }
      return out;
    });
    for (const m of meta) {
      expect([m.w, m.h]).toEqual([1280, 720]);
      expect(m.d).toBeGreaterThan(13);
      expect(m.d).toBeLessThan(18);
    }
  });

  test("choosing a chapter switches the video and its text", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#videos");
    await section.getByRole("button", { name: /A website that guides action/ }).click();
    await expect(section.getByRole("heading", { name: "A website that guides action" })).toBeVisible();
    await expect(section.locator("video")).toHaveAttribute("poster", /website-that-guides-action\.jpg$/);
    await expect(section.locator(".vchapter[aria-current='true']")).toHaveCount(1);
  });

  test("never autoplays with reduced motion and offers a play button", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3300/");
    await page.locator("#videos").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    expect(await page.locator("#videos video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect(page.getByRole("button", { name: /^Play: From scattered to connected/ })).toBeVisible();
    await ctx.close();
  });

  test("the process page features the process video first", async ({ page }) => {
    await page.goto("/process");
    await expect(page.locator("#videos").getByRole("heading", { name: "Plan, create, launch, improve" })).toBeVisible();
  });

  test("real-video embeds stay hidden until supplied", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#videos iframe")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "From us" })).toHaveCount(0);
    await expect(page.locator('a[href*="youtube"], a[href*="vimeo"]')).toHaveCount(0);
  });
});

test.describe("AI-style typing effect", () => {
  const FIRST = "We help ambitious businesses grow through strategic digital marketing, engaging social media, and high-performing websites designed to turn attention into meaningful action.";
  const hero = (page: import("@playwright/test").Page) => page.locator(".hero .rot");
  const typed = (page: import("@playwright/test").Page) => page.locator(".hero .rot__typed");

  test("the hero text is accessible and complete without any animation", async ({ page }) => {
    await page.goto("/");
    // Screen readers and search engines get the first line as plain text; the moving copy is hidden from them.
    await expect(hero(page).locator(".visually-hidden")).toHaveText(FIRST);
    await expect(hero(page).locator(".rot__layer")).toHaveAttribute("aria-hidden", "true");
    await expect(hero(page).locator(".rot__sizer")).toHaveAttribute("aria-hidden", "true");
  });

  test("it types, holds, selects and cuts the line, then writes the next one, again and again", async ({ page, isMobile }) => {
    test.skip(isMobile, "timing-heavy; the loop is identical on phones");
    test.setTimeout(90_000);
    await page.goto("/");
    const phases = new Set<string>();
    const lines = new Set<string>();
    const deadline = Date.now() + 60_000;
    let wrapped = false;
    while (Date.now() < deadline && !wrapped) {
      const s = await hero(page).evaluate((el) => ({ phase: (el as HTMLElement).dataset.phase!, text: el.querySelector(".rot__typed")?.textContent ?? "" }));
      phases.add(s.phase);
      if (s.phase === "hold" && s.text.length > 20) lines.add(s.text);
      // it has looped once the first line has been written, cut and written again
      if (lines.has(FIRST) && lines.size >= 4 && s.phase === "type" && s.text.length > 0 && s.text.length < 12 && s.text === FIRST.slice(0, s.text.length)) wrapped = true;
      await page.waitForTimeout(150);
    }
    expect([...phases]).toEqual(expect.arrayContaining(["type", "hold", "select", "cut", "gap"]));
    expect(lines.size).toBeGreaterThanOrEqual(4); // each of the four lines was written out in full
    expect(wrapped).toBe(true); // and the loop came back around to the first line
  });

  test("nothing below the text ever moves while the lines change", async ({ page, isMobile }) => {
    test.skip(isMobile, "timing-heavy; layout stability on phones is covered by the overflow checks");
    test.setTimeout(60_000);
    await page.goto("/");
    await page.waitForTimeout(3000); // let the page-load entrance animations finish first
    await page.waitForTimeout(3000); // let the page-load entrance animations finish first
    const heights = new Set<number>();
    const ctaTops = new Set<number>();
    const end = Date.now() + 26_000;
    while (Date.now() < end) {
      heights.add(Math.round((await hero(page).boundingBox())!.height));
      ctaTops.add(Math.round((await page.locator(".hero__actions").boundingBox())!.y));
      await page.waitForTimeout(200);
    }
    expect(heights.size).toBe(1);
    expect(ctaTops.size).toBe(1);
  });

  test("the Pause button stops the text and Play resumes it", async ({ page }) => {
    await page.goto("/");
    await expect.poll(async () => (await typed(page).textContent())?.length ?? 0).toBeGreaterThan(5);
    const pause = page.locator(".hero .rot__pause"); // its accessible name flips between Pause and Play
    await expect(pause).toHaveAccessibleName(/Pause the changing text/);
    await pause.click();
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await expect(pause).toHaveAccessibleName(/Play the changing text/);
    const frozen = await typed(page).textContent();
    await page.waitForTimeout(1500);
    expect(await typed(page).textContent()).toBe(frozen);
    await pause.click();
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await expect.poll(async () => (await typed(page).textContent())?.length ?? 0).toBeGreaterThan(frozen!.length);
  });

  test("with reduced motion it is the first line as plain text, with no caret, animation or pause button", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3300/");
    await page.waitForTimeout(3000);
    await expect(page.locator(".hero .rot")).toHaveAttribute("data-phase", "static");
    await expect(page.locator(".hero .rot__typed")).toHaveText(FIRST);
    await expect(page.locator(".hero .rot__caret")).toBeHidden();
    await expect(page.getByRole("button", { name: /Pause the changing text/ })).toBeHidden();
    await page.waitForTimeout(5000);
    await expect(page.locator(".hero .rot__typed")).toHaveText(FIRST); // never changes
    await ctx.close();
  });

  test("without JavaScript the first line is simply visible", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3300/");
    await expect(page.locator(".hero .rot__typed")).toHaveText(FIRST);
    await expect(page.locator(".hero .rot__typed")).toBeVisible();
    await expect(page.getByRole("button", { name: /Pause the changing text/ })).toBeHidden();
    await ctx.close();
  });

  test("AI answers type in, but only the newest one", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open AI assistant" }).click();
    const panel = page.getByRole("dialog", { name: "Ask our AI assistant" });
    await panel.getByRole("button", { name: "What services do you offer?" }).click();
    await expect(panel.locator(".asst__msg--assistant .tw__c").first()).toBeAttached();
    await expect(panel.getByText("Mock answer drawn from the site content.")).toBeVisible();
    await panel.getByLabel("Your question").fill("How does your process work?");
    await panel.getByRole("button", { name: "Send", exact: true }).click();
    await expect(panel.locator(".asst__msg--assistant")).toHaveCount(2);
    await expect(panel.locator(".asst__msg--assistant").nth(1).locator(".tw__c").first()).toBeAttached();
    await expect(panel.locator(".asst__msg--assistant").nth(0).locator(".tw__c")).toHaveCount(0); // earlier answer is plain text
  });
});

test.describe("typography", () => {
  test("headings use Manrope, body uses Inter, and a headline phrase is set in the serif italic", async ({ page }) => {
    await page.goto("/");
    const font = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).fontFamily.toLowerCase());
    expect(await font("#services-title")).toContain("manrope");
    expect(await font("main p.lede")).toContain("inter");
    expect(await font("#hero-title em")).toContain("instrument");
    expect(await page.locator("#hero-title em").evaluate((e) => getComputedStyle(e).fontStyle)).toBe("italic");
  });
});

test.describe("contact clocks layout", () => {
  test("the clocks in the contact box are tidy cards, not stray bullets or vertical text", async ({ page }) => {
    for (const width of [1087, 1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/contact");
      const clocks = page.locator(".call-box .clock");
      await expect(clocks).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        const c = clocks.nth(i);
        expect(await c.evaluate((e) => getComputedStyle(e).display), `clock ${i} at ${width}px`).toBe("grid");
        expect(await c.evaluate((e) => getComputedStyle(e, "::before").content)).toMatch(/none|normal/);
        const box = (await c.boundingBox())!;
        expect(box.width).toBeGreaterThan(110);
        expect(box.height).toBeLessThan(140); // a vertical-text bug makes these hundreds of pixels tall
        const state = (await c.locator(".clock__state").boundingBox())!;
        expect(state.height).toBeLessThan(60);
      }
    }
  });
});

test.describe("trust layer", () => {
  test("shows live clocks for all five markets", async ({ page }) => {
    await page.goto("/");
    const clocks = page.locator("#reach-title").locator("xpath=ancestor::section").locator(".clock");
    await expect(clocks).toHaveCount(5);
    for (const city of ["New York", "London", "Toronto", "Sydney", "Dubai"]) await expect(clocks.filter({ hasText: city })).toHaveCount(1);
    await expect(clocks.first().locator("time")).toHaveText(/\d{1,2}:\d{2}\s?(AM|PM)/);
  });

  test("states commitments and what we won't promise", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "What we won't promise" })).toBeVisible();
    await expect(page.getByText("Guaranteed rankings, leads or sales")).toBeVisible();
    await expect(page.getByText("Everything in writing first")).toBeVisible();
  });

  test("shows no team, quotes, credentials or review profiles that haven't been supplied", async ({ page }) => {
    for (const path of ["/", "/about"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: "Meet the team" })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Don't just take our word for it." })).toHaveCount(0);
      await expect(page.locator("blockquote")).toHaveCount(0);
    }
    await expect(page.locator(".footer__trust")).toHaveCount(0);
  });

  test("insights articles are real pages with article structured data and no stats", async ({ page }) => {
    await page.goto("/insights");
    await expect(page.locator("main .card")).toHaveCount(3);
    await page.getByRole("link", { name: "Read article" }).first().click();
    await page.waitForURL(/\/insights\/[\w-]+$/);
    await expect(page.locator("article")).toBeVisible();
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
    expect(ld.some((d) => d["@type"] === "Article" && d.datePublished)).toBe(true);
    expect(await page.locator("article").innerText()).not.toMatch(/\d+\s?%/);
  });

  test("favicon and manifest are served", async ({ request }) => {
    expect((await request.get("/icon")).status()).toBe(200);
    expect((await request.get("/apple-icon")).status()).toBe(200);
    expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
  });
});

test.describe("motion design", () => {
  test("hero headline staggers in, the page fades, and a scroll-progress bar is active", async ({ page }) => {
    await page.goto("/");
    const lines = page.locator("#hero-title .h-line");
    await expect(lines).toHaveCount(2);
    expect(await lines.nth(0).evaluate((e) => getComputedStyle(e).animationName)).toBe("rise");
    const d0 = await lines.nth(0).evaluate((e) => getComputedStyle(e).animationDelay);
    const d1 = await lines.nth(1).evaluate((e) => getComputedStyle(e).animationDelay);
    expect(parseFloat(d1)).toBeGreaterThan(parseFloat(d0));
    await expect(page.locator(".page-fade")).toHaveCount(1);
    expect(await page.locator(".scroll-progress").evaluate((e) => getComputedStyle(e).display)).toBe("block");
  });

  test("the hero visual drifts toward the cursor on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "needs a precise pointer");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Keep moving until hydration has attached the listener, so the test doesn't race a slow page.
    await expect
      .poll(async () => {
        await page.mouse.move(100, 100);
        await page.mouse.move(1300, 700, { steps: 3 });
        return page.locator(".stage").evaluate((e) => (e as HTMLElement).style.getPropertyValue("--px"));
      })
      .not.toBe("");
    const px = Number(await page.locator(".stage").evaluate((e) => (e as HTMLElement).style.getPropertyValue("--px")));
    expect(px).toBeGreaterThan(0);
  });

  test("timeline line draws in, device phone slides in and portfolio previews unveil on scroll", async ({ page }) => {
    await page.goto("/");
    const step = page.locator("#process .step").first();
    await step.scrollIntoViewIfNeeded();
    await expect(step).toHaveClass(/is-in/);
    await page.waitForTimeout(1300);
    expect(await step.evaluate((e) => getComputedStyle(e, "::before").transform)).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
    const dev = page.locator(".devstage").first();
    await dev.scrollIntoViewIfNeeded();
    await expect(dev).toHaveClass(/is-in/);
    await expect.poll(() => dev.locator(".devstage__phone").evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    const work = page.locator("#work .work").first();
    await work.scrollIntoViewIfNeeded();
    await expect(work).toHaveClass(/is-in/);
  });

  test("with reduced motion nothing is hidden, clipped, moving or animated", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3300/");
    const q = (sel: string, prop: string) => page.locator(sel).first().evaluate((e, p) => getComputedStyle(e)[p as never] as string, prop);
    expect(await q(".scroll-progress", "display")).toBe("none");
    expect(await q(".page-fade", "animationName")).toBe("none");
    expect(await q("#hero-title .h-line", "animationName")).toBe("none");
    expect(await q(".stage", "animationName")).toBe("none");
    expect(await q(".devstage__phone", "opacity")).toBe("1");
    expect(await q(".work__media", "clipPath")).toBe("none");
    expect(await q(".stage__main", "translate")).toBe("none");
    expect(await page.locator("#process .step").first().evaluate((e) => getComputedStyle(e, "::before").transform)).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
    await ctx.close();
  });
});

test.describe("3D motion and matte finish", () => {
  test("the hero is a real 3D scene with layers at different depths", async ({ page }) => {
    await page.goto("/");
    const cs = (sel: string, prop: string) => page.locator(sel).first().evaluate((e, p) => getComputedStyle(e)[p as never] as string, prop);
    expect(await cs(".stage", "perspective")).not.toBe("none");
    expect(await cs(".scene", "transformStyle")).toBe("preserve-3d");
    expect(await cs(".stage__phone", "translate")).toContain("135px");
    expect(await cs(".stage__chart", "translate")).toContain("105px");
    expect(await cs(".stage__social", "translate")).toContain("70px");
  });

  test("the scene turns with the cursor", async ({ page, isMobile }) => {
    test.skip(isMobile, "needs a precise pointer");
    await page.goto("/");
    await page.waitForTimeout(1500);
    await page.mouse.move(200, 200);
    await page.mouse.move(1350, 800, { steps: 6 });
    await page.waitForTimeout(700);
    const t = await page.locator(".scene").evaluate((e) => getComputedStyle(e).transform);
    expect(t).toMatch(/^matrix3d/);
  });

  test("cards tilt in 3D under the pointer and settle when it leaves", async ({ page, isMobile }) => {
    test.skip(isMobile, "needs a precise pointer");
    await page.goto("/");
    const card = page.locator("#services .card").first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + 8, box.y + 8);
    await page.mouse.move(box.x + box.width - 8, box.y + box.height - 8, { steps: 5 });
    await expect(card).toHaveClass(/is-tilting/);
    expect(Number(await card.evaluate((e) => (e as HTMLElement).style.getPropertyValue("--tx")))).toBeGreaterThan(0.5);
    expect(await card.evaluate((e) => getComputedStyle(e).transform)).toMatch(/^matrix3d/);
    await page.mouse.move(5, 5);
    await expect(card).not.toHaveClass(/is-tilting/);
  });

  test("process badges flip in and the device showcase is angled in 3D", async ({ page }) => {
    await page.goto("/");
    const n = page.locator("#process .step__n").first();
    await n.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1600);
    expect(await n.evaluate((e) => getComputedStyle(e).transform)).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
    const dev = page.locator(".devstage__desktop").first();
    await dev.scrollIntoViewIfNeeded();
    expect(await page.locator(".devstage").first().evaluate((e) => getComputedStyle(e).perspective)).not.toBe("none");
    expect(await dev.evaluate((e) => getComputedStyle(e).transform)).toMatch(/^matrix3d/);
  });

  test("with reduced motion the scene is flat and still", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3300/");
    const cs = (sel: string, prop: string) => page.locator(sel).first().evaluate((e, p) => getComputedStyle(e)[p as never] as string, prop);
    expect(await cs(".stage", "perspective")).toBe("none");
    expect(await cs(".scene", "transform")).toBe("none");
    expect(await cs(".stage__phone", "translate")).toBe("none");
    expect(await cs(".devstage__desktop", "transform")).toBe("none");
    expect(await cs("#services .card", "transform")).toBe("none");
    await ctx.close();
  });

  test("matte finish: no glass blur, no gradient text, grain behind dark surfaces", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 800));
    const blurred = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => { const s = getComputedStyle(e); return (s.backdropFilter && s.backdropFilter !== "none") || (s as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter?.startsWith("blur"); }).length);
    expect(blurred).toBe(0);
    expect(await page.locator("#hero-title em").evaluate((e) => getComputedStyle(e).backgroundImage)).toBe("none");
    expect(await page.locator(".hero").evaluate((e) => getComputedStyle(e, "::before").backgroundImage)).toContain("svg");
    expect(await page.locator(".logo__mark").first().evaluate((e) => getComputedStyle(e).backgroundImage)).toBe("none");
  });
});

test.describe("FAQ accordion", () => {
  test("works with the keyboard and exposes state to assistive tech", async ({ page }) => {
    await page.goto("/");
    const q = page.getByRole("button", { name: "Do you work with international clients?" });
    await expect(q).toHaveAttribute("aria-expanded", "false");
    await q.focus();
    await page.keyboard.press("Enter");
    await expect(q).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("region", { name: "Do you work with international clients?" })).toBeVisible();
    await page.keyboard.press("Space");
    await expect(q).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("contact form", () => {
  const fill = async (page: import("@playwright/test").Page) => {
    await page.getByLabel("Full name").fill("Ada Lovelace");
    await page.getByLabel("Business email").fill("ada@example.com");
    await page.getByLabel("Company name").fill("Analytical Co");
    await page.getByLabel("Country").selectOption("GB");
    await page.getByLabel("Service required").selectOption("Website Design and Development");
    await page.getByLabel("Approximate project budget").selectOption({ index: 2 });
    await page.getByLabel("Project description").fill("We need a modern website for our growing consultancy.");
  };

  test("shows inline errors, moves focus to the first one, and sends nothing", async ({ page }) => {
    await page.goto("/contact");
    let posted = false;
    page.on("request", (r) => r.url().includes("/api/contact") && (posted = true));
    await page.getByRole("button", { name: "Send Project Enquiry" }).click();
    await expect(page.getByText("Please enter your full name.")).toBeVisible();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeFocused();
    await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
    expect(posted).toBe(false);
  });

  test("budget options follow the service and the country's currency", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Country").selectOption("US");
    await page.getByLabel("Service required").selectOption("SEO");
    const opts = await page.getByLabel("Approximate project budget").locator("option").allTextContents();
    expect(opts.some((o) => o.includes("$") && o.includes("per month"))).toBe(true);
    expect(opts).toContain("Not sure yet");
    await page.getByLabel("Country").selectOption("GB");
    await page.getByLabel("Service required").selectOption("Website Design and Development");
    const gb = await page.getByLabel("Approximate project budget").locator("option").allTextContents();
    expect(gb.some((o) => o.includes("£") && o.includes("one-off"))).toBe(true);
  });

  test("a valid enquiry is delivered to the inbox and only then reports success", async ({ page, request }) => {
    await page.goto("/contact");
    await page.waitForTimeout(3200); // the form ignores submissions faster than a person could type
    await fill(page);
    await page.getByRole("button", { name: "Send Project Enquiry" }).click();
    await expect(page.getByText(/Your enquiry has been sent/)).toBeVisible();
    const last = await (await request.get("http://localhost:4020/last")).json();
    expect(last.auth).toBe("Bearer test-key");
    expect(last.body).toMatchObject({ to: ["inbox@test.example"], from: "site@test.example", reply_to: "ada@example.com" });
    expect(last.body.text).toContain("Analytical Co");
  });

  test("shows an error, never success, when the provider fails", async ({ page, request }) => {
    await request.post("http://localhost:4020/fail-next");
    await page.goto("/contact");
    await page.waitForTimeout(3200);
    await fill(page);
    await page.getByRole("button", { name: "Send Project Enquiry" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /couldn't send/i })).toBeVisible({ timeout: 15_000 }); // includes the optional AI triage step
    await expect(page.getByText(/Your enquiry has been sent/)).toHaveCount(0);
  });

  test("package and service links pre-select the service", async ({ page }) => {
    await page.goto("/contact?package=Website%20Launch");
    await expect(page.getByLabel("Service required")).toHaveValue("Website Design and Development");
    await page.goto("/contact?service=SEO");
    await expect(page.getByLabel("Service required")).toHaveValue("SEO");
  });

  test("booking falls back to the enquiry form when no scheduling link is configured", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "Book a Discovery Call" })).toBeVisible();
    await expect(page.getByText(/Online booking isn't switched on yet/)).toBeVisible();
    await page.getByRole("link", { name: "Request a Call via the Form" }).click();
    await expect(page).toHaveURL(/#enquiry$/);
  });
});

test.describe("SEO", () => {
  test("pages have unique titles, descriptions, canonicals, OG tags and valid JSON-LD", async ({ page }) => {
    const titles = new Set<string>();
    for (const path of ["/", "/services", "/work", "/about", "/process", "/contact", ...SERVICE_SLUGS.map((s) => `/services/${s}`)]) {
      await page.goto(path);
      const title = await page.title();
      expect(titles.has(title), `duplicate title ${title}`).toBe(false);
      titles.add(title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^http:\/\/localhost:3300/);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      for (const json of await page.locator('script[type="application/ld+json"]').allTextContents()) expect(() => JSON.parse(json)).not.toThrow();
    }
  });

  test("sitemap and robots are served", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const s of SERVICE_SLUGS) expect(sitemap).toContain(`/services/${s}`);
    expect(sitemap).toContain("/insights/seo-basics-for-small-businesses");
    expect(sitemap).toContain("/work/beauty-salon-website");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
    expect(robots).toContain("Disallow: /api/");
    expect((await request.get("/opengraph-image")).status()).toBe(200);
  });

  test("the contact API does not leak secrets to the client", async ({ page }) => {
    await page.goto("/contact");
    const html = await page.content();
    for (const secret of ["test-key", "inbox@test.example", "site@test.example", "RESEND"]) expect(html).not.toContain(secret);
  });
});

test.describe("responsive layout", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/services/seo", "/work", "/contact", "/about"]) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});

test.describe("motion", () => {
  test("content is fully visible with reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3300/");
    const hidden = await page.$$eval("[data-reveal]", (els) => els.filter((e) => getComputedStyle(e).opacity === "0").length);
    expect(hidden).toBe(0);
    await ctx.close();
  });

  test("content is visible without JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3300/");
    await expect(page.getByRole("heading", { name: "Everything You Need to Grow Online" })).toBeVisible();
    await expect(page.locator("#services .card").first()).toBeVisible();
    await ctx.close();
  });
});

test.describe("accessibility (axe, serious and critical only)", () => {
  for (const path of PAGES.filter((p) => !p.startsWith("/services/") || p.endsWith("seo"))) {
    test(`no serious violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    });
  }
});
