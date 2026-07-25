import { API_PAYMENTS, axiosClient } from "@/shared/api";
import type {
  CreatePaymentResponse,
  Payment,
  PaymentSyncResult,
} from "@/entities/payment";

import { mapCreatePaymentResponse } from "../lib/paymentMapper";

export interface CreatePaymentRequest {
  courseId: number;
  couponCode?: string;
}

export async function createPayment(
  request: CreatePaymentRequest,
): Promise<Payment> {
  const response = await axiosClient.post<CreatePaymentResponse>(
    `${API_PAYMENTS}/create`,
    request,
  );
  return mapCreatePaymentResponse(response.data);
}

export async function syncPaymentStatus(
  invoiceId: number,
): Promise<PaymentSyncResult> {
  const response = await axiosClient.post<PaymentSyncResult>(
    `${API_PAYMENTS}/invoices/${invoiceId}/sync`,
  );
  return response.data;
}
