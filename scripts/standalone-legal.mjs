/**
 * One legal document, as one file that opens with a double-click.
 *
 *   node scripts/standalone-legal.mjs <built page> <output file>
 *   node scripts/standalone-legal.mjs out/privacy/website.html ~/privacy-en.html
 *
 * WHY THIS EXISTS. Reading a contract needs a document, not a server. The
 * local preview was stopped four times on 5 November 2026 while she was trying
 * to read the Privacy Policy, each time because the machine was low on memory,
 * and a read-through that cannot survive the reader pausing is the wrong tool.
 * Her instruction that day: "Prepare-moi les deux politiques du site en
 * fichiers HTML autonomes, un en anglais et un en francais, que je peux ouvrir
 * par double-clic."
 *
 * WHAT IT PRODUCES. The document exactly as the page renders it, with the real
 * typography, in a single file with nothing outside it: the stylesheet inlined,
 * every font it uses embedded, and no script of any kind. It needs no server,
 * no network and no fonts installed, and it reads the same offline in a year.
 *
 * WHAT IT LEAVES OUT, deliberately. The site's header, navigation and footer.
 * Those are built in the browser and read the language from the address, so in
 * a file opened from a folder they would render the wrong language's footer
 * under a French document. A reading copy of one document should also not carry
 * links to a site it is not part of.
 *
 * WHAT IT KEEPS, equally deliberately. The draft banner and the unfilled
 * effective date, because the point is to approve the text as it actually
 * stands. A reading copy that looked finished would be worse than no copy.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";

const argv = process.argv.slice(2);
const pairIndex = argv.indexOf("--pair");
const pair = pairIndex === -1 ? null : argv[pairIndex + 1];
const [source, destination] = argv.filter(
  (a, i) => a !== "--pair" && !(pairIndex !== -1 && i === pairIndex + 1),
);
if (!source || !destination) {
  console.error(
    "usage: node scripts/standalone-legal.mjs <built page> <output file> [--pair <other file>]",
  );
  process.exit(2);
}

/** The file's own name, whichever separator the path was written with. */
function basenameOf(path) {
  return path.split("/").pop().split(String.fromCharCode(92)).pop();
}

const page = readFileSync(source, "utf8");
const OUT = source.includes("out/") || source.includes("out\\")
  ? source.slice(0, source.search(/out[\\/]/) + 3)
  : "out";

/* ── The document itself ─────────────────────────────────────────────────── */

const start = page.indexOf("<main");
const end = page.lastIndexOf("</main>");
if (start === -1 || end === -1) {
  console.error(`${source}: no <main> element, so there is no document to extract`);
  process.exit(1);
}
let body = page.slice(start, end + "</main>".length);

/* A link to a site this file is not part of cannot work from a folder, and a
   dead link in a document somebody is approving is worse than no link.
   --pair repoints the other language at its own file, so the two read as a
   pair; every other site link becomes the words it was wrapped around. The
   mailto links stay, because they work from anywhere. */
if (pair) {
  body = body.replace(
    /href="\/(?:privacy\/website|politique-de-confidentialite\/site-web)"/g,
    () => 'href="' + basenameOf(pair).replace(/"/g, "&quot;") + '"',
  );
}
body = body.replace(/<a\s[^>]*href="\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g, "$1");

const titleMatch = page.match(/<title>([^<]*)<\/title>/);
const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Truer Measure\s*$/, "") : "Document";
const lang = /<html[^>]*\blang="fr"/.test(page) || /politique|conditions|contrat/.test(source)
  ? "fr"
  : "en";

/* ── The stylesheet, with its fonts embedded ─────────────────────────────── */

const sheets = [...page.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(
  (m) => m[1],
);
if (!sheets.length) console.warn("  warning: the page references no stylesheet");

let css = "";
for (const href of sheets) {
  const file = join(OUT, href.replace(/^\//, ""));
  let text = readFileSync(file, "utf8");
  const here = dirname(file);

  /* url(../media/x.woff2) becomes the font itself, so the file carries its own
     typography and asks the network for nothing. */
  const seen = new Map();
  text = text.replace(/url\((['"]?)([^'")]+)\1\)/g, (whole, _quote, ref) => {
    if (/^(data:|https?:|\/\/)/.test(ref)) return whole;
    const asset = resolve(here, ref);
    if (!seen.has(asset)) {
      try {
        const bytes = readFileSync(asset);
        const type = asset.endsWith(".woff2")
          ? "font/woff2"
          : asset.endsWith(".woff")
            ? "font/woff"
            : asset.endsWith(".svg")
              ? "image/svg+xml"
              : "application/octet-stream";
        seen.set(asset, `data:${type};base64,${bytes.toString("base64")}`);
      } catch {
        seen.set(asset, null);
      }
    }
    const inlined = seen.get(asset);
    return inlined ? `url(${inlined})` : whole;
  });
  css += text + "\n";
}

/* ── Write it ────────────────────────────────────────────────────────────── */

const note = lang === "fr"
  ? "Copie de lecture. Document non publié."
  : "Reading copy. Not published.";

const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<!-- ${note} Generated by scripts/standalone-legal.mjs from ${source}. -->
<style>
${css}
/* No site header or footer here, so the document should not sit against the
   top of the window. */
main { display: block; padding-bottom: 4rem; }
</style>
</head>
<body>
${body}
</body>
</html>
`;

writeFileSync(destination, html, "utf8");

const kb = Math.round(Buffer.byteLength(html) / 1024);
const fonts = [...seenAll()].length;
console.log(`  ${destination}`);
console.log(`  ${title}  (${lang})  ${kb} KB, ${fonts} font(s) embedded, 0 scripts`);

function seenAll() {
  return new Set([...css.matchAll(/data:font\/woff2?;base64/g)].map((m, i) => i));
}
