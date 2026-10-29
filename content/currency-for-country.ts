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
 * When the edge cannot resolve a country, no attribute is set and CAD shows,
 * which is her rule for an unknown country.
 */
import type { CurrencyCode } from "@/components/currency-toggle";
import {
  CURRENCY_ATTRIBUTE,
  EUROZONE,
  currencyForCountry as mapCountry,
} from "@/content/currency-map";

export { CURRENCY_ATTRIBUTE, EUROZONE };

/** Canada is CAD, the euro area is EUR, everywhere else is USD. */
export function currencyForCountry(country: string | null): CurrencyCode | null {
  return mapCountry(country);
}
