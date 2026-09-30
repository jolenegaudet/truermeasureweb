import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { PriceInYourCurrency } from "@/components/price-in-your-currency";
import {
  CHECKOUT_URL,
  FEEDBACK_MONTHS,
  FOUNDERS_ENDS_AT,
  FOUNDERS_ENDS_LABEL,
  FOUNDERS_USD,
  PRICE_SCOPE,
  PRICE_USD,
  billingTerms,
  checkoutReady,
  faqs,
  foundingIncludes,
} from "@/content/founding-families";

export const metadata: Metadata = {
  // The layout template appends " | Truer Measure", and the home page is
  // already titled "A Truer Measure", so titling this page the same gave both
  // "A Truer Measure | Truer Measure" and two pages with identical titles.
  // This one is the founding offer, so it says so.
  title: "Founding Families",
  description:
    "Bring together report cards, teacher comments, your observations, projects and moments from beyond school, and see what keeps showing up across your child's experiences.",
};

/**
 * A Truer Measure, and the proposed Founding Families offer.
 *
 * Naming rule, Jolene 29 September 2026: A Truer Measure is what a parent buys.
 * The Hidden Report Card is the document it produces. The route keeps its
 * /hidden-report-card path, which is the phrase a parent is most likely to
 * search for, but the product is named A Truer Measure on the page itself.
 *
 * PREVIEW ONLY. Nothing on this page can be bought. There is no US$79 monthly
 * price in Stripe: the only recurring price on the account is the US$597 annual
 * membership, and this offer must not be wired to it. The buy control stays
 * disabled until a monthly price and payment link exist, at which point
 * `checkoutReady` in content/founding-families.ts flips to true and the href
 * goes in beside it.
 *
 * Every number and term comes from content/founding-families.ts so the offer
 * can be revised in one place. Answers that depend on a policy Truer Measure
 * has not written yet carry a visible chip rather than an invented answer.
 */

const contrasts = [
  {
    left: "Measures performance.",
    right: "Sees the person behind the performance.",
  },
  {
    left: "Gives you a snapshot.",
    right: "Preserves the story over time.",
  },
  {
    left: "Tells you how your child is doing in school.",
    right: "Keeps a living account of your child’s education, in school and beyond.",
  },
];

// Her rows of four, kept as rows: the grouping is part of the reading.
const qualityRows = [
  ["Curiosity", "Imagination", "Creativity", "Critical Thinking"],
  ["Confidence", "Courage", "Self-Knowledge", "Independence"],
  ["Persistence", "Resilience", "Conscientiousness", "Initiative"],
  ["Kindness", "Empathy", "Honesty", "Integrity"],
  ["Collaboration", "Communication", "Leadership", "Emotional Intelligence"],
  ["Adaptability", "Judgment", "Problem-Solving", "Practical Life Skills"],
  ["Self-Regulation", "Responsibility", "Follow-Through", "Agency"],
  ["Cultural Awareness", "Civic-Mindedness", "Purpose"],
];

const moments = [
  "Before a parent–teacher meeting",
  "Before applying for a program, team, or scholarship",
  "When the report card doesn’t match the child you know",
  "When your kid shines everywhere except on paper",
  "When confidence drops",
  "When a hard week starts to feel like a bad year",
  "When your child says, “I’m not smart”.",
];

// Jolène's wording, 30 September 2026.
const experience = [
  {
    feature: "My Child",
    outcome: "See a fuller picture of your child across school and everyday life.",
  },
  {
    feature: "Timeline",
    outcome: "See important moments from school and life together over time.",
  },
  {
    feature: "Evidence",
    outcome:
      "Keep report cards, schoolwork, certificates, photos, projects and your own observations in one place.",
  },
  {
    feature: "Insights",
    outcome:
      "Notice patterns over time, including where school and life show the same or different things.",
  },
  {
    feature: "Ask",
    outcome: "Ask questions about your child and get answers based on what you’ve kept.",
  },
  {
    feature: "Capture a Moment",
    outcome:
      "Quickly save something you noticed with a sentence, photo or your voice, before you forget it.",
  },
];

function ToConfirm() {
  return (
    <span className="ml-2 inline-block rounded-[2px] border border-rose px-2 py-[2px] align-middle text-[10px] font-semibold uppercase tracking-[0.14em] text-rose">
      Needs your decision
    </span>
  );
}

export default function HiddenReportCardPage() {
  return (
    <>
      {/* 1. Hero, 2. Contrast, 3. Qualities, 4. What you actually get,
          5. Moments: moved here from the home page, in Jolène's wording of
          30 September 2026. They replace this page's earlier hero and its
          "How to start" section, which said the same things. "What it does for you"
          was removed the same day: its cards repeated "What you actually get". */}

      {/* 1. Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
          Because a report card was never designed to tell the whole story
        </div>
        <h1
          className="font-heading mb-8 text-bark"
          style={{
            fontSize: "clamp(30px,4.4vw,48px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.005em",
          }}
        >
          here&rsquo;s a Truer Measure.
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
            href="#founding"
            className="inline-block rounded-[2px] bg-bark px-[34px] py-[17px] text-[14px] font-semibold uppercase tracking-[0.12em] text-parchment no-underline"
          >
            See the Founding Families offer
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
                    style={{ fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.3 }}
                  >
                    {left}
                  </div>
                </div>
                <div className="px-6 py-6 md:px-9 md:py-[34px]">
                  <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-rose">
                    The Hidden Report Card&trade;
                  </div>
                  <div
                    className="font-heading text-bark"
                    style={{ fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.3 }}
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
          <div className="mx-auto mb-12 max-w-[720px] text-center md:mb-16">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              The Hidden Report Card&trade;
              <br />
              A Truer Measure of your child
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,54px)", lineHeight: 1.08, margin: 0 }}
            >
              None of these receive a grade. Yet they shape so much of who your
              child is becoming.
            </h2>
          </div>

          <div className="flex flex-col border-y border-grid">
            {qualityRows.map((row) => (
              <p
                key={row[0]}
                className="font-heading border-b border-grid py-5 text-center font-medium text-bark last:border-b-0 md:py-6"
                style={{ fontSize: "clamp(20px,2.8vw,32px)", lineHeight: 1.3 }}
              >
                {row.map((word, i) => (
                  <Fragment key={word}>
                    <span className="whitespace-nowrap">{word}</span>
                    {i < row.length - 1 ? (
                      <>
                        {" "}
                        <span className="px-2 text-warm md:px-3" aria-hidden="true">
                          &middot;
                        </span>{" "}
                      </>
                    ) : null}
                  </Fragment>
                ))}
              </p>
            ))}
          </div>

          <div
            className="mx-auto mt-[54px] flex flex-col gap-5 text-center text-smoke"
            style={{ fontSize: 17, lineHeight: 1.75, maxWidth: 640 }}
          >
            <p className="font-heading italic text-dusk" style={{ fontSize: "clamp(20px,2.4vw,25px)" }}>
              Your child is revealing these every day.
            </p>
            <p>
              But the evidence is scattered across people, places, experiences
              and years. A teacher sees one piece. You see another. A coach sees
              another. Your child experiences all of it.
            </p>
            <p>
              Until you bring that evidence together, it&rsquo;s hard to see what
              it reveals.
            </p>
            <p>
              That&rsquo;s why we call it the{" "}
              <strong className="font-semibold text-bark">Hidden Report Card&trade;</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 4. What you actually get */}
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
              assessments, teacher comments, your own observations, and evidence
              of learning from all the places your child learns and grows.
            </p>
            <p>
              Truer Measure brings that evidence together and generates your
              child&rsquo;s{" "}
              <strong className="font-semibold text-bark">Hidden Report Card&trade;</strong>.
            </p>
            <p>
              Now you can see what keeps showing up, what&rsquo;s changing, where
              the evidence is strong, and what hasn&rsquo;t had much opportunity
              to reveal itself yet.
            </p>
            <p>
              Then you keep adding: a new report card, a project, something a
              teacher said, a moment from outside school, something your child
              did that you don&rsquo;t want to lose.
            </p>
            <p>The dashboard grows as your child grows.</p>
            <p>
              And once you can see the evidence, you start noticing differently.
              You notice what keeps showing up. You notice what&rsquo;s emerging.
              And you notice where your child may need more opportunities to show
              you what&rsquo;s there.
            </p>
            <p>
              It&rsquo;s yours. You decide what goes in, who contributes, and who
              can see it.
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
              Pull up the Hidden Report Card<span className="align-super text-[0.55em]">&trade;</span>
            </h2>
          </div>

          <div className="flex flex-col">
            {moments.map((context) => (
              <div key={context} className="border-t border-border px-1 py-7 text-center">
                <div
                  className="font-heading italic text-dusk"
                  style={{ fontSize: "clamp(21px,2.8vw,29px)" }}
                >
                  {context}
                </div>
              </div>
            ))}
            <div className="border-t border-border px-1 py-7 text-center">
              <div
                className="font-heading font-semibold text-bark"
                style={{ fontSize: "clamp(21px,2.8vw,29px)" }}
              >
                Anytime you need to see the evidence.
              </div>
            </div>
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* 6. The product experience */}
      <section className="bg-linen px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[900px]">
          <div className="mx-auto mb-12 max-w-[620px] text-center md:mb-16">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              Inside the product
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,50px)", lineHeight: 1.08 }}
            >
              What you would actually use.
            </h2>
          </div>

          <dl className="flex flex-col">
            {experience.map(({ feature, outcome }) => (
              <div
                key={feature}
                className="grid grid-cols-1 gap-2 border-t border-border py-6 md:grid-cols-[220px_1fr] md:gap-8 md:py-7"
              >
                <dt className="font-heading text-[21px] text-bark">{feature}</dt>
                <dd className="text-smoke" style={{ fontSize: 16, lineHeight: 1.7 }}>
                  {outcome}
                </dd>
              </div>
            ))}
            <div className="border-t border-border" />
          </dl>
        </div>
      </section>

      {/* 7. The Founding Families offer */}
      <section id="founding" className="bg-bark px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[880px]">
          <div className="mx-auto mb-12 max-w-[620px] text-center md:mb-16">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose-dark">
              Founding Families
            </div>
            <h2
              className="font-heading font-medium text-parchment"
              style={{ fontSize: "clamp(28px,5vw,50px)", lineHeight: 1.08 }}
            >
              Join early, and help shape what gets built.
            </h2>
          </div>

          <div className="mx-auto max-w-[520px] border border-charcoal px-8 py-10 text-center md:px-11 md:py-12">
            <PriceInYourCurrency
              amountUSD={FOUNDERS_USD}
              unit={`per month until ${FOUNDERS_ENDS_LABEL}`}
              thenUSD={PRICE_USD}
              thenUnit="a month from 1 July 2027"
              offerEndsAt={FOUNDERS_ENDS_AT}
              tone="dark"
            />

            <p className="mt-3 text-muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
              For {PRICE_SCOPE}.
            </p>

            <ul
              className="mt-8 flex flex-col gap-3 border-t border-charcoal pt-8 text-left text-muted"
              style={{ fontSize: 14.5, lineHeight: 1.65 }}
            >
              {billingTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>

            <div className="mt-8 border-t border-charcoal pt-8">
              {checkoutReady ? (
                <>
                  <a
                    href={CHECKOUT_URL}
                    className="inline-block w-full rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline"
                  >
                    Join as a Founding Family
                  </a>
                  {/* The URL carries prefilled_promo_code, so the founders rate
                      is already applied when the Stripe page opens and nobody
                      has to remember a code. */}
                  <p
                    className="mt-4 text-subdued"
                    style={{ fontSize: 12.5, lineHeight: 1.65 }}
                  >
                    The founders rate is applied for you. There is no code to
                    enter.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-[2px] border border-charcoal bg-transparent px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-subdued"
                  >
                    Join as a Founding Family
                  </button>
                  <p
                    className="mt-4 text-subdued"
                    style={{ fontSize: 12.5, lineHeight: 1.65 }}
                  >
                    Disabled until a monthly price exists in Stripe. This button
                    will never be pointed at the annual membership checkout.
                  </p>
                </>
              )}
            </div>

          </div>

          {/* What a founding family gets, and for how long. The right column is
              what stops "founding" reading as a permanent entitlement. */}
          <div className="mx-auto mt-14 max-w-[720px] md:mt-16">
            <h3 className="font-heading mb-6 text-center text-[26px] text-parchment">
              What is included
            </h3>
            <dl className="flex flex-col">
              {foundingIncludes.map(({ what, howLong }) => (
                <div
                  key={what}
                  className="grid grid-cols-1 gap-1 border-t border-charcoal py-5 md:grid-cols-[1fr_auto] md:gap-8"
                >
                  <dt className="text-parchment" style={{ fontSize: 16, lineHeight: 1.6 }}>
                    {what}
                  </dt>
                  <dd className="text-subdued md:text-right" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                    {howLong}
                  </dd>
                </div>
              ))}
              <div className="border-t border-charcoal" />
            </dl>

            <div
              className="mt-10 flex flex-col gap-3 text-subdued"
              style={{ fontSize: 14, lineHeight: 1.7 }}
            >
              <p>
                This does not include Learn From The Room or Inner Circle. Those
                are separate, and joining here does not include either.
              </p>
              <p>
                It is not individual consulting, and it is not a promise that
                every suggestion becomes a feature. Jolène reads what founding
                families send, and decides what gets built.
              </p>
              <p>
                After the {FEEDBACK_MONTHS} month feedback period the membership
                carries on. The founding calls and the private group end with the
                feedback period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="bg-parchment px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[760px]">
          <h2
            className="font-heading mb-12 text-center font-medium text-bark md:mb-16"
            style={{ fontSize: "clamp(28px,5vw,50px)", lineHeight: 1.08 }}
          >
            Questions.
          </h2>

          <dl className="flex flex-col">
            {faqs.map(({ q, a, toConfirm }) => (
              <div key={q} className="border-t border-border py-7">
                <dt className="font-heading mb-3 text-[22px] text-bark">
                  {q}
                  {toConfirm ? <ToConfirm /> : null}
                </dt>
                <dd className="text-smoke" style={{ fontSize: 16, lineHeight: 1.75 }}>
                  {a}
                </dd>
              </div>
            ))}
            <div className="border-t border-border" />
          </dl>

          <div className="mt-14 border-t border-border pt-10 text-center">
            <Link
              href="/"
              className="text-[13px] font-semibold uppercase tracking-[0.14em] text-rose transition-colors hover:text-bark"
            >
              ← Back
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
