# Post-purchase email experience — setup runbook

Goal: after a successful Founding Family purchase, the customer gets exactly two
emails — the official payment receipt (Stripe) and a branded welcome email
(GoHighLevel) — and Jolene gets an internal purchase notification. Nothing else.

Payment flow today: truermeasure.com Tier 1 button → GHL payment link
`https://link.fastpaydirect.com/payment-link/6a4ffe14c981f3feae6e8524` →
product "Truer Measure - One Year Individual Subscription" ($597/yr) → Stripe
processes the charge.

---

## Part A — GoHighLevel welcome workflow

GHL → Automation → Workflows → Create Workflow → Start from Scratch.
Name it: `Founding Family - Welcome (post-purchase)`.

**1. Trigger:** "Payment Received"
- Filter: Payment status → Successful (or "Order Submitted" if using order forms)
- Filter: Product → **Truer Measure - One Year Individual Subscription**
  (this pins the workflow to the right checkout; if the product is later
  renamed to the family offer, re-check this filter)

**2. Action — Send Email:**
- From name: `Jolene from Truer Measure`
- From email: use the Truer Measure domain address once the dedicated sending
  domain is verified (Part C). Until then GHL falls back to its shared domain;
  fine for testing, switch before launch.
- Subject: `Welcome to Truer Measure`
- Body (plain, branded template optional):

  > Thank you for becoming one of Truer Measure's Founding Families.
  >
  > Your purchase has been received, and we're grateful you've chosen to trust
  > us with your child's learning journey.
  >
  > We'll personally reach out within three business days with your next steps
  > and everything you need to get started.
  >
  > We're looking forward to working with you.
  >
  > — Jolene

**3. Action — Internal notification:** add a second action "Send Internal
Notification" (type: Email) → to `jolenegaudet22@gmail.com` → subject
`New Founding Family purchase: {{contact.name}}` → include
`{{contact.email}}`, `{{contact.phone}}`, amount if available.
(An in-app/mobile-push notification can be added as a third action if wanted.)

**4. Workflow settings:** Allow re-entry = OFF (one welcome per contact).
Save, keep in **Draft** until the test in Part D passes, then Publish.

## Part B — Stripe receipt (and only the receipt)

Who sends the receipt depends on two toggles — check both so the customer gets
exactly one receipt and zero other emails:

1. **GHL side:** Payments → Settings → Receipts. If GHL's own receipts are ON,
   decide which receipt to keep. Recommendation: turn GHL receipts OFF and let
   Stripe send the official one (matches "Stripe sends the official payment
   receipt only").
2. **Stripe side:** Stripe Dashboard → Settings → Emails → turn ON "Successful
   payments". Branding (logo, color) under Settings → Branding: set the name to
   Truer Measure.
3. **Receipt message:** Stripe receipts support only limited custom text
   (business name, support details); they do not take a free-form body on card
   receipts. The requested message —
   "Thank you for your purchase with Truer Measure. Please find your receipt
   attached for your records. We're looking forward to working with you." —
   fits Stripe's *invoice* footer/memo (Settings → Invoice template → footer)
   if the subscription bills via invoices. If the receipt turns out to be a
   plain card receipt with no message slot, the fallback is GHL's receipt with
   this text as its description, and Stripe emails off. Confirm which case
   applies during the Part D test.

Also make sure no OTHER Stripe emails are on (refund/dispute emails can stay;
"emails about upcoming renewals" is a separate choice for later).

## Part C — Sender domain (Truer Measure email)

GHL → Settings → Email Services → Dedicated Domain → add
`mail.truermeasure.com`. GHL will show DNS records (CNAME/TXT).
**The DNS step is automatable:** truermeasure.com DNS is managed at Netlify —
Claude can add the records via the Netlify API; paste the records into the chat
when GHL shows them. After verification, set the workflow's From email to
something like `jolene@mail.truermeasure.com` (or `hello@`).

## Part D — Test before going live

1. Put the GHL payment integration in **test mode** (Payments → Integrations →
   Stripe → test mode), or create a duplicate test payment link.
2. Buy through the real page flow: truermeasure.com → Tier 1 button → complete
   checkout with Stripe test card `4242 4242 4242 4242`, any future expiry/CVC.
3. Verify, in one pass:
   - [ ] Stripe receipt arrives, branded Truer Measure, correct message
   - [ ] Exactly one welcome email arrives, from "Jolene from Truer Measure",
         subject "Welcome to Truer Measure", body matches Part A verbatim
   - [ ] Internal notification arrives at jolenegaudet22@gmail.com
   - [ ] No duplicate/receipt emails from GHL (unless chosen in Part B)
   - [ ] Contact created in GHL with the purchase recorded
4. Switch Stripe/GHL back to live mode, Publish the workflow.
5. Optional gold check: first real purchase (or a $1 live test refunded after)
   confirms live-mode parity.

## Requirements coverage

| Requirement | Where |
|---|---|
| Stripe sends receipt only | Part B (toggles both sides) |
| GHL sends branded welcome | Part A step 2 |
| Trigger only on successful payment | Part A step 1 filter |
| Connected to correct product/checkout | Part A step 1 product filter |
| Sender name "Jolene from Truer Measure" | Part A step 2 |
| Sender email on Truer Measure domain | Part C |
| Internal purchase notification | Part A step 3 |
| Tested before live | Part D |
