"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { localeFromPath, localePath, otherLocalePath, shell } from "@/content/i18n";

/**
 * The locale comes from the path rather than a prop, because the nav lives in
 * the root layout and the root layout is shared by both languages.
 */
export default function Nav() {
  const pathname = usePathname() || "/";
  const locale = localeFromPath(pathname);
  const t = shell[locale];
  const [open, setOpen] = useState(false);

  const links = [
    { href: localePath(locale, "/#tiers"), label: t.nav.start },
    { href: localePath(locale, "/hidden-report-card"), label: t.nav.hiddenReportCard },
    { href: localePath(locale, "/learn"), label: t.nav.learn },
    { href: localePath(locale, "/inner-circle"), label: t.nav.innerCircle },
  ];

  const toggleHref = otherLocalePath(pathname);

  return (
    <header>
      {t.banner ? (
        <div className="bg-blush px-5 py-[9px] text-center text-[11px] font-semibold tracking-[0.18em] uppercase text-dusk">
          {t.banner}
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-5 md:gap-6 md:px-10 md:py-[26px]">
        <Link
          href={localePath(locale, "/")}
          className="font-heading text-[17px] font-semibold tracking-[0.01em] text-bark md:text-[23px]"
        >
          {t.brand}
        </Link>

        <nav className="hidden items-center gap-[30px] md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[12.5px] font-semibold tracking-[0.16em] uppercase text-rose transition-opacity hover:opacity-70"
            >
              {label}
            </Link>
          ))}
          {/* The language toggle is the same page in the other language, not a
              language home page, so nobody loses their place by using it. */}
          <Link
            href={toggleHref}
            hrefLang={locale === "en" ? "fr" : "en"}
            aria-label={t.toggle.aria}
            className="rounded-[2px] border border-warm px-[11px] py-[5px] text-[12px] font-semibold tracking-[0.16em] uppercase text-rose transition-colors hover:bg-bark hover:text-parchment"
          >
            {t.toggle.label}
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href={toggleHref}
            hrefLang={locale === "en" ? "fr" : "en"}
            aria-label={t.toggle.aria}
            className="rounded-[2px] border border-warm px-[10px] py-[5px] text-[12px] font-semibold tracking-[0.16em] uppercase text-rose"
          >
            {t.toggle.label}
          </Link>
          <button
            className="text-bark"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Gradient separator */}
      <div className="mx-auto max-w-[1180px] px-5 md:px-10">
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg,transparent,#e3cfc8 40%,#e3cfc8 60%,transparent)",
          }}
        />
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border bg-parchment px-5 py-4 md:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block py-2 text-[12.5px] font-semibold tracking-[0.16em] uppercase text-rose"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
