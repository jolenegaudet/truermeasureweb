"use client";

import { useEffect, useState } from "react";
import {
  CURRENCY_CODES,
  SegmentedToggle,
  type CurrencyCode,
} from "@/components/currency-toggle";
import {
  CARRIES_CHOICE,
  DEFAULT_CURRENCY,
  DEFAULT_INTERVAL,
  GOES_TO_DEMO,
  PRICE_PREVIEW,
  appPlansFor,
  money,
  monthlyEquivalent,
  planHref,
  yearlyAmount,
  yearlySaving,
  type BillingInterval,
} from "@/content/app-plans";
import type { AppPrice } from "@/content/app-prices";
import type { Locale } from "@/content/i18n";

/**
 * The app offer: School and School & Life, as two cards a parent can act on.
 *
 * ── HER BRIEF OF 29 OCTOBER 2026, AND WHAT IT CHANGED ─────────────────────
 *
 * 1. "Choose the currency automatically. Remove the currency toggle. Parents
 *    must not see buttons, a dropdown or any other control for switching
 *    between CAD, USD and EUR." So the currency selector is gone. The currency
 *    is still decided before the page paints, from the visitor's country, and
 *    CSS shows one of the three amounts that are all in the HTML
 *    (app/globals.css, app/layout.tsx). The monthly/yearly choice stays: it is
 *    a billing decision a parent is allowed to make, not a currency.
 *
 * 2. "Put the price and payment choices at the top of School & Life", grouped:
 *    the plan name, the price, the billing choice, what a subscription covers,
 *    and the button. That group is the first thing in each card now, and the
 *    free card mirrors it, so the two cards scan the same way: name, price,
 *    scope, action. The explanation follows underneath instead of pushing the
 *    button down the page.
 *
 * 3. "ONE SUBSCRIPTION COVERS ONE CHILD", which replaces the per-account
 *    wording. It sits in that top group, beside the price.
 *
 * All copy, both languages, is in content/app-plans.ts with its sources named
 * there. This file is layout.
 *
 * ── WHY THIS IS STILL A CLIENT COMPONENT ──────────────────────────────────
 *
 * Two reasons left: the billing-period choice is state, and the links have to
 * carry the detected currency to the app. The amounts arrive as a prop, never
 * as an import, so no unapproved price reaches a published JavaScript chunk
 * (content/app-prices.ts explains the measurement behind that).
 */

export function PlanCards({
  locale = "en",
  prices = [],
}: {
  locale?: Locale;
  prices?: AppPrice[];
}) {
  const t = appPlansFor(locale);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [interval, setInterval] = useState<BillingInterval>(DEFAULT_INTERVAL);
  const yearly = interval === "year";

  /* Which currency is showing was decided before the browser had the page, by
     Netlify's edge function (netlify/edge-functions/currency.ts), and CSS is
     what shows it. This only catches React's state up, so the links hand the
     app the currency the parent is actually looking at.

     It reads the attribute and nothing else. It used to fall back to guessing
     from the browser's languages, which is exactly what her correction of
     29 October ruled out: no attribute now means CAD, her rule for a country
     that cannot be determined. */
  useEffect(() => {
    const root = document.documentElement;
    /* The attribute, or what the inline script in app/layout.tsx saved before
       React touched the page. The second is the one that matters if hydration
       ever fails: React then re-renders from scratch and drops an attribute it
       never rendered, which would turn a euro price into a Canadian one
       without anybody noticing. Seen while testing, and cheap to defend. */
    const known =
      root.getAttribute("data-tm-currency") ||
      (window as { __TM_CURRENCY?: string | null }).__TM_CURRENCY ||
      null;
    if (known && (CURRENCY_CODES as readonly string[]).includes(known)) {
      if (root.getAttribute("data-tm-currency") !== known) {
        root.setAttribute("data-tm-currency", known);
      }
      setCurrency(known as CurrencyCode);
    }
  }, []);

  /* The billing period is React's alone, unlike the currency, so it is mirrored
     onto the same element for the click-time stamp in app/layout.tsx to read.
     Both parameters then come from one place in the DOM. */
  useEffect(() => {
    document.documentElement.setAttribute("data-tm-interval", interval);
  }, [interval]);

  /* What the plan links hand to the app: the currency the parent is looking at
     and the period selected with it. */
  const carry = { currency, interval };
  const handoff = CARRIES_CHOICE ? { "data-tm-handoff": "1" } : {};
  const showPrices = PRICE_PREVIEW && prices.length > 0;

  return (
    <>
      {/* ---------- Heading ---------- */}
      <div className="mx-auto mb-8 max-w-[560px] text-center">
        <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
          {t.sectionEyebrow}
        </div>
        <h2
          className="font-heading font-medium text-bark"
          style={{ fontSize: "clamp(27px,4.6vw,46px)", lineHeight: 1.08 }}
        >
          {t.sectionHeading}
        </h2>
      </div>

      {/* ---------- The two cards ---------- */}
      {/* items-start, not items-stretch: the free card has less to say, and
          her brief asks for no "large empty areas". Stretching it to the paid
          card's height put about 150px of nothing inside a bordered box. Each
          card is now its own height, and on a phone they stack. */}
      <div className="mx-auto grid max-w-[860px] grid-cols-1 items-start gap-5 md:grid-cols-2">
        {/* School · Free */}
        <div className="flex flex-col rounded-[2px] border border-border bg-ghost px-6 pb-7 pt-7 text-center md:px-7">
          <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-rose">
            {t.free.eyebrow}
          </div>
          <div
            className="font-heading mt-2 text-bark"
            style={{ fontSize: 36, lineHeight: 1.05 }}
          >
            {t.free.price}
          </div>
          <p
            className="mt-[10px] text-smoke"
            style={{ fontSize: 12.5, lineHeight: 1.5 }}
          >
            {t.free.only}
          </p>
          <a
            href={planHref("school", carry)}
            {...handoff}
            {...(GOES_TO_DEMO ? { target: "_blank", rel: "noopener" } : {})}
            className="mt-5 block w-full rounded-[2px] border border-rose bg-transparent px-5 py-[13px] text-[12px] font-bold uppercase tracking-[0.13em] text-bark no-underline"
          >
            {t.free.cta}
          </a>
          {GOES_TO_DEMO && (
            <p
              className="mt-[8px] text-smoke"
              style={{ fontSize: 11, lineHeight: 1.45 }}
            >
              {t.demoNote}
            </p>
          )}

          {/* What it is, under the action rather than above it. */}
          <div className="mt-6 border-t border-border pt-5 text-left">
            <h3
              className="font-heading font-medium text-bark"
              style={{ fontSize: 20, lineHeight: 1.2 }}
            >
              {t.free.heading}
            </h3>
            <Bullets items={t.free.includes} tone="light" />
          </div>
        </div>

        {/* School & Life · Paid */}
        <div
          /* A transparent border so this card has the same box as the free one,
             which has a visible 1px border. */
          className="flex flex-col rounded-[2px] border border-transparent bg-bark px-6 pb-7 pt-7 text-center md:px-7"
          style={{ boxShadow: "0 12px 48px rgba(43,34,32,.18)" }}
        >
          <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-rose-dark">
            {t.paid.eyebrow}
          </div>

          {/* The price, the period, the scope and the button: one group, in
              that order, which is her brief of 29 October. */}
          <div className="mt-2">
            {showPrices ? (
              /* All three currencies are in the HTML and CSS shows exactly one,
                 chosen by the attribute the inline script in app/layout.tsx
                 sets before the page paints. Measured on 29 October: picking
                 after mount instead showed a visitor in France, Germany or the
                 United States CA$47 for about 650ms before it corrected, and a
                 false price is worse than a slow one. */
              prices.map((p) => {
                const amount =
                  p.amount === null
                    ? null
                    : money(p.symbol, yearly ? yearlyAmount(p.amount) : p.amount);
                const tax =
                  p.tax === "inclusive" ? t.taxInclusive : t.taxExclusive;
                return (
                  <div key={p.code} data-tm-price={p.code}>
                    {amount ? (
                      <>
                        <div
                          className="font-heading text-parchment"
                          style={{ fontSize: 36, lineHeight: 1.05 }}
                        >
                          {amount}
                          <span className="ml-2 font-sans text-[13px] text-muted">
                            {yearly ? t.perYear : t.perMonth}
                          </span>
                        </div>
                        <div
                          className="mt-[7px] font-sans text-muted"
                          style={{ fontSize: 11, lineHeight: 1.45 }}
                        >
                          {yearly && p.amount !== null
                            ? t.yearlyNote(
                                money(p.symbol, monthlyEquivalent(p.amount)),
                                money(p.symbol, yearlySaving(p.amount)),
                              ) +
                              " " +
                              tax
                            : tax}
                        </div>
                      </>
                    ) : (
                      <div className="inline-block rounded-[2px] border border-dashed border-rose-dark px-3 py-[6px] text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-dark">
                        {t.priceToBeConfirmed}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* No approved price to show, so the card states the shape of the
                 billing instead of leaving a hole where a price belongs. */
              <div
                className="font-heading text-parchment"
                style={{ fontSize: 20, lineHeight: 1.2 }}
              >
                {t.paid.billing}
              </div>
            )}
          </div>

          {showPrices && (
            <div className="mt-4 flex justify-center">
              <SegmentedToggle<BillingInterval>
                value={interval}
                onChange={setInterval}
                options={[
                  { value: "month", text: t.monthlyWord },
                  { value: "year", text: t.yearlyWord },
                ]}
                tone="dark"
                groupLabel={t.intervalLabel}
              />
            </div>
          )}

          <p
            className="mt-4 text-parchment/70"
            style={{ fontSize: 12.5, lineHeight: 1.5 }}
          >
            {t.covers}
          </p>

          <a
            href={planHref("full", carry)}
            {...handoff}
            {...(GOES_TO_DEMO ? { target: "_blank", rel: "noopener" } : {})}
            /* Transparent border to match the free card's outlined button, so
               the two buttons have identical boxes. */
            className="mt-3 block w-full rounded-[2px] border border-transparent bg-parchment px-5 py-[13px] text-[12px] font-bold uppercase tracking-[0.13em] text-bark no-underline"
          >
            {t.paid.cta}
          </a>
          {GOES_TO_DEMO && (
            <p
              className="mt-[8px] text-parchment/60"
              style={{ fontSize: 11, lineHeight: 1.45 }}
            >
              {t.demoNote}
            </p>
          )}

          <div className="mt-6 border-t border-charcoal pt-5 text-left">
            <h3
              className="font-heading font-medium text-parchment"
              style={{ fontSize: 20, lineHeight: 1.2 }}
            >
              {t.paid.heading}
            </h3>
            <p
              className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-dark"
              style={{ lineHeight: 1.4 }}
            >
              {t.paid.plus}
            </p>
            <Bullets items={t.paid.includes} tone="dark" compact />
            <p
              className="text-parchment/70"
              style={{ fontSize: 12.5, lineHeight: 1.5 }}
            >
              {t.paid.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Her brief of 28 October: name the demo-only previews beside the demo
          links, rather than hinting at them. */}
      {GOES_TO_DEMO && (
        <p
          className="mx-auto mt-4 max-w-[860px] text-center text-smoke"
          style={{ fontSize: 12, lineHeight: 1.55 }}
        >
          {t.demoOnly}
        </p>
      )}

      {/* ---------- The comparison ---------- */}
      <WhatsIncluded t={t} />
    </>
  );
}

/**
 * The short comparison, folded away.
 *
 * Her brief, 29 October 2026: "The expanded section is too long. Make it a
 * short comparison: one brief group for School, one brief group for School &
 * Life, no more than four short bullets per group. Avoid repeating the cards
 * word for word."
 *
 * What was here until today was seven parts with their own sub-lists, about
 * 1,400 words. This is two groups of four lines, then the three facts her
 * earlier brief asked to keep reachable (what a subscription covers, monthly
 * or yearly, cancelling), the reading allowance in two sentences, and one
 * fictional example. Nothing names a feature the customer app withholds from a
 * customer; scripts/check-app-claims.mjs enforces that.
 *
 * Still a native <details>, so it works with JavaScript off, is reachable by
 * keyboard without any code of ours, and announces its own open state.
 */
function WhatsIncluded({ t }: { t: ReturnType<typeof appPlansFor> }) {
  return (
    <details className="group mx-auto mt-8 max-w-[860px] rounded-[2px] border border-border bg-ghost [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-left md:px-7">
        <span
          className="font-heading font-medium text-bark"
          style={{ fontSize: 18, lineHeight: 1.25 }}
        >
          {t.whatsIncluded}
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-[21px] leading-none text-rose transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="border-t border-border px-6 pb-7 pt-6 md:px-7">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-9">
          {[t.compare.free, t.compare.paid].map((group) => (
            <section key={group.title}>
              <h4
                className="font-heading mb-3 font-medium text-bark"
                style={{ fontSize: 17, lineHeight: 1.25 }}
              >
                {group.title}
              </h4>
              <Bullets items={group.items} tone="light" compact />
            </section>
          ))}
        </div>

        {/* The three facts that have to stay reachable, one line each. */}
        <div className="mt-2 flex flex-col gap-[6px] border-l border-warm pl-4 text-dusk">
          <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>{t.covers}</p>
          <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>{t.paid.billing}</p>
          <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>{t.paid.cancel}</p>
        </div>

        {/* The reading allowance, in two sentences rather than four. */}
        <section className="mt-6 rounded-[2px] border border-border bg-linen px-5 py-4">
          <h4
            className="font-heading mb-2 font-medium text-bark"
            style={{ fontSize: 16.5, lineHeight: 1.25 }}
          >
            {t.allowance.title}
          </h4>
          <p className="text-dusk" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            {t.allowance.body}
          </p>
        </section>

        {/* One example, labelled fictional before it is read, not after. */}
        <figure className="mt-6 rounded-[2px] border border-warm bg-blush px-5 py-4">
          <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose">
              {t.example.eyebrow}
            </span>
            <span className="rounded-[2px] bg-bark/85 px-[8px] py-[3px] text-[9.5px] font-bold uppercase tracking-[0.14em] text-parchment">
              {t.example.label}
            </span>
          </figcaption>
          <p
            className="font-heading mb-2 font-medium text-bark"
            style={{ fontSize: 16.5, lineHeight: 1.3 }}
          >
            {t.example.title}
          </p>
          <p className="mb-2 text-dusk" style={{ fontSize: 14, lineHeight: 1.65 }}>
            {t.example.text}
          </p>
          <p
            className="mb-2 border-t border-warm pt-2 text-smoke"
            style={{ fontSize: 12.5, lineHeight: 1.5 }}
          >
            {t.example.rests}
          </p>
          <p className="text-smoke" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            {t.example.note}
          </p>
        </figure>

        <p
          className="mt-6 text-center text-dusk"
          style={{ fontSize: 13.5, lineHeight: 1.6 }}
        >
          {t.choice}
        </p>
        <p
          className="font-heading mx-auto mt-3 max-w-[560px] text-center text-bark"
          style={{ fontSize: "clamp(17px,2.1vw,21px)", lineHeight: 1.35 }}
        >
          {t.close}
        </p>
      </div>
    </details>
  );
}

function Bullets({
  items,
  tone,
  compact = false,
}: {
  items: readonly string[];
  tone: "dark" | "light";
  compact?: boolean;
}) {
  return (
    <ul
      className={`mb-4 mt-3 flex list-none flex-col text-left ${
        compact ? "gap-[6px]" : "gap-[8px]"
      } ${tone === "dark" ? "text-parchment/85" : "text-smoke"}`}
      style={{ fontSize: 14, lineHeight: 1.5 }}
    >
      {items.map((item) => (
        <li key={item} className="relative pl-[17px]">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-[8px] h-[5px] w-[5px] rounded-full ${
              tone === "dark" ? "bg-rose-dark" : "bg-rose"
            }`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
