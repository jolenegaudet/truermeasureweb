"use client";

import { useEffect, useState } from "react";

/**
 * The price on the tier 1 card, in the currency the parent picks.
 *
 * The membership is priced and billed in US dollars. A Canadian parent can
 * switch the number on the card to her own currency to see roughly what that
 * costs today, before she reaches the Stripe page, which presents USD only and
 * does not label it for her.
 *
 * Nothing here changes what is charged, and the card must never let a parent
 * believe otherwise. So in every converted state the card still states the real
 * charge, US$597, beside the converted figure. She sees CA$823 on the card and
 * US$597 on her statement, and the card said so before she clicked.
 *
 * USD is the state the server renders, so the page source and every link
 * preview carry the real price. The converted figures only ever appear after a
 * parent asks for them.
 *
 * Rates refresh in the browser on load. The fallbacks ship with the build so a
 * real number always renders, even if both lookups fail.
 */

const PRICE_USD = 597;

const FALLBACK_RATES: Record<string, number> = { CAD: 1.3785, EUR: 0.8562 };

type Currency = {
  code: string;
  label: string;
  symbol: string;
  locale: string;
};

const BILLING: Currency = { code: "USD", label: "USD", symbol: "US$", locale: "en-US" };

const CONVERTED: Currency[] = [
  { code: "CAD", label: "CAD", symbol: "CA$", locale: "en-CA" },
  { code: "EUR", label: "EUR", symbol: "€", locale: "en-IE" },
];

const SYMBOLS = CONVERTED.map((c) => c.code).join(",");

type Rates = Record<string, number>;

async function readRates(url: string, signal: AbortSignal): Promise<Rates | null> {
  const response = await fetch(url, { signal });
  if (!response.ok) return null;

  const body: unknown = await response.json();
  const rates = (body as { rates?: Record<string, unknown> })?.rates;
  if (!rates) return null;

  const found: Rates = {};
  for (const { code } of CONVERTED) {
    const rate = rates[code];
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) return null;
    found[code] = rate;
  }
  return found;
}

async function fetchRates(signal: AbortSignal): Promise<Rates | null> {
  // Two keyless sources, tried in order. Frankfurter is second because it
  // returned 503 during testing while er-api answered; either alone is a
  // single point of failure for a line that states a price.
  const sources = [
    "https://open.er-api.com/v6/latest/USD",
    `https://api.frankfurter.app/latest?base=USD&symbols=${SYMBOLS}`,
  ];

  for (const url of sources) {
    try {
      const rates = await readRates(url, signal);
      if (rates) return rates;
    } catch {
      // Network error or aborted request. Try the next source, then give up
      // and keep the fallback numbers that shipped with the build.
    }
  }
  return null;
}

function money(amount: number, locale: string, symbol: string): string {
  return `${symbol}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
}

export function PriceInYourCurrency() {
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [selected, setSelected] = useState<string>(BILLING.code);

  useEffect(() => {
    const controller = new AbortController();
    fetchRates(controller.signal).then((live) => {
      if (live) setRates(live);
    });
    return () => controller.abort();
  }, []);

  const options = [BILLING, ...CONVERTED];
  const active = options.find((c) => c.code === selected) ?? BILLING;
  const isBilling = active.code === BILLING.code;

  const rate = rates[active.code] ?? FALLBACK_RATES[active.code] ?? 1;
  const billed = money(PRICE_USD, BILLING.locale, BILLING.symbol);

  return (
    <div className="w-full">
      <div
        className="font-heading font-medium text-parchment"
        style={{ fontSize: 52, lineHeight: 1 }}
      >
        {isBilling ? billed : money(PRICE_USD * rate, active.locale, active.symbol)}
      </div>

      <p className="mt-2 text-muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
        {isBilling ? "per year" : "per year, approximately"}
      </p>

      {/* The toggle sits under the number it changes, on the dark card, so the
          connection between the two is not something a parent has to work out. */}
      <div
        role="group"
        aria-label="Show the price in another currency"
        className="mt-4 flex justify-center gap-1.5"
      >
        {options.map((currency) => {
          const on = currency.code === selected;
          return (
            <button
              key={currency.code}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(currency.code)}
              className={[
                "cursor-pointer rounded-[2px] border px-[11px] py-[5px]",
                "text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
                on
                  ? "border-parchment bg-parchment text-bark"
                  : "border-charcoal bg-transparent text-muted hover:border-warm hover:text-parchment",
              ].join(" ")}
            >
              {currency.label}
            </button>
          );
        })}
      </div>

      {/* Nothing is shown for USD: the figure above is already the charge. The
          conversion warning only matters to someone seeing a converted number,
          who reads it here the moment she switches, and again on the Stripe
          checkout page. */}
      {isBilling ? null : (
        <p className="mt-4 text-muted" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          {`You are billed ${billed}. Your bank converts at its own rate on each `}
          {`billing date, 1 USD = ${rate.toFixed(4)} ${active.code} today, and may add a fee.`}
        </p>
      )}
    </div>
  );
}
