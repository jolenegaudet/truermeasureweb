import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const browser = await puppeteer.launch({ headless: true });

const sections = [
  { name: "header", origSel: "header", newSel: "header" },
  { name: "hero", origSel: '[data-screen-label="Hero"]', newSel: "main > section:nth-of-type(1)" },
  { name: "qualities", origSel: '[data-screen-label="Qualities"]', newSel: "main > section:nth-of-type(2)" },
  { name: "founder", origSel: '[data-screen-label="Founder"]', newSel: "main > section:nth-of-type(3)" },
  { name: "artifact", origSel: '[data-screen-label="Artifact"]', newSel: "main > section:nth-of-type(4)" },
  { name: "moments", origSel: '[data-screen-label="Moments"]', newSel: "main > section:nth-of-type(5)" },
  { name: "contrast", origSel: '[data-screen-label="Contrast"]', newSel: "main > section:nth-of-type(6)" },
  { name: "tiers", origSel: '[data-screen-label="Tiers"]', newSel: "main > section:nth-of-type(7)" },
  { name: "footer", origSel: "footer", newSel: "footer" },
];

async function shotSection(url, selectors, prefix, waitMs) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, waitMs));

  for (const { name, selKey } of selectors) {
    const el = await page.$(selKey);
    if (!el) {
      console.log(`  MISSING: ${prefix} ${name} (selector: ${selKey})`);
      continue;
    }
    await el.scrollIntoView();
    await new Promise((r) => setTimeout(r, 200));
    await el.screenshot({ path: path.join(root, `scripts/sec-${prefix}-${name}.png`) });
    console.log(`  Saved: sec-${prefix}-${name}.png`);
  }
  await page.close();
}

const originalPath = `file:///${root.replace(/\\/g, "/")}/out-original.html`;
console.log("ORIGINAL:");
await shotSection(originalPath, sections.map(s => ({ name: s.name, selKey: s.origSel })), "orig", 6000);

console.log("NEW:");
await shotSection("http://localhost:3000", sections.map(s => ({ name: s.name, selKey: s.newSel })), "new", 2000);

await browser.close();
console.log("Done.");
