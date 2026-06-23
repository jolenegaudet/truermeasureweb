import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import HomeContent from "@/content/home.mdx";

export const metadata: Metadata = {
  title: "Start Here",
};

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="The Truer Measure of Your Child"
        title="The Hidden Report Card"
        subtitle="Because a report card was never designed to tell the whole story."
      />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <HomeContent />
      </section>
    </>
  );
}
