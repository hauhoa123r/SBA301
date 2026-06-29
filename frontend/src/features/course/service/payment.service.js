import api from "../../../api/axios";
import { API_PAYMENTS, PORT } from "../../../api/apiPath";

const getStoredUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id;
  } catch {
    return null;
  }
};

export const createPayment = async ({ courseId, provider, planId }) => {
  const userId = getStoredUserId();
  const response = await api.post(
    `${API_PAYMENTS}/create`,
    { courseId, provider, planId },
    {
      headers: userId ? { "X-User-Id": userId } : undefined,
    },
  );

  const data = response.data;
  return {
    ...data,
    paymentUrl: data.paymentUrl?.startsWith("/api") ? `${PORT}${data.paymentUrl}` : data.paymentUrl,
  };
};
