import type { Locale } from "@/content/i18n";

/**
 * "Be the first to know" — the email signup that replaced the "Coming soon."
 * button while sales of the current offer are paused.
 *
 * Jolène, 4 October 2026. The brief was explicit about what this is NOT: not a
 * waitlist, not an application, not a programme. It is an email address and
 * nothing else, so that a parent who read the whole product page has somewhere
 * to go that costs them one field.
 *
 * Kit is the mailing list. Not GoHighLevel, which runs the other forms on this
 * site (components/waitlist-button.tsx), and not our own database. Her reason
 * is that launch news is a newsletter, and a newsletter belongs in the tool
 * that handles sending, unsubscribing and consent for a living.
 *
 * Everything the subscriber record carries is here rather than in the function,
 * so the tag and the source cannot drift from the copy that promised them.
 */

/**
 * The tag applied in Kit, spelled as she wrote it, en dash included. Kit
 * stores and returns it exactly, verified against the live account on
 * 4 October 2026 (tag id 24276662).
 *
 * Two things to know before editing this string.
 *
 * Kit reads are eventually consistent. A tag is invisible to GET /v4/tags for
 * several seconds after it is created, so a lookup that runs in that window
 * sees nothing and would create a second tag.
 *
 * And the two writers here can disagree about the dash: PowerShell 5.1 sends
 * a request body in a non-UTF-8 encoding unless it is handed bytes, which is
 * how the first version of this tag reached Kit with an ASCII hyphen instead.
 * scripts/setup-kit.ps1 now encodes explicitly.
 *
 * Because of both, the lookup in netlify/functions/kit-subscribe.ts compares
 * dash-insensitively rather than trusting this string to match byte for byte.
 */
export const KIT_TAG = "Truer Measure – First to Know";

/** Custom field labels in Kit. The keys Kit derives from these are
 *  tm_signup_source and tm_consent. */
export const KIT_FIELD_SOURCE = "TM signup source";
export const KIT_FIELD_CONSENT = "TM consent";

/** Recorded in Kit so the opt-in route is identifiable later. */
export const SIGNUP_SOURCE = "hidden-report-card:be-first-to-know";

/** What the person agreed to, stored with the timestamp as the consent record. */
export const CONSENT_PURPOSE = "launch news and occasional product updates";

/**
 * Whether the Privacy Policy is published.
 *
 * TRUE SINCE 5 NOVEMBER 2026, AND THE POLICY IS STILL NOT PUBLISHED. Read
 * that carefully, because the flag changed meaning that day.
 *
 * Her instruction, 5 November 2026: "Prepare la Politique de confidentialite a
 * https://truermeasure.com/privacy ... Montre-moi les versions exactes en
 * apercu. Apres mon accord sur les textes et leur publication, publie ces
 * pages separement de la mise a jour commerciale." So she asked to read the
 * exact texts at their real addresses before approving them. That cannot be
 * done from app/_pending, where the pages were unreachable, so the routes now
 * exist: app/privacy and app/politique-de-confidentialite. This flag only
 * decides whether the footer and the signup consent line LINK to them, and
 * with the routes live a half-state where the page exists but nothing points
 * at it would show her something the published site would never look like.
 *
 * WHAT STOPS PUBLICATION IS NO LONGER THIS FLAG. It is two walls, and both
 * read the documents rather than trusting a boolean:
 *
 *   - scripts/check-legal-placeholders.mjs stops any build whose routed legal
 *     text still carries [EFFECTIVE_DATE] or a draft banner. It is prebuild,
 *     so it runs here and on Netlify alike. TM_LEGAL_PREVIEW=1 turns it into a
 *     loud warning, for exactly one purpose: the local preview she asked for.
 *   - scripts/check-launch-build.mjs then refuses a BUILT site that carries a
 *     draft marker or an unfilled placeholder in its HTML, which is the check
 *     that runs before anything is deployed. --legal-preview relaxes it, and
 *     the publish procedure never passes that flag.
 *
 * TWO THINGS INSIDE THE DOCUMENTS ARE STILL HERS, and neither is mine to do:
 *   1. The effective date, [EFFECTIVE_DATE] in both files.
 *   2. The draft banner at the top of both, the blockquote beginning "DRAFT
 *      for counsel" and "EBAUCHE destinee au conseiller juridique". Deleting
 *      it is the act that declares the text final, which is her word and
 *      counsel's, not a formatting step.
 *
 * Her standing rule, 4 October 2026, still holds: hold until counsel is done.
 * Nothing here shortens that. It makes the text readable at its own address
 * while keeping publication impossible.
 */
export const PRIVACY_POLICY_PUBLISHED = true;

/**
 * The Privacy Policy link in the consent line, one path per language.
 *
 * While the policy is held back these are null and the consent sentence simply
 * ends at "You can unsubscribe anytime." A link to a page that 404s would be
 * worse than no link, and the sentence was written to stand without it.
 *
 * These point at the WEBSITE policy, which covers the forms, the Kit list and
 * Plausible. The full product policy is a separate document and a separate
 * route, for when the product opens.
 */
export const PRIVACY_PATH: Record<Locale, string | null> = PRIVACY_POLICY_PUBLISHED
  ? { en: "/privacy/website", fr: "/politique-de-confidentialite/site-web" }
  : { en: null, fr: null };

/**
 * Her English copy, verbatim from the brief. The French follows the rules she
 * set on 2 October 2026: vous, every verb in the -ez form, and the brand name
 * unchanged in both languages.
 *
 * Every string here that is a sentence ends in punctuation, her instruction of
 * 4 October 2026. Field labels and single-word controls (Email address, Close,
 * Privacy Policy) correctly take none. The button this replaced was her own
 * "Coming soon.", which carried a period, so the buttons keep one.
 *
 * It also carries no agreement with the reader's gender, her decision of
 * 4 October 2026. French forces a choice on "be the first" (la première or le
 * premier) that English never makes, and either one tells half the readers the
 * sentence was not written for them. "Sachez-le en premier" sidesteps it: en
 * premier is adverbial and agrees with nothing. Keep it that way when adding
 * copy here, and watch for past participles after "vous êtes" and "nous vous
 * avons", which is where the agreement creeps back in.
 */
export const firstToKnow = {
  en: {
    button: "Be the first to know.",
    eyebrow: "Truer Measure",
    heading: "Be first to know when Truer Measure is ready.",
    body:
      "Leave your email and we’ll let you know when the new version is available, along with occasional Truer Measure product updates.",
    emailLabel: "Email address",
    submit: "Keep me posted.",
    sending: "Sending…",
    consent:
      "By signing up, you agree to receive launch news and occasional product updates from Truer Measure. You can unsubscribe anytime.",
    privacyLead: "See our",
    privacyLabel: "Privacy Policy",
    close: "Close",
    successEyebrow: "You’re on the list.",
    successBody: "We’ll let you know when Truer Measure is ready.",
    duplicateEyebrow: "You’re already on the list.",
    duplicateBody: "We’ll keep you posted.",
    invalid: "Enter an email address, like name@example.com.",
    failed: "Something went wrong. Please try again.",
    network: "Network error. Please try again.",
  },
  fr: {
    button: "Sachez-le en premier.",
    eyebrow: "Truer Measure",
    heading: "Sachez en premier quand Truer Measure sera prêt.",
    body:
      "Laissez votre courriel et nous vous écrirons dès que la nouvelle version sera disponible, ainsi que quelques nouvelles occasionnelles sur Truer Measure.",
    emailLabel: "Adresse courriel",
    submit: "Tenez-moi au courant.",
    sending: "Envoi…",
    consent:
      "En vous inscrivant, vous acceptez de recevoir des nouvelles du lancement et, à l’occasion, des nouvelles du produit Truer Measure. Vous pouvez vous désabonner à tout moment.",
    privacyLead: "Consultez notre",
    privacyLabel: "Politique de confidentialité",
    close: "Fermer",
    successEyebrow: "Vous êtes sur la liste.",
    successBody: "Nous vous écrirons dès que Truer Measure sera prêt.",
    duplicateEyebrow: "Vous êtes déjà sur la liste.",
    duplicateBody: "Nous vous tiendrons au courant.",
    invalid: "Entrez une adresse courriel valide, par exemple nom@exemple.com.",
    failed: "Une erreur est survenue. Veuillez réessayer.",
    network: "Erreur de réseau. Veuillez réessayer.",
  },
} as const;
