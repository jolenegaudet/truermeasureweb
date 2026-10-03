import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { salesPause } from "@/content/founding-families";
import { WaitlistButton } from "@/components/waitlist-button";
import { alternatesFor } from "@/content/i18n";

export const metadata: Metadata = {
  title: "A Truer Measure",
  // hreflang, so the English and French home pages read as one page in two
  // languages rather than two pages competing for the same searches.
  alternates: alternatesFor("/"),
};

const roomAccess = [
  "Live Room with Jolene, every week",
  "Guest experts",
  "Community between calls",
  "Group Q&A",
];

const circleAccess = [
  "Direct access to Jolene",
  "A small circle, by application",
  "A voice in what Truer Measure builds next",
];

/**
 * Section order, Jolène 30 September 2026.
 *
 *   1 Hero      the headline
 *   2 Founder   who is behind it
 *   3 Tiers     Start with Clarity. Continue with Community. Grow with Proximity.
 *
 * Social was section 4 until 1 October 2026, when Jolène asked for the links on
 * every page. They moved into the footer, which the root layout puts on all of
 * them, and the section came out rather than repeat the same three links
 * immediately above the footer that now holds them.
 *
 * The explanation of the Hidden Report Card (the contrast with a report card,
 * the qualities, what you get, when to pull it up) moved to /hidden-report-card
 * by her decision, so the home page is the door to the three offers. The
 * Clarity card's "See what is inside" link is where that explanation now lives.
 */
const pause = salesPause.en;

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        {/* The line above the headline states the problem, so the headline can
            be the answer to it. Not an uppercase eyebrow: it is a full
            sentence and tracked capitals make a sentence harder to read. */}
        <p
          className="mx-auto mb-6 max-w-[620px] text-smoke"
          style={{ fontSize: "clamp(18px,2.3vw,23px)", lineHeight: 1.45 }}
        >
          A report card was never designed to tell the whole story.
        </p>
        <h1
          className="font-heading mb-8 text-bark"
          style={{
            fontSize: "clamp(54px,9vw,120px)",
            fontWeight: 500,
            lineHeight: 0.98,
            letterSpacing: "-0.01em",
          }}
        >
          Here&rsquo;s a Truer Measure.
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-[18px]">
          <a
            href="#tiers"
            className="inline-block rounded-[2px] bg-bark px-[34px] py-[17px] text-[14px] font-semibold uppercase tracking-[0.12em] text-parchment no-underline"
          >
            GET STARTED
          </a>
        </div>
      </section>

      {/* 2. Founder */}
      <section className="bg-linen px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto grid max-w-[1080px] items-center gap-10 md:gap-16 md:grid-cols-[0.85fr_1.15fr]">
          <div className="flex justify-center">
            <Image
              src="/founder.png"
              alt="Jolene, founder of Truer Measure"
              width={400}
              height={400}
              className="block rounded-full object-cover object-top"
              style={{ width: "min(280px, 70vw)", aspectRatio: "1/1" }}
            />
          </div>
          <div>
            <div className="mb-[26px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              A note from the founder
            </div>
            <p
              className="font-heading mb-7 text-bark"
              style={{
                fontSize: "clamp(24px,3vw,34px)",
                lineHeight: 1.4,
              }}
            >
              For nearly <em>25 years</em> I helped create the report cards
              families bring home, first as a teacher writing them, later as a
              principal signing them.
            </p>
            <p
              className="mb-[22px] text-smoke"
              style={{ fontSize: 17, lineHeight: 1.75 }}
            >
              I sat through hundreds of parent–teacher meetings watching families
              try to find their child inside a paragraph of carefully worded
              comments. And I kept seeing the same thing: the qualities and
              skills that mattered most, the quiet belief that a child is capable
              of more than the box they&rsquo;ve just been placed in, were
              nowhere on the pages.
            </p>
            <p className="text-smoke" style={{ fontSize: 17, lineHeight: 1.75 }}>
              That&rsquo;s why I created A Truer Measure: a living account of
              your child&rsquo;s education, school and{" "}
              <em className="italic text-bark">beyond</em>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Tiers */}
      <section
        id="tiers"
        className="bg-parchment px-6 pb-16 pt-16 md:px-10 md:pb-[100px] md:pt-[110px]"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-16">
            <h2
              className="font-heading mb-[18px] font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,52px)", lineHeight: 1.08 }}
            >
              Start with Clarity.
            </h2>
            <p className="text-smoke" style={{ fontSize: 17, lineHeight: 1.7 }}>
              Continue with Community. Grow with Proximity.
            </p>
          </div>


          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1.08fr_1fr_1fr]">
            {/* Tier 1 — A Truer Measure, the membership.
                Naming rule, Jolene 29 September 2026: A Truer Measure is what a
                parent buys. The Hidden Report Card is the document it produces.
                Her own copy in "What you actually get" already drew that line,
                so the card names the membership and the document keeps its name
                everywhere it is the document being talked about.
                Sales of this offer are paused (2 October 2026), so the card
                carries the temporary message and a link to the product page
                instead of a price and a checkout button. */}
            <div className="flex flex-col">
              <div
                className="flex flex-1 flex-col items-center rounded-[2px] bg-bark px-11 pb-[52px] pt-[58px] text-center"
                style={{ boxShadow: "0 12px 48px rgba(43,34,32,.18)" }}
              >
                <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose-dark">
                  Clarity
                </div>
                <div
                  className="font-heading mb-3 font-medium text-parchment"
                  style={{ fontSize: 40, lineHeight: 1.04 }}
                >
                  A Truer
                  <br />
                  Measure
                </div>
                <p
                  className="mb-8 text-parchment"
                  style={{ fontSize: 15.5, lineHeight: 1.55 }}
                >
                  More than a grade to speak for your child.
                </p>
                {/* No flex-1 spacer here any more. It was sized for a card
                    full of pricing; with this much less content it would push
                    the message to the bottom and open a hole in the middle. The
                    card still stretches to the row, and the slack now falls
                    below the button, where it reads as padding. */}
                {/* SALES PAUSED, 2 October 2026. The offer is being
                    restructured; see content/founding-families.ts, which still
                    holds every amount, the Stripe ids and the price component.
                    The card stays where it is and keeps its name: the product
                    is not discontinued, it is not for sale this week. */}
                <p
                  className="font-heading mt-4 text-parchment"
                  style={{ fontSize: 22, lineHeight: 1.3 }}
                >
                  {pause.heading}
                </p>
                <p className="mt-4 text-muted" style={{ fontSize: 15, lineHeight: 1.65 }}>
                  {pause.building}
                </p>
                <Link
                  href={pause.ctaHref}
                  className="mt-8 inline-block rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline"
                >
                  {pause.cta}
                </Link>
              </div>
            </div>

            {/* Tier 2 — Elite Parents */}
            <div className="flex flex-col items-center rounded-[2px] border border-border bg-ghost px-9 pb-[46px] pt-[50px] text-center">
              <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
                Community
              </div>
              <div
                className="font-heading mb-[18px] font-medium text-bark"
                style={{ fontSize: 34, lineHeight: 1.06 }}
              >
                Elite
                <br />
                Parents
              </div>
              <p className="font-heading mb-7 text-[19px] text-dusk">
                Elite Parents as Learning Leaders
              </p>
              <div
                className="mb-9 flex flex-col gap-[10px] text-smoke"
                style={{ fontSize: 14 }}
              >
                {roomAccess.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
              <div className="flex-1" />
              <WaitlistButton
                tag="waitlist-elite-learning-leaders"
                label="Join the waitlist"
                modalEyebrow="Elite Parents"
                modalTitle="Join the Elite Parents waitlist."
                submitLabel="Join the waitlist"
                variant="outline-rose-dark"
              />
            </div>

            {/* Tier 3 — Inner Circle */}
            <div className="flex flex-col items-center rounded-[2px] border border-warm bg-blush px-9 pb-[46px] pt-[50px] text-center">
              <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
                Proximity
              </div>
              <div
                className="font-heading mb-[18px] font-medium text-bark"
                style={{ fontSize: 34, lineHeight: 1.06 }}
              >
                Inner
                <br />
                Circle
              </div>
              <p className="font-heading mb-7 text-[19px] text-dusk">
                Help shape what&rsquo;s next
              </p>
              <div
                className="mb-9 flex flex-col gap-[10px] text-smoke"
                style={{ fontSize: 14 }}
              >
                {circleAccess.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
              <div className="flex-1" />
              <WaitlistButton
                tag="applied-inner-circle"
                label="Apply"
                modalEyebrow="Help Shape What's Next"
                modalTitle="Apply to Inner Circle."
                submitLabel="Submit application"
                variant="outline-rose"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
