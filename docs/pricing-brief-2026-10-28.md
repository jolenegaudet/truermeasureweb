# Pricing brief: what School & Life costs to run

*28 October 2026, updated the same evening for her second brief (CA$29, the
currency selector, the reading allowance, and free-plan costs at signup), and
again on 29 October for the prices she set: CA$47, US$47 and €47, monthly or
yearly with 10% off the year. No new paid AI calls were made to write this:
every figure comes from logs that already existed.*

---

## The short version

| | |
|---|---|
| The price, set 29 October | **CA$47, US$47, €47 a month**, her figures |
| Yearly, 10% off | **507.60 in each currency**, 42.30 a month |
| Tax | CAD and USD **plus** tax; €47 **includes** VAT |
| What one subscription covers today | **the whole account, every child in it** |
| A frequent paying family, AI only | **US$8 to US$9 a month** |
| A regular paying family, AI only | **US$3 to US$4 a month** |
| A light paying family, AI only | **under US$1 a month** |
| One report card, processed | **US$0.16 to US$0.20, measured 29 October** |
| A reading across the record, free School | **US$0.173, once per sitting** |
| A free School account | **about US$0.75 to US$1.10 a year, plus US$0.21 to create** |
| The ceilings already in the code | **US$10 per paying family per month, US$2 per free family** |

**At CA$47 the AI cost stops being the thing to worry about.** CA$47 is about
US$33 at her own CAD-to-USD ratio, and a Canadian parent is the cheapest of the
three, so that is the worst case. A regular family costs US$3.43 in AI, which is
10% of it; a frequent family US$8.58, which is 26%, before Stripe takes roughly
4% more. At CA$29 those same two families were 17% and 43%. The US$10 ceiling
still matters, because it is what keeps the tail from eating the margin, and it
is the reason §4's wording now appears on the page.

**Revised 29 October, twice.** A report card was the one unmeasured cost on
28 October and the estimate was US$0.45. The first revision measured US$0.16
and concluded the signup problem had gone away. **That revision was wrong**,
because the run behind it never got its cards into the record and so never paid
for the reading across them. Corrected, a report card is three separate costs,
not one: **US$0.16 to US$0.20 to process the card, US$0.209 to onboard the
account once, and US$0.173 for a reading across the record, once per sitting.**
A ten-card signup therefore costs at least US$2.38 against a US$2 ceiling, and
the parent is cut off around the eighth card rather than the fourth. The
breakage is real; only the number moved. Both runs are kept in
`launch-local\data` as `report-card-costs-2026-10-29.jsonl` and
`photo-card-costs-2026-10-29.jsonl`, outside every repository, with their
console output beside them.

---

## 1. The prices she set, and what tax does to each one

**Her figures, 29 October 2026, in her own words:** *"CAD $47 plus taxes, USD
$47 plus taxes and Euros 47 Euros VAT included. Option to pay yearly or
monthly. 10% off for yearly."*

So the proposals this section used to argue for (US$21 and €19 against CA$29)
are gone, and what follows describes her decision instead.

| | CAD | USD | EUR |
|---|---|---|---|
| Monthly | 47 | 47 | 47 |
| Yearly, 10% off | 507.60 | 507.60 | 507.60 |
| Yearly works out to | 42.30 a month | 42.30 | 42.30 |
| Tax | added on top | added on top | already inside |

Both figures are in Stripe as **two** prices, not six: one monthly and one
yearly, each carrying `currency_options` for all three currencies with the euro
option marked tax-inclusive. Test mode only, product `prod_VWzNTXW9zLkKSH`.

### How tax works on these three prices, corrected

An earlier note in this file reasoned about the euro price as if the VAT inside
it had to be offset by a higher sticker, and a note of mine in chat said Stripe
Tax has to be on "or the inclusive euro amount is never carved out", which
reads as though the total might not hold. **It holds either way.** The accurate
version:

- **CAD and USD are tax-exclusive.** The parent is charged 47 *plus* whatever
  tax applies, so the amount leaving their account is larger than the amount on
  the page. In New Brunswick, 15% HST makes CA$47 into CA$54.05. The page says
  "Plus applicable taxes." for exactly this reason.
- **EUR is tax-inclusive.** The parent is charged €47 and nothing more. The VAT
  is taken out of that total, so at a 20% rate the business keeps about €39.
  EU rates run from 17% to 27%, so what is kept differs by country while the
  parent's total does not. The page says "VAT included."
**Confirmed in the sandbox on 29 October**, by Stripe's own tax calculation
rather than by argument: CA$47 becomes CA$54.05 with 15% HST added, CA$507.60
becomes CA$583.74, and €47 stays **€47** with €7.83 of VAT taken out of it
(€507.60 stays €507.60 with €84.60 inside). The business keeps €39.17 of a euro
month. A New York address computes 0%, because the sandbox is registered for
Canada and France only. Details in `docs/currency-handoff-2026-10-29.md` §2f.

- **Stripe Tax decides whether tax is calculated, not what the parent pays.**
  With it off, a euro parent is still charged exactly €47; the difference is
  that no VAT is computed or recorded against it, and a CAD or USD parent is
  charged 47 with no tax added. That is a bookkeeping exposure rather than a
  pricing one, and it is why the setting has to be on in test mode before the
  six checkout checks mean anything.

The two consequences of a single figure across three currencies stay as they
were, and both are hers to confirm rather than mine to adjust:

- **CA$47 and US$47 are the same figure, not the same value.** At her own
  CAD-to-USD ratio a Canadian parent pays about US$33, roughly a quarter less
  than an American one for the same thing. Her retired Founding Families offer
  priced currencies by hand at ratios of about 0.71 (USD) and 0.59 (EUR)
  (`content/founding-families.ts`), which a flat 47/47/47 sets aside.
- **The euro keeps the least.** About €39 of €47 at 20%, against the full 47 in
  the other two.

**Nothing converts anything at run time.** Her brief asked for fixed prices per
currency and that is what the code does; no rate is fetched, and switching
currency shows a different fixed amount rather than a conversion that could be
stale by the time anyone reaches Stripe.

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

Two further runs were made for this brief on 29 October 2026, with her
authorization, both on a free School account whose onboarding was already
finished, so neither carries onboarding cost:

- **Run A, three fictional cards as clean PDFs.** Ten calls, US$0.478.
  `report-card-costs-2026-10-29.jsonl`. **Its record was empty**: the evidence
  rows were rejected for malformed ids, so no reading across the cards ran. §6
  explains how that was found and fixed.
- **Run B, one fictional card as a photograph** (PNG, 1180 x 1528 px, the size
  a phone photo is reduced to), with the record intact. Eight calls, US$0.375,
  including the reading across the record. `photo-card-costs-2026-10-29.jsonl`.

| Action | Run | Calls | Input tok | Output tok | Cost each |
|---|---|---|---|---|---|
| What the record shows (School & Life) | Oct 23-28 | 3 | 6,282 | 7,057 | **US$0.261** |
| Check a reading against the record | Oct 23-28 | 6 | 5,338 | 1,351 | US$0.065 |
| Evidence classification (one moment) | Oct 23-28 | 6 | 4,647 | 188 | US$0.024 |
| First look (end of onboarding) | Oct 23-28 | 1 | 4,667 | 390 | US$0.033 |
| Something to try together (Reflect) | Oct 23-28 | 1 | 4,084 | 202 | US$0.026 |
| Reading a card, clean PDF | A | 3 | 5,009 | 666 | **US$0.042** |
| Reading a card, photograph | B | 1 | 5,365 | 584 | **US$0.041** |
| Explaining a card, empty record | A | 3 | 3,785 | 2,702 | US$0.087 |
| Explaining a card, record intact | B | 1 | 3,954 | 2,158 | **US$0.074** |
| Checking, empty record | A | 4 | 3,024 | 334 | US$0.024 |
| Checking, record intact | B | 5 | 3,891 | 418 | **US$0.030** |
| The school reading (free School) | B | 1 | 5,136 | 3,389 | **US$0.110** |

**A photograph costs what a PDF costs.** US$0.041 against US$0.042: 7% more
input tokens, slightly fewer output. The worry that parents photographing
rather than scanning would multiply the cost is not borne out at this size.
A multi-page photograph has still not been measured.

**Output is the bill, in every task.** The explanation writes 2,158 tokens and
the school reading 3,389, which is US$0.085 of that reading's US$0.110.
Extraction returns a few hundred tokens of fields and is the cheap part.

### Three different things, which this brief previously ran together

| What | Measured example | When it runs |
|---|---|---|
| **1. Per-card processing** | **US$0.16 to US$0.20** | once per card |
| **2. Onboarding** | **US$0.209** | once per account |
| **3. A reading across the record** | **US$0.173** | once per sitting |

**1. Per-card processing** is reading the document, explaining that card, and
checking the explanation. Against an intact record it measured US$0.0414 +
US$0.0737 + US$0.0866 of checking = **US$0.20**. Against an empty record it was
**US$0.16**, because there was less to check against: three checks on the card
with a record, against one or two without. The record is what makes a card
dearer, which matters because the record only grows.

**2. Onboarding** is US$0.209 over 8 calls, from her own walkthrough of
20 October: a child, four notes and the first look. No report card in that run.
Unchanged by these measurements.

**3. A reading across the record** is the school picture itself, and it is a
separate cost that neither of the first two includes: US$0.110 for the reading
plus US$0.063 for its two checks = **US$0.173**. It runs **once per sitting,
not once per card**, because the server waits 45 seconds and refreshes once
(`server/jobs.js`). It read a one-card record here. Its input and output both
scale with the record, so this figure is a floor, not an average.

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
| Report cards, per-card processing (@ US$0.20) | 0 | 0.20 | 0.40 |
| **AI total** | **~US$0.78** | **~US$3.43** | **~US$8.58** |

Against CA$47 (about US$33, the cheapest of the three): **10% of revenue for a
regular family, 26% for a frequent one**, and at CA$29 those were 17% and 43%,
before Stripe's roughly 2.9% + 30c and before any share of the
server, database and file storage, which are fixed monthly costs rather than
per-family ones and are not in this table.

**This is why the allowance wording exists.** The ceiling is already in the
code (`TM_AI_CAP_FULL_USD`, default US$10) and a frequent family lands at
US$8.58, so a parent can meet it in a normal month. The page now says what
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

**The free plan's costs are measured now, as examples rather than as averages.**
Three numbers, not one: per-card processing, onboarding, and the reading across
the record. §3 separates them. The figure this brief carried on 28 October,
US$0.45 a card, was an estimate and it was wrong in both directions: a card
costs less than that, and a card is not the only thing a card costs.

**The free School picture does work from report cards alone**, which is the
requirement. Confirmed twice on 29 October: once free with the stand-in model
and once in run B, where one photographed card produced a school summary and
two insights that reached the parent through `/api/state`. There is no defect
here. §6 records the two errors in my own measurement setup that made it look
otherwise.

### In a steady month: small, not nothing

A free account has no moments and no Ask. It has report cards, and report cards
arrive two or three times a year, not monthly. Nothing runs when nobody adds
anything: the daily pass only retries failed jobs and sends an ops email.

- Onboarding, once: **US$0.209 measured**
- A month with one report card: **US$0.37 measured** (US$0.20 for the card,
  US$0.17 for the reading it triggers)
- A month without one: **effectively zero**

**So a settled free account costs roughly US$0.75 to US$1.10 a year, plus
US$0.21 to create**, assuming two or three cards a year and one child. A
thousand free accounts is on the order of US$1,100 in the first year and
US$900 a year after that, not a month. The 28 October estimate of US$1 to US$2
a year was closer than yesterday's revision of US$0.40, which omitted the
reading because the run that produced it never made one.

### At signup: over the ceiling, around the eighth card

A parent who signs up with five years of school behind them does not upload one
report card. They upload the drawer. Two cards a year for five years is ten.

| At signup, ten cards in one sitting | Measured example |
|---|---|
| Onboarding | US$0.21 |
| 10 cards of per-card processing @ US$0.20 | US$2.00 |
| One reading across the record | US$0.17 |
| **First-day floor** | **US$2.38** |

**The free ceiling is US$2 a month, so this parent is cut off around the eighth
card**, and is told *"This month's readings are complete. New additions are
kept and will be read next month."* Taking the lower per-card figure of
US$0.16, it is around the tenth card. Either way the drawer does not fit.

**That total is a floor, not an estimate.** Both the per-card checks and the
reading grow with the record: the reading measured here read one card, with
3,389 output tokens, and a ten-card record gives it ten cards to read. So the
real first day is higher than US$2.38, and the cut-off is earlier than the
eighth card.

**So the signup problem is real after all.** Yesterday's revision said it had
gone away. That was wrong, and the cause was mine: the run behind it never put
the cards into the record, so it never paid for a reading. Corrected, the
breakage is back, at the eighth card rather than the fourth.

**Two ways out, in the order I would try them:**

1. **Separate keeping from reading.** Extract and keep every card at signup,
   and explain them over the following weeks. Extraction alone is US$0.041, so
   a ten-card drawer can be kept complete for **US$0.41**, which is a fifth of
   the ceiling. The parent's record is whole immediately, which is what they
   came for, and the explanations and the reading spread out behind it. This is
   the only option that scales with a back catalogue of any size.
2. **Raise the allowance.** The cap is a configuration value
   (`TM_AI_CAP_SCHOOL_USD`), so this is a setting, not a rebuild. US$4 carries
   about eighteen cards and a reading. But the app has one monthly cap, not a
   separate first-month one, so raising it raises it every month and weakens
   the ceiling as a brake for the other eleven months.

Option 1 is a change to the customer app, which is outside this brief. Option 2
is a configuration value you set.

I have not changed the cap or anything else in the app. This is a finding for
her, not a decision I made.

---

## 6. Assumptions and uncertainties

Ranked by how much they could move the answer.

**1. Two errors in my own measurement setup, both now corrected, and worth
recording because the first one produced a wrong conclusion in this brief.**

Run A synced its evidence rows with ids `ec1`, `ec2`, `ec3`. The server
requires `/^e\d{1,7}$/` (`server/state.js`), so it rejected all three with
`code: bad_id` and kept only the reports. The record was therefore empty, the
gate at `if (!scope.items.length) continue` closed, and no reading across the
cards ran. I read that absence as a possible product defect. **It was not. The
app is correct and the free School picture works from report cards alone**,
confirmed with the stand-in model at no cost and then in run B. Run B's first
attempt then failed the same way on `code: bad_date`, because what is read off
a card is whatever the card printed ("June 2026") and an evidence date must be
ISO; the app derives it with `A.reportDate(schoolYear, term)`. That attempt
spent US$0.044 before stopping.

**2. One card is measured as one page.** A clean one-page PDF and a one-page
photograph cost the same, US$0.042 against US$0.041, which settles the worry
that photographing rather than scanning would multiply the cost. **A multi-page
document has not been measured**, and image tokens scale with pages, so a
four-page card is still an open number. The fixtures include a deliberately
unreadable photograph, so the cost of a refusal could be measured beside it.

**3. Every figure here is one example, not an average.** One card at each of
three grades, one photograph, one reading of a one-card record, one onboarding.
Three assumptions are carried, not measured: **document size** (one page),
**how often a parent uploads** (two or three cards a year in a steady month,
ten at signup), and **how many children** are on the account (one). Each of
the three multiplies the whole free-plan figure, and the child count multiplies
the paid one too, which is §2.

**4. The per-action table rests on 17 calls.** Three readings, six checks, six
classifications, one first look, one Reflect, across two accounts in six days.
The ledger was only added on 23 October, so this is all there is. The
classification and check figures are tight; three readings is not enough to be
confident about the most expensive action in the product.

**5. A reading gets more expensive as the record grows.** The 7,057-token
output came from records that are months old. The reading describes what the
record holds, so a five-year record produces a longer reading from a longer
input. These are early-life costs, and cost per family probably rises every
year a family stays. Nothing in the data says by how much.

**6. The rates are configured, not billed.** US$5 and US$25 per million tokens
are the defaults in `server/engine.js`. Her own ops page says so: *"These are
estimates from token counts at the rates set in configuration; the Anthropic
console has the bill."* Check them against a real invoice before pricing on
them.

**7. The model is the most expensive one.** `claude-opus-5-5`. The readings are
the product, so that is defensible, but the cheaper tasks (classification,
checks, extraction) are a fifth of spend and almost certainly do not need it.
Moving only those would cut perhaps 15% with nothing a parent would notice.

**8. The session counts are made up.** 2, 8 and 20 are my labels for light,
regular and frequent. No parent has used this app yet, and her brief says it:
development usage is not evidence of parent behaviour. The first ten real
families will replace the whole middle column.

**9. The currencies are set at one figure, not at a ratio or a rate.** CA$47,
US$47 and €47 are her decision of 29 October, and nothing in this file or in
the code converts between them. Where a comparison is made (CA$47 ≈ US$33), it
uses the ratio implied by her own retired pricing, not a rate looked up today,
and that ratio has not been rechecked against the market.

**10. Development spending is in none of this**, and it is the larger number so
far: US$13.97 across 246 calls on 19 and 20 October alone, most of it
evaluation runs and retries that no parent causes.

---

## 7. What I would do before setting a price

1. ~~**Cost one report card.**~~ Done, 29 October, in three parts:
   **US$0.16 to US$0.20** per card, **US$0.209** to onboard, **US$0.173** per
   reading across the record. A photograph costs what a PDF costs.
2. **Fix the free signup.** A ten-card drawer costs at least US$2.38 against a
   US$2 ceiling, so it does not fit, and that floor rises with the record. My
   recommendation is to keep every card at signup for US$0.041 each and explain
   them over the following weeks, which is a customer-app change rather than a
   setting. Raising `TM_AI_CAP_SCHOOL_USD` is the one-line alternative, and it
   raises the ceiling for every month, not just the first.
3. **Decide the child question.** One child, or the account? It changes the
   ceiling, the cost per family and what the page may say.
4. **Check the configured rates against a real Anthropic invoice.**
5. ~~**Then confirm CA$29, US$21 and €19.**~~ Set on 29 October: CA$47, US$47
   and €47, monthly or yearly with 10% off the year. At CA$47 a regular family
   spends 10% of revenue on AI and a frequent one 26%, so the AI cost is no
   longer the binding constraint; the ceiling still keeps the tail off the
   margin. Two questions the single figure leaves open are in §1: the CAD/USD
   parity, and what the euro keeps after VAT.
6. **Six checkout checks, in test mode**, once the key is replaced and the
   currency reaches the app: monthly and yearly in each currency, each on its
   own account, showing the displayed amount, the checkout amount, the tax
   lines and the total. The plan is in
   `docs/currency-handoff-2026-10-29.md`.

Two measurements remain cheap and would firm up the floor: a **multi-page**
card, and the reading across a **ten-card** record rather than a one-card one.
Neither is needed to decide item 2.
