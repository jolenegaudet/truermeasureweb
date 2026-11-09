# What the app actually does, checked against the page

*28 October 2026. The landing page now describes the app as one product with two plans.
Your brief said to use the current app as the source of truth and to check three features
before describing them. This is that check, so the next person to touch the copy can see
where every claim came from without re-reading three codebases.*

---

## Which codebase is the customer app

There are three, and they disagree with each other. The one that matters is the third.

| Folder | What it is | Status |
|---|---|---|
| `truermeasure/web` | the marketing site, truermeasure.com | live |
| `truermeasure/app` | the Next.js "platform" | not the current app; last touched 3 Oct, legal text only |
| `truermeasure/prototype` (`main`) | the demo | **published**, truermeasure-preview.azurewebsites.net |
| `truermeasure/prototype/.worktrees/launch` (branch `launch`) | **the customer app** | unpublished, last commit 28 Oct 2026 |

The `launch` worktree is the one `launch-local\start.ps1` runs, the one with real accounts,
Stripe and the AI server, and the only one that knows the words "School & Life". Its most
recent commit is the Stripe test-mode walkthrough, 17 of 17, this morning.

`truermeasure/app` was the obvious candidate by name and is the wrong one. Nothing in it
mentions School & Life, and its newest commit is five weeks old.

---

## Your three features: all three are out

Your brief: *"Previous versions have also shown yearly reports, child-facing printable pages
and an evidence-based résumé builder. Check the current customer app before describing
these. Include them if they currently work and belong to School & Life. If unavailable,
omit them from the marketing copy and identify them separately."*

They work. They are unavailable to a customer. `js/account.js`, line 17:

```js
// Not part of the first paid release: hidden from accounts, still in the demo
// (the founder, 13 October 2026).
const DEFERRED = ['annual', 'resume', 'childPage', 'growthBars'];
TM.offers = (feature) => !(A && A.signedIn && DEFERRED.includes(feature));
```

| Feature | In the demo | For a signed-in customer | On the page |
|---|---|---|---|
| Yearly reports (`annual`) | yes | **hidden** | no |
| Build my résumé (`resume`) | yes, from Grade 6 | **hidden** | no |
| Pages for the child (`childPage`) | yes | **hidden** | no |
| Growth since last year (`growthBars`) | yes | **hidden** | no |

So they are described nowhere in `content/app-plans.ts`. This is your own decision of
13 October, not a new one, and the fourth item is one your brief did not name.

**This is a trap for whoever writes the next version of this page.** Both plan buttons now
point at the demo, the demo shows all four, and anyone writing copy from what they see
there would describe them in good faith. `scripts/check-app-claims.mjs` runs as `prebuild`
and fails the build if the copy claims one. It reads the `DEFERRED` list out of the app
itself, so the day you ship one of them the guard stops objecting without being edited.

---

## Where each claim on the page comes from

Your own approved words, reused verbatim rather than rewritten:

| On the page | Source in the app |
|---|---|
| "Understand your child's report cards." + the paragraph under it | `onboarding.choose.school`, 23 Oct 2026 |
| "Uploads are report cards only" | your ruling of 23 Oct, which says it must appear wherever the free plan is described |
| The four School bullets | `plan.offer.free` — your note on that block reads "Only what the app does today" |
| The four School & Life bullets | `plan.offer.full`, same block |
| "Everything in School, plus:" | `onboarding.choose.full.plus` |
| "Capture a moment" paragraph | `onboarding.choose.full.text` |
| The three Reflect questions and "One answer is enough." | `onboarding.choose.full.questions` / `.oneAnswer` |
| "Cancel any time: School & Life stays until the end of the paid period…" | `plan.terms.cancel`, 20 Oct 2026 |
| "You capture the moments…" | `onboarding.choose.full.close` — already the app's closing line, and the one your brief asked for |
| The profile's two sections and "What draws them in" | `dimensionGroups` and `noCounts` in `js/config.js`, including Thinking and Problem solving as separate foundations (28 Oct) |
| The dashboard's four labels | the real headings in `js/views.js`: "The story so far", "What we're noticing", "Recently added", "Worth a closer look" |
| "it does not diagnose, label, predict, or compare your child with other children" | the consent gate every customer agrees to, `js/account.js` |
| The Demo Child example | `js/seed.js`, insight `i16`, written demo content, not AI output. Its five records are e16/e25/e38 (report cards) and e14/e32 (the comic, the zine), which is where "3 from school, 2 from beyond school" comes from |

---

## Three places the page departs from your brief, and why

**1. The paid headline.** Your brief asked for *"A growing picture of who your child is
becoming."* The page says **"…who your child is capable of becoming."**

"who your child is becoming" is the phrase you banned on 7 October and had taken off
`/hidden-report-card` the same week; "capable of becoming" is the replacement you supplied
yourself, and it is live in both languages today. Your sentence with your own correction
applied. The app's own card says *"See what everyday moments reveal about your child."* if
you would rather have that one instead. One line in `content/app-plans.ts` either way.

**2. One em-dash.** Your brief's supporting copy had *"questions worth exploring—across
school and everyday life"*. The page uses a comma, for the zero-em-dash rule.

**3. Two of the app's own headings use a plural pronoun for one child** — "What draws them
in" and "Their place in the world". Your site copy rule forbids that; they are the app's
approved headings. They are on the page as names rather than reworded, so a parent finds
the same words on the screen. Say the word and they come off.

---

## Billing: what the app supports vs what the page shows

The app offers **two** intervals, monthly and a school year (`plan.offers`, your decision of
20 October). Your brief said monthly only, so the page shows monthly only. The school-year
option is still in the app and is not broken by this; the page simply does not mention it.

No amount appears anywhere. `plan.prices` is `{ monthly: '', schoolYear: '' }`, with your
note: *"Prices are open (13 October 2026): shown only when set. Never a live price without
her go-ahead."* The page keeps that. The placeholder exists only when the local preview flag
is set, it is words rather than a number, and it is absent from the exported HTML, not
hidden by CSS.

The refund sentence (`plan.terms.refund`) is still empty, waiting for counsel. Nothing on
the page implies a refund policy.

---

# Second brief, same day: pricing, the allowance, and French

*Her second brief of 28 October 2026. What changed, and what it rests on.*

## The currency selector

Built from the one that already existed. `components/offer-price.tsx` has had a
CAD/USD/EUR control since 1 October, unused since sales paused on 2 October.
Her brief said to reuse rather than duplicate, so the three buttons moved to
`components/currency-toggle.tsx` and both call it. The paused offer looks
exactly as it did; there is one switcher in the codebase, not two.

CAD leads and is the default, as she asked.

## Prices

| Currency | On the page | Where it lives |
|---|---|---|
| CAD | CA$29 / month | `APP_PRICES` in `content/app-plans.ts`, her figure |
| USD | "Price to be confirmed" | `amount: null`, proposal in the pricing brief |
| EUR | "Price to be confirmed" | `amount: null`, proposal in the pricing brief |
| School | "Free", in every currency | the slot ignores the selector |

**All of it is behind the preview flag, including CA$29.** Her brief: "This
authorizes the working local preview only" and "Keep pricing unapproved, all
changes unpublished." So with `NEXT_PUBLIC_TM_PRICE_PREVIEW` unset, which is
every ordinary build and anything Netlify would produce, the selector and every
amount are **absent from the HTML**, not hidden with CSS. The exported build
was checked for this in both languages.

Tax wording says it is still to be confirmed, as she asked. The app's approved
sentence ("Taxes are shown at checkout.") was not borrowed, because it belongs
to a Stripe setup she has not pointed at this price. `plan.prices` in the app is
still empty and nothing here touches Stripe.

## The reading allowance

The ceiling is real and already in the code: `server/engine.js` holds
`TM_AI_CAP_FULL_USD` (default US$10) and `TM_AI_CAP_SCHOOL_USD` (default US$2)
per family per month, and at the ceiling the app says *"This month's readings
are complete. New additions are kept and will be read next month."*

The page says that in a parent's words, with **no figure**, because the ceiling
is an internal US dollar amount and a dollar figure beside a price would read
as a second price. It names what pauses (new readings), what stays (everything
added, everything already written, the record, the timeline, the profile and
the documents) and when it resumes (the start of the next month).

Nothing about the cap was changed. The word "unlimited" is on neither page.

## The four demo-only features

Unchanged from the first brief: yearly reports, pages for the child, résumé
building and growth bars stay out of the offer. Her second brief added that
they should be **named** beside the demo links, so a note under the two cards
now says the demo shows them and the app does not have them at launch.

That note names the four features, which is exactly what
`scripts/check-app-claims.mjs` was built to refuse. The guard now strips the
`demoOnly` strings before matching, with a comment saying why, and was
re-tested both ways: it still fails the build on a claim written anywhere else.

## French

`/fr` now has the same four sections as the English page. **Parents leaders and
Cercle privé are untouched**: same cards, same French, same GoHighLevel waitlist
and application forms, same tags. Only the row narrowed from three columns to
two, because the app offer moved into its own section above.

Her plan names, from the brief: **École · Gratuit** and **École et vie · Payant**.

The French copy is a **draft for her review**, in `content/app-plans.ts` under
`fr`. It follows three conventions taken from what is already on the French
pages rather than invented: "l'enseignante" as the generic teacher (as in
"rencontre avec l'enseignante"), curly apostrophes throughout, and a
non-breaking space before `:`, `!` and `?`. Checked: zero straight apostrophes,
zero em-dashes. The paid headline reuses her approved French, "ce que votre
enfant est capable de devenir", live on `/fr/hidden-report-card` since
8 October.

### The product name: Juste Valeur, or Juste Mesure?

Her brief says to preserve **Juste Valeur™**. That name is on no page of this
site, so there is nothing of that name to preserve. What is here is different,
and in three places:

- `content/i18n.ts` has carried `oneFlat: "Une Juste Mesure"` since her naming
  ruling of 1 October.
- The French home page headline already reads "une juste mesure", and the
  French footer shows **Une Juste Mesure** today.
- Her own correction of 2 October: justevaleur.ca belongs to someone else, and
  "valeur" is the accounting term for fair value. Her domain is justemesure.ca.

Putting "Juste Valeur™" on the French site would therefore claim a mark whose
matching domain is someone else's, and would contradict the ruling that gave
the French product its name. So the mark kept here is the one that exists,
**Juste Mesure™**, in `FRENCH_MARK` in `content/app-plans.ts`: a single
constant, one word to change if she means the other.

---

# Third brief: simpler cards, and where the buttons go

*Her third brief of 28 October 2026: "The page's purpose is to get parents to
register. Keep it clean, readable and easy to act on."*

## The cards

Her copy, used as written. Each card is now: plan name, price, headline, a
short list, one supporting line, one button. Measured at 1280px: the two cards
are the same height and **the buttons align exactly** (skew 0px, after giving
the dark card and its button transparent borders so both boxes match the
outlined ones). At 390px they stack and size to their own content, with no
horizontal overflow. Desktop card height fell from about 770px to 528px.

What came off the cards: the long body paragraphs, the "rests on 5 records"
proof, the tax note, the cancellation sentence, the account-coverage sentence
and the reading allowance. Nothing was deleted; it moved into **What's
included**, a native `<details>` under the cards, closed by default, which
works with JavaScript off and is keyboard reachable without any code of ours.
Verified in both languages that it still holds account coverage, cancellation,
the reading allowance, the seven parts, the fictional example and the closing
line.

**Tax wording is off the page entirely**, as she asked: unresolved decisions
belong in internal notes, so it lives in `docs/pricing-brief-2026-10-28.md`.

The Kit signup moved out of the paid card and up into the availability note, so
each card has exactly one action while the working form is kept.

## THE PRODUCTION APP DOES NOT EXIST

Her brief: "Use the actual production app URL and existing supported routes...
If the production destination is not ready, identify exactly what remains to
connect. Don't invent a URL."

It is not ready, and not in the sense of unfinished. **The resources have never
been created.** From the customer app's own deploy script,
`prototype/.worktrees/launch/deploy/azure-accounts.sh`:

```
# NOT RUN YET. Creating these resources costs money every month and holds real
# families' records: it waits for the founder's authorization.
# To create them, run with TM_CONFIRM_CREATE=yes.
```

and, if run without it: *"The production resources don't exist. Creating them
needs the founder's go-ahead."*

The host it would create is `truermeasure-app.azurewebsites.net` (the script's
default `TM_APP`, overridable with `TM_PUBLIC_URL`). **Checked 28 October 2026:
that name does not resolve.** So it is not a URL, it is a guess about a future
one, and writing it down is the thing her brief forbids.

`demo.truermeasure.com` is live and is **not** a substitute. The demo runs with
`TM_ACCOUNTS` unset, so in its own README's words "the site serves the demo,
never an account". Nobody can register there.

### What remains to connect

1. **Her authorization**, then `TM_CONFIRM_CREATE=yes bash deploy/azure-accounts.sh`
   (resource group, App Service plan, Postgres 16, web app, Canada Central).
   This starts a monthly bill.
2. **The secrets the script reads** from the workspace `.secrets` folder:
   `anthropic.env` (ANTHROPIC_API_KEY) and `launch.env` (STRIPE_SECRET_KEY,
   STRIPE_WEBHOOK_SECRET, the Stripe price ids, GRAPH_* for sending mail,
   SERVICE_EMAIL_SENDER, TM_OPS_EMAIL).
3. **The public hostname**: the azurewebsites default, or a custom one through
   `TM_PUBLIC_URL` with a CNAME and managed certificate, as
   demo.truermeasure.com was set up on 20 October.
4. **A real price.** `plan.prices` in the app is still empty, and live payments
   additionally need `TM_ALLOW_LIVE_PAYMENTS=1`, which the deploy script calls
   the founder's switch to give.

### Carrying the plan into registration: not supported

Her brief said "where supported". It is not. The customer app reads exactly two
query parameters: `?checkout=done|cancelled` (`js/account.js`) and `?code=` for
an invite (`js/ai.js`). There is no `?plan=`. The plan is chosen inside
onboarding, on the "How do you want to start with {name}?" screen, after the
child's name.

Adding one would be a change to the customer app, which this brief rules out.

### How it is wired meanwhile

`REGISTRATION` in `content/app-plans.ts` holds `{ url: null, planParam: false }`
and `planHref()` answers the demo while `url` is null. Set `url` and both
buttons switch to registration, the "opens the demo" lines disappear and the
demo-only disclaimer goes with them, with no other edit. Set `planParam` to
true once the app learns `?plan=` and the links carry `school` or `full`.
