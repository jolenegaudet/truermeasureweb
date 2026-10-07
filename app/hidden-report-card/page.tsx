import type { Metadata } from "next";
import { alternatesFor } from "@/content/i18n";
import { Fragment } from "react";
import { salesPause } from "@/content/founding-families";
import { FirstToKnowButton } from "@/components/first-to-know";

export const metadata: Metadata = {
  // The layout template appends " | Truer Measure", and the home page is
  // already titled "A Truer Measure", so titling this page the same gave both
  // "A Truer Measure | Truer Measure" and two pages with identical titles.
  // This one is the founding offer, so it says so.
  title: "The Hidden Report Card",
  description:
    "Bring together report cards, teacher comments, your observations, projects and moments from beyond school, and see what keeps showing up across your child's experiences.",
  alternates: alternatesFor("/hidden-report-card"),
};

/**
 * A Truer Measure, and the proposed Founding Families offer.
 *
 * Naming rule, Jolene 29 September 2026: A Truer Measure is what a parent buys.
 * The Hidden Report Card is the document it produces. The route keeps its
 * /hidden-report-card path, which is the phrase a parent is most likely to
 * search for, but the product is named A Truer Measure on the page itself.
 *
 * Sales of the current offer are paused (2 October 2026). The offer section is
 * gone from public view; everything that explains the product is still here.
 *
 * Every number and term comes from content/founding-families.ts so the offer
 * can be revised in one place. The FAQ is off the page until Jolene decides
 * what it says (30 September 2026); its answers stay in that file. Nothing on
 * this page mentions the demo for now, by her decision.
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
  "When your child shines everywhere except on paper",
  "When confidence drops",
  "When a hard week starts to feel like a bad year",
  "When your child says, “I’m not smart.”",
  "When you notice something about your child you don’t want to forget",
];

// Jolene's wording, 30 September 2026.
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
      "Notice patterns over time and see where school and everyday life tell the same or different stories.",
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

const pause = salesPause.en;

export default function HiddenReportCardPage() {
  return (
    <>
      {/* 1. Hero, 2. Contrast, 3. Qualities, 4. What you actually get,
          5. Moments: moved here from the home page, in Jolene's wording of
          30 September 2026. They replace this page's earlier hero and its
          "How to start" section, which said the same things. "What it does for you"
          was removed the same day: its cards repeated "What you actually get". */}

      {/* 1. Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        <div className="mb-[30px] text-[15px] font-semibold uppercase tracking-[0.24em] text-rose">
          Because a report card was never designed to tell the whole story
        </div>
        <h1
          className="font-heading mb-8 text-bark"
          style={{
            fontSize: "clamp(38px,5.6vw,64px)",
            fontWeight: 500,
            lineHeight: 1.06,
            letterSpacing: "-0.005em",
          }}
        >
          here&rsquo;s a Truer Measure.
        </h1>
        <p
          className="font-heading mx-auto mb-10 italic text-dusk"
          style={{
            fontSize: "clamp(18px,2.2vw,23px)",
            lineHeight: 1.5,
            maxWidth: 620,
          }}
        >
          A report card measures your child against a limited set of standards.
          It was never designed to measure your whole child.
        </p>
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
              child is capable of becoming.
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
              Some you may already recognize. Others you may not have seen yet.
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
              from all the places your child learns and grows.
            </p>
            <p>
              Truer Measure brings that evidence together and generates your
              child&rsquo;s{" "}
              <strong className="font-semibold text-bark">Hidden Report Card&trade;</strong>.
            </p>
            <p>
              Now you can see what keeps showing up, what&rsquo;s changing, where
              the evidence is strong, and what you simply haven&rsquo;t seen
              enough of yet.
            </p>
            <p>
              Then keep adding as your child grows: a new report card, a project,
              something a teacher said, a photo, or a moment you don&rsquo;t want
              to forget.
            </p>
            <p>
              Over time, you build a record of your child that no single report
              card, teacher or school year could give you.
            </p>
            <p>
              It&rsquo;s yours. You decide what goes in, who contributes, and who
              can see it.
            </p>
          </div>
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

      {/* SALES PAUSED, 2 October 2026. Section 7 was the Founding Families
          offer: the price, the cap, what was included, the checkout button and
          the Terms consent beside it. It is in git at 1cb767c, and every amount
          and id is still in content/founding-families.ts. Sections 1 to 6 above
          are untouched, because someone arriving from social media still has to
          be able to understand what this is and why it exists. */}
      <section className="bg-bark px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[640px] text-center">
          <h2
            className="font-heading font-medium text-parchment"
            style={{ fontSize: "clamp(28px,5vw,46px)", lineHeight: 1.1 }}
          >
            {pause.heading}
          </h2>
          <p className="mt-7 text-muted" style={{ fontSize: 17, lineHeight: 1.75 }}>
            {pause.story}
          </p>
          {/* The one thing to do at the end of the page. Section 7 used to be
              the offer and the checkout button; while sales are paused this is
              an email address and nothing else. Her brief, 4 October 2026. */}
          <FirstToKnowButton
            place="hidden-report-card"
            className="mt-9 inline-block cursor-pointer rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline"
          />
        </div>
      </section>
    </>
  );
}
