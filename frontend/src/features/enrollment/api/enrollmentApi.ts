import { API_COUPON, API_LEARNING, axiosClient } from "@/shared/api";

import type { EnrollmentStats, VerifiedCoupon } from "../model/types";

export async function verifyCoupon(couponCode: string): Promise<VerifiedCoupon> {
  const response = await axiosClient.get<VerifiedCoupon>(
    `${API_COUPON}/${encodeURIComponent(couponCode.trim())}`,
  );
  return response.data;
}

export async function getEnrollmentStats(): Promise<EnrollmentStats> {
  const response = await axiosClient.get<EnrollmentStats>(`${API_LEARNING}/stats`);
  return response.data;
}

