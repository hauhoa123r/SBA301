import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, LayoutDashboard, RefreshCw, Search, Users, Wallet, X } from "lucide-react";
import UserProfileMenu from "@/features/auth/ui/UserProfileMenu";
import { useAccessibleDialog } from "@/features/payment/model/useAccessibleDialog";
import { type CourseStats, type CourseStatus, type Period } from "@/features/admin-dashboard/api";
import { useDashboard, useDashboardCourses } from "@/features/admin-dashboard/useDashboard";
import { DistributionChart, PopularChart, TrendChart } from "@/features/admin-dashboard/charts";
import { formatMoney, formatNumber } from "@/features/admin-dashboard/format";
import "./adminDashboard.css";
import { ManagementShell } from "./ManagementShell";
import { AdminDialog } from "@/features/admin-dashboard/analytics";
import { axiosClient, getApiErrorMessage } from "@/shared/api";

const statusLabels: Record<CourseStatus, string> = { DRAFT: "Bản nháp", PENDING: "Chờ duyệt", PUBLISHED: "Đang hoạt động", HIDDEN: "Đã ẩn" };
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
  const error = "error" in resource ? resource.error : undefined;
  const refresh = () => setRevision((value) => value + 1);
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link to="/" className="admin-brand"><BookOpen /><span>Chinese Learning<small>Quản trị hệ thống</small></span></Link>
      <nav aria-label="Điều hướng quản trị"><a href="#overview"><LayoutDashboard size={18} /> Tổng quan</a>
        <a href="#subscriptions"><Wallet size={18} /> Thống kê gói</a><Link to="/admin/students"><Users size={18} /> Học viên</Link><Link to="/admin/subscription-plans"><Wallet size={18} /> Quản lý gói học</Link><a href="#courses"><BookOpen size={18} /> Khóa học</a><Link to="/admin/assignments"><BookOpen size={18} /> Chấm bài tập</Link></nav>
      <Link className="admin-button mt-4" to="/admin/auth-settings">Cài đặt đăng ký</Link>
      <Link className="admin-button mt-4" to="/admin/feedback">Feedback</Link>
      <Link className="admin-button mt-4" to="/admin/learning-analytics">Hoạt động học tập</Link>
      <p className="admin-sidebar-note">Thống kê từ dữ liệu hệ thống</p>
    </aside>
    <main className="admin-main" id="overview">
      <header className="admin-header"><div><p className="admin-eyebrow">QUẢN TRỊ HỆ THỐNG</p><h1>Admin Dashboard</h1>
        <p>Theo dõi người dùng, doanh thu và hoạt động học tập.</p></div>
        <div className="admin-header-actions"><Link className="admin-button" to="/admin/students">Học viên</Link><Link className="admin-button" to="/admin/subscription-plans">Gói học</Link><Link className="admin-button" to="/admin/assignments">Chấm bài tập</Link><button className="admin-button" onClick={refresh} disabled={resource.loading}>
          <RefreshCw size={16} /> Làm mới</button><UserProfileMenu /></div></header>
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
            {data.subscriptions.map((plan) => <span className="admin-plan-count" key={plan.code}>{plan.name}: {formatNumber(plan.users)}</span>)}</Summary>
          <Summary title="Tổng khóa học" value={formatNumber(data.overview.totalCourses)} icon={<BookOpen />}>
            {formatNumber(data.overview.publishedCourses)} hoạt động · {formatNumber(data.overview.hiddenCourses)} đã ẩn
            <span className="admin-plan-count">{formatNumber(data.overview.draftCourses)} bản nháp · {formatNumber(data.overview.pendingCourses)} chờ duyệt</span></Summary>
        </div>
        <p className="admin-note">Doanh thu gộp từ giao dịch SUCCESS, chưa trừ hoàn tiền. Thống kê tháng dùng thời điểm xác nhận thanh toán; bản ghi lịch sử thiếu thời điểm không được phân bổ vào tháng. <Link to="/admin/payments">Xem báo cáo và đối soát thanh toán</Link>.</p>
        <div className="admin-grid">
          <Panel title="Tăng trưởng người dùng"><p className="admin-caption">Người đăng ký mới trong 12 tháng gần nhất</p><TrendChart rows={data.trends} field="users" label="Người dùng mới theo tháng" /></Panel>
          <Panel title="Doanh thu theo tháng"><p className="admin-caption">Giao dịch SUCCESS có thời điểm xác nhận · 12 tháng gần nhất</p><TrendChart rows={data.trends} field="revenue" label="Doanh thu theo tháng, VND" /></Panel>
          <Panel title="Phân bố gói đăng ký"><DistributionChart items={[
            ...data.subscriptions.map((plan) => ({ code: plan.code, name: plan.name, users: plan.users })),
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
            <tbody>{data.subscriptions.map((plan) => <tr key={plan.code}><td><strong>{plan.name}</strong></td><td>{formatMoney(plan.price)} / {plan.durationDays} ngày</td>
              <td>{formatNumber(plan.users)}</td><td>{formatMoney(plan.revenue)}</td><td>{plan.active ? "Đang cung cấp" : "Ngừng cung cấp"}</td></tr>)}</tbody></table></div>
          {!data.subscriptions.length && <p className="admin-empty">Chưa có gói đăng ký trong hệ thống.</p>}
        </Panel>
      </>}
      <CourseManagement revision={revision} />
    </main>
  </div>;
}

function Summary({ title, value, icon, children }: { title: string; value: string; icon: ReactNode; children: ReactNode }) {
  return <section className="admin-card"><div className="admin-card-title"><h2>{title}</h2>{icon}</div><strong className="admin-card-value">{value}</strong><div className="admin-card-detail">{children}</div></section>;
}

export function CourseManagementPage() {
  return <ManagementShell title="Quản lý khóa học"><CourseManagement revision={0} /></ManagementShell>;
}

function CourseManagement({ revision }: { revision: number }) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState<CourseStats | null>(null);
  const [editing, setEditing] = useState<CourseStats | null>(null);
  const resource = useDashboardCourses(search, status, page, revision + retry);
  const data = "data" in resource ? resource.data : undefined;
  const error = "error" in resource ? resource.error : undefined;
  return <Panel title="Quản lý và thống kê khóa học" id="courses">
    <p className="admin-caption">Đang học = đã có tiến độ bài học và chưa hoàn thành. Doanh thu khóa học chỉ gồm hóa đơn mua khóa riêng.</p>
    <form className="admin-course-filters" onSubmit={(event) => { event.preventDefault(); setSearch(input.trim()); setPage(0); }}>
      <label className="admin-search"><Search size={17} /><input aria-label="Tìm kiếm tên khóa học" maxLength={200} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tìm tên khóa học…" /></label>
      <button className="admin-button" type="submit">Tìm kiếm</button>
      <label>Trạng thái<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
        <option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </form>
    {resource.loading && <Loading />}{error && <ErrorState message={error} retry={() => setRetry((value) => value + 1)} />}
    {data && <>
      <div className="admin-table-scroll"><table><thead><tr><th>Khóa học</th><th>Giá</th><th>Đăng ký</th><th>Đang học</th><th>Hoàn thành</th><th>Tỷ lệ</th><th>Doanh thu</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead>
        <tbody>{data.content.map((course) => <tr key={course.id}><td className="admin-course-name"><strong>{course.title}</strong></td><td>{formatMoney(course.price)}<small className="admin-secondary">{course.price === 0 ? "FREE" : "PAID"}</small></td><td>{formatNumber(course.students)}</td>
          <td>{formatNumber(course.learning)}</td><td>{formatNumber(course.completed)}</td><td>{course.completionRate}%</td><td>{formatMoney(course.revenue)}</td>
          <td><span className={`admin-status admin-status-${course.status.toLowerCase()}`}>{statusLabels[course.status]}</span></td><td><button className="admin-text-button" onClick={() => setSelected(course)} aria-label={`Xem chi tiết ${course.title}`}>Xem</button><button className="admin-text-button" onClick={() => setEditing(course)} aria-label={`Sửa giá ${course.title}`}>Sửa giá</button></td></tr>)}</tbody></table></div>
      {!data.content.length && <p className="admin-empty">Không tìm thấy khóa học phù hợp.</p>}
      <div className="admin-pagination"><span>{formatNumber(data.totalElements)} khóa học · Trang {data.totalPages ? page + 1 : 0}/{data.totalPages}</span><div>
        <button className="admin-button" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Trước</button>
        <button className="admin-button" disabled={page + 1 >= data.totalPages} onClick={() => setPage((value) => value + 1)}>Sau</button></div></div>
    </>}
    <p className="admin-note">Giá 0 = FREE trong danh mục, giá &gt; 0 = PAID. Quyền học hiện theo subscription hoặc quyền mua cũ; sửa giá không đổi trạng thái xuất bản hay quyền học và không mở lại checkout mua riêng.</p>
    {selected && <CourseDialog course={selected} close={() => setSelected(null)} />}
    {editing && <PriceDialog course={editing} close={() => setEditing(null)} saved={() => { setEditing(null); setRetry(v => v + 1); }} />}
  </Panel>;
}

function PriceDialog({ course, close, saved }: { course: CourseStats; close: () => void; saved: () => void }) {
  const [price, setPrice] = useState(String(course.price)); const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function save() {
    setBusy(true); setError("");
    try { await axiosClient.patch(`/api/admin/dashboard/courses/${course.id}/price`, { price, expectedPrice: String(course.price), reason }); saved(); }
    catch (e) { setError(getApiErrorMessage(e)); } finally { setBusy(false); }
  }
  return <AdminDialog title={`Sửa giá · ${course.title}`} close={() => { if (!busy) close(); }}><form onSubmit={e => { e.preventDefault(); if (confirm) void save(); else setConfirm(true); }}>
    <p>Giá hiện tại: <strong>{formatMoney(course.price)}</strong> · {course.price === 0 ? "FREE" : "PAID"}</p>
    <fieldset disabled={busy}><label>Giá mới (VND)<input type="number" required min="0" max="9999999999999.99" step="0.01" value={price} onChange={e => { setPrice(e.target.value); setConfirm(false); }} /></label>
      <label>Lý do<textarea required maxLength={500} value={reason} onChange={e => { setReason(e.target.value); setConfirm(false); }} /></label>
      {confirm && <p className="admin-action-summary">Xác nhận đổi từ {formatMoney(course.price)} sang {formatMoney(Number(price))}? Hóa đơn và giao dịch đang chờ/đã trả giữ nguyên số tiền.</p>}
      <button className="admin-button" disabled={!reason.trim()}>{busy ? "Đang lưu…" : confirm ? "Xác nhận lưu giá" : "Kiểm tra thay đổi"}</button></fieldset>
    {error && <p role="alert" className="admin-error">{error}</p>}
  </form></AdminDialog>;
}

function CourseDialog({ course, close }: { course: CourseStats; close: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useAccessibleDialog({ open: true, onClose: close, dialogRef });
  return <div className="admin-dialog-backdrop" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-course-title" tabIndex={-1} ref={dialogRef}>
      <button className="admin-dialog-close" onClick={close} aria-label="Đóng chi tiết khóa học"><X /></button>
      <p className="admin-eyebrow">THỐNG KÊ KHÓA HỌC #{course.id}</p><h2 id="admin-course-title">{course.title}</h2>
      <dl>{[["Giá hiện tại", formatMoney(course.price)], ["Trạng thái", statusLabels[course.status]], ["Lượt đăng ký", formatNumber(course.students)],
        ["Đang học", formatNumber(course.learning)], ["Hoàn thành", formatNumber(course.completed)], ["Tỷ lệ hoàn thành", `${course.completionRate}%`],
        ["Doanh thu mua khóa riêng", formatMoney(course.revenue)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {course.status === "PUBLISHED" && <Link className="admin-button" to={`/courses/${course.id}`}>Xem nội dung giới thiệu khóa học</Link>}
    </div>
  </div>;
}
