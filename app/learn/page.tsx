import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import LearnContent from "@/content/learn.mdx";

export const metadata: Metadata = {
  title: "Learn From The Room",
};

export default function LearnPage() {
  return (
    <>
      <PageHero
        eyebrow="Learn"
        title="Learn From The Room"
        subtitle="Communication + Conversations + Collective Intelligence"
      />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <LearnContent />
      </section>
    </>
  );
}
