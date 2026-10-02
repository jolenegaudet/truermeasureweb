import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { OfferPrice } from "@/components/offer-price";
import {
  CHECKOUT_URL,
  FOUNDING_CAP,
  checkoutReady,
} from "@/content/founding-families";
import { WaitlistButton } from "@/components/waitlist-button";
import { alternatesFor, tiers } from "@/content/i18n";

const DESCRIPTION =
  "Un portrait vivant de l'apprentissage, des forces et du cheminement de votre enfant, qui réunit ce qui vient de l'école et d'ailleurs.";

export const metadata: Metadata = {
  title: "A Truer Measure",
  description: DESCRIPTION,
  alternates: alternatesFor("/", "fr"),
  // Without this the page inherits the English Open Graph block from the root
  // layout, so sharing the French page previews in English.
  openGraph: {
    // A page-level openGraph replaces the root block rather than merging into
    // it, so siteName and type have to be restated here. The preview image
    // comes from app/fr/opengraph-image.png, its own copy of the file, because
    // a page that sets openGraph stops inheriting the root segment's image and
    // would otherwise share with no picture at all.
    siteName: "Truer Measure",
    type: "website",
    locale: "fr_CA",
    url: "/fr",
    title: "A Truer Measure",
    description: DESCRIPTION,
  },
  twitter: { description: DESCRIPTION },
};

const roomAccess = [
  "Rencontre en direct avec Jolene, chaque semaine",
  "Experts invités",
  "Une communauté entre les rencontres",
  "Questions et réponses en groupe",
];

const circleAccess = [
  "Accès direct à Jolene",
  "Un petit cercle, sur demande",
  "Une voix dans ce que Truer Measure bâtira ensuite",
];

/**
 * The French home page. Same order and same structure as app/page.tsx, which is
 * deliberate: a parent who switches language should land on the same page, not
 * a different one.
 *
 * NAMING, following Jolène's ruling of 1 October 2026 (one brand, two
 * languages). The three offers keep their English names, because they are the
 * products: A Truer Measure, Learn from the Room, Inner Circle. The tier words
 * are translated, because they describe rather than name, and the section
 * heading translates them anyway. The headline uses "une juste mesure", the
 * phrase behind justemesure.ca, because "Voici A Truer Measure" reads like a
 * translation accident.
 *
 * Prices and offer terms come from content/founding-families.ts, the same file
 * the English page reads, so the two languages cannot quote different numbers.
 */
export default function FrenchHomePage() {
  return (
    <div lang="fr">
      {/* 1. Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        <p
          className="mx-auto mb-6 max-w-[620px] text-smoke"
          style={{ fontSize: "clamp(18px,2.3vw,23px)", lineHeight: 1.45 }}
        >
          Un bulletin n&rsquo;a jamais été conçu pour raconter toute
          l&rsquo;histoire.
        </p>
        {/* Jolene's wording, 1 October 2026. Six words where the English
            headline has four, so it is set smaller: at the English clamp the
            French sentence fills a phone screen on its own. */}
        <h1
          className="font-heading mx-auto mb-8 max-w-[880px] text-bark"
          style={{
            fontSize: "clamp(40px,6.6vw,82px)",
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: "-0.01em",
          }}
        >
          Voici une plus juste mesure pour votre enfant.
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-[18px]">
          <a
            href="#tiers"
            className="inline-block rounded-[2px] bg-bark px-[34px] py-[17px] text-[14px] font-semibold uppercase tracking-[0.12em] text-parchment no-underline"
          >
            COMMENCER
          </a>
        </div>
      </section>

      {/* 2. Founder */}
      <section className="bg-linen px-6 py-16 md:px-10 md:py-[104px]">
        <div className="mx-auto grid max-w-[1080px] items-center gap-10 md:gap-16 md:grid-cols-[0.85fr_1.15fr]">
          <div className="flex justify-center">
            <Image
              src="/founder.png"
              alt="Jolene, fondatrice de Truer Measure"
              width={400}
              height={400}
              className="block rounded-full object-cover object-top"
              style={{ width: "min(280px, 70vw)", aspectRatio: "1/1" }}
            />
          </div>
          <div>
            <div className="mb-[26px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              Un mot de la fondatrice
            </div>
            <p
              className="font-heading mb-7 text-bark"
              style={{
                fontSize: "clamp(24px,3vw,34px)",
                lineHeight: 1.4,
              }}
            >
              Pendant près de <em>25 ans</em>, j&rsquo;ai contribué aux bulletins
              que les familles rapportent à la maison, d&rsquo;abord comme
              enseignante qui les rédigeait, ensuite comme directrice qui les
              signait.
            </p>
            <p
              className="mb-[22px] text-smoke"
              style={{ fontSize: 17, lineHeight: 1.75 }}
            >
              J&rsquo;ai assisté à des centaines de rencontres parents
              enseignants en regardant des familles chercher leur enfant dans un
              paragraphe de commentaires soigneusement formulés. Et je voyais
              toujours la même chose : les qualités et les habiletés qui
              comptaient le plus, la conviction discrète qu&rsquo;un enfant est
              capable de plus que la case où on vient de le placer, ne se
              trouvaient nulle part dans ces pages.
            </p>
            <p className="text-smoke" style={{ fontSize: 17, lineHeight: 1.75 }}>
              C&rsquo;est pourquoi j&rsquo;ai créé {tiers.fr.oneFlat} : un portrait
              vivant de l&rsquo;éducation de votre enfant, à l&rsquo;école et{" "}
              <em className="italic text-bark">au-delà</em>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Tiers */}
      <section
        id="tiers"
        className="bg-parchment px-6 pb-16 pt-16 md:px-10 md:pb-[100px] md:pt-[110px]"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-12 max-w-[560px] text-center md:mb-16">
            <h2
              className="font-heading mb-[18px] font-medium text-bark"
              style={{ fontSize: "clamp(28px,5vw,52px)", lineHeight: 1.08 }}
            >
              Commencez par la clarté.
            </h2>
            <p className="text-smoke" style={{ fontSize: 17, lineHeight: 1.7 }}>
              Continuez par la communauté. Grandissez par la proximité.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-7 md:grid-cols-3 md:gap-8">
            {/* Tier 1 — A Truer Measure */}
            <div className="flex flex-col">
              <div
                className="flex flex-1 flex-col items-center rounded-[2px] bg-bark px-11 pb-[52px] pt-[58px] text-center"
                style={{ boxShadow: "0 12px 48px rgba(43,34,32,.18)" }}
              >
                <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose-dark">
                  Clarté
                </div>
                <div
                  className="font-heading mb-3 font-medium text-parchment"
                  style={{ fontSize: 40, lineHeight: 1.04 }}
                >
                  {tiers.fr.one[0]}
                  <br />
                  {tiers.fr.one[1]}
                </div>
                <p className="font-heading mb-7 text-[19px] text-warm">
                  Familles fondatrices
                </p>
                <p
                  className="mb-8 text-parchment"
                  style={{ fontSize: 15.5, lineHeight: 1.55 }}
                >
                  Plus qu&rsquo;une note pour parler de votre enfant.
                </p>
                {/* Amounts come from content/founding-families.ts, the one
                    place the offer is defined, so the two languages cannot
                    quote different prices. */}
                <div className="mb-5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-rose-dark">
                  Limité à {FOUNDING_CAP} familles
                </div>
                <OfferPrice showStandard locale="fr" />
                <p
                  className="mt-5 text-muted"
                  style={{ fontSize: 13, lineHeight: 1.7 }}
                >
                  Une adhésion couvre un enfant.
                </p>
                <div className="flex-1" />
                {/* Compliance spec 5.1 keeps the billing terms immediately
                    above the CTA, in both languages. */}
                <p
                  className="mb-7 mt-8 text-muted"
                  style={{ fontSize: 11.5, lineHeight: 1.6 }}
                >
                  Facturé chaque mois. Annulez en tout temps. Le mois que vous
                  avez payé vous reste.
                </p>
                <a
                  href={
                    checkoutReady
                      ? CHECKOUT_URL
                      : "/fr/hidden-report-card#founding"
                  }
                  className="inline-block rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline"
                >
                  Commencez ici
                </a>
                <Link
                  href="/fr/hidden-report-card"
                  className="mt-5 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted no-underline hover:text-parchment"
                >
                  Voir ce qu&rsquo;il y a dedans
                </Link>
              </div>
            </div>

            {/* Tier 2 — Learn from the Room */}
            <div className="flex flex-col items-center rounded-[2px] border border-border bg-ghost px-9 pb-[46px] pt-[50px] text-center">
              <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
                Communauté
              </div>
              <div
                className="font-heading mb-[18px] font-medium text-bark"
                style={{ fontSize: 34, lineHeight: 1.06 }}
              >
                {tiers.fr.two[0]}
                <br />
                {tiers.fr.two[1]}
              </div>
              <p className="font-heading mb-7 text-[19px] text-dusk">
                Des parents d&rsquo;exception comme leaders de
                l&rsquo;apprentissage
              </p>
              <div
                className="mb-9 flex flex-col gap-[10px] text-smoke"
                style={{ fontSize: 14 }}
              >
                {roomAccess.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
              <div className="flex-1" />
              <WaitlistButton
                locale="fr"
                tag="waitlist-elite-learning-leaders"
                label={"Liste d’attente"}
                modalEyebrow={tiers.fr.twoFlat}
                modalTitle={"Inscrivez-vous à la liste d’attente."}
                submitLabel={"S’inscrire"}
                variant="outline-rose-dark"
              />
            </div>

            {/* Tier 3 — Inner Circle */}
            <div className="flex flex-col items-center rounded-[2px] border border-warm bg-blush px-9 pb-[46px] pt-[50px] text-center">
              <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
                Proximité
              </div>
              <div
                className="font-heading mb-[18px] font-medium text-bark"
                style={{ fontSize: 34, lineHeight: 1.06 }}
              >
                {tiers.fr.three[0]}
                <br />
                {tiers.fr.three[1]}
              </div>
              <p className="font-heading mb-7 text-[19px] text-dusk">
                Aidez à façonner la suite
              </p>
              <div
                className="mb-9 flex flex-col gap-[10px] text-smoke"
                style={{ fontSize: 14 }}
              >
                {circleAccess.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
              <div className="flex-1" />
              <WaitlistButton
                locale="fr"
                tag="applied-inner-circle"
                label="Postuler"
                modalEyebrow="Aidez à façonner la suite"
                modalTitle={`Postulez au ${tiers.fr.threeFlat}.`}
                submitLabel="Envoyer la demande"
                variant="outline-rose"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
