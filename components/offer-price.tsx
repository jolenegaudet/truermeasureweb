import { INTRO_MONTHS, prices } from "@/content/founding-families";

/**
 * The introductory price in all three currencies, as Jolene laid it out on
 * 30 September 2026. Each is a real price charged in that currency, so there
 * is nothing to convert and nothing to explain about exchange rates.
 */
export function OfferPrice({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const main = tone === "dark" ? "text-parchment" : "text-bark";
  const quiet = tone === "dark" ? "text-muted" : "text-smoke";
  return (
    <div>
      <div className={"mb-5 text-[11.5px] font-semibold uppercase tracking-[0.22em] " + (tone === "dark" ? "text-rose-dark" : "text-rose")}>
        Your first {INTRO_MONTHS} months
      </div>
      <div className="flex flex-col gap-1">
        {prices.map(({ code, symbol, intro }) => (
          <div key={code} className={"font-heading " + main} style={{ fontSize: "clamp(30px,4vw,40px)", lineHeight: 1.15 }}>
            {symbol}
            {intro}
            <span className={"ml-2 font-sans text-[14px] " + quiet}>/ month</span>
          </div>
        ))}
      </div>
    </div>
  );
}
