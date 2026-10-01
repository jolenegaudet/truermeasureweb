/**
 * THE FOUNDING FAMILIES OFFER. Every number and promise about it on the site
 * comes from this one file.
 *
 * Jolene's ruling, 30 September 2026, replacing the 29 September offer
 * (US$47 until 30 June 2027, then US$67, charged in USD only):
 *
 *   - Founding Families, limited to the first 50 families. No closing date,
 *     and no places-left counter on the site (she handles that on social).
 *   - First 3 monthly payments: CA$39 / US$27 / EUR23. Counted from each
 *     family's own start date, which Stripe does natively (a coupon that
 *     repeats for 3 months), so the page and the billing cannot drift apart.
 *   - Then CA$59 / US$42 / EUR35 a month.
 *   - Charged in the family's currency, not converted from USD.
 *   - Tax added on top at checkout ("plus applicable taxes"). How it is
 *     calculated is an accountant question, still open.
 *   - The Feedback button is included for the first 3 months.
 *
 * The Terms of Service draft (app repo, legal/terms-of-service.md section 2)
 * was rewritten the same day to match.
 *
 * Stripe was configured for it the same day (see CHECKOUT_URL below).
 */

export const PRICE_SCOPE = "one child";

/** Places at the introductory rate. Enforced by the checkout link, not here. */
export const FOUNDING_CAP = 50;

/** Monthly payments at the introductory rate, from each family's own start. */
export const INTRO_MONTHS = 3;

export type Price = { code: "CAD" | "USD" | "EUR"; symbol: string; intro: number; standard: number };

/** Canadian first: most of the audience is in New Brunswick. */
export const prices: Price[] = [
  { code: "CAD", symbol: "CA$", intro: 39, standard: 59 },
  { code: "USD", symbol: "US$", intro: 27, standard: 42 },
  { code: "EUR", symbol: "€", intro: 23, standard: 35 },
];

const list = (pick: (p: Price) => number) => prices.map((p) => `${p.symbol}${pick(p)}`).join(" / ");
export const INTRO_LIST = list((p) => p.intro);
export const STANDARD_LIST = list((p) => p.standard);

/**
 * The checkout for the new offer, created in Stripe on 30 September 2026:
 *   price   price_1ULPkSAJm8m0sW6oV8ZLcZaV  US$42 / CA$59 / EUR35 a month, tax exclusive
 *   coupon  WAJkw9F9   US$15 / CA$20 / EUR12 off, repeating 3 months, max 50
 *   code    FOUNDINGFAMILY (max 50), prefilled by the URL so nobody types it
 *   link    plink_1ULPkTAJm8m0sW6oRUgngR3U, automatic tax on, closes after 50
 *           completed checkouts (restrictions.completed_sessions.limit)
 * The old FOUNDING47 link (buy.stripe.com/dRmfZg96J6N75MvaEoe7m08) charges the
 * old prices and is switched off once this site is published.
 */
export const CHECKOUT_URL: string =
  "https://buy.stripe.com/cNidR8er37Rbej18wge7m09?prefilled_promo_code=FOUNDINGFAMILY";
export const checkoutReady = CHECKOUT_URL !== "";

export const DEMO_URL = "https://truermeasure-preview.azurewebsites.net/#home";

/**
 * How long a child's record is kept after a membership ends, before it is
 * deleted with notice. Jolene's ruling, 29 September 2026.
 * The app repo's privacy-policy.md section 9 needs this number too.
 */
export const RETENTION_AFTER_END = "a year";

/** Jolene's wording, 30 September 2026 ("a Feedback button or possible private calls"). */
export const offerNote =
  "You’re joining early, so you get an introductory rate and ways to tell us what to build next: a Feedback button, and possibly private calls.";

/**
 * Split in two on 1 October 2026. The price block now states the standing
 * price in the currency the parent chose, so a page that shows the price block
 * must not also list all three underneath it.
 */
export const STANDARD_AFTER_INTRO = `Then ${STANDARD_LIST} per month, plus applicable taxes.`;
export const CANCELLATION_TERMS =
  "Billed monthly. Cancel any time. You keep the month you have paid for.";

/** Both lines together, for anywhere that needs the whole statement at once. */
export const billingTerms: string[] = [STANDARD_AFTER_INTRO, CANCELLATION_TERMS];

/** What a founding family gets, and for how long. */
export const foundingIncludes: { what: string; howLong: string }[] = [
  {
    what: "The Feedback button inside the product",
    howLong: `For the first ${INTRO_MONTHS} months`,
  },
  {
    what: "The Hidden Report Card™ platform and dashboard",
    howLong: "For as long as you are a member",
  },
];

/**
 * The FAQ. OFF THE PAGE since 30 September 2026, until Jolene decides what it
 * says. The price answers were brought in line with the new offer the same
 * day so nothing here is stale when it returns; she has not reviewed them.
 */
export type Faq = { q: string; a: string; toConfirm?: boolean };

export const faqs: Faq[] = [
  {
    q: "What am I paying for?",
    a: `Access to A Truer Measure for ${PRICE_SCOPE}, at ${INTRO_LIST} a month for your first ${INTRO_MONTHS} months and ${STANDARD_LIST} a month after, plus applicable taxes: a place to bring together report cards, teacher comments, your own observations, projects and moments from beyond school, and to look at what they show together over time. Your membership continues for as long as you keep it.`,
  },
  {
    q: "What does being a founding family involve?",
    a: `You are joining early and helping shape what gets built. That means the Feedback button in the product for your first ${INTRO_MONTHS} months. Jolene reads what founding families send. Not every suggestion will be built, and this is not individual consulting.`,
  },
  {
    q: "How often can I get an updated report?",
    a: "Whenever you want. Add something new, a report card, a project, a photo, something a coach or a teacher said, and regenerate. There is no monthly allowance and nothing to pay for extra ones.",
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
    a: `${INTRO_LIST} a month covers ${PRICE_SCOPE}, and so does ${STANDARD_LIST} a month after your first ${INTRO_MONTHS} months.`,
  },
  {
    q: `What happens after my first ${INTRO_MONTHS} months?`,
    a: `Your next payment is at the standard price, ${STANDARD_LIST} a month plus applicable taxes, and so is every one after it. Nothing else changes and you do not have to do anything. We email you before it happens.`,
  },
  {
    q: "Does this include Learn From The Room or Inner Circle?",
    a: "No. Those are separate, and joining as a founding family does not include either of them.",
  },
  {
    // Jolene's wording, 29 September 2026: cancel any time, but the month
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
