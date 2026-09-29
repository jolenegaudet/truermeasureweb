import type { Metadata } from "next";
import Link from "next/link";
import { PriceInYourCurrency } from "@/components/price-in-your-currency";
import {
  CHECKOUT_URL,
  DEMO_URL,
  FEEDBACK_MONTHS,
  FOUNDERS_MONTHS,
  FOUNDERS_USD,
  PRICE_SCOPE,
  PRICE_USD,
  billingTerms,
  checkoutReady,
  faqs,
  foundingIncludes,
} from "@/content/founding-families";

export const metadata: Metadata = {
  title: "A Truer Measure",
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

const benefits = [
  {
    title: "Bring the pieces together.",
    body: "Keep school records, observations and experiences in one evolving account.",
  },
  {
    title: "See what repeats and what changes.",
    body: "Explore evidence across years and settings, including where school and life show different pictures.",
  },
  {
    title: "Bring more context to the conversation.",
    body: "Use relevant evidence and clearer questions when discussing your child's learning.",
  },
];

const experience = [
  {
    feature: "My Child",
    outcome:
      "One profile the whole record hangs from, so what you are looking at is a child rather than a file.",
  },
  {
    feature: "Timeline",
    outcome:
      "The record in order, with the moments that mattered shown large, so a year is something you can actually look back across.",
  },
  {
    feature: "Evidence",
    outcome:
      "Report cards, school work, photos and your own notes kept as individual items, so a single observation does not get lost inside a document.",
  },
  {
    feature: "Insights",
    outcome:
      "Patterns drawn across the record, each one linked back to the evidence behind it, so you can check where a statement came from instead of taking it on trust.",
  },
  {
    feature: "Ask",
    outcome:
      "Put a question to the record and get an answer drawn from what is in it, which is useful the week before a meeting.",
  },
  {
    feature: "Capture a moment",
    outcome:
      "Add something on the day it happens, before it turns into the thing you meant to write down.",
  },
  {
    feature: "Report card interpretation",
    outcome:
      "Plain language for what a carefully worded comment is actually saying, and what it would be reasonable to ask about it.",
  },
  {
    feature: "Child facing pages",
    outcome:
      "A printable page written for your child to read, about what your child is good at.",
  },
];

const steps = [
  {
    n: "1",
    title: "Bring what you already have.",
    body: "Report cards, a few photos, something a teacher wrote. Whatever is within reach.",
  },
  {
    n: "2",
    title: "Review what the record brings together.",
    body: "Look at what the pieces show side by side, and at what is linked to what.",
  },
  {
    n: "3",
    title: "Add new moments as your child grows.",
    body: "The account is meant to keep going, so it is worth more in a year than on the day you start.",
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
      {/* 1. Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
          A Truer Measure
        </div>
        <h1
          className="font-heading mb-8 text-bark"
          style={{
            fontSize: "clamp(38px,6.4vw,78px)",
            fontWeight: 500,
            lineHeight: 1.04,
            letterSpacing: "-0.01em",
          }}
        >
          School keeps years of grades.
          <br />
          Who keeps everything else?
        </h1>
        <p
          className="font-heading mx-auto mb-10 italic text-dusk"
          style={{
            fontSize: "clamp(19px,2.6vw,26px)",
            lineHeight: 1.45,
            maxWidth: 700,
          }}
        >
          Bring together report cards, teacher comments, your observations,
          projects and moments from beyond school. See what keeps showing up
          across your child&rsquo;s experiences, and what changes over time.
        </p>
        <p
          className="mx-auto mb-10 text-smoke"
          style={{ fontSize: 16, lineHeight: 1.75, maxWidth: 620 }}
        >
          What it produces is your child&rsquo;s Hidden Report Card: the account
          you pull up before a meeting, an application, or a hard week.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[18px]">
          <a
            href="#founding"
            className="inline-block rounded-[2px] bg-bark px-[34px] py-[17px] text-[14px] font-semibold uppercase tracking-[0.12em] text-parchment no-underline"
          >
            See the Founding Families offer
          </a>
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-[2px] border border-rose px-[26px] py-[15px] text-[13px] font-semibold uppercase tracking-[0.14em] text-bark no-underline"
          >
            Explore the demo
          </a>
        </div>
      </section>

      {/* 2. A concrete example */}
      <section className="bg-blush px-6 py-16 md:px-10 md:py-[100px]">
        <div className="mx-auto max-w-[1000px]">
          <div className="mx-auto mb-10 max-w-[680px] text-center md:mb-14">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              Fictional demo content
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(26px,4.6vw,50px)", lineHeight: 1.12 }}
            >
              What it looks like when the two sit side by side.
            </h2>
          </div>

          {/* Reuses the home page contrast grid so the two records read as two
              columns of the same record, not as an argument between them. */}
          <div className="grid grid-cols-1 gap-px border border-grid bg-grid md:grid-cols-2">
            <div className="bg-blush px-6 py-7 md:px-9 md:py-[34px]">
              <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-faint">
                What school recorded
              </div>
              <p
                className="font-heading text-smoke"
                style={{ fontSize: "clamp(18px,2.2vw,23px)", lineHeight: 1.35 }}
              >
                Comments repeatedly mention difficulty planning longer
                assignments.
              </p>
            </div>
            <div className="bg-blush px-6 py-7 md:px-9 md:py-[34px]">
              <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-rose">
                What the record also holds
              </div>
              <p
                className="font-heading text-bark"
                style={{ fontSize: "clamp(18px,2.2vw,23px)", lineHeight: 1.35 }}
              >
                Planning a meal. Managing a trip budget. Saving toward a goal.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-[660px] text-center">
            <p
              className="font-heading mb-6 italic text-dusk"
              style={{ fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.45 }}
            >
              This gives you a more specific question to bring to the teacher:
              which kinds of planning are difficult, and where is your child
              already managing well?
            </p>
            <p className="text-smoke" style={{ fontSize: 16, lineHeight: 1.75 }}>
              It does not mean the teacher is wrong, and it does not explain why
              the two look different. Planning a meal and planning a three week
              assignment are not the same task. What it gives you is a better
              place to start asking.
            </p>
            <p className="mt-6 text-faint" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
              The example above is drawn from the fictional demo child. It is
              not a real family, and not a result.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Three core benefits */}
      <section className="bg-ghost px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[1080px]">
          <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-16">
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,50px)", lineHeight: 1.08 }}
            >
              What it does for you.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px border border-grid bg-grid md:grid-cols-3">
            {benefits.map(({ title, body }) => (
              <div key={title} className="bg-ghost px-7 py-9 md:px-9 md:py-[46px]">
                <h3
                  className="font-heading mb-4 font-medium text-bark"
                  style={{ fontSize: "clamp(22px,2.8vw,28px)", lineHeight: 1.2 }}
                >
                  {title}
                </h3>
                <p className="text-smoke" style={{ fontSize: 16, lineHeight: 1.7 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The product experience */}
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

          {/* Required honesty about the demo. The quoted strings are the demo's
              own labels, taken from the running application. */}
          <div className="mt-12 border border-border bg-parchment px-6 py-7 md:mt-16 md:px-9 md:py-8">
            <h3 className="font-heading mb-4 text-[22px] text-bark">
              What the demo shows, and what it does not.
            </h3>
            <div
              className="flex flex-col gap-4 text-smoke"
              style={{ fontSize: 15.5, lineHeight: 1.7 }}
            >
              <p>
                The sample interpretations in the demo are marked{" "}
                <span className="font-semibold text-bark">
                  &ldquo;Written for this demo&rdquo;
                </span>
                . The demo describes them as hand written to show what Truer
                Measure could say, and not produced by AI from that record.
              </p>
              <p>
                The demo also states that live AI needs an invitation link from
                Truer Measure.
              </p>
              <p>
                So treat the demo as a demonstration of the experience rather
                than a statement of what is running for a new member today. The
                child in it is fictional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How to start */}
      <section className="bg-ghost px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[900px]">
          <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-16">
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,50px)", lineHeight: 1.08 }}
            >
              How to start.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {steps.map(({ n, title, body }) => (
              <div key={n}>
                <div className="font-heading mb-4 text-[40px] leading-none text-warm">
                  {n}
                </div>
                <h3
                  className="font-heading mb-3 font-medium text-bark"
                  style={{ fontSize: 22, lineHeight: 1.25 }}
                >
                  {title}
                </h3>
                <p className="text-smoke" style={{ fontSize: 16, lineHeight: 1.7 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. The Founding Families offer */}
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
              unit={`per month for your first ${FOUNDERS_MONTHS} months`}
              thenUSD={PRICE_USD}
              thenUnit="a month after that"
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

            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-block text-[12.5px] font-semibold uppercase tracking-[0.14em] text-rose-dark no-underline hover:text-parchment"
            >
              Explore the demo
            </a>
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

      {/* 7. FAQ */}
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
