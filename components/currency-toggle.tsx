"use client";

import type { Locale } from "@/content/i18n";

/**
 * The three currency buttons, in one place.
 *
 * Her brief, 28 October 2026: "Reuse any existing selector rather than creating
 * a duplicate." One already existed, inside components/offer-price.tsx, built
 * for the Founding Families offer on 1 October. That component is not rendered
 * anywhere today (sales paused, 2 October) but it is intact and ready, and the
 * app plans need the same control with a different price under it.
 *
 * So the control moved here and both call it. Two switchers that looked
 * slightly different on the same page would be the duplicate she is asking me
 * not to make, and the one that is currently unused is exactly the one that
 * would have drifted.
 *
 * The styling is lifted unchanged from offer-price.tsx, so the paused offer
 * looks the same as it did if it comes back.
 */

export const CURRENCY_CODES = ["CAD", "USD", "EUR"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

const aria: Record<Locale, (c: string) => string> = {
  en: (c) => `Show prices in ${c}`,
  fr: (c) => `Afficher les prix en ${c}`,
};

export function CurrencyToggle({
  value,
  onChange,
  tone = "dark",
  locale = "en",
  codes = CURRENCY_CODES,
  label,
}: {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  tone?: "dark" | "light";
  locale?: Locale;
  /** Order matters: the caller decides which currency leads. */
  codes?: readonly CurrencyCode[];
  /** Optional visible label, for a selector that is not directly under a price. */
  label?: string;
}) {
  const dark = tone === "dark";

  const button = (active: boolean) =>
    [
      "rounded-[2px] px-[13px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
      active
        ? dark
          ? "bg-parchment text-bark"
          : "bg-bark text-parchment"
        : dark
          ? "border border-charcoal text-muted hover:text-parchment"
          : "border border-border text-smoke hover:text-bark",
    ].join(" ");

  return (
    <div className="flex flex-col items-center">
      {label && (
        <div
          className={`mb-[10px] text-[11px] font-semibold uppercase tracking-[0.2em] ${
            dark ? "text-rose-dark" : "text-rose"
          }`}
        >
          {label}
        </div>
      )}
      {/* A group, so a screen reader hears three related controls rather than
          three loose buttons, and aria-pressed says which one is on. */}
      <div
        role="group"
        aria-label={label || aria[locale]("CAD, USD, EUR")}
        className="flex items-center justify-center gap-2"
      >
        {codes.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={c === value}
            aria-label={aria[locale](c)}
            className={button(c === value)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
