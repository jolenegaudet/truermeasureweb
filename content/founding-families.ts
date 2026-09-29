/**
 * PROPOSED TERMS FOR THE FOUNDING FAMILIES PREVIEW.
 *
 * Every number and promise on the Hidden Report Card page comes from this one
 * file, so the terms can be revised without touching page markup.
 *
 * NONE OF THIS IS CONFIRMED. It is a draft for Jolène to approve, change or
 * reject. Two things in particular are still open and are marked `toConfirm`
 * below, which makes them render with a visible "Needs your decision" chip in
 * the preview rather than stating a policy that does not exist yet.
 *
 * Deliberately absent, because the brief ruled them out:
 *   no family cap, no enrolment deadline, no remaining-places counter, no
 *   countdown, no future regular price, no discount percentage, and no promise
 *   of unlimited uploads, storage, questions or report generation.
 *
 * FOUNDER'S RULING: US$79 a month REPLACES the US$597 annual membership. The
 * annual price is to be archived and its payment link deactivated once the
 * monthly one works, and FOUNDING40 retires with it. The one existing annual
 * subscriber keeps paying US$597 a year until they cancel, which is what Stripe
 * does with a subscription when its price is archived, and is correct.
 *
 * There is still no US$79 monthly price in Stripe, so `checkoutReady` stays
 * false and nothing here is wired to the annual checkout. Two scripts do the
 * switch in the order that cannot strand the site with nothing to sell:
 *
 *   scripts/new-monthly-price.ps1     creates the monthly price and its link
 *   scripts/retire-annual-price.ps1   takes the annual one down, and refuses
 *                                     to run until the monthly one is live
 */

export const PRICE_USD = 79;
export const PRICE_PERIOD = "month";
export const PRICE_SCOPE = "one child";

/** Flip to true only when a real monthly payment link exists. */
export const checkoutReady = false;

export const DEMO_URL = "https://truermeasure-preview.azurewebsites.net/#home";

/** Months the founding feedback period runs for. */
export const FEEDBACK_MONTHS = 3;

/** Months the founding rate is held, given continuous membership. */
export const RATE_HELD_MONTHS = 12;

export const billingTerms: string[] = [
  `US$${PRICE_USD} a month for ${PRICE_SCOPE}.`,
  "Billed monthly. Cancel any time before your next renewal.",
  `Your founding rate is held for your first ${RATE_HELD_MONTHS} months of continuous membership.`,
];

/** What a founding family gets for the feedback period, and for how long. */
export const foundingIncludes: { what: string; howLong: string }[] = [
  {
    what: "One live onboarding session, with a recording",
    howLong: "Once, when you join",
  },
  {
    what: "One group product feedback call each month",
    howLong: `During the ${FEEDBACK_MONTHS} month feedback period`,
  },
  {
    what: "An optional private feedback group",
    howLong: `During the ${FEEDBACK_MONTHS} month feedback period`,
  },
  {
    what: "The Feedback button inside the product",
    howLong: "For as long as you are a member",
  },
  {
    what: "The Hidden Report Card itself",
    howLong: "For as long as you are a member",
  },
];

/**
 * Questions whose honest answer depends on a policy that does not exist yet.
 * These render with a visible chip in the preview. They must be answered or
 * removed before this page is published: guessing at a retention or deletion
 * policy for children's records is the one thing this page must not do.
 */
export type Faq = { q: string; a: string; toConfirm?: boolean };

export const faqs: Faq[] = [
  {
    q: "What am I paying for?",
    a: `Access to the Hidden Report Card for ${PRICE_SCOPE}: a place to bring together report cards, teacher comments, your own observations, projects and moments from beyond school, and to look at what they show together over time. Your membership continues for as long as you keep it.`,
  },
  {
    q: "What does being a founding family involve?",
    a: `You are joining early and helping shape what gets built. That means a live onboarding session, a monthly group feedback call for ${FEEDBACK_MONTHS} months, an optional private group, and the Feedback button in the product. Jolène reads what founding families send. Not every suggestion will be built, and this is not individual consulting.`,
  },
  {
    q: "Is this suitable if I only have a few records?",
    a: "Yes. You start with whatever you already have, even if that is one report card and a few photos. The account is meant to grow as your child does, so there is no amount you need to gather first.",
  },
  {
    q: "Is the price per child or per family?",
    a: `US$${PRICE_USD} a month covers ${PRICE_SCOPE}.`,
    toConfirm: true,
  },
  {
    q: "Does this include Learn From The Room or Inner Circle?",
    a: "No. Those are separate, and joining as a founding family does not include either of them.",
  },
  {
    q: `What happens after the ${FEEDBACK_MONTHS} month feedback period?`,
    a: `Your membership carries on as normal. The founding calls and the private group are part of the feedback period and end with it. The product itself, and your child's record inside it, do not change.`,
  },
  {
    q: "How does cancellation work?",
    a: "You cancel before your next monthly renewal and you are not billed again.",
    toConfirm: true,
  },
  {
    q: "What happens to my child's information if I cancel?",
    a: "This needs a written answer before founding places open. Truer Measure has no published policy on retention, export or deletion yet, and this page will not guess at one.",
    toConfirm: true,
  },
];
