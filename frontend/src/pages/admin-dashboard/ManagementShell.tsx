import { type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import UserProfileMenu from "@/features/auth/ui/UserProfileMenu";
import "./adminDashboard.css";

export function ManagementShell({ title, children }: { title: string; children: ReactNode }) {
  return <div className="admin-shell">
    <aside className="admin-sidebar"><Link to="/admin/dashboard" className="admin-brand">Chinese Learning</Link>
      <nav aria-label="Điều hướng quản trị"><NavLink to="/admin/dashboard">Dashboard</NavLink><NavLink to="/admin/students">Học viên</NavLink>
        <NavLink to="/admin/subscription-plans">Gói học</NavLink><NavLink to="/admin/assignments">Chấm bài tập</NavLink></nav></aside>
    <main className="admin-main"><header className="admin-header"><div><p className="admin-eyebrow">QUẢN TRỊ HỆ THỐNG</p><h1>{title}</h1></div>
      <div className="admin-header-actions"><Link className="admin-button" to="/admin/dashboard">Dashboard</Link><UserProfileMenu /></div></header>
      {children}
    </main>
  </div>;
}
export function ResourceStatus({ loading, error, retry }: { loading: boolean; error?: string; retry: () => void }) {
  return <>{loading && <p className="admin-loading" role="status">Đang tải dữ liệu…</p>}
    {error && <div className="admin-error" role="alert"><p>{error}</p><button className="admin-button" onClick={retry}>Thử lại</button></div>}</>;
}
