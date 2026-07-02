"use client";

import { useEffect, useState } from "react";

type Variant = "dark" | "outline-rose-dark" | "outline-rose";

type Props = {
  tag: "waitlist-hidden-report-card" | "waitlist-elite-learning-leaders" | "applied-inner-circle";
  label: string;
  modalTitle: string;
  modalEyebrow: string;
  submitLabel: string;
  variant: Variant;
};

const buttonClass: Record<Variant, string> = {
  dark:
    "inline-block rounded-[2px] bg-parchment px-9 py-[17px] text-[13px] font-bold uppercase tracking-[0.14em] text-bark no-underline cursor-pointer",
  "outline-rose-dark":
    "mt-9 inline-block rounded-[2px] border border-rose-dark px-[26px] py-[14px] text-[13px] font-semibold uppercase tracking-[0.14em] text-bark no-underline cursor-pointer bg-transparent",
  "outline-rose":
    "mt-9 inline-block rounded-[2px] border border-rose px-[26px] py-[14px] text-[13px] font-semibold uppercase tracking-[0.14em] text-bark no-underline cursor-pointer bg-transparent",
};

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistButton(props: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    kids: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    if (status === "success") {
      setTimeout(() => {
        setStatus("idle");
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          kids: "",
          city: "",
          state: "",
          postalCode: "",
        });
      }, 200);
    }
  };

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/.netlify/functions/contact-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: props.tag, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data?.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const labelCls = "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.16em] text-smoke";
  const inputCls =
    "w-full rounded-[2px] border border-warm bg-parchment px-4 py-3 text-[15px] text-bark placeholder:text-faint focus:border-rose-dark focus:outline-none";

  return (
    <>
      <button type="button" className={buttonClass[props.variant]} onClick={() => setOpen(true)}>
        {props.label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bark/70 px-4 py-10 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative w-full max-w-[520px] rounded-[3px] bg-parchment p-7 shadow-2xl md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute right-4 top-4 text-[24px] leading-none text-smoke hover:text-bark"
            >
              ×
            </button>

            {status === "success" ? (
              <div className="py-6 text-center">
                <div className="mb-[14px] text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
                  You&rsquo;re on the list
                </div>
                <h3
                  className="font-heading mb-4 font-medium text-bark"
                  style={{ fontSize: 30, lineHeight: 1.15 }}
                >
                  Thanks — we&rsquo;ll be in touch.
                </h3>
                <p className="mb-7 text-smoke" style={{ fontSize: 15, lineHeight: 1.6 }}>
                  We&rsquo;ve added you to the list. Watch for an email from Jolene with next steps.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="inline-block rounded-[2px] bg-bark px-7 py-[14px] text-[12.5px] font-bold uppercase tracking-[0.14em] text-parchment"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mb-[10px] text-[11.5px] font-semibold uppercase tracking-[0.26em] text-rose">
                  {props.modalEyebrow}
                </div>
                <h3
                  className="font-heading mb-6 font-medium text-bark"
                  style={{ fontSize: 28, lineHeight: 1.12 }}
                >
                  {props.modalTitle}
                </h3>

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelCls} htmlFor="wf-first">First name</label>
                      <input id="wf-first" required className={inputCls} value={form.firstName} onChange={onChange("firstName")} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="wf-last">Last name</label>
                      <input id="wf-last" required className={inputCls} value={form.lastName} onChange={onChange("lastName")} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls} htmlFor="wf-email">Email</label>
                    <input id="wf-email" type="email" required className={inputCls} value={form.email} onChange={onChange("email")} />
                  </div>

                  <div>
                    <label className={labelCls} htmlFor="wf-phone">Phone</label>
                    <input id="wf-phone" type="tel" className={inputCls} value={form.phone} onChange={onChange("phone")} />
                  </div>

                  <div>
                    <label className={labelCls} htmlFor="wf-kids">Number of kids and ages</label>
                    <textarea
                      id="wf-kids"
                      rows={2}
                      className={inputCls + " resize-none"}
                      placeholder="e.g. Two kids, ages 7 and 10"
                      value={form.kids}
                      onChange={onChange("kids")}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                      <label className={labelCls} htmlFor="wf-city">City</label>
                      <input id="wf-city" className={inputCls} value={form.city} onChange={onChange("city")} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="wf-state">State / Province</label>
                      <input id="wf-state" className={inputCls} value={form.state} onChange={onChange("state")} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="wf-postal">Zip / Postal</label>
                      <input id="wf-postal" className={inputCls} value={form.postalCode} onChange={onChange("postalCode")} />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="rounded-[2px] border border-rose-dark bg-blush px-4 py-3 text-[13.5px] text-bark">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="mt-2 inline-block rounded-[2px] bg-bark px-9 py-[16px] text-[13px] font-bold uppercase tracking-[0.14em] text-parchment disabled:opacity-60"
                  >
                    {status === "submitting" ? "Sending…" : props.submitLabel}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
