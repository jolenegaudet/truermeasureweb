/**
 * Two languages, one brand.
 *
 * Jolène's ruling, 1 October 2026: the French site is Truer Measure in French,
 * not a second brand. She owns justevaleur.ca, which forwards to
 * truermeasure.com/fr at the registrar rather than carrying a name of its own.
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

/** The locale a path belongs to. Everything under /fr is French. */
export function localeFromPath(pathname: string): Locale {
  return pathname === LOCALE_PREFIX || pathname.startsWith(LOCALE_PREFIX + "/")
    ? "fr"
    : "en";
}

/** The same page in the other language. */
export function otherLocalePath(pathname: string): string {
  if (localeFromPath(pathname) === "fr") {
    const rest = pathname.slice(LOCALE_PREFIX.length);
    return rest === "" ? "/" : rest;
  }
  return pathname === "/" ? LOCALE_PREFIX : LOCALE_PREFIX + pathname;
}

/** A path in a given locale, for links written once and used in both. */
export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
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

/** Strings that live in the shell rather than on any one page. */
/**
 * The three tiers. Jolène, 1 October 2026: translate the tier names too, which
 * makes tier 1 "Une Juste Valeur" and lines the French site up with the phrase
 * in its headline and with justevaleur.ca.
 *
 * The Hidden Report Card keeps its English name on both sides. It is the
 * document the product produces rather than a tier, it carries a trademark
 * claim, and she has not asked for it to change.
 */
export const tiers = {
  en: {
    one: ["A Truer", "Measure"],
    oneFlat: "A Truer Measure",
    two: ["Learn from", "the Room"],
    twoFlat: "Learn From The Room",
    three: ["Inner", "Circle"],
    threeFlat: "Inner Circle",
  },
  fr: {
    one: ["Une Juste", "Valeur"],
    oneFlat: "Une Juste Valeur",
    // "Apprendre du Salon" was rejected by Jolene on 1 October 2026. A noun
    // phrase keeps the set parallel, and "entre parents" says the thing: you
    // learn among other parents rather than being taught at.
    two: ["Entre", "parents"],
    twoFlat: "Entre parents",
    three: ["Cercle", "Restreint"],
    threeFlat: "Cercle Restreint",
  },
} as const;

export const shell = {
  en: {
    // Stays up while only part of the tree is translated, because it is still
    // true. It comes down when every page has a French counterpart.
    banner: "La version française arrive bientôt.",
    brand: "Welcome to the Truer Measure of your child!",
    nav: {
      start: "Start Here",
      hiddenReportCard: "The Hidden Report Card",
      learn: "Learn From The Room",
      innerCircle: "Be Part of the Inner Circle",
    },
    toggle: { label: "FR", aria: "Voir cette page en français" },
    footer: {
      brand: "A Truer Measure",
      tagline: "The Truer Measure of a Child!",
      follow: "Follow along",
      terms: "Terms of Service",
      rights: "Truer Measure. All rights reserved.",
    },
  },
  fr: {
    // Nothing to announce to someone already reading the French site.
    banner: "",
    brand: "Bienvenue à la juste valeur de votre enfant!",
    nav: {
      start: "Commencez ici",
      hiddenReportCard: "The Hidden Report Card",
      learn: "Entre parents",
      innerCircle: "Faites partie du Cercle Restreint",
    },
    toggle: { label: "EN", aria: "View this page in English" },
    footer: {
      brand: "Une Juste Valeur",
      tagline: "La juste valeur d’un enfant!",
      follow: "Suivez-nous",
      terms: "Conditions d’utilisation",
      rights: "Truer Measure. Tous droits réservés.",
    },
  },
} as const;
