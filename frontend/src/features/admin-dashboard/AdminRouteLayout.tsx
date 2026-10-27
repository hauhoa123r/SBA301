import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { AdminLoading } from "./AdminSkeleton";
import { AdminWorkspaceContext } from "./AdminWorkspaceContext";
import "@/pages/admin-dashboard/adminDashboard.css";

const titles: Record<string, string> = {
  dashboard: "Tổng quan Edujar", students: "Quản lý học viên",
  enrollments: "Ghi danh & chuyển đổi học tập", payments: "Thống kê thanh toán",
  feedback: "Feedback người dùng", "feedback/statistics": "Thống kê Feedback",
  "catalog-dashboard": "Thống kê gói & danh mục",
  "subscription-plans": "Quản lý gói học", "auth-settings": "Cài đặt đăng ký",
};

// Keep navigation/profile mounted while only the lazy page outlet changes.
export function AdminRouteLayout() {
  const path = useLocation().pathname.replace(/^\/admin\//, "");
  const title = path.startsWith("students/") ? "Chi tiết học viên" : titles[path] ?? "Quản trị Edujar";
  return <AdminLayout title={title}><AdminWorkspaceContext value={true}>
    <Suspense fallback={<AdminLoading kind="page" label="Đang tải trang quản trị…" />}><Outlet /></Suspense>
  </AdminWorkspaceContext></AdminLayout>;
}
