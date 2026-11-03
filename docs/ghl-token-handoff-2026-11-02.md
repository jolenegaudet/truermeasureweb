# The GoHighLevel token swap: who does what, and in which order

2 November 2026. **Nothing in this document has been done.** Every step needs
her approval by name, and the deployment step needs its own. It exists so that
Dan's email and GoHighLevel work and the website work do not collide, and so
that nobody does the same thing twice or at the wrong moment.

This is separate from releasing the new landing page. It publishes the code
that is already live, and nothing else. If it is run while the new page is
being released, neither is a clean change.

---

## What the website actually sends to GoHighLevel

So Dan can see the whole surface without reading the code.

`netlify/functions/contact-submit.ts`, server-side, `services.leadconnectorhq.com`,
API version 2021-07-28. It needs two environment variables in Netlify:
**`GHL_API_TOKEN`** and **`GHL_LOCATION_ID`**.

- `POST /contacts/` with firstName, lastName, email (the only required field),
  phone, city, state, postalCode, and "number of kids and ages" into the custom
  field `QUrGhz59gCPbU9gVa0MY`. Source is recorded as `truermeasure.com`.
- `POST /contacts/{id}/tags` with one of three tags:

| tag | where from |
|---|---|
| `waitlist-elite-learning-leaders` | `/`, `/fr`, `/learn`, `/fr/learn` |
| `applied-inner-circle` | `/`, `/fr`, `/inner-circle`, `/fr/inner-circle` |
| `withdrawal-request` | `/withdraw`, `/fr/withdraw` (three fields only) |

A fourth, `waitlist-hidden-report-card`, is allowed by the function and used by
no page.

**Duplicate behaviour matters for the tests.** A repeat submission on a
non-withdrawal form returns 200 with `{duplicate:true}` and **does not apply
the tag**. Only `withdrawal-request` tags an existing contact, and returns 502
if that fails. So a test that reuses an address proves nothing about tagging.

`netlify/functions/kit-subscribe.ts` is a different system — Kit, not
GoHighLevel, with `KIT_API_KEY` — and it is **not affected by this swap**. It
runs the "Be the first to know" signup on `/hidden-report-card` and both home
pages. Leave it alone.

**The site sends no email itself.** The withdrawal confirmation a parent
receives comes from a GoHighLevel workflow triggered by the tag. Whether that
workflow is published has not been confirmed, and it is to be checked **in the
GoHighLevel interface**, not by widening a token's permissions. A token that
can read workflows is a permanent capability bought for a one-off look.

---

## The order, and why it is that order

A changed environment variable does not reach a Netlify function until a new
deploy. That is the only reason a redeploy is in this list at all.

```
1  she creates the new token
2  the new token goes into Netlify (and into the secrets folder outside the repo)
3  main is verified, then redeployed, so the functions pick the new token up
4  the forms and the emails are tested
5  only then is the old token revoked
```

Revoking first would take every form down until step 3 finished.

---

## Step by step

### 1 — The new token · **her**, in GoHighLevel

A private-integration token named **Website forms**, with **contacts write**
and nothing else. No workflow permission: see above. She creates it; nobody
else sees it, and it is never pasted into a chat.

### 2 — Netlify and the secrets folder · **her**, with a script

`GHL_API_TOKEN` in Netlify, Functions scope, marked secret. `GHL_LOCATION_ID`
does not change. The same value also replaces the old one in the workspace
`.secrets` folder, outside the repository, so the local scripts keep working.

A PowerShell script can prompt for the value without echoing it and resolve the
secrets folder from `TRUERMEASURE_SECRETS_DIR`, with the workspace `.secrets`
as the documented default. It is written when she asks for it, not before,
because it needs a Netlify token this machine does not have.

### 3 — The maintenance deployment · **her approval, by name, on its own**

**Verify the commit first.** The build hook builds `main` HEAD, not a commit
anyone names:

```
git ls-remote origin main
```

must equal the live deploy's `commit_ref`, which is
`042fce6be0b52835cc07c7858425c0ce436bf034` as of 2 November 2026 (deploy
`6acd6fc6518f20fb13a3a941`, state ready, published 12 October). **If they
differ, stop and say so.** A redeploy that publishes something other than what
is already live is not a maintenance deployment.

Then the hook. One POST, an empty 200, a build of twenty to thirty seconds.

`main` builds cleanly on its own terms: its `prebuild` runs only
`check-legal-placeholders.mjs`, which is on `main`. The branch's extra check is
not, and is not needed there.

If the build fails, nothing breaks: Netlify keeps serving the current deploy.

### 4 — The checks · **mine**, on her word

Labelled test contacts on her own plus-addressed aliases, one per form, each
address used once so the duplicate path does not silently skip the tag:

```
jolenegaudet22+tm-test-2026-11-02@gmail.com     /learn
jolenegaudet22+tm-test-2026-11-02b@gmail.com    /inner-circle
jolenegaudet22+tm-test-2026-11-02c@gmail.com    /withdraw       (English)
jolenegaudet22+tm-test-2026-11-02d@gmail.com    /fr/withdraw    (French)
```

Pass is all four of: HTTP 200; the contact exists with the right tag; no
`console.error` in the function logs; and, for the withdrawal, the confirmation
email arrives in her inbox. The test contacts are deleted afterwards.

**The withdrawal test cannot touch a subscription or a refund.** The withdrawal
form posts to the same contact endpoint as the other two and applies a tag.
There is no Stripe call anywhere in that function, no customer lookup and no
refund path: the entire effect is a GoHighLevel contact, a tag, and whatever
workflow that tag starts. That is why it is run on her own address and why she
is told before it runs — the only thing it can set off is an email to her.

### 5 — Revoking the old token · **her**, last

Only after step 4 passes. Until then the old token is the rollback.

---

## Rollback

Put the old token back in Netlify and redeploy. That is the whole procedure,
and it is why step 5 is last. If the old token has already been revoked, the
forms stay down until a new one is created, which is a worse position than
anything this change is meant to fix.

---

## Who owns what

| | |
|---|---|
| **Dan** | Email and GoHighLevel: deliverability, the workflows, the templates, and confirming in the interface that the withdrawal-confirmation workflow is published. |
| **Her** | Creating the token, setting it in Netlify, approving the deployment by name, revoking the old token. |
| **Me (website)** | The commit check before the deployment, the form tests, reading the function logs, deleting the test contacts, and reporting. |

Nobody tests the same form twice: Dan's checks are of what GoHighLevel does
after the tag, mine are of what the website does before it. The tag is the
seam.

**Not in this change:** the new landing page, the prices, the customer app, any
Stripe object, the Kit signup, and the Privacy Policy.
