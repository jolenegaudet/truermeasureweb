/**
 * Does `out/` hold the launch build she approved, or something else?
 *
 * Written 2 November 2026, for her brief of that day: "Identify any
 * preview-only flags or settings that would hide prices or prevent
 * registration in the ordinary deployed build. Prepare and verify the intended
 * launch configuration locally."
 *
 * The flags are environment variables, so the only honest way to know what a
 * build is is to read what came out of it. This reads the exported HTML and
 * says which of three things `out/` is:
 *
 *   maintenance   no amounts anywhere: what Netlify builds today, and what a
 *                 maintenance redeploy of the current live site must stay
 *   review        amounts, buttons still on the demo with both demo labels:
 *                 the release candidate she is reviewing
 *   launch        amounts, buttons on the customer app, demo labels gone:
 *                 only possible once the app host exists
 *
 * Then it checks everything that must be true of whichever one it found, and
 * exits 1 on the first thing that is not. It is a check, not a build step:
 * `npm run build` does not run it, because the prebuild checks
 * (check-legal-placeholders, check-app-claims) must pass for every build and
 * this one is about a particular build.
 *
 *   node scripts/check-launch-build.mjs
 *   node scripts/check-launch-build.mjs --expect launch --app-host https://…
 *
 * With --expect, a build of a different kind is a failure rather than a
 * finding. That is what scripts/launch-build.ps1 passes, so a build that comes
 * out as something other than what was asked for cannot be screenshotted,
 * approved or published by mistake.
 *
 *   node scripts/check-launch-build.mjs --expect launch --app-host https://… \n *        --legal-preview
 *
 * --legal-preview turns one failure into a note: a legal document that is
 * still marked a draft, or still carries [EFFECTIVE_DATE], having reached the
 * build. It is for the local read-through she asked for on 5 November 2026 and
 * for nothing else. THE PUBLISH PROCEDURE NEVER PASSES IT, which is what makes
 * the draft texts unpublishable while they are readable. See section 6 of
 * docs/launch-readiness-2026-11-02.md.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const OUT = "out";
const DEMO = "https://demo.truermeasure.com/";

/** Every exported page, so the footer and the overrides are checked on all. */
function htmlFiles(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name === "_next") continue;
    if (statSync(path).isDirectory()) found.push(...htmlFiles(path));
    else if (name.endsWith(".html")) found.push(path);
  }
  return found;
}

/** Every file in the build, _next included: a key could leak into a chunk. */
function everyBuiltFile(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...everyBuiltFile(path));
    else if (/\.(html|js|css|json|txt|xml|map)$/i.test(name)) found.push(path);
  }
  return found;
}

const args = process.argv.slice(2);
const argOf = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1] || null;
};
const expected = argOf("--expect");
const appHost = argOf("--app-host");

if (!existsSync(OUT)) {
  console.error("No out/ directory. Run a build first.");
  process.exit(1);
}

const failures = [];
const notes = [];
const fail = (what) => failures.push(what);

const pages = htmlFiles(OUT);
const en = readFileSync(join(OUT, "index.html"), "utf8");
const fr = readFileSync(join(OUT, "fr.html"), "utf8");

/* ── Which build is this ──────────────────────────────────────────────────── */

const hasAmounts = en.includes("CA$47") || en.includes("US$47");
const onDemo = en.includes(DEMO);
const kind = !hasAmounts ? "maintenance" : onDemo ? "review" : "launch";

console.log(`out/ is a ${kind.toUpperCase()} build.`);

if (expected && expected !== kind) {
  fail(`asked for a ${expected} build and got a ${kind} one`);
}

/* ── True of every build ──────────────────────────────────────────────────── */

/* The local country override must never reach a deployed page: it would let
   anyone be shown another country's price from the address bar. Its own
   variable since 2 November (COUNTRY_OVERRIDE in content/app-plans.ts), and
   this is the check that keeps it honest. */
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  if (html.includes("tm-country")) fail(`${page} carries the tm-country override`);
}

/* The signed currency stamp is written per request by the edge function, which
   is the only place the key exists. An exported page is built once and served
   to everyone, so a stamp baked into one would be a single signature handed to
   every visitor, outliving its own expiry. Neither the attribute nor the key
   may appear in a built file.

   The key is read from the sibling secrets folder only to check that it is
   absent from the build. It is never printed, and the check says which file is
   wrong, never what was found. */
const KEY_FILE = resolve(process.cwd(), "..", ".secrets", "currency-link.env");
let signingKey = null;
try {
  const line = readFileSync(KEY_FILE, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("TM_CURRENCY_KEY="));
  if (line) {
    const value = line.slice("TM_CURRENCY_KEY=".length).trim().replace(/^["']|["']$/g, "");
    if (value) signingKey = value;
  }
} catch {
  /* No key file on this machine is not a problem: the guard below still runs
     for the attribute, and the key cannot leak from a file that is not here. */
}

for (const file of everyBuiltFile(OUT)) {
  const text = readFileSync(file, "utf8");
  if (text.includes("data-tm-cs=")) {
    fail(`${file} carries a signed currency stamp, which only the edge may write`);
  }
  if (signingKey && text.includes(signingKey)) {
    fail(`${file} contains the currency signing key`);
  }
}

/* The legal wall. A build whose Privacy Policy or Terms still say they are a
   draft, or still carry an unfilled placeholder, must not be deployed.

   scripts/check-legal-placeholders.mjs refuses to BUILD such a site, and
   TM_LEGAL_PREVIEW=1 relaxes that so she can read the exact texts at their
   real addresses, which is what she asked for on 5 November 2026. This is
   the other half of that arrangement: the relaxed build still cannot pass
   the check that runs before a deploy. --legal-preview relaxes this one too,
   and the publish procedure never passes it (readiness record, section 6).

   Read from the built html rather than the source, so it holds whatever
   route, import or flag put the text there. */
const legalPreview = args.includes("--legal-preview");
const DRAFT_MARKERS = [
  "DRAFT for counsel",
  "not yet in force",
  "ÉBAUCHE destinée",
  "pas encore en vigueur",
  "[EFFECTIVE_DATE]",
];
const draftPages = [];
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const hit = DRAFT_MARKERS.filter((m) => html.includes(m));
  if (hit.length) draftPages.push(`${page}: ${hit.join(", ")}`);
}
if (draftPages.length) {
  if (legalPreview) {
    for (const d of draftPages) notes.push(`LEGAL PREVIEW, do not deploy: ${d}`);
  } else {
    for (const d of draftPages) {
      fail(`${d} - a legal document that is still a draft reached the build`);
    }
  }
}

/* Her page, in both languages. Named one by one rather than counted, because
   the point of the list is that nothing came off while something else was
   being prepared. */
const mustHold = [
  [en, "s a Truer Measure.", "the English headline"],
  [en, "A note from the founder", "the founder's note (EN)"],
  [en, "Start with Clarity", "Clarity (EN)"],
  /* The headline that used to sit under "Start with Clarity" moved onto the
     paid card on 9 November 2026. Both must hold: the label names the first
     part of the home page, and the promise is the claim the paid plan is sold
     on. Losing either one silently is the thing this list exists to catch. */
  [en, "See what grades don", "the paid promise (EN)"],
  [en, "Continue with Community.", "Community (EN)"],
  [en, "Grow with Proximity.", "Proximity (EN)"],
  [en, "Elite Parents", "Elite Parents (EN)"],
  [en, "Inner Circle", "Inner Circle (EN)"],
  [en, "School &amp; Life", "School &amp; Life (EN)"],
  [en, "One subscription covers one child.", "one child (EN)"],
  [en, "You choose what goes in. Nothing is added without you.", "closing line 1 (EN)"],
  [en, "helps you see the bigger picture.", "closing line 2 (EN)"],
  [fr, "Commencez par la clart", "Clarté (FR)"],
  [fr, "Voyez ce que les notes ne montrent pas.", "the paid promise (FR)"],
  [fr, "Parents Élites", "Parents Élites (FR)"],
  [fr, "Cercle privé", "Cercle privé (FR)"],
  [fr, "cole et vie", "École et vie (FR)"],
  [fr, "Un abonnement couvre un enfant.", "un enfant (FR)"],
  [fr, "Rien n", "closing line 1 (FR)"],
  [fr, "portrait d", "closing line 2 (FR)"],
];
for (const [html, needle, what] of mustHold) {
  if (!html.includes(needle)) fail(`${what} is missing`);
}

/* The comparison panel that came off on 2 November, in both languages, and the
   heading she replaced the same day for being too absolute. */
const mustNotHold = [
  [en, "Compare the two plans", "the English comparison panel"],
  [fr, "Comparez les deux forfaits", "the French comparison panel"],
  [en, "None of these receive a grade", "the heading she replaced"],
  [fr, "ne reçoit de note", "the French heading she replaced"],
  [en, "Price to be set", "the old price placeholder"],
  [en, "Price to be confirmed", "an unset currency (EN)"],
  [fr, "Prix", "an unset currency (FR)"],
];
for (const [html, needle, what] of mustNotHold) {
  if (needle === "Prix" ? html.includes("Prix à confirmer") : html.includes(needle)) {
    fail(`${what} is back`);
  }
}

/* The legal row, which the root layout puts on every page. */
for (const page of pages) {
  if (page.endsWith("404.html") || page.endsWith("_not-found.html")) continue;
  const html = readFileSync(page, "utf8");
  /* Windows gives these paths backslashes, so the separator is normalised
     rather than assumed: out\fr\learn.html is a French page. */
  const route = page.split("\\").join("/");
  const french =
    route.endsWith("/fr.html") ||
    route.includes("/fr/") ||
    route.includes("conditions-d-utilisation") ||
    route.includes("politique-de-confidentialite");
  /* ONE TERMS ADDRESS FOR BOTH LANGUAGES, from 9 November 2026. This used to
     expect /conditions-d-utilisation on a French page. Her instruction took
     that page down until the translation exists, so every page, French
     included, links the English Terms. Restore the French branch the day the
     translation is routed. */
  if (!html.includes("/terms-of-service")) {
    fail(`${page} has no Terms link (/terms-of-service)`);
  }
  if (html.includes('href="/conditions-d-utilisation"')) {
    fail(`${page} links /conditions-d-utilisation, which came down on 9 November 2026`);
  }
  if (!html.includes("billing.stripe.com/p/login/")) {
    fail(`${page} has no manage-or-cancel link`);
  }
  if (!html.includes(french ? "/fr/withdraw" : "/withdraw")) {
    fail(`${page} has no withdrawal link`);
  }
  /* THE RESERVED LEGAL ADDRESSES. Three documents are linked from the app's
     agreement screen and its release check needs all three to answer 200: the
     Terms, the Privacy Policy and the Licence. The Terms answer today. The
     other two do not, and their addresses are reserved rather than filled:

       /privacy, /politique-de-confidentialite     the app's privacy policy
       /licence, /contrat-de-licence               the Licence Agreement

     Each answers 404 until she approves that document's text, and the 404 is
     the gate: a legal link that does not resolve is what keeps public sign-up
     shut until the document a parent agrees to exists. A placeholder would
     answer 200 and satisfy that check while the document did not exist, which
     is why there is none.

     So the fault this catches is a LINK to one of them from a build that does
     not contain it. The footer is on every page, which is exactly where this
     would have gone wrong and how badly. */
  for (const [address, file] of [
    ["/privacy", "privacy.html"],
    ["/politique-de-confidentialite", "politique-de-confidentialite.html"],
    ["/licence", "licence.html"],
    ["/contrat-de-licence", "contrat-de-licence.html"],
  ]) {
    const href = 'href="' + address + '"';
    if (html.includes(href) && !existsSync(join(OUT, file))) {
      fail(`${page} links to ${address}, which this build does not contain`);
    }
  }
  /* /privacy-policy was this route's address while it was unreachable, and
     /license is the American spelling that netlify.toml redirects. Neither is
     an address a page should carry. */
  if (html.includes('href="/privacy-policy"')) {
    fail(`${page} links to /privacy-policy, which was never an address`);
  }
  if (html.includes('href="/license"')) {
    fail(`${page} links to /license; the address is /licence`);
  }
}

/* ── True of a maintenance build ──────────────────────────────────────────── */

if (kind === "maintenance") {
  for (const needle of ["CA$", "US$", "€47", "data-tm-price"]) {
    if (en.includes(needle) || fr.includes(needle)) {
      fail(`a maintenance build carries ${needle}`);
    }
  }
  if (en.includes("__TM_CURRENCY")) {
    fail("a maintenance build carries the before-paint currency script");
  }
  notes.push(
    "No amount, no billing selector and no currency script: this is what " +
      "Netlify builds today and what a maintenance redeploy must stay.",
  );
}

/* ── True of a review or launch build ─────────────────────────────────────── */

if (kind !== "maintenance") {
  /* All three amounts in the HTML, one shown by CSS from the attribute the
     edge function sets. Her monthly figures of 29 October. */
  const amounts = [
    ['data-tm-price="CAD"', "CA$47", "Plus applicable taxes."],
    ['data-tm-price="USD"', "US$47", "Plus applicable taxes."],
    ['data-tm-price="EUR"', "€47", "VAT included."],
  ];
  for (const [block, amount] of amounts) {
    if (!en.includes(block)) fail(`${block} is missing from the English page`);
    if (!en.includes(amount)) fail(`${amount} is missing from the English page`);
    if (!fr.includes(block)) fail(`${block} is missing from the French page`);
  }
  if (!en.includes("Plus applicable taxes.")) fail("CAD/USD tax wording missing (EN)");
  if (!en.includes("VAT included.")) fail("EUR tax wording missing (EN)");
  if (!fr.includes("Plus les taxes applicables.")) fail("CAD/USD tax wording missing (FR)");
  if (!fr.includes("TVA incluse.")) fail("EUR tax wording missing (FR)");

  /* The billing choice stays; the currency selector must not come back. */
  if (!en.includes("Monthly") || !en.includes("Yearly")) {
    fail("the monthly/yearly selector is missing (EN)");
  }
  if (!fr.includes("Par mois") || !fr.includes("Par ann")) {
    fail("the monthly/yearly selector is missing (FR)");
  }
  for (const [html, lang] of [[en, "EN"], [fr, "FR"]]) {
    if (/data-tm-currency-(?:toggle|control)|aria-label="Currency"/.test(html)) {
      fail(`a currency control is back on the ${lang} page`);
    }
  }

  /* Yearly is computed in the browser when the parent switches, so the yearly
     amount is not in the HTML. What must be in the HTML is the sentence that
     will carry it, which is how a missing translation would show up. */
  if (!en.includes("$1") && !en.includes("a month, paid once a year")) {
    notes.push("The yearly note is built in the browser; checked on screen instead.");
  }

  if (!en.includes("__TM_CURRENCY")) fail("the before-paint currency script is missing");
}

/* ── The buttons ──────────────────────────────────────────────────────────── */

/* THE BUTTON LABELS COME FROM THE COPY, not from this file.
 *
 * They were spelled out here as "Start free|Choose School" until 9 November
 * 2026, when she renamed the free button and this wall failed on a correct
 * build: it was looking for words the site no longer said. A check that has to
 * be edited every time the copy changes will eventually be edited wrongly, or
 * deleted. So the four labels are read out of content/app-plans.ts, which is
 * where they are written, and a build whose buttons do not carry them fails.
 *
 * If the shape of that file changes so the labels cannot be found, this fails
 * loudly rather than quietly passing on nothing. */
const planSource = readFileSync(
  new URL("../content/app-plans.ts", import.meta.url),
  "utf8",
);
const planCtas = [...planSource.matchAll(/^\s*cta:\s*"([^"]+)"/gm)].map((m) => m[1]);
if (planCtas.length < 4) {
  fail(
    `content/app-plans.ts: expected four button labels (free and paid, EN and FR), found ${planCtas.length}`,
  );
}
/* `free: { … cta }` then `paid: { … cta }`, English block then French. */
const [freeCtaEn, paidCtaEn, freeCtaFr] = planCtas;

const labelAlternatives = planCtas
  .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
const buttonHrefs = [
  ...en.matchAll(new RegExp(`href="([^"]+)"[^>]*>(?:${labelAlternatives})`, "g")),
].map((m) => m[1]);

if (kind === "launch") {
  if (!appHost) {
    fail("a launch build needs --app-host, to check the buttons point at it");
  } else {
    const host = appHost.replace(/\/$/, "");
    for (const href of buttonHrefs) {
      if (!href.startsWith(host)) fail(`a plan button points at ${href}, not ${host}`);
      if (!href.includes("currency=")) fail(`${href} does not carry the currency`);
      if (!href.includes("billing=")) fail(`${href} does not carry the billing period`);
    }
  }
  for (const [html, lang] of [[en, "EN"], [fr, "FR"]]) {
    if (html.includes("Opens the demo") || html.includes("Ouvre la d")) {
      fail(`the demo note is still on the ${lang} page`);
    }
    if (html.includes(DEMO)) fail(`the ${lang} page still links to the demo`);
  }
} else {
  /* Review and maintenance both still go to the demo, and must say so. Her
     brief of 1 November: a discreet indication near the buttons that they
     still open the demo. */
  if (!en.includes("Opens the demo in a new tab.")) fail("the demo note is missing (EN)");
  if (!fr.includes("Ouvre la d")) fail("the demo note is missing (FR)");
  if (!en.includes("They are not in the app at launch.")) {
    fail("the demo-only sentence is missing (EN)");
  }
  if (!fr.includes("au lancement.")) fail("the demo-only sentence is missing (FR)");
  for (const href of buttonHrefs) {
    if (href !== DEMO) fail(`a plan button points at ${href} instead of the demo`);
  }
  if (en.includes("currency=") || fr.includes("currency=")) {
    fail("a demo link carries the currency, which the demo ignores");
  }
}

/* ── The framework, and that the page really carries all of it ───────────── */

/* Her brief of 2 November 2026: the demo's six foundations and twenty-one
   characteristics, "preserving their names, meaning, order and groupings. Do
   not add, remove, merge or substitute them." The names are read out of
   content/framework.ts rather than repeated here, so this cannot drift from
   what the page renders; what it checks is that every one of them survives the
   build, in the right language, and that nothing from the list it replaced is
   still on the page. */
const frameworkSource = readFileSync("content/framework.ts", "utf8");
const items = [...frameworkSource.matchAll(
  /\{\s*id:\s*"([a-z]+)",\s*\n?\s*en:\s*"([^"]+)",\s*\n?\s*fr:\s*"([^"]+)",?\s*\n?\s*\}/g,
)].map((m) => ({ id: m[1], en: m[2], fr: m[3] }));

const esc = (s) => s.replace(/&/g, "&amp;");

if (items.length !== 27) {
  fail(`content/framework.ts parsed as ${items.length} items, expected 27`);
} else {
  const hrcEn = readFileSync(join(OUT, "the-truer-measure.html"), "utf8");
  const hrcFr = readFileSync(join(OUT, "fr", "the-truer-measure.html"), "utf8");
  for (const item of items) {
    if (!hrcEn.includes(esc(item.en))) fail(`"${item.en}" is not on the English page`);
    if (!hrcFr.includes(esc(item.fr))) fail(`"${item.fr}" is not on the French page`);
  }
  /* The four the old list carried and the framework does not have. If one of
     these is back, something was merged or substituted. */
  for (const gone of ["Imagination", "Resilience", "Emotional Intelligence", "Civic-Mindedness"]) {
    if (hrcEn.includes(gone)) fail(`"${gone}" is back on the English page`);
  }
  for (const gone of ["Imagination", "Résilience", "Intelligence émotionnelle", "Sens civique"]) {
    if (hrcFr.includes(gone)) fail(`"${gone}" is back on the French page`);
  }
  /* Her wording of 2 November, which replaced "None of these receive a
     grade…". It introduces the whole section, so it must be above the
     foundations rather than between the two blocks. */
  if (!hrcEn.includes("grades don’t show everything")) {
    fail("her replacement heading is not on the English page");
  } else if (hrcEn.indexOf("grades don’t show everything") >
             hrcEn.indexOf("foundations that outlast school")) {
    fail("the English heading is below the foundations");
  }
  if (!hrcFr.includes("ne montrent pas tout ce dont il est capable")) {
    fail("her replacement heading is not on the French page");
  } else if (hrcFr.indexOf("ne montrent pas tout ce dont il est capable") >
             hrcFr.indexOf("fondements qui durent")) {
    fail("the French heading is below the foundations");
  }
  notes.push(`${items.length} framework entries present in both languages.`);
}

/* The paid choice leads on a phone, so the price, the billing period and the
   paid button are in the first screen. It is markup order, not CSS, which is
   what makes this checkable here and what keeps the reading order honest.

   MAINTENANCE BUILDS ARE EXEMPT, fixed 9 November 2026. This loop ran on every
   build and looked for data-tm-price="CAD", which a maintenance build correctly
   does not have: the whole point of that mode is no amounts. So the check
   failed on the only build Netlify made for five weeks, which is worse than no
   check, because a wall that cries wolf on the normal case is a wall people
   learn to ignore. It now runs where the plan cards are supposed to exist. */
for (const [html, lang, freeCta] of kind === "maintenance"
  ? []
  : [[en, "EN", freeCtaEn], [fr, "FR", freeCtaFr]]) {
  const paidPrice = html.indexOf('data-tm-price="CAD"');
  const free = html.indexOf(freeCta);
  if (paidPrice === -1 || free === -1) {
    fail(`cannot find both plan choices on the ${lang} home page`);
  } else if (paidPrice > free) {
    fail(`the paid choice is below the free choice in the ${lang} markup`);
  }
}

/* ── The action first, on each offer destination ──────────────────────────── */

/* Her brief of 2 November: "When someone clicks the navigation options shown
   in my screenshot, the relevant action must appear first." Checked as source
   order, which is what a screen reader and a keyboard follow as well as the
   eye. */
/* The first heading the MDX body renders; the written explanation starts
   there. Named explicitly so the check cannot pass by finding nothing. */
const MDX_BODY = '<h2 class="font-heading mt-12';
const actionFirst = [
  ["the-truer-measure.html", 'id="plans"', "Grades tell a story", "the plan cards"],
  ["fr/the-truer-measure.html", 'id="plans"', "Les notes racontent", "the plan cards"],
  ["learn.html", "Join the Waitlist", MDX_BODY, "the waitlist"],
  ["fr/learn.html", "Rejoignez la liste", MDX_BODY, "the waitlist"],
  ["inner-circle.html", ">Apply<", MDX_BODY, "the application"],
  ["fr/inner-circle.html", "Faites une demande", MDX_BODY, "the application"],
];
for (const [page, action, explanation, what] of actionFirst) {
  const html = readFileSync(join(OUT, ...page.split("/")), "utf8");
  const a = html.indexOf(action);
  const e = html.indexOf(explanation);
  if (a === -1) fail(`${page}: ${what} is missing`);
  else if (e === -1) fail(`${page}: cannot find the explanation to compare against`);
  else if (a > e) fail(`${page}: ${what} comes after the explanation`);
}

/* The founder's note closes the home page, after both offer sections.
   Compared inside the rendered body only: the React payload at the foot of the
   file repeats every string in source order, so searching the whole file would
   compare the page against its own serialisation. */
for (const [page, note, lastOffer] of [
  ["index.html", "A note from the founder", "Help shape what"],
  ["fr.html", "Un mot de la fondatrice", "açonner la suite"],
]) {
  const html = readFileSync(join(OUT, page), "utf8");
  const footer = html.indexOf("<footer");
  const body = footer === -1 ? html : html.slice(0, footer);
  const n = body.indexOf(note);
  const o = body.lastIndexOf(lastOffer);
  if (n === -1) fail(`${page}: the founder's note is not in the rendered page`);
  else if (o === -1) fail(`${page}: the offers are not in the rendered page`);
  else if (n < o) fail(`${page}: the founder's note is still above the offers`);
}

/* ── The forms, untouched ─────────────────────────────────────────────────── */

for (const [html, lang] of [[en, "EN"], [fr, "FR"]]) {
  if (!html.includes("waitlist-elite-learning-leaders")) {
    fail(`the Elite Parents waitlist tag is missing (${lang})`);
  }
  if (!html.includes("applied-inner-circle")) {
    fail(`the Inner Circle application tag is missing (${lang})`);
  }
}

/* ── Report ───────────────────────────────────────────────────────────────── */

for (const note of notes) console.log(`  note: ${note}`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`  ${pages.length} pages checked, nothing wrong.`);
