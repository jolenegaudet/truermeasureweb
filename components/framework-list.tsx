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
 * ── WHY CENTRED ROWS AND NOT A GRID ───────────────────────────────────────
 *
 * Her instruction, 9 November 2026: "In the section of the website where it
 * says 'What matters now and later,' it's kind of hard to see. It's too
 * chunked up. Can you make it so it's better on the eyes, you can actually
 * see it, and it's kind of centered."
 *
 * Three things were doing that, and all three are fixed here.
 *
 *   THE RULES. Each of the four families sat under its own `border-t`, so the
 *   block read as four sealed boxes stacked up. The rules are gone and the
 *   space between families does the separating instead.
 *
 *   THE ORPHANS. A three-column grid cannot centre a family whose count is
 *   not a multiple of three, and only one of the four is. "Thinking and
 *   learning" has four names, so it ran 3 + 1 and left a single name hanging
 *   under the first column; "Taking action" has eight and left two. That
 *   ragged left-biased tail is most of what reads as chunked. A centred
 *   flex-wrap has no columns to leave gaps in: every row centres itself,
 *   including the last one.
 *
 *   THE LABELS. The family headings were 11.5px uppercase at 0.24em tracking
 *   in rose on near-white, which is small, thin and low-contrast at once.
 *   They are larger now, tracked less and set in the darker dusk, which is
 *   the colour this page already uses for a quiet label.
 *
 * WHAT DID NOT CHANGE, and why the old note mattered. Before the grid this was
 * rows of single words separated by middots, and it was replaced because the
 * real names are phrases: "Practical capability & resourcefulness" wraps
 * mid-phrase and strands a separator at the end of a line. Flex-wrap keeps
 * that fix. Each name is one flex child, so it is never broken across a line
 * however narrow the screen, and there are no separator characters to strand.
 * The generous column gap is what keeps two adjacent names from reading as one
 * phrase.
 */
export function FrameworkList({ locale = "en" }: { locale?: Locale }) {
  return (
    <>
      {FRAMEWORK.map((group, groupIndex) => (
        <div key={group.id} className={groupIndex === 0 ? "" : "mt-14 md:mt-20"}>
          <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
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

          <div className="mx-auto flex max-w-[900px] flex-col gap-12 md:gap-16">
            {group.families.map((family) => (
              <div key={family.id}>
                {family.heading ? (
                  <div className="mb-6 text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-dusk md:mb-7">
                    {family.heading[locale]}
                  </div>
                ) : null}
                {/* Centred rows, not columns. See the note above: a grid
                    cannot centre a count that does not fill its last row, and
                    three of these four families do not. */}
                <ul className="mx-auto flex list-none flex-wrap items-baseline justify-center gap-x-9 gap-y-4 md:gap-x-11 md:gap-y-5">
                  {family.items.map((item) => (
                    <li
                      key={item.id}
                      className="font-heading text-center text-bark"
                      style={{ fontSize: "clamp(18px,2vw,22px)", lineHeight: 1.4 }}
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
