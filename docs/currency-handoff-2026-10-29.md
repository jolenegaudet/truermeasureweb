# The currency handoff: website to app to checkout

*29 October 2026. Her brief: "The remaining integration requirement is that the
currency selected on the website reaches the app and checkout, including a
visitor's manual override."*

Nothing here is published. `main` is untouched, no Stripe object was changed to
write this, no live payment is enabled, and no app file was edited: the app's
half is section 2, written for the separate session that owns that repository.

---

## The problem in one paragraph

The site shows three prices and lets a parent choose between them. The app opens
the checkout. They are different origins, so nothing in the browser crosses
between them: not localStorage, not sessionStorage, not a cookie. And the app's
checkout passes **no currency** to Stripe (`server/billing.js`, the
`/checkout/sessions` call in `handleCheckout`), so Stripe localises by where the
customer appears to be. A parent in Canada who deliberately picks US$47 is
therefore sent to a checkout that says CA$47. That is the gap. It breaks the
app's own rule, written above that function: *"a checkout is never opened for a
price the parent has not been shown."*

---

## 1. What the website now does (done, verified)

The choice travels on the link the parent clicks, as two parameters:

| Parameter | Values | Meaning |
|---|---|---|
| `currency` | `CAD`, `USD`, `EUR` | which of the three prices the parent was shown |
| `billing` | `month`, `year` | which billing period was selected with it |

The names are written once, in `content/app-plans.ts` (`HANDOFF`), and
interpolated into the inline script in `app/layout.tsx`, so the two cannot drift
apart.

**Where the value comes from.** The same attribute that decides which price is
on screen: `data-tm-currency` on `<html>`, which the pre-paint script sets from
the visitor's country and the selector overwrites when a parent picks another
currency. So what travels is what the parent actually read, a manual override
included. The billing period is mirrored to `data-tm-interval` beside it.

**It is stamped twice, deliberately.** The rendered `href` carries it, which is
what a middle-click or "open in new tab" uses, since neither fires a click
event. And a capture-phase listener installed before paint re-stamps it at the
moment of any click, because between paint and hydration the rendered href is
still the default while the price on screen is already the visitor's own. A
parent who clicked in that gap would reach a checkout in a currency they were
never shown: the same class of fault as the 650 ms wrong price fixed on
28 October, and it is closed the same way, before paint rather than after mount.

**Where the links point today.** Still the demo, because the production app does
not exist (`REGISTRATION.url` is null; the evidence is in `content/app-plans.ts`).
Demo links carry no parameters, because the demo has no checkout and a parent
should not be handed a URL with billing in it. For testing, a preview build can
point the buttons at a local app:

```
NEXT_PUBLIC_TM_PRICE_PREVIEW=1 NEXT_PUBLIC_TM_APP_URL=http://localhost:8765 npm run build
```

With the price preview off, that variable is ignored whatever it is set to, so
no build that could ever be published points a button anywhere but the demo.

### Verified in a real browser, against the production export

Ten checks, all passing (`scratchpad\check-handoff.py`, with a stand-in on a
spare port recording what it was handed, so the evidence is the query that
actually crossed rather than a value read back out of the page that sent it):

| Case | Price on screen | What the app was handed |
|---|---|---|
| Canada, untouched | CA$47 | `currency=CAD&billing=month` |
| France, untouched | €47 | `currency=EUR&billing=month` |
| France, parent picks USD and Yearly | US$507.60 | `currency=USD&billing=year` |
| United States, parent picks Yearly | US$507.60 | `currency=USD&billing=year` |
| Germany, parent picks CAD | CA$47 | `currency=CAD&billing=month` |
| The gap before hydration (attribute EUR, href still CAD) | €47 | `currency=EUR&billing=month` |
| French page, parent picks *Par année* | €507.60 | `currency=EUR&billing=year` |
| The rendered href, EN and FR, Canada and France | — | matches in all three |

And unchanged by this work: the right currency is still the only one painted,
exactly one price is visible, the cards stay equal height with no button skew at
1280, nothing overflows at 390, and with JavaScript off there is no attribute,
so CAD shows and nothing else does.

### A leak found while auditing the public build, and closed

Her rule is that unapproved prices stay in the local preview, and until today
that was checked against the exported HTML, where it held. It did not hold of
the whole build. Measured on the public export this evening, `CA$`, `US$` and
`amount:47` were all present in a published JavaScript chunk, because the module
that declared them is imported by a client component and **Next 16 does not
inline `process.env.NEXT_PUBLIC_*` in a client chunk** — it compiles to a
runtime read, so `PRICE_PREVIEW ? [...] : []` keeps both branches and ships the
amounts either way. A price in a file anyone can fetch is a published price.

Fixed: the amounts moved to `content/app-prices.ts`, which only the two server
pages import, and they reach the card as a prop. The public build now contains
no amount anywhere — not in a page, not in the React payload inside it, not in
any chunk. Nothing had been published while it was true, and `main` was never
touched. My earlier "no amounts in the public build" was measured on the HTML
only; this corrects it.

---

## 2. For the app session: the exact change

Five pieces, in the branch `launch` worktree. Nothing below changes a price, a
cap, or account coverage, and nothing enables live payments.

### 2a. `server/billing.js` — `handleCheckout` must take the currency

Today:

```js
const interval = body && body.interval ? String(body.interval) : intervals()[0];
const price = prices[interval];
```

Add a currency beside the interval, and pass it to Stripe:

1. Read `body.currency`, lowercase it (Stripe wants `eur`, the site sends
   `EUR`), and accept only a configured set. Suggest
   `TM_STRIPE_CURRENCIES` (default `cad,usd,eur`), read the same way the price
   ids already are, so nothing is hardcoded.
2. Reject anything else with 400 `no_such_currency` rather than falling through
   to Stripe's localisation. Silence is how a parent gets charged in a currency
   they did not choose.
3. Pass `currency` into the `/checkout/sessions` call. Stripe's rule: when a
   Session names a currency, that currency wins; when it does not, Checkout
   localises by the customer's location. Both of her test prices carry
   `currency_options` for all three, so `currency: 'eur'` yields €47 or €507.60
   with VAT inside it.
4. **Put the currency in the idempotency key.** It is
   `'checkout-' + account.id + '-' + interval + '-' + minute` today, so two
   checkouts in the same minute for the same account and interval but different
   currencies return the *first* session. A parent who opens CAD, goes back and
   picks USD within the minute would be shown the CAD page again.
5. `log('checkout_started', …)` should carry the currency, so /ops can show what
   a parent was actually sent to.

**One Stripe constraint that needs a decision, not a line of code.** A Customer's
currency is fixed by their first subscription or invoice. After that, a Session
in another currency is refused by Stripe. So a parent who subscribes in CAD,
cancels, and comes back wanting EUR cannot have it on that customer record.
Recommended behaviour, because it is the one that keeps their own rule: read
`customer.currency` before opening the checkout, and if it is set and differs,
do not open one — answer with the currency the account is billed in and say so
on the screen. Charging in a currency the parent was not shown is the thing to
avoid; a clear sentence is not.

### 2b. `js/account.js` — send it

`A.upgrade(interval)` posts `{ interval }`. It needs
`{ interval, currency }`, from whatever the next piece stores.

### 2c. Reading and keeping `?currency=` and `?billing=`

The app reads two query parameters today (`?checkout=`, `?code=`) and has the
pattern for a third in `js/store.js` (`/[?&]expert\b/.test(location.search)`
into `sessionStorage`).

The hard part is not reading it, it is keeping it. A parent arrives with
`?currency=EUR`, types an email, and comes back through a sign-in link that has
no parameters on it, possibly in a different browser. So:

1. On load, read `currency` and `billing`, accept only the known values, and
   store them (`localStorage`, so the sign-in link in the same browser still has
   them; `sessionStorage` dies on the round trip).
2. Precedence: the parameter, then what was stored, then the app's own guess
   from the browser, then **CAD**. CAD last because CAD is what the website
   shows a visitor with JavaScript off, so the two agree.
3. The app's own guess should use the same rule as the site, which is one small
   file worth copying rather than reinventing: `content/currency-for-country.ts`
   (region subtag only, never a bare language, because French is spoken in
   Canada; Canada → CAD, euro area → EUR, everything else → USD).
4. `billing` only preselects which option is pressed. It must not skip the
   screen where the parent sees the amount and the terms.

### 2d. `js/config.js` and `js/plan.js` — the amount per currency

This is the piece that makes the rest visible, and it is easy to miss: today
`plan.prices` is `{ monthly: '', schoolYear: '' }`, and `TM.plan.offers()` only
offers an option whose amount is set. **With no amounts, there is no checkout
button at all**, whatever the currency handoff does. So the per-currency amounts
have to be set in the app's own copy, shaped so `offers()` can pick by currency:
CA$47 / US$47 / €47 monthly, and 507.60 in each for the year.

Two wording points that belong with them, both already decided on the website:

- The tax sentence differs by currency. `plan.terms.taxes` is "Taxes are shown
  at checkout.", which is right for CAD and USD, where tax is added on top. For
  the euro it is wrong by omission: €47 already includes VAT. The site says
  "Plus applicable taxes." and "VAT included." per currency, from her own rule
  in `content/founding-families.ts`.
- The yearly option is a price, not a coupon. `TM_STRIPE_INTRO_COUPON` applies
  once to a first subscription, which is a different thing from a standing
  yearly rate.

### 2e. The two test prices, and Stripe Tax

In `<secrets>\stripe-test.env`, outside every repository:

```
TM_STRIPE_PRICE_MONTHLY=price_1UVvOJA9dbCTZCRQT7cgOjA7
TM_STRIPE_PRICE_YEARLY=price_1UVvOKA9dbCTZCRQBCZjTJdy
```

Both are test-mode, product `prod_VWzNTXW9zLkKSH`, created 29 October:
CAD 47 and USD 47 tax-exclusive, EUR 47 tax-inclusive; 507.60 in all three for
the year. Reading them back needs `expand[]=currency_options`, or Stripe omits
the other currencies and they look missing.

`TM_STRIPE_AUTOMATIC_TAX=1` turns on `automatic_tax` and
`customer_update: { address: 'auto' }` at checkout. It needs **Stripe Tax
enabled in the test account**, and without it Stripe computes no tax at all: the
euro total is still €47, but with no VAT recorded against it, which is a
bookkeeping problem rather than a pricing one.

---

## 2i. The country comes from Netlify, not from the browser (30 October)

**Her correction:** *"Reading the region in the browser's language settings
does not establish the visitor's current country. Use the existing hosting
platform's country-detection capability as the primary source."*

She is right, and the previous approach was a guess presented as a fact: a
parent in France with a laptop set to en-CA was shown Canadian dollars, and a
Canadian who prefers en-US was shown American ones.

**What the hosting actually is.** `netlify.toml` publishes the static export
from `out`, with serverless functions already in use for the two forms. Netlify
resolves the country for every request and hands it to an **edge function** as
`context.geo.country.code`. That is the platform capability, it costs nothing
extra, no third-party geolocation service is involved, and the visitor is never
asked for a location.

**What was added.** `netlify/edge-functions/currency.ts`, registered for `/*`
in `netlify.toml`, fetches the page the CDN would have served and writes
`data-tm-currency` onto its `<html>` tag before the browser receives it. The
rules and the rewrite live in `content/currency-map.ts`, which has no imports
precisely so that both the Deno edge runtime and the Next build can read the
same file. The browser-language guess (`countryFromBrowser`, `detectCurrency`)
is deleted rather than kept as a fallback, because a fallback would quietly
reintroduce the thing she ruled out.

Her five rules, confirmed: Canada CAD, United States USD, euro area EUR,
anywhere else USD, country unknown CAD. The last one is not a branch: an
unknown country sets no attribute, and the stylesheet's default is CAD, so a
request the edge never saw, a country Netlify cannot resolve, and a visitor
with JavaScript off all land on the same answer by the same path.

### Checked locally, and what still needs the deployed host

**Simulated here, and passing.** `scratchpad/edge-sim.mjs` serves the built
site and calls the *same compiled module* the edge function imports, with the
country arriving in a header the test sets. 13 cases, country and browser
language varied independently, including her three:

| Country | Browser set to | Shows |
|---|---|---|
| Canada | en-US | **CA$47** |
| United States | fr-CA | **US$47** |
| France | en-CA | **€47** |
| Germany | en-GB | €47 |
| Britain, Japan, Mexico | any | US$47 |
| Bulgaria | en-US | €47 |
| not resolved | fr-FR | CA$47 |

The French page follows the country too: opened from Canada it shows CA$47,
from the United States US$47, from France €47. No currency control appears in
any case, and exactly one price is visible. The registration link carries what
the edge decided: 5 more cases, including a parent in France on an en-CA
browser handing the app `currency=EUR&billing=year`.

**Still unverified, and only verifiable on the deployed host:** that Netlify
populates `context.geo.country.code` for this site, that the edge function is
invoked for every page path, and that its response is not cached across
countries (the function sets `Vary: x-nf-country`; Netlify's own country cache
key is the thing to confirm). Nothing here was published to test it, as she
asked. The first deploy is where that gets checked, and it should be checked
from at least two countries before the page is treated as live.

**One fragility found while testing, and fixed.** When a page failed to
hydrate, React re-rendered it from scratch and dropped the attribute it had
never rendered, turning a euro price into a Canadian one with nothing on screen
to show it had happened. The inline script now saves what the edge decided in
`window.__TM_CURRENCY` before React touches the page, and the card puts it back
if it goes missing.

## 2g. Her brief of 29 October, evening: no currency control anywhere

**"Parents must not see buttons, a dropdown or any other control for switching
between CAD, USD and EUR."** The selector is off the website. The currency is
decided from the visitor's country before the page paints and there is nothing
on the page to change it. The monthly/yearly choice stays.

**Recorded for the app, at her instruction: registration and checkout must not
reintroduce a currency selector.** The currency arrives on the link and is the
parent's for the rest of the journey. The app session has this and has
confirmed none will be added.

**Stripe's hosted page, honestly stated.** The app session checked rather than
assumed, and found something worth keeping: **Adaptive Pricing was enabled on
every sandbox session, including all six checkout runs.** No currency control
appeared on the pages they captured (USD and EUR screenshots at 1280px; the CAD
page's scraped text showed none either), but with Adaptive Pricing on, a parent
elsewhere could in principle have been offered a local currency. The app now
sends `adaptive_pricing[enabled]=false` on every Checkout Session (`afb6dc7`),
confirmed on one sandbox session. The account-level setting in the Stripe
dashboard is unchanged in both modes.

So the accurate sentence, and the one to use: *Stripe's page showed no currency
control in the sessions captured, and the app now switches Adaptive Pricing off
for every checkout, so Stripe cannot offer one.* Not: the whole journey has been
verified for every parent in every country.

## 2h. One subscription covers ONE CHILD: a mismatch, recorded not fixed

**Her decision, 29 October 2026**, replacing the per-account wording of
28 October. The website now says "One subscription covers one child." and "Un
abonnement couvre un enfant.", on the paid card beside the price. It was also
in the comparison panel under the cards until 2 November 2026, when her brief
removed that panel; the line on the card is untouched, and it is now the only
place the website says it.

**The app does the other thing.** `subscriptions.account_id` gives School & Life
to the whole account, with no limit on the children in it, and
`server/billing.js` has no per-child concept at all. Her instruction was to
record the mismatch and change nothing: no app edit, no Stripe edit, and no
invented scheme for how more children would be bought or billed. The app session
has logged it in the launch checklist and at the top of its legal CHANGES.md;
this is the website's copy of the same record.

**CLOSED on 30 October 2026.** The app session built it and verified it
(`80dc7e5`, `bae5c33`, unpublished, live payments off): School & Life is bought
for one named child at a time at the same price, School stays free for each
child, adding a child never charges, a second subscription for the same child
is refused, and cancelling one child's subscription leaves the others running
to the end of their paid period with records kept. 739 checks, a browser
journey covering five cases, and two children bought on Stripe's real page in
the sandbox, each subscription carrying `metadata.child_id`, one cancelled
alone. Her four test subscriptions from 28 October were left untouched.

The website's wording needs no change: "One subscription covers one child." and
"Un abonnement couvre un enfant." are now true of the product as well as the
page. The link format is unchanged too, because the child is chosen inside the
app, so `?currency=` and `?billing=` still carry everything the website knows.

**Two things the closure does not cover**, both recorded rather than assumed:
subscriptions created before 30 October carry no child and still cover a whole
account, which is test data only; and the monthly AI ceiling is still per
account while subscriptions are now per child, which is a decision for her and
is set out in the pricing brief §2.

## 2f. The sandbox, configured and verified (done, 29 October)

With her authorisation, and in the sandbox only. The sandbox is a separate
Stripe account from live (`acct_1T6YMxA9dbCTZCRQ` against the live
`acct_1T6YMjAJm8m0sW6o`), so no live setting or live registration was reachable
by any call made here.

- **The exposed test key is dead.** The value printed into the session on
  28 October now returns 401 from Stripe, so it was rolled rather than
  supplemented. The replacement authenticates, is a test key, sees the same
  sandbox and reads both prices back correctly.
- **Stripe Tax: `status: active`.** Head office country CA, province NB. No
  postal code was required: Stripe accepted the province-only form, and
  Canadian HST is set at province level, so her address did not have to be
  entered anywhere. The verified postal code she offered was not needed.
- **Registrations, both active.** `taxreg_1UVzFoA9dbCTZCRQVRaYZJEN` for Canada
  (`ca.type: standard`, GST/HST, which is the New Brunswick case) and
  `taxreg_1UVzFoA9dbCTZCRQtdTAlt1j` for France (`fr.type: standard`, French
  VAT). Nothing was deleted and no other country was added, so a United States
  row correctly computes 0%.
- **A tax code had to be chosen, because none existed.** `defaults.tax_code`
  was null and the product `prod_VWzNTXW9zLkKSH` has none, so every calculation
  failed with *"Your line item is missing a tax code"* — which is what the six
  checkout runs would have hit even with Stripe Tax on. The sandbox default is
  now `txcd_10103000`, Software as a service (personal use): the defensible
  code for a consumer subscription, and indistinguishable from the other
  digital-service codes for both NB HST and French VAT. **Her call to confirm
  before live, where the product still carries no tax code.**

### What the sandbox now computes

From Stripe's own tax calculation API, which creates no subscription, checkout
or charge:

| Case | Amount shown | Tax | Total charged |
|---|---|---|---|
| CA$47 monthly, New Brunswick | 47.00 | 7.05 HST at 15%, added | **CA$54.05** |
| CA$507.60 yearly, New Brunswick | 507.60 | 76.14 HST at 15%, added | **CA$583.74** |
| US$47 monthly, New York | 47.00 | 0.00 at 0% | **US$47.00** |
| US$507.60 yearly, New York | 507.60 | 0.00 at 0% | **US$507.60** |
| €47 monthly, Paris | 47.00 | 7.83 VAT at 20%, inside | **€47.00** |
| €507.60 yearly, Paris | 507.60 | 84.60 VAT at 20%, inside | **€507.60** |

The two euro rows are the point: **the total equals the amount on the page**,
with the VAT taken out of it rather than added to it. That is the correction
made to §1 of the pricing brief, now confirmed by Stripe rather than argued.
The business keeps €39.17 of a €47 month.

---

## 3. The six checkout checks: run, and verified (29 October)

Run once, in the sandbox, by the app session, using the two prices above rather
than the old CA$1 placeholders, with a fresh account and a fresh Stripe customer
per combination. **All six passed, and each returned to the app with School &
Life active.** The figures below are not their report: I read them back from
Stripe's own paid invoices afterwards, and they match row for row.

| Combination | The page showed | Stripe's invoice: subtotal / tax / total |
|---|---|---|
| CAD monthly, New Brunswick | CA$47, plus tax | 47.00 / 7.05 HST added / **CA$54.05** |
| CAD yearly, New Brunswick | CA$507.60, plus tax | 507.60 / 76.14 added / **CA$583.74** |
| USD monthly, New York | US$47, plus tax | 47.00 / 0.00, not collecting / **US$47.00** |
| USD yearly, New York | US$507.60, plus tax | 507.60 / 0.00, not collecting / **US$507.60** |
| EUR monthly, Paris | €47, VAT included | 47.00 / 7.83 VAT inside / **€47.00** |
| EUR yearly, Paris | €507.60, VAT included | 507.60 / 84.60 VAT inside / **€507.60** |

**The euro question her brief asked is answered.** The total charged equals the
amount the page showed, to the cent, with the VAT taken out of it rather than
added to it. Stripe records it as `inclusive` on the invoice. The two United
States zeros are `not_collecting`, which is correct: the sandbox is registered
for Canada and France only.

Two things worth keeping in the record, both from the app session's own account
of the run:

- The two United States checkouts stopped on Stripe's page the first time,
  because a US card needs a street, city and state and the script typed only
  the ZIP. Nothing was charged; the script was fixed and those two were re-run
  alone.
- In the first pass the euro tax was labelled "(added)" in the script's output.
  That was the script's label, not Stripe's: the total of €47.00 is what proves
  the VAT was inside it. Fixed.

**Sandbox state afterwards**, read back from Stripe: the six subscriptions the
run created are cancelled, and the four active subscriptions from 28 October are
untouched and still on the old placeholder prices. The probe and the failed
first attempts left 13 expired and 2 open checkout sessions and a few empty
customers, with no subscription or charge against any of them. They are worth
leaving alone: in a sandbox they cost nothing, and they are the audit trail of
this run.

---

## 3b. What was planned before the run (kept for the record)

Her gate: the exposed test key replaced, and the handoff above landed in the
app. Then, in test mode only, the six combinations — monthly and yearly in CAD,
USD and EUR — each on its own fresh account, using the app's existing
walkthrough method (`tests/stripe-test-mode.js`: real Checkout page, Stripe's
published test card, notices pulled back because this computer cannot receive
them) against the two prices above rather than its CA$1 placeholders. The four
existing test subscriptions are left alone; each combination creates its own
account and its own Stripe customer, which is also what keeps the customer
currency conflict in 2a out of the way.

Each row will show: the currency and period selected on the site, the amount
displayed, the amount on the Stripe page, the tax lines and the final total, and
the return to the app with School & Life active.

**These six checks are not launch readiness.** They establish that a chosen
currency survives the journey and that the totals are right. The launch
checklist stays open: counsel, the Privacy Policy in `app/_pending`, the
production app that has never been created, `launch.env`, the free-plan cap
decision, the CA$47 = US$47 parity question and what the euro keeps after VAT.

---

## 4. What must still be true before this page is published

Her instruction of 30 October: keep the remaining launch requirements explicit.
This list is the website's, and it is deliberately short: finished items are
not repeated here.

1. ~~**One subscription covers one child.**~~ Closed on 30 October: the app
   session confirmed billing and access both match, with the evidence in §2h.
   What replaced it on the list: **the monthly AI ceiling is per account while
   subscriptions are per child**, so two paid children pay twice and share one
   US$10 ceiling, and two free children share one US$3 ceiling that a single
   ten-card signup nearly fills. Hers to decide, and set out in the pricing
   brief §2.
2. **The registration buttons must point at the verified customer-app host.**
   Today they open the demo, with "Opens the demo in a new tab" under each one
   and the demo-only sentence under the cards. (The box that said "The app is
   not open to families yet." came off at her instruction on 1 November; those
   two lines are what replaced it.) **Demo links are temporary and are not
   working registration.** They may not be presented as registration, and the
   page may not be published as a sales page while they are what the buttons
   do. The route is recorded (`path: "/"`, parameters `currency` and
   `billing`); only the host is missing, and setting `REGISTRATION.url`
   switches every button over and takes both demo lines off with it.
   Re-confirmed with the app session on 2 November: the production app has
   still never been created. See docs/launch-readiness-2026-11-02.md.
3. **The country detection needs one check on the deployed host**, from two
   countries, because `context.geo` cannot be exercised locally (§2i).
4. **Preserved, and to stay preserved:** Parents Élites as the French community
   name, all three offers on the page (Clarity, Community, Proximity), and the
   existing waitlist and application forms untouched.
5. **Her approval of the page itself.** It is a working version under review,
   not an approved one.

Already done and not repeated: the six sandbox checkouts, the US$3 School
allowance, the sandbox tax settings and registrations, and the replaced Stripe
test key.
