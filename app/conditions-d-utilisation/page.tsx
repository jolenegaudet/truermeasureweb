import type { Metadata } from "next";
import Link from "next/link";
import TermsContent from "@/content/conditions-d-utilisation.mdx";

export const metadata: Metadata = {
  title: "Conditions d’utilisation",
};

export default function ConditionsPage() {
  return (
    <>
      <section className="mx-auto max-w-[920px] px-6 pb-[40px] pt-16 text-center md:px-10 md:pt-24">
        <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
          Truer Measure
        </div>
        <h1
          className="font-heading mb-8 font-medium text-bark"
          style={{ fontSize: "clamp(36px,5vw,64px)", lineHeight: 1.05, letterSpacing: "-0.01em" }}
        >
          Conditions d’utilisation
        </h1>
      </section>

      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e3cfc8 40%,#e3cfc8 60%,transparent)" }} />
      </div>

      <section className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-[72px]">
        <p className="mb-10 text-smoke" style={{ fontSize: 15 }}>
          <Link href="/terms-of-service" className="text-rose underline underline-offset-2">
            English version
          </Link>
        </p>
        <TermsContent />

        <div className="mt-16 border-t border-border pt-10">
          <Link
            href="/"
            className="text-[13px] font-semibold uppercase tracking-[0.14em] text-rose hover:text-bark transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </section>
    </>
  );
}
