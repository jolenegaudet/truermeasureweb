# Pricing brief: what School & Life costs to run

*28 October 2026, updated the same evening for her second brief (CA$29, the
currency selector, the reading allowance, and free-plan costs at signup). No
new paid AI calls were made to write this: every figure comes from logs that
already existed.*

---

## The short version

| | |
|---|---|
| Proposed price | **CA$29 a month**, her figure |
| Proposed US price, for her review | **US$21 a month** |
| Proposed EUR price, for her review | **€19 a month, VAT included** |
| What one subscription covers today | **the whole account, every child in it** |
| A frequent paying family, AI only | **US$8 to US$9 a month** |
| A regular paying family, AI only | **US$3 to US$4 a month** |
| A light paying family, AI only | **under US$1 a month** |
| A free School account | **near zero most months, but see §5: signup is the exception** |
| The ceilings already in the code | **US$10 per paying family per month, US$2 per free family** |

**At CA$29 the business works on regular families and is thin on frequent
ones.** CA$29 is about US$20 at her own CAD-to-USD ratio. A regular family
costs US$3.68 in AI, which is 18% of that. A frequent family costs US$9.08,
which is 44% of it before Stripe takes roughly 4% more. The US$10 cap is what
stops that becoming 60%, which is the real reason the cap matters and the
reason §4's wording now appears on the page.

---

## 1. The two prices I am proposing

Her brief: *"Configure USD and EUR as separate prices. Propose those amounts
for my review; until approved, show 'Price to be confirmed' in the local
preview."* Neither number below is in the code. `APP_PRICES` carries CA$29 and
two nulls, and a null is what renders the placeholder.

**They come from her own ratios, not from an exchange rate.** The retired
Founding Families offer priced three currencies by hand
(`content/founding-families.ts`):

| | CAD | USD | ratio | EUR | ratio |
|---|---|---|---|---|---|
| intro | 39 | 27 | 0.692 | 23 | 0.590 |
| standard | 59 | 42 | 0.712 | 35 | 0.593 |

Applied to CA$29: USD 20.4, EUR 17.1.

**US$21.** Rounds her own ratio up to a whole number. US$20 is the alternative
if a round twenty reads better than a precise twenty-one.

**€19, VAT included.** This one is a judgement, and she should see why. In her
Stripe setup the euro price is tax-inclusive while CAD and USD are quoted
before tax, so the three are not comparable at the same ratio:

- **€17** is the strict ratio match, and what her old pricing implies. After
  20% VAT it nets about €14.2, well under the CA$29 net.
- **€22** is what holds the net roughly level with CAD after VAT.
- **€19** sits between them: a visible price close to the ratio, with the net
  shortfall roughly halved.

She already accepted the lower euro net once, in the old offer, so €17 is
defensible and consistent. €19 is what I would pick.

**Nothing here converts anything at run time.** Her brief asked for fixed
prices per currency and that is what the code does; no rate is fetched, and
switching currency shows a different fixed amount rather than a conversion
that could be stale by the time anyone reaches Stripe.

---

## 2. What one subscription covers

**The account, with no limit on children.** This is a finding, not a decision
she has recorded, and the two parts of the business currently disagree:

- The app bills per account: `subscriptions.account_id`, one row per account,
  and one plan for the whole family. No per-child billing exists, and there is
  no cap on how many children an account may hold.
- The retired offer said otherwise. `content/founding-families.ts` still has
  `export const PRICE_SCOPE = "one child"`.

The page now says the app's version, in her words: *"One subscription covers
the children in your account."*

**Cost scales per child and the ceiling does not.** Readings are written per
child, so three children cost roughly three times the AI, while the US$10
ceiling is on the account. A three-child family doing ordinary things reaches
the cap at about a third of the activity a one-child family gets. They pay the
same and are throttled first.

Three ways out, all hers to pick: price per child; keep one price and make the
ceiling per child; or keep one price and one ceiling and say plainly how many
children it covers. Doing nothing means the best customer gets the worst
experience.

---

## 3. Measured per-action costs

From `launch-local\data\ai-calls.jsonl`, the app's own ledger, 23 to 28 October
2026: the current `launch` code, model `claude-opus-5-5`, costed at the rates
in `server/engine.js` (US$5 per million input tokens, US$25 per million
output).

| Action | Calls | Input tok | Output tok | Median cost |
|---|---|---|---|---|
| What the record shows (one reading) | 3 | 6,282 | 7,057 | **US$0.261** |
| Check a reading against the record | 6 | 5,338 | 1,351 | US$0.065 |
| Evidence classification (one moment) | 6 | 4,647 | 188 | US$0.024 |
| First look (end of onboarding) | 1 | 4,667 | 390 | US$0.033 |
| Something to try together (Reflect) | 1 | 4,084 | 202 | US$0.026 |

**Output is the cost, not input.** A reading's 7,057 output tokens cost
US$0.176 of its US$0.26; its input costs US$0.031. Everything else produces a
few hundred tokens and is nearly free beside it. One task is most of the bill.

**Readings are checked twice.** Six checks against three readings, so a
completed reading is **US$0.33 to US$0.39** all in, not US$0.26.

One more measurement, from her own walkthrough of 20 October
(`ai-budget-2026-10-19.json`): a **free School account's onboarding, a child,
four notes and the first look, cost US$0.209 over 8 calls.** No report card in
that run.

---

## 4. Monthly running costs, and the allowance the page now explains

A "session" is a sitting in which a parent adds something. The server waits 45
seconds and refreshes once, so three things added together cause one reading,
not three (`server/jobs.js`). That debounce is doing a lot of work in these
numbers.

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
| Report cards (@ ~US$0.45, **estimated**) | 0 | 0.45 | 0.90 |
| **AI total** | **~US$0.78** | **~US$3.68** | **~US$9.08** |

Against CA$29 (about US$20): **18% of revenue for a regular family, 44% for a
frequent one**, before Stripe's roughly 2.9% + 30c and before any share of the
server, database and file storage, which are fixed monthly costs rather than
per-family ones and are not in this table.

**This is why the allowance wording exists.** The ceiling is already in the
code (`TM_AI_CAP_FULL_USD`, default US$10) and a frequent family lands at
US$9.08, so a parent can meet it in a normal month. The page now says what
happens, in plain words and with no figure: new readings pause, nothing is
lost, everything already written stays open, and readings begin again at the
start of the next month. That is exactly what the app does today
(`budget_family`: *"This month's readings are complete. New additions are kept
and will be read next month."*). Nothing was changed about the cap, and the
word "unlimited" is nowhere on the page.

---

## 5. Free School accounts, and the signup problem

Her brief: *"Keep free-plan costs labelled as estimates, and account for
parents uploading several years of report cards at signup."*

**Every free-plan figure here is an estimate.** A report card has never been
costed on its own, and it is the whole cost of the free plan. That is the
weakest number in this document, and §6 says why.

### In a steady month: close to zero

A free account has no moments and no Ask. It has report cards, and report cards
arrive two or three times a year, not monthly. Nothing runs when nobody adds
anything: the daily pass only retries failed jobs and sends an ops email.

- Onboarding, once: **US$0.209 measured**
- A month with one report card: **roughly US$0.30 to US$0.70, estimated**
- A month without one: **effectively zero**

**So a settled free account costs roughly US$1 to US$2 a year, estimated, plus
US$0.21 to create.** A thousand free accounts is on the order of US$1,500 a
year, not a month.

### At signup: the opposite, and it breaks

A parent who signs up with five years of school behind them does not upload one
report card. They upload the drawer. Two cards a year for five years is ten,
and each one needs its own extraction, translation and explanation. The
cross-card school reading runs once for the sitting, not once per card, because
of the 45-second debounce.

| At signup | Estimated |
|---|---|
| Onboarding (measured) | US$0.21 |
| 10 report cards @ ~US$0.45 each (estimated) | US$4.50 |
| One school reading across them | US$0.36 |
| **First-month total** | **~US$5.07** |

**The free ceiling is US$2 a month.** So this parent is cut off after roughly
the fourth report card, on their first day, and is told *"This month's readings
are complete. New additions are kept and will be read next month."*

That is the worst possible first impression, delivered to the parent who is
most committed, and it is a direct consequence of two settings that were chosen
separately. Even a modest back catalogue breaks it: six cards is about US$2.9,
still over.

**Three ways out, in the order I would try them:**

1. **Measure a report card first.** If the real figure is US$0.15 rather than
   US$0.45, ten cards is US$1.50 and the problem mostly disappears. Everything
   above hangs on one unmeasured number, and one upload settles it.
2. **Give the first month a larger allowance**, sized to a back catalogue
   rather than to a steady month. The cap is already a configuration value
   (`TM_AI_CAP_SCHOOL_USD`), so this is a setting, not a rebuild.
3. **Separate keeping from reading.** Extract and keep every card at signup,
   and explain them over the following weeks. The parent's record is complete
   immediately, which is what they came for, and the cost spreads.

I have not changed the cap or anything else in the app. This is a finding for
her, not a decision I made.

---

## 6. Assumptions and uncertainties

Ranked by how much they could move the answer.

**1. A report card has never been costed on its own.** The US$0.45 is an
estimate and it drives the free-plan numbers and the signup problem entirely.
Report cards are the only task that sends *images* (her consent gate: "a
document's pages are read as they are"), and image tokens scale with page count
and resolution, so a phone photo of four pages could cost several times a clean
PDF. One upload on a test account and one ledger line settles it.

**2. The per-action table rests on 17 calls.** Three readings, six checks, six
classifications, one first look, one Reflect, across two accounts in six days.
The ledger was only added on 23 October, so this is all there is. The
classification and check figures are tight; three readings is not enough to be
confident about the most expensive action in the product.

**3. A reading gets more expensive as the record grows.** The 7,057-token
output came from records that are months old. The reading describes what the
record holds, so a five-year record produces a longer reading from a longer
input. These are early-life costs, and cost per family probably rises every
year a family stays. Nothing in the data says by how much.

**4. The rates are configured, not billed.** US$5 and US$25 per million tokens
are the defaults in `server/engine.js`. Her own ops page says so: *"These are
estimates from token counts at the rates set in configuration; the Anthropic
console has the bill."* Check them against a real invoice before pricing on
them.

**5. The model is the most expensive one.** `claude-opus-5-5`. The readings are
the product, so that is defensible, but the cheaper tasks (classification,
checks, extraction) are a fifth of spend and almost certainly do not need it.
Moving only those would cut perhaps 15% with nothing a parent would notice.

**6. The session counts are made up.** 2, 8 and 20 are my labels for light,
regular and frequent. No parent has used this app yet, and her brief says it:
development usage is not evidence of parent behaviour. The first ten real
families will replace the whole middle column.

**7. The currency ratios are hers, not today's exchange rates.** US$21 and €19
follow the pattern of her old pricing. If the underlying rates have moved since
September, the ratios have not been rechecked here.

**8. Development spending is in none of this**, and it is the larger number so
far: US$13.97 across 246 calls on 19 and 20 October alone, most of it
evaluation runs and retries that no parent causes.

---

## 7. What I would do before setting a price

1. **Cost one report card.** One upload, one ledger line. It unblocks the
   free-plan number, the signup problem and the biggest estimate in the paid
   table.
2. **Fix the free signup ceiling**, once that number is known.
3. **Decide the child question.** One child, or the account? It changes the
   ceiling, the cost per family and what the page may say.
4. **Check the configured rates against a real Anthropic invoice.**
5. **Then confirm CA$29, US$21 and €19.** At CA$29 a regular family spends 18%
   of revenue on AI and a frequent one 44%. That is workable if most families
   are regular, and the ceiling is what keeps the tail from eating the margin.
