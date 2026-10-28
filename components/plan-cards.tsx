"use client";

import { useState } from "react";
import { FirstToKnowButton } from "@/components/first-to-know";
import {
  CurrencyToggle,
  type CurrencyCode,
} from "@/components/currency-toggle";
import {
  APP_CURRENCY_ORDER,
  APP_PRICES,
  DEFAULT_CURRENCY,
  DEMO_URL,
  PRICE_PREVIEW,
  appPlansFor,
} from "@/content/app-plans";
import type { Locale } from "@/content/i18n";

/**
 * One product, two plans: School · Free and School & Life · Paid.
 *
 * Her brief of 28 October 2026: "two clear cards side by side on desktop and
 * stacked on phones. Keep the cards concise. Below them, provide enough detail
 * to explain the paid experience without cramming everything into the cards."
 *
 * All copy, in both languages, is in content/app-plans.ts with its sources
 * named there. This file is layout.
 *
 * ── WHY THIS IS A CLIENT COMPONENT ────────────────────────────────────────
 *
 * Her second brief asked for a currency selector ABOVE the cards that changes
 * a price INSIDE one of them. That is one piece of state spanning two parts of
 * the section, so the section owns it. Everything here is static text, so
 * being a client component costs a little JavaScript and no data fetching.
 *
 * ── WHY THE PAID CARD IS THE DARK ONE ─────────────────────────────────────
 *
 * The card this replaces was the dark one, and it sat first in the row. Making
 * the paid plan dark keeps the page's existing weight where it was, so nothing
 * above or below has to move and Elite Parents and Inner Circle keep the
 * relationship to it they already had.
 *
 * ── BUTTONS ───────────────────────────────────────────────────────────────
 *
 * Full width inside the card, which is the one choice that cannot wrap badly.
 * The uppercase tracked button is the site's, and a long tracked label is
 * exactly what broke the waitlist button at every width except 430px: measured
 * at 68px against a one-line button's 51px on a 390px phone. The labels are
 * short and the destination is said underneath instead.
 */

export function PlanCards({ locale = "en" }: { locale?: Locale }) {
  const t = appPlansFor(locale);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const price = APP_PRICES.find((p) => p.code === currency) ?? APP_PRICES[0];

  /* The paid card's amount. An approved amount renders; an unapproved one
     renders her placeholder. With the preview flag off neither exists. */
  const paidAmount =
    price.amount === null ? null : `${price.symbol}${price.amount}`;

  return (
    <>
      {/* ---------- Heading ---------- */}
      <div className="mx-auto mb-10 max-w-[560px] text-center md:mb-12">
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

      {/* Availability, above the buttons rather than under them. Her brief:
          "Make availability clear." A parent should know what the button does
          before reaching for it, not after. */}
      <p
        className="mx-auto mb-8 max-w-[680px] rounded-[2px] border border-border bg-linen px-5 py-4 text-center text-dusk"
        style={{ fontSize: 14.5, lineHeight: 1.6 }}
      >
        {t.availability}
      </p>

      {/* The currency selector, above the cards as her brief asks. Preview
          only: with NEXT_PUBLIC_TM_PRICE_PREVIEW unset this is absent from the
          HTML, along with every amount, because no price is approved. */}
      {PRICE_PREVIEW && (
        <div className="mb-9 flex justify-center">
          <CurrencyToggle
            value={currency}
            onChange={setCurrency}
            tone="light"
            locale={locale}
            codes={APP_CURRENCY_ORDER}
            label={t.currencyLabel}
          />
        </div>
      )}

      {/* ---------- The two cards ---------- */}
      <div className="mx-auto grid max-w-[940px] grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        {/* School · Free */}
        <div className="flex flex-col rounded-[2px] border border-border bg-ghost px-6 pb-9 pt-10 text-center md:px-9 md:pt-12">
          <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
            {t.free.eyebrow}
          </div>
          <h3
            className="font-heading mb-4 font-medium text-bark"
            style={{ fontSize: 27, lineHeight: 1.14 }}
          >
            {t.free.heading}
          </h3>
          <p
            className="mb-6 text-smoke"
            style={{ fontSize: 15.5, lineHeight: 1.6 }}
          >
            {t.free.body}
          </p>
          <Bullets items={t.free.includes} tone="light" />
          <p
            className="mb-7 text-dusk"
            style={{ fontSize: 13.5, lineHeight: 1.55 }}
          >
            {t.free.only}
          </p>
          {/* Pushes both cards' buttons to the same baseline on desktop. */}
          <div className="flex-1" />
          {/* Mirrors the paid card's price block, position for position, so
              the two cards' buttons line up with the same text above them.
              Her brief: "School stays free in every currency", which is why
              this slot ignores the selector entirely. */}
          <div className="mb-6">
            {PRICE_PREVIEW ? (
              <>
                <div
                  className="font-heading text-bark"
                  style={{ fontSize: 40, lineHeight: 1.05 }}
                >
                  {t.freePrice}
                </div>
                <p
                  className="mt-2 text-smoke"
                  style={{ fontSize: 12.5, lineHeight: 1.5 }}
                >
                  {t.free.noCard}
                </p>
              </>
            ) : (
              <p className="text-bark" style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                {t.free.billing}
              </p>
            )}
            <p
              className="mt-2 text-smoke"
              style={{ fontSize: 12.5, lineHeight: 1.5 }}
            >
              {t.free.addLater}
            </p>
          </div>
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener"
            className="block w-full rounded-[2px] border border-rose bg-transparent px-5 py-[15px] text-[12.5px] font-bold uppercase tracking-[0.13em] text-bark no-underline"
          >
            {t.free.cta}
          </a>
          <p className="mt-3 text-smoke" style={{ fontSize: 12, lineHeight: 1.5 }}>
            {t.demoNote}
          </p>
        </div>

        {/* School & Life · Paid */}
        <div
          className="flex flex-col rounded-[2px] bg-bark px-6 pb-9 pt-10 text-center md:px-9 md:pt-12"
          style={{ boxShadow: "0 12px 48px rgba(43,34,32,.18)" }}
        >
          <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose-dark">
            {t.paid.eyebrow}
          </div>
          <h3
            className="font-heading mb-4 font-medium text-parchment"
            style={{ fontSize: 27, lineHeight: 1.14 }}
          >
            {t.paid.heading}
          </h3>
          <p
            className="mb-6 text-parchment/90"
            style={{ fontSize: 15.5, lineHeight: 1.6 }}
          >
            {t.paid.body}
          </p>
          <p
            className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-rose-dark"
            style={{ lineHeight: 1.4 }}
          >
            {t.paid.plus}
          </p>
          <Bullets items={t.paid.includes} tone="dark" />
          <div className="flex-1" />

          <div className="mb-6">
            {PRICE_PREVIEW && (
              <div className="mb-3">
                {paidAmount ? (
                  <div
                    className="font-heading text-parchment"
                    style={{ fontSize: 40, lineHeight: 1.05 }}
                  >
                    {paidAmount}
                    <span className="ml-2 font-sans text-[14px] text-muted">
                      {t.perMonth}
                    </span>
                  </div>
                ) : (
                  /* Her instruction for USD and EUR until she approves an
                     amount. Deliberately words, never a number. */
                  <div className="inline-block rounded-[2px] border border-dashed border-rose-dark px-3 py-[7px] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-rose-dark">
                    {t.priceToBeConfirmed}
                  </div>
                )}
                <p
                  className="mt-3 text-parchment/60"
                  style={{ fontSize: 11.5, lineHeight: 1.5 }}
                >
                  {t.taxPending}
                </p>
              </div>
            )}
            <p
              className="text-parchment"
              style={{ fontSize: 14.5, lineHeight: 1.5 }}
            >
              {t.paid.billing}
            </p>
            {/* What one subscription covers, which her brief asked to be
                explained and which the app settles: the subscription is on the
                account, not on a child (server: subscriptions.account_id). */}
            <p
              className="mt-2 text-parchment/80"
              style={{ fontSize: 12.5, lineHeight: 1.5 }}
            >
              {t.covers}
            </p>
            <p
              className="mt-2 text-parchment/70"
              style={{ fontSize: 12.5, lineHeight: 1.5 }}
            >
              {t.paid.cancel}
            </p>
          </div>
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener"
            className="block w-full rounded-[2px] bg-parchment px-5 py-[15px] text-[12.5px] font-bold uppercase tracking-[0.13em] text-bark no-underline"
          >
            {t.paid.cta}
          </a>
          <p
            className="mt-3 text-parchment/70"
            style={{ fontSize: 12, lineHeight: 1.5 }}
          >
            {t.demoNote}
          </p>
          {/* The Kit signup that is already live, kept exactly as it is. It is
              the only thing on this card a parent can actually complete today,
              so it stays rather than being replaced by a dead checkout. */}
          <p
            className="mb-[10px] mt-6 text-parchment/70"
            style={{ fontSize: 12.5, lineHeight: 1.5 }}
          >
            {t.paid.firstToKnow}
          </p>
          <FirstToKnowButton
            locale={locale}
            place="home-card"
            className="block w-full cursor-pointer rounded-[2px] border border-rose-dark bg-transparent px-5 py-[13px] text-[12px] font-bold uppercase tracking-[0.13em] text-parchment"
          />
        </div>
      </div>

      {/* Her brief: "Beside the demo links, clearly identify those as demo
          previews unavailable in the customer app at launch." Directly under
          the pair, so it sits with both buttons rather than being repeated
          inside each card. The four are the DEFERRED list in js/account.js. */}
      <p
        className="mx-auto mt-6 max-w-[940px] rounded-[2px] border border-dashed border-warm px-5 py-4 text-center text-dusk"
        style={{ fontSize: 13.5, lineHeight: 1.6 }}
      >
        {t.demoOnly}
      </p>

      {/* ---------- The reading allowance ---------- */}
      <section className="mx-auto mt-12 max-w-[680px] rounded-[2px] border border-border bg-linen px-6 py-7 md:px-9 md:py-8">
        <h3
          className="font-heading mb-3 font-medium text-bark"
          style={{ fontSize: 21, lineHeight: 1.25 }}
        >
          {t.allowance.title}
        </h3>
        <p className="mb-3 text-dusk" style={{ fontSize: 15, lineHeight: 1.65 }}>
          {t.allowance.body}
        </p>
        <p className="mb-3 text-dusk" style={{ fontSize: 15, lineHeight: 1.65 }}>
          {t.allowance.pauses}
        </p>
        <p className="mb-3 text-dusk" style={{ fontSize: 15, lineHeight: 1.65 }}>
          {t.allowance.remains}
        </p>
        <p className="text-dusk" style={{ fontSize: 15, lineHeight: 1.65 }}>
          {t.allowance.resumes}
        </p>
      </section>

      {/* ---------- The detail, under the cards ---------- */}
      <div className="mx-auto mt-16 max-w-[1000px] md:mt-20">
        <div className="mx-auto mb-11 max-w-[620px] text-center">
          <h3
            className="font-heading mb-[14px] font-medium text-bark"
            style={{ fontSize: "clamp(25px,3.6vw,38px)", lineHeight: 1.12 }}
          >
            {t.detail.heading}
          </h3>
          <p className="text-smoke" style={{ fontSize: 16.5, lineHeight: 1.7 }}>
            {t.detail.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-9 md:grid-cols-2 md:gap-y-11">
          {t.detail.parts.map((part, i) => {
            /* Seven parts in two columns leaves the last one alone beside a
               gap. It is the one carrying what the app does NOT do, which
               should not look like a leftover, so it takes the full row and
               lays its own points out in two. */
            const wide =
              i === t.detail.parts.length - 1 && t.detail.parts.length % 2 === 1;
            return (
              <section key={part.title} className={wide ? "md:col-span-2" : undefined}>
                <h4
                  className="font-heading mb-[10px] font-medium text-bark"
                  style={{ fontSize: 20.5, lineHeight: 1.25 }}
                >
                  {part.title}
                </h4>
                <p
                  className="text-smoke"
                  style={{ fontSize: 15.5, lineHeight: 1.65 }}
                >
                  {part.body}
                </p>
                {part.detail && (
                  <ul
                    className={`mt-[14px] list-none gap-[7px] border-l border-border pl-4 text-dusk ${
                      wide
                        ? "flex flex-col md:grid md:grid-cols-2 md:gap-x-9"
                        : "flex flex-col"
                    }`}
                    style={{ fontSize: 14, lineHeight: 1.55 }}
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

        {/* The one example, labelled fictional before it is read, not after. */}
        <figure className="mx-auto mt-14 max-w-[680px] rounded-[2px] border border-warm bg-blush px-6 py-7 md:mt-16 md:px-9 md:py-9">
          <figcaption className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose">
              {t.example.eyebrow}
            </span>
            <span className="rounded-[2px] bg-bark/85 px-[9px] py-[4px] text-[10.5px] font-bold uppercase tracking-[0.14em] text-parchment">
              {t.example.label}
            </span>
          </figcaption>
          <p
            className="font-heading mb-3 font-medium text-bark"
            style={{ fontSize: 19.5, lineHeight: 1.3 }}
          >
            {t.example.title}
          </p>
          <p className="mb-4 text-dusk" style={{ fontSize: 15.5, lineHeight: 1.7 }}>
            {t.example.text}
          </p>
          <p
            className="mb-4 border-t border-warm pt-4 text-smoke"
            style={{ fontSize: 13.5, lineHeight: 1.55 }}
          >
            {t.example.rests}
          </p>
          <p className="text-smoke" style={{ fontSize: 12.5, lineHeight: 1.55 }}>
            {t.example.note}
          </p>
        </figure>

        <p
          className="mx-auto mt-12 max-w-[640px] text-center text-dusk"
          style={{ fontSize: 15, lineHeight: 1.65 }}
        >
          {t.detail.choice}
        </p>
        <p
          className="font-heading mx-auto mt-6 max-w-[660px] text-center text-bark"
          style={{ fontSize: "clamp(20px,2.6vw,27px)", lineHeight: 1.35 }}
        >
          {t.detail.close}
        </p>
      </div>
    </>
  );
}

function Bullets({
  items,
  tone,
}: {
  items: readonly string[];
  tone: "dark" | "light";
}) {
  return (
    <ul
      className={`mb-7 flex list-none flex-col gap-[9px] text-left ${
        tone === "dark" ? "text-parchment/85" : "text-smoke"
      }`}
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
