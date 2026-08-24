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
  Your Stripe secret key is read from the STRIPE_SECRET_KEY environment variable
  if present, otherwise you are prompted for it. It is never written to disk,
  never printed, and never stored in this repository.
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

# --- credentials -------------------------------------------------------------

if ($env:STRIPE_SECRET_KEY) {
    $key = $env:STRIPE_SECRET_KEY
    Write-Host 'Using STRIPE_SECRET_KEY from the environment.'
} else {
    $secure = Read-Host 'Paste your Stripe LIVE secret key (sk_live_...). It will not be displayed' -AsSecureString
    $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

if (-not $key) { throw 'No secret key provided.' }
if (-not $key.StartsWith('sk_')) { throw 'That does not look like a Stripe secret key. It should start with sk_.' }

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

$result = Invoke-RestMethod -Method Post -Headers $headers `
    -Uri "https://api.stripe.com/v1/payment_links/$PaymentLinkId" `
    -Body @{ 'custom_text[submit][message]' = $Message }

if ($result.custom_text.submit.message -eq $Message) {
    Write-Host 'Updated. Stripe confirmed the new text.' -ForegroundColor Green
    Write-Host ''
    Write-Host "Check it live: $($result.url)"
    Write-Host 'It appears in the box directly above the Subscribe button.'
} else {
    Write-Warning 'Stripe accepted the request but returned different text. Check the link in the Dashboard.'
}

$key = $null
