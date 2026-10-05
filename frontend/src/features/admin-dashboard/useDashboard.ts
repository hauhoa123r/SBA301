import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/shared/api";
import { fetchCourses, fetchDashboard, type CoursePage, type DashboardData, type Period } from "./api";

interface Resource<T> { key: string; data?: T; error?: string }

export function useDashboard(period: Period, limit: number, revision: number) {
  const key = `${period}:${limit}:${revision}`;
  const [resource, setResource] = useState<Resource<DashboardData>>({ key: "" });
  useEffect(() => {
    const controller = new AbortController();
    void fetchDashboard(period, limit, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setResource({ key, data }); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResource({ key, error: getApiErrorMessage(error, "Không thể tải Dashboard.") });
      });
    return () => controller.abort();
  }, [key, period, limit]);
  return resource.key === key ? { ...resource, loading: false } : { loading: true };
}

export function useDashboardCourses(search: string, status: string, page: number, revision: number) {
  const key = JSON.stringify([search, status, page, revision]);
  const [resource, setResource] = useState<Resource<CoursePage>>({ key: "" });
  useEffect(() => {
    const controller = new AbortController();
    void fetchCourses(search, status, page, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setResource({ key, data }); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResource({ key, error: getApiErrorMessage(error, "Không thể tải khóa học.") });
      });
    return () => controller.abort();
  }, [key, search, status, page]);
  return resource.key === key ? { ...resource, loading: false } : { loading: true };
}
