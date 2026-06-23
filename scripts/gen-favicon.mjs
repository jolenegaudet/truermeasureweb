/**
 * Generates app/favicon.ico from app/icon.svg at 16/32/48 px.
 * Run after editing the SVG to regenerate.
 */

import { readFileSync, writeFileSync } from "fs";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const svg = readFileSync("app/icon.svg");

const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((size) =>
    sharp(svg).resize(size, size).png().toBuffer()
  )
);

const ico = await pngToIco(pngs);
writeFileSync("app/favicon.ico", ico);

console.log(`Wrote app/favicon.ico (${ico.length} bytes, sizes: ${sizes.join("/")} px)`);
