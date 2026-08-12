export default function Footer() {
  return (
    <footer className="bg-bark px-6 py-10 md:px-10 md:py-[56px]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 md:gap-6">
        <div className="font-heading text-[21px] text-parchment">
          The Hidden Report Card
        </div>
        <div className="text-[13px] tracking-[0.04em] text-subdued">
          The Truer Measure of a Child!
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[1180px] flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-charcoal pt-6 text-center text-[12px] tracking-[0.04em] text-subdued">
        <span>© {new Date().getFullYear()} Truer Measure. All rights reserved.</span>
        <a href="/terms-of-service" className="text-subdued underline underline-offset-2 hover:text-parchment transition-colors">
          Terms of Service
        </a>
        <a href="/privacy-policy" className="text-subdued underline underline-offset-2 hover:text-parchment transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
