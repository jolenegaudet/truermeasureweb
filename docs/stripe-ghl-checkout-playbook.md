# Capture-then-Stripe-Checkout (with GoHighLevel) — Implementation Playbook

**For:** a Claude Code session implementing a "collect the lead, then send them to Stripe Checkout, and reconcile the payment back to GoHighLevel" payment flow.
**How to use:** drop this file in the target repo (e.g. `docs/`), then tell Claude Code:
> "Read `docs/stripe-ghl-checkout-playbook.md`. Confirm my stack and the Section 1 inputs, then implement Sections 3–5 for my codebase, TDD the pure pieces, and run the Section 6 checklist in Stripe **test mode** before anything touches live keys."

This playbook is **stack-portable** (the contract in Sections 2–6 holds for any framework). Section 8 is a verbatim-liftable reference for **Next.js (App Router) + Azure Functions**. If your stack differs, keep the contract and regenerate the code.

---

## 0. What you are building

```
Buyer fills a short form (name, email, cell)
        │
        ▼   POST /api/checkout  { itemSlug, contact… }   ← NO price/amount in the body
   ┌─────────────────────────────────────────────┐
   │ SERVER                                        │
   │  1. validate                                  │
   │  2. resolve item NAME + PRICE from the slug   │  ← server-authoritative
   │  3. upsert GHL contact (BEST EFFORT)          │  ← fail OPEN
   │  4. create Stripe Checkout Session            │  ← fail CLOSED
   │     → returns { url }                         │
   └─────────────────────────────────────────────┘
        │
        ▼   browser redirects SAME TAB to Stripe
   Stripe hosted checkout (shows item + prefilled email)
        │                         │
   success_url ?paid=1       cancel_url ?talk=1
        │
        ▼
   GHL's native Stripe integration reconciles the *paid* order
   to the contact by email (after the fact — no webhook needed)
```

The web app never sees a card number and never decides a price. GHL and Stripe are the systems of record; your code is the honest broker in the middle.

---

## 1. Gather these BEFORE writing code

**Stripe**
- Secret key — **test** (`sk_test_…`) and **live** (`sk_live_…`). They are different; wire test first.
- One **Product + Price** per purchasable item. You need the **Price ID** (`price_…`), *not* the Product ID (`prod_…`). ⚠️ A `prod_…` in a price field 400s **every** checkout. Get it from the product's price row in the dashboard, or `stripe prices list --product prod_…`.
- **Test-mode and live-mode Price IDs are different values.** Plan for per-environment config from the start.

**GoHighLevel (v2 / LeadConnector)**
- A **Private Integration Token** (`pit-…`) with **Contacts write** scope.
- The **Location ID**.
- Confirm GHL's **Stripe integration** is connected (this is what reconciles the paid order to the contact by email — it's why you don't need a webhook).

**Decide your config keys** (names are yours; this is the reference set):

| Var | Purpose | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe server key | test on staging, live on prod |
| `SITE_BASE_URL` | absolute base for return URLs | **per-env; NO production default** (see §7) |
| `GHL_API_TOKEN` | GHL PIT | secret |
| `GHL_LOCATION_ID` | GHL location | |
| `PRICE_<ITEM>` | one Stripe Price ID per item | e.g. `PRICE_SUMMER_B`; test vs live differ |

---

## 2. The one non-negotiable rule

> **Price is server-authoritative. The browser sends an item slug, never a price, price ID, or amount.**

If the amount can ride in the request, someone edits the request and buys your $4,800 product for $1. Everything in Section 3 exists to enforce this. Make it the first thing you test (§6).

A second, quieter rule rides along: **identity is server-authoritative too.** Resolve the item's display *name* from the slug on the server; don't trust a client-supplied name, or an attacker labels their own Stripe receipt / CRM record with whatever they like.

---

## 3. Backend — the checkout endpoint

**Contract:** `POST /api/checkout`
- **Body:** `{ itemSlug, firstName, lastName, email, phone, company?, smsConsent?, botToken? }` — and nothing price-shaped is ever read, even if sent.
- **Returns:** `200 { url }` on success; `4xx/5xx { error, code? }` otherwise.

**The ordered steps — EVERY gate must come BEFORE any side effect (GHL write or Stripe charge):**

1. Parse JSON → `400` on failure.
2. Validate body shape → `400`. Required: slug + name + email (regex) + phone. Ignore any `price`/`amount`/`name` fields entirely.
3. `503` if `STRIPE_SECRET_KEY` **or** `SITE_BASE_URL` is unset. (Fail loud — see §7.)
4. Resolve `name = registry[slug]`. Unknown slug → `400 { code:"not_open" }`. **Use an own-property-safe lookup** (`Object.hasOwn`), or a `Map` — a plain-object `obj[slug]` returns `Object.prototype` junk for slugs like `"constructor"`, `"__proto__"`, `"toString"` (truthy!), which sails past a downstream `if (!name)` guard.
5. Resolve `priceId = env["PRICE_" + SLUG]`. Missing → `400 { code:"not_open" }`.
6. Bot check (Turnstile/hCaptcha/etc.) if you have one → `403` on fail.
7. **GHL upsert — BEST EFFORT.** Wrap in `try/catch` that logs and **falls through**. A CRM outage must never block a sale. Tag the contact: `Item: {name}`, `Checkout Started`, and a consent tag only if `smsConsent`.
8. **Stripe session create — FAIL CLOSED.** Wrap in `try/catch` returning `500` with **no url**; also `500` if `session.url` is missing. Never return a `200` without a url; never leave the buyer on a dead-end redirect.

**Session params (the shape that keeps price authority):**

```ts
{
  mode: "payment",
  line_items: [{ price: priceId, quantity: 1 }],   // a REFERENCE — never price_data/unit_amount
  customer_email: email,                            // prefill so they don't retype
  metadata: { itemSlug, itemName: name },           // rides to GHL via the Stripe integration
  payment_intent_data: { description: `${name}` },
  success_url: `${baseUrl}/…/${itemSlug}?paid=1`,
  cancel_url:  `${baseUrl}/…/${itemSlug}?talk=1`,
}
```

**Reference handler (generic Node/TypeScript — adapt the request/response glue to your runtime):**

```ts
import Stripe from "stripe";

// Server-side item registry — the source of truth for names.
// Lives on the SERVER (see §7 deploy-boundary note), not in client content.
const ITEM_NAMES: Record<string, string> = { "summer-b": "Summer B", /* … */ };
function itemName(slug: string) {
  return Object.hasOwn(ITEM_NAMES, slug) ? ITEM_NAMES[slug] : undefined;
}
function priceId(slug: string) {
  const v = process.env[`PRICE_${slug.toUpperCase().replace(/-/g, "_")}`];
  return v && v.trim() ? v.trim() : undefined;
}

export async function handleCheckout(body: unknown) {
  if (!isValidBody(body)) return json(400, { error: "Invalid request" });

  const secret = process.env.STRIPE_SECRET_KEY;
  const base = process.env.SITE_BASE_URL;
  if (!secret || !base) return json(503, { error: "Checkout not configured" });   // fail loud

  const name = itemName(body.itemSlug);
  if (!name) return json(400, { error: "Unknown item", code: "not_open" });         // before any charge

  const price = priceId(body.itemSlug);
  if (!price) return json(400, { error: "Not open for checkout yet", code: "not_open" });

  // …bot check → 403…

  // GHL: BEST EFFORT — never blocks the sale.
  try {
    await ghlUpsert({
      email: body.email, firstName: body.firstName, lastName: body.lastName, phone: body.phone,
      tags: [`Item: ${name}`, "Checkout Started", ...(body.smsConsent ? ["SMS Consent"] : [])],
    });
  } catch (e) { logError("ghl_failed", e); /* fall through */ }

  // Stripe: FAIL CLOSED — no dead-end redirect.
  try {
    const stripe = new Stripe(secret);   // no apiVersion → uses account default
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      customer_email: body.email,
      metadata: { itemSlug: body.itemSlug, itemName: name },
      payment_intent_data: { description: name },
      success_url: `${base}/checkout/${body.itemSlug}?paid=1`,
      cancel_url: `${base}/checkout/${body.itemSlug}?talk=1`,
    });
    if (!session.url) throw new Error("no session url");
    return json(200, { url: session.url });
  } catch (e) {
    logError("stripe_failed", e);
    return json(500, { error: "Could not start checkout. Please try again." });
  }
}
```

**GHL upsert** is a plain `POST https://services.leadconnectorhq.com/contacts/upsert` with header `Version: 2021-07-28`, `Authorization: Bearer <pit>`, body `{ locationId, email, firstName, lastName, phone, tags, source }`. Upsert-by-email so a repeat buyer isn't duplicated. Throw on non-2xx so the best-effort `catch` actually catches.

**TDD the pure pieces** (they're where the bugs hide, and they need no network): the body validator, `itemName`/`priceId` resolvers (include a `"constructor"`/`"__proto__"` → undefined test), and a pure `buildSessionParams()` builder with an assertion that its JSON contains **no** `price_data`/`unit_amount`. The HTTP handler itself is verified by the §6 manual checklist.

---

## 4. Frontend — capture → redirect → return

**On submit:**
1. Client-validate required fields (esp. phone).
2. **Stash the contact in `sessionStorage`** (it survives the round-trip to Stripe and back; React state does not).
3. `POST /api/checkout`.
4. On `res.ok && url`: `window.location.href = url` — **same-tab navigation.** ⚠️ Do **not** `window.open` after an `await`; it's outside the trusted user gesture and browsers popup-block it. Same-tab redirect is never blocked, so you don't need an intermediate "Pay" button.
5. **Fail closed on the client too:** only redirect when you actually got a url; otherwise show the error. If `code === "not_open"`, degrade to a helpful message / alternate path instead of a raw error.

**On return:**
- `?paid=1`: show a **non-committal** thank-you. ⚠️ Without a webhook, `?paid=1` is just a URL anyone can visit — it is **not** proof of payment. Do **not** say "Payment received"; say "Thanks — here's your next step." Offer the next action (e.g. book a call) **prefilled from the sessionStorage stash** (best-effort — if the stash was evicted, open it unprefilled but functional).
- `?cancel`/`?talk=1`: surface an alternate path ("not ready? talk to us") so a bailed checkout isn't a dead end.

If your framework's linter forbids `set-state-in-effect` (e.g. this project's does), **read the return flag during render** behind a hydration gate, not in a `useEffect` that calls `setState`.

---

## 5. GHL owner-side work (outside the code — but the flow is broken without it)

These are console/automation tasks for whoever owns the GHL account:

1. **Reconcile paid orders → tag the contact.** Build a GHL automation: on a Stripe **payment** event, apply `Item: {metadata.itemName}` to the contact (matched by email). **This closes the fail-open gap:** if GHL was down during the pre-checkout capture but the payment then succeeds, the contact would otherwise land untagged. The item rides in the Stripe session `metadata`/`description` for exactly this.
2. **Nurture / re-engagement sequence** off the `Checkout Started` tag — that tag marks "started but check whether they finished." GHL can subtract (`Checkout Started` AND no order → work them).
3. **TCPA / SMS consent** (if you collect it): marketing-text consent **must not be a condition of purchase** — don't gate the buy button on it. Disclose that message/data rates apply and that consent isn't required to buy. **Have counsel review the wording.**

---

## 6. Verification checklist — run in Stripe TEST mode first

- [ ] **Happy path:** form → Stripe shows the item name + prefilled email → pay with test card `4242 4242 4242 4242` → returns to `?paid=1` → GHL contact has `Item: {name}` + `Checkout Started`.
- [ ] **Price authority:** resend the POST with injected `"amount": 1`, `"price": "price_evil"`, `"itemName": "FREE"` → the session still charges the real price and the description/tag show the **server-resolved** name. (This is the test that matters most.)
- [ ] **Unknown item:** POST an unknown `itemSlug` → `400`, **no** Stripe session, **no** GHL write.
- [ ] **Capture fails open:** break the GHL token → checkout still redirects to Stripe (the sale is not blocked).
- [ ] **Checkout fails closed:** break the Stripe key mid-flow → the form shows an error and does **not** redirect anywhere.
- [ ] **Config fails loud:** unset `SITE_BASE_URL` → `503`, not a redirect to the prod domain.
- [ ] **Consent non-gating:** leave the SMS box unchecked → the buy button is still reachable.
- [ ] **Return prefill:** after paying, the next-step (booking) form is prefilled from the stash.

Only after all pass in test mode: swap in live keys + live Price IDs, and re-run the happy path once.

---

## 7. Gotchas that WILL bite (the expensive lessons)

- **`price_` vs `prod_`.** A Product ID where a Price ID is expected 400s every checkout. Store `price_…`.
- **Test vs live Price IDs differ.** Don't commit them — put them in per-environment config/env vars.
- **Deploy boundary.** If your API deploys **separately** from your web content (e.g. serverless functions vs a static site), the API often can't import the site's item list. Keep the item registry (slug→name) **server-side**, and accept that "add an item" now touches: the web content, the server registry, and the price env var. Write that down so it doesn't drift; a missing registry entry silently drops attribution (or 400s the buy button).
- **Own-property-safe lookups.** `obj["constructor"]` is truthy. Use `Object.hasOwn` or a `Map` for the slug→name lookup.
- **Serverless ESM quirks** (if on Azure Functions / similar): relative imports need the `.js` suffix; keep validators side-effect-free in their own files; and make sure test files are **excluded from the deployed build** — a stray test import in the functions bundle can crash the host at startup.
- **`?paid` is unverified without a webhook.** Keep the copy honest ("Thanks", not "Payment received"). If you later need a hard confirmation, add `?session_id={CHECKOUT_SESSION_ID}` to `success_url` and verify it server-side with Stripe.
- **Popup blocker.** Redirect same-tab after the `await`; never `window.open`.
- **`set-state-in-effect`.** If your linter treats it as an error, read return-flags at render behind a hydration gate.
- **Fail-open vs fail-closed is deliberate and asymmetric.** Capture (GHL) fails open — the payment is load-bearing, the CRM write is not. Checkout (Stripe) fails closed — no url, no redirect. Don't "clean up" the asymmetry into a single try/catch.

---

## 8. Reference stack: Next.js (App Router, static export) + Azure Functions

If the target repo is this stack, the code lifts almost verbatim. File layout:

**API (`api/` — Azure Functions v4, ESM):**
- `src/lib/config.ts` — env loader; add `stripe.secretKey`, `site.baseUrl` (**empty default**, not a prod URL).
- `src/lib/items.ts` — committed `slug→name` registry + `itemName(slug)` (Object.hasOwn).
- `src/lib/prices.ts` — `priceId(slug)` from `PRICE_<SLUG>` env.
- `src/lib/checkout-params.ts` — pure `buildCheckoutParams(args): Stripe.Checkout.SessionCreateParams`.
- `src/functions/checkout.validation.ts` — side-effect-free `isCheckoutBody` (no `app.http` import).
- `src/functions/checkout.ts` — the `app.http` handler (Section 3 ordering).
- Tests (`*.test.ts`, Vitest) for the four pure units; ensure `tsconfig.json` excludes `**/*.test.ts` from the build.

**Frontend (`app/…`):**
- A `useCheckoutReturn()` hook: reads `?paid`/`?cancel` **during render** behind a `useHydrated()` (`useSyncExternalStore`) gate; plus `stashContact`/`readContact`/`clearContact` sessionStorage helpers (contact fields only).
- A `Checkout` client component: the capture form → `POST /api/checkout` → stash → `window.location.href = url`; degrades on `code:"not_open"`.
- A `Paid` component on `?paid=1`: non-committal thanks + the next action, rehydrated from the stash.

**Env vars on each environment** (staging vs prod are separate): `STRIPE_SECRET_KEY`, `SITE_BASE_URL`, `GHL_API_TOKEN`, `GHL_LOCATION_ID`, `PRICE_<ITEM>` (test IDs on staging, live IDs on prod).

**Build the pure units test-first; verify the handler and components with the Section 6 checklist against `swa start` in Stripe test mode.**

---

## 9. Suggested build order (for the implementing Claude Code)

1. Config + item registry + price resolver + session-param builder — **TDD, all pure.**
2. Request validator — **TDD.**
3. Checkout handler — wire 1+2 + GHL + Stripe; verify by build + checklist.
4. GHL upsert client (if not already present).
5. Frontend: return hook + stash → capture form → paid panel.
6. Run the Section 6 checklist in Stripe **test mode**.
7. Owner does Section 5 in GHL; then swap to live keys and smoke-test once.

Do **not** ship to production until Section 5 (the GHL automations) exists and Section 6 passes on live keys — otherwise you're taking real money with broken attribution.
