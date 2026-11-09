import type { Metadata } from "next";
import { WithdrawalForm } from "@/components/withdrawal-form";
import { MANAGE_URL } from "@/content/founding-families";
import { alternatesFor } from "@/content/i18n";

export const metadata: Metadata = {
  title: "Rétractez-vous du contrat",
  alternates: alternatesFor("/withdraw", "fr"),
};

/**
 * The French counterpart of app/withdraw/page.tsx. EU right of withdrawal,
 * Terms section 15.
 *
 * This page exists because the withdrawal function has to be available to the
 * person in the language the contract was sold to them in. A French parent who
 * bought from the French site should not have to withdraw in English.
 */
export default function FrenchWithdrawPage() {
  return (
    <section lang="fr" className="mx-auto max-w-[680px] px-6 py-16 md:px-10 md:py-24">
      <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
        Pour les membres de l&rsquo;Union européenne
      </div>
      <h1
        className="font-heading mb-6 font-medium text-bark"
        style={{ fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.08 }}
      >
        Rétractez-vous du contrat
      </h1>
      <div className="mb-10 flex flex-col gap-4 text-smoke" style={{ fontSize: 17, lineHeight: 1.75 }}>
        <p>
          Si vous habitez dans l&rsquo;Union européenne, vous pouvez vous
          rétracter de votre adhésion dans les 14 jours suivant votre
          inscription, sans avoir à donner de raison. Si vous avez eu accès
          pendant cette période, vous ne payez que les jours d&rsquo;accès dont
          vous avez bénéficié, et nous vous remboursons le reste dans les 14
          jours.
        </p>
        <p>
          Pour annuler une adhésion à tout autre moment, utilisez{" "}
          <a href={MANAGE_URL} className="text-rose underline underline-offset-2">
            Gérez ou annulez votre adhésion
          </a>
          .
        </p>
      </div>
      <WithdrawalForm locale="fr" />
    </section>
  );
}
