import type { Metadata } from "next";
import { Fragment } from "react";
import { OfferPrice } from "@/components/offer-price";
import {
  CHECKOUT_URL,
  FOUNDING_CAP,
  checkoutReady,
  offerFr,
} from "@/content/founding-families";
import { alternatesFor, tiers } from "@/content/i18n";

const DESCRIPTION =
  "Réunissez les bulletins, les commentaires des enseignants, vos observations, les projets et les moments vécus hors de l'école, et voyez ce qui revient d'une expérience à l'autre chez votre enfant.";

export const metadata: Metadata = {
  title: "Familles fondatrices",
  description: DESCRIPTION,
  alternates: alternatesFor("/hidden-report-card", "fr"),
  openGraph: {
    siteName: "Truer Measure",
    type: "website",
    locale: "fr_CA",
    url: "/fr/hidden-report-card",
    title: "Familles fondatrices",
    description: DESCRIPTION,
  },
  twitter: { description: DESCRIPTION },
};

/**
 * The French counterpart of app/hidden-report-card/page.tsx. Same sections, in
 * the same order, so the language toggle never changes which page you are on.
 *
 * NAMING, her four terms of 2 October 2026. The document is "Le rapport caché"
 * in French, with no trademark symbol: she wrote the mark on the English name
 * and not on the French one. The product itself is Une Juste Mesure, and the
 * other two offers are Parents leaders and Cercle privé, all in
 * content/i18n.ts.
 *
 * The route keeps the /hidden-report-card path on both sides, which is also the
 * phrase a parent is most likely to search for.
 */

const contrasts = [
  {
    left: "Mesure la performance.",
    right: "Voit la personne derrière la performance.",
  },
  {
    left: "Vous donne un instantané.",
    right: "Garde l'histoire au fil du temps.",
  },
  {
    left: "Vous dit comment votre enfant va à l'école.",
    right:
      "Tient un portrait vivant de l'éducation de votre enfant, à l'école et au-delà.",
  },
];

// Her rows of four, kept as rows: the grouping is part of the reading.
const qualityRows = [
  ["Curiosité", "Imagination", "Créativité", "Esprit critique"],
  ["Confiance", "Courage", "Connaissance de soi", "Autonomie"],
  ["Persévérance", "Résilience", "Rigueur", "Initiative"],
  ["Bienveillance", "Empathie", "Honnêteté", "Intégrité"],
  ["Collaboration", "Communication", "Leadership", "Intelligence émotionnelle"],
  ["Adaptabilité", "Jugement", "Résolution de problèmes", "Débrouillardise"],
  ["Autorégulation", "Responsabilité", "Suivi jusqu'au bout", "Pouvoir d'agir"],
  ["Ouverture aux cultures", "Sens civique", "Sens du but"],
];

const moments = [
  "Avant une rencontre avec l'enseignante",
  "Avant une demande pour un programme, une équipe ou une bourse",
  "Quand le bulletin ne correspond pas à l'enfant que vous connaissez",
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
      "Voyez un portrait plus complet de votre enfant, à l'école et dans la vie de tous les jours.",
  },
  {
    feature: "Chronologie",
    outcome:
      "Voyez ensemble, au fil du temps, les moments importants venus de l'école et de la vie.",
  },
  {
    feature: "Preuves",
    outcome:
      "Gardez au même endroit les bulletins, les travaux scolaires, les certificats, les photos, les projets et vos propres observations.",
  },
  {
    feature: "Constats",
    outcome:
      "Remarquez ce qui se répète au fil du temps et voyez où l'école et la vie quotidienne racontent la même histoire ou deux histoires différentes.",
  },
  {
    feature: "Demander",
    outcome:
      "Posez des questions sur votre enfant et obtenez des réponses fondées sur ce que vous avez gardé.",
  },
  {
    feature: "Saisir un moment",
    outcome:
      "Enregistrez vite ce que vous venez de remarquer, en une phrase, une photo ou votre voix, avant de l'oublier.",
  },
];

export default function FrenchHiddenReportCardPage() {
  return (
    <div lang="fr">
      {/* 1. Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        <div className="mb-[30px] text-[15px] font-semibold uppercase tracking-[0.24em] text-rose">
          Parce qu&rsquo;un bulletin n&rsquo;a jamais été conçu pour raconter
          toute l&rsquo;histoire
        </div>
        <h1
          className="font-heading mb-8 text-bark"
          style={{
            fontSize: "clamp(38px,5.6vw,64px)",
            fontWeight: 500,
            lineHeight: 1.06,
            letterSpacing: "-0.005em",
          }}
        >
          voici une plus juste mesure.
        </h1>
        <p
          className="font-heading mx-auto mb-10 italic text-dusk"
          style={{
            fontSize: "clamp(18px,2.2vw,23px)",
            lineHeight: 1.5,
            maxWidth: 620,
          }}
        >
          Un bulletin mesure votre enfant par rapport à un ensemble limité de
          critères. Il n&rsquo;a jamais été conçu pour mesurer votre enfant au
          complet.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[18px]">
          <a
            href="#founding"
            className="inline-block rounded-[2px] bg-bark px-[34px] py-[17px] text-[14px] font-semibold uppercase tracking-[0.12em] text-parchment no-underline"
          >
            Voyez l&rsquo;offre Familles fondatrices
          </a>
        </div>
      </section>

      {/* 2. Contrast */}
      <section className="bg-blush px-6 py-16 md:px-10 md:py-[100px]">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-12 text-center md:mb-[60px]">
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(26px,4.6vw,50px)", lineHeight: 1.12 }}
            >
              Les notes racontent une histoire.
              <br />
              Elles ne racontent simplement pas toute l&rsquo;histoire.
            </h2>
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
                    Le rapport caché
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

      {/* 3. Qualities */}
      <section className="bg-ghost px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1080px]">
          <div className="mx-auto mb-12 max-w-[720px] text-center md:mb-16">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              Le rapport caché
              <br />
              Une juste mesure de votre enfant
            </div>
            <h2
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,54px)", lineHeight: 1.08, margin: 0 }}
            >
              Aucune de ces qualités ne reçoit de note. Pourtant, elles façonnent
              une grande part de ce que votre enfant devient.
            </h2>
          </div>

          <div className="flex flex-col border-y border-grid">
            {qualityRows.map((row) => (
              <p
                key={row[0]}
                className="font-heading border-b border-grid py-5 text-center font-medium text-bark last:border-b-0 md:py-6"
                style={{ fontSize: "clamp(20px,2.8vw,32px)", lineHeight: 1.3 }}
              >
                {row.map((word, i) => (
                  <Fragment key={word}>
                    <span className="whitespace-nowrap">{word}</span>
                    {i < row.length - 1 ? (
                      <>
                        {" "}
                        <span className="px-2 text-warm md:px-3" aria-hidden="true">
                          &middot;
                        </span>{" "}
                      </>
                    ) : null}
                  </Fragment>
                ))}
              </p>
            ))}
          </div>

          <div
            className="mx-auto mt-[54px] flex flex-col gap-5 text-center text-smoke"
            style={{ fontSize: 17, lineHeight: 1.75, maxWidth: 640 }}
          >
            <p className="font-heading italic text-dusk" style={{ fontSize: "clamp(20px,2.4vw,25px)" }}>
              Vous en reconnaissez peut-être déjà certaines. D&rsquo;autres, vous
              ne les avez peut-être pas encore vues.
            </p>
            <p>
              Mais les preuves sont éparpillées entre des personnes, des lieux,
              des expériences et des années. Une enseignante en voit un morceau.
              Vous en voyez un autre. Un entraîneur en voit un autre. Votre
              enfant, lui, vit tout cela.
            </p>
            <p>
              Tant que ces preuves ne sont pas réunies, il est difficile de voir
              ce qu&rsquo;elles révèlent.
            </p>
            <p>
              C&rsquo;est pour cela que nous l&rsquo;appelons le{" "}
              <strong className="font-semibold text-bark">rapport caché</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 4. What you actually get */}
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
              Truer Measure réunit ces preuves et génère le{" "}
              <strong className="font-semibold text-bark">rapport caché</strong>{" "}
              de votre enfant.
            </p>
            <p>
              Vous pouvez maintenant voir ce qui revient, ce qui change, où les
              preuves sont solides, et ce que vous n&rsquo;avez simplement pas
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

      {/* 5. Moments */}
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
              Ouvrez le rapport caché
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

      {/* 6. The product experience */}
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

      {/* 7. The Founding Families offer */}
      <section id="founding" className="bg-bark px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto max-w-[880px]">
          <div className="mx-auto mb-12 max-w-[620px] text-center md:mb-16">
            <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose-dark">
              Familles fondatrices
            </div>
            <h2
              className="font-heading font-medium text-parchment"
              style={{ fontSize: "clamp(28px,5vw,50px)", lineHeight: 1.08 }}
            >
              Joignez-vous tôt et aidez à façonner ce qui se bâtit.
            </h2>
          </div>

          <div className="mx-auto max-w-[520px] border border-charcoal px-8 py-10 text-center md:px-11 md:py-12">
            <div className="mb-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-rose-dark">
              Limité à {FOUNDING_CAP} familles
            </div>
            <OfferPrice showStandard locale="fr" />

            <p className="mt-4 text-muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
              Pour {offerFr.scope}.
            </p>

            {/* Compliance spec 5.1: this stays immediately above the CTA. */}
            <p
              className="mt-8 border-t border-charcoal pt-8 text-center text-muted"
              style={{ fontSize: 14.5, lineHeight: 1.65 }}
            >
              {offerFr.cancellation}
            </p>

            <p className="mt-6 text-parchment" style={{ fontSize: 15, lineHeight: 1.65 }}>
              {offerFr.offerNote}
            </p>

            <div className="mt-8 border-t border-charcoal pt-8">
              {checkoutReady ? (
                <>
                  <a
                    href={CHECKOUT_URL}
                    className="inline-block w-full rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline"
                  >
                    Devenez une famille fondatrice
                  </a>
                  <p
                    className="mt-4 text-subdued"
                    style={{ fontSize: 12.5, lineHeight: 1.65 }}
                  >
                    Le tarif de lancement est appliqué pour vous. Il n&rsquo;y a
                    aucun code à entrer.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-[2px] border border-charcoal bg-transparent px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-subdued"
                  >
                    Devenez une famille fondatrice
                  </button>
                  <p
                    className="mt-4 text-subdued"
                    style={{ fontSize: 12.5, lineHeight: 1.65 }}
                  >
                    Ouverture bientôt.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* What a founding family gets, and for how long. */}
          <div className="mx-auto mt-14 max-w-[720px] md:mt-16">
            <h3 className="font-heading mb-6 text-center text-[26px] text-parchment">
              Ce qui est inclus
            </h3>
            <dl className="flex flex-col">
              {offerFr.foundingIncludes.map(({ what, howLong }) => (
                <div
                  key={what}
                  className="grid grid-cols-1 gap-1 border-t border-charcoal py-5 md:grid-cols-[1fr_auto] md:gap-8"
                >
                  <dt className="text-parchment" style={{ fontSize: 16, lineHeight: 1.6 }}>
                    {what}
                  </dt>
                  <dd className="text-subdued md:text-right" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                    {howLong}
                  </dd>
                </div>
              ))}
              <div className="border-t border-charcoal" />
            </dl>

            <div
              className="mx-auto mt-10 flex max-w-[620px] flex-col gap-3 text-center text-subdued"
              style={{ fontSize: 14, lineHeight: 1.7 }}
            >
              <p>
                Cela ne comprend pas {tiers.fr.twoFlat} ni le{" "}
                {tiers.fr.threeFlat}. Ce sont des offres distinctes, et vous
                joindre ici ne vous donne ni l&rsquo;une ni l&rsquo;autre.
              </p>
              <p>
                Ce n&rsquo;est pas de la consultation individuelle, et ce
                n&rsquo;est pas la promesse que chaque suggestion devienne une
                fonctionnalité. Jolene lit ce que les familles fondatrices
                envoient, et décide de ce qui se bâtit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
