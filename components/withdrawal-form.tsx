"use client";

import { useState } from "react";
import type { Locale } from "@/content/i18n";

/**
 * The EU "withdrawal function" (Directive 2011/83/EU art. 11a, added by
 * Directive (EU) 2023/2673, applying from 19 June 2026): a clearly labelled
 * way to withdraw online, asking only for what identifies the contract, with
 * a confirmation step. The request goes to GoHighLevel tagged
 * "withdrawal-request"; the confirmation email on a durable medium is sent by
 * the GoHighLevel workflow on that tag, which must exist before this page is
 * published.
 */
type Status = "idle" | "confirming" | "submitting" | "success" | "error";

const copy = {
  en: {
    first: "First name",
    last: "Last name",
    email: "The email you paid with",
    withdraw: "Withdraw from contract",
    confirmLead: (email: string) => `You are withdrawing from your Truer Measure membership paid with ${email}.`,
    confirm: "Confirm withdrawal",
    sending: "Sending…",
    back: "Go back",
    doneTitle: "We have received your withdrawal.",
    doneBody: (email: string) =>
      `We will confirm it by email to ${email}. If you don’t receive that email within one business day, write to support@truermeasure.com.`,
    failed: "Something went wrong.",
    network: "Network error.",
    errorTail:
      "Your withdrawal was not sent. Please try again, or email support@truermeasure.com with your name, the email you paid with, and that you are withdrawing.",
  },
  fr: {
    first: "Prénom",
    last: "Nom",
    email: "Le courriel utilisé pour le paiement",
    withdraw: "Rétractez-vous du contrat",
    confirmLead: (email: string) =>
      `Vous vous rétractez de votre adhésion à Truer Measure payée avec ${email}.`,
    confirm: "Confirmez la rétractation",
    sending: "Envoi…",
    back: "Revenez en arrière",
    doneTitle: "Nous avons reçu votre rétractation.",
    doneBody: (email: string) =>
      `Nous vous la confirmerons par courriel à ${email}. Si ce courriel ne vous parvient pas d’ici un jour ouvrable, écrivez à support@truermeasure.com.`,
    failed: "Une erreur est survenue.",
    network: "Erreur de réseau.",
    errorTail:
      "Votre rétractation n’a pas été envoyée. Veuillez réessayer, ou écrivez à support@truermeasure.com avec votre nom, le courriel utilisé pour le paiement, et le fait que vous vous rétractez.",
  },
} as const;

export function WithdrawalForm({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async () => {
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/.netlify/functions/contact-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: "withdrawal-request", ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || t.failed);
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError(t.network);
      setStatus("error");
    }
  };

  const labelCls = "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.16em] text-smoke";
  const inputCls =
    "w-full rounded-[2px] border border-warm bg-parchment px-4 py-3 text-[15px] text-bark placeholder:text-faint focus:border-rose-dark focus:outline-none";

  if (status === "success") {
    return (
      <div className="border border-border bg-ghost px-6 py-8 text-center">
        <h2 className="font-heading mb-3 text-[26px] font-medium text-bark">
          {t.doneTitle}
        </h2>
        <p className="text-smoke" style={{ fontSize: 16, lineHeight: 1.7 }}>
          {t.doneBody(form.email)}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("confirming");
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label>
          <span className={labelCls}>{t.first}</span>
          <input required className={inputCls} value={form.firstName} onChange={onChange("firstName")} autoComplete="given-name" />
        </label>
        <label>
          <span className={labelCls}>{t.last}</span>
          <input required className={inputCls} value={form.lastName} onChange={onChange("lastName")} autoComplete="family-name" />
        </label>
      </div>
      <label>
        <span className={labelCls}>{t.email}</span>
        <input required type="email" className={inputCls} value={form.email} onChange={onChange("email")} autoComplete="email" />
      </label>

      {status === "confirming" || status === "submitting" ? (
        <div className="border border-border bg-ghost px-5 py-5">
          <p className="mb-4 text-bark" style={{ fontSize: 16, lineHeight: 1.6 }}>
            {t.confirmLead(form.email)}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={status === "submitting"}
              className="rounded-[2px] bg-bark px-7 py-[14px] text-[13px] font-bold uppercase tracking-[0.14em] text-parchment disabled:opacity-60"
            >
              {status === "submitting" ? t.sending : t.confirm}
            </button>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="rounded-[2px] border border-warm px-6 py-[13px] text-[13px] font-semibold uppercase tracking-[0.14em] text-smoke"
            >
              {t.back}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="submit"
          className="self-start rounded-[2px] bg-bark px-7 py-[14px] text-[13px] font-bold uppercase tracking-[0.14em] text-parchment"
        >
          {t.withdraw}
        </button>
      )}

      {status === "error" ? (
        <p className="text-rose" style={{ fontSize: 15, lineHeight: 1.6 }}>
          {error} {t.errorTail}
        </p>
      ) : null}
    </form>
  );
}
