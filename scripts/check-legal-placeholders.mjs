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

if (problems.length) {
  console.error("\n  BUILD STOPPED: a published legal document is not finished.\n");
  for (const { doc, route, found } of problems) {
    console.error(`    ${doc}`);
    console.error(`      served by  ${route}`);
    console.error(`      unresolved ${found.join(", ")}\n`);
  }
  console.error("  Fill these in, or remove the route, before building.\n");
  process.exit(1);
}

console.log(`  Legal documents checked: ${routed.size}, all complete.`);
