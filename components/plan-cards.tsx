import { FirstToKnowButton } from "@/components/first-to-know";
import {
  DEMO_URL,
  PRICE_PLACEHOLDER,
  PRICE_PREVIEW,
  appPlans,
} from "@/content/app-plans";

/**
 * One product, two plans: School · Free and School & Life · Paid.
 *
 * Her brief, 28 October 2026: "two clear cards side by side on desktop and
 * stacked on phones. Keep the cards concise. Below them, provide enough detail
 * to explain the paid experience without cramming everything into the cards."
 *
 * So: a two-column grid that collapses to one, then a detail block under it.
 * All copy is in content/app-plans.ts, with its sources named there.
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
 * exactly what broke the waitlist button at every width except 430px three
 * weeks ago: "SEE SCHOOL & LIFE" is 17 characters at 0.13em, and a 375px phone
 * leaves 271px inside the card's padding. Full width removes the arithmetic
 * instead of repeating it.
 */

const t = appPlans.en;

function Bullets({ items, tone }: { items: readonly string[]; tone: "dark" | "light" }) {
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

export function PlanCards() {
  return (
    <>
      {/* ---------- The two cards ---------- */}
      <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-14">
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
        className="mx-auto mb-10 max-w-[680px] rounded-[2px] border border-border bg-linen px-5 py-4 text-center text-dusk"
        style={{ fontSize: 14.5, lineHeight: 1.6 }}
      >
        {t.availability}
      </p>

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
          {/* Mirrors the paid card's price and terms block, position for
              position, so the two cards' buttons line up with the same amount
              of text above them. */}
          <div className="mb-6">
            <p className="text-bark" style={{ fontSize: 14.5, lineHeight: 1.5 }}>
              {t.free.billing}
            </p>
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
          {/* The billing shape, which her brief asked for. The amount is not
              here: see PRICE_PREVIEW in content/app-plans.ts. With the preview
              flag unset this renders nothing at all, not hidden markup. */}
          <div className="mb-6">
            {PRICE_PREVIEW && (
              <div
                className="mx-auto mb-3 inline-block rounded-[2px] border border-dashed border-rose-dark px-3 py-[6px] text-[11.5px] font-semibold uppercase tracking-[0.14em] text-rose-dark"
                /* Local preview only. Deliberately words, never a number. */
              >
                {PRICE_PLACEHOLDER}
              </div>
            )}
            <p
              className="text-parchment"
              style={{ fontSize: 14.5, lineHeight: 1.5 }}
            >
              {t.paid.billing}
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
            className="mt-6 mb-[10px] text-parchment/70"
            style={{ fontSize: 12.5, lineHeight: 1.5 }}
          >
            {t.paid.firstToKnow}
          </p>
          <FirstToKnowButton
            place="home-card"
            className="block w-full cursor-pointer rounded-[2px] border border-rose-dark bg-transparent px-5 py-[13px] text-[12px] font-bold uppercase tracking-[0.13em] text-parchment"
          />
        </div>
      </div>

      {/* ---------- The detail, under the cards ---------- */}
      <div className="mx-auto mt-16 max-w-[1000px] md:mt-24">
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
          {t.detail.parts.map((part, i) => (
            /* Seven parts in two columns leaves the last one alone beside a
               gap. It is the one carrying what the app does NOT do, which is
               the part that should not look like a leftover, so it takes the
               full row and lays its own points out in two. */
            <section
              key={part.title}
              className={
                i === t.detail.parts.length - 1 && t.detail.parts.length % 2 === 1
                  ? "md:col-span-2"
                  : undefined
              }
            >
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
                    i === t.detail.parts.length - 1 &&
                    t.detail.parts.length % 2 === 1
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
          ))}
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
