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
    <header>
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-10 py-[26px]">
        <Link
          href="/"
          className="font-heading text-[23px] font-semibold tracking-[0.01em] text-bark"
        >
          Welcome to the Truer Measure of your child!
        </Link>

        <nav className="hidden items-center gap-[30px] md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-[12.5px] font-semibold tracking-[0.16em] uppercase transition-opacity hover:opacity-70 ${
                pathname === href ? "text-bark" : "text-rose"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          className="text-bark md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Gradient separator */}
      <div className="mx-auto max-w-[1180px] px-10">
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
        <nav className="border-t border-border bg-parchment px-10 py-4 md:hidden">
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
