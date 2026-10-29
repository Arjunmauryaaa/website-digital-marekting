import net from "node:net";

export class UrlRejected extends Error {}

/** True for addresses a public website visitor must never be able to make our server contact. */
export function isPrivateIp(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) {
    const [a, b, c] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
      (a === 169 && b === 254) || // link-local, including cloud metadata 169.254.169.254
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && c === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224 // multicast and reserved
    );
  }
  if (v === 6) {
    const x = ip.toLowerCase();
    if (x === "::" || x === "::1") return true;
    if (x.startsWith("fe8") || x.startsWith("fe9") || x.startsWith("fea") || x.startsWith("feb")) return true; // link-local
    if (x.startsWith("fc") || x.startsWith("fd")) return true; // unique local
    if (x.startsWith("ff")) return true; // multicast
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(x); // IPv4-mapped
    if (mapped) return isPrivateIp(mapped[1]);
    return false;
  }
  return true; // not an IP at all: treat as unsafe
}

const BLOCKED_HOST = /(^|\.)(localhost|local|internal|intranet|lan|home|corp|localdomain)$/i;

/**
 * Turns visitor input into a URL we're willing to fetch, or throws UrlRejected with a message that is safe to show.
 * Accepts "example.com" and "https://example.com/page". Allows only http(s) on the default ports, no credentials.
 */
export function normalizeUrl(input: string, allowPrivate = false): URL {
  let raw = input.trim();
  if (!raw) throw new UrlRejected("Please enter your website address.");
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UrlRejected("That doesn't look like a valid website address.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new UrlRejected("Only http and https addresses can be checked.");
  if (url.username || url.password) throw new UrlRejected("Addresses with a username or password can't be checked.");
  if (!allowPrivate) {
    if (url.port && url.port !== "80" && url.port !== "443") throw new UrlRejected("Only standard web ports can be checked.");
    const host = url.hostname.replace(/^\[|\]$/g, "");
    if (BLOCKED_HOST.test(host) || (net.isIP(host) && isPrivateIp(host)) || !host.includes(".") && !net.isIP(host)) {
      throw new UrlRejected("That address can't be checked. Please enter your public website address.");
    }
  }
  url.hash = "";
  return url;
}
