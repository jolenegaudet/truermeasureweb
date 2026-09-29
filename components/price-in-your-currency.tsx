"use client";

import { useEffect, useState } from "react";

/**
 * A price, in the currency the parent picks.
 *
 * The membership is priced and billed in US dollars. A Canadian parent can
 * switch the number to her own currency to see roughly what that costs today,
 * before she reaches a checkout page, which presents USD only and does not
 * label it for her.
 *
 * Nothing here changes what is charged, and the price must never let a parent
 * believe otherwise. So in every converted state it still states the real
 * charge beside the converted figure. She sees CA$110 and US$79 on her
 * statement, and this said so before she clicked.
 *
 * USD is the state the server renders, so the page source and every link
 * preview carry the real price. Converted figures only ever appear after a
 * parent asks for them.
 *
 * Rates refresh in the browser on load. The fallbacks ship with the build so a
 * real number always renders, even if both lookups fail.
 */

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

/**
 * Which currency to open in.
 *
 * The buttons are always there and always all three. This only decides which
 * one is already pressed when a parent arrives, so a Canadian is not doing
 * arithmetic in her head before she has decided anything.
 *
 * Timezone is checked before language because it is the better signal for the
 * case that matters most here: a Canadian whose browser is set to en-US, which
 * is extremely common. Language region is the fallback, and USD is the answer
 * whenever neither is conclusive.
 *
 * This runs in the browser only. The server renders USD, so the page source,
 * search results and link previews always carry the real billing currency.
 */

const CANADA_TZ = new Set([
  "America/St_Johns", "America/Halifax", "America/Glace_Bay", "America/Moncton",
  "America/Goose_Bay", "America/Toronto", "America/Montreal", "America/Nipigon",
  "America/Thunder_Bay", "America/Iqaluit", "America/Pangnirtung",
  "America/Winnipeg", "America/Rainy_River", "America/Rankin_Inlet",
  "America/Resolute", "America/Regina", "America/Swift_Current",
  "America/Edmonton", "America/Cambridge_Bay", "America/Yellowknife",
  "America/Inuvik", "America/Creston", "America/Dawson_Creek",
  "America/Fort_Nelson", "America/Vancouver", "America/Whitehorse",
  "America/Dawson", "America/Atikokan", "America/Blanc-Sablon",
]);

const EURO_REGIONS = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV",
  "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

function guessCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && CANADA_TZ.has(tz)) return "CAD";
  } catch {
    // Intl is missing or the timezone is unavailable. Fall through to language.
  }

  try {
    const tags = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    for (const tag of tags) {
      if (!tag) continue;
      const region = new Intl.Locale(tag).region;
      if (!region) continue;
      if (region === "CA") return "CAD";
      if (EURO_REGIONS.has(region)) return "EUR";
      if (region === "US") return "USD";
    }
  } catch {
    // Intl.Locale is unsupported, or the language tag is malformed.
  }

  return BILLING.code;
}

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

type Tone = "dark" | "light";

const TONE = {
  dark: {
    price: "text-parchment",
    unit: "text-muted",
    note: "text-muted",
    on: "border-parchment bg-parchment text-bark",
    off: "border-charcoal bg-transparent text-muted hover:border-warm hover:text-parchment",
  },
  light: {
    price: "text-bark",
    unit: "text-smoke",
    note: "text-smoke",
    on: "border-bark bg-bark text-parchment",
    off: "border-border bg-transparent text-dusk hover:border-rose hover:text-bark",
  },
} satisfies Record<Tone, Record<string, string>>;

export function PriceInYourCurrency({
  amountUSD,
  unit,
  thenUSD,
  thenUnit,
  tone = "dark",
}: {
  amountUSD: number;
  /** What the amount buys, e.g. "per month". */
  unit: string;
  /** The standing price the headline steps up to, if it does. */
  thenUSD?: number;
  /** How to describe that step up, e.g. "a month after that". */
  thenUnit?: string;
  tone?: Tone;
}) {
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [selected, setSelected] = useState<string>(BILLING.code);
  // Once a parent presses a button, that is the answer. Detection never
  // overrides a choice someone has actually made.
  const [chosen, setChosen] = useState(false);
  const skin = TONE[tone];

  useEffect(() => {
    if (!chosen) setSelected(guessCurrency());
    // Runs once. `chosen` is read, not depended on: re-running this after a
    // click is exactly what must not happen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const billed = money(amountUSD, BILLING.locale, BILLING.symbol);

  const show = (usd: number) =>
    isBilling
      ? money(usd, BILLING.locale, BILLING.symbol)
      : money(usd * rate, active.locale, active.symbol);

  return (
    <div className="w-full">
      <div
        className={`font-heading font-medium ${skin.price}`}
        style={{ fontSize: 52, lineHeight: 1 }}
      >
        {show(amountUSD)}
      </div>

      <p className={`mt-2 ${skin.unit}`} style={{ fontSize: 13, lineHeight: 1.7 }}>
        {isBilling ? unit : `${unit}, approximately`}
      </p>

      {/* The step up is part of the price, not small print, so it moves with
          the currency buttons like the headline figure does. */}
      {thenUSD === undefined ? null : (
        <p className={`mt-2 ${skin.unit}`} style={{ fontSize: 13, lineHeight: 1.7 }}>
          {`then ${show(thenUSD)} ${thenUnit ?? "after that"}`}
        </p>
      )}

      {/* The toggle sits under the number it changes, so the connection between
          the two is not something a parent has to work out. */}
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
              onClick={() => {
                setChosen(true);
                setSelected(currency.code);
              }}
              className={[
                "cursor-pointer rounded-[2px] border px-[11px] py-[5px]",
                "text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
                on ? skin.on : skin.off,
              ].join(" ")}
            >
              {currency.label}
            </button>
          );
        })}
      </div>

      {/* Nothing is shown for USD: the figure above is already the charge. The
          conversion warning only matters to someone seeing a converted number,
          who reads it here the moment she switches, and again at checkout. */}
      {isBilling ? null : (
        <p className={`mt-4 ${skin.note}`} style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          {`You are billed ${billed}`}
          {thenUSD === undefined
            ? ""
            : `, then ${money(thenUSD, BILLING.locale, BILLING.symbol)}`}
          {`. Your bank converts at its own rate on each billing date, `}
          {`1 USD = ${rate.toFixed(4)} ${active.code} today, and may add a fee.`}
        </p>
      )}
    </div>
  );
}
