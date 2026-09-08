"use client";

import { useEffect, useState } from "react";

/**
 * The founding-rate line takes itself down.
 *
 * It states a public deadline, so the site must not still be claiming it the
 * morning after. The date is checked in the browser rather than at build time,
 * because this is a static export: a build-time check would freeze whatever was
 * true on the day the site was last deployed, and the site may not be rebuilt
 * for weeks.
 *
 * It renders nothing on the server and appears only once the browser confirms
 * the deadline has not passed. That way the expired line can never flash up
 * before being removed — after the date it is simply never in the page.
 *
 * End of 30 September 2026, Atlantic time (ADT, UTC-3) = 1 October 2026 03:00 UTC.
 * A fixed instant, so a visitor in another timezone sees it end at the same
 * moment Jolène's day ends, not theirs.
 */
const ENDS_AT = Date.UTC(2026, 9, 1, 3, 0, 0);

export function FoundingRateLine({ className }: { className?: string }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(Date.now() < ENDS_AT);
  }, []);

  if (!live) return null;

  return (
    <p className={className} style={{ fontSize: 13.5, lineHeight: 1.65 }}>
      Founding Families: the first 40. Rate ends 30 September.
    </p>
  );
}
