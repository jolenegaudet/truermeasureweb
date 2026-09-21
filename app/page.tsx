import type { Metadata } from "next";
import Image from "next/image";
import { BeforeDeadline } from "@/components/founding-rate-line";
import { PriceInYourCurrency } from "@/components/price-in-your-currency";
import { WaitlistButton } from "@/components/waitlist-button";

const moments = [
  "Before a parent–teacher meeting",
  "Before applying for a program, team, or scholarship",
  "When the report card doesn’t match the child you know",
  "When your kid shines everywhere except on paper",
  "When confidence drops",
  "When a hard week starts to feel like a bad year",
  "When a child says, “I’m not smart.”",
  "Anytime you need to remember who your child really is.",
];

export const metadata: Metadata = {
  title: "A Truer Measure",
};

const qualities = [
  "Confidence",
  "Curiosity",
  "Kindness",
  "Imagination",
  "Resilience",
  "Creativity",
  "Self-Regulation",
  "Persistence",
  "Empathy",
  "Adaptability",
  "Critical Thinking",
  "Purpose",
];

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

const contrasts = [
  {
    left: "Measures performance.",
    right: "Sees the person behind the performance.",
  },
  {
    left: "Gives you a snapshot.",
    right: "Preserves the story.",
  },
  {
    left: "Tells you how your child is doing in school.",
    right: "Keeps a living account of your child's education, school and beyond.",
  },
];

/**
 * Section order, and why it is this order.
 *
 * A parent reads down the page asking one question at a time, and each section
 * answers the question the one above it raises:
 *
 *   1 Hero      the problem
 *   2 Contrast  what a report card leaves out      ← what is this, in 5 seconds
 *   3 Qualities the things it leaves out, named
 *   4 Get       what the membership actually is    ← before any price
 *   5 Moments   when a parent would reach for it   ← desire before price
 *   6 Founder   who is behind it                   ← trust, spent just before the ask
 *   7 Tiers     what it costs
 *
 * Two rules this order exists to protect, so please do not undo them casually:
 *   - No price appears before the product has been explained.
 *   - The two sections that make a parent feel recognised (Contrast, Moments)
 *     sit above the buy button, not below it, where a parent who flinches at
 *     the price would never reach them.
 *
 * Backgrounds alternate blush / ghost so no two touching sections share a
 * ground. Moving a section means checking its neighbours.
 */
export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
          Because a report card was never designed to tell the whole story
        </div>
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
        <p
          className="font-heading mx-auto mb-10 italic text-dusk"
          style={{
            fontSize: "clamp(22px,3.2vw,30px)",
            lineHeight: 1.45,
            maxWidth: 680,
          }}
        >
          A report card measures your child against a limited set of standards.
          It was never designed to measure your whole child.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[18px]">
          <a
            href="#tiers"
            className="inline-block rounded-[2px] bg-bark px-[34px] py-[17px] text-[14px] font-semibold uppercase tracking-[0.12em] text-parchment no-underline"
          >
            GET STARTED
          </a>
        </div>
      </section>

      {/* 2. Contrast */}
      <section className="bg-blush px-6 py-16 md:px-10 md:py-[100px]">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-12 text-center md:mb-[60px]">
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(26px,4.6vw,50px)", lineHeight: 1.12 }}
            >
              Grades tell a story.
              <br />
              They just don&rsquo;t tell the whole story.
            </h2>
          </div>

          <div className="flex flex-col gap-px border border-grid bg-grid">
            {contrasts.map(({ left, right }, i) => (
              <div key={i} className="grid grid-cols-1 bg-blush md:grid-cols-2">
                <div className="border-b border-grid px-6 py-6 md:border-b-0 md:border-r md:px-9 md:py-[34px]">
                  <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-faint">
                    The report card
                  </div>
                  <div
                    className="font-heading text-smoke"
                    style={{
                      fontSize: "clamp(19px,2.4vw,25px)",
                      lineHeight: 1.3,
                    }}
                  >
                    {left}
                  </div>
                </div>
                <div className="px-6 py-6 md:px-9 md:py-[34px]">
                  <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-rose">
                    The Hidden Report Card
                  </div>
                  <div
                    className="font-heading text-bark"
                    style={{
                      fontSize: "clamp(19px,2.4vw,25px)",
                      lineHeight: 1.3,
                    }}
                  >
                    {right}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Qualities */}
      <section className="bg-ghost px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1080px]">
          <div className="mx-auto mb-12 max-w-[640px] text-center md:mb-16">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              THE HIDDEN REPORT CARD - THE TRUER MEASURE OF YOUR CHILD
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{
                fontSize: "clamp(28px,5vw,54px)",
                lineHeight: 1.08,
                margin: 0,
              }}
            >
              None of these receive a grade. Yet, they shape almost everything
              that matters.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-px border border-grid bg-grid md:grid-cols-3">
            {qualities.map((word) => (
              <div
                key={word}
                className="flex items-center justify-center bg-ghost px-4 py-8 text-center md:px-8 md:py-[46px]"
              >
                <div
                  className="font-heading font-medium text-bark"
                  style={{ fontSize: "clamp(22px,3.4vw,40px)" }}
                >
                  {word}
                </div>
              </div>
            ))}
          </div>

          <p
            className="mx-auto mt-[54px] text-center text-smoke"
            style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 620 }}
          >
            They show up in patterns, moments, and conversations that go
            unnoticed, because no one is collecting the data.
          </p>
        </div>
      </section>

      {/* 4. What you actually get.
          This is now the only place the product is explained. It previously ran
          three times: a dark "ongoing clarity" band, this section, and again in
          full beneath the tier cards. The three tellings are merged here,
          keeping every distinct line, so a parent reads it once and reaches the
          price already knowing what the price is for. */}
      <section className="bg-blush px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[680px] text-center">
          <div className="mb-6 text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
            Inside your membership
          </div>
          <h2
            className="font-heading mb-7 font-medium text-bark"
            style={{ fontSize: "clamp(28px,5vw,48px)", lineHeight: 1.1 }}
          >
            What you actually get
          </h2>
          <p
            className="font-heading mb-9 italic text-dusk"
            style={{ fontSize: "clamp(19px,2.4vw,24px)", lineHeight: 1.45 }}
          >
            School is part of your child&rsquo;s education. It is not the whole
            of it.
          </p>

          <div
            className="mb-10 flex flex-col gap-6 text-left text-smoke"
            style={{ fontSize: 17, lineHeight: 1.8 }}
          >
            <p>
              You start by bringing together what already exists: report cards,
              assessments, teacher comments, your own observations, evidence of
              learning from all the places your child learns and grows. Truer
              Measure brings it together and generates the Hidden Report Card.
            </p>
            <p>
              See what it reveals about your child&rsquo;s strengths,
              capabilities and growth, across experiences, perspectives and
              years.
            </p>
            <p>
              Then, as your child grows, you keep adding, and request an updated
              Hidden Report Card when you&rsquo;re ready. Six updates a year are
              included; extra updates are US$10 each.
            </p>
            <p>
              It&rsquo;s yours. You decide what goes in, who contributes, and
              who can see it. It evolves alongside your child.
            </p>
          </div>

          <p className="font-heading italic text-dusk" style={{ fontSize: 25 }}>
            That&rsquo;s the foundation.
          </p>
        </div>
      </section>

      {/* 5. Moments */}
      <section className="bg-ghost px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[1000px]">
          <div className="mx-auto mb-[60px] max-w-[620px] text-center">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              What it looks like in real life
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(32px,5vw,54px)", lineHeight: 1.08 }}
            >
              Pull up the Hidden Report Card
            </h2>
          </div>

          <div className="flex flex-col">
            {moments.map((context, i) => (
              <div
                key={context}
                className="border-t border-border px-1 py-7 text-center"
              >
                <div
                  className={
                    "font-heading text-dusk" +
                    (i === moments.length - 1 ? " font-semibold" : " italic")
                  }
                  style={{ fontSize: "clamp(21px,2.8vw,29px)" }}
                >
                  {context}
                </div>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* 6. Founder */}
      <section className="bg-linen px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto grid max-w-[1080px] items-center gap-10 md:gap-16 md:grid-cols-[0.85fr_1.15fr]">
          <div className="flex justify-center">
            <Image
              src="/founder.png"
              alt="Jolene, founder of The Hidden Report Card"
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

      {/* 7. Tiers */}
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

          {/* The founding offer is announced once, here, above the cards. It is
              deliberately not a second price printed on the card: the card
              states the standing US$597 and carries the one button. Announcing
              the discount separately is what stops a parent meeting two prices
              and two buttons for the same membership.
              This takes itself down at the end of 30 September 2026. */}
          <BeforeDeadline>
            <div className="mx-auto mb-12 max-w-[620px] border-y border-border py-7 text-center md:mb-16">
              <p className="font-heading mb-2 text-[22px] text-bark">
                40 founding parents. 40% off your first year.
              </p>
              <p
                className="mb-1 text-smoke"
                style={{ fontSize: 16, lineHeight: 1.7 }}
              >
                Pay only US$358.20 with code{" "}
                <span className="font-semibold text-bark">FOUNDING40</span>.
              </p>
              <p className="text-rose" style={{ fontSize: 15, lineHeight: 1.7 }}>
                Join before all 40 founding places are taken.
              </p>
              {/* The band spans all three cards, but the discount is tier 1
                  only. Without this line a parent can read 40% off as applying
                  to the Room or the Inner Circle as well. */}
              <p className="mt-3 text-faint" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Applies to The Truer Measure (The Hidden Report Card) only.
              </p>
            </div>
          </BeforeDeadline>

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1.08fr_1fr_1fr]">
            {/* Tier 1 — The Hidden Report Card.
                One price and one button for this membership, on this card and
                nowhere else on the page. The full description that used to sit
                below these cards now lives in "What you actually get", above. */}
            <div className="flex flex-col">
              <div
                className="flex flex-1 flex-col items-center rounded-[2px] bg-bark px-11 pb-[52px] pt-[58px] text-center"
                style={{ boxShadow: "0 12px 48px rgba(43,34,32,.18)" }}
              >
                <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose-dark">
                  Clarity
                </div>
                <div
                  className="font-heading mb-[18px] font-medium text-parchment"
                  style={{ fontSize: 40, lineHeight: 1.04 }}
                >
                  The Truer
                  <br />
                  Measure
                </div>
                <p
                  className="mb-8 text-parchment"
                  style={{ fontSize: 15.5, lineHeight: 1.55 }}
                >
                  More than a grade to speak for your child.
                </p>
                {/* Compliance spec §8-D2: the recurring renewal-discount promise is removed.
                    A Stripe promotion code carries exactly one coupon, so FOUNDING40
                    cannot deliver both the 40%-once and the 20%-forever discount. Do not
                    restore that line unless a second discount exists in Stripe that a
                    parent can actually redeem at checkout — a dedicated founding price
                    (§8-D2 option b), not a coupon applied by hand after the fact. */}
                <PriceInYourCurrency />
                <p
                  className="mt-5 text-muted"
                  style={{ fontSize: 13, lineHeight: 1.7 }}
                >
                  One membership covers one child.
                </p>
                <div className="flex-1" />
                {/* Compliance spec §5.1: the renewal disclosure is required
                    immediately above the CTA. Keep it here, and keep it last. */}
                <p
                  className="mb-7 mt-8 text-muted"
                  style={{ fontSize: 11.5, lineHeight: 1.6 }}
                >
                  Renews yearly unless you cancel. We email you before every
                  renewal. Cancel anytime.
                </p>
                <a
                  href="https://buy.stripe.com/bJe5kC3Mpefza2L13Oe7m05"
                  className="inline-block rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline"
                >
                  Start here
                </a>
                <p
                  className="mt-6 text-muted"
                  style={{ fontSize: 12, lineHeight: 1.6 }}
                >
                  (The Hidden Report Card)
                </p>
              </div>
            </div>

            {/* Tier 2 — Learn from the Room */}
            <div className="flex flex-col items-center rounded-[2px] border border-border bg-ghost px-9 pb-[46px] pt-[50px] text-center">
              <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
                Community
              </div>
              <div
                className="font-heading mb-[18px] font-medium text-bark"
                style={{ fontSize: 34, lineHeight: 1.06 }}
              >
                Learn from
                <br />
                the Room
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
                modalEyebrow="Learn From The Room"
                modalTitle="Join the Elite Parents as Learning Leaders waitlist."
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
