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
  if ((EUROZONE as readonly string[]).includes(c)) return "EUR";
  return "USD";
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
): string {
  if (!currency) return html;
  const open = html.match(/<html\b[^>]*>/i);
  if (!open) return html;
  const cleaned = open[0].replace(
    new RegExp("\\s" + CURRENCY_ATTRIBUTE + '="[^"]*"', "i"),
    "",
  );
  const tag =
    cleaned.slice(0, -1).replace(/\s*\/?$/, "") +
    ` ${CURRENCY_ATTRIBUTE}="${currency}">`;
  return html.replace(open[0], tag);
}
