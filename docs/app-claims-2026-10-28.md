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
