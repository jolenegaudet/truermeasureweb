"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialLinks } from "@/components/social-links";
import { MANAGE_URL } from "@/content/founding-families";
import { PRIVACY_PATH } from "@/content/first-to-know";
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
 *   Privacy            the website's Privacy Policy, published 6 November
 *                      2026 in both languages, on her approval that day.
 * Each one points at its own language.
 *
 * THE WITHDRAWAL LINK IS GONE, by her decision of 9 November 2026. It was the
 * EU withdrawal function, which has to be reachable from every page for the
 * whole 14 days, and that is why it sat here rather than on one page. Her
 * answer to counsel question 3c is that no EU customers will be processed
 * until a later version, so the Terms no longer offer the right and this no
 * longer offers the function. scripts/check-launch-build.mjs now refuses a
 * build that puts it back, which is how the decision survives being
 * forgotten. Restoring it means restoring section 15 of the Terms, the
 * /withdraw route, components/withdrawal-form.tsx and the rows about that
 * form in both website policies, all removed in the same commit.
 *
 * The privacy row is still conditional on PRIVACY_PATH rather than hardcoded,
 * because the same mechanism holds the product's policy back: that document is
 * not published, /privacy answers 404, and nothing should link it until it
 * exists. content/first-to-know.ts carries the detail.
 */
export default function Footer() {
  const locale = localeFromPath(usePathname() || "/");
  const t = shell[locale].footer;
  const privacyPath = PRIVACY_PATH[locale];

  const link = "text-subdued no-underline hover:text-parchment";

  return (
    <footer className="bg-bark px-6 py-12 md:px-10 md:py-[64px]">
      {/* Stacked and centred on a phone, where these two sat squeezed against
          opposite edges of a 390px screen. Side by side from md up, as before. */}
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-2 text-center md:flex-row md:flex-wrap md:justify-between md:gap-6 md:text-left">
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
        {privacyPath && (
          <Link href={privacyPath} className={link}>
            {t.privacy}
          </Link>
        )}
        <a href={MANAGE_URL} className={link}>
          {t.manage}
        </a>
        <span>
          © {new Date().getFullYear()} {t.rights}
        </span>
      </div>
    </footer>
  );
}
