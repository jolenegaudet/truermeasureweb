# The release candidate, and what stands between it and publication

2 November 2026. Branch `app-plans-2026-10-28` at the commit this document
lands in. `main` is untouched at `042fce6`, which is also what is live. Nothing
here has been published, no price has been approved, and no payment is live.

Her brief of 2 November: preserve the approved page, prepare the actual launch
build, prepare the connection to the customer app, prepare the legal and
account-management links, coordinate the GoHighLevel work, verify the release
candidate, and say what remains.

---

## 1. There are three builds, and they differ only in environment variables

The website is a static export, so a flag is not a setting someone can change
afterwards: it is baked into the HTML at build time. Three builds come out of
the same branch.

| | amounts | billing choice | buttons | demo labels |
|---|---|---|---|---|
| **maintenance** | none | none | demo | shown |
| **review** | CA$47 / US$47 / €47 | monthly, yearly | demo | shown |
| **launch** | CA$47 / US$47 / €47 | monthly, yearly | customer app | gone |

```
maintenance   (no variables)
review        NEXT_PUBLIC_TM_PRICE_PREVIEW=1
launch        NEXT_PUBLIC_TM_PRICES_APPROVED=1
              NEXT_PUBLIC_TM_APP_URL=<the customer app's origin>
```

`scripts/launch-build.ps1 -Mode maintenance|review|launch` builds one and then
proves which one came out, by reading the exported HTML rather than trusting
the variables (`scripts/check-launch-build.mjs`). All three were built and
checked on 2 November: 14 pages each, nothing wrong.

**The maintenance build is separate by construction, not by discipline.** `main`
contains none of this: no `content/app-prices.ts`, no plan cards, no edge
function, and no `NEXT_PUBLIC_*` anywhere. So the two launch variables could be
set in Netlify today and a redeploy of `main` would be byte-for-byte what it is
now. The separation her brief asks for is already structural.

### What was preview-only and would have hidden prices or blocked registration

1. **`NEXT_PUBLIC_TM_PRICE_PREVIEW`** gated the three amounts, the
   monthly/yearly selector and the before-paint currency script. Unset, the
   paid card shows "Pay monthly or yearly." and no figure. This is the flag
   that has to be on for a launch.
2. **`REGISTRATION.url`**, fed by `NEXT_PUBLIC_TM_APP_URL`, is what sends the
   buttons to the demo. It is still gated on the price flag on purpose: no
   build that could be published can point a button at registration while the
   amount beside that button is unapproved. The two go live together.
3. **The `?tm-country=` override** — fixed on 2 November, and the reason this
   section exists. It let a local preview be read as another country would see
   it, and it was gated on the price preview "because the price preview cannot
   exist in a build that could be published". Preparing the launch build is
   exactly what breaks that: the launch build sets the price flag. It would
   have shipped a way for anyone to be shown another country's price by typing
   in the address bar. It now has its own variable,
   `NEXT_PUBLIC_TM_COUNTRY_OVERRIDE`, which belongs on this computer only, and
   `check-launch-build.mjs` fails if `tm-country` reaches the exported HTML.

### Why the launch variable has a different name from the preview one

`NEXT_PUBLIC_TM_PRICES_APPROVED` and `NEXT_PUBLIC_TM_PRICE_PREVIEW` are one
gate with two names. Either shows the prices; the launch one exists because a
production environment variable called PREVIEW is the kind of thing somebody
deletes as leftover configuration, and deleting this one would take the prices
off the live page, drop the currency script and send every button back to the
demo — silently, with a passing build. Nothing else differs between the
preview and the launch build, which is deliberate: what she approves locally is
what ships.

---

## 2. The page itself: everything her brief said to preserve is still there

Checked in the built HTML and in a browser, both languages, 2 November.

- All three offers: Clarity (the two plan cards), Community (Elite Parents /
  **Parents Élites**), Proximity (Inner Circle / **Cercle privé**).
- School free, "Report cards only."; School & Life paid; **one subscription
  covers one child**, in the paid card's top group.
- CA$47, US$47, €47 a month. Yearly 507.60 in each currency, with
  "42.30 a month, paid once a year. You save 56.40."
- "Plus applicable taxes." on CAD and USD, "VAT included." on EUR, and the
  French equivalents.
- Automatic currency, no currency selector anywhere; the monthly/yearly choice
  stays.
- The founder's note, the headline, the four short bullets per card, the
  waitlist and application forms with their GoHighLevel tags unchanged
  (`waitlist-elite-learning-leaders`, `applied-inner-circle`).
- The two closing lines, once, beneath both cards, with no box.
- The comparison panel, the long explanations and the application waitlist box
  are gone and stay gone; the checker fails if either language gets them back.

---

## 3. The connection to the customer app

Confirmed with the app session on 2 November, read-only against launch branch
`e44b1f0`.

- **The production app does not exist.** `az group exists -n
  truermeasure-prod-rg` is false and `deploy/azure-accounts.sh` has never been
  run. Creating it needs her separate approval and starts a monthly bill. The
  host will be `TM_PUBLIC_URL` if set, otherwise the Azure default;
  `app.truermeasure.com` is planned and configured nowhere. **So no URL is
  invented here, `REGISTRATION.url` stays null, and the buttons keep opening
  the demo and saying so underneath.**
- **School starts the free journey with no purchase step and no Stripe
  session**, from the same path as the paid card. A checkout opens only from
  "Start School & Life for {name}".
- **The handoff names are unchanged**: `currency` (CAD|USD|EUR, case
  insensitive) and `billing` (month|year), read in account mode, kept across
  the emailed sign-in link, then stripped from the address bar. Unknown values
  ignored.
  **Updated 3 November 2026**, app commit `19903d2`, read here: the sign-in
  link itself now carries both values, so a link opened on another device still
  opens with what the parent was shown on this website. The caveat recorded
  here on 2 November is closed and the names did not change. The other one
  stands and is not ours to fix: Stripe locks an account to the currency of its
  first subscription.
- **A purchase identifies the child and requires an explicit action.** The
  confirmation sheet shows "School & Life for {name}", the price and period,
  the taxes, the renewal, her cancellation sentence and the refund line, and
  with more than one child "It covers {name} only." Nothing is charged until
  the parent presses "Continue to payment".
- **Where her cancellation sentence is read now.** The website stopped showing
  it on 2 November. It appears on that confirmation sheet, beside the child's
  name and the price, and again on Stripe's checkout page.

- **Nothing a parent meets before paying mentions the reading limit, and that
  is hers to settle.** Corrected twice on 3 November 2026 after the app session
  flagged my wording, and each version checked in the source rather than taken
  on trust.

  **What exists.** Draft Terms 1.3 §1 carries a paragraph headed "Monthly limit
  on new readings": *"the app may pause new readings for the rest of the month
  when an account reaches a monthly limit on AI use. Anything you add while
  readings are paused is kept, and waits to be read."* Plain words, no figure,
  tagged counsel question 3f, which asks whether a figure or more precision is
  required.

  **Why that does not close it yet.** Draft 1.3 is unapproved and unpublished.
  The Terms that are live, and that this website links to from every page, are
  **1.2 of 3 October, which says nothing about a limit at all** — checked in
  `content/terms-of-service.mdx`. And no figure appears on the purchase
  confirmation sheet, anywhere else in the app, or on this website. The ceiling
  is enforced in `server/engine.js` from `TM_AI_CAP_FULL_USD` (US$10) and
  `TM_AI_CAP_SCHOOL_USD` (US$3), and the only thing a parent ever reads is the
  message once it is already reached: *"This month's readings are complete. New
  additions are kept and will be read next month."*

  **So where her brief of 2 November lands.** It asked to "preserve their
  existing disclosures elsewhere in the purchase journey and legal documents".
  The legal documents half exists in draft and arrives when counsel approves
  1.3. The purchase journey half does not exist anywhere. The pricing brief §4
  shows why that matters: a frequent family reaches about US$8.58 of a US$10
  ceiling in a normal month, so a parent can meet this limit without having
  been told it exists. Three ways out, none of them mine to choose: counsel
  settles 3f with a figure or keeps the plain description, the app says it
  before the purchase rather than after, or she gives wording for the website.

  **And the ceiling is per account today**, so two paying children share one
  US$10 allowance while paying twice. That is the same open question as item 4
  below, and it decides how often a family meets this at all.
- ~~**Flagged by the app session, for her:** the renewal sentence and the
  monthly/yearly choice sheet still say "a school year".~~ **Closed
  3 November 2026** on her authorisation, app commit `19903d2`, checked here:
  the price line reads "CA$507.60 for 12 months", the sheet asks "Monthly, or
  yearly?", and the renewal sentence ends "yearly means 12 months from the day
  you start." The website never carried the phrase, so nothing changed on this
  side; the two now agree.

**Removing the demo labels is one value, not an edit.** Setting
`NEXT_PUBLIC_TM_APP_URL` switches both buttons to the app, makes them carry
`?currency=` and `?billing=`, and removes `demoNote` under each button and
`demoOnly` under the cards. Verified on 2 November by building the launch mode
against a local host: both buttons came out as
`…/?currency=CAD&billing=month`, with the real currency and period stamped on
at the moment of the click, and the word "demo" appeared nowhere on either
page.

**The destination, as the app session reports it on 3 November.** It says Jolene
authorised creating production today, at
`https://truermeasure-app.azurewebsites.net` (Canada Central), locked to an IP
allow-list and a sign-in allow-list until her release decision, with
`app.truermeasure.com` not yet in DNS. **That address is recorded here as
inspected, not adopted.** Her brief says to use the production address only when
the app session confirms it exists and is ready, and an app behind an allow-list
with no DNS name is not ready. `NEXT_PUBLIC_TM_APP_URL` stays unset, the
committed buttons still open the demo, and the switch waits for her word.

Built locally against that host on 3 November and verified with
`check-launch-build.mjs --expect launch`: both buttons, in both languages, come
out as `https://truermeasure-app.azurewebsites.net/?currency=CAD&billing=month`,
byte-identical in English and French, and neither "demo" nor "démo" appears
anywhere on either page. The build was kept in the scratchpad, `out/` was
restored to the review build and re-verified as `--expect review`, and the
committed source is unchanged.

**The host is baked in, which decides the order of two steps.** A static export
writes the address into the HTML, so moving later from the Azure name to
`app.truermeasure.com` is a rebuild and a redeploy, not a redirect the website
absorbs. The name should be settled before the connected build is published, not
after.

**What the app confirmed on 3 November, which closes three dependencies.**
Against its launch commit `19903d2`:

- **The route and the parameters.** A new parent lands on `/`, and the app reads
  exactly `?currency=CAD|USD|EUR` and `?billing=month|year` there, carrying them
  through sign-in, including a link opened on another device. So
  `REGISTRATION.path` and the two names in `HANDOFF` are right as written.
- **No plan parameter is needed.** The free button and the paid button send the
  same URL, and that is correct rather than a gap: the app asks School or
  School & Life in its own onboarding, and currency and billing only pre-set
  what a parent sees if they later choose School & Life. `planParam` stays
  false.
- **The public address is planned, not live.** `app.truermeasure.com` is the
  intended name, on the app's own launch-prep page since 1 November, with no DNS
  record yet; the two Cloudflare records are her step. Until then production
  lives at the Azure name, locked. The app session will say when
  `app.truermeasure.com` answers, and **neither address is adopted here until
  she names one**.

**And one gate they agreed to record.** The public address must answer 200 from
outside the IP and sign-in allow-lists before any connected build is published.
That can only be checked at her release decision, because that is when the locks
come off. So it belongs in section 6's deployed plan, not in anything verifiable
today.

**And the charge matches what was read. Answered 3 November, and it was the
last thing on the handoff I could not see from here.** The 29 October gap, where
`server/billing.js` opened a Checkout Session with no currency and let Stripe
localise, closed in the app at `69d3f4a`. Every Session now carries the parent's
currency; anything outside cad/usd/eur is refused rather than guessed; adaptive
pricing is off so Stripe's own page cannot offer another currency; and a
customer who already paid in one currency gets a 409 instead of a second one.
One price per period carries all three amounts as currency options, so what a
parent pays is read from Stripe and never from the link.

Verified in the sandbox across all three currencies and both periods, six
checkouts on 29 October: CA$54.05 and CA$583.74 with tax added, US$47 with none
added, 47 EUR with VAT inside. **Live charging is untested and stays that way
until her release decision**, since no live purchase has been made.

**One thing for her eye, and it is her sentence, not a defect.** The page says
"Plus applicable taxes." under CA$47 and under US$47, which are her own words of
29 October. In the sandbox the US checkout collected no tax, so a parent in the
United States pays exactly US$47 while the page prepares her for more. The
sentence is not false, since no tax is applicable, and it stays correct if that
changes. Nothing was edited: it is priced copy, which is hers.

**The live prices now exist, which touches the price gate rather than the
handoff.** The app session reports creating them today on her authorisation and
re-reading them after: monthly `price_1UXkrCAJm8m0sW6oJ4LJ7DLO`, yearly
`price_1UXkrDAJm8m0sW6ohl0gxVaB`, product `prod_VYsc687ywnpdQT`, CA$47 and
US$47 tax-exclusive, 47 EUR tax-inclusive, 507.60 in each for the year, same tax
behaviour. **That is the app's record of her authorisation, not a word she has
given this side**, so `SHOW_PRICES` stays false and the website still shows no
price until she says so here. If the live amounts are her approval of the
amounts, it is one word and the review build becomes the launch build.

---

## 4. Legal and account-management links

**Live today and unchanged:** Terms at `/terms-of-service` and
`/conditions-d-utilisation`, linked in the footer of every page in the right
language; the Stripe customer portal as "Manage or cancel your membership";
`/withdraw` and `/fr/withdraw`. Verified on all 14 exported pages.

**The Stripe portal link.** `https://billing.stripe.com/p/login/eVq00igzb9Zj6Qz5k4e7m00`
is Stripe's own hosted sign-in for the portal configuration created on
30 September: a customer signs in with the email they paid with and a one-time
code, and can cancel at the end of the period, update the card and email, and
see invoices. It is not a per-customer link and it does not expire, so it keeps
working for every existing customer no matter what happens to the products or
prices behind it. **Nothing about it should be changed while a single
subscription exists**, and online cancellation is a legal requirement for
anyone who signed up online (California Bus. & Prof. Code 17602(d)). Reviewed,
not touched.

**A live payment link still sits in the code, and reaches no page.** Found on
3 November while answering the app session. `content/founding-families.ts:126`
holds `CHECKOUT_URL`, the live Founding Families v2 payment link
(`buy.stripe.com/28EeVc1Eh8Vf8YH6o8e7m0a`), on both `main` and the branch. It is
dead code: `SALES_PAUSED` is true at line 55, no component imports `CHECKOUT_URL`
or `checkoutReady`, and the string `buy.stripe.com` appears in none of the
14 exported pages and in none of the six live pages checked on truermeasure.com.
So **the website cannot take a payment today**, which is the fact that matters.
The app session then looked in Stripe, read-only, and reported that the account
holds 11 payment links and **none active**, so the link cannot take a payment
from either side. It is a tidy-up for after her approval, not a launch item, and
nothing here was changed.

**A 404 the app points at, now fixed on the branch.** The customer app's
agreement screen links `https://truermeasure.com/terms` and
`https://truermeasure.com/privacy`. Both 404 on the live site today. The Terms
exist at `/terms-of-service`, so `netlify.toml` now redirects `/terms` there,
301. `/privacy` is deliberately not redirected: the Privacy Policy is written,
translated and routed but held in `app/_pending` while counsel reviews it, and
a redirect to a page that does not exist is a second 404 with a longer path. It
goes in with the policy, in the same change.

**Updated 3 November 2026.** App commit `19903d2`, checked here: both links and
the consent version are now release settings (`TM_TERMS_URL`,
`TM_PRIVACY_URL`, `TM_CONSENT_VERSION`), their defaults are still the two
addresses that 404, a new open `GET /api/legal` returns all three, and
`deploy/release-check.js` refuses a release where either link does not answer
200 or the version still says "draft". So at release the app points straight at
`/terms-of-service` and at the published Privacy Policy, and this redirect
becomes a convenience for anyone who types `/terms` rather than something the
app depends on. It stays: the 404 is real either way.

**The Privacy Policy stays held.** `PRIVACY_POLICY_PUBLISHED` is false, the
consent line ends at "You can unsubscribe anytime." with no link, and
`check-launch-build.mjs` fails if any page links to it. The four-step
publication procedure is in `content/first-to-know.ts` and needs nothing from
me except her word and counsel's.

**Dependent on counsel:**
- The Privacy Policy, both languages, and with it the `/privacy` redirect and
  the consent links on the forms.
- The Terms the app records consent against. The app stores
  `terms-1.2+privacy-draft-2026-10-13`; the counsel package (draft Terms 1.3,
  Privacy 1.2) is prepared for her to send and nothing in it is approved.
- The refund policy, which the Terms will state and which I am not to invent.

**Dependent on the app session:**
- The production host, and with it the demo labels and the real destination.
- The new consent version pointing at the published documents, once they exist.
  Since 3 November this is a release setting rather than a code change.
- ~~Whether "a school year" stays in the renewal wording.~~ Closed 3 November:
  it is "yearly", and "12 months from the day you start".

---

## 5. What was verified locally, and what only a deployed host can show

**Verified locally, 2 November, in a real browser at 1280px and 390px, both
languages:**

- All three amounts are in the HTML and CSS shows exactly one. Simulating each
  country's outcome by setting `data-tm-currency` gave CA$47, US$47 and €47
  with the right tax line each time, and the other two stayed hidden.
- With no attribute at all — a visitor with JavaScript off, or a country
  Netlify cannot resolve — the page shows CA$47. Her rule.
- Monthly and yearly, both languages: 507.60 a year, 42.30 a month, 56.40
  saved, in all three currencies.
- Both buttons point at the demo, open in a new tab with `rel="noopener"`, and
  carry no currency parameter, which the demo would ignore anyway.
- The footer's three legal destinations, on every page, in the right language.
- No horizontal overflow at 390px or 1280px; nothing wider than the viewport.
- The two closing lines read as one block under both cards, in both languages.

**Two things that look like defects locally and are not:**

1. **The French footer turns English after the page loads.** Only in this
   preview, because the files are served as `/fr.html` and the footer reads the
   locale from the path: `/fr.html` is not `/fr`. On Netlify the URL is `/fr`
   and the footer is French — confirmed against the live site, which serves
   `/conditions-d-utilisation` and `/fr/withdraw` there today.
2. **The monthly/yearly toggle does nothing for the first second.** It is React
   state, so a click before hydration is ignored. The links are not affected:
   the click-time stamp in `app/layout.tsx` is installed before paint precisely
   so a parent clicking in that gap still carries the right currency.

**Needs the deployed host, and cannot be faked:**

- **The country detection.** `context.geo` exists only on Netlify's edge. The
  mapping is unit-tested and shared between the edge function and the page, but
  that a French visitor is served €47 is unproven until it runs there.
- **Caching with the edge rewrite.** The function deletes `content-length` and
  sets `vary: x-nf-country`. That two visitors in different countries do not
  share one cached copy has never been observed in production.
- **The redirects**, `/terms` included.
- **The forms end to end**, which is section 6.

---

## 6. The deployed verification plan, and the rollback

Nothing here is authorised. Each step needs her word, by name, and step 0 is
not optional.

**0. Before anything is deployed**, check that `git ls-remote origin main`
still equals the live deploy's `commit_ref`. The build hook builds `main` HEAD,
not a commit anybody names, so a maintenance redeploy is only a maintenance
redeploy while `main` has not moved. If they differ, stop.

**1. Publication of the new page** means merging the branch to `main` and
firing the hook, with the two launch variables set in Netlify first (Builds
scope, since a static export reads them at build time). Both must be set before
the build, not after: a deploy built without them has no prices in it.

**2. Immediately after, on the live site:**

| check | how | pass |
|---|---|---|
| the right commit | MCP `get-project` → `get-deploy-for-site` | `commit_ref` is the merge commit, state ready |
| prices are there | load `/` and `/fr` | one amount, the right tax line |
| the country | load from Canada and from one euro country | CA$47 and €47, no flash of the other |
| caching | reload each from both | no shared copy |
| no override | `curl https://truermeasure.com/?tm-country=FR` | still the real currency |
| buttons | click both, both languages | the demo, or the app with `currency` and `billing` |
| legal | `/terms`, `/terms-of-service`, `/conditions-d-utilisation`, `/withdraw`, `/fr/withdraw` | 200, right language |
| forms | one labelled test contact per form | contact created with the right tag |

**3. Rollback.** Netlify keeps every deploy, so the fastest rollback is
publishing the previous one from the dashboard: it is immediate and needs no
build. The slower one, which is the only option if a variable is what went
wrong, is to unset the launch variables and redeploy — that returns the live
site to a maintenance build with no prices and the buttons back on the demo.
Reverting the merge on `main` and firing the hook is the third, and the one to
use if the HTML itself is wrong.

A failed build is not a rollback problem: Netlify keeps serving the last good
deploy, so the site stays up.

---

## 7. What is actually left

**Hers to decide:**
1. Approval of this page. It has never been approved.
2. Approval of the three amounts, which turns the review build into the launch
   build.
3. Authorisation to create the production app, which is what makes a real
   destination possible and starts a monthly bill. **This one is not waiting on
   counsel** (app session, 3 November): production can be created and checked
   privately with the draft documents in place. What counsel gates is opening
   it to families, because the app's release check must pass before any real
   sign-up and it refuses a legal link that 404s or a consent version still
   marked draft.
4. The per-child versus per-account AI ceiling (pricing brief §2). It is per
   account today, so two paying children share one US$10 allowance while
   paying twice. With it comes **whether a parent is told the reading limit
   exists before paying rather than when they reach it**: today nobody is, and
   the only written description is in Terms 1.3, which counsel has not approved
   (see §3).
5. The refund policy, which blocks the Terms.
6. ~~Whether "a school year" stays in the app's renewal wording.~~ Decided
   3 November: it is gone, and the app says "yearly" and "12 months".
7. Live Stripe: the tax code on `prod_VWzNTXW9zLkKSH`, and the registrations.

**Counsel's:** Terms 1.3, Privacy 1.2, and the engagement that has not started.

**The app session's:** the production host, and the consent version that points
at whatever counsel approves.

**Mine, once any of those lands:** set two variables, build, check, screenshot,
and ask before anything goes live.
