import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const browser = await puppeteer.launch({ headless: true });

async function captureSections(url, prefix, waitMs = 4000) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, waitMs));

  // Capture sections via scroll positions
  const sections = [
    { name: "01-hero", y: 0, h: 800 },
    { name: "02-qualities", y: 800, h: 800 },
    { name: "03-founder", y: 1600, h: 800 },
    { name: "04-dark", y: 2400, h: 800 },
    { name: "05-moments", y: 3200, h: 800 },
    { name: "06-contrast", y: 4000, h: 800 },
    { name: "07-tiers", y: 4800, h: 1000 },
  ];

  for (const s of sections) {
    await page.evaluate((y) => window.scrollTo(0, y), s.y);
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: path.join(root, `scripts/section-${prefix}-${s.name}.png`),
      clip: { x: 0, y: 0, width: 1280, height: s.h },
    });
  }
  await page.close();
}

const originalPath = `file:///${root.replace(/\\/g, "/")}/out-original.html`;
await captureSections(originalPath, "orig", 6000);
await captureSections("http://localhost:3000", "new", 2000);

await browser.close();
console.log("Done.");
