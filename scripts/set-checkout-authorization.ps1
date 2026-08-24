<#
.SYNOPSIS
  Sets the authorization and currency sentence shown above the Subscribe button
  on the Truer Measure payment link.

.DESCRIPTION
  Stripe exposes this text only through the API (custom_text.submit.message).
  It is not editable in the Dashboard, and the browser Stripe Shell is read-only
  in live mode, so this script is the way to change it.

  The text below is written for how this account actually bills: the charge is
  in US dollars, and the customer's own bank does any conversion. Do NOT reword
  it to say Stripe charges in the local currency. That would describe Adaptive
  Pricing, which cannot run on a Canadian account pricing in USD.

  IF THE PRICE EVER CHANGES, the amounts in $NewMessage go stale. Update them
  here and re-run, or the checkout will state a price the customer is not charged.

.PARAMETER PaymentLinkId
  Defaults to the live Truer Measure - Annual Membership link.

.PARAMETER Restore
  Puts back the previous (currency-only) wording instead of the new sentence.

.PARAMETER DryRun
  Shows what is currently set and what would be written, and changes nothing.

.EXAMPLE
  .\set-checkout-authorization.ps1 -DryRun
  .\set-checkout-authorization.ps1

.NOTES
  Your Stripe key is read from the STRIPE_SECRET_KEY environment variable if
  present, otherwise you are prompted for it. It is never written to disk, never
  printed, and never stored in this repository.

  A restricted key (rk_live_...) with Payment Links set to Write is safer than
  the account secret key and is all this script needs. Create one at
  https://dashboard.stripe.com/apikeys under "Restricted keys".
#>

[CmdletBinding()]
param(
    [string]$PaymentLinkId = 'plink_1Tt9FUAJm8m0sW6oXiReCBEy',
    [switch]$Restore,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# --- the wording -------------------------------------------------------------

$NewMessage = @'
By subscribing, you authorize Truer Measure to charge you **US$597.00 every year until you cancel**. Billing is in **US dollars**. If your card is issued in another currency, your bank converts at its own exchange rate on each billing date and may add a foreign transaction fee, so the amount on your statement will vary. · En vous abonnant, vous autorisez Truer Measure à vous facturer **597,00 $ US chaque année jusqu'à votre annulation**. La facturation est en **dollars américains**. Si votre carte est émise dans une autre devise, votre banque applique son propre taux de change à chaque date de facturation et peut ajouter des frais de conversion, de sorte que le montant sur votre relevé variera.
'@

# What was there before this script first ran, kept so -Restore is exact.
$PreviousMessage = @'
All amounts are in **US dollars (USD)**. Your bank may apply its own exchange rate and charge a foreign transaction fee. · Tous les montants sont en **dollars américains (USD)**. Votre banque peut appliquer son propre taux de change et des frais de conversion.
'@

$Message = if ($Restore) { $PreviousMessage } else { $NewMessage }

if ($Message.Length -gt 1200) {
    throw "Message is $($Message.Length) characters. Stripe's limit for custom_text.submit is 1200."
}

# Encoding guard. Windows PowerShell 5.1 reads a .ps1 saved as UTF-8 without a
# byte-order mark as ANSI, which turns "americains" with an accent into mojibake
# before it is ever sent. If that has happened, the French half will contain a
# capital A-tilde. Refuse to publish rather than put broken text on a live page.
$suspectChars = @([char]0x00C3, [char]0xFFFD)   # A-tilde, and the replacement character
if ($Message.IndexOfAny($suspectChars) -ge 0) {
    throw "The message text was mis-decoded when this script was read. Run it with PowerShell 7 (pwsh), or re-save this file as UTF-8 with a BOM. Nothing was sent."
}

# --- credentials -------------------------------------------------------------

if ($env:STRIPE_SECRET_KEY) {
    $key = $env:STRIPE_SECRET_KEY
    Write-Host 'Using STRIPE_SECRET_KEY from the environment.'
} else {
    Write-Host ''
    Write-Host 'You need a Stripe key. Get one here:' -ForegroundColor Cyan
    Write-Host '  https://dashboard.stripe.com/apikeys'
    Write-Host ''
    Write-Host '  Best: under "Restricted keys", create a key with Payment Links set to Write.'
    Write-Host '  Or:   under "Standard keys", click "Reveal live key" on the Secret key.'
    Write-Host ''
    Write-Host 'Copy it, then right-click here to paste. Nothing will appear as you paste.' -ForegroundColor DarkGray
    Write-Host ''
    $secure = Read-Host 'Paste the key, then press Enter' -AsSecureString
    $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

if (-not $key) { throw 'No key provided.' }
if (-not ($key.StartsWith('sk_') -or $key.StartsWith('rk_'))) {
    throw 'That does not look like a Stripe key. It should start with sk_ (secret) or rk_ (restricted).'
}
if ($key.StartsWith('sk_test_') -or $key.StartsWith('rk_test_')) {
    throw 'That is a test-mode key. This script edits the LIVE payment link, so it needs a live key.'
}

$headers = @{ Authorization = "Bearer $key" }

# --- show what is there now --------------------------------------------------

Write-Host ''
Write-Host "Payment link: $PaymentLinkId"

$current = Invoke-RestMethod -Method Get -Headers $headers `
    -Uri "https://api.stripe.com/v1/payment_links/$PaymentLinkId"

Write-Host ''
Write-Host 'Currently shown above the Subscribe button:' -ForegroundColor DarkGray
if ($current.custom_text.submit.message) {
    Write-Host $current.custom_text.submit.message
} else {
    Write-Host '(nothing set)'
}

Write-Host ''
Write-Host 'Will be replaced with:' -ForegroundColor DarkGray
Write-Host $Message
Write-Host ''

if ($DryRun) {
    Write-Host 'Dry run. Nothing changed.' -ForegroundColor Yellow
    return
}

# --- apply -------------------------------------------------------------------

# Percent-encode as UTF-8 ourselves so the body on the wire is pure ASCII. This
# removes every chance of the host's default encoding corrupting the accents.
$form  = 'custom_text[submit][message]=' + [uri]::EscapeDataString($Message)
$bytes = [Text.Encoding]::UTF8.GetBytes($form)

$result = Invoke-RestMethod -Method Post -Headers $headers `
    -Uri "https://api.stripe.com/v1/payment_links/$PaymentLinkId" `
    -ContentType 'application/x-www-form-urlencoded' `
    -Body $bytes

if ($result.custom_text.submit.message -eq $Message) {
    Write-Host 'Updated. Stripe confirmed the new text.' -ForegroundColor Green
    Write-Host ''
    Write-Host "Check it live: $($result.url)"
    Write-Host 'It appears in the box directly above the Subscribe button.'
} else {
    Write-Warning 'Stripe accepted the request but returned different text. Check the link in the Dashboard.'
}

$key = $null
