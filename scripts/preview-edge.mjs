/**
 * The preview that behaves like Netlify, edge function included.
 *
 *   node scripts/preview-edge.mjs [port] [directory] [--lan] [--country XX]
 *
 * scripts/preview-server.py serves out/ with Netlify's pretty URLs, which is
 * most of what a read-through needs. This does that too, and then runs the
 * currency edge function over every page, so the preview shows a price at all.
 *
 * WHY IT EXISTS. netlify/edge-functions/currency.ts decides the currency from
 * `context.geo.country.code`, which only Netlify can supply. Without it no
 * attribute is written and the stylesheet falls back to USD, so a plain preview
 * shows an American price to a reader in Canada and the signed link cannot be
 * exercised at all. This imports the same content/currency-map.ts the edge
 * function imports and calls the same three functions in the same order:
 * currencyForCountry, currencyStamp, withCurrencyAttribute. The only thing
 * standing in for Netlify is where the country comes from.
 *
 * THE COUNTRY. --country sets what Netlify would have resolved, default CA, so
 * the preview matches what a reader in Canada sees on the published site. Any
 * page accepts ?sim-country=XX to override it for that request: FR or DE for
 * the euro area, US or AU for the rest of the world, and an empty
 * ?sim-country= for a visitor Netlify cannot place, which is the USD fallback
 * with no signature.
 *
 * THE KEY is read from outside the repository, from
 * $TRUERMEASURE_SECRETS_DIR or the .secrets folder beside it, and it is never
 * printed, served or written anywhere. Without it the preview still works and
 * simply writes no signature, which is exactly how production behaves before
 * TM_CURRENCY_KEY is set.
 *
 * --lan binds every interface instead of 127.0.0.1, so the preview can be
 * opened on a phone on the same wifi. It serves an unapproved build, so bind it
 * no wider than the room you are in, and stop it when the read-through is done.
 *
 * Preview only. Nothing here runs in production.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");

/* The same module the edge function imports, by file url so Node's TypeScript
   support resolves it without the build's path alias. */
const { currencyForCountry, currencyStamp, withCurrencyAttribute } = await import(
  pathToFileURL(join(REPO, "content", "currency-map.ts")).href
);

/* ── Arguments ───────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const valueOf = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1] ?? null;
};
const positional = argv.filter(
  (a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1] === "--country"),
);

const port = Number(positional[0] || 3202);
const root = resolve(positional[1] || join(REPO, "out"));
const host = flag("--lan") ? "0.0.0.0" : "127.0.0.1";
const defaultCountry = (valueOf("--country") || "CA").toUpperCase();

/* ── The signing key, from outside the repository ────────────────────────── */

const secretsHome = process.env.TRUERMEASURE_SECRETS_DIR || resolve(REPO, "..", ".secrets");
let key = null;
try {
  const line = readFileSync(join(secretsHome, "currency-link.env"), "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("TM_CURRENCY_KEY="));
  if (line) {
    const raw = line.slice("TM_CURRENCY_KEY=".length).trim().replace(/^["']|["']$/g, "");
    if (raw) key = raw;
  }
} catch {
  /* No key file here is not a fault. Production behaves the same way until the
     variable is set: the attribute is written and nothing is signed. */
}

/* ── Netlify's own routing, as far as the preview needs it ───────────────── */

const REDIRECTS = { "/terms": "/terms-of-service" };

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

/* An extensionless path tries <path>.html then <path>/index.html, which is how
   the static export lays out /fr and /privacy. */
function candidatesFor(pathname) {
  const safe = normalize(pathname).split("..").join("");
  if (safe.endsWith("/")) return [join(root, safe, "index.html")];
  if (extname(safe)) return [join(root, safe)];
  return [join(root, safe + ".html"), join(root, safe, "index.html")];
}

async function firstThatExists(paths) {
  for (const p of paths) {
    try {
      return { body: await readFile(p), file: p };
    } catch {
      /* next candidate */
    }
  }
  return null;
}

/* ── Serve ───────────────────────────────────────────────────────────────── */

createServer(async (req, res) => {
  const url = new URL(req.url, "http://preview.invalid");
  const pathname = decodeURIComponent(url.pathname);

  const target = REDIRECTS[pathname.replace(/\/+$/, "") || "/"];
  if (target) {
    res.writeHead(301, { location: target });
    return res.end();
  }

  let found = await firstThatExists(candidatesFor(pathname));
  let status = 200;
  if (!found) {
    found = await firstThatExists([join(root, "404.html")]);
    status = 404;
    if (!found) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      return res.end("not found");
    }
  }

  const type = TYPES[extname(found.file).toLowerCase()] || "application/octet-stream";
  if (!type.startsWith("text/html")) {
    res.writeHead(status, { "content-type": type });
    return res.end(found.body);
  }

  /* What Netlify would have resolved. An explicit empty ?sim-country= means a
     visitor it could not place, which is the case worth being able to see. */
  const asked = url.searchParams.has("sim-country")
    ? url.searchParams.get("sim-country")
    : defaultCountry;
  const chosen = currencyForCountry(asked);
  const stamp = chosen && key ? await currencyStamp(key, chosen) : null;

  const headers = { "content-type": type, vary: "x-nf-country" };
  if (stamp) headers["cache-control"] = "no-store";
  res.writeHead(status, headers);
  res.end(withCurrencyAttribute(found.body.toString("utf8"), chosen, stamp));
}).listen(port, host, () => {
  const shown = host === "0.0.0.0" ? "every interface" : "127.0.0.1";
  console.log(`  preview with the edge function on port ${port}, bound to ${shown}`);
  console.log(`  serving   ${root}`);
  console.log(`  country   ${defaultCountry}, override per request with ?sim-country=XX`);
  console.log(`  signing   ${key ? "key loaded, links are signed" : "no key, links unsigned"}`);
});
