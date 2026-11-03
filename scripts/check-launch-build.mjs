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
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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

/* Her page, in both languages. Named one by one rather than counted, because
   the point of the list is that nothing came off while something else was
   being prepared. */
const mustHold = [
  [en, "s a Truer Measure.", "the English headline"],
  [en, "A note from the founder", "the founder's note (EN)"],
  [en, "Start with Clarity", "Clarity (EN)"],
  [en, "Continue with Community.", "Community (EN)"],
  [en, "Grow with Proximity.", "Proximity (EN)"],
  [en, "Elite Parents", "Elite Parents (EN)"],
  [en, "Inner Circle", "Inner Circle (EN)"],
  [en, "School &amp; Life", "School &amp; Life (EN)"],
  [en, "One subscription covers one child.", "one child (EN)"],
  [en, "You choose what goes in. Nothing is added without you.", "closing line 1 (EN)"],
  [en, "helps you see the bigger picture.", "closing line 2 (EN)"],
  [fr, "Commencez par la clart", "Clarté (FR)"],
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

/* The comparison panel that came off on 2 November, in both languages. */
const mustNotHold = [
  [en, "Compare the two plans", "the English comparison panel"],
  [fr, "Comparez les deux forfaits", "the French comparison panel"],
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
    route.includes("conditions-d-utilisation");
  const terms = french ? "/conditions-d-utilisation" : "/terms-of-service";
  if (!html.includes(terms)) fail(`${page} has no Terms link (${terms})`);
  if (!html.includes("billing.stripe.com/p/login/")) {
    fail(`${page} has no manage-or-cancel link`);
  }
  if (!html.includes(french ? "/fr/withdraw" : "/withdraw")) {
    fail(`${page} has no withdrawal link`);
  }
  /* The Privacy Policy is held in app/_pending while counsel reviews it, so a
     link to it anywhere means it escaped. */
  if (html.includes("/privacy-policy") || html.includes("/politique-de-confidentialite")) {
    fail(`${page} links to the held Privacy Policy`);
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

const buttonHrefs = [...en.matchAll(/href="([^"]+)"[^>]*>(?:Start free|Choose School)/g)]
  .map((m) => m[1]);

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
