const contexts = [
  {
    title: "Starting at a new school",
    desc: "Pull it up before the first meeting. Walk in knowing your child — not just their last report card.",
  },
  {
    title: "Meeting with a teacher or specialist",
    desc: "Bring the full picture. Share what the grade doesn't say.",
  },
  {
    title: "Choosing a program or path",
    desc: "Decisions made with clarity. Not just with anxiety about the options.",
  },
  {
    title: "Getting through a hard year",
    desc: "Remind yourself — and your child — of who they actually are beyond the struggle.",
  },
  {
    title: "Applying for something competitive",
    desc: "You already have the story. The Hidden Report Card is where it lives.",
  },
  {
    title: "Celebrating a breakthrough",
    desc: "Add it. Date it. Watch the record of who they're becoming grow.",
  },
];

export default function ContextCards() {
  return (
    <div className="my-10 grid gap-4 sm:grid-cols-2">
      {contexts.map(({ title, desc }) => (
        <div
          key={title}
          className="rounded-xl border border-bark/10 bg-parchment/60 p-5"
        >
          <h4 className="font-heading font-semibold text-bark">{title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-stone">{desc}</p>
        </div>
      ))}
    </div>
  );
}
