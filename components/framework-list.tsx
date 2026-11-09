import { FRAMEWORK } from "@/content/framework";
import type { Locale } from "@/content/i18n";

/**
 * The six foundations and the twenty-one characteristics, as the demo groups
 * them. Content and provenance are in content/framework.ts; this file is
 * layout.
 *
 * ── TWO BLOCKS, NOT ONE LIST ──────────────────────────────────────────────
 *
 * Her brief of 2 November: "Keep foundations distinct from capabilities." So
 * the two groups never run together.
 *
 * The section heading sits above both of them again, on the page rather than
 * in here. It had been pushed down to introduce the characteristics alone,
 * because the line it carried then ("None of these receive a grade") is true
 * of the twenty-one and false of the six: school grades reading, writing and
 * mathematics for years. She replaced that line the same day, judging it "too
 * absolute, even when restricted to the 21 characteristics", with "Your
 * child's grades don't show everything they're capable of." That sentence is
 * true of both groups, so the reason for moving it is gone and it is back
 * where it was.
 *
 * ── WHY A GRID AND NOT ROWS OF WORDS ──────────────────────────────────────
 *
 * The list it replaces was rows of four single words separated by middots.
 * That reading does not survive the real names: "Practical capability &
 * resourcefulness" and "Understanding & managing emotions" are phrases, and
 * four of them to a row either overflow or wrap mid-phrase, which strands a
 * separator at the end of a line and starts the next one with it. The grid
 * keeps each name whole on every width, and the family headings carry the
 * grouping that the rows used to imply.
 */
export function FrameworkList({ locale = "en" }: { locale?: Locale }) {
  return (
    <>
      {FRAMEWORK.map((group, groupIndex) => (
        <div key={group.id} className={groupIndex === 0 ? "" : "mt-14 md:mt-20"}>
          <div className="mx-auto mb-8 max-w-[720px] text-center md:mb-10">
            <h3
              className="font-heading font-medium text-bark"
              style={{ fontSize: "clamp(22px,3vw,32px)", lineHeight: 1.2 }}
            >
              {group.heading[locale]}
            </h3>
            {group.intro ? (
              <p
                className="mx-auto mt-4 max-w-[560px] text-balance text-smoke"
                style={{ fontSize: 15, lineHeight: 1.65 }}
              >
                {group.intro[locale]}
              </p>
            ) : null}
          </div>

          <div className="mx-auto flex max-w-[980px] flex-col gap-9 md:gap-11">
            {group.families.map((family) => (
              <div key={family.id}>
                {family.heading ? (
                  <div className="mb-4 text-center text-[11.5px] font-semibold uppercase tracking-[0.24em] text-rose">
                    {family.heading[locale]}
                  </div>
                ) : null}
                <ul className="grid list-none grid-cols-1 gap-x-8 gap-y-[10px] border-t border-grid pt-6 sm:grid-cols-2 md:grid-cols-3">
                  {family.items.map((item) => (
                    <li
                      key={item.id}
                      className="font-heading text-center text-bark"
                      style={{ fontSize: "clamp(17px,1.9vw,21px)", lineHeight: 1.35 }}
                    >
                      {item[locale]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
