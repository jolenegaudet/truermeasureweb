import type { Metadata } from "next";
import Link from "next/link";
import BuildContent from "@/content/build.fr.mdx";
import { WaitlistButton } from "@/components/waitlist-button";
import { alternatesFor, tiers } from "@/content/i18n";

export const metadata: Metadata = {
  title: "Cercle privé",
  description:
    "Un accès direct à Jolene et une voix dans ce que Truer Measure crée ensuite. Les places sont limitées et l'admission se fait sur demande.",
  alternates: alternatesFor("/inner-circle", "fr"),
};

/**
 * Same structure as app/inner-circle/page.tsx. The body comes from
 * content/build.fr.mdx, the French counterpart of content/build.mdx.
 */
export default function FrenchInnerCirclePage() {
  return (
    <div lang="fr">
      {/* Hero */}
      <section className="bg-blush px-6 pb-[60px] pt-16 md:px-10 md:pb-[72px] md:pt-24">
        <div className="mx-auto max-w-[920px] text-center">
          <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
            Aidez à façonner la suite
          </div>
          <h1
            className="font-heading mb-8 font-medium text-bark"
            style={{ fontSize: "clamp(44px,7vw,88px)", lineHeight: 1.0, letterSpacing: "-0.01em" }}
          >
            {tiers.fr.threeFlat}
          </h1>
          <p
            className="font-heading mx-auto italic text-dusk"
            style={{ fontSize: "clamp(20px,2.8vw,28px)", lineHeight: 1.45, maxWidth: 600 }}
          >
            Faites partie du Cercle privé
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-[96px]">
        <BuildContent />

        <div className="mt-16 border-t border-border pt-10">
          <WaitlistButton
            locale="fr"
            tag="applied-inner-circle"
            label={"Faites une demande"}
            modalEyebrow="Aidez à façonner la suite"
            modalTitle={`Faites votre demande pour le ${tiers.fr.threeFlat}.`}
            submitLabel={"Envoyez la demande"}
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
