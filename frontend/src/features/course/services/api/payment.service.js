import api from "../../../../api/axios";
import { API_PAYMENTS, PORT } from "../../../../api/apiPath";

const getStoredUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id;
  } catch {
    return null;
  }
};

const normalizeUrl = (url) => {
  if (!url) return "";
  return url.startsWith("/api") ? `${PORT}${url}` : url;
};

export const createPayment = async ({ courseId, provider, planId, couponCode }) => {
  const userId = getStoredUserId();
  const response = await api.post(
    `${API_PAYMENTS}/create`,
    { courseId, provider, planId, couponCode },
    {
      headers: userId ? { "X-User-Id": userId } : undefined,
    },
  );

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
