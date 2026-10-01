import type { Metadata } from "next";
import Link from "next/link";
import LearnContent from "@/content/learn.fr.mdx";
import { WaitlistButton } from "@/components/waitlist-button";
import { alternatesFor, tiers } from "@/content/i18n";

export const metadata: Metadata = {
  title: "Entre parents",
  description:
    "Une communauté choisie pour des parents qui prennent l'apprentissage au sérieux : rencontre en direct avec Jolene, experts invités, et des questions posées en contexte.",
  alternates: alternatesFor("/learn", "fr"),
};

/**
 * Same structure as app/learn/page.tsx. The body comes from
 * content/learn.fr.mdx, the French counterpart of content/learn.mdx.
 */
export default function FrenchLearnPage() {
  return (
    <div lang="fr">
      {/* Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
          {tiers.fr.twoFlat}
        </div>
        <h1
          className="font-heading mb-8 font-medium text-bark"
          style={{ fontSize: "clamp(44px,7vw,88px)", lineHeight: 1.0, letterSpacing: "-0.01em" }}
        >
          Parents d&rsquo;exception
        </h1>
        <p
          className="font-heading mx-auto italic text-dusk"
          style={{ fontSize: "clamp(20px,2.8vw,28px)", lineHeight: 1.45, maxWidth: 600 }}
        >
          Des parents d&rsquo;exception comme leaders de l&rsquo;apprentissage
        </p>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e3cfc8 40%,#e3cfc8 60%,transparent)" }} />
      </div>

      {/* Content */}
      <section className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-[96px]">
        <LearnContent />

        <div className="mt-16 border-t border-border pt-10">
          <WaitlistButton
            locale="fr"
            tag="waitlist-elite-learning-leaders"
            label="Liste d’attente"
            modalEyebrow={tiers.fr.twoFlat}
            modalTitle="Inscrivez-vous à la liste d’attente."
            submitLabel="S’inscrire"
            variant="bark"
          />
          <Link
            href="/fr"
            className="ml-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-rose hover:text-bark transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </section>
    </div>
  );
}
