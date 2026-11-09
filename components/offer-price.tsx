"use client";

import { useState } from "react";
import { INTRO_MONTHS, prices, type Price } from "@/content/founding-families";
import { CurrencyToggle, type CurrencyCode } from "@/components/currency-toggle";
import type { Locale } from "@/content/i18n";

/**
 * One price, and three buttons under it to change the currency.
 *
 * Jolene, 1 October 2026: show the US price, with USD / CAD / EUR buttons
 * below it, the way the card worked before the three prices were stacked.
 *
 * Nothing here converts anything. Each of the three is a real price charged in
 * that currency (content/founding-families.ts), so switching currency shows a
 * different real price rather than an estimate that could be out by the time
 * the parent reaches Stripe.
 *
 * USD is rendered on the server and is the default, so the first paint and the
 * hydrated paint agree. No currency is guessed from the browser: a guess that
 * lands wrong changes the price a parent sees with no explanation.
 *
 * 28 October 2026: the three buttons moved to components/currency-toggle.tsx so
 * the app plan cards could use the same control instead of a second one that
 * looked almost like it. The order and the default here are unchanged.
 */

const CODES: CurrencyCode[] = ["USD", "CAD", "EUR"];

/**
 * The tax sentence follows the currency, not the language. In Stripe the euro
 * price has VAT inside it and the other two are quoted before tax, so "plus
 * applicable taxes" under a euro price would be a false statement about what
 * the parent is charged.
 */
const copy = {
  en: {
    first: (n: number) => `Your first ${n} months`,
    per: "/ month",
    then: (amount: string, tax: Price["tax"]) =>
      tax === "inclusive"
        ? `Then ${amount} per month, VAT included.`
        : `Then ${amount} per month, plus applicable taxes.`,
  },
  fr: {
    first: (n: number) => `Vos ${n} premiers mois`,
    per: "/ mois",
    then: (amount: string, tax: Price["tax"]) =>
      tax === "inclusive"
        ? `Ensuite ${amount} par mois, TVA incluse.`
        : `Ensuite ${amount} par mois, plus les taxes applicables.`,
  },
} as const;

export function OfferPrice({
  tone = "dark",
  showStandard = false,
  locale = "en",
}: {
  tone?: "dark" | "light";
  showStandard?: boolean;
  locale?: Locale;
}) {
  const t = copy[locale];
  const [code, setCode] = useState<Price["code"]>("USD");
  const price = prices.find((p) => p.code === code) ?? prices[1];

  const dark = tone === "dark";
  const main = dark ? "text-parchment" : "text-bark";
  const quiet = dark ? "text-muted" : "text-smoke";
  const eyebrow = dark ? "text-rose-dark" : "text-rose";

  return (
    <div>
      <div
        className={
          "mb-5 text-[11.5px] font-semibold uppercase tracking-[0.22em] " + eyebrow
        }
      >
        {t.first(INTRO_MONTHS)}
      </div>

      <div
        className={"font-heading " + main}
        style={{ fontSize: "clamp(34px,4.6vw,46px)", lineHeight: 1.1 }}
      >
        {price.symbol}
        {price.intro}
        <span className={"ml-2 font-sans text-[14px] " + quiet}>{t.per}</span>
      </div>

      {/* The buttons sit directly under the price, because they change it. */}
      <div className="mt-4">
        <CurrencyToggle
          value={code}
          onChange={setCode}
          tone={tone}
          locale={locale}
          codes={CODES}
        />
      </div>

      {/* The standing price has to follow the chosen currency. Leaving all
          three here under a single-currency headline reads as a contradiction. */}
      {showStandard ? (
        <p className={"mt-5 " + quiet} style={{ fontSize: 13, lineHeight: 1.7 }}>
          {t.then(`${price.symbol}${price.standard}`, price.tax)}
        </p>
      ) : null}
    </div>
  );
}
