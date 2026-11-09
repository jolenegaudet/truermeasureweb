import type { Metadata } from "next";
import { alternatesFor } from "@/content/i18n";
import { closing } from "@/content/founding-families";
import { FrameworkList } from "@/components/framework-list";
import { PlanCards } from "@/components/plan-cards";
import { APP_PRICES } from "@/content/app-prices";

export const metadata: Metadata = {
  // The layout template appends " | Truer Measure", and the home page is
  // already titled "A Truer Measure", so titling this page the same gave both
  // "A Truer Measure | Truer Measure" and two pages with identical titles.
  // This one is the product page, so it carries the product's name.
  title: "The Truer Measure",
  description:
    "Bring together report cards, teacher comments, your observations, projects and moments from beyond school, and see what keeps showing up across your child's experiences.",
  alternates: alternatesFor("/hidden-report-card"),
};

/**
 * The Truer Measure: the product page.
 *
 * ── THE NAME CHANGED, 9 November 2026 ─────────────────────────────────────
 *
 * Her instruction: "it says The Hidden Report Card™. I kind of changed it to
 * The Truer Measure™, so that needs to change everywhere on the site."
 *
 * The naming rule of 29 September had A Truer Measure as the thing a parent
 * buys and The Hidden Report Card as the document it produces. That split is
 * gone. One name now covers both, which is why the framework section's eyebrow
 * lost its second line: "The Hidden Report Card™ / A Truer Measure of your
 * child" would read as the same words twice.
 *
 * THE ROUTE IS STILL /hidden-report-card, deliberately, and it is the one
 * place the old phrase survives. A path is an address, not a name: this one is
 * in her social posts, in emails already sent, and it is the phrase a parent
 * searches for. Changing it would break those links for a cosmetic gain. If
 * she wants the address changed too, that is one redirect and a separate
 * decision, and nothing on the page depends on the path.
 *
 * The FAQ is off the page until Jolene decides what it says (30 September
 * 2026); its answers stay in content/founding-families.ts. Nothing on this
 * page mentions the demo, by her decision.
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

/* The thirty-one words that used to sit here left the page on 2 November 2026,
   replaced by the demo's framework: content/framework.ts, rendered by
   components/framework-list.tsx. The mapping, line by line, is in
   docs/framework-2026-11-02.md. */

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
  /* Added 9 November 2026: "Add Reflect together, to this".
     THE SENTENCE IS HERS. The draft read "Answer a few questions together with
     your child, and keep those answers word for word", built from her
     published Terms ("questions you answer with your child, kept in their own
     words"). She cut it at the comma the same afternoon. What came off was the
     keeping, which every other row on this page already promises; what is left
     is the only row that names something a parent does WITH the child rather
     than about the child, which is why it belongs last. */
  {
    feature: "Reflect together",
    outcome: "Answer a few questions together with your child.",
  },
];

const close = closing.en;

export default function HiddenReportCardPage() {
  return (
    <>
      {/* HER BRIEF OF 2 NOVEMBER 2026: the action comes first.
          "The Hidden Report Card / Clarity: the School and School & Life
          choices, with prices, monthly/yearly choice and registration buttons
          at the top of the relevant cards… A short heading may introduce the
          offer. Put long explanations, characteristics and other supporting
          content after the action."

          So the hero is now the short heading and nothing else, the plan cards
          follow immediately, and every section that explains the product comes
          after them in the order it was already in. The one sentence that used
          to close the hero ("A report card measures your child against a
          limited set of standards…") moved into the contrast section below,
          unchanged: it is an explanation, and explanations now sit after the
          action. */}

      {/* 1. The short heading */}
      <section className="mx-auto max-w-[920px] px-6 pb-6 pt-8 text-center md:px-10 md:pb-10 md:pt-16">
        <div className="mb-[22px] text-[15px] font-semibold uppercase tracking-[0.24em] text-rose">
          Because a report card was never designed to tell the whole story
        </div>
        <h1
          className="font-heading text-bark"
          style={{
            fontSize: "clamp(38px,5.6vw,64px)",
            fontWeight: 500,
            lineHeight: 1.06,
            letterSpacing: "-0.005em",
          }}
        >
          here&rsquo;s a Truer Measure.
        </h1>
      </section>

      {/* 2. The action: the same two cards as the home page, same component,
          same prices, same billing choice, same buttons and the same discreet
          demo labels. Nothing is duplicated in content; this is one component
          rendered in two places. */}
      <section
        id="plans"
        className="scroll-mt-6 bg-parchment px-6 pb-16 pt-2 md:px-10 md:pb-[100px]"
      >
        <div className="mx-auto max-w-[1180px]">
          <PlanCards locale="en" prices={APP_PRICES} showHeading={false} />
        </div>
      </section>

      {/* 3. Contrast */}
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
            <p
              className="font-heading mx-auto mt-7 italic text-dusk"
              style={{
                fontSize: "clamp(18px,2.2vw,23px)",
                lineHeight: 1.5,
                maxWidth: 620,
              }}
            >
              A report card measures your child against a limited set of
              standards. It was never designed to measure your whole child.
            </p>
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
                    The Truer Measure&trade;
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

      {/* 4. The framework: the demo's six foundations and twenty-one
          characteristics, her brief of 2 November 2026. Names, meaning, order
          and groupings are the demo's; see content/framework.ts. */}
      <section className="bg-ghost px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1080px]">
          {/* Her wording of 2 November 2026, dictated to replace "None of
              these receive a grade. Yet they shape so much of who your child
              is capable of becoming.", which she judged "too absolute, even
              when restricted to the 21 characteristics". Her replacement is
              true of the foundations as well, so the heading introduces the
              whole section again rather than the second block alone. */}
          <div className="mx-auto mb-12 max-w-[720px] text-center md:mb-14">
            {/* ONE LINE SINCE 9 November 2026. It read "The Hidden Report
                Card™ / A Truer Measure of your child" while those were two
                different names. Under the new name the second line is the
                first line again, so it came off rather than being reworded. */}
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              The Truer Measure&trade;
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,54px)", lineHeight: 1.08, margin: 0 }}
            >
              Your child&rsquo;s grades don&rsquo;t show everything they&rsquo;re
              capable of.
            </h2>
          </div>

          <FrameworkList locale="en" />

          <div
            className="mx-auto mt-[54px] flex flex-col gap-5 text-center text-smoke"
            style={{ fontSize: 17, lineHeight: 1.75, maxWidth: 640 }}
          >
            {/* Bold, her instruction of 9 November 2026. It is the line that
                turns the list above into something about the reader's own
                child, so it carries the weight of a heading without being
                one. */}
            <p
              className="font-heading font-bold italic text-dusk"
              style={{ fontSize: "clamp(20px,2.4vw,25px)" }}
            >
              Some you may already recognize. Others you may not have seen yet.
            </p>
            <p>
              But the evidence is scattered across people, places, experiences
              and years. A teacher sees one piece. You see another. A coach sees
              another. Your child experiences all of it.
            </p>
            {/* TRAVEL, 9 November 2026: "Add something about travel. We have
                talked about that before." It comes from her own post about
                families travelling in term time, which ends "Absent from
                school? Yes. Absent from learning? Absolutely not."
                (docs/posting-schedule-full-text.md).

                HER CUT, the same afternoon. The draft listed what a trip
                teaches: "another language, a map, a currency, a museum, a meal
                nobody at home would recognize". She took the list out and
                added the "Oh, and", which turns a claim into an aside and
                lands harder for being shorter. Three sentences, hers. */}
            <p>
              Oh, and three weeks travelling is three weeks of learning. School
              marks that absent. Your child was present for all of it.
            </p>
            <p>
              Until you bring that evidence together, it&rsquo;s hard to see what
              it reveals.
            </p>
            <p>
              That&rsquo;s why we call it the{" "}
              <strong className="font-semibold text-bark">Truer Measure&trade;</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 5. What you actually get */}
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
              <strong className="font-semibold text-bark">Truer Measure&trade;</strong>.
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

      {/* 6. Moments */}
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
              Pull up the Truer Measure<span className="align-super text-[0.55em]">&trade;</span>
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

      {/* 7. The product experience */}
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

      {/* 7. THE CLOSE.
          This section said "The Hidden Report Card™ is evolving… Be the first
          to know." from 2 October 2026, while sales were paused and there was
          nothing to buy. Her instruction of 9 November 2026: "This is not
          longer true… It's live."

          So the email capture is gone from this page. Collecting an address to
          announce a launch that has happened would be asking a parent to wait
          for something already in front of them. The one action at the end of
          the page is the same action as at the top of it, and the button
          returns to the real plan cards at #plans rather than minting a second
          path into the app: one place a purchase begins, with the live prices
          and the currency handoff the cards already carry.

          The signup itself is untouched and still shipping: the Kit list, the
          function, the tag and components/first-to-know.tsx are all in place
          for the next thing she has to announce. */}
      <section className="bg-bark px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[640px] text-center">
          <h2
            className="font-heading font-medium text-parchment"
            style={{ fontSize: "clamp(28px,5vw,46px)", lineHeight: 1.1 }}
          >
            {close.heading}
          </h2>
          <p className="mt-7 text-muted" style={{ fontSize: 17, lineHeight: 1.75 }}>
            {close.story}
          </p>
          <a
            href={close.ctaHref}
            className="mt-9 inline-block rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline"
          >
            {close.cta}
          </a>
        </div>
      </section>
    </>
  );
}
