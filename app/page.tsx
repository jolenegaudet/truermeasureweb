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
        eyebrow="Welcome"
        title="Start Here"
        subtitle="[Your tagline — replace this with content from your original site]"
      />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <HomeContent />
      </section>
    </>
  );
}
