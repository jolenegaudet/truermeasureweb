/**
 * Regenerate the social share cards, app/opengraph-image.png and
 * app/fr/opengraph-image.png.
 *
 * WHY THIS SCRIPT EXISTS. The cards were flat PNGs with no source in the
 * repository, and on 9 November 2026 they still read "The Hidden Report Card"
 * in ninety-point type. That is the single most-seen surface the site has:
 * every link shared to Facebook or Instagram renders it, and her instruction
 * was that the old name change everywhere. A hand-made PNG cannot be kept
 * honest by any check in this repository, so the card is now generated from
 * the same words and the same colour tokens as the pages.
 *
 * RUN IT BY HAND, not at build time:
 *
 *     node scripts/gen-og-image.mjs
 *
 * It is deliberately not wired into `npm run build`. The build runs on Netlify
 * with no network, and this needs Google Fonts. The PNGs it writes are
 * committed, and Next serves them as static files exactly as before, so
 * nothing about how the site builds or deploys changed.
 *
 * NO NEW DEPENDENCY. next/og ships inside Next.js (satori for layout, resvg
 * for rasterising). Only a subset of CSS is supported: flexbox, no grid, and
 * every element with more than one child needs an explicit `display: flex`.
 */
import { ImageResponse } from "next/og.js";
import { writeFile } from "node:fs/promises";

/** From app/globals.css. Kept in step by hand; there are five of them. */
const PARCHMENT = "#f7f1ed";
const BARK = "#2b2220";
const DUSK = "#5b4d49";
const ROSE = "#a47a72";
const BORDER = "#e3cfc8";
const SUBDUED = "#9c8a84";
const SMOKE = "#6f615c";
const GRIDLINE = "#f1e4df";

/**
 * Google Fonts, asked for without a modern browser's user agent so the CSS
 * comes back pointing at TrueType rather than woff2, which satori cannot read.
 */
async function font(family, weight, italic = false) {
  const spec = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:${spec}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());
  const url = css.match(/src:\s*url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error(`No font file in the CSS for ${family} ${weight}`);
  return new Uint8Array(await fetch(url).then((r) => r.arrayBuffer()));
}

/**
 * THE TWO CARDS.
 *
 * The English card changed in three ways on 9 November 2026 and in no others.
 * The layout, the colours, the fonts and the sizes are the ones the hand-made
 * PNG used.
 *
 *   1. The title. "The Hidden Report Card" became "The Truer Measure™", her
 *      rename. The mark is on it here and not on the wordmark above it,
 *      because that is what tells a reader the two are not the same thing:
 *      the company at the top, the product in the middle.
 *
 *   2. The subtitle. It read "A living record of who your child is becoming."
 *      That phrase is on her own banned list, and it had been sitting in the
 *      most widely shared image on the site. The replacement is the card's own
 *      alt text, which she already approved.
 *
 *   3. The French card is in French. Both PNGs were byte-identical English
 *      before this, so a link shared from /fr rendered an English card. The
 *      French here is the French alt text and the French site's own headline.
 */
const CARDS = [
  {
    out: "app/opengraph-image.png",
    alt: "app/opengraph-image.alt.txt",
    eyebrow: "BECAUSE A REPORT CARD WAS NEVER DESIGNED TO TELL THE WHOLE STORY",
    title: ["The Truer", "Measure™"],
    subtitle: "A living record of your child’s education, school and beyond.",
    tagline: "THE TRUER MEASURE OF A CHILD",
    altText:
      "The Truer Measure by Truer Measure: a living record of your child’s education, school and beyond.",
  },
  {
    out: "app/fr/opengraph-image.png",
    alt: "app/fr/opengraph-image.alt.txt",
    eyebrow: "PARCE QU’UN BULLETIN N’A JAMAIS ÉTÉ CONÇU POUR TOUT DIRE",
    title: ["La juste", "mesure"],
    subtitle:
      "Un portrait vivant de l’éducation de votre enfant, à l’école et au-delà.",
    tagline: "LA JUSTE MESURE D’UN ENFANT",
    altText:
      "La juste mesure de votre enfant : un portrait vivant de son éducation, à l’école et au-delà.",
  },
];

function card({ eyebrow, title, subtitle, tagline }) {
  return {
    type: "div",
    props: {
      style: {
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: PARCHMENT,
        padding: "62px 80px 48px 80px",
        position: "relative",
        fontFamily: "Hanken Grotesk",
      },
      children: [
        /* The three faint verticals of the original card. */
        ...[300, 600, 900].map((x) => ({
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: x,
              top: 0,
              width: 1,
              height: 630,
              background: GRIDLINE,
            },
          },
        })),
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column" },
            children: [
              /* The wordmark: the dark chip and the company name. */
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", marginBottom: 36 },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          background: BARK,
                          color: PARCHMENT,
                          fontFamily: "Cormorant Garamond",
                          fontSize: 30,
                        },
                        children: "T",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          marginLeft: 20,
                          fontSize: 23,
                          fontWeight: 600,
                          letterSpacing: 5,
                          color: BARK,
                        },
                        children: "TRUER MEASURE",
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: 3.2,
                    color: ROSE,
                    marginBottom: 34,
                  },
                  children: eyebrow,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "Cormorant Garamond",
                    fontSize: 104,
                    lineHeight: 1.08,
                    color: BARK,
                  },
                  /* A trademark symbol set at full size next to a
                     hundred-point serif reads as a third word. Where a line
                     carries one it is split off and set small and high, the
                     way the page does it in app/hidden-report-card/page.tsx. */
                  children: title.map((line) => {
                    const mark = line.endsWith("™");
                    if (!mark) return { type: "div", props: { children: line } };
                    return {
                      type: "div",
                      props: {
                        style: { display: "flex", alignItems: "flex-start" },
                        children: [
                          { type: "div", props: { children: line.slice(0, -1) } },
                          {
                            type: "div",
                            props: {
                              style: {
                                fontSize: 34,
                                lineHeight: 1,
                                paddingTop: 16,
                                paddingLeft: 4,
                              },
                              children: "™",
                            },
                          },
                        ],
                      },
                    };
                  }),
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    marginTop: 30,
                    fontFamily: "Cormorant Garamond",
                    fontStyle: "italic",
                    fontSize: 33,
                    color: DUSK,
                  },
                  children: subtitle,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column" },
            children: [
              {
                type: "div",
                props: {
                  style: { height: 1, background: BORDER, marginBottom: 26 },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 17,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { letterSpacing: 3, fontWeight: 500, color: SUBDUED },
                        children: tagline,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { fontWeight: 500, color: SMOKE },
                        children: "truermeasure.com",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

const [heading, headingItalic, body, bodySemi] = await Promise.all([
  font("Cormorant+Garamond", 500),
  font("Cormorant+Garamond", 500, true),
  font("Hanken+Grotesk", 500),
  font("Hanken+Grotesk", 600),
]);

const fonts = [
  { name: "Cormorant Garamond", data: heading, weight: 500, style: "normal" },
  { name: "Cormorant Garamond", data: headingItalic, weight: 500, style: "italic" },
  { name: "Hanken Grotesk", data: body, weight: 500, style: "normal" },
  { name: "Hanken Grotesk", data: bodySemi, weight: 600, style: "normal" },
];

for (const spec of CARDS) {
  const image = new ImageResponse(card(spec), { width: 1200, height: 630, fonts });
  await writeFile(spec.out, Buffer.from(await image.arrayBuffer()));
  await writeFile(spec.alt, spec.altText + "\n", "utf8");
  console.log("wrote", spec.out, "and", spec.alt);
}
