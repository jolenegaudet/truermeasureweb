/**
 * THE FRAMEWORK: six foundations and twenty-one characteristics.
 *
 * Her brief, 2 November 2026: "The approved source of truth is
 * https://demo.truermeasure.com/#child … Update the website to match the
 * demo's 6 foundations and 21 characteristics, preserving their names,
 * meaning, order and groupings. Do not add, remove, merge or substitute them."
 *
 * ── WHERE THESE COME FROM ─────────────────────────────────────────────────
 *
 * The demo's own `js/config.js`, read from the published demo on 2 November
 * 2026: `dimensionGroups` for the two group headings and the four family
 * headings, `dimensions` for the twenty-seven entries. The `id` of each entry
 * is kept here, unused by the page, so that anyone can check a name against
 * the demo without matching on prose: the demo's ids never change when the
 * name a parent reads does ('numeracy' is shown as Mathematics,
 * 'conscientiousness' as Responsibility & follow-through, and so on).
 *
 * The order below is the demo's order, which the demo calls fixed so that
 * areas with little recorded do not sink to the bottom. Do not sort this.
 *
 * The customer app was checked the same day, against
 * prototype/.worktrees/launch/js/config.js: the same twenty-seven entries, the
 * same ids, groups, families, kinds and names, in the same order, with zero
 * field differences. There is no discrepancy to report and nothing in either
 * app was touched.
 *
 * ── WHAT THIS REPLACED ────────────────────────────────────────────────────
 *
 * Thirty-one words in eight rows, on both Hidden Report Card pages, which had
 * been written before the framework settled. They are not a subset of it: they
 * split pairs the framework keeps together (Judgment from Critical thinking,
 * Agency from Initiative, Follow-through from Responsibility), carried four
 * entries the framework does not have (Imagination, Resilience, Emotional
 * intelligence, Civic-mindedness), and left out all six foundations plus
 * Learning from feedback and Movement & physical skills. The full mapping,
 * line by line and in both languages, is docs/framework-2026-11-02.md.
 *
 * ── FOUNDATIONS ARE NOT CHARACTERISTICS ───────────────────────────────────
 *
 * Her brief: "Keep foundations distinct from capabilities." The two groups are
 * rendered as two blocks and are never run together into one list, because
 * they are not the same claim. School teaches and assesses the six
 * foundations; her line "None of these receive a grade" is true of the
 * twenty-one and false of the six, which is why it sits over the second block
 * only. See the note in components/framework-list.tsx.
 *
 * ── THE FRENCH ────────────────────────────────────────────────────────────
 *
 * The demo has no French, so these are equivalents rather than quotations.
 * They follow the conventions already on /fr: natural Canadian French, the
 * terms a Quebec school actually uses ("rétroaction", "compréhension
 * interculturelle"), curly apostrophes, and the singular for a child, never a
 * plural standing in for one child. Each one is listed beside its English in
 * docs/framework-2026-11-02.md so she can correct any single word without
 * touching the structure.
 */

import type { Locale } from "@/content/i18n";

export type FrameworkItem = {
  /** The demo's id. Stable across renames; not rendered. */
  id: string;
  en: string;
  fr: string;
};

export type FrameworkFamily = {
  id: string;
  /** Null for the foundations, which the demo keeps as one undivided group. */
  heading: Record<Locale, string> | null;
  items: FrameworkItem[];
};

export type FrameworkGroup = {
  id: string;
  heading: Record<Locale, string>;
  /** The demo's own framing, kept only where leaving it out would mislead. */
  intro: Record<Locale, string> | null;
  families: FrameworkFamily[];
};

export const FRAMEWORK: FrameworkGroup[] = [
  {
    id: "foundations",
    heading: {
      en: "The foundations that outlast school",
      fr: "Les fondements qui durent au-delà de l’école",
    },
    /* The demo's own two sentences, because the block that follows them is
       Reading, Writing and Mathematics: without them, the section heading
       underneath would be read as saying that these are not graded, which
       school plainly does. Nothing here was written for the website. */
    intro: {
      en: "School teaches and assesses these for years. But their real value reaches far beyond the report card.",
      fr: "L’école les enseigne et les évalue pendant des années. Mais leur vraie valeur dépasse largement le bulletin.",
    },
    families: [
      {
        id: "foundations",
        heading: null,
        items: [
          { id: "reading", en: "Reading", fr: "Lecture" },
          { id: "writing", en: "Writing", fr: "Écriture" },
          { id: "communication", en: "Communicating", fr: "Communication" },
          { id: "numeracy", en: "Mathematics", fr: "Mathématiques" },
          { id: "reasoning", en: "Thinking", fr: "Réflexion" },
          { id: "problem", en: "Problem solving", fr: "Résolution de problèmes" },
        ],
      },
    ],
  },
  {
    id: "adult",
    heading: {
      en: "What matters now and later",
      fr: "Ce qui compte maintenant et plus tard",
    },
    intro: null,
    families: [
      {
        id: "thinking",
        heading: { en: "Thinking and learning", fr: "Penser et apprendre" },
        items: [
          {
            id: "curiosity",
            en: "Curiosity & love of learning",
            fr: "Curiosité et goût d’apprendre",
          },
          { id: "creativity", en: "Creativity", fr: "Créativité" },
          {
            id: "decisionmaking",
            en: "Critical thinking & judgment",
            fr: "Esprit critique et jugement",
          },
          {
            id: "feedback",
            en: "Learning from feedback",
            fr: "Apprendre de la rétroaction",
          },
        ],
      },
      {
        id: "action",
        heading: { en: "Taking action", fr: "Passer à l’action" },
        items: [
          {
            id: "initiative",
            en: "Initiative & agency",
            fr: "Initiative et pouvoir d’agir",
          },
          {
            id: "persistence",
            en: "Persistence & adaptability",
            fr: "Persévérance et adaptabilité",
          },
          { id: "courage", en: "Courage", fr: "Courage" },
          { id: "confidence", en: "Confidence", fr: "Confiance" },
          { id: "independence", en: "Independence", fr: "Autonomie" },
          {
            id: "conscientiousness",
            en: "Responsibility & follow-through",
            fr: "Responsabilité et suivi jusqu’au bout",
          },
          {
            id: "practical",
            en: "Practical capability & resourcefulness",
            fr: "Habiletés pratiques et débrouillardise",
          },
          {
            id: "physical",
            en: "Movement & physical skills",
            fr: "Mouvement et habiletés physiques",
          },
        ],
      },
      {
        id: "others",
        heading: { en: "Themselves and others", fr: "Soi et les autres" },
        items: [
          { id: "selfknowledge", en: "Self-awareness", fr: "Connaissance de soi" },
          {
            id: "selfreg",
            en: "Understanding & managing emotions",
            fr: "Comprendre et gérer ses émotions",
          },
          {
            id: "kindness",
            en: "Kindness & consideration",
            fr: "Bienveillance et considération",
          },
          {
            id: "empathy",
            en: "Empathy & perspective-taking",
            fr: "Empathie et point de vue de l’autre",
          },
          {
            id: "collaboration",
            en: "Connection & collaboration",
            fr: "Liens et collaboration",
          },
          { id: "leadership", en: "Leadership", fr: "Leadership" },
          { id: "honesty", en: "Integrity", fr: "Intégrité" },
        ],
      },
      {
        id: "world",
        heading: { en: "Their place in the world", fr: "Sa place dans le monde" },
        items: [
          {
            id: "purpose",
            en: "Purpose & contribution",
            fr: "Sens du but et contribution",
          },
          {
            id: "intercultural",
            en: "Cultural understanding",
            fr: "Compréhension interculturelle",
          },
        ],
      },
    ],
  },
];

/** Six foundations, twenty-one characteristics. Checked by the build. */
export const FOUNDATION_COUNT = 6;
export const CHARACTERISTIC_COUNT = 21;

export function countItems(groupId: string): number {
  const group = FRAMEWORK.find((g) => g.id === groupId);
  if (!group) return 0;
  return group.families.reduce((n, f) => n + f.items.length, 0);
}
