import { axiosClient } from "@/shared/api";
import { API_ADMIN_DASHBOARD } from "@/shared/api/apiPaths";

export type Period = "all" | "7d" | "30d" | "3m" | "1y";
export type CourseStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "HIDDEN";
export interface PlanStats {
  code: string; name: string; price: number; durationDays: number;
  active: boolean; users: number; revenue: number;
}
export interface MonthStats { month: string; users: number; revenue: number }
export interface PopularCourse { id: number; title: string; students: number }
export interface CourseStats {
  id: number; title: string; price: number; status: CourseStatus;
  students: number; learning: number; completed: number; completionRate: number; revenue: number;
}
export interface CoursePage {
  content: CourseStats[]; totalElements: number; page: number; size: number; totalPages: number;
}
export interface DashboardData {
  generatedAt: string; currency: string; timezone: string;
  overview: {
    totalUsers: number; newUsersToday: number; newUsersThisMonth: number;
    totalRevenue: number; revenueThisMonth: number; activeSubscriptions: number;
    usersWithoutSubscription: number; totalCourses: number; publishedCourses: number;
    hiddenCourses: number; draftCourses: number; pendingCourses: number;
  };
  subscriptions: PlanStats[]; trends: MonthStats[]; popularCourses: PopularCourse[];
}

export async function fetchDashboard(period: Period, limit: number, signal: AbortSignal): Promise<DashboardData> {
  const { data } = await axiosClient.get<DashboardData>(API_ADMIN_DASHBOARD, {
    params: { period, limit }, signal, timeout: 30000,
  });
  return data;
}

export async function fetchCourses(search: string, status: string, page: number, signal: AbortSignal): Promise<CoursePage> {
  const { data } = await axiosClient.get<CoursePage>(`${API_ADMIN_DASHBOARD}/courses`, {
    params: { search, status, page, size: 10 }, signal, timeout: 30000,
  });
  return data;
}
