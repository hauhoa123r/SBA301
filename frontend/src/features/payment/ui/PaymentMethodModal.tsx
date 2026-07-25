import { ExternalLink, QrCode, X } from "lucide-react";
import { useEffect, useId, useRef, type MouseEvent } from "react";

import type { CourseDetail } from "@/entities/course";
import { PaymentSummary } from "@/entities/payment";
import type { User } from "@/entities/user";

import { useAccessibleDialog } from "../model/useAccessibleDialog";
import { useCreateCoursePayment } from "../model/useCreateCoursePayment";

export interface PaymentMethodModalProps {
  course: CourseDetail;
  user: User | null;
  open: boolean;
  couponCode?: string;
  finalPrice: number;
  discountAmount: number;
  onClose: () => void;
}

export function PaymentMethodModal({
  course,
  user,
  open,
  couponCode,
  finalPrice,
  discountAmount,
  onClose,
}: PaymentMethodModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { createCoursePayment, isSubmitting, error, clearError } =
    useCreateCoursePayment(user);

  useAccessibleDialog({ open, onClose, dialogRef });

  useEffect(() => {
    if (open) clearError();
  }, [clearError, open]);

  if (!open) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleCreatePayment = (): void => {
    void createCoursePayment({
      course,
      couponCode,
      onUnauthorizedRole: onClose,
    });
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="user-modal-overlay fixed inset-0 z-50 grid place-items-center bg-brand-black/70 p-3 backdrop-blur-sm sm:px-4 sm:py-6"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isSubmitting}
        tabIndex={-1}
        className="user-modal-dialog flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-accent/15 bg-brand-cardBg shadow-2xl shadow-brand-black/40 outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-brand-accent/10 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <p id={descriptionId} className="sr-only">
              Xác nhận để tạo mã QR thanh toán khóa học qua payOS.
            </p>
            <p className="text-sm font-bold text-brand-accentSoft">
              Thanh toán khóa học
            </p>
            <h2
              id={titleId}
              className="mt-1 text-xl font-black leading-tight text-brand-white sm:text-2xl"
            >
              Thanh toán qua payOS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-brand-textSecondary transition hover:bg-brand-accent hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft"
            aria-label="Đóng hộp thoại thanh toán"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          <PaymentSummary
            originalPrice={course.price}
            discountAmount={discountAmount}
            finalPrice={finalPrice}
          />

          <div className="flex min-h-24 items-center gap-4 rounded-2xl border border-brand-accent bg-brand-accent/15 p-4 text-brand-white">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-accent text-brand-white">
              <QrCode aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-black">payOS</span>
              <span className="mt-1 block text-sm font-semibold leading-5 text-brand-textSecondary">
                Thanh toán bằng mã QR hoặc liên kết payOS
              </span>
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-2xl border border-social-google/20 bg-social-google/10 px-4 py-3 text-sm font-semibold text-social-google"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-brand-accent/10 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 items-center justify-center rounded-full border border-brand-accent/20 px-5 text-sm font-black text-brand-textSecondary transition hover:bg-brand-light hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCreatePayment}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-accent px-5 text-sm font-black text-brand-white transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            {isSubmitting ? "Đang tạo mã QR..." : "Tạo mã QR payOS"}
          </button>
        </div>
      </div>
    </div>
  );
}

