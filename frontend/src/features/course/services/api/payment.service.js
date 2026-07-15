import api from "../../../../api/axios";
import { API_BASE_URL, API_PAYMENTS } from "../../../../api/apiPath";

const normalizeUrl = (url) => {
  if (!url) return "";
  return url.startsWith(API_BASE_URL)
    ? new URL(url, window.location.origin).href
    : url;
};

export const createPayment = async ({ courseId, provider, planId, couponCode }) => {
  const response = await api.post(`${API_PAYMENTS}/create`, {
    courseId,
    provider,
    planId,
    couponCode,
  });

  const data = response.data;
  const paymentUrl = normalizeUrl(data.paymentUrl || data.checkoutUrl);
  const paymentLink = normalizeUrl(data.paymentLink || data.checkoutUrl || data.paymentUrl);

  return {
    ...data,
    paymentUrl,
    paymentLink,
    qrCode: data.qrCode || data.qrCodeUrl,
  };
};
