import type { Metadata } from "next";
import { closing } from "@/content/founding-families";
import { FrameworkList } from "@/components/framework-list";
import { PlanCards } from "@/components/plan-cards";
import { APP_PRICES } from "@/content/app-prices";
import { alternatesFor } from "@/content/i18n";

const DESCRIPTION =
  "Réunissez les bulletins, les commentaires des enseignants, vos observations, les projets et les moments vécus hors de l’école, et voyez ce qui revient d’une expérience à l’autre chez votre enfant.";

export const metadata: Metadata = {
  title: "La juste mesure",
  description: DESCRIPTION,
  alternates: alternatesFor("/the-truer-measure", "fr"),
  openGraph: {
    siteName: "Truer Measure",
    type: "website",
    locale: "fr_CA",
    url: "/fr/the-truer-measure",
    title: "La juste mesure",
    description: DESCRIPTION,
  },
  twitter: { description: DESCRIPTION },
};

/**
 * The French counterpart of app/the-truer-measure/page.tsx. Same sections, in
 * the same order, so the language toggle never changes which page you are on.
 *
 * NAMING. The product is "La juste mesure" in French, with no trademark
 * symbol: she wrote the mark on the English name and not on the French one.
 * The other two offers are Parents Élites and Cercle privé, all in
 * content/i18n.ts.
 *
 * RENAMED 9 November 2026, with the English. It was "Le rapport caché", one of
 * her four dictated terms of 2 October, until she renamed the product: "I kind
 * of changed it to The Truer Measure™, so that needs to change everywhere on
 * the site." The French name is not a new translation. /fr already used "la
 * juste mesure" for this idea in the home headline ("Bienvenue à la juste
 * mesure de votre enfant !"), the footer brand, the tagline and the tier name,
 * and justemesure.ca is hers.
 *
 * WATCH THE ARTICLE when editing. "Le rapport caché" was masculine and "la
 * juste mesure" is feminine, so every "le" that introduced the old name became
 * "la", and the sentences that carried it were reread rather than
 * search-replaced.
 *
 * The route moved to /fr/the-truer-measure with the English one, her
 * instruction of 9 November 2026. /fr/hidden-report-card is a permanent
 * redirect in netlify.toml and must stay one.
 */

const contrasts = [
  {
    left: "Mesure la performance.",
    right: "Voit la personne derrière la performance.",
  },
  {
    left: "Vous donne un instantané.",
    right: "Garde l’histoire au fil du temps.",
  },
  {
    left: "Vous dit comment votre enfant va à l’école.",
    right:
      "Tient un portrait vivant de l’éducation de votre enfant, à l’école et au-delà.",
  },
];

/* The thirty-one words that used to sit here left the page on 2 November 2026,
   replaced by the demo's framework: content/framework.ts, rendered by
   components/framework-list.tsx. The mapping, line by line and in both
   languages, is in docs/framework-2026-11-02.md. */

const moments = [
  "Avant une rencontre avec l’enseignante",
  "Avant une demande pour un programme, une équipe ou une bourse",
  "Quand le bulletin ne correspond pas à l’enfant que vous connaissez",
  "Quand votre enfant brille partout sauf sur papier",
  "Quand la confiance tombe",
  "Quand une semaine difficile commence à ressembler à une mauvaise année",
  "Quand votre enfant dit : « Je ne suis pas bon. »",
  "Quand vous remarquez chez votre enfant quelque chose que vous ne voulez pas oublier",
];

const experience = [
  {
    feature: "Mon enfant",
    outcome:
      "Voyez un portrait plus complet de votre enfant, à l’école et dans la vie de tous les jours.",
  },
  {
    feature: "Chronologie",
    outcome:
      "Voyez ensemble, au fil du temps, les moments importants venus de l’école et de la vie.",
  },
  {
    feature: "Preuves",
    outcome:
      "Gardez au même endroit les bulletins, les travaux scolaires, les certificats, les photos, les projets et vos propres observations.",
  },
  {
    feature: "Constats",
    outcome:
      "Remarquez ce qui se répète au fil du temps et voyez où l’école et la vie quotidienne racontent la même histoire ou deux histoires différentes.",
  },
  {
    feature: "Demander",
    outcome:
      "Posez des questions sur votre enfant et obtenez des réponses fondées sur ce que vous avez gardé.",
  },
  {
    feature: "Saisir un moment",
    outcome:
      "Enregistrez vite ce que vous venez de remarquer, en une phrase, une photo ou votre voix, avant de l’oublier.",
  },
  /* Avec l'anglais, 9 November 2026. Her name, given the same afternoon: it
     went in as "Reflect together" on the reasoning that the product's proper
     names stay English, and she translated it. She is right and the row above
     proves it: every other feature on this French page is already translated,
     from Mon enfant to Saisir un moment. The imperative matches them and
     matches the -ez form /fr uses throughout. */
  {
    feature: "Réfléchissez ensemble",
    outcome: "Répondez à quelques questions avec votre enfant.",
  },
];

const close = closing.fr;

export default function FrenchHiddenReportCardPage() {
  return (
    <div lang="fr">
      {/* HER BRIEF OF 2 NOVEMBER 2026: the action comes first. The English
          page carries the full note; this page follows it exactly, so the
          language toggle never changes which page you are on. The sentence
          that used to close the hero moved into the contrast section below,
          unchanged. */}

      {/* 1. The short heading */}
      <section className="mx-auto max-w-[920px] px-6 pb-6 pt-8 text-center md:px-10 md:pb-10 md:pt-16">
        <div className="mb-[22px] text-[15px] font-semibold uppercase tracking-[0.24em] text-rose">
          Parce qu&rsquo;un bulletin n&rsquo;a jamais été conçu pour raconter
          toute l&rsquo;histoire,
        </div>
        <h1
          className="font-heading text-bark"
          style={{
            fontSize: "clamp(38px,5.6vw,64px)",
            fontWeight: 500,
            lineHeight: 1.06,
            letterSpacing: "-0.005em",
          }}
        >
          voici une plus juste mesure.
        </h1>
      </section>

      {/* 2. The action */}
      <section
        id="plans"
        className="scroll-mt-6 bg-parchment px-6 pb-16 pt-2 md:px-10 md:pb-[100px]"
      >
        <div className="mx-auto max-w-[1180px]">
          <PlanCards locale="fr" prices={APP_PRICES} showEyebrow={false} />
        </div>
      </section>

      {/* 3. Contrast */}
      <section className="bg-blush px-6 py-16 md:px-10 md:py-[100px]">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-12 text-center md:mb-[60px]">
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(26px,4.6vw,50px)", lineHeight: 1.12 }}
            >
              Les notes racontent une histoire.
              <br />
              Elles ne racontent tout simplement pas toute l&rsquo;histoire.
            </h2>
            <p
              className="font-heading mx-auto mt-7 italic text-dusk"
              style={{
                fontSize: "clamp(18px,2.2vw,23px)",
                lineHeight: 1.5,
                maxWidth: 620,
              }}
            >
              Un bulletin mesure votre enfant par rapport à un ensemble limité
              de critères. Il n&rsquo;a jamais été conçu pour mesurer votre
              enfant au complet.
            </p>
          </div>

          <div className="flex flex-col gap-px border border-grid bg-grid">
            {contrasts.map(({ left, right }, i) => (
              <div key={i} className="grid grid-cols-1 bg-blush md:grid-cols-2">
                <div className="border-b border-grid px-6 py-6 md:border-b-0 md:border-r md:px-9 md:py-[34px]">
                  <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-faint">
                    Le bulletin
                  </div>
                  <div
                    className="font-heading text-smoke"
                    style={{ fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.3 }}
                  >
                    {left}
                  </div>
                </div>
                <div className="px-6 py-6 md:px-9 md:py-[34px]">
                  <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-rose">
                    La juste mesure
                  </div>
                  <div
                    className="font-heading text-bark"
                    style={{ fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.3 }}
                  >
                    {right}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The framework */}
      <section className="bg-ghost px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1080px]">
          {/* Her wording of 2 November 2026. See the English page. */}
          <div className="mx-auto mb-12 max-w-[720px] text-center md:mb-14">
            {/* One line since 9 November 2026, as on the English page: under
                the new name the second line repeated the first. */}
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              La juste mesure
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,54px)", lineHeight: 1.08, margin: 0 }}
            >
              Les notes de votre enfant ne montrent pas tout ce dont il est
              capable.
            </h2>
          </div>

          <FrameworkList locale="fr" />

          <div
            className="mx-auto mt-[54px] flex flex-col gap-5 text-center text-smoke"
            style={{ fontSize: 17, lineHeight: 1.75, maxWidth: 640 }}
          >
            {/* Bold, with the English. Her instruction of 9 November 2026. */}
            <p
              className="font-heading font-bold italic text-dusk"
              style={{ fontSize: "clamp(20px,2.4vw,25px)" }}
            >
              Vous en reconnaissez peut-être déjà certaines. D&rsquo;autres, vous
              ne les avez peut-être pas encore vues.
            </p>
            <p>
              Mais les preuves sont éparpillées entre des personnes, des lieux,
              des expériences et des années. Une enseignante en voit un morceau.
              Vous en voyez un autre. Un entraîneur en voit un autre. Votre
              enfant, lui, vit tout cela.
            </p>
            {/* Le voyage, 9 November 2026, shortened with the English the
                same afternoon. See the note on the English page.

                "Ah, et" rather than a literal "Oh, et", which reads as
                translated English. "Ah, et" is the aside her sentence is
                making, in the register /fr already uses. */}
            <p>
              Ah, et trois semaines de voyage, c&rsquo;est trois semaines
              d&rsquo;apprentissage. L&rsquo;école inscrit une absence. Votre
              enfant, lui, était présent à tout cela.
            </p>
            <p>
              Tant que ces preuves ne sont pas réunies, il est difficile de voir
              ce qu&rsquo;elles révèlent.
            </p>
            <p>
              C&rsquo;est pour cela que nous l&rsquo;appelons la{" "}
              <strong className="font-semibold text-bark">juste mesure</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 5. What you actually get */}
      <section className="bg-blush px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[680px] text-center">
          <h2
            className="font-heading mb-7 font-medium text-bark"
            style={{ fontSize: "clamp(28px,5vw,48px)", lineHeight: 1.1 }}
          >
            Ce que vous obtenez vraiment
          </h2>
          <p
            className="font-heading mb-9 italic text-dusk"
            style={{ fontSize: "clamp(19px,2.4vw,24px)", lineHeight: 1.45 }}
          >
            L&rsquo;école fait partie de l&rsquo;éducation de votre enfant. Elle
            n&rsquo;en est pas la totalité.
          </p>

          <div
            className="mb-10 flex flex-col gap-6 text-left text-smoke"
            style={{ fontSize: 17, lineHeight: 1.8 }}
          >
            <p>
              Vous commencez par réunir ce qui existe déjà : les bulletins, les
              évaluations, les commentaires des enseignants, vos propres
              observations, et des preuves venues de tous les endroits où votre
              enfant apprend et grandit.
            </p>
            <p>
              Truer Measure réunit ces preuves et génère la{" "}
              <strong className="font-semibold text-bark">juste mesure</strong>{" "}
              de votre enfant.
            </p>
            <p>
              Vous pouvez maintenant voir ce qui revient, ce qui change, où les
              preuves sont solides, et ce que vous n&rsquo;avez tout simplement pas
              encore assez vu.
            </p>
            <p>
              Ensuite, vous continuez d&rsquo;ajouter à mesure que votre enfant
              grandit : un nouveau bulletin, un projet, une parole d&rsquo;une
              enseignante, une photo, ou un moment que vous ne voulez pas
              oublier.
            </p>
            <p>
              Au fil du temps, vous bâtissez un portrait de votre enfant
              qu&rsquo;aucun bulletin, aucune enseignante et aucune année
              scolaire ne pourrait vous donner seul.
            </p>
            <p>
              Il est à vous. Vous décidez ce qui y entre, qui y contribue et qui
              peut le voir.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Moments */}
      <section className="bg-ghost px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[1000px]">
          <div className="mx-auto mb-[60px] max-w-[620px] text-center">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              À quoi cela ressemble dans la vraie vie
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(32px,5vw,54px)", lineHeight: 1.08 }}
            >
              Ouvrez la juste mesure
            </h2>
          </div>

          <div className="flex flex-col">
            {moments.map((context) => (
              <div key={context} className="border-t border-border px-1 py-7 text-center">
                <div
                  className="font-heading italic text-dusk"
                  style={{ fontSize: "clamp(21px,2.8vw,29px)" }}
                >
                  {context}
                </div>
              </div>
            ))}
            <div className="border-t border-border px-1 py-7 text-center">
              <div
                className="font-heading font-semibold text-bark"
                style={{ fontSize: "clamp(21px,2.8vw,29px)" }}
              >
                Chaque fois que vous avez besoin de voir les preuves.
              </div>
            </div>
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* 7. The product experience */}
      <section className="bg-linen px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[900px]">
          <div className="mx-auto mb-12 max-w-[620px] text-center md:mb-16">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              À l&rsquo;intérieur du produit
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,50px)", lineHeight: 1.08 }}
            >
              Ce que vous utiliseriez vraiment.
            </h2>
          </div>

          <dl className="flex flex-col">
            {experience.map(({ feature, outcome }) => (
              <div
                key={feature}
                className="grid grid-cols-1 gap-2 border-t border-border py-6 md:grid-cols-[220px_1fr] md:gap-8 md:py-7"
              >
                <dt className="font-heading text-[21px] text-bark">{feature}</dt>
                <dd className="text-smoke" style={{ fontSize: 16, lineHeight: 1.7 }}>
                  {outcome}
                </dd>
              </div>
            ))}
            <div className="border-t border-border" />
          </dl>
        </div>
      </section>

      {/* 7. THE CLOSE, same as the English page. It said "Le rapport caché est
          en évolution" under a "Sachez-le en premier." email capture until
          9 November 2026; her instruction: "This is not longer true… It's
          live." See content/founding-families.ts for what replaced it and
          why. */}
      <section className="bg-bark px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[640px] text-center">
          <h2
            className="font-heading font-medium text-parchment"
            style={{ fontSize: "clamp(28px,5vw,46px)", lineHeight: 1.1 }}
          >
            {close.heading}
          </h2>
          <p className="mt-7 text-muted" style={{ fontSize: 17, lineHeight: 1.75 }}>
            {close.story}
          </p>
          <a
            href={close.ctaHref}
            className="mt-9 inline-block rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline"
          >
            {close.cta}
          </a>
        </div>
      </section>
    </div>
  );
}
