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
import { join, resolve } from "node:path";

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

const previewing = process.env.TM_LEGAL_PREVIEW === "1";

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
    process.exit(1);
  }
}

if (problems.length) {
  const drafts = new Set(problems.map((p) => p.doc)).size;
  console.log(`  Legal documents checked: ${routed.size}, ${drafts} still a draft.`);
} else {
  console.log(`  Legal documents checked: ${routed.size}, all complete.`);
}
