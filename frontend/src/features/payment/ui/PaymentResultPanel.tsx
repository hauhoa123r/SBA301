import {
  CheckCircle2,
  CircleX,
  Clock3,
  LoaderCircle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import type { PaymentResultState } from "@/entities/payment";
import { AnimatedCard, UserReveal } from "@/shared/ui";

import { getInvoiceId, usePaymentResult } from "../model/usePaymentResult";

interface ResultView {
  icon: LucideIcon;
  iconClass: string;
  spinning: boolean;
}

function getResultView(state: PaymentResultState): ResultView {
  if (state === "SUCCESS") {
    return {
      icon: CheckCircle2,
      iconClass: "bg-status-success/15 text-status-success",
      spinning: false,
    };
  }
  if (state === "FAILED" || state === "ERROR") {
    return {
      icon: CircleX,
      iconClass: "bg-social-google/15 text-social-google",
      spinning: false,
    };
  }
  if (state === "PENDING_TIMEOUT") {
    return {
      icon: Clock3,
      iconClass: "bg-brand-warning/15 text-brand-warning",
      spinning: false,
    };
  }
  return {
    icon: LoaderCircle,
    iconClass: "bg-brand-accent/15 text-brand-accentSoft",
    spinning: true,
  };
}

export function PaymentResultPanel() {
  const [searchParams] = useSearchParams();
  const invoiceCode = searchParams.get("invoiceCode");
  const invoiceId = getInvoiceId(searchParams.get("invoiceId"), invoiceCode);
  const { result, retry } = usePaymentResult(invoiceId);
  const view = getResultView(result.state);
  const Icon = view.icon;
  const learningUrl = result.courseId
    ? `/learning/courses/${result.courseId}`
    : "/learning";

  return (
    <section
      aria-labelledby="payment-result-title"
      aria-live="polite"
      className="user-ui-scope mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-12 text-center text-brand-textPrimary sm:px-6 sm:py-16"
    >
      <UserReveal className="w-full" distance={20}>
        <AnimatedCard className="w-full rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-accent/10 sm:p-8">
          <div
            className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${view.iconClass}`}
          >
            <Icon
              aria-hidden="true"
              className={`h-10 w-10 ${view.spinning ? "animate-spin" : ""}`}
            />
          </div>
          <h1
            id="payment-result-title"
            className="mt-6 break-words text-3xl font-black text-brand-white sm:text-4xl"
          >
            {result.message}
          </h1>
          {invoiceCode && (
            <p className="mt-3 text-base font-semibold text-brand-textSecondary">
              Mã hóa đơn:{" "}
              <span className="break-all font-black text-brand-accentPale">
                {invoiceCode}
              </span>
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {(result.state === "ERROR" || result.state === "PENDING_TIMEOUT") &&
            invoiceId ? (
              <button
                type="button"
                onClick={retry}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-accent/30 bg-brand-light px-6 py-3 font-black text-brand-accentPale transition hover:bg-brand-accent/15 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft"
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                Kiểm tra lại
              </button>
            ) : null}
            <Link
              to={result.state === "SUCCESS" ? learningUrl : "/subscriptions"}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-accent px-6 py-3 font-black text-brand-white transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft"
            >
              {result.state === "SUCCESS" ? "Vào học" : "Xem gói học"}
            </Link>
          </div>
        </AnimatedCard>
      </UserReveal>
    </section>
  );
}

