import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { PRICE_PREVIEW } from "@/content/app-plans";
import { EUROZONE } from "@/content/currency-for-country";

/**
 * Which currency the plan card shows, decided before the page paints.
 *
 * The site is a static export, so the HTML is the same for everyone and carries
 * all three currencies; this sets the attribute that CSS uses to show one (see
 * app/globals.css). It runs here, inline and synchronously, rather than in the
 * card's own effect, because measured on the production export a visitor in
 * France, Germany or the United States otherwise read CA$47 for about 650ms
 * before it corrected. An amount a parent will be charged is the one thing that
 * may not be briefly wrong.
 *
 * The euro-area list comes from content/currency-for-country.ts, so the script
 * and the module cannot drift. The logic is deliberately the same: a region
 * subtag only, never a bare language, because French is spoken in Canada.
 *
 * It is wrapped in try/catch and does nothing on failure: no attribute means
 * CAD, which is also what a visitor with JavaScript off sees. It is absent from
 * the build entirely unless the price preview is on, like every other part of
 * the unapproved pricing.
 */
const CURRENCY_BEFORE_PAINT = `(function(){try{
var EZ=${JSON.stringify([...EUROZONE])};
var t=[].concat(navigator.languages||[],[navigator.language||""]),r=null;
for(var i=0;i<t.length;i++){var m=/^[A-Za-z]{2,3}[-_]([A-Za-z]{2})\\b/.exec(t[i]||"");if(m){r=m[1].toUpperCase();break}}
if(!r)return;
document.documentElement.setAttribute("data-tm-currency",r==="CA"?"CAD":EZ.indexOf(r)>=0?"EUR":"USD");
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
        {PRICE_PREVIEW && (
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
