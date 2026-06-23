import { execSync } from "child_process";
import { gunzipSync } from "zlib";

const html = execSync("git show HEAD~1:index.html", {
  maxBuffer: 100 * 1024 * 1024,
}).toString("utf8");

// Extract the template JSON (contains the pre-rendered HTML pages)
const templateMatch = html.match(
  /<script type="__bundler\/template">([\s\S]*?)<\/script>/
);

if (!templateMatch) {
  console.error("Could not find __bundler/template");
  process.exit(1);
}

const templateData = JSON.parse(templateMatch[1]);
const pages = templateData.pages;
const entryId = templateData.entry;

// Also decode manifested assets to replace UUID refs
const manifestMatch = html.match(
  /<script type="__bundler\/manifest">([\s\S]*?)<\/script>/
);
const manifest = manifestMatch ? JSON.parse(manifestMatch[1]) : {};

// Decode compressed base64 assets to text where they are text/html or text/css
const decoded = {};
for (const [uuid, entry] of Object.entries(manifest)) {
  try {
    const bytes = Buffer.from(entry.data, "base64");
    const raw = entry.compressed ? gunzipSync(bytes) : bytes;
    if (
      entry.mime?.startsWith("text/") ||
      entry.mime?.includes("javascript") ||
      entry.mime?.includes("json")
    ) {
      decoded[uuid] = raw.toString("utf8");
    }
  } catch {
    // skip binary assets
  }
}

// Process each page: substitute uuid refs with decoded content where possible
for (const [id, rawTemplate] of Object.entries(pages)) {
  let page = rawTemplate;
  for (const [uuid, text] of Object.entries(decoded)) {
    page = page.split(uuid).join("[asset]");
  }
  // strip remaining uuid-like placeholders
  page = page.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ""
  );

  // Strip script/style/svg blocks first
  page = page
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "");

  // Strip all HTML tags
  page = page.replace(/<[^>]+>/g, " ");

  // Normalise whitespace
  page = page
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#[0-9]+;/g, "")
    .replace(/\s{2,}/g, "\n")
    .trim();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`PAGE: ${id}${id === entryId ? " (entry)" : ""}`);
  console.log("=".repeat(60));
  console.log(page);
}
