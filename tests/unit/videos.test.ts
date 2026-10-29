import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { embeds, explainers, fmtDuration, isoDuration, safeEmbedId } from "@/content/videos";

describe("video content", () => {
  it("every explainer has its files on disk", () => {
    for (const v of explainers) for (const ext of ["mp4", "webm", "jpg"]) expect(fs.existsSync(path.join(process.cwd(), "public", "videos", `${v.slug}.${ext}`)), `${v.slug}.${ext}`).toBe(true);
  });

  it("every explainer has a text alternative", () => {
    for (const v of explainers) expect(v.transcript.length).toBeGreaterThanOrEqual(3);
  });

  it("formats durations", () => {
    expect(fmtDuration(16)).toBe("0:16");
    expect(fmtDuration(5)).toBe("0:05");
    expect(isoDuration(15)).toBe("PT15S");
  });

  it("ships with no embedded third-party videos", () => {
    expect(embeds).toEqual([]);
  });

  it("only accepts well-formed embed IDs, so nothing can be injected into the iframe URL", () => {
    const yt = { provider: "youtube" as const, title: "t", description: "d" };
    expect(safeEmbedId({ ...yt, id: "dQw4w9WgXcQ" })).toBe(true);
    expect(safeEmbedId({ ...yt, id: 'x"onload="alert(1)' })).toBe(false);
    expect(safeEmbedId({ ...yt, id: "a/../b" })).toBe(false);
    expect(safeEmbedId({ provider: "vimeo", id: "76979871", title: "t", description: "d" })).toBe(true);
    expect(safeEmbedId({ provider: "vimeo", id: "12abc", title: "t", description: "d" })).toBe(false);
  });
});
