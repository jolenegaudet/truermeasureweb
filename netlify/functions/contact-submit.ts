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
]);

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

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

  const contactBody = {
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
    console.error("GHL contact create failed", contactRes.status, contactText);
    if (contactRes.status === 400 && /duplicat/i.test(contactText)) {
      return json(200, { ok: true, duplicate: true });
    }
    return json(502, { error: "Could not save your details. Please try again." });
  }

  let contactId: string | undefined;
  try {
    const parsed = JSON.parse(contactText);
    contactId = parsed?.contact?.id || parsed?.id;
  } catch {}

  if (contactId && kids) {
    const noteRes = await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ body: `Student Notes:\n${kids}` }),
    });
    if (!noteRes.ok) {
      console.error("GHL note create failed", noteRes.status, await noteRes.text());
    }
  }

  return json(200, { ok: true });
};
