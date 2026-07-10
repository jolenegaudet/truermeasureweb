import type { Metadata } from "next";
import Link from "next/link";
import BuildContent from "@/content/build.mdx";
import { WaitlistButton } from "@/components/waitlist-button";

export const metadata: Metadata = {
  title: "Be Part of the Inner Circle",
};

export default function BuildPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-blush px-6 pb-[60px] pt-16 md:px-10 md:pb-[72px] md:pt-24">
        <div className="mx-auto max-w-[920px] text-center">
          <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
            Help Shape What&rsquo;s Next
          </div>
          <h1
            className="font-heading mb-8 font-medium text-bark"
            style={{ fontSize: "clamp(44px,7vw,88px)", lineHeight: 1.0, letterSpacing: "-0.01em" }}
          >
            Inner Circle
          </h1>
          <p
            className="font-heading mx-auto italic text-dusk"
            style={{ fontSize: "clamp(20px,2.8vw,28px)", lineHeight: 1.45, maxWidth: 600 }}
          >
            Be Part of the Inner Circle
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-[96px]">
        <BuildContent />

        <div className="mt-16 border-t border-border pt-10">
          <WaitlistButton
            tag="applied-inner-circle"
            label="Apply"
            modalEyebrow="Help Shape What's Next"
            modalTitle="Apply to Inner Circle."
            submitLabel="Submit application"
            variant="bark"
          />
          <Link
            href="/"
            className="ml-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-rose hover:text-bark transition-colors"
          >
            ← Back
          </Link>
        </div>
      </section>
    </>
  );
}
