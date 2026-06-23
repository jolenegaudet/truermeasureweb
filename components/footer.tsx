import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-bark/10 bg-cream py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-heading font-semibold text-bark">Truer Measure</p>
            <p className="mt-1 text-sm text-stone">
              © {new Date().getFullYear()} Truer Measure. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link href="/" className="text-sm text-stone transition-colors hover:text-bark">
              Start Here
            </Link>
            <Link href="/learn" className="text-sm text-stone transition-colors hover:text-bark">
              Learn
            </Link>
            <Link href="/build" className="text-sm text-stone transition-colors hover:text-bark">
              Build
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
