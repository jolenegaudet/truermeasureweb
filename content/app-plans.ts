/**
 * THE APP OFFER: one product, two plans.
 *
 * Her brief, 28 October 2026, replaced the single "Clarity" card (which had
 * carried the sales-paused message since 2 October) with one product presented
 * as two plans: School · Free and School & Life · Paid.
 *
 * ── WHERE THIS COPY COMES FROM ─────────────────────────────────────────────
 *
 * The customer app is `prototype/.worktrees/launch` (branch `launch`), not the
 * `app/` platform and not the prototype's `main`. It is the branch she runs on
 * her own computer (launch-local/start.ps1) and the one whose last commit is a
 * Stripe test-mode walkthrough, 17/17, 28 October 2026.
 *
 * Her own approved words are reused verbatim wherever they exist, and they are
 * marked below. Three sources, all in that worktree:
 *
 *   js/config.js  onboarding.choose.school / .full   her plan copy, 23 Oct 2026
 *   js/config.js  plan.offer.free / .full            "Only what the app does
 *                                                     today", in her words
 *   js/config.js  plan.terms.cancel                  the cancel sentence,
 *                                                     20 Oct 2026
 *
 * Nothing here describes a feature the customer app does not have today. The
 * checks in scripts/check-app-claims.mjs hold this file to that.
 *
 * ── WHAT IS DELIBERATELY ABSENT ───────────────────────────────────────────
 *
 * Yearly reports, pages for the child, Build my résumé and growth bars. All
 * four work in the demo and all four are hidden from a signed-in account:
 *
 *   js/account.js:17
 *   const DEFERRED = ['annual', 'resume', 'childPage', 'growthBars'];
 *   // Not part of the first paid release (the founder, 13 October 2026).
 *
 * Her brief asked for them to be checked before being described, and to be
 * omitted if unavailable. They are unavailable to a customer, so they are not
 * on the page. See docs/app-claims-2026-10-28.md.
 *
 * ── PRICE ──────────────────────────────────────────────────────────────────
 *
 * No amount. The app itself has none: `plan.prices` is `{ monthly: '',
 * schoolYear: '' }`, with her note "Prices are open (13 October 2026): shown
 * only when set. Never a live price without her go-ahead." The billing shape
 * (monthly, cancel any time) is on the page because her brief asked for it;
 * the amount is not, and `PRICE_PREVIEW` below keeps even the placeholder off
 * anything built without the local preview flag.
 */

import type { Locale } from "@/content/i18n";

/**
 * The published demo. Verified HTTP 200 on 28 October 2026.
 *
 * Every button in this section points here, because the customer app is not
 * published: her brief, "use working demo destinations for the current
 * buttons. Make availability clear." The availability line is not optional
 * decoration, it is what makes the destination honest.
 */
export const DEMO_URL = "https://truermeasure-preview.azurewebsites.net/";

/**
 * The unapproved price placeholder, confined to the local preview.
 *
 * Her brief: "the dollar amount remains unapproved" and "Keep any unapproved
 * price placeholder confined to the local preview."
 *
 * `process.env.NEXT_PUBLIC_*` is inlined at build time, so with the variable
 * unset (Netlify, and every ordinary `npm run build`) this is false and no
 * placeholder exists in the exported HTML at all. It is not hidden with CSS,
 * it is absent. To see it locally:
 *
 *   NEXT_PUBLIC_TM_PRICE_PREVIEW=1 npm run dev
 *
 * The placeholder is deliberately not a number. A number would be a price the
 * moment anyone screenshots it, and her rule about Stripe's sandbox amounts
 * ("Never use the Stripe sandbox amounts as our pricing") exists because that
 * is exactly how a test figure escapes.
 */
export const PRICE_PREVIEW = process.env.NEXT_PUBLIC_TM_PRICE_PREVIEW === "1";
export const PRICE_PLACEHOLDER = "Price to be set";

export type PlanPart = {
  /** The heading a parent scans. */
  title: string;
  /** What it does, in plain words. */
  body: string;
  /** Optional: the app's own labels or questions, shown as small type. */
  detail?: string[];
};

type AppPlans = {
  sectionEyebrow: string;
  sectionHeading: string;
  sectionIntro: string;
  availability: string;
  free: {
    eyebrow: string;
    heading: string;
    body: string;
    only: string;
    includes: string[];
    billing: string;
    addLater: string;
    cta: string;
  };
  /** Under each button, because a button label is the wrong place for it. */
  demoNote: string;
  paid: {
    eyebrow: string;
    heading: string;
    body: string;
    plus: string;
    includes: string[];
    billing: string;
    cancel: string;
    cta: string;
    firstToKnow: string;
  };
  detail: {
    heading: string;
    intro: string;
    parts: PlanPart[];
    choice: string;
    close: string;
  };
  example: {
    label: string;
    eyebrow: string;
    title: string;
    text: string;
    rests: string;
    note: string;
  };
};

/**
 * English only, deliberately.
 *
 * The French home page keeps the card it has. Her French copy standards are
 * exact (and 44 straight apostrophes had to be corrected across the French
 * files three weeks ago), the app's own approved plan words exist in English
 * only, and translating a plan description without her is how a wrong term
 * gets published. /fr is noted as the follow-up, not quietly half-done.
 */
export const appPlans: Record<"en", AppPlans> = {
  en: {
    /* Her triad of 30 September 2026 ("Start with Clarity. Continue with
       Community. Grow with Proximity.") used to be one heading over three
       cards. The app now needs a section of its own, so the sentence splits
       where the page splits: its first clause is this eyebrow, and the other
       two head the Elite Parents and Inner Circle row underneath. Same words,
       same order, no line repeated twice on one page. */
    sectionEyebrow: "Start with Clarity",
    sectionHeading: "One product. Two plans.",
    sectionIntro:
      "Truer Measure keeps your child’s record in your account, for good. Start with School now and add School & Life later if you want to: everything you add stays.",
    availability:
      "The app is not open to families yet. Both buttons below open the demo, which runs on a fictional child so you can see the real screens before you decide anything.",

    /* Her words, 23 October 2026 (onboarding.choose.school), with her
       uploads-are-report-cards-only sentence, which she asked to appear
       wherever the free plan is described. */
    free: {
      eyebrow: "School · Free",
      heading: "Understand your child’s report cards.",
      body:
        "Upload report cards for plain-language explanations, a school picture updated as you add cards, questions to ask the teacher and practical ideas for home.",
      only: "Uploads are report cards only: PDFs, or photos of each page.",
      /* plan.offer.free, her words. "Only what the app does today." */
      includes: [
        "Your child’s first look, and everything you’ve added so far.",
        "Report cards, any number, each explained.",
        "The school reading across them, updated as you add.",
        "The questions to ask the teacher and the ideas for home in each report card’s explanation.",
      ],
      /* These two sit where the paid card's price and cancel terms sit, and
         they exist for two reasons. A free plan beside a paid one raises
         "do I have to give a card?" immediately, and the app's answer is no:
         signing in is an emailed link and a checkout only ever opens on an
         upgrade. And without them the free card was 280px of empty space
         under its last line, which is the hollow middle the old Clarity card
         had a comment warning about. */
      billing: "Free, and no card.",
      addLater:
        "Add School & Life later if you want to: everything you add with School stays.",
      cta: "See School",
    },

    /* The destination goes under the button, not inside it.
       "SEE SCHOOL & LIFE IN THE DEMO" is 29 tracked uppercase characters, and
       a 390px phone leaves 240px inside the card's padding: measured at 68px
       tall against the free button's 51px, so it was wrapping to two lines.
       Shortening both labels and saying where they go underneath is the fix
       that also reads better, because a parent scanning a button wants the
       verb, and a parent about to press one wants to know a new tab opens. */
    demoNote: "Opens the demo in a new tab.",

    paid: {
      eyebrow: "School & Life · Paid",
      /* Her brief asked for "A growing picture of who your child is becoming."
         "who your child is becoming" is the phrase she banned on 7 October and
         had removed from /hidden-report-card the same week; "capable of
         becoming" is the replacement she supplied herself, and it is live in
         both languages. Her brief's sentence with her own correction applied.
         The app's card says "See what everyday moments reveal about your
         child." if she would rather have that one. */
      heading: "A growing picture of who your child is capable of becoming.",
      body:
        "Bring together what school sees, what you notice and what your child says. Truer Measure organizes the record and helps you see interests, strengths, developing capabilities and questions worth exploring, across school and everyday life, over time.",
      plus: "Everything in School, plus:",
      /* plan.offer.full, her words. */
      includes: [
        "Moments from beyond school, any time: a sentence, a photo, a coach’s email.",
        "Readings that bring school and life together, updated as you add: what agrees, what differs, and what’s worth exploring.",
        "Your own words about your child, read alongside the record.",
        "Questions about everything, including notes for a parent-teacher meeting.",
      ],
      billing: "A monthly subscription.",
      /* plan.terms.cancel, her words, 20 October 2026. */
      cancel:
        "Cancel any time: School & Life stays until the end of the paid period, and everything you added stays with you.",
      cta: "See School & Life",
      firstToKnow: "Or be told when it opens:",
    },

    detail: {
      heading: "What School & Life gives you",
      intro:
        "The cards above are the short version. This is what a parent actually works with, and nothing here is a plan for later: it is in the app today.",
      parts: [
        {
          title: "A whole-child profile",
          body:
            "Your child’s interests, qualities, experiences and learning, in one view. It is built in two sections, and no area is given a level or a score.",
          /* The app's own section and group names, capitalised so they read as
             the labels they are. Two of them ("What draws them in", "Their
             place in the world") use a plural pronoun for one child, which her
             site copy rule forbids. They are the app's approved headings, not
             prose written here, so they keep their wording and are marked as
             names instead of being quietly reworded into something a parent
             would not find on the screen. */
          detail: [
            "The foundations that outlast school: Reading, Writing, Communicating, Mathematics, Thinking, and Problem solving. Thinking and Problem solving are separate foundations.",
            "What matters now and later: eighteen areas in four groups, named Thinking and learning, Taking action, Themselves and others, and Their place in the world.",
            "What draws them in, the app’s heading for interests and enjoyment: what your child keeps coming back to, keeps doing, and enjoys. Nothing in this part is counted or rated.",
          ],
        },
        {
          title: "A dashboard that brings the picture together",
          body:
            "When you come back, the first screen tells you where the record stands rather than asking you to go looking. It is the understanding you return for.",
          detail: [
            "The story so far: what the record holds now, at school and beyond.",
            "What we’re noticing: what keeps appearing, each statement resting on named records.",
            "Recently added: what has come in since you were last here.",
            "Worth a closer look: an open question the record raises, not a verdict about your child.",
          ],
        },
        {
          title: "Capture a moment",
          body:
            "Your child solves a problem, struggles with something, asks for help or takes responsibility. Capture what happened. Truer Measure organizes and interprets it in the background, helping you see the capabilities developing and the challenges worth understanding.",
          detail: [
            "Add an observation in your own words, a photo, a piece of schoolwork, or feedback from a coach or another adult.",
            "You do not sort it, tag it or file it. That happens for you, and you can change anything it decides.",
          ],
        },
        {
          title: "Reflect together",
          body:
            "Your child’s perspective gets a place of its own, beside what you notice. Take a few minutes together and keep the answers.",
          detail: [
            "“What did you enjoy?”",
            "“What felt hard?”",
            "“What would you like to try next?”",
            "One answer is enough. Afterwards those words go into the picture as your child’s own, and they stay marked as your child’s, never folded into an adult’s observation.",
          ],
        },
        {
          title: "A timeline and evidence library",
          body:
            "Meaningful moments and documents kept together across school years and everyday life, so what happened in Grade 2 is still there to open in Grade 7.",
          detail: [
            "Report cards and school documents stay beside the moments from beyond school, in one dated record.",
            "Every document you upload stays yours. You can export or delete everything at any time.",
          ],
        },
        {
          title: "Readings across school and life",
          body:
            "What keeps appearing, what differs between school and home, and what may be changing. A reading is written only where the records support the comparison, and it says so when they do not.",
          detail: [
            "Each reading names the records it rests on, and you can open them.",
            "Counts describe the record, not your child’s ability. Where there is little recorded, the app says the record is thin, which is a fact about the record and not a weakness in your child.",
          ],
        },
        {
          title: "Questions, conversations and next steps",
          body:
            "Ask puts a question to the record. Explore a question takes one further, and both are there when you are getting ready for a parent-teacher meeting.",
          detail: [
            "Ask about an interest, a difficulty or something you have been wondering about, and get an answer drawn from the record with the records named.",
            "Reflection plans and suggestions come from what the record already holds, including your child’s own words.",
            "What it does not do: it does not diagnose, label, predict, or compare your child with other children, and it does not work out on its own what support your child needs. That stays a conversation between you, your child and the people who teach your child.",
          ],
        },
      ],
      choice:
        "You choose what goes in. Nothing is added to your child’s record that you did not put there or approve.",
      /* Her closing line, and already the app's own (choose.full.close). */
      close:
        "You capture the moments. Truer Measure helps you understand the picture they build.",
    },

    /**
     * One compact example, from the Demo Child who is already in the demo.
     *
     * Verbatim from the launch worktree, js/seed.js, insight `i16`, which is
     * written demo content and not AI output. Its five records are e16, e25
     * and e38 (Grade 3, 4 and 5 report cards) and e14 and e32 (the notebook
     * comic and the zine story), which is where the count comes from.
     */
    example: {
      label: "A fictional example",
      eyebrow: "What agrees, at school and beyond",
      title: "Writing, at school and beyond",
      text:
        "Her teachers rate her writing at the top level from June of Grade 4 and describe stories that are imaginative and rich in detail. Beyond school she writes stories nobody assigned: the notebook comic and the zine story.",
      rests: "Rests on 5 records: 3 from school, 2 from beyond school.",
      note:
        "The Demo Child is fictional, and so is every record behind this. In the app a parent taps any reading to open the records underneath it.",
    },
  },
};

/** Convenience for a page that already knows its locale. English only today. */
export function appPlansFor(locale: Locale) {
  return locale === "en" ? appPlans.en : null;
}
