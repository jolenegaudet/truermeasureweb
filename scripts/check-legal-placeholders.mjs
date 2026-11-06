/**
 * Fails the build if a legal document that is actually reachable on the site
 * still contains an unfilled placeholder.
 *
 * Her instruction, 4 October 2026: do not publish the Privacy Policy until the
 * final file is complete and the effective date is set. A note in a file is a
 * reminder; this is a wall. The Privacy Policy routes exist and are wired into
 * the footer and the signup consent line, so from now on the only thing
 * standing between an unfinished policy and the public is a deploy. This makes
 * that deploy impossible instead of merely inadvisable.
 *
 * It checks only documents a route imports, so an unrouted draft like
 * content/privacy-policy.mdx can keep its placeholders for as long as it needs
 * them. Publish it and the same wall applies automatically.
 *
 * Runs as "prebuild", so npm run build triggers it here and on Netlify alike.
 *
 * TM_LEGAL_PREVIEW=1 turns the wall into a loud warning, and it exists for
 * one reason. Her instruction of 5 November 2026 was to show her the exact
 * texts at their real addresses before she approves them: "Montre-moi les
 * versions exactes en apercu." A document can only be read at its address if
 * the route builds, and the route cannot build while this check refuses the
 * draft. So the preview gets the escape and the deploy does not.
 *
 * The wall did not come down, it moved outward. scripts/check-launch-build.mjs
 * reads the BUILT html and refuses a draft marker or an unfilled placeholder
 * there, which is the check that runs before a deploy. That one is stronger
 * than this one, because it reads what would actually be served rather than
 * the source it came from.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PLACEHOLDER = /\[([A-Z][A-Z0-9_]{2,})\]/g;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// Which content documents does a route actually pull in?
const routed = new Map(); // mdx path -> the route file that imports it
for (const file of walk(join(ROOT, "app"))) {
  if (!/\.(tsx|ts)$/.test(file)) continue;
  // A path segment beginning with "_" is a Next private folder: it is not a
  // route, so whatever it imports is not published and may stay unfinished.
  if (file.slice(ROOT.length).split(/[\\/]/).some((seg) => seg.startsWith("_"))) continue;
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/from\s+"@\/content\/([^"]+\.mdx)"/g)) {
    routed.set(join(ROOT, "content", m[1]), file.slice(ROOT.length + 1));
  }
}

const problems = [];
for (const [doc, route] of routed) {
  let text;
  try {
    text = readFileSync(doc, "utf8");
  } catch {
    continue;
  }
  // Ignore the {/* ... */} note blocks; they are not published.
  const body = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const found = [...new Set([...body.matchAll(PLACEHOLDER)].map((m) => m[0]))];
  if (found.length) {
    problems.push({ doc: doc.slice(ROOT.length + 1), route, found });
  }
  if (/DRAFT|not yet in force|pas encore en vigueur|ÉBAUCHE/i.test(body)) {
    problems.push({
      doc: doc.slice(ROOT.length + 1),
      route,
      found: ["still marked as a draft"],
    });
  }
}

/* ── A document published in one language only ───────────────────────────── */

/* Her Licence is moving in two pieces at two speeds: on 6 November 2026 the
   English draft sat in the counsel package and she had just sent her French
   draft to the app session to check it against the English. Two documents
   moving separately is how a contract ends up routed in one language, and a
   francophone parent then agrees to an English page or lands on a 404.
   scripts/publish-legal.ps1 already refuses to finish a document that is
   missing a language. This refuses to BUILD one, which is earlier.

   The French product policy is not in this table because it has no agreed
   filename yet. Add it here the day it gets one. */
const PAIRS = [
  ["content/terms-of-service.mdx", "content/conditions-d-utilisation.mdx"],
  ["content/privacy-policy.website.mdx", "content/politique-de-confidentialite.mdx"],
  ["content/licence.mdx", "content/contrat-de-licence.mdx"],
];

const routedNames = new Set(
  [...routed.keys()].map((p) => p.slice(ROOT.length + 1).split(sep).join("/")),
);
const unpaired = [];
for (const pair of PAIRS) {
  for (const [a, b] of [pair, [...pair].reverse()]) {
    if (routedNames.has(a) && !routedNames.has(b)) {
      unpaired.push({ here: a, missing: b, route: routed.get(join(ROOT, ...a.split("/"))) });
    }
  }
}

const previewing = process.env.TM_LEGAL_PREVIEW === "1";

/* Both kinds of fault get reported before the build stops, so a document
   that is a draft AND missing a language does not hide the second problem
   behind the first. */
let refuse = false;

if (problems.length) {
  const say = previewing ? console.warn : console.error;
  say(
    previewing
      ? "\n  LEGAL PREVIEW: a routed legal document is still a draft.\n"
      : "\n  BUILD STOPPED: a published legal document is not finished.\n",
  );
  for (const { doc, route, found } of problems) {
    say(`    ${doc}`);
    say(`      served by  ${route}`);
    say(`      unresolved ${found.join(", ")}\n`);
  }
  if (previewing) {
    say("  Building anyway, because TM_LEGAL_PREVIEW=1 was set.");
    say("  THIS BUILD MUST NOT BE DEPLOYED. scripts/check-launch-build.mjs");
    say("  refuses it unless --legal-preview is passed, and the publish");
    say("  procedure never passes that flag.\n");
  } else {
    say("  Fill these in, or remove the route, before building.");
    say("  To read them locally instead, set TM_LEGAL_PREVIEW=1.\n");
    refuse = true;
  }
}

if (unpaired.length) {
  const say = previewing ? console.warn : console.error;
  say(
    previewing
      ? "\n  LEGAL PREVIEW: a legal document is routed in one language only.\n"
      : "\n  BUILD STOPPED: a legal document is routed in one language only.\n",
  );
  for (const { here, missing, route } of unpaired) {
    say(`    ${here}`);
    say(`      served by  ${route}`);
    say(`      but        ${missing} is not routed\n`);
  }
  if (previewing) {
    say("  Building anyway, because TM_LEGAL_PREVIEW=1 was set. A reader can");
    say("  see the one language that exists. THIS BUILD MUST NOT BE DEPLOYED.\n");
  } else {
    say("  A contract offered in one language is not a translation problem, it");
    say("  is a different contract for half the readers. Route both or neither.\n");
    refuse = true;
  }
}

if (refuse) process.exit(1);

if (problems.length || unpaired.length) {
  const notes = [];
  if (problems.length) notes.push(`${new Set(problems.map((p) => p.doc)).size} still a draft`);
  if (unpaired.length) notes.push(`${unpaired.length} missing a language`);
  console.log(`  Legal documents checked: ${routed.size}, ${notes.join(", ")}.`);
} else {
  console.log(`  Legal documents checked: ${routed.size}, all complete, both languages each.`);
}
