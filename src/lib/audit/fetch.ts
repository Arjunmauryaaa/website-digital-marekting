import "server-only";
import dns from "node:dns";
import net from "node:net";
import { Agent, fetch as undiciFetch } from "undici";
import { isPrivateIp, normalizeUrl, UrlRejected } from "./url";

export type Fetched = {
  finalUrl: URL;
  status: number;
  headers: Record<string, string>;
  html: string;
  bytes: number;
  ms: number;
  redirects: number;
};

const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 4;

/**
 * Fetches a public web page for the audit. Defences against server-side request forgery:
 * - the URL is validated up front (scheme, port, credentials, obvious internal host names),
 * - DNS is checked again at connection time, so a hostname that resolves to a private address (or changes after validation) is refused,
 * - redirects are followed manually and every hop is re-validated,
 * - response size and time are capped, and only HTML is read.
 * `allowPrivate` exists for local tests only and must never be enabled in production.
 */
/** Uses undici's own fetch together with its own Agent: mixing it with Node's built-in fetch fails on version differences. */
export async function fetchPage(input: string, opts: { allowPrivate?: boolean; fetchImpl?: typeof undiciFetch } = {}): Promise<Fetched> {
  const allowPrivate = opts.allowPrivate ?? false;
  let url = normalizeUrl(input, allowPrivate);

  const agent = new Agent({
    connect: {
      lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
          if (err) return callback(err, "", 0);
          const list = addresses as dns.LookupAddress[];
          if (!allowPrivate && list.some((a) => isPrivateIp(a.address))) return callback(new Error("blocked address"), "", 0);
          // Hand the connector only the addresses we vetted. Node asks either for all of them or for just one.
          if ((options as { all?: boolean }).all) (callback as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, list);
          else callback(null, list[0].address, list[0].family);
        });
      },
    },
  });

  const t0 = Date.now();
  let redirects = 0;
  try {
    for (;;) {
      if (!allowPrivate && net.isIP(url.hostname.replace(/^\[|\]$/g, "")) && isPrivateIp(url.hostname.replace(/^\[|\]$/g, ""))) throw new UrlRejected("That address can't be checked.");
      const init = {
        redirect: "manual" as const,
        signal: AbortSignal.timeout(10_000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; WebsiteAuditBot/1.0)", Accept: "text/html,application/xhtml+xml" },
        dispatcher: agent, // undici option honoured by Node's fetch; not in the DOM typings
      };
      const res = await (opts.fetchImpl ?? undiciFetch)(url, init as Parameters<typeof undiciFetch>[1]);
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const loc = res.headers.get("location");
        await res.body?.cancel();
        if (!loc || ++redirects > MAX_REDIRECTS) throw new UrlRejected("That website redirects too many times to check.");
        url = normalizeUrl(new URL(loc, url).toString(), allowPrivate);
        continue;
      }
      const type = res.headers.get("content-type") ?? "";
      if (!/text\/html|application\/xhtml/i.test(type)) {
        await res.body?.cancel();
        throw new UrlRejected("That address doesn't return a web page we can check.");
      }
      const reader = res.body!.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > MAX_BYTES) {
          await reader.cancel();
          break; // analyse what we have: a very large page is itself a finding
        }
        chunks.push(value);
      }
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
      return { finalUrl: url, status: res.status, headers, html: Buffer.concat(chunks).toString("utf8"), bytes, ms: Date.now() - t0, redirects };
    }
  } catch (e) {
    if (e instanceof UrlRejected) throw e;
    const name = (e as Error).name;
    if (name === "TimeoutError" || name === "AbortError") throw new UrlRejected("That website took too long to respond.");
    throw new UrlRejected("We couldn't reach that website. Check the address and try again.");
  } finally {
    void agent.close();
  }
}
