import type { Metadata } from "next";
import Image from "next/image";
import { WaitlistButton } from "@/components/waitlist-button";
import { Moments } from "@/components/moments";

export const metadata: Metadata = {
  title: "The Hidden Report Card | Truer Measure",
};

const qualities = [
  { n: "01", word: "Confidence" },
  { n: "02", word: "Curiosity" },
  { n: "03", word: "Courage" },
  { n: "04", word: "Initiative" },
  { n: "05", word: "Resilience" },
  { n: "06", word: "Creativity" },
];

const contrasts = [
  {
    left: "Record performance.",
    right: "Records the person behind the performance.",
  },
  {
    left: "Provide a snapshot.",
    right: "Preserves the story.",
  },
  {
    left: "Tell you how a child is doing.",
    right: "Helps families remember who that child is.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
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
          The Hidden
          <br />
          Report Card
        </h1>
        <p
          className="font-heading mx-auto mb-10 italic text-dusk"
          style={{
            fontSize: "clamp(22px,3.2vw,30px)",
            lineHeight: 1.45,
            maxWidth: 680,
          }}
        >
          A report card measures your child against a narrow set of standards.
          It was never designed to capture your whole child.
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

      {/* Qualities */}
      <section className="bg-blush px-6 py-16 md:px-10 md:py-24">
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
              None of these receive a grade. Yet they shape almost everything
              that matters.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-px border border-grid bg-grid md:grid-cols-3">
            {qualities.map(({ n, word }) => (
              <div
                key={n}
                className="bg-blush px-4 py-8 text-center md:px-8 md:py-[46px]"
              >
                <div className="font-heading mb-[14px] text-[13px] tracking-[0.3em] text-faint">
                  {n}
                </div>
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
            unnoticed, because no one is collecting the story.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-[1080px] px-6 py-16 md:px-10 md:py-[104px]">
        <div className="grid items-center gap-10 md:gap-16 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Image
              src="/founder.png"
              alt="Jolene, founder of The Hidden Report Card"
              width={600}
              height={750}
              className="block w-full rounded-[2px] object-cover object-top"
              style={{ aspectRatio: "4/5" }}
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
              of more than the box they've just been placed in, were nowhere on
              the pages.
            </p>
            <p className="text-smoke" style={{ fontSize: 17, lineHeight: 1.75 }}>
              That's why I created The Hidden Report Card — a record of who
              your child is <em className="italic text-bark">becoming</em>.
            </p>
          </div>
        </div>
      </section>

      {/* Artifact (dark) */}
      <section className="bg-bark px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[880px] text-center">
          <div className="mb-7 text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose-dark">
            TRUERMEASURE.COM
          </div>
          <h2
            className="font-heading mx-auto mb-10 font-medium text-parchment md:mb-14"
            style={{
              fontSize: "clamp(26px,4.6vw,52px)",
              lineHeight: 1.18,
            }}
          >
            The real value is ongoing clarity, a living document that helps
            families make better decisions about learning, growth, and support.
          </h2>
          <div className="grid grid-cols-1 gap-px border border-charcoal bg-charcoal text-left md:grid-cols-2">
            <div className="bg-bark px-[34px] py-[38px]">
              <div className="font-heading mb-3 text-[21px] text-warm">
                A good investor
              </div>
              <p className="text-muted" style={{ fontSize: 16, lineHeight: 1.7 }}>
                doesn't look at one days' performance. The look for patterns
                over time.
              </p>
            </div>
            <div className="bg-bark px-[34px] py-[38px]">
              <div className="font-heading mb-3 text-[21px] text-warm">
                The hidden report card
              </div>
              <p className="text-muted" style={{ fontSize: 16, lineHeight: 1.7 }}>
                helps families see patterns, growth, strenghts, and potential
                that are easy to miss when focusing only on grades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="bg-parchment px-6 pb-16 pt-16 md:px-10 md:pb-[100px] md:pt-[110px]">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-16">
            <h2
              className="font-heading mb-[18px] font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,52px)", lineHeight: 1.08 }}
            >
              Start with Clarity.
            </h2>
            <p className="text-smoke" style={{ fontSize: 17, lineHeight: 1.7 }}>
              Continue with Community. Grow with Support.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1.08fr_1fr_1fr]">
            {/* Tier 1 — Start Here */}
            <div
              className="flex flex-col items-center rounded-[2px] bg-bark px-11 pb-[52px] pt-[58px] text-center"
              style={{ boxShadow: "0 12px 48px rgba(43,34,32,.18)" }}
            >
              <div className="mb-[22px] text-[11.5px] font-bold uppercase tracking-[0.26em] text-rose-dark">
                Start Here
              </div>
              <div
                className="font-heading mb-[18px] font-medium text-parchment"
                style={{ fontSize: 40, lineHeight: 1.04 }}
              >
                The Hidden
                <br />
                Report Card
              </div>
              <p className="mb-9 text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                Unlimited Hidden Report Cards for your family for one year.
              </p>
              <div className="flex-1" />
              <WaitlistButton
                tag="waitlist-hidden-report-card"
                label="Join Waitlist"
                modalEyebrow="Start Here"
                modalTitle="Join the Hidden Report Card waitlist."
                submitLabel="Join the waitlist"
                variant="dark"
              />
            </div>

            {/* Tier 2 — Learn */}
            <div className="flex flex-col items-center rounded-[2px] border border-border bg-ghost px-9 pb-[46px] pt-[50px] text-center">
              <div className="mb-[22px] text-[11.5px] font-bold uppercase tracking-[0.26em] text-faint">
                LEARN FROM THE ROOM
              </div>
              <div
                className="font-heading mb-[18px] font-medium text-bark"
                style={{ fontSize: 34, lineHeight: 1.06 }}
              >
                Elite
                <br />
                Learning Leaders
              </div>
              <p
                className="mb-9 text-smoke"
                style={{ fontSize: 14.5, lineHeight: 1.65, maxWidth: 210 }}
              >
                Communication + Conversations + Collective Intelligence
              </p>
              <div className="flex flex-col gap-2 text-[14px] text-smoke">
                <div>Live Room with Jolene</div>
                <div>Access to Frameworks and Tools</div>
                <div>Community Network</div>
                <div>Guest Experts</div>
                <div>Group Q&amp;A</div>
              </div>
              <div className="flex-1" />
              <WaitlistButton
                tag="waitlist-elite-learning-leaders"
                label="Join Waitlist"
                modalEyebrow="Learn From The Room"
                modalTitle="Join the Elite Learning Leaders waitlist."
                submitLabel="Join the waitlist"
                variant="outline-rose-dark"
              />
            </div>

            {/* Tier 3 — Build */}
            <div className="flex flex-col items-center rounded-[2px] border border-warm bg-blush px-9 pb-[46px] pt-[50px] text-center">
              <div className="mb-[22px] text-[11.5px] font-bold uppercase tracking-[0.26em] text-rose">
                BUILD DIRECT WITH ME
              </div>
              <div
                className="font-heading mb-[18px] font-medium text-bark"
                style={{ fontSize: 34, lineHeight: 1.06 }}
              >
                Inner
                <br />
                Circle
              </div>
              <p
                className="mb-9 text-smoke"
                style={{ fontSize: 14.5, lineHeight: 1.65, maxWidth: 210 }}
              >
                Direct access to me, smaller live sessions and occasional
                one-on-one time.
              </p>
              <div className="flex flex-col gap-2 text-[14px] text-smoke">
                <div>Everything in Elite</div>
                <div className="h-3" />
                <div>Small-Group Sessions</div>
                <div>Direct Access to Jolene via DM</div>
                <div>Possibility of 1:1 Access</div>
                <div>Early Access to Products and Artifacts</div>
              </div>
              <div className="flex-1" />
              <WaitlistButton
                tag="applied-inner-circle"
                label="Apply"
                modalEyebrow="Build Direct With Me"
                modalTitle="Apply to Inner Circle."
                submitLabel="Submit application"
                variant="outline-rose"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Moments */}
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
              Pull up the Hidden Report Card.
            </h2>
          </div>

          <Moments />
        </div>
      </section>

      {/* Contrast */}
      <section className="bg-blush px-6 py-16 md:px-10 md:py-[100px]">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-12 text-center md:mb-[60px]">
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(26px,4.6vw,50px)", lineHeight: 1.12 }}
            >
              Grades tell a story.
              <br />
              They just don't tell the whole story.
            </h2>
          </div>

          <div className="flex flex-col gap-px border border-grid bg-grid">
            {contrasts.map(({ left, right }, i) => (
              <div
                key={i}
                className="grid grid-cols-1 bg-blush md:grid-cols-2"
              >
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
    </>
  );
}
