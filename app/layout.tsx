import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

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
    default: "The Hidden Report Card | Truer Measure",
    template: "%s | Truer Measure",
  },
  description:
    "A living account of your child's learning, strengths, and growth — bringing together evidence from school and beyond.",
  openGraph: {
    siteName: "Truer Measure",
    type: "website",
    url: "/",
    title: "The Hidden Report Card | Truer Measure",
    description:
      "A living account of your child's learning, strengths, and growth — bringing together evidence from school and beyond.",
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
