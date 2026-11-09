import type { Metadata } from "next";
import { alternatesFor } from "@/content/i18n";
import Link from "next/link";
import LicenceContent from "@/content/licence.mdx";

/**
 * The End-User Licence Agreement: how the service may be used, and what rights
 * attach to a child's records. Accepted on the app's agreement screen beside
 * the Terms and the Privacy Policy.
 *
 * Published 9 November 2026 on her instruction, with the product Privacy Policy
 * and the new Terms. /privacy answered 404 until this moment, deliberately: a legal link
 * that does not resolve is what kept public sign-up shut, and the app's release
 * check refuses a legal URL that does not answer 200. Publishing this page and
 * /licence is what opens that gate.
 *
 * content/licence.mdx is GENERATED from
 * offer/legal-documents-current/end-user-licence-agreement.md by
 * scripts/sync-legal.mjs.
 * Her ruling of 9 November: that folder is the only source for the three
 * documents. Do not edit the MDX.
 *
 * English only. Her instruction of 9 November: the French translation does not
 * exist yet, section 13 of the Terms says so in the document itself, and
 * content/i18n.ts drops the French alternate so neither the language toggle
 * nor an hreflang tag points at a page that answers 404.
 */
export const metadata: Metadata = {
  title: "End-User Licence Agreement",
  alternates: alternatesFor("/licence"),
};

export default function LicencePage() {
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
          End-User Licence Agreement
        </h1>
      </section>

      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e3cfc8 40%,#e3cfc8 60%,transparent)" }} />
      </div>

      <section className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-[72px]">
        <LicenceContent />

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
