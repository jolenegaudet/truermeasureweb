import type { Metadata } from "next";
import { WithdrawalForm } from "@/components/withdrawal-form";

export const metadata: Metadata = {
  title: "Withdraw from contract",
};

/**
 * EU right of withdrawal (Terms of Service section 15). Linked from the footer
 * as "Withdraw from contract here", the label the directive suggests.
 */
export default function WithdrawPage() {
  return (
    <section className="mx-auto max-w-[680px] px-6 py-16 md:px-10 md:py-24">
      <div className="mb-[22px] text-[12.5px] font-semibold uppercase tracking-[0.26em] text-rose">
        For members in the European Union
      </div>
      <h1
        className="font-heading mb-6 font-medium text-bark"
        style={{ fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.08 }}
      >
        Withdraw from contract
      </h1>
      <div className="mb-10 flex flex-col gap-4 text-smoke" style={{ fontSize: 17, lineHeight: 1.75 }}>
        <p>
          If you live in the European Union, you may withdraw from your membership within 14 days of
          joining, without giving a reason. If you had access during that time, you pay only for the
          days you had it, and we refund the rest within 14 days.
        </p>
        <p>
          To cancel a membership at any other time, use{" "}
          <a href="https://billing.stripe.com/p/login/eVq00igzb9Zj6Qz5k4e7m00" className="text-rose underline underline-offset-2">
            Manage or cancel your membership
          </a>
          .
        </p>
      </div>
      <WithdrawalForm />
    </section>
  );
}
