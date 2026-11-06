# The release candidate, and what stands between it and publication

2 November 2026. Branch `app-plans-2026-10-28` at the commit this document
lands in. `main` is untouched at `042fce6`, which is also what is live. Nothing
here has been published, no price has been approved, and no payment is live.

Her brief of 2 November: preserve the approved page, prepare the actual launch
build, prepare the connection to the customer app, prepare the legal and
account-management links, coordinate the GoHighLevel work, verify the release
candidate, and say what remains.

---

## 0. 4 November: she approved the amounts and named the address

Her words, in full, because the rest of this document now reads against them:

> "Oui, prépare la version de lancement avec les boutons vers
> https://app.truermeasure.com et les prix déjà approuvés : CAD : CA$47/mois ou
> CA$507.60 payés en une seule fois pour douze mois, plus taxes applicables.
> USD : US$47/mois ou US$507.60 payés en une seule fois pour douze mois, plus
> taxes applicables. EUR : 47 €/mois ou 507,60 € payés en une seule fois pour
> douze mois, TVA incluse. Conserve la devise automatique sans sélecteur, le
> choix mensuel ou annuel et un abonnement par enfant. L'inscription École reste
> gratuite."

So two of the three things this document was waiting on are answered: the
amounts are approved, and `https://app.truermeasure.com` is the address the
buttons take. **The third is not.** She asked to see the connected preview and
validate the presentation, so the page is still awaiting her eye, and nothing
is published.

**Built and verified on 4 November**, with
`scripts/launch-build.ps1 -Mode launch -AppHost https://app.truermeasure.com`,
then `check-launch-build.mjs --expect launch --app-host …`: *out/ is a LAUNCH
build, 14 pages checked, nothing wrong, 27 framework entries present in both
languages.* Served for her at `http://127.0.0.1:3201`, unpublished.

Read in a real browser, both languages, all three currencies, both periods:

| | monthly | yearly | tax line |
|---|---|---|---|
| CAD | CA$47 | CA$507.60, CA$42.30 a month, saves CA$56.40 | Plus applicable taxes. / Plus les taxes applicables. |
| USD | US$47 | US$507.60, US$42.30 a month, saves US$56.40 | same |
| EUR | €47 | €507.60, €42.30 a month, saves €56.40 | VAT included. / TVA incluse. |

Every figure matches her sentence. **One thing does not, and it is hers to
settle:** she wrote the euro the French way, `47 €` and `507,60 €`, and the page
writes `€47` and `€507.60` in both languages, sign first and a decimal point.
That is the house style the dollar amounts use too (`CA$47` on the French page,
which she approved in the same sentence), so it is consistent rather than wrong.
Nothing was changed.

**Her second rule of 4 November, and the signed link.** Relayed by the app
session in her words: *"Aucun sélecteur de devise pour les parents. Sur le
site : Canada détecté → CAD ; zone euro détectée → EUR ; autre pays ou
localisation inconnue → USD. Dans l'app : utiliser la devise légitimement
transmise par le site. Si aucune devise n'est transmise, utiliser USD. Lorsqu'une
devise de facturation est déjà établie pour un compte, la conserver pour ses
abonnements, même si le parent voyage."* And: *"Je ne veux pas qu'un parent
puisse choisir un tarif moins cher simplement en modifiant l'URL ou la requête de
paiement."*

The first three lines were already what `content/currency-map.ts` did. Two
things changed:

- **The unknown country is USD** (commit `ce99b5c`), in the three places that
  encoded it and nowhere else: `CURRENCY_WHEN_UNKNOWN`, the
  `html:not([data-tm-currency])` rule in `app/globals.css`, and
  `DEFAULT_CURRENCY`, which is what a button sends when the page carries no
  attribute. Those three must never disagree, because the amount on the page and
  the currency in the link are one promise. Verified in a browser, both
  languages: no attribute shows US$47 and sends `currency=USD`; Canada still
  CA$47 and CAD; the eurozone still €47 and EUR.
- **The link is signed.** `?currency=` is plain text, so anyone could type CAD
  and read the cheapest of the three. The edge function now signs the currency
  it has just decided and the button carries it as `cs=<exp>.<sig>`, base64url
  HMAC-SHA256 over `tm-currency-v1:<CUR>:<exp>`. The contract was settled with
  the app session on 4 November, and three details in it are worth the record:
  signed pages go out `no-store`, because a signature with an expiry inside a
  cached body would be handed to every visitor and outlive its own `exp`; the
  USD fallback is signed too, so "no currency transmitted" means exactly one
  thing on the app's side, a parent who did not come through a button; and the
  lifetime is **seven days, not twenty-four hours**, because the signature is
  what stops a parent typing CAD while a short expiry only costs a Canadian who
  clicks the next day, who would then be charged US$47, which is more.

**The key is not in this repository and cannot be.** It lives in
`TM_CURRENCY_KEY` in the sibling `.secrets` folder and, in production, in
Netlify's environment, read only by the edge function, which runs server side.
`scripts/check-launch-build.mjs` now fails if `data-tm-cs=` or the key's value
reaches any built file, `_next` chunks included; the guard was proved by feeding
it a file that carried a stamp. **Without the variable set, nothing breaks:** no
key means no signature, which is exactly today's behaviour, so this can be
deployed before she sets it. **Setting it in Netlify is a change to her
infrastructure and waits for her word.**

Cross-checked rather than assumed: the shipped `currencyStamp` and an
independent `node:crypto` HMAC produce the same signature for all three
currencies, and `exp` lands at `now + 604800`. The app session then ran three real
signed URLs from this build through its own verifier (`server/currency.js`,
app commit `7cb65dd`) with the key from the secrets folder: each currency is
accepted as itself, and **CAD written over the USD or the EUR signature is
refused**, which is the property her rule actually asks for. Expiry read back as
12 November 2026 00:22 UTC. So the contract holds end to end, by two
implementations that were written apart.

**Proved in a real browser on 4 November, sixteen cases.** Her words, relayed
by the app session, authorised restarting a preview for exactly this. The test
runs the edge function's own code locally: `scripts/`-side nothing changed, a
simulator in the scratchpad imports `content/currency-map.ts` and calls
`currencyForCountry`, `currencyStamp` and `withCurrencyAttribute` in the same
order the edge does, with the country arriving as `?sim-country=XX` instead of
from Netlify. Two languages × four placements × two periods:

| placed | shows | the click produces |
|---|---|---|
| Canada | CA$47 | `currency=CAD&billing=month|year` **with `cs`** |
| euro area | €47 | `currency=EUR&…` **with `cs`** |
| elsewhere | US$47 | `currency=USD&…` **with `cs`** |
| country unknown | US$47 | `currency=USD&…` **without `cs`** |

In every signed case the `cs` in the link is the exact attribute the edge wrote,
and the response carried `cache-control: no-store`.

**The last row is the one to understand, and it corrects something said earlier
in this exchange.** When Netlify cannot resolve a country at all,
`currencyForCountry` returns null, the edge returns the page untouched, and
there is no attribute to sign. So "the USD fallback is signed" is true of a
visitor placed somewhere outside Canada and the euro area, and false of a
visitor who could not be placed. It costs nothing: the page shows US$47, the
button sends `currency=USD` unsigned, and the app reads an unsigned currency as
none, which its own rule turns into USD. Same answer by both paths. What it does
mean is that an unplaceable visitor cannot be told apart from someone who typed
the address, and neither can get a cheaper price by trying.

**And the refusals, which are the actual point.** The app session put all
fourteen clicked URLs through its verifier, plus **48 edited copies**: for each
signed URL, the currency changed to each of the other two with the signature
kept, the signature removed, and the expiry pushed by one second. **All 48 were
refused**, so USD. The case her rule names in so many words, CAD swapped onto a
euro-area signature, is refused in all four combinations of language and period.
The expiry edit failing matters on its own: it shows `exp` is inside what is
signed rather than beside it. The two unsigned clicks read as USD, as designed.

So the property holds in both directions, tested by the side that did not write
the signer.

**What this does not prove.** The simulator stands in for Netlify resolving the
country from the request and for Netlify's environment holding the key. Both are
only testable on a deploy. Local preview means the browser click plus the app
session's verifier; Netlify means after she sets `TM_CURRENCY_KEY` and a deploy
carries it, and nothing is deployed without her word.

**No private preview exists on this plan, checked rather than assumed.** She
asked on 4 November whether the current plan allows a genuinely private Netlify
preview, and said no new plan is authorised. Read through the Netlify connector:
the team `jolene-s4g9am` is type **Personal** and the project `truermeasureweb`
is on plan **`nf_team_dev`**, with `requiresPassword: false` and no password
scope set. Netlify's password protection is a paid feature, documented as Pro
and above for all deploys and, in the current knowledge base, Enterprise for
protecting non-production deploys only. So on this plan a branch deploy or
deploy preview is a public URL that happens to be unlisted, which is not the
same thing as private.

Two further facts make it moot rather than merely unavailable. Every deploy in
this site's history has `deploy_source: "api"`: the GitHub handshake never
completed, `quick_setup_in_progress` is stuck, and there is no branch-deploy
mechanism wired at all. And a branch deploy would need the branch pushed, which
her standing instruction keeps unpublished.

**So these three checks are deferred to the final deploy, and they are not
done:**

1. **The key arrives.** `TM_CURRENCY_KEY` is readable by the edge function at
   runtime, which means a signed page carries `data-tm-cs`. If it does not, the
   failure is silent: no signature, no `cs`, and every visitor reads as USD on
   the app's side with no error anywhere. **She created the variable on
   4 November**, in her words, "Variable créée", after being given the clicks.
   Neither session has read it back: the variable was deliberately left
   unflagged, so the connector would return its value, and printing a secret to
   check it is worse than waiting for the deploy to show it. So the variable
   exists on her word, and whether it holds the right value and reaches the edge
   is exactly this check.

   **Half of it can be closed before the deploy, and a script now does it.**
   The app session verified its own side by fingerprint rather than by value:
   the App Service setting and the `currency-link.env` line both print
   `86eb075b`, which is the first eight characters of the SHA-256. Confirmed
   independently here from the same file, which is what makes the number
   meaningful rather than relayed. `scripts/check-currency-key.ps1`, with
   `Check currency key.cmd` beside it, compares the clipboard against that file
   and prints MATCH or DIFFERS and two fingerprints, never a value. So after
   copying the value out of Netlify she can know in one step whether her paste
   was right, instead of finding out at the deploy. Tested both ways: a wrong
   value prints DIFFERS, the right one prints MATCH.

   What stays deferred is the half no local check can reach: that Netlify hands
   the variable to the edge function at runtime.
2. **Netlify places the visitor.** `context.geo.country.code` resolves for real
   requests, so a Canadian sees CA$47 and a French visitor €47. Nothing local
   can test this: the simulator supplies the country itself.
3. **The signed journey end to end on the real host**, one click per currency
   from the published page through to the app's verifier.

Until those run, the signature work is proved locally and on two
implementations, and unproved on the platform that will serve it.

**What stands between this build and publication, checked on 4 November.** The
app session answered the half it owns, and two of the three gates turn out to be
on this side or in her lawyer's inbox rather than in Azure.

- **Opening the app is small and reversible: two settings.**
  `TM_OPEN_TO_PUBLIC=yes` (which also lifts the Azure network restriction
  through `deploy/azure-accounts.sh`) and an empty `TM_SIGNIN_ALLOW`, about two
  minutes, undone the same way, 60 to 90 seconds to reach every front end. The
  Kudu site stays locked. Reported by the app session, which corrected its own
  first answer after reading the deploy script.
- **Purchases are a separate third switch, and this is the mismatch to see
  before publishing.** `TM_ALLOW_LIVE_PAYMENTS` is unset, so with the app open
  but payments closed a parent can sign up and use free School, and the app
  shows no price and no buy button. This page would be quoting CA$47, US$47 and
  €47 to a parent who then arrives somewhere with nothing to buy.
- **No Privacy Policy is public anywhere.** Checked here, not relayed:
  `/privacy`, `/privacy-policy` and `/politique-de-confidentialite` all 404 on
  truermeasure.com today. The app's release check refuses a release where its
  Terms or Privacy link does not answer 200, so that check cannot pass against
  this site as it stands. The policy is written, translated, routed and held in
  `app/_pending` behind `PRIVACY_POLICY_PUBLISHED = false`, which is one switch
  on this side, and behind counsel, who has never been engaged.
- **The Terms are version 1.2 and the branch does not change them.** Checked:
  `content/terms-of-service.mdx` reads "Version 1.2 · Effective 3 October 2026"
  on this branch **and** on `main`, byte for byte. So publishing does not bring
  newer Terms with it. A parent would agree to Terms written for the old offer
  while reading the new amounts. Terms 1.3 is drafted and unapproved. Nothing
  here writes or edits legal text.
- **The `/terms` loop is not one.** The app session raised it, and the
  netlify.toml comment already records the answer: from app commit 19903d2 the
  app points straight at `/terms-of-service`, which answers 200 live today. The
  `/terms` redirect on this branch is for anyone who types it. `/privacy`, above,
  is the real coupling.
- **Receipts: settled.** Her words, reported 4 November: *"Receipts on."* The app
  session adds that checkout uses one Stripe customer per account carrying the
  parent's sign-in email, and that all twelve first-payment test invoices carry
  it.

**The order, agreed with the app session and unchanged:** the app opens, this
side verifies `app.truermeasure.com` answers 200 from outside her network, and
only then does the website publish. A static export bakes the address into the
HTML, so publishing is a rebuild and a deploy rather than a flag, and buttons
published before the app opens would lead parents to a refusal.

**The handoff, proved rather than assumed.** Twelve cases, two languages × three
currencies × two periods, each in a fresh browser: every click produces exactly
`https://app.truermeasure.com/?currency=<CUR>&billing=<PERIOD>`, two parameters,
path `/`, on both buttons. One case failed first time and five re-runs of it
passed; the failure was the test harness clicking before the toggle had
rendered, which the attribute on `<html>` showed directly. The unknown-country
case still reads CA$47 and sends `currency=CAD`.

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
`app.truermeasure.com` not yet in DNS. **That address was recorded here as
inspected, not adopted, until she named it on 4 November** (section 0). Her brief
said to use the production address only when the app session confirms it exists
and is ready, and an app behind an allow-list with no DNS name was not ready.
What changed is her word, not the allow-list: the Azure name below is still only
inspected, `app.truermeasure.com` is the address she chose, and the committed
source still carries no host, because `NEXT_PUBLIC_TM_APP_URL` is a build
variable rather than a file.

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
**Read this block as the 3 November state. She changed it on 4 November and the
answer is now USD; the correction is at the end of the block and in section 0.**
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

**That split lasted one day, and she closed it.** Everything above describes the
3 November code. Later on 4 November she gave the rule as a whole: *"Canada
détecté → CAD ; zone euro détectée → EUR ; autre pays ou localisation inconnue →
USD"*, with *"coordonne avec WEB pour appliquer USD comme solution de repli, en
anglais et en français, si le site utilise encore CAD."* That is a direct
instruction to this side, so the three places above were changed together in
commit `ce99b5c`: `CURRENCY_WHEN_UNKNOWN`, `app/globals.css:43` and
`DEFAULT_CURRENCY` all read USD. **An unplaceable visitor now sees US$47 and the
button sends `currency=USD`**, which is what the app already answers, so the two
halves agree. The CA$ readings in the bullets above are history, kept because the
proof method is worth keeping, not the value. Section 0 has the verification.

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
  and `/` and `/?currency=EUR&billing=year` both answer 200. **Adopted on
  4 November**, in her words, and built against (section 0). The caveat on that
  200 stands and is now the one open item: this machine is inside the allow-list,
  so it proves the address and not the gate.

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
  Netlify cannot resolve — the page shows CA$47. Her rule **as it stood on
  2 November**. She changed that case to USD on 4 November, and the same check
  was re-run in a browser after the change: US$47, both languages.
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

  **And a deploy alone does not prove it.** Netlify reads the country from the
  requesting IP, and that cannot be spoofed in production, so no deploy made
  from this machine can show the euro case. **Proving €47 needs a real request
  from the euro area:** a VPN on her machine, or a person in France or Belgium
  loading the page. CAD can be proved from here. EUR cannot, from any deploy.
  This is a thing somebody has to do, not a check that falls out of publishing.

  *Ruled out on 5 November, so it is not proposed again.* `check-host.net`
  requests a URL you name from nodes in many countries, free and without an
  account, and the app session has been using it against the app's allow-list.
  It cannot do this job. Its HTTP check returns the status code, the reason and
  the timing, and never the body or the headers, so it can tell 200 from 403
  but cannot see `data-tm-currency="EUR"`. Making the currency visible in a
  status code would mean bending the site to suit the instrument. Two further
  reasons, both the app session's: a URL handed to it goes to a third party and
  may appear in its public results, which would destroy the only privacy an
  unlisted draft deploy has, and a rented vantage point is not a parent.
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
1. Approval of this page. **Still open**, and now the first thing: she asked on
   4 November to see the connected preview and validate the presentation, which
   was served for her locally and unpublished, first on `http://127.0.0.1:3201`
   and then, with the signing simulator, on `http://127.0.0.1:3202`. **Neither
   is running now.** Claude Code stopped both background servers when the
   machine ran critically low on memory, which is not a fault in the site: the
   files in `out/` still pass `scripts/check-launch-build.mjs`. A preview can be
   restarted on her word, and the screenshots she has are from that build.
2. ~~Approval of the three amounts, which turns the review build into the launch
   build.~~ **Done 4 November**, in her own sentence, quoted in section 0. The
   one detail left inside it is the euro's typography, `€47` as the page writes
   it against `47 €` as she wrote it, which is a style question and not an
   amount.
3. ~~Authorisation to create the production app, and which address the buttons
   take.~~ **The address is settled: `https://app.truermeasure.com`,** named by
   her on 4 November and built against. What survives of this item is **not
   hers**: the app is still locked to her network, so a visitor following a
   button from the published site would be refused. That is the release gate
   below and it belongs to the app session. Original note: **Done 3 November**, on her
   authorisation reported by the app session: production exists, locked to her
   address plus Stripe's webhook servers, purchases closed behind the app's own
   live-payments switch, at `https://app.truermeasure.com`. What is left of this
   item is **which address the buttons take**, which is hers to name here. What
   counsel gates is opening it to families, because the app's release check must
   pass before any real sign-up and it refuses a legal link that 404s or a
   consent version still marked draft.
4. ~~The per-child versus per-account AI ceiling (pricing brief §2).~~
   **Decided 4 and 5 November.** Her words, as the app session pasted them:
   *"Je valide un plafond interne de 10 US$ par mois civil pour chaque enfant
   abonné à School & Life. Chaque enfant payant a sa propre allocation. Pour
   School gratuit, conserve une allocation de 3 US$ par compte, partagée entre
   les enfants gratuits et séparée des allocations payantes. Je n'autorise pas
   3 US$ par enfant gratuit."* Then, on 5 November: *"Je valide un plafond
   global de 50 US$ par mois civil pour l'ensemble de l'usage gratuit, à
   l'intérieur du plafond Anthropic de 200 US$."* So the defect is closed: a
   paying child has their own US$10 and no longer shares. The US$50 caps all
   free use together and not each free child, which is the distinction worth
   not losing. Paid top-ups are deferred. Live in the app at `6b1a37b`.

   **What survives of this item is the second half, and it is still open:**
   whether a parent is told the reading limit exists, and with a figure, before
   paying rather than when they reach it. The app's purchase confirmation now
   says there is a monthly allowance and states no number. Whether a number is
   required is counsel's question 3f, so this moved from her column to
   counsel's. Nothing on this website mentions a limit at all, and if counsel
   says a figure is required before payment, the page that must carry it is
   mine.
5. The refund policy, which blocks the Terms.
6. ~~Whether "a school year" stays in the app's renewal wording.~~ Decided
   3 November: it is gone, and the app says "yearly" and "12 months".
7. Live Stripe: the tax code on `prod_VWzNTXW9zLkKSH`, and the registrations.
   The live School & Life prices now exist (`price_1UXkrCAJm8m0sW6oJ4LJ7DLO`
   monthly, `price_1UXkrDAJm8m0sW6ohl0gxVaB` yearly, product
   `prod_VYsc687ywnpdQT`), so the open part is the tax treatment, not the
   amounts. **The discount codes are closed. On 4 November every promotion code
   in that account is inactive**, and the look that found the two live ones is
   below, because the reasoning is worth keeping even though the answer changed
   the same day. Read here by running her own
   `scripts/check-discount-codes.ps1`, which only GETs, with the pricing key
   already in the sibling secrets folder. Nothing was widened and nothing was
   changed by the reading. Eleven codes exist; nine were already inactive. These
   two were not:

   - **`EARLY100`**, cap 2, 0 redeemed, never expires. The app session read its
     coupon as `KM1KNBak`, 100% off **forever**, so a redemption is a permanent
     free membership and not a free first period. It recommends she deactivate
     it unless she means it for two people.
   - **`FOUNDINGFAMILY`**, cap 50, 0 redeemed, never expires, and no
     first-time-buyer restriction. This one the app session did not report and
     this run found; it had been looking codes up by name. Its coupon is
     `WAJkw9F9`, "Founding Families: first 3 months", CA$20 / US$15 / €12 off
     repeating for three months, never used. **It applies to any product,
     School & Life included**, which is the part that matters: it is not stranded
     on the retired founding product, it would discount the price she is about to
     sell. Against a 47 price that is not a disaster, and it is still fifty
     places at an amount no page states.

   `TEST100` is fully inactive, which supersedes my 7 September note of one
   redemption left: three codes carry it, with **3 redemptions between them**,
   exactly matching the three US$0.00 July checkouts. With `EARLY100`,
   `FOUNDING40` and all four `FOUNDING47` codes at 0, that is good circumstantial
   evidence that `sub_1Tw71d` is one of her own tests. It is not proof, because
   linking a subscription to a coupon needs invoice access neither session has.

   **The lesson to keep, now that the answer is academic:** what made those codes
   harmless on the morning of 4 November was not their caps, it was that no entry
   point existed. All 11 payment links are inactive and the app's Checkout sets
   no `allow_promotion_codes`, so Stripe shows no code field at all. That guard
   is a design decision in the app rather than a setting on the codes, which is
   why it was worth closing the codes themselves rather than relying on it. Check
   the codes before enabling promotion codes, not after. The app session has
   undertaken to check every code and tell this side before shipping such a
   change.

   **Her decision, and it closed the same day.** Her words, as the app session
   pasted them on 4 November: *"I also authorize deactivating both old promotion
   codes: EARLY100 and FOUNDINGFAMILY. Keep existing subscriptions unchanged, and
   confirm when both codes are inactive."* The app session deactivated both
   through the API, left the coupons and every subscription alone, and read them
   back. **Confirmed independently from this side**, by running her listing script
   again after the change: all eleven codes now report active `no`, `EARLY100`
   twice and `FOUNDINGFAMILY` once among them, each at **0 redemptions**, so
   nobody lost a discount they had. Her "keep existing subscriptions unchanged"
   holds too: `sub_1Tw71d` is still active and the other three still cancelled.
   Before this, the phrase "Codes off" was going round; it was the app session's
   own drafted reply and never her wording, and the sentence above is the
   authorisation.

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

9. ~~Whether the website's unplaceable visitor should also be US$47.~~
   **Decided 4 November and done.** She gave the whole rule herself, not through
   a reading of the app's half: *"autre pays ou localisation inconnue → USD"*,
   and *"applique USD comme solution de repli, en anglais et en français, si le
   site utilise encore CAD."* The site did still use CAD, and the three places
   that encoded it now read USD (`ce99b5c`). Nothing is left to decide here.

10. **Which Terms are the published Terms, and where the two legal addresses
    point.** Found on 5 November, and it corrects something this side said
    earlier the same day. The app session read its production settings:
    `TM_TERMS_URL`, `TM_PRIVACY_URL` and `TM_CONSENT_VERSION` are **all three
    empty**. So the app's release check refuses today no matter what this
    website answers, and the sentence "if the check points at
    /terms-of-service it passes now" was wrong. There is no technical fallback
    to point at: the values get set, by hand, to addresses she has approved.

    That makes this a decision rather than a configuration, and it splits in
    two, which is the useful part:

    - **The Terms half she could close today.** `/terms-of-service` answers 200
      and carries *Version 1.2, Effective 3 October 2026*, verified on
      5 November to be the same string live and in this build. If she
      designates 1.2 as the approved Terms, the app session sets
      `TM_TERMS_URL` and that half passes immediately, with no counsel and no
      refund policy. If she wants the new Terms instead, this half joins the
      queue behind counsel and behind item 5.
    - **The Privacy half she cannot close the same way,** because no privacy
      page exists at any address on this domain. Re-verified 5 November, eight
      paths, all 404 but `/terms-of-service`. There is nothing to point
      `TM_PRIVACY_URL` at until the text is approved and published.

    One thing to know before she chooses 1.2: the live Terms themselves say the
    Privacy Policy and the End-User Licence Agreement "are being finalised and
    will be published on this site." Designating 1.2 as approved therefore
    publishes a promise of a privacy policy that does not yet answer. That is
    not a reason against it. It is a reason the privacy page should not lag far
    behind, and it is hers to weigh rather than mine.

**Counsel's:** Terms 1.3, Privacy 1.2, and the engagement that has not started.

**The app session's:** the consent version that points at whatever counsel
approves, and the word that the public address answers from outside its
allow-lists, which can only be true once the locks come off at her release
decision. The host itself is settled.

**Mine, once any of those lands:** set two variables, build, check, screenshot,
and ask before anything goes live.

---

## 8. 5 November: the legal pages are readable and still unpublishable

Her instruction, in her own words: *"Prepare la Politique de confidentialite a
`https://truermeasure.com/privacy` et confirme avec APP l'adresse des nouvelles
Conditions. Montre-moi les versions exactes en apercu. Apres mon accord sur les
textes et leur publication, publie ces pages separement de la mise a jour
commerciale."*

Three things in that sentence shaped what was built: a named address, the exact
texts rather than a description of them, and publication **separate** from the
commercial update.

**The address.** `/privacy` in English, `/politique-de-confidentialite` in
French, which follows the French Terms at `/conditions-d-utilisation`: a legal
document is found by its own name. `/privacy` is also what the app's agreement
screen links to, so the two sides now agree without a redirect between them.
The route folder was `privacy-policy` while it was unreachable; nothing ever
published that address, so renaming it costs nothing and
`scripts/check-launch-build.mjs` now fails if any page links to the old one.

**The exact texts.** They could not be read from `app/_pending`, because a
folder starting with `_` is not a route, so both pages are routed. What she is
reading is therefore the real page at the real address, draft banner and
unfilled effective date included, which is the point: approving a text means
seeing what it still says.

**And they cannot be published.** The guard did not come down, it moved
outward, and there are two:

| | what it reads | what relaxes it |
|---|---|---|
| `check-legal-placeholders.mjs` | the **source** a route imports, prebuild | `TM_LEGAL_PREVIEW=1` |
| `check-launch-build.mjs` | the **built html**, before any deploy | `--legal-preview` |

The second is stronger than the first ever was, because it reads what would
actually be served rather than the source it came from, so it holds whatever
route, import or flag put the draft text there. **The publish procedure passes
neither flag**, which is what makes the texts readable and unpublishable at the
same time. Both refusals were proved by running them rather than reasoned
about: without the flags, exit 1 and the reason printed.

**Two things inside the documents are hers and are untouched:**

1. The effective date, `[EFFECTIVE_DATE]` in both files.
2. The draft banner at the top of both. Deleting it is the act that declares
   the text final, which is her word and counsel's, not a formatting step.

A third thing worth her eye: the English banner says "the three remaining
placeholders are filled" and only one placeholder is left. The count in the
banner is stale. **Nothing was edited**, because it is inside a legal document
under review.

**The footer now carries the policy** in each language, which it was always
meant to do once the page answered; `components/footer.tsx` said so in a
comment. Until today the only link to it was inside the signup dialog, so a
routed policy would have been a page nobody could find. It is one line to take
out again if she would rather approve the footer as it was.

**`scripts/preview-edge.mjs`** replaces the scratchpad simulator. It runs the
real edge function over the preview, so the price is the one her country gets
rather than the USD fallback; it reads the signing key from outside the
repository through `TRUERMEASURE_SECRETS_DIR`; and `--lan` binds every
interface so the pages can be read on a phone. `scripts/launch-build.ps1` gained
`-LegalPreview`, `-Lan` and `-Country` and prints both addresses.

**What is still waiting**, and it has not moved: her approval of the two texts,
and then publication of the legal pages **on their own**, before the commercial
update, in that order because she asked for it in that order.

### Two things the launch order got wrong, found by checking rather than agreeing

The app session proposed a five-step order on 5 November. Two steps could not be
executed as written, and both are the kind of error that only shows up if
somebody opens the files.

**There are no new Terms.** The order said "publish the new Terms at
`/terms-of-service`". Searched: no Version 1.3 draft exists in this repository,
in either language, routed or unrouted. `content/terms-of-service.mdx` and
`content/conditions-d-utilisation.mdx` hold **Version 1.2**, which is already
live and byte-identical on the branch and on `main`. Her own words are "les
pages juridiques approuvees", and 1.2 is the only approved Terms there is. So
either she designates it, and the Terms need no deploy at all because they are
already published, or new Terms have to be written and go through counsel, which
is not a same-day item. Counsel's open question on Terms 1.3 is a revision
nobody has drafted, not a document waiting to be published.

**The two Privacy Policies are not the same document**, and conflating them
would publish something untrue. The app session offered to send approved text
for "section 5.4" and "section 9", covering founder-only access to child records
and real retention practice.

| | sections | what it covers | routed |
|---|---|---|---|
| `privacy-policy.website.mdx` | 8, section 5 is cookies and analytics | the forms, the Kit list, Plausible | **yes, at `/privacy`** |
| `privacy-policy.mdx` | 12, section 9 is retention | child records, uploads, AI processing | no, and stays no |

There is no 5.4 and no section 9 in the routed document. The website policy says
in its own second paragraph that it does not cover the product, and that a
separate and much longer policy comes before a parent gives anything about their
child. Her decision, 4 October. Pasting product language onto `/privacy` would
publish claims about a product that is not open, which is exactly what
`app/privacy/page.tsx` warns about in its own comment. The text was still asked
for, because the two documents must not contradict each other, but it belongs in
`privacy-policy.mdx`.

**And one sequencing fault.** The order flipped `TM_ALLOW_LIVE_PAYMENTS` before
the step where the currency journey is verified, so the first real parent could
be charged in the wrong currency and we would learn it from a check run
afterwards. If the Netlify key disagrees with the app's by one character every
signature fails silently and every visitor is read as USD, a Canadian reading
CA$47 included.

It is a trilemma rather than a mistake: do not quote a price before purchase
works, so the site goes last; do not take money before the currency is proved,
so payments go last; the currency can only be proved on a deployed site, so the
site goes before the proof. **The draft deploy is the only thing that breaks
it** - the real edge function and the real variable on a `netlify.app` URL that
is not truermeasure.com, with no price shown to the public and no money at risk.
It needs her word, and if she withholds it one of the three has to give, which
is her choice and not something to arrange around.

### Terms 1.2 is not designatable, because it states different prices

Found on 5 November by opening the file, after both sessions had spent the
morning treating "designate 1.2" as the cheap way to unblock the Terms. It is
not available at all, and this supersedes everything said above about it,
including item 10 of section 7.

`content/terms-of-service.mdx`, which is what `/terms-of-service` serves live
right now:

| | CAD | USD | EUR |
|---|---|---|---|
| Standard price, per child, per month | **CA$59.00** | **US$42.00** | **35.00** |
| Founding Families introductory rate | **CA$39.00** | **US$27.00** | **23.00** |

She has approved **CA$47, US$47 and 47 EUR**, monthly or 507.60 for twelve
months. Confirmed on the live site in both languages: the English table and the
French `/conditions-d-utilisation` both carry the old figures. Byte-identical to
the branch, which is why the contradiction is already published rather than
pending.

So designating 1.2 is not "terms that do not describe the current offer". **A
parent would read CA$47 on the page, click, and agree to a contract stating the
price is CA$59 with a founding rate of CA$39.** The page and the contract would
contradict each other across one click, in writing, on both sides.

Two further facts about 1.2, from the same reading. It never names **School &
Life**, so the thing being sold does not appear in it. And it contains no yearly
option, so the **507.60 twelve-month payment has no contractual basis in it**.

**What follows is the honest headline.** New Terms must be in force before any
paid sign-up. The new Terms are Terms 1.3, which lives outside this repository
in `offer/counsel-package-2026-11-02/terms-of-service.md` and is unapproved.
There is no designation shortcut and no configuration that works around it.

*Corrected the same day, on the app session's objection, because the first
version of this paragraph said payments "cannot open today" and that it "depends
on counsel". Both overstate.* **Terms 1.3 is her document and she can approve it
herself today**, knowingly and at her own risk, without counsel having answered.
What is true is narrower: no paid sign-up can open while the only Terms in force
state CA$59. Whether that is closed by her signature or by counsel's review is
her choice, and nothing on either session's side decides it. The app session's
recommendation, which this side shares, is to have counsel's answers on at least
the refund policy and the EU withdrawal before taking euro payments, since the
refund policy is still undecided and already blocks the Terms as item 5 of
section 7.

What is still possible: the website Privacy Policy publishing alone on her text
approval, which is what she asked for. Whether free School sign-up can open
before the product policy and the Licence are published is a counsel question,
not one for either session, and free use quotes no price so it carries no price
contradiction.

### The app cannot point at /privacy, and there are two documents

The app session's own finding, 5 November, and it is correct. Its consent screen
links "the Privacy Policy", and the document a parent agrees to must be the one
covering their child's records. So `TM_PRIVACY_URL` cannot point at the
website-only policy, and the product policy needs a published address of its
own that does not exist yet.

Two addresses, and the choice is hers because she named `/privacy` before either
session knew there were two documents:

| | recommended | the no-churn alternative |
|---|---|---|
| `/privacy` | the **product** policy, once approved, and what `TM_PRIVACY_URL` points at | the website policy, as she saw it in today's preview |
| the other | `/privacy/website`, linked from the footer and the signup line | `/privacy/platform` for the product policy |

The recommendation rests on one sentence: a parent who types `/privacy` wants
the document about their child, not the one about a contact form, and the
address a parent guesses should hold the document they agreed to.

**She took the recommendation**, the same day, in her words as the app session
relayed them: *"Pour les adresses, je retiens `/privacy` pour la politique du
produit et `/privacy/website` pour celle du site. Prepare ces liens avec WEB
pour validation."* Built and unpublished:

| address | serves | answers |
|---|---|---|
| `/privacy` | the **product** policy, and `TM_PRIVACY_URL` points here | **404**, reserved |
| `/privacy/website` | the website-only policy | 200 |
| `/politique-de-confidentialite` | the French product policy | **404**, reserved |
| `/politique-de-confidentialite/site-web` | the French website policy | 200 |

She named the English pair, and **validated all four the same day, `site-web`
included**: *"Je valide les quatre adresses proposees, y compris le nom
site-web."* So the French pair is hers now too, not a derivation of mine.

**One thing left inside those pages, and it is hers.** Both documents are
titled "Privacy Policy" and "Politique de confidentialite", in the `<title>` and
in the `h1`. That was right while there was one. Once the app's policy publishes
at `/privacy` there will be two pages carrying the same name at different
addresses, which a reader meets as two identical browser tabs and a search
engine meets as two competing results for one phrase. The honest fix is a
qualifier on the website one, something like "Privacy Policy: this website", and
it is copy, so **nothing was changed**.

**The 404 on `/privacy` is the point, not a loose end.** The app's release check
refuses a legal link that does not answer 200, so that 404 is the gate holding
public sign-up shut until the document a parent agrees to exists. It opens when
she approves the product policy's text and not before, and nothing on either
side can route around it.

A guard went in with it, and it was proved by firing it rather than by reading
it: `check-launch-build.mjs` now fails if any built page links to `/privacy`
while the build contains no `privacy.html`. A footer link to a 404 on every page
of the site would be worse than no link, and the footer is exactly where this
would have gone wrong. Tested by injecting the link into one built page: *"links
to /privacy, which this build does not contain"*, then removed, then clean.

### The Licence makes three legal gates, and it is the furthest behind

The app session added the End-User Licence Agreement to its agreement screen on
5 November, on her instruction: *"Si le Contrat de licence reste separe, ajoute
son lien a l'accord et enregistre sa version avec celles des Conditions et de la
Politique."* Its release check now needs **three** legal links to answer 200,
where this morning it needed one.

**She validated the addresses the same day:** *"Je valide `/licence`,
`/contrat-de-licence` et la redirection de `/license` vers `/licence`."*

`/licence` and not `/license` because this repository uses the Canadian spelling
and nothing else, thirteen times against zero, and the Terms call the document
the End-User Licence Agreement in English and the Contrat de licence in French.
`/contrat-de-licence` is the short name the French Terms already use five times,
so the address carries the name the contract gives itself. The redirect exists
because `/license` is what a large share of readers will type and a 404 on a
document somebody has agreed to is the worst 404 on the site. It is in
`netlify.toml` now, pointing at a 404, so it cannot be forgotten in the change
that publishes the document.

**The finding, and it moves the critical path.** The Licence does not exist in
this repository in either language. No `content/*licence*.mdx`, no route. The
only draft anywhere is outside the repo, in
`offer/counsel-package-2026-11-02/end-user-licence-agreement.md`, marked "Draft
1.2 for counsel, 2 November 2026. Not approved, not published." **And that
package is English only**: three documents, no French.

| document | English | French | published |
|---|---|---|---|
| Terms | in repo, v1.2 | in repo | yes, and 1.2 is unusable (CA$59) |
| website Privacy | in repo | in repo | no, awaiting her text |
| app Privacy | in repo, draft | in repo, draft | no, awaiting her text |
| **Licence** | **counsel package only** | **does not exist** | no |

So publishing `/licence` needs three things rather than one: her approval of the
English text, that text brought in as a routed page, and **a French translation
that has not been written**. Legal text is not mine to write or translate, so
the French Licence is a person's job, and it is the only one of the six legal
pages with nothing to translate from.

**A counsel question, raised and not answered here:** whether a French-speaking
parent in New Brunswick or Quebec can be asked to agree to an English-only
Licence while the Terms and the Privacy Policy shown beside it are both French.
If the answer is no, the French Licence is on the critical path for public
sign-up rather than a job for afterwards.

### Her titles, and a duplicate heading she will see

Her instruction, 5 November: *"Pour les politiques du site, utilise les titres
Website Privacy Policy et Politique de confidentialite du site web."* Done, in
the `<title>` and the `h1` of both pages. Two documents will carry a privacy
name, and the qualifier is what keeps them apart in a browser tab and in a
search result.

**It exposed a defect rather than causing one.** The page now shows "Website
Privacy Policy" and then, immediately under it, "Privacy Policy" again, because
`content/privacy-policy.website.mdx` carries its own `# Privacy Policy` heading.
So the page has two `h1` elements. `content/terms-of-service.mdx` carries no
heading of its own and lets the page supply it, which is the house pattern, so
the privacy documents are the anomaly: they were written as standalone documents
for counsel, where a title belongs, and nobody saw the duplication because the
pages were unreachable.

The fix is one line, deleting the document's own heading, and **it was not
made**, because that line sits inside a legal document under review. She sees
both headings in the preview and can say which one goes.

### The effective date is the publication date, so it is a command and not a decision

Her rule, 5 November: *"Apres approbation du texte, la date d'entree en vigueur
sera celle de la publication reelle."* That removes a decision and replaces it
with a step, which is better, because the step was the dangerous part: filling
a date and removing a draft banner by hand, inside a contract, on the day a
deploy is waiting.

`scripts/publish-legal.ps1` does both, for one named document in both languages
at once, and refuses to be clever about it. It never guesses a date, requires
`-Date`, writes nothing without `-Apply`, renders the French date in French
("14 novembre 2026"), and **exits 2 if a document is missing in either
language**, because a policy published in one language and not the other is its
own kind of wrong. Dry-run against the website policy on 5 November: the right
two edits in each file, and nothing written, confirmed by the placeholder still
being there afterwards. Against the Licence: both files reported missing, exit 2.

It publishes nothing. After it the build still has to pass both legal checks
**with no flag at all**, which is the real test: the walls come down because the
document is finished, not because a flag was passed.

### The duplicate heading is gone, by her word, and the read-through left the browser

Her instruction, 5 November: *"Garde uniquement les titres Website Privacy
Policy et Politique de confidentialite du site web. Retire le deuxieme titre
affiche sous chacun, en conservant le texte de la politique et la banniere
d'ebauche pour ma relecture."*

So the document's own heading goes and the page's stays, which is the pattern
`content/terms-of-service.mdx` already follows. One line out of each file,
`# Privacy Policy` and `# Politique de confidentialite`. Nothing else in either
document was touched: the banner, the version line, the unfilled date and all
eight sections are as they were. Both pages now carry exactly one `h1`.

**And the preview stopped being the right tool.** It was killed four times on
5 November, each time because the machine was low on memory while the session
sat idle, and three of those interrupted her while she was trying to read a
contract. A read-through that cannot survive the reader pausing is the wrong
instrument, and the fix is not a more careful server.

`scripts/standalone-legal.mjs` turns one built page into one file that opens
with a double-click:

- the document as the page renders it, real typography, **34 fonts embedded**
- **no scripts, no `/_next` references, no http references at all**, so it
  needs no server, no network and nothing installed, and reads the same offline
- **no header, nav or footer**, because those are built in the browser and read
  the language from the address, so a file opened from a folder would put an
  English footer under a French contract
- `--pair` points each language's toggle at the other file, so the two read as
  a pair; every other site link becomes the words it was wrapped around, since
  a dead link in a document somebody is approving is worse than no link
- the draft banner and the empty effective date **kept**, because the point is
  to approve the text as it stands, and a reading copy that looked finished
  would be worse than none

Both files verified before sending: one `h1` each, her title, eight numbered
sections, the banner present, the placeholder present, zero scripts, and the
only remaining links are the two mailto addresses and the other language.

## 6 November: the Licence stopped being a one-language document

Her word this morning, and it closes the thing I had recorded as the Licence's
hardest gap: *"Le brouillon francais de la Licence est pret et je le transmets a
APP pour verifier la concordance avec l'anglais. Je te ferai suivre les versions
approuvees pour integration."*

So the record's line that no French Licence exists anywhere is out of date. It
exists, she wrote it, and it is with the app session to be checked against the
English. Neither version is in this repository and neither is approved, so
nothing changes at `/licence` or `/contrat-de-licence` today: both still answer
404, which is still what keeps the app's release check refusing.

She also said the two site policies' publication approval will come separately,
with the real publication date as the effective date. That is the rule from
5 November, unchanged.

### A new wall: a contract routed in one language

Two documents now move at two speeds. The English Licence sits in the counsel
package; the French one is with APP. That is exactly how a contract ends up
live in one language, and the failure is not cosmetic: a francophone parent
either agrees to a page they cannot read, or clicks `/contrat-de-licence` and
gets a 404 after the English page told them a licence applies.

`scripts/publish-legal.ps1` already refused to *finish* a document missing a
language. `scripts/check-legal-placeholders.mjs` now refuses to **build** one,
which is earlier and harder to walk past:

| | catches | when |
|---|---|---|
| `check-legal-placeholders.mjs` | a routed document whose counterpart is not routed | prebuild, before any page exists |
| `publish-legal.ps1` | a document missing in either language | exit 2, before the date is filled |

The pairs it knows: Terms, the website policy, and the Licence. The app's
product policy is deliberately absent from that table, because its French file
has no agreed filename yet; it goes in the day it gets one.

`TM_LEGAL_PREVIEW=1` downgrades this to a warning like the rest, so one
language can still be read while the other is being checked. The publish
procedure passes no flag, so the warning is not available to a deploy.

Both kinds of fault now report before the build stops, instead of the draft
marker hiding a missing language behind it. Verified by pairing a routed
document against a file that does not exist: refused with exit 1, reported both
faults, and under preview printed *"8 documents checked, 2 still a draft,
1 missing a language."* Build after the change: 16 pages checked, nothing
wrong.

### What integration will need when her texts arrive

Both languages in the same pass. In order: the two `content/*.mdx` files
(`licence.mdx`, `contrat-de-licence.mdx`), the two routes, the footer link,
then `publish-legal.ps1 -Document licence -Date <the day it goes up>`. The
addresses, the French path mapping and the `/license` redirect are already in
place and have been since 5 November, so the only missing input is the text
itself.

One question for counsel stands regardless of the translation: whether a
francophone parent can be bound by a Licence whose English and French versions
differ, and which one governs. That is a concordance clause, not a translation
check, and it is the kind of thing APP's comparison may surface rather than
settle.

### Her question: does the bilingual wall cover the app's own policy

It did not. The table I wrote this morning named the Terms, the site policy and
the Licence, and left the product policy out on the grounds that its French
file had no agreed name. Her answer, 6 November: *"Je veux m'assurer que les
deux versions de la politique de l'app sont egalement verifiees avant
publication."*

That is the right instinct, and leaving it out was the weaker choice: the
product policy is the one that describes child records, AI reading and
retention, so it is the document where a missing language costs the most.

**The filename collision was the real obstacle, and it was itself a trap.**
Before today:

| document | address | file |
|---|---|---|
| site policy, EN | `/privacy/website` | `privacy-policy.website.mdx` |
| site policy, FR | `/politique-de-confidentialite/site-web` | `politique-de-confidentialite.mdx` |
| product policy, EN | `/privacy` | `privacy-policy.mdx` |
| product policy, FR | `/politique-de-confidentialite` | *none* |

The French file whose name matches the product policy's address was holding the
site policy's text. Two documents with a claim on one filename is exactly how
approved text gets pasted into the wrong one, and that near-miss already
happened once this week with the app session's retention wording. So the French
site policy is renamed `politique-de-confidentialite.site-web.mdx`, and every
file is now named after the address it serves. Content untouched: a rename and
one import line.

Both walls now cover all four documents:

- `check-legal-placeholders.mjs` refuses to **build** a policy routed in one
  language only, product policy included
- `publish-legal.ps1 -Document app-privacy` now names both files and **exits 2**
  until the French one exists. Verified today: it reported
  `content/politique-de-confidentialite.mdx does not exist, so there is nothing
  to finish` and refused

The app pair cannot fire at build time yet, because neither product-policy file
is routed. The mechanism was proved by pairing a routed document against that
exact missing filename: refused, exit 1. Build after the rename: 16 pages
checked, nothing wrong.

So the French product policy is now a named, expected file rather than an open
question. When the app session sends her approved text, it has one place to go.

## 6 November: who is named, and what the code actually confirms

### Her name is out of sections 1 and 8

Her decision: *"je choisis d'afficher VisionEd Consultation Inc., le titre de
responsable de la protection des renseignements personnels et
privacy@truermeasure.com. Retire mon nom des sections 1 et 8 dans les deux
langues."*

Done in both files. Section 1 and section 8 now carry the company, the
designated role and the address. The role is still designated; only the
individual's name is withheld, which also keeps a founder who works from home
off a page any visitor can read.

**The label "Privacy Officer" went with the name.** It was a second naming of
the same role in English, and with no name beside it the line read as a title
with nobody in it. The heading states the role. The French statutory wording is
unchanged and still exact.

**Her name still appears on those pages, in the footer.** The social links name
her and point at her Instagram, Substack and LinkedIn accounts, on every page of
the site including both policies. That is her public professional presence and
her call, not a leak, and it is outside what she asked me to change. The two
reading files have no footer, so they contain her name zero times.

### What the code and the configuration confirm

Read from the repository and from the built site, not from memory.

**The forms. Three of them, not two.** `components/waitlist-button.tsx`,
`components/withdrawal-form.tsx` and `components/first-to-know.tsx`. The first
two post to `netlify/functions/contact-submit.ts` and land in GoHighLevel; the
third posts to `netlify/functions/kit-subscribe.ts` and lands in Kit.

The waitlist and enquiry form sends exactly: `firstName`, `lastName`, `email`
(these three required), `phone`, `kids`, `city`, `state`, `postalCode` (all
optional), plus the tag and `source: "truermeasure.com"`. Nothing else. The
`kids` field is a free-text textarea labelled "Number of kids and ages", and it
is stored in a GoHighLevel custom field whose identifier in the code is
`STUDENT_NOTES_FIELD_ID`. Free text is why the policy's "please don't include
your children's names" line is doing real work.

The withdrawal form sends `firstName`, `lastName`, `email`, all required, with
the tag `withdrawal-request`.

**Kit holds the email address and nothing else about the person.** On a new
subscriber the function writes two custom fields and no others:

- `TM signup source` = the placement and the locale
- `TM consent` = the purpose wording and an ISO timestamp

plus the tag and Kit's own `created_at`. Two details the policy does not say:
the record includes **which language** the person signed up in, and the consent
field is written **only on a first signup**, because Kit's upsert would
otherwise overwrite the original source with the most recent one. A returning
address keeps its first record, which is the right behaviour and worth stating.

**Plausible.** One script, the plain `script.js` from plausible.io, with
`data-domain="truermeasure.com"`, loaded after paint from `app/layout.tsx`. Not
a variant with outbound-link or file-download tracking.

**No cookies and no stored identifiers, confirmed in the built output.** The
built site contains zero occurrences of `document.cookie`, `localStorage` and
`sessionStorage`. Nothing at all is written on the visitor's device; the
currency decision lives in one HTML attribute and one `window` variable that
dies with the tab.

**Everything the browser talks to, counted in the built HTML.** One third-party
script host: plausible.io. Fonts are self-hosted by `next/font`, so **not one
request to Google**. The rest are ordinary outbound links the reader chooses to
click: the Stripe billing portal in the footer, Substack, Instagram, LinkedIn,
and the customer app. **No iframe anywhere on the site**, so none of those hosts
sees a visitor who does not click.

**Netlify.** It hosts the site and runs the two functions. There is **no Netlify
Forms markup anywhere in the built output**, which matters: Netlify Forms would
store submissions on Netlify, and this does not. The functions relay and keep
nothing. `netlify.toml` configures **no log drain**, so nothing is forwarded to
a third-party logging service.

**What the functions write to Netlify's logs.** No function logs a form field.
Every log line is an error path, and several include the **provider's error
response body**, which for a duplicate contact or a rejected subscriber can
contain the email address. So the honest statement is: form data is not logged
deliberately, and an upstream failure can put an address in a Netlify function
log.

**The edge function reads a country.** `netlify/edge-functions/currency.ts`
reads `context.geo.country.code` on every HTML request and writes one attribute.
It stores nothing, calls no third party and sends nothing onward. The country is
inferred by Netlify from the request, which is to say from the IP address, by
Netlify and not by this code.

### What the code cannot answer, and who has to

These are not gaps in the drafting. They are facts that live with the providers,
or decisions that are hers or counsel's.

**Providers.** Whether a data-processing agreement is in place with GoHighLevel,
Kit, Plausible and Netlify, and whether each permits the cross-border transfer
the policy already discloses. Whether Plausible's own published behaviour
matches what section 5 asserts on its behalf, in particular its handling of IP
addresses and where it stores what it keeps; the code can prove the script is
the cookieless one, and nothing more. Whether Netlify's platform access logs
record IP addresses and for how long, and the same for function logs, on the
`nf_team_dev` plan. Stripe appears in the footer as a destination and in no
provider table; once purchases open it processes payment data, and the table
will need it.

**Retention.** The policy states no retention period for anything: not
GoHighLevel contacts, not Kit subscribers, not Netlify logs, not Plausible
totals. That is deliberate, because inventing one is not mine to do. It is the
largest open item in the document.

**Rights.** Three practical questions behind section 6. Deletion from Kit
conflicts with the unsubscribe guarantee: Kit keeps an unsubscribed record,
which is exactly what makes "anyone who unsubscribed stays unsubscribed" true in
`kit-subscribe.ts`, and deleting that record would let the same address be added
again by a later signup. Counsel should say which obligation wins. "A copy in a
portable format" has no mechanism today; it would be assembled by hand from two
providers. And nothing in the repository records a privacy request or its
deadline, so the 30 days are kept in a mailbox.

**The two 30-day commitments, which are different promises.**

Section 6, thirty days to answer a rights request, is a response deadline. It
needs someone watching privacy@truermeasure.com and a way to retrieve, correct
or delete from GoHighLevel and Kit inside the window. Both are manual today.

Section 7, thirty days' notice before a material change, is a notification duty,
and it is the harder of the two. It requires emailing people who gave their
information. The list members are reachable in Kit. **Form submitters are in
GoHighLevel and are not on that list**, so honouring section 7 for them means a
separate send to people who asked about a product and never subscribed to
anything. Whether that send is permissible, and whether the commitment should
extend to them at all, is a counsel question and a deliverability one.

## 6 November, later: the logs stop quoting the provider, and both drafts say the same things

### The title came back, in one language

Her instruction: *"Remets le titre « Privacy Officer » à côté de
privacy@truermeasure.com dans la version anglaise."* So the English role line
in sections 1 and 8 reads "Privacy Officer — privacy@truermeasure.com" under
the statutory-style heading, and the French carries the statutory wording
alone, which is what the note in both files has always required. Her name is
still absent from both documents, and her professional links are still in the
footer, by her word, untouched.

### A duplicate signup can no longer put an address in a log

The functions have to read a provider's error body, because that is how they
tell a duplicate contact from a real failure. They were also printing it, so a
duplicate or a refusal could leave an address in a Netlify function log. Her
instruction: keep the error codes, drop the raw responses, and prove it with a
fictitious address.

The body is still read and never printed. What is logged is the HTTP status and
one word from a fixed list written in the file itself:

    auth · not_found · duplicate · unprocessable · rate_limited
    provider_error · rejected

Nothing from the body reaches a log line. A thrown error is reduced to its
class name plus the short upper-case network code Node attaches, because an
error raised while sending a request can carry the request with it.

**`scripts/check-function-logs.mjs` is the proof, and it is a permanent one.**
It imports both handlers and runs them for real against five provider
responses that quote `ghost.tester@example.invalid` back, the way a real
GoHighLevel or Kit error does. `.invalid` is reserved, so the address can never
belong to anyone; the credentials are obvious fakes created in the process; no
provider is contacted and nothing is sent anywhere. It fails if the address
appears in any log line, and it also fails if the status and the reason word do
*not* appear, because a log that says nothing is not the goal.

| scenario | logged |
|---|---|
| waitlist form, duplicate contact | `400 duplicate` |
| waitlist form, contact refused | `422 unprocessable` |
| withdrawal form, duplicate then tagging fails | `400 duplicate`, `500 provider_error` |
| email list, subscriber refused | `422 unprocessable` |
| email list, tagging fails after the subscriber exists | `500 provider_error` |

Five clean. Then I put the old logging back on one line and ran it again: three
scenarios reported LEAKED and it exited 1. A test that cannot fail proves
nothing, so that is the part worth recording.

It is deliberately **not** wired into `prebuild`. It imports TypeScript
directly, which this machine's Node 24 does without a flag, and a build on
Netlify that failed over a type-stripping difference would block a deploy for a
reason that has nothing to do with privacy. It can move into `prebuild` once
the Node version there is pinned.

### Both drafts now say the same things, and more of them

New or rewritten, in both languages, from the audit and nothing else:

- **3.1 is a table of the three forms**, with required and optional separated.
  The first column is what the form will not submit without; everything in the
  second can be left blank. The free-text children box is named as free text,
  which is what makes the warning beside it necessary.
- **3.2 names the three things Kit keeps about the signup**: when, from which
  page, and in which language, recorded once at the first signup, with the
  original kept if someone signs up again elsewhere.
- **3.3 is new**: what a visit alone discloses. Visit counting, the country
  lookup for the price, and the sentence the check above now guarantees, that a
  failed submission records an error code and not what was typed. It also says
  plainly that the host keeps its own technical records, which is true of every
  host and was previously unsaid.
- **Section 4 separates Stripe from payment.** The footer link is a link: this
  website sends Stripe nothing when it is clicked, and no payment is taken on
  this website. Payment happens in the app, and the product's policy will say
  what Stripe does there. Netlify's row now also names the country lookup.
- **Section 5 covers cookies, measurement and the country** in one place, and
  states the two facts the built output proves: nothing is written on the
  device, and Plausible is the only service the browser contacts.

### Section 6 separates the deadline from the promise

The 30 days used to read as though they were the rule. They are now set beside
it: where the privacy law applying to us fixes a limit, that limit applies and
we meet it; separately, and whichever limit applies, we undertake to answer
within 30 days at no charge, and that undertaking does not replace a shorter
deadline. No statute is named, which is still her 4 October rule.

**This is the one passage where the drafting is a legal characterization and
not a fact from the code.** Counsel has to confirm that it distinguishes the
two without implying a conclusion about which law applies.

### Section 7 no longer promises a date

The fixed 30 days' notice is gone, replaced by notice before a material change
takes effect, plus consent where consent is required, and the change not
applying to information already given until that consent exists. The
no-retroactive-weakening promise is unchanged.

That also retires the problem I raised this morning. A dated promise had to
reach everyone who gave us information, and the people who filled in a form are
in GoHighLevel, not on the mailing list, so the promise covered a send that may
not be permissible. One 30-day commitment remains in the document, in
section 6, and it is labelled as voluntary.

### Confirmed against the code, and still to validate

**Confirmed**, by reading the repository and the built output: the three forms
and their exact required and optional fields; what each provider receives; the
three signup facts in Kit and the first-signup-only rule; one third-party
script host and no request to Google for fonts; no cookie, no local storage, no
session storage anywhere in the built site; no iframe; no Netlify Forms, so
submissions are not stored by the host; no log drain; the country read per
request and neither stored nor forwarded; and, now, that a failed submission
logs a status and a reason and never an address.

**Still to validate, and not strengthened in the text without an answer:**
the provider agreements and the cross-border transfers they permit; every
retention period, which is why the document still states none; what Netlify's
access logs record and for how long on this plan; and Kit's own procedure for
erasure, unsubscribe and a later re-signup, which is the one with a conflict
inside it, since the record that keeps an unsubscribe honoured is the record an
erasure would remove.
