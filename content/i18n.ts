/**
 * Two languages, one brand.
 *
 * Jolène's ruling, 1 October 2026: the French site is Truer Measure in French,
 * not a second brand. She owns justemesure.ca, which forwards to
 * truermeasure.com/fr rather than carrying a name of its own. (The domain was
 * reported as justevaleur.ca on 1 October and corrected the next day; that one
 * belongs to someone else, and "valeur" is the accounting term for fair value.
 * "Mesure" is both the real domain and the direct counterpart of "Measure".)
 *
 * WHY FRENCH PAGES ARE ROUTES AND NOT NEXT'S LOCALES
 * next.config.ts sets output: "export". Next's built-in locale routing needs
 * middleware, and a static export cannot have middleware. So French pages are
 * real pages under /fr.
 *
 * WHY THE PATHS MIRROR THE ENGLISH ONES
 * /fr/hidden-report-card, not /fr/bulletin-cache. The toggle is then "add or
 * remove the /fr prefix", with no table of page pairs to keep in step, and any
 * page added later gets a working toggle without being registered anywhere.
 * The product names stay English because the brand does.
 */

export type Locale = "en" | "fr";

export const LOCALE_PREFIX = "/fr";

/**
 * Pages whose French URL is a French phrase rather than /fr + the English path.
 * The Terms are one, by Jolène's naming: a parent reading a contract in French
 * should see a French address. Each entry is a path the prefix rule cannot
 * derive, so keep this list as short as it is.
 */
export const FRENCH_PATHS: Record<string, string> = {
  "/terms-of-service": "/conditions-d-utilisation",
  // A legal document is found by its own name, so these two sit outside /fr.
  "/privacy-policy": "/politique-de-confidentialite",
};
const ENGLISH_PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(FRENCH_PATHS).map(([en, fr]) => [fr, en]),
);

/**
 * The locale a path belongs to: everything under /fr, plus the French paths
 * above. Getting this wrong puts an English nav and footer on a French page.
 */
export function localeFromPath(pathname: string): Locale {
  if (pathname === LOCALE_PREFIX || pathname.startsWith(LOCALE_PREFIX + "/")) return "fr";
  return pathname in ENGLISH_PATHS ? "fr" : "en";
}

/** The same page in the other language. */
export function otherLocalePath(pathname: string): string {
  if (pathname in FRENCH_PATHS) return FRENCH_PATHS[pathname];
  if (pathname in ENGLISH_PATHS) return ENGLISH_PATHS[pathname];
  if (localeFromPath(pathname) === "fr") {
    const rest = pathname.slice(LOCALE_PREFIX.length);
    return rest === "" ? "/" : rest;
  }
  return pathname === "/" ? LOCALE_PREFIX : LOCALE_PREFIX + pathname;
}

/** A path in a given locale, for links written once and used in both. */
export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  if (path in FRENCH_PATHS) return FRENCH_PATHS[path];
  return path === "/" ? LOCALE_PREFIX : LOCALE_PREFIX + path;
}

/**
 * hreflang pairs for one page, given its English path. Google then reads the
 * two as one page in two languages rather than as duplicates competing.
 *
 * The canonical has to be the page's OWN url, which is why the locale is a
 * parameter. A French page that declares the English page as its canonical is
 * telling Google to drop it, and the French site would never be indexed.
 */
export function alternatesFor(englishPath: string, locale: Locale = "en") {
  return {
    canonical: localePath(locale, englishPath),
    languages: {
      en: englishPath,
      fr: localePath("fr", englishPath),
    },
  };
}

/**
 * THE FOUR TERMS, dictated by Jolene on 2 October 2026. These are the names, in
 * both languages, and nothing should paraphrase them:
 *
 *   Start Here      Commencez ici
 *   The Hidden Report Card(TM)   Le rapport caché
 *   Elite Parents   Parents leaders
 *   Inner Circle    Cercle privé
 *
 * She wrote the trademark on the English and not on the French, so the French
 * name carries no (TM). The mark is claimed in English.
 *
 * Two earlier French names are dead and must not come back. "Apprendre du
 * Salon" she rejected outright. "Entre parents" she rejected because it makes
 * membership mean parenthood, which writes her out of her own room: she is not
 * a parent. The same flaw was in two body lines, now fixed.
 */
export const tiers = {
  en: {
    one: ["A Truer", "Measure"],
    oneFlat: "A Truer Measure",
    two: ["Elite", "Parents"],
    twoFlat: "Elite Parents",
    three: ["Inner", "Circle"],
    threeFlat: "Inner Circle",
  },
  fr: {
    one: ["Une Juste", "Mesure"],
    oneFlat: "Une Juste Mesure",
    two: ["Parents", "leaders"],
    twoFlat: "Parents leaders",
    three: ["Cercle", "privé"],
    threeFlat: "Cercle privé",
  },
} as const;

/** The document the product produces. Named, not paraphrased. */
export const hiddenReportCard = { en: "The Hidden Report Card", fr: "Le rapport caché" } as const;

export const shell = {
  en: {
    // Empty since 1 October 2026: the French site shipped, so announcing it as
    // coming was no longer true, and the FR toggle sits in the nav below it.
    // The mechanism stays for the next announcement.
    banner: "",
    brand: "Welcome to the Truer Measure of your child!",
    nav: {
      start: "Start Here",
      hiddenReportCard: "The Hidden Report Card™",
      learn: "Elite Parents",
      innerCircle: "Inner Circle",
    },
    toggle: { label: "FR", aria: "Voyez cette page en français" },
    footer: {
      brand: "A Truer Measure",
      tagline: "The Truer Measure of a Child!",
      follow: "Follow along",
      terms: "Terms of Service",
      termsPath: "/terms-of-service",
      privacy: "Privacy Policy",
      privacyPath: "/privacy-policy",
      // Online cancellation, through the Stripe customer portal. California
      // Bus. & Prof. Code 17602(d) requires it for an online sign-up.
      manage: "Manage or cancel your membership",
      // The EU directive's own suggested label.
      withdraw: "Withdraw from contract here",
      withdrawPath: "/withdraw",
      rights: "Truer Measure. All rights reserved.",
    },
  },
  fr: {
    // Nothing to announce to someone already reading the French site.
    banner: "",
    brand: "Bienvenue à la juste mesure de votre enfant!",
    nav: {
      start: "Commencez ici",
      hiddenReportCard: "Le rapport caché",
      learn: "Parents leaders",
      innerCircle: "Cercle privé",
    },
    toggle: { label: "EN", aria: "View this page in English" },
    footer: {
      brand: "Une Juste Mesure",
      tagline: "La juste mesure d’un enfant!",
      follow: "Suivez-nous",
      terms: "Conditions d’utilisation",
      termsPath: "/conditions-d-utilisation",
      privacy: "Politique de confidentialité",
      privacyPath: "/politique-de-confidentialite",
      manage: "Gérez ou annulez votre adhésion",
      withdraw: "Rétractez-vous de votre contrat ici",
      withdrawPath: "/fr/withdraw",
      rights: "Truer Measure. Tous droits réservés.",
    },
  },
} as const;
