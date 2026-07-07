"use client";

import { useState } from "react";
import { WaitlistModal } from "@/components/waitlist-button";

const moments = [
  "Before a parent–teacher meeting",
  "Before applying for a program, team, or scholarship",
  "When confidence drops",
  "When a child says, “I’m not smart.”",
];

export function Moments() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col">
        {moments.map((context, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(true)}
            className="group flex w-full flex-wrap items-baseline justify-between gap-7 border-t border-border bg-transparent px-1 py-7 text-left cursor-pointer"
          >
            <div
              className="font-heading flex-1 italic text-dusk"
              style={{
                fontSize: "clamp(21px,2.8vw,29px)",
                flexBasis: 280,
              }}
            >
              {context}
            </div>
            <div className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.16em] text-rose whitespace-nowrap transition-colors group-hover:text-bark">
              Pull it up →
            </div>
          </button>
        ))}
        <div className="border-t border-border" />
      </div>

      <WaitlistModal
        open={open}
        onClose={() => setOpen(false)}
        tag="waitlist-hidden-report-card"
        modalEyebrow="Start Here"
        modalTitle="Join the Hidden Report Card waitlist."
        submitLabel="Join the waitlist"
      />
    </>
  );
}
