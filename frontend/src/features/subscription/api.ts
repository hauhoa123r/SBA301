import { axiosClient } from "@/shared/api";

export interface SubscriptionPlan {
  code: "FREE_TRIAL" | "STANDARD" | "PREMIUM";
  name: string;
  price: number;
  durationDays: number;
}

export interface SubscriptionStatus {
  active: boolean;
  planCode: string | null;
  expiresAt: string | null;
  trialAvailable: boolean;
  legacyCourseIds: number[];
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return (await axiosClient.get<SubscriptionPlan[]>("/api/subscriptions/plans")).data;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return (await axiosClient.get<SubscriptionStatus>("/api/subscriptions/me")).data;
}

export async function startFreeTrial(): Promise<SubscriptionStatus> {
  return (await axiosClient.post<SubscriptionStatus>("/api/subscriptions/trial")).data;
}
