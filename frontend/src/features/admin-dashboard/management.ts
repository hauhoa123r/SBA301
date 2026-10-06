import { useEffect, useState } from "react";
import { axiosClient, getApiErrorMessage } from "@/shared/api";

export interface Plan { code: string; name: string; price: number; durationDays: number; active: boolean }
export interface Subscription { state: string; planCode: string | null; planName: string | null; startedAt: string | null; expiresAt: string | null }
export interface Student {
  id: number; fullName: string; email: string; status: string; createdAt: string | null;
  subscription: Subscription; enrolledCourses: number; completedCourses: number;
}
export interface StudentPage { content: Student[]; totalElements: number; totalPages: number; page: number }
export interface StudentDetail {
  student: Student;
  courses: { id: number; title: string; status: string; enrolledAt: string | null; completedAt: string | null; legacyAccess: boolean }[];
  history: { id: number; actor: string; action: string; beforeData: string; afterData: string; createdAt: string }[];
}
export const accountLabels: Record<string, string> = {
  ACTIVE: "Hoạt động", DISABLE: "Admin đã khóa", PENDING: "Chờ xác minh", INACTIVE: "Chưa kích hoạt",
  LOCKED: "Tạm khóa", DELETED: "Đã xóa", SUSPENDED: "Tạm đình chỉ", BANNED: "Bị cấm",
};
export const subscriptionLabels: Record<string, string> = { NONE: "Chưa có gói", ACTIVE: "Còn hiệu lực", EXPIRED: "Hết hạn / thu hồi", SCHEDULED: "Chưa bắt đầu" };
export function dateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
}
export function useAdminResource<T>(url: string) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: T; error?: string }>({ key: "" });
  const key = `${url}#${revision}`;
  useEffect(() => {
    let active = true;
    axiosClient.get<T>(url).then(({ data }) => { if (active) setResult({ key, data }); })
      .catch((error: unknown) => { if (active) setResult({ key, error: getApiErrorMessage(error) }); });
    return () => { active = false; };
  }, [url, key]);
  return { loading: result.key !== key, data: result.key === key ? result.data : undefined,
    error: result.key === key ? result.error : undefined, refresh: () => setRevision(value => value + 1) };
}
