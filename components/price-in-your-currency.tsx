"use client";

import { useEffect, useState } from "react";

/**
 * The membership is priced and billed in US dollars. This line shows a parent
 * roughly what that costs in her own currency before she reaches the Stripe
 * page, which presents USD only and does not label it for a Canadian viewer.
 *
 * Rates refresh in the browser on load. The fallbacks ship with the build so
 * the line always renders a real number, even if both lookups fail.
 */

const PRICE_USD = 597;

const FALLBACK_RATES: Record<string, number> = { CAD: 1.3849, EUR: 0.8573 };

const CURRENCIES: { code: string; symbol: string; locale: string }[] = [
  { code: "CAD", symbol: "CA$", locale: "en-CA" },
  { code: "EUR", symbol: "€", locale: "en-IE" },
];

const SYMBOLS = CURRENCIES.map((c) => c.code).join(",");

type Rates = Record<string, number>;

async function readRates(url: string, signal: AbortSignal): Promise<Rates | null> {
  const response = await fetch(url, { signal });
  if (!response.ok) return null;

  const body: unknown = await response.json();
  const rates = (body as { rates?: Record<string, unknown> })?.rates;
  if (!rates) return null;

  const found: Rates = {};
  for (const { code } of CURRENCIES) {
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

function convert(rate: number, locale: string, symbol: string): string {
  const amount = Math.round(PRICE_USD * rate);
  return `${symbol}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount)}`;
}

export function PriceInYourCurrency({ className }: { className?: string }) {
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);

  useEffect(() => {
    const controller = new AbortController();
    fetchRates(controller.signal).then((live) => {
      if (live) setRates(live);
    });
    return () => controller.abort();
  }, []);

  const amounts = CURRENCIES.map(({ code, symbol, locale }) =>
    convert(rates[code] ?? FALLBACK_RATES[code], locale, symbol),
  );

  return (
    <p className={className}>
      {`About ${amounts.join(" or ")} at today’s rate. You are billed in US dollars. Your bank sets the exchange rate and may add a foreign transaction fee.`}
    </p>
  );
}
