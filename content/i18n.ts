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
      learn: "Learn From The Room",
      // The three offers keep their English names, so the nav uses the name.
      innerCircle: "Faites partie du Inner Circle",
    },
    toggle: { label: "EN", aria: "View this page in English" },
    footer: {
      tagline: "La juste valeur d’un enfant!",
      follow: "Suivez-nous",
      terms: "Conditions d’utilisation",
      rights: "Truer Measure. Tous droits réservés.",
    },
  },
} as const;
