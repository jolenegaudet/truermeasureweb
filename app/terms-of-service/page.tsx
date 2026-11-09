import type { Metadata } from "next";
import { alternatesFor } from "@/content/i18n";
import Link from "next/link";
import TermsContent from "@/content/terms-of-service.mdx";

/**
 * The Terms of Service.
 *
 * content/terms-of-service.mdx is GENERATED from
 * offer/legal-documents-current/terms-of-service.md by scripts/sync-legal.mjs.
 * Her ruling of 9 November 2026: that folder is the only source for the three
 * documents. Do not edit the MDX.
 *
 * ENGLISH ONLY from 9 November 2026, and the link to the French is gone with
 * the French page. Her instruction: "Take /conditions-d-utilisation down until
 * the French translation exists." Section 13 of the document says the same
 * thing in its own words, which is why taking the page down does not leave the
 * contract lying: "These terms are in English. A French version will follow;
 * once it exists, if you live in Quebec, the French version governs."
 *
 * So this page offers no "Version francaise" link, content/i18n.ts drops the
 * French alternate so no hreflang tag and no language toggle points at a 404,
 * and the French footer's Terms link points here. A French page linking an
 * English contract is the honest state of things until the translation lands.
 */
export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: alternatesFor("/terms-of-service"),
};

export default function TermsOfServicePage() {
  return (
    <>
      <section className="mx-auto max-w-[920px] px-6 pb-[40px] pt-16 text-center md:px-10 md:pt-24">
        <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
          Truer Measure™
        </div>
        <h1
          className="font-heading mb-8 font-medium text-bark"
          style={{ fontSize: "clamp(36px,5vw,64px)", lineHeight: 1.05, letterSpacing: "-0.01em" }}
        >
          Terms of Service
        </h1>
      </section>

      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e3cfc8 40%,#e3cfc8 60%,transparent)" }} />
      </div>

      <section className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-[72px]">
        <TermsContent />

        <div className="mt-16 border-t border-border pt-10">
          <Link
            href="/"
            className="text-[13px] font-semibold uppercase tracking-[0.14em] text-rose hover:text-bark transition-colors"
          >
            ← Back
          </Link>
        </div>
      </section>
    </>
  );
}
