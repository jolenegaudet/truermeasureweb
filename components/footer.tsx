import Link from "next/link";

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
            Jolene's decision, while legal review completes (the checkout was
            live without any). The Privacy Policy follows when it is final:
            its route is at git checkout e3bb129 -- app/privacy-policy */}
        <Link href="/terms-of-service" className="text-subdued no-underline hover:text-parchment">
          Terms of Service
        </Link>
        <span>© {new Date().getFullYear()} Truer Measure. All rights reserved.</span>
      </div>
    </footer>
  );
}
