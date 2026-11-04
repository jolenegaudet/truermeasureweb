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

**The click-time stamp is now proved, not asserted.** 3 November, in Chrome
against the connected preview, pressing the real monthly/yearly control rather
than setting the attribute by hand. English page, country set to France and
**Yearly** pressed: both buttons send
`https://app.truermeasure.com/?currency=EUR&billing=year`. French page, country
set to the United States and **Par annee** pressed: both send
`?currency=USD&billing=year`. Two parameters in each case, nothing else on the
URL, and the path is `/`. So the yearly case, which until now I had only
reasoned about, behaves the way the monthly case does.

**What an edited parameter can and cannot do, since it is now her decision.**
Confirmed with the app session on 3 November: the app takes `?currency=` as
given and passes it to Stripe with adaptive pricing off, which is her rule of
29 October, written while the website still had a currency selector: "the
currency selected on the website reaches the app and checkout, including a
visitor's manual override." The selector is gone, so the only thing left that
can change the currency is editing the parameter on the app's own URL after the
click. The app session recommends keeping that behaviour and changed nothing.

Two corrections worth having in the record, because the website's half is mine
to be exact about:

- **The browser's language and region change nothing here.** Checked in source:
  `netlify/edge-functions/currency.ts` reads `context.geo.country.code` and
  nothing else, and no file on the site reads `navigator.language` or
  `accept-language` for anything. So a parent cannot change the price she is
  shown by switching her browser's language. What the edge function resolves is
  what she reads.
- **`?tm-country=` is not a way in either.** It is gated behind its own
  variable, `NEXT_PUBLIC_TM_COUNTRY_OVERRIDE`, which is never set outside a
  local preview, and the build check fails if the string reaches an exported
  page at all (section 1).

**And the unknown country, proved on all three paths.** Asked by the app
session on 3 November and checked rather than answered from the comment.
`netlify/edge-functions/currency.ts` writes no attribute when Netlify cannot
resolve the country (`if (!chosen) return response`), and from there:

- The page shows **CA$47**, by `html:not([data-tm-currency]) [data-tm-price="CAD"]`
  in `app/globals.css:43`.
- The button sends **`currency=CAD`**, by
  `d.getAttribute("data-tm-currency") || "CAD"` in the click script, with
  `DEFAULT_CURRENCY` at `content/app-plans.ts:170`.
- The href baked into the exported HTML already reads `currency=CAD`, so a
  middle-click or a click before hydration carries it too.

Verified in the browser as well as in source: with the attribute removed, the
only visible price is CA$47 and both buttons send `?currency=CAD&billing=month`.
So the website's unknown case is CAD everywhere, which is her rule, and it is
still CAD today.

**Her decision on the other half, and it is US$.** Reported by the app session
on 4 November, in her words: "When the website did not choose, choose US$47."
That went against the app session's own recommendation, which had been CA$, and
it is hers, so it stands. The app session says it is live as its release
`eb6d27d`, on production at 17:14 UTC, with 54 of 54 production checks and 766
of 766 unit tests passing. That is its report of her decision and its own
verification, not a word given on this side and not something checkable from
here.

What it changes, as the app session describes it:

- The app no longer guesses a currency from the browser's language. The
  `navigator.languages` path recorded here on 3 November is gone.
- With no choice from the website, the app shows US$ and its server uses `usd`
  when it is sent no currency.
- The app still honours any currency the website sends, including the `CAD` the
  buttons send for a visitor Netlify cannot place.
- Editing `?currency=` after the click is unchanged, so the one exposure below
  still reads as it did.

**So the two halves now answer the same question differently.** The website's own
unplaceable visitor stays CA$47, because the website did choose, and the app
honours that choice. US$ applies only to a parent who reaches the app without
pressing a website button, by typing the address, a bookmark, or a shared link on
another device. Nothing on the website decides that case and nothing here can
change it. Whether the split is intended or an accident of where the question was
asked is hers to say, and it is item 9 of section 7.

A wrong default is visible rather than hidden: the app's confirmation sheet
prints the sign in front of the figure, CA$, US$ or the euro sign, and Stripe's
own page prints it too, so a parent can see it and is simply likely to miss it,
since only the sign differs and the figure is 47 either way. That was true of the
browser guess and it is true of the US$ default.

So the exposure is exactly one: a parent who edits the app's URL sees that
currency's amount on the app's confirmation sheet and pays it. Every figure is
47 or 507.60, tax follows the billing address, and a family that has already
paid in one currency is refused a second, so no amount on this page can be
contradicted by a charge. **If she decides to close it, the app session comes to
this side first**, because any check depends on how the website resolved the
country in the first place.

**The language defect is the website's alone.** The app session checked on
3 November: the app is English only, every page declares `lang="en"`, and no page
carries French text, so item 8 of section 7 does not exist there. French in the
app sits behind counsel's question on Quebec and French.

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
- **The public address now exists.** `app.truermeasure.com` answered from this
  machine on 3 November at 20:46 UTC, and I checked it here rather than relaying
  it: DNS resolves through her Cloudflare CNAME to
  `waws-prod-yt1-117-7c06.canadacentral.cloudapp.azure.com` (20.116.40.17), the
  certificate is `CN=app.truermeasure.com` issued by GeoTrust TLS RSA CA G1,
  valid 3 November 2026 to 3 May 2027, `http` redirects to `https` in one hop,
  and `/` and `/?currency=EUR&billing=year` both answer 200. **Still not adopted
  here.** This machine is inside the allow-list, which is exactly why the 200
  proves the address and not the gate, and which address the buttons take is her
  word to give.

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

**A live-mode payment link still sits in the code, switched off at both ends.**
Found on
3 November while answering the app session. `content/founding-families.ts:126`
holds `CHECKOUT_URL`, the live Founding Families v2 payment link
(`buy.stripe.com/28EeVc1Eh8Vf8YH6o8e7m0a`), on both `main` and the branch. It is
dead code: `SALES_PAUSED` is true at line 55, no component imports `CHECKOUT_URL`
or `checkoutReady`, and the string `buy.stripe.com` appears in none of the
14 exported pages and in none of the six live pages checked on truermeasure.com.
So **the website cannot take a payment today**, which is the fact that matters.
The app session then looked in Stripe, read-only, and reported that the account
holds 11 payment links and **none active**; on 4 November it read this one by id,
`plink_1ULSNk…`, and reported it **inactive**. So the constant points at a dead
link, not at a point of sale, and neither side can take a payment. It is a
tidy-up for after her approval, not a launch item, and nothing here was changed.

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
3. ~~Authorisation to create the production app.~~ **Done 3 November**, on her
   authorisation reported by the app session: production exists, locked to her
   address plus Stripe's webhook servers, purchases closed behind the app's own
   live-payments switch, at `https://app.truermeasure.com`. What is left of this
   item is **which address the buttons take**, which is hers to name here. What
   counsel gates is opening it to families, because the app's release check must
   pass before any real sign-up and it refuses a legal link that 404s or a
   consent version still marked draft.
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
   The live School & Life prices now exist (`price_1UXkrCAJm8m0sW6oJ4LJ7DLO`
   monthly, `price_1UXkrDAJm8m0sW6ohl0gxVaB` yearly, product
   `prod_VYsc687ywnpdQT`), so the open part is the tax treatment, not the
   amounts. **Two promotion codes in that account are still active**, which is
   worth one look before anything opens. Read here on 4 November by running her
   own `scripts/check-discount-codes.ps1`, which only GETs, with the pricing key
   already in the sibling secrets folder. Nothing was widened and nothing was
   changed. Eleven codes exist; nine are inactive. The two live ones:

   - **`EARLY100`**, cap 2, 0 redeemed, never expires. The app session read its
     coupon as `KM1KNBak`, 100% off **forever**, so a redemption is a permanent
     free membership and not a free first period. It recommends she deactivate
     it unless she means it for two people.
   - **`FOUNDINGFAMILY`**, cap 50, 0 redeemed, never expires. This one the app
     session did not report and this run found. Its coupon is the 30 September
     founding discount, CA$20 / US$15 / €12 off for three months, which against
     a 47 price is not a disaster and is still not what any page says.

   `TEST100` is fully inactive, which supersedes my 7 September note of one
   redemption left: three codes carry it, with **3 redemptions between them**,
   exactly matching the three US$0.00 July checkouts. With `EARLY100`,
   `FOUNDING40` and all four `FOUNDING47` codes at 0, that is good circumstantial
   evidence that `sub_1Tw71d` is one of her own tests. It is not proof, because
   linking a subscription to a coupon needs invoice access neither session has.

   **What makes the live codes harmless today is not their caps: no entry point
   exists.** All 11 payment links are inactive and the app's Checkout sets no
   `allow_promotion_codes`, so Stripe shows no code field at all. That guard is a
   design decision in the app rather than a setting on the codes, so the day
   anyone enables promotion codes for a launch promotion, both live codes wake up
   together. Check the codes before enabling that, not after. The app session has
   undertaken to check every code and tell this side before shipping such a
   change.

   One note on how this was read, since it is her own rule: her pricing key reads
   promotion codes but is 403 on coupons, and the app's key reads coupons. So
   between the two sessions the picture is complete and **neither key was
   widened**, which is the arrangement to keep.
8. **The French pages declare themselves English.** Found 3 November and **not
   caused by this branch**: it is the same on `main` and on the live site, so it
   is a standing defect rather than a release item. `app/layout.tsx:131` sets
   `<html lang="en">` for every exported page, and each French page marks its
   own content with one `<div lang="fr">`. Checked in the browser on
   `/fr/hidden-report-card`: the `h1` is correctly French, but the header
   ("Bienvenue a la juste mesure de votre enfant !"), the whole footer
   (Suivez-nous, Conditions d'utilisation, Gerez ou annulez votre adhesion,
   Retractez-vous) and the `<title>` ("Le rapport cache | Truer Measure") are
   all declared English. Worse, `/conditions-d-utilisation` carries **no**
   `lang="fr"` anywhere, so the entire French Terms are declared English. It
   costs her nothing today and it costs a French screen-reader user the right
   pronunciation, and it is a signal search engines read. The fix is not a
   one-liner: a static export under one root layout has one `<html>` tag, so a
   per-language `lang` means either a locale route segment or two route groups
   with their own root layouts. That is a structural change to a page she is
   reviewing, so **nothing was touched** and it waits for her word.

9. **Whether the website's unplaceable visitor should also be US$47.** Her
   decision of 4 November, as the app session reports it, was "when the website
   did not choose, choose US$47", and it is live in the app. It can be read two
   ways on this side. Strictly, the website always chooses: when Netlify cannot
   resolve a country the page falls back to CA$47 and the button sends
   `currency=CAD`, so her rule never applies here and nothing changes. Read by
   intent, the case she was deciding is a parent nobody can place, and that
   parent meets the website first. Today the two halves answer it differently,
   CA$ here and US$ there, which is a defensible split and may also be an
   accident of where the question was asked. If she wants the website to match,
   it is two lines, `DEFAULT_CURRENCY` at `content/app-plans.ts:170` and the
   `html:not([data-tm-currency])` rule at `app/globals.css:43`, and it would
   change what an unplaceable parent reads before paying. **Nothing was
   touched.** CAD leads because her brief said CAD leads, and only she can say
   whether today's decision reaches this far.

**Counsel's:** Terms 1.3, Privacy 1.2, and the engagement that has not started.

**The app session's:** the consent version that points at whatever counsel
approves, and the word that the public address answers from outside its
allow-lists, which can only be true once the locks come off at her release
decision. The host itself is settled.

**Mine, once any of those lands:** set two variables, build, check, screenshot,
and ask before anything goes live.
