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
 * Whether the website's Privacy Policy is published. IT IS, since 6 November
 * 2026, in both languages, effective that day.
 *
 * Her approval, 6 November 2026: "Publish the website policy". Her rule of 5
 * November set the date: the effective date is the real publication date, so
 * the document reads 6 November 2026 and 6 novembre 2026 and nothing was dated
 * in advance.
 *
 * WHAT THIS FLAG DOES, AND WHAT IT NEVER DID. It decides whether the footer and
 * the signup consent line LINK to the policy. It has never been what stops an
 * unfinished policy reaching the site. Two checks do that, and both read the
 * documents rather than trusting a boolean:
 *
 *   - scripts/check-legal-placeholders.mjs, which runs as prebuild here and on
 *     Netlify, and stops any build whose routed legal text still carries
 *     [EFFECTIVE_DATE] or a draft banner.
 *   - scripts/check-launch-build.mjs, which refuses a BUILT site carrying a
 *     draft marker or an unfilled placeholder in its HTML.
 *
 * Both passed with no flag before this went out, which is the only acceptable
 * way for them to pass: the document was finished, not waved through.
 *
 * THE PRODUCT'S POLICY IS A DIFFERENT DOCUMENT and is not published. It lives
 * at content/privacy-policy.mdx, still carries its draft banner, and /privacy
 * answers 404 until its text is approved. Nothing here publishes it, and the
 * app's release check needs that address to answer 200, so the 404 is the gate
 * holding public sign-up shut.
 */
export const PRIVACY_POLICY_PUBLISHED = true;

/**
 * The Privacy Policy link in the consent line, one path per language.
 *
 * While a policy is held back these are null and the consent sentence simply
 * ends at "You can unsubscribe anytime." A link to a page that 404s would be
 * worse than no link, and the sentence was written to stand without it. Since 6
 * November 2026 the link is there, in both languages.
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
