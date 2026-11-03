import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import {
  CARRIES_CHOICE,
  COUNTRY_OVERRIDE,
  DEFAULT_CURRENCY,
  DEFAULT_INTERVAL,
  HANDOFF,
  SHOW_PRICES,
} from "@/content/app-plans";
import { currencyForCountry } from "@/content/currency-for-country";

/**
 * Which currency the plan card shows, and who decides it.
 *
 * **Netlify decides it, not this script.** netlify/edge-functions/currency.ts
 * reads the country Netlify resolved for the request and writes
 * `data-tm-currency` onto the <html> tag before the browser receives it, so
 * the first paint is already the right price and there is nothing here to
 * race. Her correction of 29 October 2026 is why: the browser's language
 * settings are not the visitor's country, and this file used to treat them as
 * if they were.
 *
 * What is left in this script is everything the edge cannot do:
 *
 *  1. The billing period's default, so a click before hydration still carries
 *     one.
 *  2. Stamping the currency and period onto a plan link at the moment of the
 *     click (`?currency=` and `?billing=`, named once in content/app-plans.ts).
 *     A capture-phase listener installed before paint, rather than only the
 *     rendered href, because between paint and hydration the href still holds
 *     the defaults while the page already shows the visitor's own price: a
 *     parent clicking in that gap would reach a checkout in a currency they
 *     were never shown. The rendered href carries it too, for a middle-click
 *     or "open in new tab", neither of which fires a click event.
 *  3. In a LOCAL PREVIEW ONLY, a `?tm-country=FR` override, so the page can be
 *     checked as another country would see it without deploying anything. It
 *     never runs where the edge has already set the attribute.
 *
 *     It used to be gated on the price preview, on the reasoning that the price
 *     preview cannot exist in a publishable build. Preparing the launch build,
 *     2 November 2026, is what broke that reasoning: the launch build sets the
 *     price flag, and this would have gone with it, handing anyone a way to be
 *     shown another country's price by typing in the address bar. It now has
 *     its own variable, NEXT_PUBLIC_TM_COUNTRY_OVERRIDE, which belongs on this
 *     computer and never in Netlify, and scripts/check-launch-build.mjs fails
 *     if `tm-country` reaches the exported HTML.
 *
 * Everything is wrapped in try/catch and does nothing on failure: no attribute
 * means CAD, which is her rule for an unknown country and also what a visitor
 * with JavaScript off sees.
 */
const STAMP_ON_CLICK = `document.addEventListener("click",function(e){try{
var a=e.target&&e.target.closest?e.target.closest("a[data-tm-handoff]"):null;if(!a)return;
var u=new URL(a.getAttribute("href"),location.href);
u.searchParams.set(${JSON.stringify(HANDOFF.currency)},d.getAttribute("data-tm-currency")||${JSON.stringify(DEFAULT_CURRENCY)});
u.searchParams.set(${JSON.stringify(HANDOFF.interval)},d.getAttribute("data-tm-interval")||${JSON.stringify(DEFAULT_INTERVAL)});
a.href=u.toString();
}catch(err){}},true);`;

/* Preview only: see (3) above. The mapping comes from the same module the
   edge function uses, so a local check cannot disagree with production. */
const PREVIEW_COUNTRY_OVERRIDE = `
if(!d.getAttribute("data-tm-currency")){
var q=/[?&]tm-country=([A-Za-z]{2})(?:&|$)/.exec(location.search);
if(q){var MAP=${JSON.stringify(
  Object.fromEntries(
    ["CA", "US", "FR", "DE", "GB", "JP", "MX", "AU", "IE", "NL", "BE", "ES", "IT", "PT", "AT", "FI", "GR", "SK", "SI", "LT", "LV", "EE", "LU", "CY", "MT", "HR", "BG"].map(
      (c) => [c, currencyForCountry(c)],
    ),
  ),
)};var v=MAP[q[1].toUpperCase()];if(v)d.setAttribute("data-tm-currency",v);}
}`;

const CURRENCY_BEFORE_PAINT = `(function(){try{
var d=document.documentElement;
if(!d.getAttribute("data-tm-interval"))d.setAttribute("data-tm-interval",${JSON.stringify(DEFAULT_INTERVAL)});
/* Keep what the edge decided, where React cannot lose it. If hydration ever
   fails, React re-renders the page from scratch and the attribute it never
   rendered is dropped, which would silently turn a euro price into a Canadian
   one. The card puts it back from here. */
window.__TM_CURRENCY=d.getAttribute("data-tm-currency")||null;
${COUNTRY_OVERRIDE ? PREVIEW_COUNTRY_OVERRIDE : ""}
${CARRIES_CHOICE ? STAMP_ON_CLICK : ""}
}catch(e){}})();`;

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://truermeasure.com"),
  title: {
    default: "A Truer Measure",
    template: "%s | Truer Measure",
  },
  description:
    "A living account of your child's learning, strengths, and growth, bringing together evidence from school and beyond.",
  openGraph: {
    siteName: "Truer Measure",
    type: "website",
    url: "/",
    title: "A Truer Measure",
    description:
      "A living account of your child's learning, strengths, and growth, bringing together evidence from school and beyond.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${hankenGrotesk.variable}`}
    >
      <body className="bg-parchment font-sans text-bark antialiased overflow-x-hidden">
        {/* First, and synchronous: it has to win the race against the paint. */}
        {SHOW_PRICES && (
          <script dangerouslySetInnerHTML={{ __html: CURRENCY_BEFORE_PAINT }} />
        )}
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="truermeasure.com"
          strategy="afterInteractive"
        />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
