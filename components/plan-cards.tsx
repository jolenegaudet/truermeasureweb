"use client";

import { useEffect, useState } from "react";
import { FirstToKnowButton } from "@/components/first-to-know";
import {
  CURRENCY_CODES,
  CurrencyToggle,
  SegmentedToggle,
  type CurrencyCode,
} from "@/components/currency-toggle";
import {
  APP_CURRENCY_ORDER,
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
import { detectCurrency } from "@/content/currency-for-country";
import type { AppPrice } from "@/content/app-prices";
import type { Locale } from "@/content/i18n";

/**
 * The app offer: School and School & Life, as two cards a parent can act on.
 *
 * Her brief of 28 October 2026 (third): "The page's purpose is to get parents
 * to register. Keep it clean, readable and easy to act on." So the cards carry
 * a plan name, a price, a headline, a short list, one supporting line and a
 * button, and nothing else. Everything they used to carry is in the
 * "What's included" section underneath, which opens on a tap.
 *
 * All copy, both languages, is in content/app-plans.ts with its sources named
 * there. This file is layout.
 *
 * ── WHY THIS IS A CLIENT COMPONENT ────────────────────────────────────────
 *
 * The currency selector sits above the cards and changes a price inside one of
 * them: one piece of state spanning two parts of the section, so the section
 * owns it. Everything else here is static text.
 *
 * ── WHERE THE BUTTONS GO ──────────────────────────────────────────────────
 *
 * planHref() in content/app-plans.ts, which answers the demo until the
 * production app exists. That file holds the evidence and the list of what
 * remains to connect. Nothing here hardcodes a destination.
 *
 * ── BUTTON ALIGNMENT ──────────────────────────────────────────────────────
 *
 * Her brief: "Align the buttons on desktop." The free card has two bullets and
 * the paid card five, so the cards would end at different heights. The grid is
 * items-stretch and each card pushes its button down with flex-1, which puts
 * both buttons on the same baseline whatever the lists do.
 */

/**
 * `prices` is a prop rather than an import because the amounts may not reach a
 * client chunk while they are unapproved: content/app-prices.ts explains the
 * measurement behind that. The page passes them, and passes an empty list in
 * any build without the preview flag.
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

  /* Which currency is showing was decided before the page painted, by the
     inline script in app/layout.tsx, and CSS is what shows it. This only
     catches the state up so the selector's aria-pressed marks the right
     button, and covers the case where the script did not run. */
  useEffect(() => {
    const set = document.documentElement.getAttribute("data-tm-currency");
    if (set && (CURRENCY_CODES as readonly string[]).includes(set)) {
      setCurrency(set as CurrencyCode);
      return;
    }
    const detected = detectCurrency();
    if (detected) {
      document.documentElement.setAttribute("data-tm-currency", detected);
      setCurrency(detected);
    }
  }, []);

  /* A parent's own choice wins, and it is the attribute that does the showing,
     so this sets both. */
  const pick = (code: CurrencyCode) => {
    document.documentElement.setAttribute("data-tm-currency", code);
    setCurrency(code);
  };

  /* The billing period is React's alone, unlike the currency, so it is mirrored
     onto the same element for the click-time stamp in app/layout.tsx to read.
     Both parameters then come from one place in the DOM. */
  useEffect(() => {
    document.documentElement.setAttribute("data-tm-interval", interval);
  }, [interval]);

  /* What the plan links hand to the app: the currency the parent is looking at
     and the period selected with it. Server-rendered with the defaults, which
     is what the first client render uses too, so there is nothing for hydration
     to disagree about; the effect above corrects it once the real choice is
     known, and a click before that is covered by the stamp in the layout. */
  const carry = { currency, interval };
  const handoff = CARRIES_CHOICE ? { "data-tm-handoff": "1" } : {};

  /* Both conditions, not just the flag: a preview build that was handed no
     amounts shows the billing shape rather than an empty space where a price
     belongs. */
  const showPrices = PRICE_PREVIEW && prices.length > 0;

  return (
    <>
      {/* ---------- Heading ---------- */}
      <div className="mx-auto mb-8 max-w-[560px] text-center">
        <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
          {t.sectionEyebrow}
        </div>
        <h2
          className="font-heading mb-[18px] font-medium text-bark"
          style={{ fontSize: "clamp(28px,5vw,52px)", lineHeight: 1.08 }}
        >
          {t.sectionHeading}
        </h2>
        <p className="text-smoke" style={{ fontSize: 17, lineHeight: 1.7 }}>
          {t.sectionIntro}
        </p>
      </div>

      {/* Availability, and the one action a parent can complete today. The Kit
          signup used to sit inside the paid card; it moved here so the card
          could be the single clear choice her brief asks for, and so the
          working form is not lost. */}
      <div className="mx-auto mb-9 flex max-w-[680px] flex-col items-center gap-4 rounded-[2px] border border-border bg-linen px-5 py-5 text-center">
        <p className="text-dusk" style={{ fontSize: 14.5, lineHeight: 1.6 }}>
          {t.availability}
        </p>
        <FirstToKnowButton
          locale={locale}
          place="home-card"
          className="inline-block cursor-pointer rounded-[2px] border border-rose bg-transparent px-6 py-[11px] text-[11.5px] font-bold uppercase tracking-[0.13em] text-bark"
        />
      </div>

      {/* The currency selector, directly above the plans, as her brief asks.
          Preview only: with NEXT_PUBLIC_TM_PRICE_PREVIEW unset this and every
          amount are absent from the HTML, not hidden with CSS. */}
      {showPrices && (
        <div className="mb-8 flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-start sm:gap-10">
          <CurrencyToggle
            value={currency}
            onChange={pick}
            tone="light"
            locale={locale}
            codes={APP_CURRENCY_ORDER}
            label={t.currencyLabel}
          />
          <SegmentedToggle<BillingInterval>
            value={interval}
            onChange={setInterval}
            options={[
              { value: "month", text: t.monthlyWord },
              { value: "year", text: t.yearlyWord },
            ]}
            tone="light"
            groupLabel={t.intervalLabel}
            label={t.intervalLabel}
          />
        </div>
      )}

      {/* ---------- The two cards ---------- */}
      <div className="mx-auto grid max-w-[900px] grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6">
        {/* School · Free */}
        <div className="flex flex-col rounded-[2px] border border-border bg-ghost px-6 pb-8 pt-9 text-center md:px-8">
          <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-rose">
            {t.free.eyebrow}
          </div>
          <div
            className="font-heading mt-3 text-bark"
            style={{ fontSize: 38, lineHeight: 1.05 }}
          >
            {t.freePrice}
          </div>
          <h3
            className="font-heading mt-6 font-medium text-bark"
            style={{ fontSize: 23, lineHeight: 1.2 }}
          >
            {t.free.heading}
          </h3>
          <Bullets items={t.free.includes} tone="light" />
          <p className="text-smoke" style={{ fontSize: 13, lineHeight: 1.55 }}>
            {t.free.only}
          </p>
          <div className="flex-1" />
          <a
            href={planHref("school", carry)}
            {...handoff}
            {...(GOES_TO_DEMO ? { target: "_blank", rel: "noopener" } : {})}
            className="mt-7 block w-full rounded-[2px] border border-rose bg-transparent px-5 py-[15px] text-[12.5px] font-bold uppercase tracking-[0.13em] text-bark no-underline"
          >
            {t.free.cta}
          </a>
          {GOES_TO_DEMO && (
            <p
              className="mt-[10px] text-smoke"
              style={{ fontSize: 11.5, lineHeight: 1.5 }}
            >
              {t.demoNote}
            </p>
          )}
        </div>

        {/* School & Life · Paid */}
        <div
          /* A transparent border so this card has the same box as the free one,
             which has a visible 1px border. Without it the two cards differ by
             2px and the buttons sit on slightly different baselines. */
          className="flex flex-col rounded-[2px] border border-transparent bg-bark px-6 pb-8 pt-9 text-center md:px-8"
          style={{ boxShadow: "0 12px 48px rgba(43,34,32,.18)" }}
        >
          <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-rose-dark">
            {t.paid.eyebrow}
          </div>
          <div className="mt-3">
            {showPrices ? (
              /* All three currencies are in the HTML and CSS shows exactly one,
                 chosen by the attribute the inline script in app/layout.tsx
                 sets before the page paints.
                 Measured on the production export, 29 October 2026: with the
                 currency picked after mount instead, a visitor in France,
                 Germany or the United States saw CA$47 for about 650ms before
                 it corrected. That is a false price on screen, not a flash, and
                 the figure a parent reads has to be the figure they are
                 charged. Rendering every variant also means the markup is the
                 same for everyone, so there is nothing for hydration to
                 disagree with. */
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
                      <div
                        className="font-heading text-parchment"
                        style={{ fontSize: 38, lineHeight: 1.05 }}
                      >
                        {amount}
                        <span className="ml-2 font-sans text-[13.5px] text-muted">
                          {yearly ? t.perYear : t.perMonth}
                        </span>
                        {/* Whether tax is on top or already inside, per
                            currency, and for a yearly price what it comes to
                            each month. Both sit with the amount because both
                            are part of it. */}
                        <div
                          className="mt-[10px] font-sans text-muted"
                          style={{ fontSize: 11.5, lineHeight: 1.5 }}
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
                      </div>
                    ) : (
                      <div className="inline-block rounded-[2px] border border-dashed border-rose-dark px-3 py-[7px] text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-dark">
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
                style={{ fontSize: 21, lineHeight: 1.2 }}
              >
                {t.paid.billing}
              </div>
            )}
          </div>
          <h3
            className="font-heading mt-6 font-medium text-parchment"
            style={{ fontSize: 23, lineHeight: 1.2 }}
          >
            {t.paid.heading}
          </h3>
          <p
            className="mt-5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-rose-dark"
            style={{ lineHeight: 1.4 }}
          >
            {t.paid.plus}
          </p>
          <Bullets items={t.paid.includes} tone="dark" compact />
          <p
            className="text-parchment/70"
            style={{ fontSize: 13, lineHeight: 1.55 }}
          >
            {t.paid.tagline}
          </p>
          <div className="flex-1" />
          <a
            href={planHref("full", carry)}
            {...handoff}
            {...(GOES_TO_DEMO ? { target: "_blank", rel: "noopener" } : {})}
            /* Transparent border to match the free card’s outlined button, so the
               two buttons have identical boxes and their tops line up, not just
               their baselines. */
            className="mt-7 block w-full rounded-[2px] border border-transparent bg-parchment px-5 py-[15px] text-[12.5px] font-bold uppercase tracking-[0.13em] text-bark no-underline"
          >
            {t.paid.cta}
          </a>
          {GOES_TO_DEMO && (
            <p
              className="mt-[10px] text-parchment/60"
              style={{ fontSize: 11.5, lineHeight: 1.5 }}
            >
              {t.demoNote}
            </p>
          )}
        </div>
      </div>

      {/* Her brief: "Beside the demo links, clearly identify those as demo
          previews unavailable in the customer app at launch." */}
      {GOES_TO_DEMO && (
        <p
          className="mx-auto mt-5 max-w-[900px] text-center text-smoke"
          style={{ fontSize: 12.5, lineHeight: 1.6 }}
        >
          {t.demoOnly}
        </p>
      )}

      {/* ---------- What's included ---------- */}
      <WhatsIncluded t={t} />
    </>
  );
}

/**
 * The fuller explanation, folded away.
 *
 * Her brief: "Preserve the fuller product explanation in one compact,
 * expandable 'What's included' section below the cards, within the Clarity
 * offer. Keep account coverage, cancellation and reading-allowance details
 * accessible there."
 *
 * A native <details>, so it works with JavaScript off, is reachable by
 * keyboard without any code of ours, and announces its own open state. The
 * marker is removed and replaced with a sign that follows the open state in
 * CSS, so there is no state to manage here.
 */
function WhatsIncluded({ t }: { t: ReturnType<typeof appPlansFor> }) {
  return (
    <details className="group mx-auto mt-10 max-w-[900px] rounded-[2px] border border-border bg-ghost [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left md:px-8">
        <span
          className="font-heading font-medium text-bark"
          style={{ fontSize: 19, lineHeight: 1.25 }}
        >
          {t.whatsIncluded}
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-[22px] leading-none text-rose transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="border-t border-border px-6 pb-9 pt-7 md:px-8">
        {/* The three facts her brief wants kept reachable. */}
        <div className="mb-9 flex flex-col gap-2 border-l border-warm pl-4 text-dusk">
          <p style={{ fontSize: 14.5, lineHeight: 1.6 }}>{t.covers}</p>
          <p style={{ fontSize: 14.5, lineHeight: 1.6 }}>{t.paid.billing}</p>
          <p style={{ fontSize: 14.5, lineHeight: 1.6 }}>{t.paid.cancel}</p>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-9 md:grid-cols-2">
          {t.detail.parts.map((part, i) => {
            const wide =
              i === t.detail.parts.length - 1 && t.detail.parts.length % 2 === 1;
            return (
              <section
                key={part.title}
                className={wide ? "md:col-span-2" : undefined}
              >
                <h4
                  className="font-heading mb-[10px] font-medium text-bark"
                  style={{ fontSize: 18.5, lineHeight: 1.25 }}
                >
                  {part.title}
                </h4>
                <p
                  className="text-smoke"
                  style={{ fontSize: 15, lineHeight: 1.65 }}
                >
                  {part.body}
                </p>
                {part.detail && (
                  <ul
                    className={`mt-[13px] list-none gap-[7px] border-l border-border pl-4 text-dusk ${
                      wide
                        ? "flex flex-col md:grid md:grid-cols-2 md:gap-x-9"
                        : "flex flex-col"
                    }`}
                    style={{ fontSize: 13.5, lineHeight: 1.55 }}
                  >
                    {part.detail.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* The reading allowance, which her brief wants kept available here. */}
        <section className="mt-10 rounded-[2px] border border-border bg-linen px-5 py-6 md:px-7">
          <h4
            className="font-heading mb-3 font-medium text-bark"
            style={{ fontSize: 18.5, lineHeight: 1.25 }}
          >
            {t.allowance.title}
          </h4>
          {[
            t.allowance.body,
            t.allowance.pauses,
            t.allowance.remains,
            t.allowance.resumes,
          ].map((line) => (
            <p
              key={line}
              className="mb-2 text-dusk last:mb-0"
              style={{ fontSize: 14.5, lineHeight: 1.65 }}
            >
              {line}
            </p>
          ))}
        </section>

        {/* One example, labelled fictional before it is read, not after. */}
        <figure className="mt-10 rounded-[2px] border border-warm bg-blush px-5 py-6 md:px-7">
          <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-rose">
              {t.example.eyebrow}
            </span>
            <span className="rounded-[2px] bg-bark/85 px-[9px] py-[4px] text-[10px] font-bold uppercase tracking-[0.14em] text-parchment">
              {t.example.label}
            </span>
          </figcaption>
          <p
            className="font-heading mb-3 font-medium text-bark"
            style={{ fontSize: 18, lineHeight: 1.3 }}
          >
            {t.example.title}
          </p>
          <p className="mb-3 text-dusk" style={{ fontSize: 15, lineHeight: 1.7 }}>
            {t.example.text}
          </p>
          <p
            className="mb-3 border-t border-warm pt-3 text-smoke"
            style={{ fontSize: 13, lineHeight: 1.55 }}
          >
            {t.example.rests}
          </p>
          <p className="text-smoke" style={{ fontSize: 12, lineHeight: 1.55 }}>
            {t.example.note}
          </p>
        </figure>

        <p
          className="mt-9 text-center text-dusk"
          style={{ fontSize: 14.5, lineHeight: 1.65 }}
        >
          {t.detail.choice}
        </p>
        <p
          className="font-heading mx-auto mt-5 max-w-[620px] text-center text-bark"
          style={{ fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.35 }}
        >
          {t.detail.close}
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
      className={`mb-5 mt-5 flex list-none flex-col text-left ${
        compact ? "gap-[7px]" : "gap-[9px]"
      } ${tone === "dark" ? "text-parchment/85" : "text-smoke"}`}
      style={{ fontSize: 14.5, lineHeight: 1.5 }}
    >
      {items.map((item) => (
        <li key={item} className="relative pl-[18px]">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-[9px] h-[5px] w-[5px] rounded-full ${
              tone === "dark" ? "bg-rose-dark" : "bg-rose"
            }`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
