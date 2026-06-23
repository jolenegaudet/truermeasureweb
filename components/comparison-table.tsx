const rows = [
  ["Measures academic performance", "Captures the whole child"],
  ["Updated twice a year", "Updated whenever something matters"],
  ["Written by teachers", "Written by the people who know your child best"],
  ["Grades against a standard", "Records growth over time"],
  ["Tells you what they know", "Shows who they're becoming"],
  ["A static snapshot", "A living document"],
  ["Reflects one type of intelligence", "Reflects the full range of who they are"],
];

export default function ComparisonTable() {
  return (
    <div className="my-10 overflow-hidden rounded-xl border border-bark/10">
      <div className="grid grid-cols-2 bg-bark/5 px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone">
          The Report Card
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-bark">
          The Hidden Report Card
        </span>
      </div>
      {rows.map(([left, right], i) => (
        <div
          key={i}
          className="grid grid-cols-2 border-t border-bark/10 px-6 py-4"
        >
          <span className="pr-4 text-sm leading-relaxed text-stone">{left}</span>
          <span className="text-sm font-medium leading-relaxed text-bark">
            {right}
          </span>
        </div>
      ))}
    </div>
  );
}
