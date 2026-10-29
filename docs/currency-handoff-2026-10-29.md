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

## 3. What I will run once both are confirmed

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
