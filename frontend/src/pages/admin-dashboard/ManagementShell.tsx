import { useContext, type ReactNode } from "react";
import { AdminLayout } from "@/features/admin-dashboard/AdminLayout";
import { AdminWorkspaceContext } from "@/features/admin-dashboard/AdminWorkspaceContext";
import { AdminLoading } from "@/features/admin-dashboard/AdminSkeleton";
import "./adminDashboard.css";

export function ManagementShell({ title, children }: { title: string; children: ReactNode }) {
  const inWorkspace = useContext(AdminWorkspaceContext);
  if (inWorkspace) return <div className="admin-page-view" aria-label={title}>{children}</div>;
  return <AdminLayout title={title}>{children}</AdminLayout>;
}
export function ResourceStatus({ loading, error, retry, data, kind = "table" }: { loading: boolean; error?: string; retry: () => void; data?: unknown; kind?: "table" | "chart" | "page" | "compact" }) {
  return <>{loading && (data !== undefined ? <p className="admin-refresh-status" role="status">Đang cập nhật dữ liệu…</p> : <AdminLoading kind={kind} />)}
    {error && <div className="admin-error" role="alert"><p>{error}</p><button className="admin-button" onClick={retry}>Thử lại</button></div>}</>;
}
