import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import BuildContent from "@/content/build.mdx";

export const metadata: Metadata = {
  title: "Build Direct With Me",
};

export default function BuildPage() {
  return (
    <>
      <PageHero
        eyebrow="Build"
        title="Build Direct With Me"
        subtitle="Direct access to me — smaller live sessions and occasional one-on-one time."
      />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <BuildContent />
      </section>
    </>
  );
}
