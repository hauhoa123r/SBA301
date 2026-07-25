import type { CreatePaymentResponse, Payment } from "@/entities/payment";
import { API_BASE_URL } from "@/shared/api";

function normalizeUrl(url: string | undefined): string {
  if (!url) return "";
  return url.startsWith(API_BASE_URL)
    ? new URL(url, window.location.origin).href
    : url;
}

export function mapCreatePaymentResponse(data: CreatePaymentResponse): Payment {
  const paymentUrl = normalizeUrl(data.paymentUrl || data.checkoutUrl);
  const paymentLink = normalizeUrl(
    data.paymentLink || data.checkoutUrl || data.paymentUrl,
  );

  return {
    ...data,
    paymentUrl,
    paymentLink,
    qrCode: data.qrCode || data.qrCodeUrl || "",
  };
}

