/**
 * Jolène's three public accounts, with each platform's mark.
 * Marks are inline SVG (Substack and LinkedIn paths from Simple Icons, CC0;
 * Instagram drawn as the outline glyph) so there is no image request and they
 * take the text colour of wherever they sit.
 *
 * 1 October 2026: moved into the footer so they appear on every page, and each
 * one given a button of its own. Three words in a row on a dark background read
 * as small print; three bordered buttons read as something to press.
 */
const accounts = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/jolene_gaudet/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Substack",
    href: "https://substack.com/@jolenegaudet",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/jolene-gaudet/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export function SocialLinks() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
      {accounts.map(({ name, href, icon }) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Jolene Gaudet on ${name} (opens in a new tab)`}
            className="flex items-center gap-[10px] rounded-[2px] border border-charcoal px-[18px] py-[11px] text-[12.5px] font-semibold uppercase tracking-[0.14em] text-parchment no-underline transition-colors hover:border-parchment hover:bg-parchment hover:text-bark"
          >
            <span className="block h-[19px] w-[19px]">{icon}</span>
            {name}
          </a>
        </li>
      ))}
    </ul>
  );
}
