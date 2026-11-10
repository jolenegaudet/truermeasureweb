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
 * the amount is not, and `SHOW_PRICES` below keeps every amount off anything
 * built without the flag that says she has approved them.
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
 * Whether the amounts may be shown at all.
 *
 * Her brief: "the dollar amount remains unapproved" and "Keep any unapproved
 * price placeholder confined to the local preview."
 *
 * `process.env.NEXT_PUBLIC_*` is inlined at build time, so with neither
 * variable set (Netlify today, and every ordinary `npm run build`) this is
 * false and no amount exists in the exported HTML at all. It is not hidden
 * with CSS, it is absent. To see them locally:
 *
 *   NEXT_PUBLIC_TM_PRICE_PREVIEW=1 npm run dev
 *
 * ── TWO VARIABLE NAMES, ONE GATE (2 November 2026) ────────────────────────
 *
 * `NEXT_PUBLIC_TM_PRICE_PREVIEW` is the local switch this file has carried
 * since 28 October, and every preview build and screenshot she has approved
 * was made with it. `NEXT_PUBLIC_TM_PRICES_APPROVED` is the same switch under
 * the name it takes in Netlify at launch, and it exists because a production
 * environment variable called PREVIEW is the kind of thing somebody deletes as
 * leftover configuration. Deleting this one would take the prices off the live
 * page, drop the before-paint script, and send every button back to the demo,
 * silently and with a passing build. Either name set to "1" shows the prices.
 *
 * Nothing else differs between the preview and the launch build. That is
 * deliberate: what she approves locally is what ships.
 *
 * ── WHAT THIS DOES NOT TURN ON ────────────────────────────────────────────
 *
 * The `?tm-country=` override, which used to ride along on the same flag. It
 * now has COUNTRY_OVERRIDE below, because the launch build sets this one and
 * would otherwise have carried a public way to be shown another country's
 * price.
 */
export const SHOW_PRICES =
  process.env.NEXT_PUBLIC_TM_PRICES_APPROVED === "1" ||
  process.env.NEXT_PUBLIC_TM_PRICE_PREVIEW === "1";

/**
 * The local country override, which must never be set in Netlify.
 *
 * It is the `?tm-country=FR` facility in app/layout.tsx: a way to read the page
 * as another country would see it without deploying. Until 2 November it was
 * gated on the price preview, on the reasoning that the price preview "cannot
 * exist in a build that could be published". Preparing the launch build is
 * exactly what breaks that reasoning, because the launch build sets the price
 * flag. So it has its own variable, it is off unless asked for, and
 * scripts/check-launch-build.mjs fails the build if `tm-country` appears in the
 * exported HTML.
 *
 *   NEXT_PUBLIC_TM_PRICE_PREVIEW=1 NEXT_PUBLIC_TM_COUNTRY_OVERRIDE=1 npm run dev
 *
 * On a deployed host the override does nothing anyway: it only acts when
 * `data-tm-currency` is absent, and the edge function has already set it. The
 * reason to keep it out is that it is a preview facility, not that it would
 * win.
 */
export const COUNTRY_OVERRIDE =
  process.env.NEXT_PUBLIC_TM_COUNTRY_OVERRIDE === "1";

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

/**
 * What a button sends when the page carries no currency attribute.
 *
 * USD since 4 November 2026, matching CURRENCY_WHEN_UNKNOWN in
 * content/currency-map.ts, which is what the visitor is reading. The two must
 * never disagree: the amount on the page and the currency in the link are the
 * same promise. Her rule that day: "autre pays ou localisation inconnue → USD",
 * in both languages. It was CAD before.
 *
 * CAD still leads APP_CURRENCY_ORDER below, because that is the order amounts
 * are listed in, not what an unplaceable visitor is charged.
 */
export const DEFAULT_CURRENCY: CurrencyCode = "USD";
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
 * The Kit signup's copy inside this section was removed then. The signup
 * itself came off the site entirely on 9 November 2026, when the product
 * launched and "be the first to know" stopped being true. Her decision the
 * same day: "The site does not need an email sign up for now. The paid option
 * was the goal." The list, the tag and netlify/functions/kit-subscribe.ts are
 * all intact and nothing on the site opens them. Do not add one back
 * unprompted; she is weighing a newsletter or a low-ticket offer separately.
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
 * What the app must do with them is docs/currency-handoff-2026-10-29.md.
 *
 * Confirmed by the app session on 3 November 2026, against its launch commit
 * 19903d2: the app reads exactly these two names, with exactly these values, at
 * exactly the route REGISTRATION.path names, and carries them through sign-in,
 * including a link opened on another device. So the handoff itself is settled on
 * both sides.
 *
 * AND THE CHARGE MATCHES WHAT WAS READ. Answered 3 November 2026. The 29 October
 * gap, where server/billing.js opened a Session with no currency and let Stripe
 * localise, closed in the app at 69d3f4a: handleCheckout now sends the carried
 * currency on every Session, refuses anything outside cad/usd/eur, refuses a
 * currency the price has no amount for, turns Stripe's adaptive pricing off so
 * its page cannot offer another, and returns 409 when the customer already paid
 * in a different one. One price per period carries all three as currency
 * options, so the amount comes from Stripe, never from this query string.
 *
 * Which is the right shape, because `?currency=` is advisory. A parent can edit
 * it in the address bar. What decides what she SEES here is the Netlify edge
 * function's country; what decides what she PAYS is the price id's currency
 * option. Editing the parameter changes which of the three amounts she is shown
 * on the app's confirmation sheet, and she then pays exactly that. All three are
 * 47 or 507.60, so no amount on this page can be contradicted by a charge.
 *
 * Verified in the sandbox across all three currencies and both periods, six
 * checkouts, 29 October (app commit f432dbc). LIVE CHARGING IS UNTESTED: no live
 * purchase has been made, and it cannot be until her release decision.
 */
export const HANDOFF = {
  currency: "currency",
  interval: "billing",
} as const;

/**
 * The customer app's host, when there is one: the single value that connects
 * this page to registration.
 *
 * Set it and every button switches from the demo to the app, both demo labels
 * disappear (`demoNote` under each button, `demoOnly` under the cards), and the
 * links start carrying `?currency=` and `?billing=`. Nothing else has to be
 * edited, and no copy changes: that is the prepared removal her brief of
 * 1 November asked for. Leave it unset and the page stays exactly as she is
 * reviewing it.
 *
 *   NEXT_PUBLIC_TM_APP_URL=https://app.example.com
 *
 * Confirmed with the app session on 2 November 2026, against the launch branch
 * at e44b1f0: the production app still does not exist. `az group exists -n
 * truermeasure-prod-rg` is false, deploy/azure-accounts.sh has never been run,
 * and creating it needs her separate approval, which she has not given. The
 * host will be TM_PUBLIC_URL if set, otherwise the Azure default; the planned
 * app.truermeasure.com is not configured anywhere yet. So this stays unset, and
 * the buttons keep opening the demo and saying so.
 *
 * STILL GATED ON THE PRICES. With SHOW_PRICES false, which is Netlify today and
 * every ordinary build, this is the empty string whatever else is set, so no
 * build that could be published can point a button at registration while the
 * amounts beside that button are unapproved. The two go live together or not at
 * all.
 */
const APP_HOST = SHOW_PRICES
  ? (process.env.NEXT_PUBLIC_TM_APP_URL || "").trim()
  : "";

export const REGISTRATION: {
  /** The customer app's host. Null until the production app is created. */
  url: string | null;
  /** The route a new parent lands on, verified with the app session. */
  path: string;
  /**
   * Whether the link names the plan. False, and settled: the app session
   * confirmed on 3 November 2026 that it needs no plan parameter, because the
   * app asks School or School & Life in its own onboarding. Currency and
   * billing only pre-set what a parent sees if they later choose School & Life,
   * so sending both on the free button is correct, not a leak.
   */
  planParam: boolean;
  /** Whether the destination understands ?currency= and ?billing=. */
  currencyParam: boolean;
} = {
  url: APP_HOST || null,
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
  /** "Start with Clarity", above the cards on the home page in both
   *  languages. It is the first of the three labels that name the parts of
   *  that page, before "Continue with Community." and "Grow with Proximity."
   *  The product pages do not show it (PlanCards, `showEyebrow`). */
  sectionEyebrow: string;
  /**
   * RETIRED 9 November 2026. Nothing renders this.
   *
   * It was "See what grades don't show.", centred under the eyebrow above both
   * cards. It is now `paid.promise`, on the School & Life card, because the
   * free plan cannot keep that promise and a line over both cards reads as
   * covering both.
   *
   * KEPT, not deleted: it is her sentence and it still exists verbatim one
   * field below. Delete it once it is clear no band is coming back here.
   */
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
    /**
     * The card's opening promise, under the plan name and above the price.
     *
     * Added 9 November 2026. It is the sentence that used to head the whole
     * section, over both cards: "See what grades don't show needs to be on
     * the … of the paid tier (School and Life) only." She is right that it was
     * in the wrong place. The free plan reads report cards and says so
     * ("Report cards only."), so a promise to show what grades do NOT show was
     * being made over a card that cannot keep it.
     *
     * It sits above the price on purpose, which is where she put it: it is the
     * reason to read the amount, so it comes before the amount.
     */
    promise: string;
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
      /* "Start free" until 9 November 2026. Her instruction: "For school free
         report cards only, what could I write instead of 'Start Free'? Because
         I want most parent to choose school and life."

         The card already shows "Free" as the price, so the button was selling
         the price a second time and the narrow plan read as the generous one.
         The label takes the price off the button, so what a parent compares is
         the scope: School only, or School and Life.

         It was "Choose School only" for an hour that afternoon, until she
         dropped the verb from both buttons: "Instead of CHOOSE SCHOOL ONLY and
         CHOOSE SCHOOL & LIFE. I want: SCHOOL ONLY and SCHOOL AND LIFE." The
         cards render these uppercase, which is why she wrote them that way.
         Note the ampersand went with the verb: the plan is still called School
         & Life in the eyebrow above, and the button spells the word. */
      cta: "School only",
    },

    paid: {
      eyebrow: "School & Life",
      /* Her line, moved here from above the cards on 9 November 2026. */
      promise: "See what grades don’t show.",
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
      cta: "School and Life",
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
     * untouched.
     *
     * The two that left the website are not in the same position, and the note
     * here said they were until the app session corrected it on 3 November
     * 2026, which was checked in the app rather than taken on trust:
     *
     *  - THE CANCELLATION SENTENCE is read before paying. It is her own words
     *    in the app's js/config.js (plan.terms.cancel), on the purchase
     *    confirmation sheet beside the child's name and the price, and again
     *    on Stripe's own page. `paid.cancel` is kept in this file because
     *    whoever connects these buttons will need her sentence.
     *
     *  - THE READING ALLOWANCE is read nowhere before paying. No figure
     *    appears on the confirmation sheet, anywhere else in the app, or on
     *    this website; the ceiling is enforced in server/engine.js from
     *    TM_AI_CAP_FULL_USD and TM_AI_CAP_SCHOOL_USD, and the only thing a
     *    parent ever sees is the message when it is already reached: "This
     *    month's readings are complete. New additions are kept and will be
     *    read next month."
     *
     *    The legal half is a draft, not nothing, which the app session
     *    corrected a second time on 3 November and which was read here before
     *    being written down. Draft Terms 1.3 §1 carries a paragraph headed
     *    "Monthly limit on new readings", describing the pause in plain words
     *    with no figure and tagged counsel question 3f. But 1.3 is unapproved
     *    and unpublished: the Terms that are live, and that this site links
     *    to, are 1.2 of 3 October, and 1.2 says nothing about a limit at all.
     *
     * So her instruction to preserve that disclosure elsewhere is met by a
     * document nobody can read yet, and by nothing a parent meets before
     * paying. It is recorded for her in docs/launch-readiness-2026-11-02.md
     * rather than solved here, because writing a limit onto this page is what
     * her brief of 2 November ruled out, and inventing a retention or usage
     * policy is a standing no.
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
      /* "Commencer gratuitement" until 9 November 2026, with the English. The
         same reasoning: le prix est déjà affiché sur la carte. Both buttons
         lost their verb when she set the English pair, so these are the plan
         names and nothing else. */
      cta: "École seulement",
    },

    paid: {
      eyebrow: "École et vie",
      /* Déplacé au-dessus du prix le 9 novembre 2026, avec l'anglais. This is
         the sentence that was the section heading, word for word. */
      promise: "Voyez ce que les notes ne montrent pas.",
      heading: "Voyez ce que les moments du quotidien montrent.",
      plus: "Tout ce qu’il y a dans École, plus :",
      includes: [
        "Remarquez ce que les notes ne montrent pas.",
        "Gardez les moments qui le révèlent.",
        "Faites de cinq minutes ensemble une habitude.",
        "Voyez le portrait d’ensemble.",
      ],
      tagline: "Obtenez une juste mesure.",
      cta: "École et vie",
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
