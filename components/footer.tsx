import Link from "next/link";
import { MANAGE_URL } from "@/content/founding-families";

export default function Footer() {
  return (
    <footer className="bg-bark px-6 py-10 md:px-10 md:py-[56px]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 md:gap-6">
        <div className="font-heading text-[21px] text-parchment">
          A Truer Measure
        </div>
        <div className="text-[13px] tracking-[0.04em] text-subdued">
          The Truer Measure of a Child!
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[1180px] flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-charcoal pt-6 text-center text-[12px] tracking-[0.04em] text-subdued">
        {/* Terms of Service published 30 September 2026 as interim terms, by
            Jolene's decision (the checkout was live without any). The Privacy
            Policy follows when it is final: its route is at
            git checkout e3bb129 -- app/privacy-policy */}
        <Link href="/terms-of-service" className="text-subdued no-underline hover:text-parchment">
          Terms of Service
        </Link>
        <Link href="/conditions-d-utilisation" className="text-subdued no-underline hover:text-parchment">
          Conditions d’utilisation
        </Link>
        {/* Online cancellation for members, through the Stripe customer portal. */}
        <a href={MANAGE_URL} className="text-subdued no-underline hover:text-parchment">
          Manage or cancel your membership
        </a>
        {/* EU right of withdrawal: the label the directive suggests. */}
        <Link href="/withdraw" className="text-subdued no-underline hover:text-parchment">
          Withdraw from contract here
        </Link>
        <span>© {new Date().getFullYear()} Truer Measure. All rights reserved.</span>
      </div>
    </footer>
  );
}
