"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialLinks } from "@/components/social-links";
import { MANAGE_URL } from "@/content/founding-families";
import { localeFromPath, shell } from "@/content/i18n";

/**
 * The footer is in the root layout, so everything here appears on every page.
 * That is why the social links live here rather than in a section of the home
 * page: Jolène asked for them on all pages, 1 October 2026.
 *
 * Client-side only so it can read the locale from the path, the same way the
 * nav does. Nothing here needs the server.
 *
 * The legal row carries three obligations rather than decoration:
 *   Terms              published 30 September 2026 as interim terms, by her
 *                      decision, because the checkout was live without any.
 *   Manage or cancel   online cancellation, through the Stripe customer portal.
 *   Withdraw           the EU withdrawal function, which must be reachable from
 *                      every page for the whole 14 days.
 * Each one points at its own language. The Privacy Policy is written and
 * translated but held back while counsel reviews it, so it is deliberately
 * absent here. Its strings and this link go back when
 * PRIVACY_POLICY_PUBLISHED in content/first-to-know.ts turns true; that
 * constant carries the full procedure.
 */
export default function Footer() {
  const locale = localeFromPath(usePathname() || "/");
  const t = shell[locale].footer;

  const link = "text-subdued no-underline hover:text-parchment";

  return (
    <footer className="bg-bark px-6 py-12 md:px-10 md:py-[64px]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 md:gap-6">
        <div className="font-heading text-[21px] text-parchment">{t.brand}</div>
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

      <div className="mx-auto mt-10 flex max-w-[1180px] flex-wrap items-center justify-center gap-x-7 gap-y-2 border-t border-charcoal pt-6 text-center text-[12px] tracking-[0.04em] text-subdued">
        <Link href={t.termsPath} className={link}>
          {t.terms}
        </Link>
        <a href={MANAGE_URL} className={link}>
          {t.manage}
        </a>
        <Link href={t.withdrawPath} className={link}>
          {t.withdraw}
        </Link>
        <span>
          © {new Date().getFullYear()} {t.rights}
        </span>
      </div>
    </footer>
  );
}
