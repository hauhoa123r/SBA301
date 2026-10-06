import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { accountLabels, dateTime, subscriptionLabels, useAdminResource, type Plan, type StudentDetail, type StudentPage } from "@/features/admin-dashboard/management";
import { ManagementShell, ResourceStatus } from "./ManagementShell";

export function StudentManagementPage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [subscription, setSubscription] = useState("");
  const [page, setPage] = useState(0);
  const query = new URLSearchParams({ search, status, subscription, page: String(page) });
  const resource = useAdminResource<StudentPage>(`/api/admin/students?${query}`);
  return <ManagementShell title="Quản lý học viên">
    <form className="admin-filters" onSubmit={event => { event.preventDefault(); setSearch(input.trim()); setPage(0); }}>
      <label className="admin-search"><input aria-label="Tìm học viên theo tên hoặc email" maxLength={200} placeholder="Tên hoặc email học viên…" value={input} onChange={event => setInput(event.target.value)} /></label>
      <label>Tài khoản<select value={status} onChange={event => { setStatus(event.target.value); setPage(0); }}><option value="">Tất cả</option>{Object.entries(accountLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Gói học<select value={subscription} onChange={event => { setSubscription(event.target.value); setPage(0); }}><option value="">Tất cả</option>{Object.entries(subscriptionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button className="admin-button">Tìm kiếm</button><button type="button" className="admin-button" disabled={resource.loading} onClick={resource.refresh}>Làm mới</button>
    </form>
    <ResourceStatus {...resource} retry={resource.refresh} />
    {resource.data && <section className="admin-panel"><h2>{resource.data.totalElements} học viên</h2>
      <div className="admin-table-scroll"><table><thead><tr><th>Học viên</th><th>Tài khoản</th><th>Gói học</th><th>Hết hạn</th><th>Khóa đã học / hoàn thành</th><th /></tr></thead>
        <tbody>{resource.data.content.map(student => <tr key={student.id}><td className="admin-course-name"><strong>{student.fullName}</strong><small className="admin-secondary">{student.email}</small></td>
          <td>{accountLabels[student.status] ?? student.status}</td><td>{student.subscription.planName ?? "—"}<small className="admin-secondary">{subscriptionLabels[student.subscription.state]}</small></td>
          <td>{dateTime(student.subscription.expiresAt)}</td><td>{student.enrolledCourses} / {student.completedCourses}</td><td><Link className="admin-button" to={`/admin/students/${student.id}`}>Quản lý</Link></td></tr>)}</tbody></table></div>
      {!resource.data.content.length && <p className="admin-empty">Không có học viên phù hợp.</p>}
      <div className="admin-pagination"><span>Trang {page + 1}/{Math.max(1, resource.data.totalPages)}</span><div>
        <button className="admin-button" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trước</button>
        <button className="admin-button" disabled={page + 1 >= resource.data.totalPages} onClick={() => setPage(value => value + 1)}>Sau</button></div></div>
    </section>}
  </ManagementShell>;
}

function AccessForm({ detail, plans, onSaved }: { detail: StudentDetail; plans: Plan[]; onSaved: () => void }) {
  const paid = plans.filter(plan => plan.active && plan.code !== "FREE_TRIAL");
  const student = detail.student;
  const [action, setAction] = useState("GRANT");
  const [planCode, setPlanCode] = useState(paid[0]?.code ?? "");
  const [days, setDays] = useState(String(paid[0]?.durationDays ?? 30));
  const [mode, setMode] = useState("EXTEND");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canStatus = student.status === "ACTIVE" || student.status === "DISABLE";
  const canRevoke = ["ACTIVE", "SCHEDULED"].includes(student.subscription.state);
  const summary = action === "GRANT" ? `${mode === "REPLACE" ? "Thay thế gói hiện tại" : "Cấp/gia hạn gói"} bằng ${paid.find(plan => plan.code === planCode)?.name ?? "gói đã chọn"}, ${days} ngày.`
    : action === "STATUS" ? `${student.status === "ACTIVE" ? "Khóa" : "Mở khóa"} tài khoản ${student.email}.` : "Kết thúc hiệu lực gói học ngay sau khi lưu.";
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const base = `/api/admin/students/${student.id}`;
      if (action === "STATUS") await axiosClient.patch(`${base}/status`, { status: student.status === "ACTIVE" ? "DISABLE" : "ACTIVE", reason });
      else if (action === "REVOKE") await axiosClient.post(`${base}/subscription/revoke`, { reason });
      else await axiosClient.post(`${base}/subscription/grant`, { planCode, days: Number(days), mode, reason });
      onSaved();
    } catch (error) { setError(getApiErrorMessage(error)); }
    finally { setSaving(false); }
  }
  return <form className="admin-panel admin-management-form" onSubmit={event => { void submit(event); }}>
    <h2>Điều chỉnh tài khoản và quyền học</h2>
    <fieldset disabled={saving}><div className="admin-filters">
      <label>Thao tác<select value={action} onChange={event => setAction(event.target.value)}>
        <option value="GRANT">Cấp / gia hạn gói</option><option value="REVOKE" disabled={!canRevoke}>Thu hồi gói</option>
        <option value="STATUS" disabled={!canStatus}>{student.status === "DISABLE" ? "Mở khóa tài khoản" : "Khóa tài khoản"}</option>
      </select></label>
      {action === "GRANT" && <><label>Gói học<select required value={planCode} onChange={event => { setPlanCode(event.target.value); setDays(String(paid.find(plan => plan.code === event.target.value)?.durationDays ?? 30)); }}>
        {!paid.length && <option value="">Không có gói đang bán</option>}{paid.map(plan => <option key={plan.code} value={plan.code}>{plan.name}</option>)}
      </select></label><label>Số ngày<input type="number" min={1} max={3650} step={1} required value={days} onChange={event => setDays(event.target.value)} /></label>
        <label>Cách áp dụng<select value={mode} onChange={event => setMode(event.target.value)}><option value="EXTEND">Giữ thời gian trả phí còn lại</option><option value="REPLACE">Thay thế, tính từ bây giờ</option></select></label></>}
    </div>
    <p className="admin-note">{action === "GRANT" ? "Gia hạn cộng thêm ngày vào gói trả phí còn hiệu lực; gói học thử/hết hạn tính từ hôm nay. Thay thế sẽ bỏ thời gian còn lại. Đây là cấp quyền thủ công, không tạo hóa đơn hay doanh thu."
      : action === "REVOKE" ? "Tiến độ và bài làm vẫn được giữ. Quyền khóa học mua riêng trước đây vẫn còn; thu hồi gói không thực hiện hoàn tiền."
      : "Khóa tài khoản chặn đăng nhập và các yêu cầu mới từ phiên đang tồn tại. Thời hạn gói tiếp tục được tính trong thời gian khóa."}</p>
    <label>Lý do<textarea required maxLength={500} rows={3} value={reason} onChange={event => setReason(event.target.value)} /></label>
    <p className="admin-action-summary">{summary}</p>
    <button className="admin-button" disabled={action === "GRANT" && !paid.length}>{saving ? "Đang lưu…" : "Xác nhận lưu thay đổi"}</button></fieldset>
    {error && <p className="admin-error" role="alert">{error}</p>}
  </form>;
}

const actionLabels: Record<string, string> = { STUDENT_STATUS: "Đổi trạng thái tài khoản", SUBSCRIPTION_GRANT: "Cấp / gia hạn gói", SUBSCRIPTION_REVOKE: "Thu hồi gói" };
function historyText(json: string) {
  try {
    const data = JSON.parse(json) as { reason?: string; value?: { status?: string; planCode?: string; expiresAt?: string } };
    const value = data.value ?? data as { status?: string; planCode?: string; expiresAt?: string };
    return [value.status ? accountLabels[value.status] ?? value.status : "", value.planCode ?? "", value.expiresAt ? dateTime(value.expiresAt) : "", data.reason ?? ""].filter(Boolean).join(" · ");
  } catch { return "—"; }
}
export function StudentDetailPage() {
  const { id } = useParams();
  const resource = useAdminResource<StudentDetail>(`/api/admin/students/${id}`);
  const plans = useAdminResource<Plan[]>("/api/admin/subscription-plans");
  const [message, setMessage] = useState("");
  const detail = resource.data;
  return <ManagementShell title="Chi tiết học viên">
    <Link className="admin-button mb-5" to="/admin/students">← Danh sách học viên</Link>
    <ResourceStatus {...resource} retry={resource.refresh} />
    {message && <p className="admin-success" role="status">{message}</p>}
    {detail && <><section className="admin-panel"><h2>{detail.student.fullName}</h2><p>{detail.student.email}</p>
      <div className="admin-student-summary"><p>Tài khoản: <strong>{accountLabels[detail.student.status]}</strong></p><p>Đăng ký: {dateTime(detail.student.createdAt)}</p>
        <p>Gói: <strong>{detail.student.subscription.planName ?? "Chưa có gói"}</strong> · {subscriptionLabels[detail.student.subscription.state]}</p>
        <p>Bắt đầu: {dateTime(detail.student.subscription.startedAt)} · Hết hạn: {dateTime(detail.student.subscription.expiresAt)}</p></div>
    </section>
      <ResourceStatus {...plans} retry={plans.refresh} />
      {plans.data && <AccessForm key={`${id}-${detail.student.status}-${detail.student.subscription.expiresAt}`} detail={detail} plans={plans.data} onSaved={() => { setMessage("Đã lưu thay đổi và lịch sử quản trị."); resource.refresh(); }} />}
      <section className="admin-panel"><h2>Khóa học đã tham gia ({detail.courses.length})</h2><div className="admin-table-scroll"><table><thead><tr><th>Khóa học</th><th>Tham gia</th><th>Hoàn thành</th><th>Quyền mua riêng</th></tr></thead>
        <tbody>{detail.courses.map(course => <tr key={course.id}><td>{course.title}</td><td>{dateTime(course.enrolledAt)}</td><td>{dateTime(course.completedAt)}</td><td>{course.legacyAccess ? "Có" : "Theo gói học"}</td></tr>)}</tbody></table></div>
        {!detail.courses.length && <p className="admin-empty">Học viên chưa bắt đầu khóa học nào.</p>}</section>
      <section className="admin-panel"><h2>Lịch sử quản trị gần nhất</h2><div className="admin-table-scroll"><table><thead><tr><th>Thời gian / Admin</th><th>Thao tác</th><th>Trước</th><th>Sau / Lý do</th></tr></thead>
        <tbody>{detail.history.map(item => <tr key={item.id}><td>{dateTime(item.createdAt)}<small className="admin-secondary">{item.actor}</small></td><td>{actionLabels[item.action] ?? item.action}</td><td className="admin-history-text">{historyText(item.beforeData) || "Chưa có"}</td><td className="admin-history-text">{historyText(item.afterData)}</td></tr>)}</tbody></table></div>
        {!detail.history.length && <p className="admin-empty">Chưa có thay đổi quản trị. Hiển thị tối đa 50 thay đổi gần nhất.</p>}</section>
    </>}
  </ManagementShell>;
}
