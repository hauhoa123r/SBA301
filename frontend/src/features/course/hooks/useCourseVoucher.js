import { useMemo, useState } from "react";
import { verifyCoupon } from "../services/api/coupon.service";

const VOUCHER_STATUS = {
    EMPTY: "EMPTY",
    VALID: "VALID",
    INVALID: "INVALID",
};

const toSafeNumber = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeStatus = (status) => {
    const normalizedStatus = String(status || "").trim().toUpperCase();
    return normalizedStatus || VOUCHER_STATUS.INVALID;
};

export default function useCourseVoucher(coursePrice) {
    const [voucher, setVoucher] = useState("");
    const [voucherStatus, setVoucherStatus] = useState(null);
    const [verifiedCoupon, setVerifiedCoupon] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const safeCoursePrice = useMemo(() => Math.max(0, toSafeNumber(coursePrice)), [coursePrice]);
    const isValid = voucherStatus === VOUCHER_STATUS.VALID && Boolean(verifiedCoupon);

    const discountAmount = useMemo(() => {
        if (!isValid) return 0;

        const discountValue = Math.max(0, toSafeNumber(verifiedCoupon?.discountValue));
        const calculatedDiscount = verifiedCoupon?.discountType === "PERCENTAGE"
            ? safeCoursePrice * (discountValue / 100)
            : discountValue;

        return Math.min(safeCoursePrice, Math.max(0, calculatedDiscount));
    }, [isValid, safeCoursePrice, verifiedCoupon]);

    const finalPrice = useMemo(
        () => Math.max(0, safeCoursePrice - discountAmount),
        [safeCoursePrice, discountAmount],
    );

    const changeVoucher = (value) => {
        setVoucher(value);
        setVoucherStatus(null);
        setVerifiedCoupon(null);
    };

    const verifyVoucher = async () => {
        const normalizedVoucher = voucher.trim().toUpperCase();

        if (!normalizedVoucher) {
            setVoucherStatus(VOUCHER_STATUS.EMPTY);
            setVerifiedCoupon(null);
            return;
        }

        setIsVerifying(true);

        try {
            const data = await verifyCoupon(normalizedVoucher);
            const nextStatus = normalizeStatus(data?.status);

            setVoucherStatus(nextStatus);
            setVerifiedCoupon(nextStatus === VOUCHER_STATUS.VALID ? { ...data, code: data?.code || normalizedVoucher } : null);
        } catch (error) {
            setVoucherStatus(normalizeStatus(error?.response?.data?.status));
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
