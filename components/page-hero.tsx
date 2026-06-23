interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export default function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="bg-bark px-6 py-24 text-center md:py-32">
      {eyebrow && (
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-ember">
          {eyebrow}
        </p>
      )}
      <h1 className="font-heading mx-auto max-w-3xl text-4xl font-bold text-parchment md:text-6xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mx-auto mt-6 max-w-xl text-lg text-parchment/70">
          {subtitle}
        </p>
      )}
    </section>
  );
}
