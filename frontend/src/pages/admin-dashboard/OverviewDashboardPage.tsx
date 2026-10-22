import { useState } from "react";
import { Link } from "react-router-dom";
import { DateControls, Metric, ValueChart } from "@/features/admin-dashboard/analytics";
import { defaultDates, paymentLabels, type LearningReport, type PaymentReport, type RegistrationReport } from "@/features/admin-dashboard/analyticsModel";
import { useAdminResource } from "@/features/admin-dashboard/management";
import { formatMoney } from "@/features/admin-dashboard/format";
import { ManagementShell, ResourceStatus } from "./ManagementShell";

export function OverviewDashboardPage() {
  const [dates, setDates] = useState(defaultDates);
  const query = new URLSearchParams({ from: dates.from, to: dates.to, mode: dates.mode, includeLab: String(dates.includeLab) });
  const learningQuery = new URLSearchParams({ from: dates.from, to: dates.to, includeLab: String(dates.includeLab) });
  const registrations = useAdminResource<RegistrationReport>(`/api/admin/registration-analytics?${query}`);
  const learning = useAdminResource<LearningReport>(`/api/admin/learning-analytics?${learningQuery}`);
  const payments = useAdminResource<PaymentReport>(`/api/admin/payments?from=${dates.from}&to=${dates.to}&mode=${dates.mode}&size=1`);
  const r = registrations.data; const l = learning.data; const p = payments.data;
  return <ManagementShell title="Tổng quan Edujar">
    <DateControls value={dates} onChange={setDates} lab hourly maxDays={93} />
    <p className="admin-note">Đăng ký và giao dịch theo khoảng chọn. KPI học tập là toàn bộ lịch sử của nhóm học viên đã chọn; tổng doanh thu là toàn bộ giao dịch SUCCESS. Tổng người dùng gồm các vai trò, loại tài khoản đã xóa.</p>
    <ResourceStatus {...registrations} retry={registrations.refresh} /><ResourceStatus {...learning} retry={learning.refresh} /><ResourceStatus {...payments} retry={payments.refresh} />
    <div className="admin-cards">
      {r && <><Metric title="Tổng người dùng" value={r.totalUsers} /><Metric title="Đăng ký mới trong khoảng" value={r.total} /></>}
      {l && <><Metric title="Học viên đã ghi danh" value={l.summary.uniqueEnrolledStudents} /><Metric title="Học viên đã bắt đầu học" value={l.summary.studentsStarted} /></>}
      {p && <><Metric title="Thanh toán thành công trong khoảng" value={p.successfulPayments} /><section className="admin-card"><h2>Tổng doanh thu</h2><strong className="admin-card-value">{formatMoney(p.totalRevenue)}</strong><p className="admin-card-detail">Doanh thu gộp từ SUCCESS</p></section></>}
    </div>
    <div className="admin-grid">
      {r && <ValueChart title="Xu hướng đăng ký" rows={r.buckets.map(v => ({ label: v.label, value: v.count }))} />}
      {l && <><ValueChart title="Ghi danh theo khóa · toàn bộ lịch sử" rows={l.courses.map(c => ({ label: c.title, value: c.enrolled }))} />
        <ValueChart title="Hoạt động học tập · học viên duy nhất" rows={[{ label: "Đã ghi danh", value: l.summary.uniqueEnrolledStudents }, { label: "Đã bắt đầu", value: l.summary.studentsStarted }, { label: "Hoàn thành ≥1 bài", value: l.summary.studentsCompletedLesson }]} /></>}
      {p && <><ValueChart title="Xu hướng doanh thu" rows={p.trend.map(v => ({ label: v.label, value: v.amount }))} money />
        <ValueChart title="Phân bố trạng thái thanh toán" rows={Object.entries(paymentLabels).map(([s, label]) => ({ label, value: p.statuses.find(v => v.status === s)?.count ?? 0 }))} /></>}
    </div>
    {p && p.unknownPaymentTimes > 0 && <p className="admin-note">{p.unknownPaymentTimes} thanh toán cũ thiếu thời điểm xác nhận, được tính vào tổng doanh thu nhưng không nằm trong biểu đồ theo ngày.</p>}
    <section className="admin-panel"><h2>Truy cập nhanh</h2><div className="admin-filters">{[
      ["/admin/students", "Quản lý học viên"], ["/admin/courses", "Quản lý khóa học"], ["/admin/registration-analytics", "Thống kê đăng ký"],
      ["/admin/learning-analytics", "Thống kê học tập"], ["/admin/payments", "Thanh toán"], ["/admin/feedback", "Quản lý Feedback"],
    ].map(([path, label]) => <Link className="admin-button" key={path} to={path ?? ""}>{label}</Link>)}</div></section>
  </ManagementShell>;
}
