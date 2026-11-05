import type { Metadata } from "next";
import { alternatesFor } from "@/content/i18n";
import Link from "next/link";
import PrivacyContent from "@/content/privacy-policy.website.mdx";

/**
 * The website Privacy Policy.
 *
 * Note which file this imports. content/privacy-policy.mdx is the FULL product
 * policy, still a draft, and it describes child records, document uploads and
 * AI processing that are not running. This route deliberately serves
 * privacy-policy.website.mdx, which covers only what truermeasure.com actually
 * does today: the forms, the Kit list and Plausible. Her decision, 4 October
 * 2026. Swapping the import would publish claims about a product that is not
 * open.
 *
 * scripts/check-legal-placeholders.mjs fails the build if either routed legal
 * document still carries a placeholder, so this page cannot go live with an
 * unset effective date.
 *
 * THE ADDRESS IS /privacy/website, her decision of 5 November 2026: "je
 * retiens /privacy pour la politique du produit et /privacy/website pour celle
 * du site." /privacy is reserved for the product policy, which is the document
 * a parent agrees to and the one the app's consent screen links to. This one
 * governs the forms and the email list, so it belongs at a qualified address
 * and in the footer, which is where a reader of this website meets it.
 *
 * It routed at /privacy-policy while it was unreachable and briefly at
 * /privacy on 5 November, before she settled the pair. Neither address was
 * ever published, so neither needs a redirect.
 */
export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: alternatesFor("/privacy/website"),
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
      </section>

      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e3cfc8 40%,#e3cfc8 60%,transparent)" }} />
      </div>

      <section className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-[72px]">
        <p className="mb-10 text-smoke" style={{ fontSize: 15 }}>
          <Link href="/politique-de-confidentialite/site-web" className="text-rose underline underline-offset-2">
            Version française
          </Link>
        </p>
        <PrivacyContent />

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
