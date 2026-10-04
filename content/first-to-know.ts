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
 * The tag applied in Kit, spelled exactly as she wrote it, en dash included.
 * The function looks this up by name and creates it if it is missing, so this
 * string is the only definition of it anywhere.
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
 * The Privacy Policy link in the consent line.
 *
 * null on purpose. content/privacy-policy.mdx exists but is marked DRAFT, is
 * awaiting legal review, still carries unfilled placeholders, and has no route
 * (it was removed deliberately; it is in git at e3bb129). Linking the words
 * "Privacy Policy" to a 404 is worse than not linking them, so while this is
 * null the consent sentence simply ends at "You can unsubscribe anytime."
 *
 * Publishing the policy is one edit: put its path here per locale and the link
 * appears in both languages.
 */
export const PRIVACY_PATH: Record<Locale, string | null> = {
  en: null,
  fr: null,
};

/**
 * Her English copy, verbatim from the brief. The French follows the rules she
 * set on 2 October 2026: vous, every verb in the -ez form, and the brand name
 * unchanged in both languages.
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
    button: "Be the first to know",
    eyebrow: "Truer Measure",
    heading: "Be first to know when Truer Measure is ready.",
    body:
      "Leave your email and we’ll let you know when the new version is available, along with occasional Truer Measure product updates.",
    emailLabel: "Email address",
    submit: "Keep me posted",
    sending: "Sending…",
    consent:
      "By signing up, you agree to receive launch news and occasional product updates from Truer Measure. You can unsubscribe anytime.",
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
    button: "Sachez-le en premier",
    eyebrow: "Truer Measure",
    heading: "Sachez en premier quand Truer Measure sera prêt.",
    body:
      "Laissez votre courriel et nous vous écrirons dès que la nouvelle version sera disponible, ainsi que quelques nouvelles occasionnelles sur Truer Measure.",
    emailLabel: "Adresse courriel",
    submit: "Tenez-moi au courant",
    sending: "Envoi…",
    consent:
      "En vous inscrivant, vous acceptez de recevoir des nouvelles du lancement et, à l’occasion, des nouvelles du produit Truer Measure. Vous pouvez vous désabonner à tout moment.",
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
