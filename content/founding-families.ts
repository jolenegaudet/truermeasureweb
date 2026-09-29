/**
 * PROPOSED TERMS FOR THE FOUNDING FAMILIES PREVIEW.
 *
 * Every number and promise on the A Truer Measure page comes from this one
 * file, so the terms can be revised without touching page markup.
 *
 * CONFIRMED by Jolène on 29 September 2026 and published: the price, the
 * founders rate and its length, cancellation, retention, export and deletion.
 * Nothing carries a `toConfirm` chip any more. The mechanism stays, so a future
 * unanswered question can be marked rather than guessed at.
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
export const PRICE_USD = 67;
export const PRICE_PERIOD = "month";
export const PRICE_SCOPE = "one child";

/** The founders rate, and how long it lasts. */
export const FOUNDERS_USD = 47;
export const FOUNDERS_MONTHS = 9;

/**
 * Live in Stripe as of 29 September 2026:
 *   product  prod_VLrZW1KcxNpyFR
 *   price    price_1ULA3DAJm8m0sW6o32xEAJ4i   US$67/month, tax exclusive
 *   coupon   dJ8nAmyA                         US$20 off, repeating, 9 months
 *   code     FOUNDING47                       uncapped
 *   link     plink_1ULA3DAJm8m0sW6o5xw2NhQy
 *
 * The standing price is US$67 rather than US$79 so that it stays under CA$100
 * a month. At 1.4161 that is about CA$95, and the dollar would have to reach
 * 1.4925 before it crossed CA$100. If it ever does, this number moves, not the
 * promise on the page.
 *
 * A first US$79 set (price_1UL9q5, coupon ZsoMprUb, link plink_1UL9q5) was
 * created and then archived the same day, before anyone bought anything. It is
 * inactive in Stripe and nothing points at it.
 *
 * The URL carries prefilled_promo_code so a parent never types the code. The
 * discount is a repeating coupon rather than a second price, so Stripe steps
 * the subscription up to US$79 on the tenth invoice by itself. Nobody has to
 * migrate anyone and nobody has to remember.
 */
export const CHECKOUT_URL =
  "https://buy.stripe.com/dRmfZg96J6N75MvaEoe7m08?prefilled_promo_code=FOUNDING47";

export const checkoutReady = true;

export const DEMO_URL = "https://truermeasure-preview.azurewebsites.net/#home";

/** Months the founding feedback period runs for. */
export const FEEDBACK_MONTHS = 3;

/**
 * How long a child's record is kept after a membership ends, before it is
 * deleted with notice. Jolene's ruling, 29 September 2026.
 * The app repo's privacy-policy.md section 9 needs this number too.
 */
export const RETENTION_AFTER_END = "a year";

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
    what: "A Truer Measure itself",
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
    a: `Access to A Truer Measure for ${PRICE_SCOPE}, at US$${FOUNDERS_USD} a month for your first ${FOUNDERS_MONTHS} months and US$${PRICE_USD} a month after that: a place to bring together report cards, teacher comments, your own observations, projects and moments from beyond school, and to look at what they show together over time. Your membership continues for as long as you keep it.`,
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
    q: "Can I take my child's record with me?",
    a: "Yes. You can ask for a copy in a portable format at any time, at no charge, by writing to privacy@truermeasure.com.",
  },
  {
    q: "Is the price per child or per family?",
    a: `US$${FOUNDERS_USD} a month covers ${PRICE_SCOPE}, and so does US$${PRICE_USD} a month after the founders rate ends.`,
  },
  {
    q: `What happens after ${FOUNDERS_MONTHS} months at US$${FOUNDERS_USD}?`,
    a: `Your tenth monthly payment is US$${PRICE_USD}, and every one after that. Nothing else changes and you do not have to do anything. We email you before the first US$${PRICE_USD} payment so it is never a surprise on a statement.`,
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
    // Taken from the policies Jolene has already written, in the app repo:
    //   app/legal/privacy-policy.md   section 9 (how long we keep things)
    //                                 section 10 (your rights)
    //   app/legal/terms-of-service.md section 5 (cancelling)
    //
    // Everything below is quoted from those, not invented here.
    //
    // The retention period was the one number missing. Jolene ruled it on
    // 29 September 2026: ONE YEAR after a membership ends, then deleted, with
    // notice first. privacy-policy.md section 9 in the app repo still reads
    // `[POST_TERM_RETENTION_PERIOD - founder decision]` and needs the same
    // number written into it, or the two documents will disagree.
    q: "What happens to my child's information if I cancel?",
    a: "Cancelling does not delete your child's record. We keep it for a year after your membership ends, and we tell you before we delete anything. At any time you can ask for a copy in a portable format, or ask us to delete it, in which case it is gone from our active systems within 30 days and from backups within seven days after that. Write to privacy@truermeasure.com and we answer within 30 days, at no charge.",
  },
];
