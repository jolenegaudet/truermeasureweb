/**
 * Fails the build if the app's marketing copy claims a feature the customer
 * app does not give a customer.
 *
 * Her brief, 28 October 2026: "Use the current app as the source of truth. Keep
 * claims grounded in what it actually does." That is a judgement when the copy
 * is written and a liability for ever afterwards, because the copy and the app
 * live in different repositories and nothing connects them.
 *
 * Four features work in the demo and are hidden from a signed-in account:
 *
 *   prototype/.worktrees/launch/js/account.js:17
 *   const DEFERRED = ['annual', 'resume', 'childPage', 'growthBars'];
 *   // Not part of the first paid release: hidden from accounts, still in the
 *   // demo (the founder, 13 October 2026).
 *
 * They are the four most likely to drift back onto the page, because they are
 * genuinely impressive, they are visible in the demo the buttons now point at,
 * and anyone writing copy from the demo would describe them in good faith.
 * This refuses the build instead.
 *
 * It reads the DEFERRED list out of the app itself when the app is beside this
 * repo, so when she ships one of them the guard stops objecting on its own. If
 * the app is not there (Netlify builds from the web repo alone) it falls back
 * to the list above and says which it used.
 *
 * Runs as "prebuild", beside scripts/check-legal-placeholders.mjs.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

/** The customer app: branch `launch`, in a worktree beside this repo. */
const APP = resolve(ROOT, "..", "prototype", ".worktrees", "launch", "js", "account.js");

const FALLBACK = ["annual", "resume", "childPage", "growthBars"];

function deferred() {
  if (!existsSync(APP)) return { list: FALLBACK, from: "the list recorded in this script" };
  const src = readFileSync(APP, "utf8");
  const m = src.match(/const\s+DEFERRED\s*=\s*\[([^\]]*)\]/);
  if (!m) return { list: FALLBACK, from: "the list recorded in this script (DEFERRED not found in the app)" };
  const list = [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
  return { list, from: "the customer app" };
}

/**
 * What each deferred feature would look like in English marketing copy.
 *
 * Matched case-insensitively against the copy file only. Deliberately narrow:
 * a word like "report" is in the free plan's copy a dozen times over, and a
 * guard that cries wolf gets deleted. Each phrase here is one that could only
 * be a claim about the deferred feature.
 */
const PHRASES = {
  annual: ["yearly report", "annual report", "report for the year", "end-of-year report"],
  resume: ["résumé", "resume builder", "build my r"],
  childPage: ["page for your child", "pages for your child", "printable page", "page written to your child", "child-facing"],
  growthBars: ["growth since last year", "growth bars"],
};

const COPY = join(ROOT, "content", "app-plans.ts");

if (!existsSync(COPY)) {
  console.log("  App claims: content/app-plans.ts is not here, nothing to check.");
  process.exit(0);
}

/* The comments in the copy file explain WHY these features are absent, and
   name them to do it. Checking the comments would make the explanation itself
   the violation, so they come out before anything is matched. */
const text = readFileSync(COPY, "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/^\s*\/\/.*$/gm, " ");

const { list, from } = deferred();
const problems = [];
for (const feature of list) {
  for (const phrase of PHRASES[feature] || []) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      problems.push({ feature, phrase });
    }
  }
}

if (problems.length) {
  console.error("\n  BUILD STOPPED: the page claims something the app does not give a customer.\n");
  for (const { feature, phrase } of problems) {
    console.error(`    "${phrase}"`);
    console.error(`      content/app-plans.ts describes "${feature}", which is in DEFERRED\n`);
  }
  console.error("  These work in the demo and are hidden from a signed-in account");
  console.error("  (the founder, 13 October 2026). Either take the claim off the page,");
  console.error("  or ship the feature and take it out of DEFERRED in the app.\n");
  process.exit(1);
}

console.log(
  `  App claims checked against ${list.length} deferred features, from ${from}: none claimed.`,
);
