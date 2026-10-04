/**
 * "Be the first to know" → a subscriber in Kit, tagged.
 *
 * This runs on the server because the Kit API key must never reach a browser.
 * The site is a static export (next.config.ts, output: "export"), so there are
 * no Next route handlers; a Netlify function is how the other form on this site
 * already works. See netlify/functions/contact-submit.ts, which does the same
 * job for GoHighLevel.
 *
 * Why two calls to Kit:
 *   POST /v4/subscribers            upserts by email. 201 new, 200 already
 *                                   there. Kit does not let this endpoint
 *                                   change an existing subscriber's state, so
 *                                   someone who unsubscribed stays
 *                                   unsubscribed. That is the behaviour we
 *                                   want and the reason we do not send a state.
 *   POST /v4/tags/{id}/subscribers  applies the tag. 201 applied, 200 already
 *                                   had it. Kit requires the subscriber to
 *                                   exist first, hence the order.
 *
 * Nothing here deletes, unsubscribes or overwrites anything in Kit.
 */

const KIT = "https://api.kit.com/v4";

// Spelled in content/first-to-know.ts so the copy and the record cannot drift.
// Duplicated as literals because a Netlify function is bundled separately from
// the app and cannot import from "@/content".
const TAG_NAME = "Truer Measure – First to Know";
const FIELD_SOURCE = "TM signup source";
const FIELD_CONSENT = "TM consent";
const SIGNUP_SOURCE = "hidden-report-card:be-first-to-know";
const CONSENT_PURPOSE = "launch news and occasional product updates";

const ALLOWED_PLACES = new Set(["home-card", "hidden-report-card"]);
const ALLOWED_LOCALES = new Set(["en", "fr"]);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Compares two tag names tolerantly, because the name can reach Kit by more
 * than one route. Kit itself preserves the en dash, but PowerShell 5.1 sends
 * a body in a non-UTF-8 encoding unless handed bytes, which is how this tag
 * was first created with an ASCII hyphen instead; and the name can be edited
 * by hand in Kit's UI. Matching byte for byte would miss the tag that exists
 * and create a second one on every cold start, splitting the list in two.
 * Dashes, case and runs of whitespace are normalised on both sides.
 */
const sameTag = (a: string, b: string) => {
  const norm = (v: string) =>
    v.trim().toLowerCase().replace(/[‐-―]/g, "-").replace(/\s+/g, " ");
  return norm(a) === norm(b);
};

/** The client holds the wording, in the reader's language. This is a code. */
type ErrorCode = "method" | "bad_request" | "invalid_email" | "not_configured" | "upstream";

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const fail = (status: number, error: ErrorCode) => json(status, { error });

type Headers = Record<string, string>;

const kitHeaders = (key: string): Headers => ({
  "X-Kit-Api-Key": key,
  "Content-Type": "application/json",
  Accept: "application/json",
});

/**
 * Resolved once per warm container. The tag and the fields are account-level
 * objects that do not change, so re-reading them on every signup would spend
 * three extra round trips to learn the same two numbers.
 */
let cachedTagId: number | null = null;
let cachedFieldKeys: string[] | null = null;

/** Finds the tag by name, creating it if this is the first signup. */
async function resolveTagId(key: string): Promise<number | null> {
  if (cachedTagId !== null) return cachedTagId;

  const fromEnv = Number(process.env.KIT_TAG_ID);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    cachedTagId = fromEnv;
    return cachedTagId;
  }

  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const url = new URL(`${KIT}/tags`);
    url.searchParams.set("per_page", "500");
    if (after) url.searchParams.set("after", after);
    const res = await fetch(url, { headers: kitHeaders(key) });
    if (!res.ok) {
      console.error("Kit list tags failed", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      tags?: { id: number; name: string }[];
      pagination?: { has_next_page?: boolean; end_cursor?: string };
    };
    const hit = data.tags?.find((t) => sameTag(t.name, TAG_NAME));
    if (hit) {
      cachedTagId = hit.id;
      return cachedTagId;
    }
    if (!data.pagination?.has_next_page || !data.pagination.end_cursor) break;
    after = data.pagination.end_cursor;
  }

  const created = await fetch(`${KIT}/tags`, {
    method: "POST",
    headers: kitHeaders(key),
    body: JSON.stringify({ name: TAG_NAME }),
  });
  if (!created.ok) {
    console.error("Kit create tag failed", created.status, await created.text());
    return null;
  }
  const body = (await created.json()) as { tag?: { id: number } };
  cachedTagId = body.tag?.id ?? null;
  return cachedTagId;
}

/**
 * Makes sure the two consent fields exist, and reports which keys are usable.
 * Sending an unknown field key to Kit is a 422, which would turn a missing
 * bookkeeping field into a failed signup. So this never throws: if the fields
 * cannot be set up, the signup proceeds with the tag alone.
 */
async function resolveFieldKeys(key: string): Promise<string[]> {
  if (cachedFieldKeys !== null) return cachedFieldKeys;

  const existing = new Map<string, string>();
  try {
    const res = await fetch(`${KIT}/custom_fields?per_page=500`, {
      headers: kitHeaders(key),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        custom_fields?: { key: string; label: string }[];
      };
      for (const f of data.custom_fields ?? []) {
        existing.set(f.label.trim().toLowerCase(), f.key);
      }
    } else {
      console.error("Kit list custom fields failed", res.status);
    }
  } catch (e) {
    console.error("Kit list custom fields threw", e);
  }

  const keys: string[] = [];
  for (const label of [FIELD_SOURCE, FIELD_CONSENT]) {
    const found = existing.get(label.toLowerCase());
    if (found) {
      keys.push(found);
      continue;
    }
    try {
      const res = await fetch(`${KIT}/custom_fields`, {
        method: "POST",
        headers: kitHeaders(key),
        body: JSON.stringify({ label }),
      });
      if (res.ok) {
        const body = (await res.json()) as { custom_field?: { key: string } };
        if (body.custom_field?.key) keys.push(body.custom_field.key);
      } else {
        console.error("Kit create custom field failed", label, res.status);
      }
    } catch (e) {
      console.error("Kit create custom field threw", label, e);
    }
  }

  cachedFieldKeys = keys;
  return keys;
}

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod !== "POST") return fail(405, "method");

  const key = process.env.KIT_API_KEY;
  if (!key) {
    console.error("Missing KIT_API_KEY env var");
    return fail(500, "not_configured");
  }

  let payload: { email?: string; place?: string; locale?: string };
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return fail(400, "bad_request");
  }

  const email = (payload.email || "").trim().toLowerCase();
  const place = (payload.place || "").trim();
  const locale = (payload.locale || "en").trim();

  if (!EMAIL.test(email)) return fail(400, "invalid_email");
  if (!ALLOWED_PLACES.has(place)) return fail(400, "bad_request");
  if (!ALLOWED_LOCALES.has(locale)) return fail(400, "bad_request");

  const tagId = await resolveTagId(key);
  if (tagId === null) return fail(502, "upstream");

  // Upsert, with no fields on this call. Kit's create endpoint updates an
  // existing subscriber, so sending the source here would overwrite the page
  // someone first came from with the page they came from most recently. The
  // origin is the thing worth keeping, so the fields are written only when
  // this call reports a new subscriber.
  //
  // No "state" is sent either, which Kit does not allow on an update anyway:
  // anyone who unsubscribed stays unsubscribed.
  const subRes = await fetch(`${KIT}/subscribers`, {
    method: "POST",
    headers: kitHeaders(key),
    body: JSON.stringify({ email_address: email }),
  });
  if (!subRes.ok) {
    console.error("Kit subscriber upsert failed", subRes.status, await subRes.text());
    return fail(502, "upstream");
  }
  // 200 means Kit already had this address; 201 means it is new.
  const duplicate = subRes.status === 200;

  // The consent record, written once, on the first opt-in only. A failure here
  // must not fail the signup: the tag and Kit's own created_at still show that
  // the person opted in and when.
  if (!duplicate) {
    const fieldKeys = await resolveFieldKeys(key);
    const values = [
      `${SIGNUP_SOURCE} (${place}, ${locale})`,
      `${CONSENT_PURPOSE}, ${new Date().toISOString()}`,
    ];
    const fields: Record<string, string> = {};
    fieldKeys.forEach((k, i) => {
      if (values[i]) fields[k] = values[i];
    });
    if (Object.keys(fields).length > 0) {
      const fieldRes = await fetch(`${KIT}/subscribers`, {
        method: "POST",
        headers: kitHeaders(key),
        body: JSON.stringify({ email_address: email, fields }),
      });
      if (!fieldRes.ok) {
        console.error("Kit consent fields not written", fieldRes.status, await fieldRes.text());
      }
    }
  }

  const tagRes = await fetch(`${KIT}/tags/${tagId}/subscribers`, {
    method: "POST",
    headers: kitHeaders(key),
    body: JSON.stringify({ email_address: email }),
  });
  if (!tagRes.ok) {
    console.error("Kit tag apply failed", tagRes.status, await tagRes.text());
    return fail(502, "upstream");
  }

  return json(200, { ok: true, duplicate });
};
