// Renders the animated explainer scenes in ./video-src into real video files in ./public/videos.
//   npm run videos
// Each scene is original, code-drawn motion graphics (no stock footage). Playwright records the page, ffmpeg-static encodes
// H.264 MP4 (plays everywhere) and VP9 WebM (smaller in Chrome/Firefox), and a poster frame is saved for each.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import ffmpeg from "ffmpeg-static";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "videos");
fs.mkdirSync(OUT, { recursive: true });

/** seconds of animation to capture, and when to grab the poster frame */
const SCENES = [
  { file: "scene1-connected.html", name: "from-scattered-to-connected", seconds: 16.2, poster: 13.2 },
  { file: "scene2-website-journey.html", name: "website-that-guides-action", seconds: 14.8, poster: 10.9 },
  { file: "scene3-process-loop.html", name: "plan-create-launch-improve", seconds: 15.4, poster: 12 },
];

const browser = await chromium.launch();
for (const scene of SCENES) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vid-"));
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: tmp, size: { width: 1280, height: 720 } } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto(pathToFileURL(path.join(ROOT, "video-src", scene.file)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200); // let web fonts settle while the scene is paused
  await page.evaluate(() => document.body.classList.remove("hold"));
  const start = Date.now();
  const trim = (start - t0) / 1000;

  await page.waitForTimeout(scene.poster * 1000);
  await page.screenshot({ path: path.join(OUT, `${scene.name}.jpg`), type: "jpeg", quality: 84 });
  await page.waitForTimeout((scene.seconds - scene.poster) * 1000);
  await ctx.close();

  const raw = fs.readdirSync(tmp).find((f) => f.endsWith(".webm"));
  const input = path.join(tmp, raw);
  const common = ["-y", "-hide_banner", "-loglevel", "error", "-ss", trim.toFixed(2), "-t", String(scene.seconds), "-i", input, "-an"];
  execFileSync(ffmpeg, [...common, "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", path.join(OUT, `${scene.name}.mp4`)]);
  execFileSync(ffmpeg, [...common, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-pix_fmt", "yuv420p", "-r", "30", path.join(OUT, `${scene.name}.webm`)]);
  fs.rmSync(tmp, { recursive: true, force: true });
  const kb = (f) => Math.round(fs.statSync(path.join(OUT, f)).size / 1024);
  console.log(`${scene.name}: mp4 ${kb(`${scene.name}.mp4`)} KB, webm ${kb(`${scene.name}.webm`)} KB, poster ${kb(`${scene.name}.jpg`)} KB (trimmed ${trim.toFixed(1)}s intro)`);
}
await browser.close();
