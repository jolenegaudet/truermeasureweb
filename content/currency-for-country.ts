/**
 * The currency rules, for the site's own code.
 *
 * The rules themselves, and the attribute they set, are in
 * content/currency-map.ts, which has no imports because Netlify's edge
 * function reads it too (netlify/edge-functions/currency.ts). This file exists
 * so the rest of the site can keep importing one familiar name, and so the
 * site's `CurrencyCode` and the map's stay the same type.
 *
 * ── WHAT WAS REMOVED HERE, AND WHY ────────────────────────────────────────
 *
 * Until 29 October 2026 this file guessed the visitor's country from the
 * region subtag of their browser's languages: `countryFromBrowser()` and
 * `detectCurrency()`. Her correction that evening: "Reading the region in the
 * browser's language settings does not establish the visitor's current
 * country. Use the existing hosting platform's country-detection capability as
 * the primary source."
 *
 * So both functions are gone rather than kept as a fallback, because a
 * fallback would quietly reintroduce the thing she ruled out: a Canadian
 * parent whose browser is set to en-US would be shown American dollars again.
 *
 * When the edge cannot resolve a country, no attribute is set and US DOLLARS
 * show. This paragraph said CAD until 9 November 2026 and was wrong about the
 * code it sits beside: app/globals.css line 45 is
 * `html:not([data-tm-currency]) [data-tm-price="USD"]`, and her own rule is
 * "US dollars when the location cannot be determined". The CSS was right and
 * the comment was not.
 */
import type { CurrencyCode } from "@/components/currency-toggle";
import {
  CURRENCY_ATTRIBUTE,
  EUROZONE,
  currencyForCountry as mapCountry,
} from "@/content/currency-map";

export { CURRENCY_ATTRIBUTE, EUROZONE };

/** Canada is CAD, everywhere else is USD. The euro area joined "everywhere
 *  else" on 9 November 2026: see content/currency-map.ts. */
export function currencyForCountry(country: string | null): CurrencyCode | null {
  return mapCountry(country);
}
