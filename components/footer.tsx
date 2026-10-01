"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialLinks } from "@/components/social-links";
import { localeFromPath, shell } from "@/content/i18n";

/**
 * The footer is in the root layout, so everything here appears on every page.
 * That is why the social links live here rather than in a section of the home
 * page: Jolène asked for them on all pages, 1 October 2026.
 *
 * Client-side only so it can read the locale from the path, the same way the
 * nav does. Nothing here needs the server.
 */
export default function Footer() {
  const locale = localeFromPath(usePathname() || "/");
  const t = shell[locale].footer;

  return (
    <footer className="bg-bark px-6 py-12 md:px-10 md:py-[64px]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 md:gap-6">
        <div className="font-heading text-[21px] text-parchment">
          {t.brand}
        </div>
        <div className="text-[13px] tracking-[0.04em] text-subdued">
          {t.tagline}
        </div>
      </div>

      {/* Follow along, on every page. */}
      <div className="mx-auto mt-10 max-w-[1180px] border-t border-charcoal pt-10 text-center">
        <div className="mb-6 text-[12px] font-semibold uppercase tracking-[0.26em] text-rose-dark">
          {t.follow}
        </div>
        <SocialLinks />
      </div>

      <div className="mx-auto mt-10 flex max-w-[1180px] flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-charcoal pt-6 text-center text-[12px] tracking-[0.04em] text-subdued">
        {/* Terms of Service published 30 September 2026 as interim terms, by
            Jolene's decision, while legal review completes (the checkout was
            live without any). The Privacy Policy follows when it is final:
            its route is at git checkout e3bb129 -- app/privacy-policy

            The French Terms exist on legal-purchase-flow-review as
            /conditions-d-utilisation, not on main, so the French footer points
            at the English page until that branch is published. */}
        <Link href="/terms-of-service" className="text-subdued no-underline hover:text-parchment">
          {t.terms}
        </Link>
        <span>
          © {new Date().getFullYear()} {t.rights}
        </span>
      </div>
    </footer>
  );
}
