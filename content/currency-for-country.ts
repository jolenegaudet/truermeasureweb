/**
 * Which currency a visitor sees first.
 *
 * Her brief, 29 October 2026: "show those different values depending on the
 * country."
 *
 * ── WHY THIS RUNS IN THE BROWSER ──────────────────────────────────────────
 *
 * The site is a static export (`output: "export"` in next.config.ts), so there
 * is no server at page-request time to look up a country. Two ways round that:
 * a Netlify edge function in front of every page, or a guess made in the
 * browser. This is the second. It costs no infrastructure, makes no request to
 * anyone, and sends nothing about the visitor anywhere: the two values it reads
 * are already in their browser.
 *
 * ── WHY IT IS ONLY A DEFAULT ──────────────────────────────────────────────
 *
 * It is a guess, and it is wrong for a parent on a VPN, travelling, or living
 * outside the country whose language they set. So it only chooses which
 * currency leads; the selector stays on the page and a parent's own choice
 * always wins. A price a visitor cannot correct would be worse than a default.
 */
import type { CurrencyCode } from "@/components/currency-toggle";

/**
 * The euro area. One constant, so adding a member is a one-line change.
 *
 * Twenty members through 2025, plus Bulgaria, which adopted the euro on
 * 1 January 2026. Worth rechecking against the European Commission's list
 * before this goes live, because a country in the wrong list here is shown a
 * currency it cannot be charged in.
 */
export const EUROZONE = [
  "AT", "BE", "BG", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE",
  "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
] as const;

/** Canada is CAD, the euro area is EUR, everywhere else is USD. */
export function currencyForCountry(country: string | null): CurrencyCode | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (c === "CA") return "CAD";
  if ((EUROZONE as readonly string[]).includes(c)) return "EUR";
  return "USD";
}

/**
 * The visitor's country, from the region subtag of the languages their browser
 * reports ("en-CA" gives CA, "fr-FR" gives FR). A plain "fr" or "en" carries no
 * region and is skipped rather than guessed at: French is spoken in Canada and
 * English in Ireland, so a language alone is not a country.
 */
export function countryFromBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const tags = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter(Boolean) as string[];
  for (const tag of tags) {
    // Intl.Locale parses a tag properly where it exists; the regex is the
    // fallback, and both only ever read a two-letter region.
    try {
      const region = new Intl.Locale(tag).region;
      if (region && /^[A-Za-z]{2}$/.test(region)) return region.toUpperCase();
    } catch {
      const m = /^[A-Za-z]{2,3}[-_]([A-Za-z]{2})\b/.exec(tag);
      if (m) return m[1].toUpperCase();
    }
  }
  return null;
}

/**
 * The currency to lead with, or null to keep the page's default. Null is
 * returned whenever the country cannot be read, so a visitor is never shown a
 * currency chosen by a coin toss.
 */
export function detectCurrency(): CurrencyCode | null {
  return currencyForCountry(countryFromBrowser());
}
