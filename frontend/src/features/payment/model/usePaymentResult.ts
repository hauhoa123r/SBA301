import { useEffect, useState } from "react";

import type { PaymentResult } from "@/entities/payment";
import { getApiErrorMessage } from "@/shared/api";

import { syncPaymentStatus } from "../api/paymentApi";

export const PAYMENT_POLL_INTERVAL_MS = 3_000;
export const MAX_PAYMENT_POLL_ATTEMPTS = 20;

export function getInvoiceId(
  invoiceId: string | null,
  invoiceCode: string | null,
): number | null {
  if (/^\d+$/.test(invoiceId || "")) return Number(invoiceId);
  const match = /^INV-(\d+)$/.exec(invoiceCode || "");
  return match?.[1] ? Number(match[1]) : null;
}

export interface PaymentResultModel {
  result: PaymentResult;
  retry: () => void;
}

export function usePaymentResult(invoiceId: number | null): PaymentResultModel {
  const [retryKey, setRetryKey] = useState(0);
  const [result, setResult] = useState<PaymentResult>({
    state: invoiceId ? "VERIFYING" : "ERROR",
    message: invoiceId
      ? "Đang xác nhận thanh toán với PayOS..."
      : "Không tìm thấy mã hóa đơn",
    courseId: null,
  });

  useEffect(() => {
    if (!invoiceId) return undefined;

    let active = true;
    let timerId: number | undefined;
    let attempts = 0;

    const sync = async (): Promise<void> => {
      attempts += 1;
      try {
        const data = await syncPaymentStatus(invoiceId);
        if (!active) return;

        if (data.paid) {
          setResult({
            state: "SUCCESS",
            message: data.message || "Thanh toán thành công",
            courseId: data.courseId ?? null,
          });
          return;
        }
        if (data.terminal) {
          setResult({
            state: "FAILED",
            message: data.message || "Thanh toán không thành công",
            courseId: data.courseId ?? null,
          });
          return;
        }
        if (attempts >= MAX_PAYMENT_POLL_ATTEMPTS) {
          setResult({
            state: "PENDING_TIMEOUT",
            message:
              "PayOS chưa xác nhận giao dịch. Bạn có thể kiểm tra lại sau.",
            courseId: data.courseId ?? null,
          });
          return;
        }

        setResult({
          state: "PENDING",
          message: data.message || "Đang chờ PayOS xác nhận thanh toán...",
          courseId: data.courseId ?? null,
        });
        timerId = window.setTimeout(() => {
          void sync();
        }, PAYMENT_POLL_INTERVAL_MS);
      } catch (error: unknown) {
        if (!active) return;
        setResult({
          state: "ERROR",
          message: getApiErrorMessage(
            error,
            "Không thể xác nhận thanh toán. Vui lòng kiểm tra lại.",
          ),
          courseId: null,
        });
      }
    };

    void sync();

    return () => {
      active = false;
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [invoiceId, retryKey]);

  const retry = (): void => {
    setResult((current) => ({
      ...current,
      state: "VERIFYING",
      message: "Đang xác nhận thanh toán với PayOS...",
    }));
    setRetryKey((value) => value + 1);
  };

  return { result, retry };
}
