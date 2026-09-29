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

/** The standing price. What a member pays once the founders rate runs out. */
export const PRICE_USD = 79;
export const PRICE_PERIOD = "month";
export const PRICE_SCOPE = "one child";

/** The founders rate, and how long it lasts. */
export const FOUNDERS_USD = 47;
export const FOUNDERS_MONTHS = 9;

/**
 * Live in Stripe as of 29 September 2026:
 *   product  prod_VLrZW1KcxNpyFR
 *   price    price_1UL9q5AJm8m0sW6oPiusdBmT   US$79/month, tax exclusive
 *   coupon   ZsoMprUb                         US$32 off, repeating, 9 months
 *   code     FOUNDING47                       uncapped
 *   link     plink_1UL9q5AJm8m0sW6ocVU1RnN1
 *
 * The URL carries prefilled_promo_code so a parent never types the code. The
 * discount is a repeating coupon rather than a second price, so Stripe steps
 * the subscription up to US$79 on the tenth invoice by itself. Nobody has to
 * migrate anyone and nobody has to remember.
 */
export const CHECKOUT_URL =
  "https://buy.stripe.com/9B67sKaaNgnHfn5eUEe7m07?prefilled_promo_code=FOUNDING47";

export const checkoutReady = true;

export const DEMO_URL = "https://truermeasure-preview.azurewebsites.net/#home";

/** Months the founding feedback period runs for. */
export const FEEDBACK_MONTHS = 3;

export const billingTerms: string[] = [
  `US$${FOUNDERS_USD} a month for your first ${FOUNDERS_MONTHS} months, for ${PRICE_SCOPE}.`,
  `US$${PRICE_USD} a month after that. The change happens on its own, and we email you before it does.`,
  "Billed monthly. Cancel any time. You keep the month you have paid for, and you are not billed again.",
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
    a: `Access to the Hidden Report Card for ${PRICE_SCOPE}, at US$${FOUNDERS_USD} a month for your first ${FOUNDERS_MONTHS} months and US$${PRICE_USD} a month after that: a place to bring together report cards, teacher comments, your own observations, projects and moments from beyond school, and to look at what they show together over time. Your membership continues for as long as you keep it.`,
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
    a: `US$${FOUNDERS_USD} a month covers ${PRICE_SCOPE}, and so does US$${PRICE_USD} a month after the founders rate ends.`,
    toConfirm: true,
  },
  {
    q: `What happens after ${FOUNDERS_MONTHS} months at US$${FOUNDERS_USD}?`,
    a: `Your tenth monthly payment is US$${PRICE_USD}, and every one after that. Nothing else changes and you do not have to do anything. We email you before the first US$${PRICE_USD} payment so it is never a surprise on a statement.`,
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
    // Jolène's wording, 29 September 2026: cancel any time, but the month
    // already paid for is not refunded.
    //
    // There is no Stripe customer portal on this account, so a parent cannot
    // cancel herself and this must not imply a button that does not exist.
    // If a portal is ever configured, this answer should say so instead.
    q: "How does cancellation work?",
    a: "Email support@truermeasure.com and we cancel it. Your membership runs to the end of the month you have already paid for, and you are not billed after that. We do not refund part of a month.",
  },
  {
    q: "What happens to my child's information if I cancel?",
    a: "This needs a written answer before founding places open. Truer Measure has no published policy on retention, export or deletion yet, and this page will not guess at one.",
    toConfirm: true,
  },
];
