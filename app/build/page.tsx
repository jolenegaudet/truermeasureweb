import type { Metadata } from "next";
import Link from "next/link";
import BuildContent from "@/content/build.mdx";

export const metadata: Metadata = {
  title: "Build Direct With Me",
};

export default function BuildPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-blush px-10 pb-[72px] pt-24">
        <div className="mx-auto max-w-[920px] text-center">
          <div className="mb-[30px] text-[13px] font-semibold uppercase tracking-[0.26em] text-rose">
            Build Direct With Me
          </div>
          <h1
            className="font-heading mb-8 font-medium text-bark"
            style={{ fontSize: "clamp(44px,7vw,88px)", lineHeight: 1.0, letterSpacing: "-0.01em" }}
          >
            Inner
            <br />
            Circle
          </h1>
          <p
            className="font-heading mx-auto italic text-dusk"
            style={{ fontSize: "clamp(20px,2.8vw,28px)", lineHeight: 1.45, maxWidth: 600 }}
          >
            Direct access to me — smaller live sessions and occasional
            one-on-one time.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[720px] px-10 py-[96px]">
        <BuildContent />

        <div className="mt-16 border-t border-border pt-10">
          <a
            href="#"
            className="inline-block rounded-[2px] bg-bark px-[34px] py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-parchment no-underline"
          >
            Apply
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
