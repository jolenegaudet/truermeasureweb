import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const browser = await puppeteer.launch({ headless: true });

async function shot(url, file, waitMs = 3000) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, waitMs));
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
  console.log("Saved:", file);
}

const originalPath = `file:///${root.replace(/\\/g, "/")}/out-original.html`;
await shot(originalPath, path.join(root, "scripts/screenshot-original.png"), 5000);
await shot("http://localhost:3000", path.join(root, "scripts/screenshot-new.png"), 2000);

await browser.close();
console.log("Done.");
