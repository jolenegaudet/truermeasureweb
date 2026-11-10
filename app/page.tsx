import type { Metadata } from "next";
import Image from "next/image";
import { WaitlistButton } from "@/components/waitlist-button";
import { PlanCards } from "@/components/plan-cards";
import { APP_PRICES } from "@/content/app-prices";
import { alternatesFor } from "@/content/i18n";

export const metadata: Metadata = {
  title: "A Truer Measure™",
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
 * Section order, Jolène 30 September 2026, revised by her on 2 November 2026.
 *
 *   1 Hero      the headline
 *   2 Clarity   the app: School and School & Life
 *   3 Community Elite Parents and Inner Circle
 *   4 Founder   who is behind it, last, immediately before the footer
 *
 * The founder's note was section 2 until 2 November 2026, when she asked for
 * it to close the page instead: "after the offers and their supporting
 * explanations… Preserve its wording." Its words are unchanged.
 *
 * Social was section 4 until 1 October 2026, when Jolène asked for the links on
 * every page. They moved into the footer, which the root layout puts on all of
 * them, and the section came out rather than repeat the same three links
 * immediately above the footer that now holds them.
 *
 * The explanation of The Truer Measure (the contrast with a report card, the
 * qualities, what you get, when to pull it up) moved to /the-truer-measure by
 * her decision, so the home page is the door to the three offers. The
 * Clarity card's "See what is inside" link is where that explanation now lives.
 *
 * 28 OCTOBER 2026, her brief: the app offer is now one product with two plans.
 * Section 3 split in two as a result:
 *
 *   3 Clarity    the app: School · Free and School & Life · Paid, then the
 *                detail that explains the paid experience (components/
 *                plan-cards.tsx, copy in content/app-plans.ts)
 *   4 Community  Elite Parents and Inner Circle, untouched, with the rest of
 *      Proximity her triad as their heading
 *
 * The single dark "A Truer Measure" card that carried the sales-paused message
 * from 2 October is what the two plan cards replace. The pause itself is not
 * over: nothing on this page can be bought, and the paid card's only completed
 * action is still the Kit signup. content/founding-families.ts keeps every
 * amount, the Stripe ids and SALES_PAUSED exactly as they were; this page just
 * no longer renders the pause message, because the thing it stood in for has
 * been replaced by a description of the product rather than a silence.
 */

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

      {/* 2. Clarity: the app, as one product with two plans.
          Keeps id="tiers" because the hero's GET STARTED points at it and that
          anchor is in social posts and emails that are already out. */}
      <section
        id="tiers"
        className="bg-parchment px-6 pb-16 pt-16 md:px-10 md:pb-[100px] md:pt-[110px]"
      >
        <div className="mx-auto max-w-[1180px]">
          <PlanCards locale="en" prices={APP_PRICES} />
        </div>
      </section>

      {/* 3. Community and Proximity.
          Elite Parents and Inner Circle, exactly as they were: the same cards,
          the same GoHighLevel waitlist and application forms, the same tags,
          the same wording. Only the row width changed, from three columns to
          two, because the app offer that used to sit beside them is now its own
          section above. Neither card has ever carried a price and her rule is
          that neither ever will, so there is nothing here to keep in step with
          the plan cards. */}
      <section className="bg-linen px-6 pb-16 pt-16 md:px-10 md:pb-[100px] md:pt-[104px]">
        <div className="mx-auto max-w-[860px]">
          <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-14">
            <h2
              className="font-heading mb-[18px] font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,52px)", lineHeight: 1.08 }}
            >
              Continue with Community.
            </h2>
            <p className="text-smoke" style={{ fontSize: 17, lineHeight: 1.7 }}>
              Grow with Proximity.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
            {/* Tier 2 — Elite Parents */}
            <div className="flex flex-col items-center rounded-[2px] border border-border bg-ghost px-6 pb-[46px] pt-[50px] text-center md:px-9">
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
            <div className="flex flex-col items-center rounded-[2px] border border-warm bg-blush px-6 pb-[46px] pt-[50px] text-center md:px-9">
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

      {/* 4. The founder's note, last.
          Her brief of 2 November 2026: "Move the founder's note to the last
          content section, immediately before the footer, after the offers and
          their supporting explanations… Preserve its wording." It was section
          2, between the headline and the offers, from 30 September. Not one
          word of it changed; only where it sits. The same move is made on the
          French home page. */}
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
            <div className="mb-[26px] text-center text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose md:text-left">
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
    </>
  );
}
