const qualities = [
  { n: "01", word: "Curiosity" },
  { n: "02", word: "Resilience" },
  { n: "03", word: "Empathy" },
  { n: "04", word: "Creativity" },
  { n: "05", word: "Persistence" },
  { n: "06", word: "Self-regulation" },
  { n: "07", word: "Confidence" },
  { n: "08", word: "Initiative" },
  { n: "09", word: "Critical thinking" },
  { n: "10", word: "Collaboration" },
  { n: "11", word: "Communication" },
  { n: "12", word: "Integrity" },
  { n: "13", word: "Adaptability" },
  { n: "14", word: "Leadership" },
  { n: "15", word: "Problem-solving" },
];

export default function QualityGrid() {
  return (
    <div className="my-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {qualities.map(({ n, word }) => (
        <div
          key={n}
          className="rounded-lg border border-bark/10 bg-parchment/60 px-4 py-4"
        >
          <span className="text-xs font-semibold tracking-widest text-ember">
            {n}
          </span>
          <p className="mt-1 font-heading text-base font-semibold text-bark">
            {word}
          </p>
        </div>
      ))}
    </div>
  );
}
