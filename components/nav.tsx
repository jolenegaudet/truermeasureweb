"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Start Here" },
  { href: "/learn", label: "Learn From The Room" },
  { href: "/build", label: "Build Direct With Me" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-bark/10 bg-cream/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-heading text-base font-semibold tracking-tight text-bark"
        >
          Truer Measure
        </Link>

        <ul className="hidden gap-8 md:flex">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm transition-colors hover:text-bark ${
                  pathname === href
                    ? "font-medium text-bark"
                    : "text-stone"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="text-bark md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <ul className="border-t border-bark/10 bg-cream px-6 py-4 md:hidden">
          {links.map(({ href, label }) => (
            <li key={href} className="py-2">
              <Link
                href={href}
                className="text-sm text-ink"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
