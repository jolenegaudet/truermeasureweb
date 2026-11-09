/**
 * Country to currency, and the attribute that shows it: one file, no imports.
 *
 * It has no imports on purpose. Two very different runtimes read it:
 *
 *   - the Next build, which renders the page, and
 *   - netlify/edge-functions/currency.ts, which runs on Deno at Netlify's edge
 *     and is what actually decides the currency for a real visitor.
 *
 * Anything imported here would have to resolve in both. A path alias would not,
 * so there is nothing to resolve.
 *
 * ── WHY THE EDGE DECIDES, AND NOT THE BROWSER ─────────────────────────────
 *
 * Her correction, 29 October 2026: "Reading the region in the browser's
 * language settings does not establish the visitor's current country. Use the
 * existing hosting platform's country-detection capability as the primary
 * source."
 *
 * She is right, and the old approach was a guess dressed as a fact. A parent
 * in France whose laptop is set to en-CA was shown Canadian dollars; a
 * Canadian who sets their browser to en-US was shown American ones. The
 * language a person reads in is not where they are.
 *
 * Netlify resolves the country from the request itself and hands it to an edge
 * function as `context.geo.country.code`. That is the platform capability her
 * brief points at, it costs nothing extra, it asks the visitor for no
 * permission, and no third-party geolocation service is involved.
 *
 * ── HER RULES, ALL FIVE ───────────────────────────────────────────────────
 *
 *   Canada            CAD
 *   United States     USD
 *   The euro area     EUR
 *   Anywhere else     USD
 *   Country unknown   USD   (CAD until 4 November 2026)
 *
 * The last one is not written here: an unknown country returns null, no
 * attribute is set, and the stylesheet's own default shows it. That way a
 * visitor with JavaScript off, a request the edge never saw, and a country
 * Netlify cannot resolve all land on the same answer by the same path.
 *
 * Her rule of 4 November 2026, as she gave it: "Canada détecté → CAD ; zone
 * euro détectée → EUR ; autre pays ou localisation inconnue → USD." The first
 * three lines above already said that. Only the unknown line changed, and it
 * now agrees with the customer app, which also answers USD when the website
 * sends it nothing.
 */

export type CurrencyCode = "CAD" | "USD" | "EUR";

/** The attribute the stylesheet keys on (app/globals.css). */
export const CURRENCY_ATTRIBUTE = "data-tm-currency";

/**
 * What shows when no country is known. Not set as an attribute: see above.
 *
 * USD since 4 November 2026, on her rule of that day: "autre pays ou
 * localisation inconnue → USD", and "coordonne avec WEB pour appliquer USD
 * comme solution de repli, en anglais et en français, si le site utilise
 * encore CAD". It was CAD until then. The reason she gave for changing it is
 * not tidiness: an unplaceable visitor who was shown CAD was being shown the
 * cheapest of the three, which is the same thing she is closing off in the URL.
 */
export const CURRENCY_WHEN_UNKNOWN: CurrencyCode = "USD";

/**
 * The euro area. Twenty members through 2025, plus Bulgaria, which adopted the
 * euro on 1 January 2026. Worth rechecking against the European Commission's
 * list before this goes live, because a country in the wrong list here is
 * shown a currency it cannot be charged in.
 */
export const EUROZONE = [
  "AT", "BE", "BG", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE",
  "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
] as const;

/** Her rules. null means "not known", which the stylesheet turns into CAD. */
export function currencyForCountry(
  country: string | null | undefined,
): CurrencyCode | null {
  if (!country) return null;
  const c = String(country).trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return null;
  if (c === "CA") return "CAD";
  /* THE EURO AREA READS US DOLLARS, by her decision of 9 November 2026. EU
     customers are not served at launch and sign-up refuses them, so quoting a
     euro price to a visitor who would then be stopped at the door is the one
     outcome worth preventing. EUROZONE is kept, not deleted: it is the list
     this rule has to name again when the EU is served, and the Terms still
     carry the withdrawal right she kept the same morning. */
  if ((EUROZONE as readonly string[]).includes(c)) return "USD";
  return "USD";
}

/* -- THE SIGNED STAMP ------------------------------------------------------
 *
 * Her rule of 4 November 2026: "Je ne veux pas qu'un parent puisse choisir un
 * tarif moins cher simplement en modifiant l'URL ou la requete de paiement."
 *
 * `?currency=` is plain text, so anyone could type CAD and read the cheapest
 * of the three. The fix is not to hide the parameter, which cannot be done on
 * a static site, but to let the app tell a currency the website chose from one
 * a visitor typed. The edge function signs the currency it has just decided,
 * the button carries the signature, and the app treats a missing, altered or
 * expired signature as no currency at all, which its own rule turns into USD.
 *
 * The contract, agreed with the app session on 4 November 2026:
 *
 *     cs  = "<exp>.<sig>"
 *     exp = unix seconds, decimal, no leading zeros
 *     sig = base64url, no padding, of
 *           HMAC-SHA256(key, "tm-currency-v1:" + CUR + ":" + exp), CUR upper case
 *
 * The key lives in Netlify's environment, server side, and is read only by the
 * edge function. It is never in a page, never in the client bundle and never in
 * this repository. Nothing here prints it, and scripts/check-launch-build.mjs
 * fails if the attribute or a signature ever reaches an exported page, because
 * an exported page is built once and served to everyone.
 *
 * Seven days, not one. The signature is what stops a parent typing CAD; the
 * expiry only limits how long a leaked signed link circulates. A short window
 * costs something real instead: a parent who opens the page, is interrupted
 * and clicks the next day would send an expired signature, and a Canadian who
 * read CA$47 would be charged US$47, which is more. The app accepts an exp up
 * to eight days ahead, which leaves a day for clock drift.
 */

/** The attribute the edge writes beside the currency, and the parameter it becomes. */
export const SIGNATURE_ATTRIBUTE = "data-tm-cs";
export const SIGNATURE_PARAM = "cs";

/** Version marker inside the signed string, so the format can change later. */
export const SIGNATURE_PREFIX = "tm-currency-v1:";

/** Seven days. See above for why this is not twenty-four hours. */
export const SIGNATURE_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

/** Exactly what gets signed. One place, so the two sides cannot drift. */
export function signaturePayload(
  currency: CurrencyCode | string,
  exp: number | string,
): string {
  return SIGNATURE_PREFIX + String(currency).toUpperCase() + ":" + String(exp);
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * The signature alone. Web Crypto, which both runtimes that read this file
 * have: Deno at Netlify's edge, and Node for the local check.
 */
export async function currencySignature(
  key: string,
  currency: CurrencyCode | string,
  exp: number | string,
): Promise<string> {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    material,
    enc.encode(signaturePayload(currency, exp)),
  );
  return base64url(new Uint8Array(mac));
}

/**
 * The whole stamp, "<exp>.<sig>". `nowSeconds` is injectable so a test can ask
 * for a stamp that expired yesterday without waiting a week.
 */
export async function currencyStamp(
  key: string,
  currency: CurrencyCode | string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<string> {
  const exp = Math.floor(nowSeconds) + SIGNATURE_LIFETIME_SECONDS;
  return exp + "." + (await currencySignature(key, currency, exp));
}

/**
 * Put the attribute on the <html> tag of a page, before the browser sees it.
 *
 * Used by the edge function, and by the local simulator that stands in for it
 * while nothing is deployed (scratchpad/edge-sim.mjs). Keeping the rewrite
 * here, rather than in the edge function, is what lets the simulation run the
 * same code rather than an imitation of it.
 *
 * It replaces any attribute already there, so a page that was built with one
 * cannot contradict the edge.
 */
export function withCurrencyAttribute(
  html: string,
  currency: CurrencyCode | null,
  stamp?: string | null,
): string {
  if (!currency) return html;
  const open = html.match(/<html\b[^>]*>/i);
  if (!open) return html;
  let cleaned = open[0];
  for (const name of [CURRENCY_ATTRIBUTE, SIGNATURE_ATTRIBUTE]) {
    cleaned = cleaned.replace(new RegExp("\s" + name + '="[^"]*"', "i"), "");
  }
  /* The stamp goes on only beside a currency, and only in the shape the
     contract describes. A malformed one would be worse than none: the app
     would read it as "no currency transmitted" and charge USD to a parent
     who is looking at another amount. */
  const signed = stamp && /^[0-9]+\.[A-Za-z0-9_-]+$/.test(stamp) ? stamp : null;
  const tag =
    cleaned.slice(0, -1).replace(/\s*\/?$/, "") +
    ` ${CURRENCY_ATTRIBUTE}="${currency}"` +
    (signed ? ` ${SIGNATURE_ATTRIBUTE}="${signed}"` : "") +
    ">";
  return html.replace(open[0], tag);
}
