type Payload = {
  tag?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  kids?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

const ALLOWED_TAGS = new Set([
  "waitlist-hidden-report-card",
  "waitlist-elite-learning-leaders",
  "applied-inner-circle",
  // EU right of withdrawal (/withdraw). A member is already a contact, so a
  // duplicate must not be treated as done: the tag is added to the existing
  // contact below. The confirmation email is sent by the GoHighLevel workflow
  // triggered by this tag.
  "withdrawal-request",
]);

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const STUDENT_NOTES_FIELD_ID = "QUrGhz59gCPbU9gVa0MY";

/**
 * WHY A PROVIDER'S RESPONSE IS NEVER LOGGED.
 *
 * Her instruction, 6 November 2026: "Corrige les journaux des formulaires pour
 * conserver les codes d'erreur utiles au diagnostic et retirer les reponses
 * brutes des fournisseurs."
 *
 * A provider's error body can quote the request back, so a duplicate contact
 * or a rejected subscriber could put somebody's email address into a Netlify
 * function log. Nothing in the form is meant to be logged, and a log is a
 * place nobody remembers to delete from.
 *
 * So the body is still read, because the code needs it to tell a duplicate
 * from a real failure, and it is never printed. What gets logged is the HTTP
 * status and one word from the fixed list below. Every value this can return
 * is written here as a literal; no part of the body reaches the log.
 */
type Reason =
  | "auth"
  | "not_found"
  | "duplicate"
  | "unprocessable"
  | "rate_limited"
  | "provider_error"
  | "rejected";

function classify(status: number, body: string): Reason {
  if (/duplicat/i.test(body)) return "duplicate";
  if (status === 401 || status === 403) return "auth";
  if (status === 404) return "not_found";
  if (status === 422) return "unprocessable";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "provider_error";
  return "rejected";
}

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error("Missing GHL_API_TOKEN or GHL_LOCATION_ID env var");
    return json(500, { error: "Server not configured" });
  }

  let payload: Payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const firstName = (payload.firstName || "").trim();
  const lastName = (payload.lastName || "").trim();
  const email = (payload.email || "").trim().toLowerCase();
  const phone = (payload.phone || "").trim();
  const kids = (payload.kids || "").trim();
  const city = (payload.city || "").trim();
  const state = (payload.state || "").trim();
  const postalCode = (payload.postalCode || "").trim();
  const tag = (payload.tag || "").trim();

  if (!firstName) return json(400, { error: "First name is required" });
  if (!lastName) return json(400, { error: "Last name is required" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: "Valid email is required" });
  if (!ALLOWED_TAGS.has(tag)) return json(400, { error: "Invalid tag" });

  const contactBody: Record<string, unknown> = {
    firstName,
    lastName,
    email,
    phone: phone || undefined,
    city: city || undefined,
    state: state || undefined,
    postalCode: postalCode || undefined,
    locationId,
    tags: [tag],
    source: "truermeasure.com",
  };
  if (kids) {
    contactBody.customFields = [{ id: STUDENT_NOTES_FIELD_ID, value: kids }];
  }

  const contactRes = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(contactBody),
  });

  const contactText = await contactRes.text();
  if (!contactRes.ok) {
    console.error("GHL contact create failed", contactRes.status, classify(contactRes.status, contactText));
    if (contactRes.status === 400 && /duplicat/i.test(contactText)) {
      if (tag !== "withdrawal-request") return json(200, { ok: true, duplicate: true });
      // Tag the existing contact; if that is not possible, fail loudly so the
      // member is told to email instead of believing the withdrawal was sent.
      let contactId: string | undefined;
      try {
        contactId = JSON.parse(contactText)?.meta?.contactId;
      } catch {
        contactId = undefined;
      }
      if (!contactId) return json(502, { error: "Could not record your withdrawal." });
      const tagRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Version: GHL_VERSION,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ tags: [tag] }),
      });
      if (!tagRes.ok) {
        const tagText = await tagRes.text();
        console.error("GHL tag add failed", tagRes.status, classify(tagRes.status, tagText));
        return json(502, { error: "Could not record your withdrawal." });
      }
      return json(200, { ok: true, existing: true });
    }
    return json(502, { error: "Could not save your details. Please try again." });
  }

  return json(200, { ok: true });
};
