/**
 * THE THREE AMOUNTS, in a module no client component imports.
 *
 * Her figures, 29 October 2026, given in chat: "CAD $47 plus taxes, USD $47
 * plus taxes and Euros 47 Euros VAT included."
 *
 * ── WHY THEY SIT IN A FILE OF THEIR OWN ───────────────────────────────────
 *
 * Her standing rule is "Keep any unapproved price placeholder confined to the
 * local preview", and until 29 October that was checked against the exported
 * HTML, where it held. It did not hold of the whole build. Measured on the
 * public export that evening: `CA$`, `US$` and `amount:47` were all present in
 * a published JavaScript chunk, because the module that declared them is
 * imported by components/plan-cards.tsx, which is a client component, and
 * Next 16 does not inline `process.env.NEXT_PUBLIC_*` in a client chunk. It
 * compiles to a runtime read, so `PRICE_PREVIEW ? [...] : []` keeps both
 * branches and the amounts ship either way. A price in a file anyone can fetch
 * is a published price, whether or not a page renders it.
 *
 * So the amounts live here, this file is imported only by the two server
 * components that render the section (app/page.tsx and app/fr/page.tsx), and
 * they reach the card as a prop. On the server `process.env` is the real one,
 * read at build time, so with the preview flag unset the pages hand the card
 * an empty list: no amount reaches the HTML, the React payload inside it, or
 * any chunk. Nothing was published while this was true, and `main` is
 * untouched.
 *
 * ── NO CONVERSION ─────────────────────────────────────────────────────────
 *
 * Her brief: "Use fixed prices for each currency, without live exchange-rate
 * conversion." Each entry is a price charged in that currency, the same rule
 * content/founding-families.ts already follows. Nothing here multiplies
 * anything by a rate, and nothing fetches one.
 *
 * ── STILL UNAPPROVED, AND STILL BEHIND THE FLAG ───────────────────────────
 *
 * "Keep pricing unapproved, all changes unpublished." These are her figures,
 * but she has not released them, so they are gated as the placeholder always
 * was: with the flag unset the paid card shows the shape of the billing and no
 * amount, no currency selector and no placeholder, absent from the HTML rather
 * than hidden with CSS.
 *
 * Two things follow from the numbers that are hers to confirm, not mine to
 * adjust, and both are in docs/pricing-brief-2026-10-28.md:
 *
 *  - CA$47 and US$47 are the same figure, not the same value. At the ratio her
 *    own earlier pricing used, CA$47 is about US$34, so a Canadian parent pays
 *    roughly a quarter less than an American one for the same thing.
 *  - €47 with VAT inside it keeps about €39 at a 20% rate, and EU rates run
 *    from 17% to 27%, so what the business keeps differs by country while the
 *    parent's total stays €47.
 */
import type { CurrencyCode } from "@/components/currency-toggle";
import { PRICE_PREVIEW } from "@/content/app-plans";

export type AppPrice = {
  code: CurrencyCode;
  symbol: string;
  /** null would render "Price to be confirmed"; all three are set. */
  amount: number | null;
  /**
   * Whether the amount already carries tax. The same two words her Founding
   * Families prices use (content/founding-families.ts), and for the reason
   * stated there: "A page must say which, because 'plus applicable taxes'
   * under a euro price would be false." In Stripe her euro price is
   * tax-inclusive and the other two are not, which is what
   * scripts/new-school-and-life-prices.ps1 created in test mode.
   */
  tax: "exclusive" | "inclusive";
};

export const APP_PRICES: AppPrice[] = PRICE_PREVIEW
  ? [
      { code: "CAD", symbol: "CA$", amount: 47, tax: "exclusive" },
      { code: "USD", symbol: "US$", amount: 47, tax: "exclusive" },
      { code: "EUR", symbol: "€", amount: 47, tax: "inclusive" },
    ]
  : [];
