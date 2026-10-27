import { BarChart3, CreditCard, GraduationCap, LayoutDashboard, MessageSquare,
  ShieldCheck, Tags, TrendingUp, Users, type LucideIcon } from "lucide-react";

export interface AdminNavItem { to: string; label: string; icon: LucideIcon; end?: boolean }
export const adminNavigation: { label: string; items: AdminNavItem[] }[] = [
  { label: "Dashboard", items: [{ to: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard, end: true }] },
  { label: "Quản lý", items: [
    { to: "/admin/students", label: "Học viên", icon: Users },
    { to: "/admin/enrollments", label: "Ghi danh", icon: GraduationCap }, { to: "/admin/payments", label: "Thanh toán & doanh thu", icon: CreditCard },
    { to: "/admin/feedback", label: "Feedback", icon: MessageSquare, end: true },
  ] },
  { label: "Phân tích", items: [
    { to: "/admin/feedback/statistics", label: "Thống kê feedback", icon: BarChart3 },
    { to: "/admin/catalog-dashboard", label: "Gói & danh mục", icon: TrendingUp },
  ] },
  { label: "Hệ thống", items: [
    { to: "/admin/subscription-plans", label: "Gói học", icon: Tags }, { to: "/admin/auth-settings", label: "Cài đặt đăng ký", icon: ShieldCheck },
  ] },
];
