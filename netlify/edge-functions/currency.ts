/**
 * Which currency a visitor sees, decided by Netlify from the request.
 *
 * Her brief, 29 October 2026: "Use the existing hosting platform's
 * country-detection capability as the primary source… Do not add a paid
 * geolocation service or request access to the visitor's precise location."
 *
 * This is that capability. Netlify resolves the country for every request and
 * gives it to an edge function as `context.geo.country.code`. The function
 * fetches the page the CDN would have served and writes one attribute onto its
 * <html> tag. Nothing is asked of the visitor, no third-party service is
 * called, and no coordinates are involved: a two-letter country code is all
 * that is read, and it is not stored or sent anywhere.
 *
 * The rules and the rewrite both live in content/currency-map.ts, which the
 * page's own code imports too, so the edge and the site cannot drift apart.
 *
 * ── WHY IT REWRITES RATHER THAN REDIRECTS ─────────────────────────────────
 *
 * The site is a static export, and every page already carries all three
 * amounts with CSS showing one (app/globals.css). So the whole decision is a
 * single attribute, set before the browser has the HTML. No redirect, no
 * country in the URL, no second copy of the site, and nothing to flash: the
 * first paint is already the right price.
 *
 * ── WHEN IT DOES NOTHING ──────────────────────────────────────────────────
 *
 * A response that is not HTML, or a country Netlify cannot resolve, is passed
 * through untouched. No attribute means the stylesheet's default, which is
 * USD since 4 November 2026: her rule for an unknown country, and the same
 * thing a visitor with JavaScript off sees.
 *
 * If this function ever fails, the page is still served: the catch returns the
 * original response. A wrong price would be worse than a default one.
 */
import type { Config, Context } from "@netlify/edge-functions";
import {
  currencyForCountry,
  currencyStamp,
  withCurrencyAttribute,
} from "../../content/currency-map.ts";

/**
 * The signing key, from Netlify's environment and nowhere else.
 *
 * Her rule of 4 November 2026: a parent must not be able to choose a cheaper
 * price by editing the address. The edge signs the currency it decided, and
 * the app refuses an unsigned or altered one. See content/currency-map.ts for
 * the contract.
 *
 * WITHOUT THE VARIABLE, EVERYTHING STILL WORKS. No key means no signature,
 * which is exactly today's behaviour: the attribute is written, the button
 * carries a plain currency, and the app treats it as untransmitted. That is
 * deliberate, so this can be deployed before she sets the variable and so a
 * misconfiguration never costs a visitor the page.
 *
 * The value is never logged, never written into the HTML and never returned.
 */
function signingKey(): string | null {
  try {
    const env = (globalThis as { Netlify?: { env?: { get(name: string): string | undefined } } }).Netlify?.env;
    const value = env?.get("TM_CURRENCY_KEY");
    return value && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export default async function currency(
  _request: Request,
  context: Context,
): Promise<Response> {
  const response = await context.next();
  try {
    const type = response.headers.get("content-type") || "";
    if (!type.toLowerCase().includes("text/html")) return response;

    const code = context.geo?.country?.code ?? null;
    const chosen = currencyForCountry(code);
    if (!chosen) return response;

    /* Signed when a key is configured, including the USD fallback: the app can
       then tell a visitor the website placed from one who typed the address,
       instead of both arriving as "no currency". */
    const key = signingKey();
    const stamp = key ? await currencyStamp(key, chosen) : null;

    const html = withCurrencyAttribute(await response.text(), chosen, stamp);
    const headers = new Headers(response.headers);
    // The body changed length, and a stale Content-Length truncates the page.
    headers.delete("content-length");
    // Two visitors in different countries must not share one cached copy.
    headers.set("vary", "x-nf-country");
    /* A signature has an expiry inside it, so a cached copy would hand the
       same stamp to everyone and outlive its own exp. Signed pages are not
       stored. Unsigned ones keep whatever caching they had. */
    if (stamp) headers.set("cache-control", "no-store");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return response;
  }
}

/**
 * Pages only. The static assets under /_next and the images are the bulk of
 * the requests and none of them is HTML, so they are excluded rather than
 * fetched, read and passed through.
 */
export const config: Config = {
  path: "/*",
  excludedPath: [
    "/_next/*",
    "/*.png",
    "/*.jpg",
    "/*.svg",
    "/*.ico",
    "/*.txt",
    "/*.xml",
    "/*.json",
    "/*.css",
    "/*.js",
  ],
};
