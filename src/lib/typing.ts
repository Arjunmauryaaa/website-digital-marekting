/** Shared, deterministic typing rhythm: small per-letter variation and human pauses at punctuation. */
export function charGap(text: string, index: number, perChar: number): number {
  const ch = text[index];
  // deterministic jitter between 0.65x and 1.35x (no randomness, so server and browser always agree)
  const jitter = 0.65 + (Math.abs(Math.sin(index * 12.9898 + text.length * 78.233)) % 1) * 0.7;
  let step = perChar * jitter;
  if (ch === "," || ch === ";" || ch === ":") step += perChar * 4;
  else if (ch === "." || ch === "?" || ch === "!") step += perChar * 10;
  else if (ch === "—" || ch === "–") step += perChar * 5;
  return step;
}

/** How many characters to remove per step while cutting: starts gently, then accelerates like holding Backspace. */
export function cutStep(removed: number): number {
  return removed < 6 ? 1 : removed < 24 ? 2 : removed < 60 ? 4 : 6;
}

/** Time between cutting steps in ms. */
export const CUT_TICK = 16;
