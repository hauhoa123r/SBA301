export type CouponValidationStatus =
  | "VALID"
  | "NOT_FOUND"
  | "EXPIRED"
  | "OUT_OF_USES"
  | "NOT_STARTED"
  | "DISABLED";

export type CouponDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface VerifiedCoupon {
  status: CouponValidationStatus;
  code?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
}

export interface EnrolledCourseReference {
  id?: number | string;
}

export interface EnrollmentStats {
  enrolledCourses?: EnrolledCourseReference[];
}

export type VoucherStatus =
  | CouponValidationStatus
  | "EMPTY"
  | "INVALID"
  | null;

