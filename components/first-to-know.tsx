"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  PRIVACY_PATH,
  firstToKnow,
} from "@/content/first-to-know";
import type { Locale } from "@/content/i18n";

/**
 * "Be the first to know" — one email field, nothing else.
 *
 * Deliberately a separate component from components/waitlist-button.tsx rather
 * than a variant of it. That one asks for eight fields and posts to
 * GoHighLevel, and it is still in use on Elite Parents and Inner Circle in both
 * languages. Touching it to add a one-field mode would put those four pages at
 * risk for no gain, so this stands alone and borrows its visual language.
 *
 * The caller supplies the button class, so each placement keeps exactly the
 * button it already had and nothing moves on the page.
 */

type Props = {
  locale?: Locale;
  /** Which placement this was, recorded in Kit alongside the tag. */
  place: "home-card" | "hidden-report-card";
  /** The trigger's classes. Passed in so the page keeps its existing button. */
  className: string;
};

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

/** Matches the server's check. Both are deliberately loose: the only honest
 *  test of an address is whether mail to it arrives. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FirstToKnowButton({ locale = "en", place, className }: Props) {
  const t = firstToKnow[locale];
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        {t.button}
      </button>
      {open && (
        <FirstToKnowModal
          locale={locale}
          place={place}
          onClose={() => {
            setOpen(false);
            // Send focus back where it came from, or a keyboard user is
            // dropped at the top of the document.
            trigger.current?.focus();
          }}
        />
      )}
    </>
  );
}

function FirstToKnowModal({
  locale,
  place,
  onClose,
}: {
  locale: Locale;
  place: Props["place"];
  onClose: () => void;
}) {
  const t = firstToKnow[locale];
  const privacyPath = PRIVACY_PATH[locale];

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  const ids = useId();
  const headingId = `${ids}-heading`;
  const bodyId = `${ids}-body`;
  const errorId = `${ids}-error`;
  const consentId = `${ids}-consent`;

  const done = status === "success" || status === "duplicate";

  // Escape closes, Tab stays inside, and the page behind does not scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Open with the cursor already in the one field there is.
  useEffect(() => {
    field.current?.focus();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!EMAIL.test(address)) {
      setError(t.invalid);
      setStatus("error");
      field.current?.focus();
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/.netlify/functions/kit-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address, place, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // The function answers with a code, not a sentence, so the wording
        // stays in this file and stays in the reader's language.
        setError(data?.error === "invalid_email" ? t.invalid : t.failed);
        setStatus("error");
        return;
      }
      setStatus(data?.duplicate ? "duplicate" : "success");
    } catch {
      setError(t.network);
      setStatus("error");
    }
  };

  const labelCls =
    "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.16em] text-smoke";
  const inputCls =
    "w-full rounded-[2px] border bg-parchment px-4 py-3 text-[16px] text-bark placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-rose-dark";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bark/70 px-4 py-8 backdrop-blur-sm md:items-center md:py-10"
      onClick={onClose}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={done ? undefined : bodyId}
        lang={locale}
        /* text-center is stated rather than inherited. Both placements sit
           inside a centred block today, so this changes nothing now and keeps
           the modal looking the same wherever it is opened from later. */
        className="relative w-full max-w-[480px] rounded-[3px] bg-parchment p-6 text-center shadow-2xl sm:p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={t.close}
          onClick={onClose}
          className="absolute right-3 top-3 h-10 w-10 text-[26px] leading-none text-smoke hover:text-bark focus:outline-none focus:ring-2 focus:ring-rose-dark"
        >
          ×
        </button>

        {done ? (
          /* The whole form is replaced, as she asked. No second ask, no
             questionnaire, nothing to do next but close it. */
          <div className="py-4 text-center" role="status" aria-live="polite">
            <h2
              id={headingId}
              className="font-heading mb-4 font-medium text-bark"
              style={{ fontSize: 28, lineHeight: 1.15 }}
            >
              {status === "duplicate" ? t.duplicateEyebrow : t.successEyebrow}
            </h2>
            <p className="mb-7 text-smoke" style={{ fontSize: 16, lineHeight: 1.6 }}>
              {status === "duplicate" ? t.duplicateBody : t.successBody}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-block rounded-[2px] bg-bark px-7 py-[14px] text-[12.5px] font-bold uppercase tracking-[0.14em] text-parchment focus:outline-none focus:ring-2 focus:ring-rose-dark"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-[10px] pr-10 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
              {t.eyebrow}
            </div>
            <h2
              id={headingId}
              className="font-heading mb-4 pr-6 font-medium text-bark"
              style={{ fontSize: 26, lineHeight: 1.14 }}
            >
              {t.heading}
            </h2>
            <p
              id={bodyId}
              className="mb-7 text-smoke"
              style={{ fontSize: 15.5, lineHeight: 1.6 }}
            >
              {t.body}
            </p>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <label className={labelCls} htmlFor={`${ids}-email`}>
                  {t.emailLabel}
                </label>
                <input
                  ref={field}
                  id={`${ids}-email`}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="off"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") {
                      setStatus("idle");
                      setError(null);
                    }
                  }}
                  aria-invalid={status === "error" ? true : undefined}
                  aria-describedby={
                    [error ? errorId : null, consentId].filter(Boolean).join(" ") ||
                    undefined
                  }
                  className={`${inputCls} ${
                    status === "error" ? "border-rose" : "border-warm"
                  }`}
                />
              </div>

              {error && (
                <p
                  id={errorId}
                  role="alert"
                  className="rounded-[2px] border border-rose-dark bg-blush px-4 py-3 text-[13.5px] text-bark"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-1 inline-block rounded-[2px] bg-bark px-9 py-[16px] text-[13px] font-bold uppercase tracking-[0.14em] text-parchment focus:outline-none focus:ring-2 focus:ring-rose-dark disabled:opacity-60"
              >
                {status === "submitting" ? t.sending : t.submit}
              </button>

              {/* Consent sits with the form, below the button, and the act of
                  sending it is the opt-in. No checkbox: this is an email
                  signup, not an account or a purchase. */}
              <p
                id={consentId}
                className="text-smoke"
                style={{ fontSize: 12.5, lineHeight: 1.55 }}
              >
                {t.consent}
                {privacyPath && (
                  <>
                    {` ${t.privacyLead} `}
                    <Link
                      href={privacyPath}
                      className="text-rose underline underline-offset-2"
                    >
                      {t.privacyLabel}
                    </Link>
                    {/* The full stop belongs to the sentence, not the link, so
                        it sits outside and is not underlined. */}
                    .
                  </>
                )}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
