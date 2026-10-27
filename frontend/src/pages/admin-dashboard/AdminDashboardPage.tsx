import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, RefreshCw, Users, Wallet } from "lucide-react";
import { type Period } from "@/features/admin-dashboard/api";
import { useDashboard } from "@/features/admin-dashboard/useDashboard";
import { DistributionChart, PopularChart, TrendChart } from "@/features/admin-dashboard/charts";
import { formatMoney, formatNumber } from "@/features/admin-dashboard/format";
import "./adminDashboard.css";
import { ManagementShell } from "./ManagementShell";

const periods: { value: Period; label: string }[] = [
  { value: "all", label: "Toàn bộ thời gian" }, { value: "7d", label: "7 ngày" }, { value: "30d", label: "30 ngày" },
  { value: "3m", label: "3 tháng" }, { value: "1y", label: "1 năm" },
];

function Panel({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return <section className="admin-panel" id={id}><h2>{title}</h2>{children}</section>;
}
function Loading() { return <div className="admin-loading" role="status"><RefreshCw className="admin-spin" size={20} /> Đang tải dữ liệu…</div>; }
function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div className="admin-error" role="alert"><p>{message}</p><button className="admin-button" onClick={retry}>Thử lại</button></div>;
}

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [limit, setLimit] = useState(5);
  const [revision, setRevision] = useState(0);
  const resource = useDashboard(period, limit, revision);
  const data = "data" in resource ? resource.data : undefined;
  const visiblePlans = data?.subscriptions.filter((plan) => plan.code !== "STANDARD") ?? [];
  const error = "error" in resource ? resource.error : undefined;
  const refresh = () => setRevision((value) => value + 1);
  return <ManagementShell title="Thống kê gói & danh mục">
        <div className="admin-header-actions"><Link className="admin-button" to="/admin/students">Học viên</Link><Link className="admin-button" to="/admin/subscription-plans">Gói học</Link><button className="admin-button" onClick={refresh} disabled={resource.loading}>
          <RefreshCw size={16} /> Làm mới</button></div>
      {resource.loading && <Loading />}
      {error && <ErrorState message={error} retry={refresh} />}
      {data && <>
        <p className="admin-updated">Cập nhật {new Date(data.generatedAt).toLocaleString("vi-VN", { timeZone: data.timezone })} · Giờ Việt Nam · VND</p>
        <div className="admin-cards">
          <Summary title="Tổng người dùng" value={formatNumber(data.overview.totalUsers)} icon={<Users />}>
            +{formatNumber(data.overview.newUsersThisMonth)} tháng này · +{formatNumber(data.overview.newUsersToday)} hôm nay</Summary>
          <Summary title="Tổng doanh thu" value={formatMoney(data.overview.totalRevenue)} icon={<Wallet />}>
            Tháng này: {formatMoney(data.overview.revenueThisMonth)}</Summary>
          <Summary title="Gói còn hiệu lực" value={formatNumber(data.overview.activeSubscriptions)} icon={<Users />}>
            {visiblePlans.map((plan) => <span className="admin-plan-count" key={plan.code}>{plan.name}: {formatNumber(plan.users)}</span>)}</Summary>
          <Summary title="Tổng khóa học" value={formatNumber(data.overview.totalCourses)} icon={<BookOpen />}>
            {formatNumber(data.overview.publishedCourses)} hoạt động · {formatNumber(data.overview.hiddenCourses)} đã ẩn
            <span className="admin-plan-count">{formatNumber(data.overview.draftCourses)} bản nháp · {formatNumber(data.overview.pendingCourses)} chờ duyệt</span></Summary>
        </div>
        <p className="admin-note">Doanh thu gộp từ giao dịch SUCCESS, chưa trừ hoàn tiền. Thống kê tháng dùng thời điểm xác nhận thanh toán; bản ghi lịch sử thiếu thời điểm không được phân bổ vào tháng. <Link to="/admin/payments">Xem báo cáo và đối soát thanh toán</Link>.</p>
        <div className="admin-grid">
          <Panel title="Tăng trưởng người dùng"><p className="admin-caption">Người đăng ký mới trong 12 tháng gần nhất</p><TrendChart rows={data.trends} field="users" label="Người dùng mới theo tháng" /></Panel>
          <Panel title="Doanh thu theo tháng"><p className="admin-caption">Giao dịch SUCCESS có thời điểm xác nhận · 12 tháng gần nhất</p><TrendChart rows={data.trends} field="revenue" label="Doanh thu theo tháng, VND" /></Panel>
          <Panel title="Phân bố gói đăng ký"><DistributionChart items={[
            ...visiblePlans.map((plan) => ({ code: plan.code, name: plan.name, users: plan.users })),
            { code: "__none", name: "Không có gói hiệu lực", users: data.overview.usersWithoutSubscription },
          ]} /></Panel>
          <Panel title="Khóa học phổ biến nhất">
            <div className="admin-filters"><label>Khoảng thời gian<select value={period} onChange={(event) => {
              const next = periods.find((item) => item.value === event.target.value); if (next) setPeriod(next.value);
            }}>{periods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>Hiển thị<select value={limit} onChange={(event) => setLimit(Number(event.target.value))}><option value="5">Top 5</option><option value="10">Top 10</option></select></label></div>
            <p className="admin-caption">Xếp hạng theo lượt đăng ký trong khoảng đã chọn</p><PopularChart courses={data.popularCourses} /></Panel>
        </div>
        <Panel title="Thống kê gói đăng ký" id="subscriptions">
          <p className="admin-caption">Người dùng có gói còn hiệu lực; doanh thu toàn bộ thời gian từ hóa đơn của từng gói.</p>
          <div className="admin-table-scroll"><table><thead><tr><th>Gói</th><th>Giá hiện tại / thời hạn</th><th>Người dùng</th><th>Doanh thu thực tế</th><th>Trạng thái</th></tr></thead>
            <tbody>{visiblePlans.map((plan) => <tr key={plan.code}><td><strong>{plan.name}</strong></td><td>{formatMoney(plan.price)} / {plan.durationDays} ngày</td>
              <td>{formatNumber(plan.users)}</td><td>{formatMoney(plan.revenue)}</td><td>{plan.active ? "Đang cung cấp" : "Ngừng cung cấp"}</td></tr>)}</tbody></table></div>
          {!visiblePlans.length && <p className="admin-empty">Chưa có gói đăng ký hiển thị.</p>}
        </Panel>
      </>}
  </ManagementShell>;
}

function Summary({ title, value, icon, children }: { title: string; value: string; icon: ReactNode; children: ReactNode }) {
  return <section className="admin-card"><div className="admin-card-title"><h2>{title}</h2>{icon}</div><strong className="admin-card-value">{value}</strong><div className="admin-card-detail">{children}</div></section>;
}
