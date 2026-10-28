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
 * THE PROPOSED APP PRICE.
 *
 * Her brief, 28 October 2026: "The proposed CA$29/month applies only to School
 * & Life", and for the other two currencies "Propose those amounts for my
 * review; until approved, show 'Price to be confirmed' in the local preview."
 *
 * So exactly one amount lives here, and it is the one she named. The USD and
 * EUR amounts I am proposing are in docs/pricing-brief-2026-10-28.md, NOT in
 * this file, because a number in the code is a number that can be rendered,
 * and she has not approved them. `amount: null` is what produces "Price to be
 * confirmed".
 *
 * ── NO CONVERSION ─────────────────────────────────────────────────────────
 *
 * Her brief: "Use fixed prices for each currency, without live exchange-rate
 * conversion." Each entry is a price charged in that currency, the same rule
 * content/founding-families.ts already follows. Nothing here multiplies
 * anything by a rate, and nothing fetches one.
 *
 * ── WHY EVEN CA$29 IS BEHIND THE PREVIEW FLAG ────────────────────────────
 *
 * "This authorizes the working local preview only" and "Keep pricing
 * unapproved, all changes unpublished". CA$29 is a proposal she is reviewing,
 * not a price she has set, so it is gated by PRICE_PREVIEW along with the
 * selector and the placeholder. With the flag unset, which is every ordinary
 * build and anything Netlify would ever produce, the paid card shows the
 * billing shape and no amount, no currency selector and no placeholder: they
 * are absent from the HTML, not hidden with CSS.
 *
 * The app agrees: `plan.prices` is still `{ monthly: '', schoolYear: '' }`, so
 * no checkout can open for a price nobody has approved. Nothing here touches
 * Stripe.
 */
export type AppPrice = {
  code: CurrencyCode;
  symbol: string;
  /** null until she approves an amount for this currency. */
  amount: number | null;
};

export const APP_PRICES: AppPrice[] = [
  // Her figure, 28 October 2026.
  { code: "CAD", symbol: "CA$", amount: 29 },
  // Proposed in the pricing brief, awaiting her review.
  { code: "USD", symbol: "US$", amount: null },
  { code: "EUR", symbol: "€", amount: null },
];

/** CAD leads, as her brief asks, and is the default. */
export const DEFAULT_CURRENCY: CurrencyCode = "CAD";
export const APP_CURRENCY_ORDER: CurrencyCode[] = ["CAD", "USD", "EUR"];

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
    /** Used in place of billing when the price slot already says "Free". */
    noCard: string;
    addLater: string;
    cta: string;
  };
  /** Under each button, because a button label is the wrong place for it. */
  demoNote: string;
  /** Named beside the demo links: in the demo, not in the app at launch. */
  demoOnly: string;
  /** The currency selector's visible label. */
  currencyLabel: string;
  /** Shown for a currency whose amount she has not approved. */
  priceToBeConfirmed: string;
  perMonth: string;
  /** The free plan's amount, in any currency. */
  freePrice: string;
  /** Tax wording is deliberately not settled yet. */
  taxPending: string;
  /** What one subscription covers. */
  covers: string;
  allowance: {
    title: string;
    body: string;
    pauses: string;
    remains: string;
    resumes: string;
  };
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
 * Both languages, from her brief of 28 October 2026.
 *
 * The French is a draft for her review, as she asked, not a published
 * translation. Three rules it follows, taken from what is already on /fr
 * rather than invented here:
 *
 *   - "l'enseignante" as the generic teacher, which is what every French page
 *     already uses ("rencontre avec l'enseignante").
 *   - Curly apostrophes throughout. 44 straight ones had to be corrected
 *     across the French files three weeks ago; none are introduced here.
 *   - A non-breaking space before :, ! and ?, French typography, and the
 *     convention the French pages already keep.
 *
 * Her French plan names, from the brief: Ecole and Ecole et vie.
 */
export const appPlans: Record<Locale, AppPlans> = {
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
      noCard: "No card, and nothing to cancel.",
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

    /* Her brief: "Beside the demo links, clearly identify those as demo
       previews unavailable in the customer app at launch." The four are the
       DEFERRED list in js/account.js, named rather than hinted at, because a
       parent who presses a demo button is about to see all four of them. */
    demoOnly:
      "The demo also shows yearly reports, pages for your child, résumé building and growth since last year. Those are previews in the demo: they are not part of the app at launch.",

    currencyLabel: "Show prices in",
    priceToBeConfirmed: "Price to be confirmed",
    perMonth: "/ month",
    freePrice: "Free",
    /* Her brief: "Keep tax wording pending confirmation." The app has an
       approved sentence ("Taxes are shown at checkout."), but it belongs to
       the Stripe setup she has not pointed at this price, so the page says
       the truth instead of borrowing it. */
    taxPending: "Tax wording is still to be confirmed.",
    covers: "One subscription covers the children in your account.",

    /* Her brief: "Clarify the shared monthly reading allowance. Explain what
       pauses at the cap, what remains available and when readings resume" and
       "Don't change the app's cap or advertise unlimited readings."

       The cap is real and already in the code: server/engine.js holds a
       per-family monthly ceiling, and when a family reaches it the app says
       "This month's readings are complete. New additions are kept and will be
       read next month." The wording below is that behaviour in a parent's
       words. No figure appears, because the ceiling is an internal US dollar
       amount and a dollar figure would read as a second price. Nothing here
       changes the cap, and the word "unlimited" is nowhere on the page. */
    allowance: {
      title: "A monthly reading allowance",
      body:
        "Readings are how Truer Measure reads what you add, and each account has a monthly allowance of them, shared across the children in your account.",
      pauses:
        "If one month’s additions go past it, new readings pause and the app tells you so plainly.",
      remains:
        "Nothing is lost and nothing closes. You can still add moments, documents and report cards, and everything already written stays where it is: the record, the timeline, the profile and your documents.",
      resumes:
        "Readings begin again at the start of the next month, and what you added in the meantime is read then.",
    },

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
  /**
   * FRENCH, drafted 28 October 2026 for her review.
   *
   * Her brief gave the two plan names: École and École et vie. Everything else
   * below is a draft of the English offer in Canadian French, not a published
   * translation, and it is the part she asked to see.
   *
   * THE PRODUCT NAME. Her brief says to préserve "Juste Valeur(TM)". That name
   * is on no page of this site, and the thing that IS here is diffèrent:
   * content/i18n.ts has carried `oneFlat: "Une Juste Mesure"` since her ruling
   * of 1 October, the French home page headline already reads "une juste
   * mesure", and her own correction of 2 October was that justevaleur.ca
   * belongs to someone else while "valeur" is the accounting term for fair
   * value. Her domain is justemesure.ca. So the mark préserved here is the one
   * that exists, Juste Mesure, and it sits in FRENCH_MARK below as a single
   * constant: one word to change if she means the other.
   *
   * CONVENTIONS, taken from the French pages rather than invented here:
   * "l’enseignante" as the generic teacher, curly apostrophes throughout,
   * and a non-breaking space before :, ! and ?.
   */
  fr: {
    sectionEyebrow: "Commencez par la clarté",
    sectionHeading: "Un seul produit. Deux forfaits.",
    sectionIntro:
      "Truer Measure garde le dossier de votre enfant dans votre compte, pour de bon. Commencez par École maintenant et ajoutez École et vie plus tard si vous le voulez : tout ce que vous ajoutez reste.",
    availability:
      "L’application n’est pas encore ouverte aux familles. Les deux boutons ci-dessous ouvrent la démo, qui fonctionne avec un enfant fictif, pour que vous puissiez voir les vrais écrans avant de décider quoi que ce soit.",

    free: {
      eyebrow: "École · Gratuit",
      heading: "Comprenez les bulletins de votre enfant.",
      body:
        "Téléversez des bulletins pour obtenir des explications en langage clair, un portrait scolaire mis à jour à mesure que vous ajoutez des bulletins, des questions à poser à l’enseignante et des idées concrètes pour la maison.",
      only:
        "Les téléversements sont des bulletins seulement : des PDF, ou des photos de chaque page.",
      includes: [
        "Le premier portrait de votre enfant, et tout ce que vous avez ajouté jusqu’ici.",
        "Des bulletins, autant que vous voulez, chacun expliqué.",
        "La lecture scolaire qui les traverse, mise à jour à mesure que vous ajoutez.",
        "Les questions à poser à l’enseignante et les idées pour la maison, dans l’explication de chaque bulletin.",
      ],
      billing: "Gratuit, et sans carte.",
      noCard: "Sans carte, et rien à annuler.",
      addLater:
        "Ajoutez École et vie plus tard si vous le voulez : tout ce que vous ajoutez avec École reste.",
      cta: "Voir École",
    },

    demoNote: "Ouvre la démo dans un nouvel onglet.",
    demoOnly:
      "La démo montre aussi les bilans annuels, les pages pour votre enfant, la création d’un CV et la croissance depuis l’an dernier. Ce sont des aperçus dans la démo : ils ne font pas partie de l’application au lancement.",

    currencyLabel: "Afficher les prix en",
    priceToBeConfirmed: "Prix à confirmer",
    perMonth: "/ mois",
    freePrice: "Gratuit",
    taxPending: "La formulation sur les taxes reste à confirmer.",
    covers: "Un seul abonnement couvre les enfants de votre compte.",

    allowance: {
      title: "Une réserve mensuelle de lectures",
      body:
        "Les lectures sont la façon dont Truer Measure lit ce que vous ajoutez. Chaque compte en a une réserve mensuelle, partagée entre les enfants de votre compte.",
      pauses:
        "Si les ajouts d’un mois la dépassent, les nouvelles lectures s’arrêtent et l’application vous le dit clairement.",
      remains:
        "Rien n’est perdu et rien ne ferme. Vous pouvez continuer à ajouter des moments, des documents et des bulletins, et tout ce qui est déjà écrit reste accessible : le dossier, la chronologie, le portrait et vos documents.",
      resumes:
        "Les lectures reprennent au début du mois suivant, et ce que vous avez ajouté entre-temps est lu à ce moment-là.",
    },

    paid: {
      eyebrow: "École et vie · Payant",
      /* Her approved French, live on /fr/hidden-report-card since 8 October:
         "ce que votre enfant est capable de devenir". */
      heading:
        "Un portrait qui grandit de ce que votre enfant est capable de devenir.",
      body:
        "Réunissez ce que l’école voit, ce que vous remarquez et ce que votre enfant dit. Truer Measure organise le dossier et vous aide à voir les intérêts, les forces, les capacités qui se développent et les questions qui valent la peine d’être explorées, à l’école comme dans la vie de tous les jours, au fil du temps.",
      plus: "Tout ce qu’il y a dans École, plus :",
      includes: [
        "Des moments de la vie en dehors de l’école, quand vous voulez : une phrase, une photo, le courriel d’un entraîneur.",
        "Des lectures qui réunissent l’école et la vie, mises à jour à mesure que vous ajoutez : ce qui concorde, ce qui diffère et ce qui vaut la peine d’être exploré.",
        "Vos propres mots sur votre enfant, lus à côté du dossier.",
        "Des questions sur tout, y compris des notes pour une rencontre avec l’enseignante.",
      ],
      billing: "Un abonnement mensuel.",
      cancel:
        "Annulez quand vous voulez : École et vie reste jusqu’à la fin de la période payée, et tout ce que vous avez ajouté reste avec vous.",
      cta: "Voir École et vie",
      firstToKnow: "Ou recevez un avis dès l’ouverture :",
    },

    detail: {
      heading: "Ce que École et vie vous donne",
      intro:
        "Les cartes ci-dessus sont la version courte. Voici ce avec quoi un parent travaille vraimént, et rien ici n’est prévu pour plus tard : tout y est déjà dans l’application.",
      parts: [
        {
          title: "Un portrait complet de l’enfant",
          body:
            "Les intérêts, les qualités, les expériences et les apprentissages de votre enfant, réunis. Le portrait a deux sections, et aucun domaine ne reçoit de niveau ni de note.",
          detail: [
            "Les bases qui durent au-delà de l’école : la lecture, l’écriture, la communication, les mathématiques, la pensée et la résolution de problèmes. La pensée et la résolution de problèmes sont deux bases distinctes.",
            "Ce qui compte maintenant et plus tard : dix-huit domaines en quatre groupes, nommés Penser et apprendre, Passer à l’action, Soi et les autres, et Sa place dans le monde.",
            "Ce qui l’attire, le titre que l’application donne aux intérêts et au plaisir : ce vers quoi votre enfant revient, ce qu’il ou elle continue de faire, et ce qui lui plaît. Rien dans cette partie n’est compté ni noté.",
          ],
        },
        {
          title: "Un tableau de bord qui réunit le portrait",
          body:
            "Quand vous revenez, le premier ecran vous dit où en est le dossier au lieu de vous demander de chercher. C’est la compréhension pour laquelle vous revenez.",
          detail: [
            "L’histoire jusqu’ici : ce que le dossier contient maintenant, à l’école et ailleurs.",
            "Ce que nous remarquons : ce qui revient, chaque phrase appuyée sur des dossiers nommés.",
            "Ajouté récemment : ce qui est arrivé depuis votre dernière visite.",
            "À regarder de plus près : une question ouverte que le dossier soulève, et non un verdict sur votre enfant.",
          ],
        },
        {
          title: "Saisir un moment",
          body:
            "Votre enfant résout un problème, trouve quelque chose difficile, demande de l’aide ou prend une responsabilité. Saisissez ce qui s’est passé. Truer Measure l’organise et l’interprète en arrière-plan, pour vous aider à voir les capacités qui se développent et les défis qui valent la peine d’être compris.",
          detail: [
            "Ajoutez une observation dans vos propres mots, une photo, un travail scolaire, ou le mot d’un entraîneur ou d’un autre adulte.",
            "Vous n’avez rien à trier, à étiqueter ni à classer. Cela se fait pour vous, et vous pouvez changer tout ce que l’application décide.",
          ],
        },
        {
          title: "Réfléchir ensemble",
          body:
            "Le point de vue de votre enfant a sa place à lui, à côté de ce que vous remarquez. Prenez quelques minutes ensemble et gardez les réponses.",
          detail: [
            "« Qu’est-ce que tu as aimé ? »",
            "« Qu’est-ce qui a été difficile ? »",
            "« Qu’est-ce que tu aimerais essayer ? »",
            "Une seule réponse suffit. Ensuite, ces mots entrent dans le portrait comme ceux de votre enfant, et ils restent marqués comme les siens, jamais fondus dans l’observation d’un adulte.",
          ],
        },
        {
          title: "Une chronologie et une bibliothèque de traces",
          body:
            "Les moments importants et les documents gardés ensemble, à travers les années scolaires et la vie de tous les jours, pour que ce qui est arrivé en 2e année soit encore là à ouvrir en 7e.",
          detail: [
            "Les bulletins et les documents scolaires restent à côté des moments vécus hors de l’école, dans un seul dossier daté.",
            "Chaque document que vous téléversez reste le vôtre. Vous pouvez tout exporter ou tout supprimer quand vous voulez.",
          ],
        },
        {
          title: "Des lectures à l’école et dans la vie",
          body:
            "Ce qui revient, ce qui diffère entre l’école et la maison, et ce qui change peut-être. Une lecture n’est écrite que là où les dossiers permettent la comparaison, et elle le dit quand ce n’est pas le cas.",
          detail: [
            "Chaque lecture nomme les dossiers sur lesquels elle s’appuie, et vous pouvez les ouvrir.",
            "Les nombres décrivent le dossier, pas la capacité de votre enfant. Là où il y a peu de choses, l’application dit que le dossier est mince, ce qui est un fait sur le dossier et non une faiblesse chez votre enfant.",
          ],
        },
        {
          title: "Questions, conversations et prochaines étapes",
          body:
            "Demander pose une question au dossier. Explorer une question va plus loin, et les deux sont là quand vous préparez une rencontre avec l’enseignante.",
          detail: [
            "Posez une question sur un intérêt, une difficulté ou quelque chose qui vous trotte dans la tête, et recevez une réponse tirée du dossier, avec les dossiers nommés.",
            "Les pistes de réflexion et les suggestions viennent de ce que le dossier contient déjà, y compris les mots de votre enfant.",
            "Ce que l’application ne fait pas : elle ne pose pas de diagnostic, n’étiquette pas, ne prédit pas et ne compare pas votre enfant aux autres enfants, et elle ne détermine pas d’elle-même le soutien dont votre enfant a besoin. Cela reste une conversation entre vous, votre enfant et les personnes qui lui enseignent.",
          ],
        },
      ],
      choice:
        "C’est vous qui choisissez ce qui entre. Rien n’est ajouté au dossier de votre enfant sans que vous l’ayez mis là ou approuvé.",
      close:
        "Vous saisissez les moments. Truer Measure vous aide à comprendre le portrait qu’ils bâtissent.",
    },

    example: {
      label: "Exemple fictif",
      eyebrow: "Ce qui concorde, à l’école et ailleurs",
      title: "L’écriture, à l’école et ailleurs",
      text:
        "Ses enseignantes situent son écriture au plus haut niveau depuis juin de la 4e année et décrivent des textes imaginatifs et riches en détails. En dehors de l’école, elle écrit des histoires que personne ne lui a demandées : la bande dessinée dans son cahier et l’histoire du fanzine.",
      rests: "Appuyé sur 5 dossiers : 3 de l’école, 2 d’ailleurs.",
      note:
        "L’enfant de la démo est fictive, et chaque dossier derrière ce texte l’est aussi. Dans l’application, un parent touche une lecture pour ouvrir les dossiers en dessous.",
    },
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
