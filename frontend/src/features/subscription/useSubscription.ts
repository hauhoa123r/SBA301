import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { getApiErrorMessage } from "@/shared/api";
import { getSubscriptionStatus, type SubscriptionStatus } from "./api";

export function useSubscription() {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState<{ userId: typeof userId; status: SubscriptionStatus | null; error: string }>({ userId: undefined, status: null, error: "" });
  useEffect(() => {
    if (!userId) return;
    let active = true;
    void getSubscriptionStatus().then(status => {
      if (active) setState({ userId, status, error: "" });
    }).catch((error: unknown) => {
      if (active) setState({ userId, status: null, error: getApiErrorMessage(error, "Không thể tải gói đăng ký.") });
    });
    return () => { active = false; };
  }, [userId]);
  const current = userId && state.userId === userId;
  return { status: current ? state.status : null, error: current ? state.error : "", loading: Boolean(userId && !current) };
}
