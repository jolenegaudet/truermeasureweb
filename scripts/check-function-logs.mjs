/**
 * Proves that a form failure cannot put an email address in a Netlify log.
 *
 *   node scripts/check-function-logs.mjs
 *
 * WHY. The two form functions have to read a provider's error response, because
 * that is how they tell a duplicate contact from a real failure. Until
 * 6 November 2026 they also printed it, which meant a duplicate signup or a
 * rejected subscriber could leave somebody's address in a function log. Her
 * instruction that day: keep the error codes that help diagnosis, drop the raw
 * provider responses, and prove with a fictitious address that neither a
 * duplicate nor a refusal leaves an address behind.
 *
 * HOW. The handlers are imported and run for real. Only two things are
 * standing in: `fetch`, which answers with the provider error bodies worth
 * worrying about, and the console, which is captured instead of printed. Every
 * provider body here quotes the address back, the way a real one does. The test
 * passes only if the address appears nowhere in what was logged, and if the
 * status and a reason word still do, because a log that says nothing is not the
 * goal.
 *
 * Nothing is sent anywhere. No provider is contacted, no account is touched,
 * and the credentials are obvious fakes created in this process. The address is
 * at .invalid, a top-level domain reserved so it can never belong to anyone.
 */
import { pathToFileURL } from "node:url";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");

/* A fictitious address. ".invalid" is reserved by RFC 2606, so this can never
   reach a person, and it is distinctive enough to find in any output. */
const GHOST = "ghost.tester@example.invalid";

/* The fakes live only in this process. Neither is a credential. */
process.env.GHL_API_TOKEN = "test-token-not-a-credential";
process.env.GHL_LOCATION_ID = "test-location";
process.env.KIT_API_KEY = "test-key-not-a-credential";

let instance = 0;
async function freshHandler(file) {
  // Each scenario gets its own module instance, because both functions cache
  // account-level lookups at module scope.
  const url = pathToFileURL(join(REPO, "netlify", "functions", file)).href;
  const mod = await import(`${url}?case=${++instance}`);
  return mod.handler;
}

/** Runs one handler with a scripted `fetch` and a captured console. */
async function run({ file, body, replies }) {
  const logged = [];
  const realFetch = globalThis.fetch;
  const realError = console.error;
  const realWarn = console.warn;
  const realLog = console.log;

  const capture = (...args) =>
    logged.push(
      args
        .map((a) => {
          if (typeof a === "string") return a;
          try {
            return JSON.stringify(a);
          } catch {
            return String(a);
          }
        })
        .join(" "),
    );

  let calls = 0;
  globalThis.fetch = async (input) => {
    const url = String(input instanceof URL ? input.href : input?.url || input);
    const reply = replies(url, calls++);
    return new Response(reply.body, {
      status: reply.status,
      headers: { "content-type": "application/json" },
    });
  };
  console.error = capture;
  console.warn = capture;
  console.log = capture;

  try {
    const handler = await freshHandler(file);
    const response = await handler({ httpMethod: "POST", body: JSON.stringify(body) });
    return { logged, response };
  } finally {
    globalThis.fetch = realFetch;
    console.error = realError;
    console.warn = realWarn;
    console.log = realLog;
  }
}

/* ── The provider responses that quote the address back ──────────────────── */

const ghlDuplicate = JSON.stringify({
  message: `This location does not allow duplicated contacts. ${GHOST} already exists.`,
  meta: { contactId: "abc123", matchingField: "email", email: GHOST },
});
const ghlRejected = JSON.stringify({
  message: `Invalid email address: ${GHOST}`,
  errors: [{ field: "email", value: GHOST }],
});
const kitRejected = JSON.stringify({
  errors: [`email_address ${GHOST} is not allowed`],
});
const kitServerError = JSON.stringify({
  error: `could not tag subscriber ${GHOST}`,
});
const ghlServerError = JSON.stringify({ message: `Upstream failure for ${GHOST}` });

const WAITLIST = {
  tag: "waitlist-hidden-report-card",
  firstName: "Ghost",
  lastName: "Tester",
  email: GHOST,
  phone: "555-0100",
  kids: "Two kids, ages 7 and 10",
  city: "Moncton",
  state: "NB",
  postalCode: "E1C",
};

const SCENARIOS = [
  {
    name: "waitlist form, duplicate contact",
    file: "contact-submit.ts",
    body: WAITLIST,
    replies: () => ({ status: 400, body: ghlDuplicate }),
    expect: ["400", "duplicate"],
  },
  {
    name: "waitlist form, contact refused",
    file: "contact-submit.ts",
    body: WAITLIST,
    replies: () => ({ status: 422, body: ghlRejected }),
    expect: ["422", "unprocessable"],
  },
  {
    name: "withdrawal form, duplicate then tagging fails",
    file: "contact-submit.ts",
    body: { tag: "withdrawal-request", firstName: "Ghost", lastName: "Tester", email: GHOST },
    replies: (url) =>
      url.endsWith("/tags")
        ? { status: 500, body: ghlServerError }
        : { status: 400, body: ghlDuplicate },
    expect: ["500", "provider_error"],
  },
  {
    name: "email list, subscriber refused",
    file: "kit-subscribe.ts",
    body: { email: GHOST, place: "home-card", locale: "fr" },
    replies: (url) =>
      url.includes("/subscribers")
        ? { status: 422, body: kitRejected }
        : { status: 200, body: JSON.stringify({ tags: [{ id: 7, name: "Truer Measure – First to Know" }] }) },
    expect: ["422", "unprocessable"],
  },
  {
    name: "email list, tagging fails after the subscriber exists",
    file: "kit-subscribe.ts",
    body: { email: GHOST, place: "hidden-report-card", locale: "en" },
    replies: (url) => {
      if (url.includes("/tags/") && url.includes("/subscribers")) {
        return { status: 500, body: kitServerError };
      }
      if (url.includes("/subscribers")) return { status: 201, body: JSON.stringify({ subscriber: {} }) };
      if (url.includes("custom_fields")) return { status: 200, body: JSON.stringify({ custom_fields: [] }) };
      return { status: 200, body: JSON.stringify({ tags: [{ id: 7, name: "Truer Measure – First to Know" }] }) };
    },
    expect: ["500", "provider_error"],
  },
];

/* ── Run them ────────────────────────────────────────────────────────────── */

const LOCAL = GHOST.split("@")[0];
let failures = 0;

console.log("");
console.log(`  Fictitious address: ${GHOST}`);
console.log("  No provider is contacted. Nothing is sent anywhere.");
console.log("");

for (const scenario of SCENARIOS) {
  const { logged } = await run(scenario);
  const text = logged.join("\n");

  const leaked = logged.filter(
    (line) => line.includes(GHOST) || line.includes(LOCAL) || line.includes("example.invalid"),
  );
  const missing = scenario.expect.filter((token) => !text.includes(token));

  if (leaked.length) {
    failures++;
    console.log(`  LEAKED  ${scenario.name}`);
    for (const line of leaked) console.log(`            ${line}`);
  } else if (missing.length) {
    failures++;
    console.log(`  BLIND   ${scenario.name}`);
    console.log(`            logged nothing matching ${missing.join(", ")}`);
    console.log(`            what was logged: ${text || "(nothing at all)"}`);
  } else {
    console.log(`  clean   ${scenario.name}`);
    for (const line of logged) console.log(`            ${line}`);
  }
}

console.log("");
if (failures) {
  console.error(`  ${failures} of ${SCENARIOS.length} scenarios failed.`);
  console.error("  A form failure must log a status and a reason, and never an address.");
  console.error("");
  process.exit(1);
}
console.log(`  ${SCENARIOS.length} scenarios: a status and a reason logged, no address anywhere.`);
console.log("");
