"use client";

import { useState } from "react";

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

export function WithdrawalForm() {
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
        setError(data?.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Network error.");
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
          We have received your withdrawal.
        </h2>
        <p className="text-smoke" style={{ fontSize: 16, lineHeight: 1.7 }}>
          We will confirm it by email to {form.email}. If you don&rsquo;t receive that email within one
          business day, write to support@truermeasure.com.
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
          <span className={labelCls}>First name</span>
          <input required className={inputCls} value={form.firstName} onChange={onChange("firstName")} autoComplete="given-name" />
        </label>
        <label>
          <span className={labelCls}>Last name</span>
          <input required className={inputCls} value={form.lastName} onChange={onChange("lastName")} autoComplete="family-name" />
        </label>
      </div>
      <label>
        <span className={labelCls}>The email you paid with</span>
        <input required type="email" className={inputCls} value={form.email} onChange={onChange("email")} autoComplete="email" />
      </label>

      {status === "confirming" || status === "submitting" ? (
        <div className="border border-border bg-ghost px-5 py-5">
          <p className="mb-4 text-bark" style={{ fontSize: 16, lineHeight: 1.6 }}>
            You are withdrawing from your Truer Measure membership paid with <strong>{form.email}</strong>.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={status === "submitting"}
              className="rounded-[2px] bg-bark px-7 py-[14px] text-[13px] font-bold uppercase tracking-[0.14em] text-parchment disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Confirm withdrawal"}
            </button>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="rounded-[2px] border border-warm px-6 py-[13px] text-[13px] font-semibold uppercase tracking-[0.14em] text-smoke"
            >
              Go back
            </button>
          </div>
        </div>
      ) : (
        <button
          type="submit"
          className="self-start rounded-[2px] bg-bark px-7 py-[14px] text-[13px] font-bold uppercase tracking-[0.14em] text-parchment"
        >
          Withdraw from contract
        </button>
      )}

      {status === "error" ? (
        <p className="text-rose" style={{ fontSize: 15, lineHeight: 1.6 }}>
          {error} Your withdrawal was not sent. Please try again, or email support@truermeasure.com
          with your name, the email you paid with, and that you are withdrawing.
        </p>
      ) : null}
    </form>
  );
}
