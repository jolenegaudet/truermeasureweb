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
  SHOW_PRICES,
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
 * ── HER BRIEF OF 2 NOVEMBER 2026 ──────────────────────────────────────────
 *
 * The expandable "Compare the two plans" panel that used to sit under the
 * cards is gone: the summary that opened it, the two-column comparison, the
 * repeated subscription and cancellation lines, the reading-allowance box and
 * the fictional example. Two of its lines survive, as a shared block under
 * both cards with no box and no second expandable section. Nothing was written
 * to replace the rest, which the brief rules out, and the disclosures it
 * carried are the app's and checkout's: see the note above `choice` in
 * content/app-plans.ts.
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
  showHeading = true,
}: {
  locale?: Locale;
  prices?: AppPrice[];
  /** False where the page's own title already introduces the offer, so a
      phone does not spend a screen on two headings before the choice. */
  showHeading?: boolean;
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
     29 October ruled out: no attribute now means USD, her rule of 4 November
     for a country that cannot be determined. */
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
  const showPrices = SHOW_PRICES && prices.length > 0;

  return (
    <>
      {/* ---------- Heading ---------- */}
      {showHeading && (
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
      )}

      {/* ---------- The two cards ---------- */}
      {/* Equal heights, her instruction of 1 November. They were each their
          own height from 29 October, to avoid the empty area that stretching
          the shorter card creates; with the box above the cards gone, she
          wants them level again.

          ── FOUR PIECES, NOT TWO CARDS (her brief, 2 November 2026) ────────
          "Show whether the paid price, billing choice and paid registration
          button are visible without scrolling on a typical phone viewport.
          Having them below the entire free card does not satisfy my request…
          adjust the layout so the plan choices, pricing and actions come
          before the longer benefit lists."

          THE PAID CARD IS TWO ELEMENTS: the choice (name, price, billing
          period, what it covers, the button and the demo note) and the
          benefits. The free card is still one. In the markup they run paid
          choice, free card, paid benefits, so on a phone, in one column, both
          choices come before the longer list that explains the paid plan.

          AND THE PAID CHOICE LEADS ON A PHONE, which is what actually meets
          her condition. Measured at 390px on 2 November: with the free choice
          first, the paid button's bottom edge sat at 829px in English and
          870px in French, so it cleared an 844px viewport in one language only
          and neither with a browser's own chrome over it. Leading with it puts
          the price, the billing choice and the button inside the first screen
          of a 667px phone in both languages, without shortening a single line.
          It is the markup order, not a CSS `order`, so what a screen reader
          reads is what the eye sees.

          On a desktop nothing moves. The free card spans both rows in column
          one; the paid card's two pieces take column two, with zero row gap
          and no border or rounding on the edges where they meet, so the column
          reads as the single card she approved. The paid card's shadow is on
          both pieces: the lower one paints after the upper one and covers the
          seam. Because the paid list is no longer inside its card on a phone,
          it repeats the plan's name above it, hidden from md up where the card
          already says it.

          From md up, each piece is placed in its own cell — the choices on
          row 1 and the benefits on row 2, each column keeping its own card —
          so the desktop presentation she has already seen does not change.
          The row gap is zero and the inner edges lose their border and their
          rounding, so a column reads as one card; the grid's own rows are
          what keep the two cards level, which the flex-1 spacer used to do.
          The paid card's shadow is on both of its pieces: the lower one
          paints after the upper one and covers the seam. */}
      <div className="mx-auto grid max-w-[860px] grid-cols-1 items-stretch gap-x-5 gap-y-0 md:grid-cols-2">
        {/* 1. School & Life · Paid — the choice */}
        <div
          /* A transparent border so this card has the same box as the free one,
             which has a visible 1px border. */
          className="mb-5 flex flex-col rounded-[2px] border border-transparent bg-bark px-6 pb-7 pt-7 text-center md:col-start-2 md:row-start-1 md:mb-0 md:rounded-b-none md:px-7 md:pb-0"
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
        </div>

        {/* 2. School · Free — one card, whole, as it has always been.
            Only the paid card is split. The free card spans both rows, so its
            own flex-1 below still decides where its spare height goes: under
            the list, which is her instruction of 1 November, and not between
            the button and the rule. Splitting this one too put the gap in
            exactly the place she had moved it away from. */}
        <div className="mb-8 flex flex-col rounded-[2px] border border-border bg-ghost px-6 pb-7 pt-7 text-center md:col-start-1 md:row-span-2 md:row-start-1 md:mb-0 md:px-7">
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
          <div className="mt-6 flex-1 border-t border-border pt-5 text-left">
            <h3
              className="font-heading font-medium text-bark"
              style={{ fontSize: 20, lineHeight: 1.2 }}
            >
              {t.free.heading}
            </h3>
            <Bullets items={t.free.includes} tone="light" />
          </div>
        </div>

        {/* 3. School & Life — what it is. */}
        <div
          className="flex flex-col rounded-[2px] border border-transparent bg-bark px-6 pb-7 pt-7 text-left md:col-start-2 md:row-start-2 md:rounded-t-none md:px-7 md:pt-0"
          style={{ boxShadow: "0 12px 48px rgba(43,34,32,.18)" }}
        >
          <div className="md:mt-6 md:border-t md:border-charcoal md:pt-5">
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-rose-dark md:hidden">
              {t.paid.eyebrow}
            </div>
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

      {/* ---------- Her two closing lines ---------- */}
      {/* Her brief of 2 November: these two lines, "displayed once as a shared
          block directly beneath the School and School & Life cards… clean
          spacing and readable text, without a surrounding box or another
          expandable section." So: no border, no background, no <details>, and
          one block for both cards rather than one under each. They keep the
          sizes they had inside the panel that came off, which is the only part
          of it that survives. */}
      <div className="mx-auto mt-10 max-w-[680px] text-center">
        <p
          className="text-balance text-dusk"
          style={{ fontSize: 14.5, lineHeight: 1.65 }}
        >
          {t.choice}
        </p>
        {/* Balanced wrapping, so neither language ends on a one-word line. */}
        <p
          className="font-heading mt-4 text-balance text-bark"
          style={{ fontSize: "clamp(17px,2.1vw,21px)", lineHeight: 1.35 }}
        >
          {t.close}
        </p>
      </div>
    </>
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
