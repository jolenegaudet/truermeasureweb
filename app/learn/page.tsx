import type { Metadata } from "next";
import Link from "next/link";
import LearnContent from "@/content/learn.mdx";

export const metadata: Metadata = {
  title: "Learn From The Room",
};

export default function LearnPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[920px] px-6 pb-[60px] pt-16 text-center md:px-10 md:pb-[72px] md:pt-24">
        <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
          Learn From The Room
        </div>
        <h1
          className="font-heading mb-8 font-medium text-bark"
          style={{ fontSize: "clamp(44px,7vw,88px)", lineHeight: 1.0, letterSpacing: "-0.01em" }}
        >
          Elite Learning
          <br />
          Leaders
        </h1>
        <p
          className="font-heading mx-auto italic text-dusk"
          style={{ fontSize: "clamp(20px,2.8vw,28px)", lineHeight: 1.45, maxWidth: 600 }}
        >
          Communication + Conversations + Collective Intelligence
        </p>
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e3cfc8 40%,#e3cfc8 60%,transparent)" }} />
      </div>

      {/* Content */}
      <section className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-[96px]">
        <LearnContent />

        <div className="mt-16 border-t border-border pt-10">
          <a
            href="#"
            className="inline-block rounded-[2px] bg-bark px-[34px] py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-parchment no-underline"
          >
            Join the Waitlist
          </a>
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
