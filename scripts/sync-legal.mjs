/**
 * Copies the three legal documents from the folder she named as their only
 * source into the MDX the site renders.
 *
 * Her ruling, 9 November 2026, relayed in her words: "offer\legal-documents-current
 * is the only source for the three documents." That folder sits OUTSIDE this
 * repository, which is the point: two editable copies of a contract is how the
 * wrong one gets published, and this session had already published a sentence
 * of its own into a policy by misreading an answer.
 *
 * The folder is not on Netlify. Netlify clones this repository and nothing
 * else, so the generated MDX has to be committed. That makes drift possible,
 * which is what --check is for.
 *
 *   node scripts/sync-legal.mjs            copy the folder into content/
 *   node scripts/sync-legal.mjs --check    fail if content/ has drifted
 *
 * --check is silent and succeeds when the folder is absent, because that is
 * every Netlify build. It is a local tripwire, not a build gate: the build gate
 * is scripts/check-legal-placeholders.mjs, which reads what is committed.
 *
 * WHAT IT CHANGES ON THE WAY IN. Only the things MDX needs and the things a
 * page already renders:
 *   - the document's own H1 and the two lines under it come out, because
 *     app/<route>/page.tsx renders the title and the effective date itself
 *   - a generated-file banner goes in, with the source's sha256 fingerprint
 * Not a word of her text is touched.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE = resolve(ROOT, "..", "offer", "legal-documents-current");

const DOCS = [
  ["terms-of-service.md", "terms-of-service.mdx"],
  ["privacy-policy.md", "privacy-policy.mdx"],
  ["end-user-licence-agreement.md", "licence.mdx"],
];

const checking = process.argv.includes("--check");

if (!existsSync(SOURCE)) {
  if (checking) process.exit(0);
  console.error(`\n  No source folder at ${SOURCE}`);
  console.error("  This script only runs where that folder exists.\n");
  process.exit(1);
}

function render(md, sourceName) {
  const fingerprint = createHash("sha256").update(md).digest("hex").slice(0, 12);
  const lines = md.split(/\r?\n/);
  /* Drop the H1 and the brand line beneath it, and nothing else. The effective
     date is the next line and it stays. */
  const kept = [];
  let dropped = 0;
  for (const line of lines) {
    if (dropped < 2) {
      if (/^#\s/.test(line)) {
        dropped = Math.max(dropped, 1);
        continue;
      }
      if (line.trim() === "**Truer Measure™**") {
        dropped = 2;
        continue;
      }
    }
    kept.push(line);
  }
  if (dropped !== 2) {
    throw new Error(
      `${sourceName}: expected an H1 and a "**Truer Measure™**" line at the top, dropped ${dropped}`,
    );
  }
  const body = kept.join("\n").replace(/^\s+/, "");
  const banner =
    `{/* GENERATED FILE. DO NOT EDIT.\n\n` +
    `    Source: offer/legal-documents-current/${sourceName}\n` +
    `    sha256: ${fingerprint}\n\n` +
    `    Her ruling of 9 November 2026: that folder is the only source for the\n` +
    `    three documents. Edit it there and run:\n\n` +
    `      node scripts/sync-legal.mjs\n\n` +
    `    node scripts/sync-legal.mjs --check fails if this file has drifted\n` +
    `    from the source. An edit made here is lost at the next sync. */}\n\n`;
  return { text: banner + body + "\n", fingerprint };
}

let drifted = 0;
const report = [];
for (const [from, to] of DOCS) {
  const src = join(SOURCE, from);
  if (!existsSync(src)) {
    console.error(`  missing source: ${from}`);
    process.exit(1);
  }
  const { text, fingerprint } = render(readFileSync(src, "utf8"), from);
  const dest = join(ROOT, "content", to);
  const current = existsSync(dest) ? readFileSync(dest, "utf8") : null;
  if (current === text) {
    report.push(`  ${to}  up to date  (${fingerprint})`);
    continue;
  }
  if (checking) {
    drifted += 1;
    report.push(`  ${to}  DRIFTED from ${from} (${fingerprint})`);
    continue;
  }
  writeFileSync(dest, text);
  report.push(`  ${to}  written from ${from}  (${fingerprint})`);
}

console.log(report.join("\n"));
if (drifted) {
  console.error(
    `\n  ${drifted} generated document(s) no longer match the source folder.\n` +
      "  Run: node scripts/sync-legal.mjs\n",
  );
  process.exit(1);
}
