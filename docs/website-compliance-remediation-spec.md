# Website compliance & pricing remediation — implementation spec

**Version 2.0** · supersedes v1.0 of 11 August 2026 (same filename — v1 is in git history).
**For:** a Claude Code session working in the `truermeasure/web` repository.
**Verified against:** the live Stripe checkout and the `verify:pricing` findings recorded in
`app` commits `97ab95c` and `5d81590`, both 11 August 2026.

**Companion documents:**
`app/legal/{end-user-licence-agreement,terms-of-service,privacy-policy}.md`
`app/legal/{PRICING-AUDIT,LEGAL-NOTES-open-decisions,PRIVACY-NOTES}.md`
`app/scripts/verify-pricing.ts` · `app/scripts/checkout-currency-notice.ts`

**How to use:**

> Read `docs/website-compliance-remediation-spec.md`. Section 1 is already resolved — read it, do
> not re-ask. Confirm Section 2 with me, then implement tasks in priority order. Stop at every
> `DECISION:` marker. Do not invent price figures or legal copy.

---

## 0. What changed since v1

v1 listed six questions that could not be answered from the repository. **`verify:pricing`
answered them, and the answers are worse than the guesses.** Three findings are new and two of
them are more urgent than anything in v1.

| v1 status | Now |
|---|---|
| V1 currency — unknown | **RESOLVED: the price is USD.** 597.00 USD per year. A parent in Halifax reads "$597" and is charged roughly 820 CAD, and finds out from her card statement. |
| V3 FOUNDING40 — unverified | **RESOLVED: the site's promise cannot be delivered.** 40%-once and 20%-forever exist as two separate coupons. A promotion code carries exactly one. Half the public promise is broken by construction. |
| — | **NEW: `TEST100` is live, uncapped, and has been redeemed twice**, on an account holding three 100%-off coupons. |
| — | **NEW: six live payment links, not one.** Three sell Truer Measure simultaneously at 597 USD/yr, 500 USD once, and 100 USD once. |
| — | **NEW: the two one-time links charge and provision nothing.** `stripe-webhook.ts` requires a subscription reference before it provisions. A family pays and gets no account, with one log line as the only trace. |

**Good news, recorded so it isn't re-litigated:** `FOUNDING40` is capped at 40 redemptions with 0
used, so *"limited to our first 40 Founding Families"* is enforced by Stripe rather than merely
asserted. And the checkout product description now states the currency in words, in both
languages, via `app/scripts/checkout-currency-notice.ts`.

---

## 1. Resolved facts — use these, do not re-verify

| | Value | Source |
|---|---|---|
| Product | Truer Measure – Annual Membership | live checkout |
| **List price** | **597.00 USD per year** | `verify:pricing`, 2026-08-11 |
| Monthly equivalent | 49.75 USD | `verify:pricing` |
| Billing | Recurring, annual, in advance | live checkout |
| **Currency** | **USD — not CAD** | `verify:pricing` |
| Tax | Calculated at checkout from billing address | live checkout |
| `FOUNDING40` cap | 40 redemptions, 0 used | `verify:pricing` |
| 40% off first year | 358.20 USD | derived |
| 20% off renewals | 477.60 USD | derived |
| Live payment link | `https://buy.stripe.com/bJe5kC3Mpefza2L13Oe7m05` | `app/page.tsx:296` |

**Why Stripe shows a bare `$`:** Stripe qualifies the symbol only when the viewer's own currency
differs from the price's. An English-speaking Canadian viewer sees `$597.00`; a British viewer sees
`US$597.00`. Confirmed across four locales. **There is no account, payment-link, or API setting
that forces the currency code to display.** This is why the disclosure has to come from copy you
control — on the website, not only on the checkout.

---

## 2. Confirm before writing code

Only three items remain, and two are founder actions rather than blockers on you.

| # | Item | Note |
|---|---|---|
| C1 | **Has the amount itself changed since 2026-08-11?** The live checkout still reads 597.00 USD/year as of this writing. If a new price shipped, every figure in §5 needs replacing. | Ask. Do not assume. |
| C2 | **Which coupon does `FOUNDING40` actually carry — 40%-once or 20%-forever?** Stripe redacts the coupon nested inside a promotion code from a restricted key, so this needs a dashboard look. | Determines which copy branch in §5.1 ships. |
| C3 | Legal entity name, registered address, support and privacy email addresses. | Still placeholders in the legal documents. |

---

## 3. Repo facts you can rely on

Verified 11 August 2026.

**Stack:** Next.js 16.2.9 (App Router), React 19, Tailwind v4, TypeScript, MDX via `@next/mdx`.
**Build:** `output: "export"` — fully static. Netlify, `publish = "out"`.
**MDX routing is already enabled** — `pageExtensions` includes `md`/`mdx`, so `app/<route>/page.mdx`
is a route with no extra wiring. `mdx-components.tsx` supplies element styling.
**Analytics:** Plausible, in `app/layout.tsx` via `next/script`.
**Forms:** `netlify/functions/contact-submit.ts` → GoHighLevel.

```
app/layout.tsx                 Root layout. Plausible. Nav + Footer.
app/page.tsx                   Homepage, 472 lines. Tier card ~L266–302. Stripe href at L296.
app/learn/page.tsx             60 lines.
app/inner-circle/page.tsx      57 lines.
components/footer.tsx          17 lines. Branding only — NO links.
components/nav.tsx             Nav + French "coming soon" banner.
components/waitlist-button.tsx 245 lines. Modal form → Netlify function.
content/home.mdx               STALE — "$97". Not rendered by any route.
mdx-components.tsx             NO table/li/blockquote handlers yet.
netlify.toml                   Redirects; /* → 404 catch-all.
```

**Design tokens — do not invent new ones:**
`bark` `parchment` `blush` `ghost` `dusk` `rose` `rose-dark` `warm` `smoke` `muted` `faint`
`subdued` `charcoal` `border`. Fonts: `font-heading` (Cormorant Garamond), default sans (Hanken).

---

## 4. Tasks

**P0-FOUNDER** = not code; Jolène must act, and it should happen today.
**P0** = legal/financial exposure. **P1** = before next sale. **P2** = hygiene.

---

### F1 — Deactivate or cap `TEST100` · P0-FOUNDER · NOT CODE

`TEST100` is **active in live mode, has no redemption cap, and has already been redeemed twice.**
The account holds three coupons at 100% off. If `TEST100` carries one, it is an unlimited free
membership to anyone who guesses the word — and "TEST100" is a word people guess.

**Action:** in the Stripe dashboard, either deactivate the promotion code or set a redemption cap
of 0. Then check what the two existing redemptions were: if either is a real family rather than a
test, they hold a live subscription that has never been charged.

**Claude Code must not do this.** Deactivating a live promotion code is the founder's call.

---

### F2 — Audit the six live payment links · P0-FOUNDER · NOT CODE

Six live active payment links exist where one was assumed. **Three sell Truer Measure concurrently
at three different prices:** 597.00 USD/year, 500.00 USD once, and 100.00 USD once. The remaining
three are finished invoices from the previous consulting business.

**The two one-time links are worse than stale.** `stripe-webhook.ts` requires a subscription
reference before it provisions an account, so a family who pays through either one **is charged and
receives nothing** — one log line is the only trace. Anyone holding an older URL from an email, a
DM, or a screenshot can do this today.

**Action:** deactivate the two one-time Truer Measure links and the three legacy invoice links.
Keep only the annual membership link. Then search sent email, GHL workflows, and social posts for
the retired URLs.

**Claude Code must not do this**, and must not remove the surviving link from `app/page.tsx`.

---

### T1 — State the currency on the website · P0

**Problem.** The website never names a currency, and Stripe renders a bare `$` to Canadian
visitors. Your audience is Canadian and the price is American. **A parent reads $597 and is charged
roughly 820 CAD.** She discovers this on her card statement, after purchase, in a product whose
entire premise is that she can trust what it tells her about her child.

The checkout-side notice added in `5d81590` is real but insufficient — it appears on the payment
page, after the decision, inside a collapsible product description.

**File:** `app/page.tsx`, Tier 1 card, ~L266–302.

**Required change.** The published price must carry `USD` in the same visual unit as the number,
plus a conversion note. Copy in §5.1.

**Acceptance criteria:**

- [ ] `USD` appears adjacent to every price figure on the site, not in a footnote or tooltip.
- [ ] A note states that Canadian and other non-US cards will be converted by the bank at its own rate, and may incur a foreign transaction fee.
- [ ] The currency is legible at 375px without truncation or wrapping mid-figure.
- [ ] No new tokens, fonts or spacing values.

**`DECISION:`** see §8-D1. The durable fix is to sell in CAD, not to disclose USD better.

---

### T2 — Fix the FOUNDING40 promise · P0

**Problem.** The homepage says:

> *"40% off your first year, and 20% off every renewal while you're an active member."*

**Stripe cannot do both through one promotion code.** The two discounts exist as separate coupons —
40% once, 20% forever — and a promotion code carries exactly one. So `FOUNDING40` delivers either
40% off year one and full price after, or 20% every year including the first.

**Half of a public pricing promise is currently false**, and it fails silently twelve months from
now, at the renewal of your founding cohort — the families whose goodwill the whole referral thesis
depends on.

**File:** `app/page.tsx`, ~L286–290.

**Required change.** Replace the two-discount claim with copy matching whichever coupon
`FOUNDING40` actually carries (C2). Both branches drafted in §5.1.

**Acceptance criteria:**

- [ ] The site describes exactly one discount, matching the configured coupon.
- [ ] Both the discounted first-year amount and the ongoing renewal amount are stated in figures, in USD.
- [ ] No phrasing implies a discount that continues if it does not, or a one-time discount if it recurs.
- [ ] `grep -n "20% off every renewal" app/page.tsx` returns nothing unless C2 confirms the recurring coupon is the one attached.

**`DECISION:`** see §8-D2 — there is a way to honour both promises, and it isn't a promotion code.

---

### T3 — Publish the price and disclose auto-renewal · P0

Unchanged from v1 except that figures are now USD and confirmed.

**Problem.** No price appears anywhere on the site. The word "renewal" appears once, inside the
discount sentence — so a parent must *infer* a recurring 597 USD charge from a discount
description. Undisclosed price + auto-renewal + scarcity framing is the pattern regulators treat as
a dark pattern.

**File:** `app/page.tsx`, Tier 1 card.

**Required change.** Price block between the "Become a Founding Family" heading and the discount
paragraph; renewal disclosure immediately above the CTA. Copy in §5.1.

**Acceptance criteria:**

- [ ] List price and currency visible without interaction.
- [ ] Founding rate shown as a reduction *from* the list price, so the anchor is visible.
- [ ] "Renews automatically" (or equivalently unambiguous wording) appears **above** the CTA button — not below, not in a footnote.
- [ ] Renewal amount and cadence stated, not implied.
- [ ] "Cancel anytime" adjacent to the renewal disclosure.
- [ ] Renders at 375 / 768 / 1440px.

---

### T4 — Add the three legal documents as routes · P0

**Source** — in the *other* repository, `app/legal/`:
`end-user-licence-agreement.md` · `terms-of-service.md` · `privacy-policy.md`

**Create:** `app/terms/page.mdx` · `app/privacy/page.mdx` · `app/licence/page.mdx`

**Implementation notes:**

1. **Strip YAML front matter** — MDX will not parse it. Keep version and effective date as visible body text.
2. **Resolve every `[BRACKETED_PLACEHOLDER]`** from C3. **If any remain unresolved, do not publish that page — stop and ask.** A live legal page containing `[LEGAL_ENTITY_NAME]` is worse than no page.
3. **Remove every `[DECISION NEEDED: …]`, `[VERIFY: …]`, `[BLOCKING: …]` note.** If one is unresolved, that document is not ready. Stop and ask.
4. **Rewrite cross-links** from `./terms-of-service.md` to `/terms`, `/privacy`, `/licence`.
5. **The Terms of Service price section must say USD** and must match whatever T2 resolves. The published page and the homepage cannot disagree.
6. Add `export const metadata` per page, `robots: { index: true, follow: true }`.
7. Constrain to a ~720px measure with generous line height.

**Also required — `mdx-components.tsx`:** the legal documents use tables, lists, blockquotes, rules
and bold heavily; the file currently styles only headings and paragraphs. Add handlers for `table`,
`thead`, `tbody`, `tr`, `th`, `td`, `ul`, `ol`, `li`, `blockquote`, `hr`, `strong`, `em`, `a`.

**Acceptance criteria:**

- [ ] All three routes build and render under `output: "export"`.
- [ ] Tables render as tables, not raw pipes.
- [ ] Zero `[` placeholder tokens in built HTML — grep `out/`.
- [ ] Cross-links resolve to routes, not `.md`.
- [ ] Readable on mobile, tables included, no horizontal scroll.
- [ ] Price and currency on `/terms` match the homepage exactly.

---

### T5 — Link the legal documents from the footer · P0

**File:** `components/footer.tsx` (17 lines).

Add a link row. Copy in §5.2. Use `next/link`. Match existing `text-subdued` / `text-[12px]` /
`tracking-[0.04em]`.

**Acceptance criteria:**

- [ ] `/terms`, `/privacy`, `/licence` and a `mailto:` support link appear on every page.
- [ ] Keyboard-focusable with a visible focus state.
- [ ] Contrast AA against `bg-bark` — `text-subdued` may fail; check and adjust.
- [ ] No layout break at 375px.

---

### T6 — Terms acceptance at checkout · P0

**Part A — Stripe dashboard (founder or founder-approved; not autonomous code):**
On the annual membership payment link set **Terms of service URL** → `https://truermeasure.com/terms`
and **Privacy policy URL** → `https://truermeasure.com/privacy`, and enable the required **"I agree
to the terms of service"** checkbox. Minutes of work, and the single highest-value item here — a
chargeback defence rests on recorded acceptance.

**Part B — site:** consent line beneath the CTA linking `/terms` and `/privacy`. Copy in §5.3.

**Acceptance criteria:**

- [ ] Both URLs set and the consent checkbox enabled — verify by loading the live checkout.
- [ ] Homepage CTA accompanied by visible links to `/terms` and `/privacy` before the click.
- [ ] Consent text ≥12px, contrast AA on `bg-bark`.

---

### T7 — Privacy notice and consent on the lead forms · P0

**Problem.** `components/waitlist-button.tsx` collects first name, last name, email, phone,
**"Number of kids and ages"**, city, province/state and postal code, and posts it to **GoHighLevel
in the United States**. No privacy notice, no consent, no policy link. That is children's personal
information collected on a marketing form and transferred outside Canada with zero disclosure.

**File:** `components/waitlist-button.tsx`, form body ~L165–225.

**Required changes:**

1. Privacy notice above the submit button, linking to `/privacy` in a new tab. Copy in §5.4.
2. **`DECISION:`** §8-D3 — the kids field. *Default if unanswered: make it optional, ages only.*
3. If it becomes optional, drop `required` in the DOM and update `contact-submit.ts` validation to match.

**Acceptance criteria:**

- [ ] Every form posting to `contact-submit` shows a privacy notice with a working `/privacy` link before submission.
- [ ] The notice states information is sent to a provider outside Canada.
- [ ] End-to-end submit to GoHighLevel still succeeds.

---

### T8 — Delete the stale $97 content · P1

`content/home.mdx` contains `**$97**` and *"as often as needed through January 2027"* — a one-time
purchase at roughly one sixth of the live price. Not rendered by any route today, but one import
from being live, and it already caused a first draft of the legal documents to be written against
the wrong commercial model.

**Before deleting:** grep for imports. If something imports it, stop and report.
Assess `content/learn.mdx` and `content/build.mdx` the same way.

**Acceptance criteria:**

- [ ] `grep -rn '\$97' web/` → nothing.
- [ ] `grep -rni 'through january 2027' web/` → nothing.
- [ ] Build passes; no previously-resolving route 404s.

---

### T9 — Disclose Plausible correctly · P1

`app/layout.tsx` loads Plausible. The privacy policy has been corrected to name it as cookieless
and to explain that this is *why* no consent banner appears — **verify that correction survived
into whatever you publish in T4.**

- [ ] Confirm the standard cookieless `script.js` is in use, not a cookie-setting variant.
- [ ] Published policy names Plausible, GoHighLevel, Netlify and every other live processor.
- [ ] No statement in the published policy contradicts `app/layout.tsx` or `netlify/functions/`.
- [ ] If Plausible is *not* cookieless — stop. A consent mechanism is then required, and that is a separate, larger task.

---

### T10 — Reconcile the unlimited-regeneration promise · P2

`app/page.tsx` says *"regenerate it whenever you want a fresh picture."* The Terms of Service flag
this because it is an unbounded commitment against per-report AI cost.
**`DECISION:` §8-D4. Do not change this copy without an answer.**

---

### T11 — Quantity selector · P2

The payment link exposes a quantity selector; the data model is one subscription per child (S46),
provisioned from `checkout.session.completed`. Quantity 2 most likely creates one subscription with
quantity 2, not two child subscriptions — a parent of twins pays twice and gets one record.

Stripe configuration or an `app` repo change. **Not a `web` change.** Disable the quantity adjuster
until quantity provisioning is verified.

---

### T12 — Verify routes resolve on Netlify · P2

`netlify.toml` has a `/*` → `/404.html` catch-all. It should not shadow static routes under
`output: "export"`, but confirm `/terms`, `/privacy`, `/licence` return 200 on a deploy preview.

---

## 5. Copy deck

**Do not paraphrase.** Every figure is USD.

### 5.1 — Pricing block (T1, T2, T3)

**Shared frame:**

```
Become a Founding Family

$597 USD per year

One membership covers one child. Adding another child is a separate membership.
Prices are in US dollars. Your bank will convert at its own rate and may add a
foreign transaction fee.
```

**Branch A — if `FOUNDING40` carries the 40%-once coupon:**

```
Founding Families: $358.20 USD for your first year with code FOUNDING40,
then $597 USD per year.

Limited to our first 40 Founding Families.
```

**Branch B — if `FOUNDING40` carries the 20%-forever coupon:**

```
Founding Families: $477.60 USD per year with code FOUNDING40 — your first year
and every renewal, for as long as your membership stays active.

Limited to our first 40 Founding Families.
```

**Renewal disclosure — required in both branches, immediately above the CTA:**

```
Renews automatically each year until you cancel. We email you before every
renewal. Cancel anytime.
```

Then the existing CTA button, unchanged.

If C1 confirms tax is added at checkout, append `Plus applicable tax.` after the price line.

### 5.2 — Footer links (T5)

```
Terms of Service · Privacy Policy · Licence Agreement · Contact
```

→ `/terms` · `/privacy` · `/licence` · `mailto:[SUPPORT_EMAIL]`

### 5.3 — Checkout consent line (T6B)

```
By subscribing you agree to our Terms of Service and Privacy Policy.
```

### 5.4 — Lead form privacy notice (T7)

```
We use this to contact you about Truer Measure and nothing else. We never sell
your information. Your details are stored with our service provider outside
Canada. See our Privacy Policy.
```

`/privacy`, new tab, so form state survives.

### 5.5 — Lead form kids field, if §8-D3 defaults apply

```
Label:       Number of kids and ages (optional)
Placeholder: e.g. two kids, ages 7 and 10
```

Ages only. **Do not solicit children's names on a marketing form.**

---

## 6. Out of scope — do not do these

- **Do not write, edit or "improve" any legal text.** Transcribe; do not author.
- **Do not invent a price, currency, discount or tax treatment.** §1 and §2, or stop.
- **Do not deactivate, cap, edit or create any Stripe promotion code, coupon or payment link.** F1 and F2 are the founder's. Report; do not act.
- **Do not remove the annual membership Stripe link from `app/page.tsx`.**
- **Do not build the French versions.** All three documents declare `languages: [en, fr]` and the French text does not exist. It needs a human translator with Quebec consumer-contract experience — machine translation is not adequate where the French version legally governs.
- **Do not build the capture-then-checkout flow** in `docs/stripe-ghl-checkout-playbook.md`. Separate project. This spec works against the existing payment link.
- **Do not add a cookie consent banner** unless T9 shows Plausible is not cookieless.
- **Do not touch the `app` repository.** T11 identifies an issue there; report it.

---

## 7. Verification checklist

```
□ npm run build succeeds
□ npm run lint clean
□ grep -rn 'USD' app/page.tsx                    → currency stated with the price
□ grep -rn '20% off every renewal' app/          → nothing, unless C2 confirms branch B
□ grep -rn '\$97' .                              → nothing
□ grep -rni 'through january 2027' .             → nothing
□ grep -rn '\[.*_.*\]' out/terms out/privacy out/licence  → no placeholders
□ /terms /privacy /licence all 200 on deploy preview
□ Price, currency and renewal disclosure visible on homepage without interaction
□ /terms price section matches the homepage exactly
□ Footer legal links present and keyboard-focusable on every page
□ Lead form shows privacy notice; submit to GoHighLevel still works
□ Stripe link: ToS URL, privacy URL, consent checkbox set (load live checkout)
□ 375 / 768 / 1440px — no horizontal scroll, tables included
□ Contrast AA on all new text, especially footer links on bg-bark
□ No new design tokens, fonts or spacing values
```

---

## 8. Decisions owned by Jolène

**D1 — Sell in CAD instead of USD?**
Disclosure fixes the legal problem. It does not fix the commercial one: a Canadian audience,
Canadian company, Canadian data-residency promise, and an American price tag that reads as
domestic. Every parent who reads $597 and is billed ~820 CAD has a bad first experience with a
brand whose entire proposition is trustworthy interpretation. **Creating a CAD price in Stripe is
minor work; the friction is that existing subscriptions stay on the USD price.** With 0 FOUNDING40
redemptions used, the cohort to migrate is close to empty — **this is the cheapest it will ever be
to fix.** *No default. Decide before the next sale.*

**D2 — How to honour both founding discounts.**
A promotion code carries one coupon, so the current promise cannot ship as written. Three ways out:
(a) change the copy to match the single coupon — cheapest, and T2 assumes it; (b) create a
dedicated **Stripe price** at the founding rate rather than a discount on the standard price, which
can differ across the first term and renewals; (c) honour the second discount manually at renewal.
(b) is the only one that keeps the promise as advertised without ongoing manual work.
*Default if unanswered: (a), branch per C2.*

**D3 — The "Number of kids and ages" field.** Optional or required? Ages only, or names too?
*Default: optional, ages only.*

**D4 — Unlimited regeneration.** Honour the homepage promise uncapped, or soften the copy?
*No default — blocked.*

**D5 — Refund policy.** Still unsettled, and it now blocks `/terms` from publishing, because the
page will state whatever you decide. At 597 USD auto-renewing, a blanket no-refund position is
unenforceable against Canadian consumers and loses every chargeback.
*No default — blocked.*

---

## 9. Sequencing

**Today, founder, no code:** F1 (`TEST100`) → F2 (retire the five stale links).
These are live money and live access. Everything else can wait a day; these should not.

**PR 1 (P0, ship together):** T4 → T5 → T1 → T2 → T3 → T6 → T7.
One coherent change: publish the documents, link them, publish an honest price in a named currency,
fix the discount claim, obtain consent. Shipping any of these alone leaves the exposure open — and
shipping the price without the currency is worse than shipping neither.

**PR 2 (P1):** T8 → T9.

**PR 3 (P2, decision-gated):** T10 → T11 → T12.

**Blocked on the founder:** C1–C3, D1–D5, French translation.
