# Pricing brief: what School & Life costs to run

*28 October 2026. Asked for alongside the landing-page update. No new paid AI calls were
made to write this: every figure comes from logs that already existed.*

---

## The short version

| | |
|---|---|
| What one subscription covers today | **the whole account, every child in it.** Not one child. |
| A frequent paying family, AI only | **US$8 to US$9 a month** |
| A regular paying family, AI only | **US$3 to US$4 a month** |
| A light paying family, AI only | **under US$1 a month** |
| A free School account | **near zero most months; roughly US$1 to US$2 a year** |
| The ceiling already in the code | **US$10 per paying family per month, US$2 per free family** |

**The number that should decide the price is the US$10 cap, not the averages.** It is not a
forecast, it is a promise the code already keeps: at US$10 a paying family's readings stop
until next month. A frequent family lands at US$8 to US$9, which means the cap was set at
roughly what a frequent family actually costs, and there is almost no headroom between
normal heavy use and the wall.

---

## 1. What one subscription covers

**The account, with no limit on children.** This is a finding, not a decision you have
recorded, and the two parts of the business currently disagree:

- The app bills per account. `subscriptions.account_id`, one row per account, and
  `TM.plan.tier()` reads one plan for the whole family. No per-child billing exists, and I
  found no cap on how many children an account may hold.
- The retired Founding Families offer said otherwise. `content/founding-families.ts` still
  has `export const PRICE_SCOPE = "one child"`.

So a family with three children pays once and gets three children's records.

**This matters more than it looks, because cost scales per child and the cap does not.**
Readings are written per child. Three children cost roughly three times the AI of one, but
the US$10 ceiling is on the *account*. A three-child family doing ordinary things would
reach the cap at around a third of the activity a one-child family gets, and then be told
*"This month's readings are complete."* The multi-child family pays the same and hits the
wall first.

Three ways out, all yours to pick: price per child; keep one price and make the cap per
child; or keep one price and one cap and say plainly that it covers a stated number of
children. Doing nothing means the second-best customer gets the worst experience.

---

## 2. Measured per-action costs

From `launch-local\data\ai-calls.jsonl`, the app's own ledger, 23 to 28 October 2026. This
is the current code on the `launch` branch, model `claude-opus-5-5`, costed at the rates
set in `server/engine.js` (US$5 per million input tokens, US$25 per million output).

| Action | Calls | Input tok | Output tok | Median cost |
|---|---|---|---|---|
| What the record shows (one reading) | 3 | 6,282 | 7,057 | **US$0.261** |
| Check a reading against the record | 6 | 5,338 | 1,351 | US$0.065 |
| Evidence classification (sorting one moment) | 6 | 4,647 | 188 | US$0.024 |
| First look (end of onboarding) | 1 | 4,667 | 390 | US$0.033 |
| Something to try together (Reflect) | 1 | 4,084 | 202 | US$0.026 |

Two things fall straight out of this table.

**Output is the cost, not input.** A reading's 7,057 output tokens cost US$0.176 of its
US$0.26; its input costs US$0.031. Everything else the app does produces a few hundred
tokens and is nearly free by comparison. One task is 80% of the bill.

**Readings are checked twice.** Six checks against three readings. So a completed reading
is about **US$0.33 to US$0.39** all in, not US$0.26.

One more measurement, from your own walkthrough of 20 October
(`ai-budget-2026-10-19.json`): a **free School account's onboarding — a child, four notes
and the first look — cost US$0.209 over 8 calls.** No report card in that run.

---

## 3. Monthly running costs

Built up from the table above. A "session" is a sitting in which a parent adds something;
the server waits 45 seconds and refreshes once, so three things added together cause one
reading, not three (`server/jobs.js`).

### School & Life (paid)

| | Light | Regular | Frequent |
|---|---|---|---|
| Sessions that trigger a reading | 2 | 8 | 20 |
| Moments captured | 2 | 8 | 20 |
| Ask / Explore | 0 | 1 | 4 |
| Reflect together | 0 | 1 | 2 |
| Report cards added | 0 | 1 | 2 |
| Readings (@ US$0.36) | 0.72 | 2.88 | 7.20 |
| Classifying moments (@ US$0.028) | 0.06 | 0.22 | 0.56 |
| Ask (@ ~US$0.08, estimated) | 0 | 0.08 | 0.32 |
| Reflect (@ US$0.026 + follow-up) | 0 | 0.05 | 0.10 |
| Report cards (@ ~US$0.45, estimated) | 0 | 0.45 | 0.90 |
| **AI total** | **~US$0.78** | **~US$3.68** | **~US$9.08** |

Add payment processing (Stripe, roughly 2.9% + 30c on a small monthly charge) and a share
of the server and database, which are a fixed monthly cost rather than a per-family one and
are not in these figures.

**The frequent column is the one to look at.** US$9.08 against a US$10 cap means a frequent
family is throttled in a normal month, in a product whose whole promise is that the picture
keeps growing. Either the cap rises and the price carries it, or the readings get cheaper.

### School (free)

A free account has no moments and no Ask. It has report cards, and report cards arrive two
or three times a year, not monthly.

- Onboarding, once: **US$0.209 measured**
- A month with a report card: roughly **US$0.30 to US$0.70** (estimated, see below)
- A month without one: **effectively zero.** Nothing runs when nobody adds anything; the
  daily pass only retries failed jobs and sends you an ops email.

**So a free School account costs roughly US$1 to US$2 a year, plus US$0.21 to create.** Free
is cheap because the free plan is report cards only, and report cards are rare. A thousand
free accounts is on the order of US$1,500 a year, not a month.

The per-family free ceiling is US$2 a month, which is about three report cards in one month.
Nobody will reach it by behaving normally.

---

## 4. Assumptions and uncertainties

Ranked by how much they could move the answer.

**1. The per-action table rests on 17 calls.** Three readings, six checks, six
classifications, one first look, one Reflect, across two accounts in six days. The ledger
was only added on 23 October, so this is everything there is. The classification and check
figures are tight; three readings is not enough to be confident about the most expensive
action in the product.

**2. A report card has never been costed on its own.** The US$0.45 above is an estimate, and
it is the weakest number here. Report cards are the only task that sends *images* (your
consent gate: "a document's pages are read as they are"), and image tokens scale with page
count and resolution. A phone photo of four pages could cost several times a clean PDF. This
is also the *entire* cost of the free plan, so it deserves one measurement: add one report
card to a test account and read the ledger line.

**3. A reading gets more expensive as the record grows.** The 7,057-token output came from
records that are months old. The reading describes what the record holds, so a five-year
record produces a longer reading from a longer input. These figures are early-life costs,
and the cost per family probably rises every year a family stays. Nothing in the data says
by how much.

**4. The rates are configured, not billed.** US$5 and US$25 per million tokens are the
defaults in `server/engine.js`. Your own ops page says so: *"These are estimates from token
counts at the rates set in configuration; the Anthropic console has the bill."* Check them
against a real invoice before pricing on them.

**5. The model is the most expensive one.** `claude-opus-5-5`. The readings are the product,
so that is defensible, but it is a choice with a price attached: the cheaper tasks
(classification, checks, extraction) are 20% of spend and almost certainly do not need it.
Moving only those would cut perhaps 15% with nothing a parent would notice.

**6. The session counts are made up.** 2, 8 and 20 are my labels for light, regular and
frequent. No parent has used this app yet. Your brief says it: development usage is not
evidence of parent behaviour. Everything above is "what it costs *if* a family behaves like
this", and the first ten real families will replace the whole middle column.

**7. Development spending is not in any of this, and it is the larger number so far.**
US$13.97 across 246 calls on 19 and 20 October alone, most of it evaluation runs and
retries that no parent causes.

---

## 5. What I would do before setting a price

1. **Cost one report card.** One upload, one ledger line. It unblocks the free-plan number
   and the biggest estimate in the paid one.
2. **Decide the child question.** One child, or the account? It changes the cap, the cost
   per family and what the page may say. The page currently says nothing about it, which is
   honest but cannot last past the first two-child family.
3. **Check the configured rates against a real Anthropic invoice.**
4. **Then price.** Whatever the number is, it has to carry a US$9 frequent family, Stripe's
   cut and a share of the infrastructure, and still leave a margin. That is the constraint,
   and it is set by the cost of one task: the reading.
