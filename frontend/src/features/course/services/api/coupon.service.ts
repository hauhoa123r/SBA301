import api from "../../../../api/axios";
import { API_COUPON } from "../../../../api/apiPath";

export type CouponValidationStatus =
  | "VALID"
  | "NOT_FOUND"
  | "EXPIRED"
  | "OUT_OF_USES"
  | "NOT_STARTED"
  | "DISABLED";

export type CouponDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type VerifiedCouponResponse = {
  status: CouponValidationStatus;
  code?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
};

export const verifyCoupon = async (couponCode: string): Promise<VerifiedCouponResponse> => {
  const response = await api.get<VerifiedCouponResponse>(
    `${API_COUPON}/${encodeURIComponent(couponCode.trim())}`,
  );
  return response.data;
};
