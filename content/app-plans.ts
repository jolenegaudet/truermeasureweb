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
import type { CurrencyCode } from "@/components/currency-toggle";

/**
 * THE AMOUNTS ARE NOT IN THIS FILE.
 *
 * They are in content/app-prices.ts, which no client component imports, for
 * the reason set out there: this module is imported by the card, the card is a
 * client component, and anything declared here ships in a JavaScript chunk
 * whatever a build-time flag says. Her prices are unapproved, so they may not
 * ship. The flag below still gates everything else.
 *
 * The app agrees that no price is set: `plan.prices` in the customer app is
 * still `{ monthly: '', schoolYear: '' }`, so no checkout can open for a price
 * nobody has approved. Nothing in this file touches Stripe.
 */

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
 *
 * It is declared here, above the prices, because the prices themselves are
 * gated on it: see APP_PRICES.
 */
export const PRICE_PREVIEW = process.env.NEXT_PUBLIC_TM_PRICE_PREVIEW === "1";
export const PRICE_PLACEHOLDER = "Price to be set";

/**
 * Monthly or yearly, with 10% off the yearly (her brief, 29 October 2026).
 *
 * The app already does this: `server/billing.js` keeps
 * `{ month: TM_STRIPE_PRICE_MONTHLY, year: TM_STRIPE_PRICE_YEARLY }`, offers
 * whichever exist, and takes `{ interval }` at checkout. Its own note sets the
 * rule this page has to honour: "a checkout is never opened for a price the
 * parent has not been shown." So the yearly figure below must be the yearly
 * figure in Stripe, to the cent.
 *
 * 10% off is a second Stripe price, not a coupon. `TM_STRIPE_INTRO_COUPON`
 * exists but applies once to a first subscription, which is a different thing
 * from a standing yearly rate.
 *
 * Note for the app: the deferred feature named 'annual' in `js/account.js` is
 * the yearly *report*, not yearly *billing*. Checked on 29 October 2026, so
 * offering a yearly subscription claims nothing that is hidden from accounts.
 */
export type BillingInterval = "month" | "year";
export const YEARLY_DISCOUNT = 0.1;
export const DEFAULT_INTERVAL: BillingInterval = "month";

/** The yearly amount: twelve months, less 10%. 47 a month gives 507.60 a year. */
export function yearlyAmount(monthly: number): number {
  return Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT) * 100) / 100;
}

/** What a yearly subscription works out to each month. 507.60 gives 42.30. */
export function monthlyEquivalent(monthly: number): number {
  return Math.round((yearlyAmount(monthly) / 12) * 100) / 100;
}

/** What a year of monthly billing costs, less the yearly price. */
export function yearlySaving(monthly: number): number {
  return Math.round((monthly * 12 - yearlyAmount(monthly)) * 100) / 100;
}

/** Two decimals only when there are cents: 47, and 507.60. */
export function money(symbol: string, amount: number): string {
  return symbol + (Number.isInteger(amount) ? String(amount) : amount.toFixed(2));
}

/** CAD leads, as her brief asks, and is the default. */
export const DEFAULT_CURRENCY: CurrencyCode = "CAD";
export const APP_CURRENCY_ORDER: CurrencyCode[] = ["CAD", "USD", "EUR"];

/**
 * The published demo. Verified HTTP 200 on 28 October 2026.
 *
 * Every button in this section points here, because the customer app is not
 * published: her brief of 28 October, "use working demo destinations for the
 * current buttons. Make availability clear."
 *
 * How that is made clear changed on 1 November 2026. The boxed paragraph that
 * said the app was not open to families, and the "Be the first to know" button
 * inside it, came off at her instruction, which also said: "conserve une
 * indication discrète près des boutons précisant qu'ils ouvrent encore le
 * démo." So what remains is `demoNote` under each button, plus `demoOnly`
 * under the cards. Those two lines are now the only thing standing between a
 * parent and the belief that these buttons register them, which is why they
 * stay until the buttons point at the real app. Her brief for that day is
 * explicit that they may then go: "L'indication concernant le démo pourra
 * alors disparaître."
 *
 * The Kit signup itself is untouched and still runs on /hidden-report-card in
 * both languages; only its copy inside this section was removed.
 */
export const DEMO_URL = "https://demo.truermeasure.com/";

/**
 * WHERE THE BUTTONS GO, and why they do not go to registration yet.
 *
 * Her brief, 28 October 2026: "Prepare both buttons to use the real customer
 * app's registration flow when the landing-page update is published. Use the
 * actual production app URL and existing supported routes... If the production
 * destination is not ready, identify exactly what remains to connect. Don't
 * invent a URL."
 *
 * ── THE PRODUCTION APP DOES NOT EXIST ─────────────────────────────────────
 *
 * Not "is not finished". Has never been created. From the customer app's own
 * deploy script, prototype/.worktrees/launch/deploy/azure-accounts.sh:
 *
 *   # NOT RUN YET. Creating these resources costs money every month and holds
 *   # real families' records: it waits for the founder's authorization.
 *   # To create them, run with TM_CONFIRM_CREATE=yes.
 *
 * and, if anyone runs it without that:
 *
 *   "The production resources don't exist. Creating them needs the founder's
 *    go-ahead: run with TM_CONFIRM_CREATE=yes."
 *
 * The host it WOULD create is truermeasure-app.azurewebsites.net (the script's
 * default `TM_APP`), overridable with TM_PUBLIC_URL. Checked on 28 October
 * 2026: that name does not resolve. It is therefore not a URL, it is a guess
 * about a future one, and her brief says not to invent one.
 *
 * demo.truermeasure.com is live and is NOT a substitute: the demo runs with
 * TM_ACCOUNTS unset, so, in its own README's words, "the site serves the demo,
 * never an account". Nobody can register there.
 *
 * So `url` stays null, the buttons keep going to the demo, and each one says
 * so underneath. Set `url` and every button switches over; nothing else needs
 * editing.
 *
 * ── WHAT REMAINS TO CONNECT ───────────────────────────────────────────────
 *
 *  1. Her authorization to create the production resources, then
 *     `TM_CONFIRM_CREATE=yes bash deploy/azure-accounts.sh` (resource group,
 *     App Service plan, Postgres 16 and web app, Canada Central). This starts
 *     a monthly bill.
 *  2. The secrets the script reads from the workspace .secrets folder:
 *     anthropic.env (ANTHROPIC_API_KEY) and launch.env (STRIPE_SECRET_KEY,
 *     STRIPE_WEBHOOK_SECRET, the Stripe price ids, GRAPH_* for sending email,
 *     SERVICE_EMAIL_SENDER, TM_OPS_EMAIL).
 *  3. The public hostname: the azurewebsites default, or a custom one through
 *     TM_PUBLIC_URL with a CNAME and a managed certificate, the way
 *     demo.truermeasure.com was set up on 20 October.
 *  4. A real price. The app's `plan.prices` is still empty, and live payments
 *     additionally need TM_ALLOW_LIVE_PAYMENTS=1, which the deploy script
 *     describes as the founder's switch to give.
 *
 * ── CARRYING THE PLAN INTO REGISTRATION ───────────────────────────────────
 *
 * Her brief: "Where supported, carry the selected plan into registration."
 * It is not supported. The customer app reads exactly two query parameters,
 * `?checkout=done|cancelled` (js/account.js) and `?code=` for an invite
 * (js/ai.js). There is no `?plan=`. The plan is chosen inside onboarding, on
 * the "How do you want to start with {name}?" screen, after the child's name.
 *
 * Adding one would be a change to the customer app, which this brief rules
 * out. So `planParam` is false and no plan is appended; when the app learns
 * `?plan=`, set it to true and the links carry `school` or `full`.
 *
 * ── THE VERIFIED ROUTE, confirmed with the app session on 29 October ──────
 *
 * Her brief: "Prepare the app buttons to use the verified customer-app
 * registration routes… Do not substitute demo links or invent a production
 * URL." The route, in the app session's words rather than my reading of the
 * code:
 *
 *   - There is no separate registration path. A new parent lands on `/`, the
 *     app's welcome, and presses "Start with my child", which opens the email
 *     sign-in sheet. Sign-up and sign-in are the same emailed link, and the
 *     plan is chosen inside onboarding after the child's details.
 *   - On `/` the app accepts `currency=CAD|USD|EUR` and `billing=month|year`.
 *     Both are read only in account mode, kept in localStorage so the emailed
 *     sign-in link still has them, and removed from the address bar. Unknown
 *     values are ignored.
 *   - `?checkout=` is Stripe's own return parameter and `?code=` is an old
 *     demo invite code. The website must never send either.
 *   - No production host exists. deploy/azure-accounts.sh has never been run,
 *     launch.env does not exist, and the only running instance is her review
 *     copy on this computer.
 *
 * So `path` below is recorded and `url` stays null: the host is the single
 * missing piece, and setting it switches every button over. Until then the
 * buttons open the demo and say so underneath, which is the state her brief of
 * 28 October approved; nothing here invents a URL.
 */
/**
 * THE CURRENCY HANDOFF, and the only place its parameter names are written.
 *
 * Her brief, 29 October 2026: "the currency selected on the website reaches the
 * app and checkout, including a visitor's manual override."
 *
 * The site and the app are separate origins, so nothing in the browser is
 * shared between them: not localStorage, not sessionStorage, not a cookie. The
 * one thing that crosses is the link the parent clicks, so the choice travels
 * on it, as two parameters:
 *
 *   ?currency=CAD|USD|EUR    which of the three prices the parent was shown
 *   ?billing=month|year      which billing period was selected with it
 *
 * Both are stamped on from the same attribute that decides which price is on
 * screen (`data-tm-currency`, read by app/globals.css), so what travels is what
 * the parent read, a manual override included. These names are interpolated
 * into the inline script in app/layout.tsx rather than repeated there, so the
 * script and this file cannot drift apart.
 *
 * Absent parameters mean the app chooses for itself, and its own default has to
 * be CAD, because CAD is what a visitor with JavaScript off is shown here.
 *
 * What the app must do with them is docs/currency-handoff-2026-10-29.md. The
 * website's side is finished; the app's side is not, and until it lands a
 * parent who picks USD can still be charged in CAD by Stripe's own
 * localisation (server/billing.js opens a Checkout Session with no currency).
 */
export const HANDOFF = {
  currency: "currency",
  interval: "billing",
} as const;

/**
 * A local destination for the preview, so the handoff can be tested end to end
 * without inventing a production URL.
 *
 * The production app still does not exist, so `url` below is still null for
 * everyone. This reads a second variable that only exists on this computer:
 *
 *   NEXT_PUBLIC_TM_PRICE_PREVIEW=1 NEXT_PUBLIC_TM_APP_URL=http://localhost:8765
 *
 * With the price preview off, which is Netlify and every ordinary build, it is
 * the empty string whatever else is set, so no build that could be published
 * can point a button anywhere but the demo.
 */
const PREVIEW_APP_URL =
  process.env.NEXT_PUBLIC_TM_PRICE_PREVIEW === "1"
    ? (process.env.NEXT_PUBLIC_TM_APP_URL || "").trim()
    : "";

export const REGISTRATION: {
  /** The customer app's host. Null until the production app is created. */
  url: string | null;
  /** The route a new parent lands on, verified with the app session. */
  path: string;
  planParam: boolean;
  /** Whether the destination understands ?currency= and ?billing=. */
  currencyParam: boolean;
} = {
  url: PREVIEW_APP_URL || null,
  path: "/",
  planParam: false,
  currencyParam: true,
};

/** Where a plan's button actually points today. */
export function planHref(
  plan: "school" | "full",
  carry?: { currency?: CurrencyCode; interval?: BillingInterval },
): string {
  if (!REGISTRATION.url) return DEMO_URL;
  let url: URL;
  try {
    url = new URL(REGISTRATION.path, REGISTRATION.url);
  } catch {
    return REGISTRATION.url;
  }
  if (REGISTRATION.planParam) url.searchParams.set("plan", plan);
  if (REGISTRATION.currencyParam) {
    if (carry?.currency) url.searchParams.set(HANDOFF.currency, carry.currency);
    if (carry?.interval) url.searchParams.set(HANDOFF.interval, carry.interval);
  }
  return url.toString();
}

/** True while the buttons still lead to the demo rather than registration. */
export const GOES_TO_DEMO = REGISTRATION.url === null;

/**
 * Whether a link should carry the choice: only when it actually leads to the
 * app. The demo ignores both parameters, and a parent who opens it should not
 * be handed a URL with billing in it.
 */
export const CARRIES_CHOICE = !GOES_TO_DEMO && REGISTRATION.currencyParam;

type AppPlans = {
  sectionEyebrow: string;
  sectionHeading: string;
  /** Under each button, because a button label is the wrong place for it. */
  demoNote: string;
  /** Named beside the demo links: in the demo, not in the app at launch. */
  demoOnly: string;
  /**
   * What one subscription covers. Her decision of 29 October 2026: ONE CHILD,
   * replacing the per-account wording this file carried on 28 October. It sits
   * in the paid card's top group, beside the price, because it is part of
   * knowing what the price buys. Her brief also says not to invent how more
   * children would be bought, so nothing here does.
   */
  covers: string;
  free: {
    eyebrow: string;
    price: string;
    heading: string;
    includes: string[];
    /** Her sentence that the free plan takes report cards and nothing else. */
    only: string;
    cta: string;
  };
  paid: {
    eyebrow: string;
    heading: string;
    plus: string;
    includes: string[];
    tagline: string;
    cta: string;
    billing: string;
    cancel: string;
  };
  perMonth: string;
  perYear: string;
  /** The billing-period selector's visible label. */
  intervalLabel: string;
  monthlyWord: string;
  yearlyWord: string;
  /** Under a yearly amount: what it comes to monthly, and what it saves. */
  yearlyNote: (monthly: string, saved: string) => string;
  /** Beside the amount, per currency: tax on top, or tax already inside. */
  taxExclusive: string;
  taxInclusive: string;
  /** Shown for a currency whose amount is not set. */
  priceToBeConfirmed: string;
  /**
   * The two closing lines, shown once under both cards. Everything else that
   * used to sit under them came off on 2 November 2026; the note above
   * `choice` in the English block below says what, and where the disclosures
   * it carried live now.
   */
  choice: string;
  close: string;
};

/**
 * Both languages, rewritten on 29 October 2026 for her readability brief:
 * "Write for a busy parent, at roughly a fourth-grade reading level… short
 * sentences, familiar words, concrete examples and one idea per bullet", and
 * "Apply the same simplicity in natural Canadian French."
 *
 * What that changed, beyond shortening sentences:
 *
 *  - The seven-part "What School & Life gives you" section is gone. It was
 *    around 1,400 words of feature description. In its place came a short
 *    two-column comparison, which her brief of 2 November then removed as
 *    well: the whole panel under the cards is gone, and what is left of it is
 *    `choice` and `close`.
 *  - Each card's list is four bullets of one idea each, down from five and
 *    two supporting lines.
 *
 * What did not change: her own approved lines are still here word for word,
 * marked below, and nothing describes a feature the customer app does not give
 * a customer. scripts/check-app-claims.mjs holds this file to that.
 *
 * THE FRENCH follows the conventions already on /fr rather than new ones:
 * "l'enseignante" as the generic teacher, curly apostrophes, and a
 * non-breaking space before :, ! and ?.
 */
export const appPlans: Record<Locale, AppPlans> = {
  en: {
    /* Her triad of 30 September 2026 splits where the page splits: this is its
       first clause, and the other two head the row underneath. */
    sectionEyebrow: "Start with Clarity",
    sectionHeading: "See what grades don’t show.",

    demoNote: "Opens the demo in a new tab.",
    /* Her brief of 28 October: "Beside the demo links, clearly identify those
       as demo previews unavailable in the customer app at launch." Naming the
       four is the point of the sentence. */
    demoOnly:
      "The demo also shows yearly reports, pages for your child, résumé building and growth since last year. Those are demo previews. They are not in the app at launch.",

    covers: "One subscription covers one child.",

    free: {
      eyebrow: "School",
      price: "Free",
      /* Her words, 23 October 2026 (onboarding.choose.school). */
      heading: "Understand your child’s report cards.",
      includes: [
        "Add a report card. A PDF or a photo works.",
        "Read it explained in plain words.",
        "Get questions to ask the teacher.",
        "Get simple ideas to try at home.",
      ],
      only: "Report cards only.",
      cta: "Start free",
    },

    paid: {
      eyebrow: "School & Life",
      heading: "See what everyday moments show.",
      plus: "Everything in School, plus:",
      /* Her four lines, dictated on 1 November and used word for word. They
          say what a parent gets rather than what the app holds, which is why
          they are shorter than what they replaced.
          The profile, the timeline and Reflect together moved into the
          expanded comparison on 1 November, which her brief of 2 November
          then removed. So the website no longer names them anywhere, and
          these four lines are the whole of what the paid plan says it does.
          Her brief is explicit that nothing replaces what came off. */
      includes: [
        "Recognize what grades miss.",
        "Keep the moments that show it.",
        "Make five minutes together a habit.",
        "See the bigger picture.",
      ],
      tagline: "Get the Truer Measure.",
      cta: "Choose School & Life",
      billing: "Pay monthly or yearly.",
      /* Her cancel sentence, 20 October 2026, in her words. */
      cancel:
        "Cancel any time. School & Life stays until the end of the paid period, and everything you added stays with you.",
    },

    perMonth: "/ month",
    perYear: "/ year",
    intervalLabel: "Pay",
    monthlyWord: "Monthly",
    yearlyWord: "Yearly",
    yearlyNote: (monthly, saved) =>
      `${monthly} a month, paid once a year. You save ${saved}.`,
    taxExclusive: "Plus applicable taxes.",
    taxInclusive: "VAT included.",
    priceToBeConfirmed: "Price to be confirmed",

    /**
     * THE CLOSING LINES, and what used to be under them.
     *
     * Her brief of 2 November 2026 took the whole "Compare the two plans"
     * panel off both languages: the control that opened it, the two-column
     * comparison, the repeated subscription and cancellation lines, the
     * monthly reading allowance and the fictional example. These two lines
     * were inside it. They now stand on their own under the cards, with no box
     * around them and nothing written to replace what came off, which that
     * brief rules out: "Do not add replacement explanations."
     *
     * WHERE THE DISCLOSURES ARE NOW, so nobody puts them back here by
     * accident. Her brief: "Subscription conditions and reading limits remain
     * unchanged; preserve their existing disclosures elsewhere in the purchase
     * journey and legal documents." On the website, what a subscription covers
     * is still on the paid card (`covers`), and `demoNote` and `demoOnly` are
     * untouched. The cancellation sentence (`paid.cancel`) and the reading
     * allowance are no longer displayed anywhere on the website: both are the
     * customer app's, in her own words, in the app's js/config.js
     * (plan.terms.cancel) and enforced by server/engine.js. `paid.cancel` is
     * kept in this file because the app's registration and checkout are what
     * must show it, and whoever connects those buttons will need her sentence.
     *
     * Both lines are hers. The first is unchanged from 29 October. The second
     * is her own closing line with a new ending, dictated on 2 November:
     * "see the bigger picture" in place of "understand the picture they
     * build".
     */
    choice: "You choose what goes in. Nothing is added without you.",
    close:
      "You capture the moments. Truer Measure helps you see the bigger picture.",
  },

  fr: {
    sectionEyebrow: "Commencez par la clarté",
    sectionHeading: "Voyez ce que les notes ne montrent pas.",

    demoNote: "Ouvre la démo dans un nouvel onglet.",
    demoOnly:
      "La démo montre aussi les bilans annuels, les pages pour votre enfant, la création d’un CV et la croissance depuis l’an dernier. Ce sont des aperçus. Ils ne font pas partie de l’application au lancement.",

    covers: "Un abonnement couvre un enfant.",

    free: {
      eyebrow: "École",
      price: "Gratuit",
      heading: "Comprenez les bulletins de votre enfant.",
      includes: [
        "Ajoutez un bulletin, en PDF ou en photo.",
        "Recevez une explication en mots simples.",
        "Recevez des questions à poser à l’enseignante.",
        "Recevez des idées simples à essayer à la maison.",
      ],
      only: "Bulletins seulement.",
      cta: "Commencer gratuitement",
    },

    paid: {
      eyebrow: "École et vie",
      heading: "Voyez ce que les moments du quotidien montrent.",
      plus: "Tout ce qu’il y a dans École, plus :",
      includes: [
        "Remarquez ce que les notes ne montrent pas.",
        "Gardez les moments qui le révèlent.",
        "Faites de cinq minutes ensemble une habitude.",
        "Voyez le portrait d’ensemble.",
      ],
      tagline: "Obtenez une juste mesure.",
      cta: "Choisir École et vie",
      billing: "Payez au mois ou à l’année.",
      cancel:
        "Annulez quand vous voulez. École et vie reste jusqu’à la fin de la période payée, et tout ce que vous avez ajouté reste avec vous.",
    },

    perMonth: "/ mois",
    perYear: "/ an",
    intervalLabel: "Payer",
    monthlyWord: "Par mois",
    yearlyWord: "Par année",
    yearlyNote: (monthly, saved) =>
      `${monthly} par mois, payé une fois par année. Vous économisez ${saved}.`,
    taxExclusive: "Plus les taxes applicables.",
    taxInclusive: "TVA incluse.",
    priceToBeConfirmed: "Prix à confirmer",

    /* Her two lines of 2 November, word for word, with one styling decision:
       she typed the French mark as "Juste mesure", and her brief asks to
       "preserve the approved French brand styling", so it is capitalised the
       way /fr carries it (content/i18n.ts, and FRENCH_MARK at the foot of this
       file). Nothing else about the sentence changed. */
    choice: "Vous choisissez ce que vous ajoutez. Rien n’est ajouté sans vous.",
    close:
      "Vous gardez les moments. Juste Mesure vous aide à voir le portrait d’ensemble.",
  },
};

/** Convenience for a page that already knows its locale. */
export function appPlansFor(locale: Locale): AppPlans {
  return appPlans[locale];
}

/**
 * The French mark, in one place.
 *
 * Her brief says "preserve Juste Valeur(TM)". Nothing on this site has ever
 * carried that name; what it does carry, since her ruling of 1 October, is
 * "Une Juste Mesure" (content/i18n.ts) and the headline "une juste mesure" on
 * the French home page. justemesure.ca is her domain; justevaleur.ca, as she
 * established on 2 October, is someone else's, and "valeur" is the accounting
 * term for fair value. So the mark kept here is the one that exists. If she
 * means the other, this line is the only edit.
 */
export const FRENCH_MARK = "Juste Mesure\u2122";
