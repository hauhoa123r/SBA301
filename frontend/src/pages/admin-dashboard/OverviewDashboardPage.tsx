import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowUpRight, BookOpen, CreditCard, RefreshCw, Users, Wallet } from "lucide-react";
import { DateControls, ValueChart } from "@/features/admin-dashboard/analytics";
import { defaultDates, paymentLabels, type LearningReport, type PaymentReport, type RegistrationReport } from "@/features/admin-dashboard/analyticsModel";
import { accountLabels, dateTime, useAdminResource, type StudentPage } from "@/features/admin-dashboard/management";
import type { DashboardData } from "@/features/admin-dashboard/api";
import { apiGrouping, groupEventBuckets } from "@/features/admin-dashboard/overviewModel";
import { StatCard } from "@/features/admin-dashboard/StatCard";
import { StatusBadge } from "@/features/admin-dashboard/StatusBadge";
import { AdminLoading } from "@/features/admin-dashboard/AdminSkeleton";
import { formatMoney, formatNumber } from "@/features/admin-dashboard/format";
import { ManagementShell, ResourceStatus } from "./ManagementShell";

export function OverviewDashboardPage() {
  const [dates, setDates] = useState(() => ({ ...defaultDates(), includeLab: true }));
  const today = defaultDates().to;
  const query = new URLSearchParams({ from: dates.from, to: dates.to, mode: apiGrouping(dates.mode), includeLab: String(dates.includeLab) });
  const learningQuery = new URLSearchParams({ from: dates.from, to: dates.to, includeLab: String(dates.includeLab) });
  const todayQuery = new URLSearchParams({ from: today, to: today, includeLab: String(dates.includeLab) });
  const registrations = useAdminResource<RegistrationReport>(`/api/admin/registration-analytics?${query}`, { keepOnRefresh: true });
  const learning = useAdminResource<LearningReport>(`/api/admin/learning-analytics?${learningQuery}`, { keepOnRefresh: true });
  const todayLearning = useAdminResource<LearningReport>(`/api/admin/learning-analytics?${todayQuery}`, { keepOnRefresh: true });
  const payments = useAdminResource<PaymentReport>(`/api/admin/payments?from=${dates.from}&to=${dates.to}&mode=${apiGrouping(dates.mode)}&size=5`, { keepOnRefresh: true });
  const catalog = useAdminResource<DashboardData>("/api/admin/dashboard?period=all&limit=5", { keepOnRefresh: true });
  const students = useAdminResource<StudentPage>("/api/admin/students?page=0", { keepOnRefresh: true });
  const r = registrations.data && Array.isArray(registrations.data.buckets) ? registrations.data : undefined;
  const l = learning.data?.summary && Array.isArray(learning.data.days) && Array.isArray(learning.data.enrollmentTrend) ? learning.data : undefined;
  const p = payments.data && Array.isArray(payments.data.trend) && Array.isArray(payments.data.content) ? payments.data : undefined;
  const c = catalog.data?.overview && Array.isArray(catalog.data.subscriptions) ? catalog.data : undefined;
  const todayActivity = todayLearning.data?.days?.find(day => day.date === today);
  const todayValid = Array.isArray(todayLearning.data?.days);
  const invalidResponse = (registrations.data && !r) || (learning.data && !l) || (payments.data && !p) || (catalog.data && !c) || (todayLearning.data && !todayValid);
  const resources = [registrations, learning, todayLearning, payments, catalog, students];
  function refresh() { for (const resource of resources) resource.refresh(); }
  return <ManagementShell title="Tổng quan Edujar">
    <div className="admin-overview-welcome"><div><h2>Bức tranh học tập, trong một không gian.</h2><p>Theo dõi học viên, khóa học và hiệu quả hoạt động của Edujar.</p></div>
      <span className="admin-live-pill"><span />Dữ liệu từ hệ thống</span></div>
    <DateControls value={dates} onChange={setDates} weekly maxDays={93} showCaption={false}
      actions={<button type="button" className="admin-button" onClick={refresh} disabled={resources.some(resource => resource.loading)}><RefreshCw size={14} aria-hidden="true" />Làm mới dữ liệu</button>} />
    {resources.map((resource, index) => <ResourceStatus key={index} loading={false} error={resource.error} retry={resource.refresh} />)}
    {invalidResponse && <div className="admin-error" role="alert"><p>Phản hồi thống kê chưa đầy đủ. Vui lòng tải lại dữ liệu.</p><button className="admin-button" onClick={refresh}>Thử lại</button></div>}
    <div className="admin-cards admin-overview-cards" aria-label="Chỉ số tổng quan" aria-busy={resources.some(resource => resource.loading)}>
      <StatCard title="Tổng người dùng" value={r?.totalUsers} loading={registrations.loading} icon={Users} detail="Tất cả vai trò · hiện tại" />
      <StatCard title="Tổng khóa học" value={c?.overview.totalCourses} loading={catalog.loading} icon={BookOpen} detail={c ? `${formatNumber(c.overview.publishedCourses)} khóa đang hoạt động` : "Toàn bộ danh mục"} tone="violet" />
      <StatCard title="Học viên active hôm nay" value={todayValid ? todayActivity?.users ?? 0 : undefined} loading={todayLearning.loading} icon={Activity} detail={`${today} · giờ Việt Nam`} />
      <StatCard title="Tổng doanh thu" value={p?.totalRevenue} loading={payments.loading} icon={Wallet} detail="Toàn bộ giao dịch thành công · doanh thu gộp" money tone="green" />
      <StatCard title="Thanh toán thành công" value={p?.successfulPayments} loading={payments.loading} icon={CreditCard} detail="Trong khoảng thời gian chọn" tone="violet" />
    </div>
    <div className="admin-grid admin-overview-grid">
      {r ? <ValueChart title="Tăng trưởng người dùng" rows={groupEventBuckets(r.buckets.map(v => ({ label: v.label, value: v.count })), dates.mode)} variant="area" />
        : <PendingPanel title="Tăng trưởng người dùng" loading={registrations.loading} />}
      {p ? <ValueChart title="Xu hướng doanh thu" rows={groupEventBuckets(p.trend.map(v => ({ label: v.label, value: v.amount })), dates.mode)} money variant="bar" color="#22a06b" />
        : <PendingPanel title="Xu hướng doanh thu" loading={payments.loading} />}
    </div>
    <div className="admin-grid">
      {l ? <ValueChart title="Học viên active theo ngày (DAU)" rows={l.days.map(day => ({ label: day.date, value: day.users }))} variant="area" />
        : <PendingPanel title="Học viên active theo ngày (DAU)" loading={learning.loading} />}
      <section className="admin-panel"><div className="admin-panel-heading"><h2>Hành trình học tập</h2></div>
        {!l ? <p className="admin-empty">{learning.loading ? "Đang tải dữ liệu…" : "Chưa tải được dữ liệu."}</p> : <>
          <p className="admin-caption">Toàn bộ lịch sử của nhóm học viên đã chọn</p>
          <ul className="admin-popular">{[
            ["Đã ghi danh", l.summary.uniqueEnrolledStudents], ["Đã bắt đầu học", l.summary.studentsStarted], ["Hoàn thành ít nhất 1 bài", l.summary.studentsCompletedLesson],
          ].map(([label, count]) => <li key={String(label)}><div><span>{label}</span><strong>{formatNumber(Number(count))}</strong></div><div className="admin-bar-track"><div className="admin-bar" style={{ width: `${Math.min(100, Number(count) / Math.max(1, l.summary.uniqueEnrolledStudents, l.summary.studentsStarted, l.summary.studentsCompletedLesson) * 100)}%` }} /></div></li>)}</ul>
          <div className="admin-panel-heading"><span className="admin-caption">Học viên active trong khoảng</span><strong>{formatNumber(l.totalLearners)}</strong></div>
        </>}
      </section>
    </div>
    {p && p.unknownPaymentTimes > 0 && <p className="admin-note">{p.unknownPaymentTimes} thanh toán cũ thiếu thời điểm xác nhận được tính vào tổng doanh thu, không nằm trong xu hướng theo ngày.</p>}
    <div className="admin-grid admin-overview-grid">
      <section className="admin-panel"><div className="admin-panel-heading"><h2>Giao dịch gần đây</h2><Link to="/admin/payments">Xem tất cả <ArrowUpRight size={12} /></Link></div>
        <p className="admin-caption">Theo thời điểm thanh toán trong khoảng chọn</p>
        <ResourceStatus {...payments} kind="compact" retry={payments.refresh} />
        {p && <><div className="admin-table-scroll"><table><thead><tr><th>Giao dịch</th><th>Học viên</th><th>Số tiền</th><th>Trạng thái</th></tr></thead><tbody>{p.content.map(payment => <tr key={payment.id}>
          <td>{payment.transactionId}<small className="admin-secondary">{dateTime(payment.paymentTime)}</small></td><td><Link to={`/admin/students/${payment.studentId}`}>{payment.student}</Link></td><td>{formatMoney(payment.amount)}</td><td><StatusBadge status={payment.status} label={paymentLabels[payment.status]} /></td>
        </tr>)}</tbody></table></div>{!p.content.length && <p className="admin-empty">Chưa có giao dịch trong khoảng chọn.</p>}</>}
      </section>
      <section className="admin-panel"><div className="admin-panel-heading"><h2>Học viên mới</h2><Link to="/admin/students">Xem tất cả <ArrowUpRight size={12} /></Link></div><p className="admin-caption">Theo mã học viên giảm dần · không phụ thuộc bộ lọc thời gian</p>
        <ResourceStatus {...students} kind="compact" retry={students.refresh} />
        {students.data && <><div className="admin-table-scroll"><table><thead><tr><th>Học viên</th><th>Đăng ký</th><th>Trạng thái</th></tr></thead><tbody>{students.data.content?.slice(0, 5).map(student => <tr key={student.id}><td><Link to={`/admin/students/${student.id}`}>{student.fullName}</Link><small className="admin-secondary">{student.email}</small></td><td>{dateTime(student.createdAt)}</td><td><StatusBadge status={student.status} label={accountLabels[student.status]} /></td></tr>)}</tbody></table></div>{!students.data.content?.length && <p className="admin-empty">Chưa có học viên.</p>}</>}
      </section>
    </div>
    {l && <ValueChart title="Lượt ghi danh theo thời gian" rows={groupEventBuckets(l.enrollmentTrend.map(day => ({ label: day.date, value: day.enrollments })), dates.mode === "week" ? "week" : "day")} />}
  </ManagementShell>;
}

function PendingPanel({ title, loading }: { title: string; loading: boolean }) {
  return <section className="admin-panel admin-chart-panel"><h2>{title}</h2>{loading ? <AdminLoading kind="chart" /> : <p className="admin-empty">Chưa tải được dữ liệu. Vui lòng thử lại.</p>}</section>;
}
