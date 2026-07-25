import { isAxiosError } from "axios";
import { useMemo, useState } from "react";

import { verifyCoupon } from "../api/enrollmentApi";
import type {
  CouponValidationStatus,
  VerifiedCoupon,
  VoucherStatus,
} from "./types";

const VALIDATION_STATUSES: ReadonlySet<CouponValidationStatus> = new Set([
  "VALID",
  "NOT_FOUND",
  "EXPIRED",
  "OUT_OF_USES",
  "NOT_STARTED",
  "DISABLED",
]);

interface CouponErrorBody {
  status?: unknown;
}

function toSafeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeStatus(status: unknown): Exclude<VoucherStatus, null> {
  const normalizedStatus =
    typeof status === "string" ? status.trim().toUpperCase() : "";
  if (normalizedStatus === "EMPTY") return "EMPTY";
  if (VALIDATION_STATUSES.has(normalizedStatus as CouponValidationStatus)) {
    return normalizedStatus as CouponValidationStatus;
  }
  return "INVALID";
}

function getCouponErrorStatus(error: unknown): unknown {
  return isAxiosError<CouponErrorBody>(error) ? error.response?.data?.status : undefined;
}

export interface CourseVoucherModel {
  voucher: string;
  voucherStatus: VoucherStatus;
  verifiedCoupon: VerifiedCoupon | null;
  isVerifying: boolean;
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  changeVoucher: (value: string) => void;
  verifyVoucher: () => Promise<void>;
}

export function useCourseVoucher(coursePrice: number | undefined): CourseVoucherModel {
  const [voucher, setVoucher] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<VoucherStatus>(null);
  const [verifiedCoupon, setVerifiedCoupon] = useState<VerifiedCoupon | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const safeCoursePrice = useMemo(
    () => Math.max(0, toSafeNumber(coursePrice)),
    [coursePrice],
  );
  const isValid = voucherStatus === "VALID" && Boolean(verifiedCoupon);

  const discountAmount = useMemo(() => {
    if (!isValid) return 0;

    const discountValue = Math.max(0, toSafeNumber(verifiedCoupon?.discountValue));
    const calculatedDiscount =
      verifiedCoupon?.discountType === "PERCENTAGE"
        ? safeCoursePrice * (discountValue / 100)
        : discountValue;

    return Math.min(safeCoursePrice, Math.max(0, calculatedDiscount));
  }, [isValid, safeCoursePrice, verifiedCoupon]);

  const finalPrice = useMemo(
    () => Math.max(0, safeCoursePrice - discountAmount),
    [safeCoursePrice, discountAmount],
  );

  const changeVoucher = (value: string): void => {
    setVoucher(value);
    setVoucherStatus(null);
    setVerifiedCoupon(null);
  };

  const verifyVoucher = async (): Promise<void> => {
    const normalizedVoucher = voucher.trim().toUpperCase();

    if (!normalizedVoucher) {
      setVoucherStatus("EMPTY");
      setVerifiedCoupon(null);
      return;
    }

    setIsVerifying(true);

    try {
      const data = await verifyCoupon(normalizedVoucher);
      const nextStatus = normalizeStatus(data.status);

      setVoucherStatus(nextStatus);
      setVerifiedCoupon(
        nextStatus === "VALID"
          ? { ...data, code: data.code || normalizedVoucher }
          : null,
      );
    } catch (error: unknown) {
      setVoucherStatus(normalizeStatus(getCouponErrorStatus(error)));
      setVerifiedCoupon(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    voucher,
    voucherStatus,
    verifiedCoupon,
    isVerifying,
    isValid,
    discountAmount,
    finalPrice,
    changeVoucher,
    verifyVoucher,
  };
}
