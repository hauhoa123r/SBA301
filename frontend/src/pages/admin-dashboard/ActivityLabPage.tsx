import { useState, type FormEvent } from "react";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { useAdminResource, type StudentPage, type StudentDetail, type Plan, dateTime } from "@/features/admin-dashboard/management";
import { FeedbackFields } from "@/features/feedback/FeedbackFields";
import type { FeedbackForm } from "@/features/feedback/model";
import { ManagementShell, ResourceStatus } from "./ManagementShell";
import "./learningAnalytics.css";

interface Rule { course_id: number; daily_minutes: number; lessons_per_day: number; enabled: boolean | number; features: string; last_run_date: string | null }
interface Overview { enabled: boolean; features: string[]; students: StudentPage; courses: { id: number; title: string }[]; plans: Plan[] }
interface Detail {
  student: StudentDetail; rules: Rule[]; features: { feature: string; accesses: number; last_date: string }[];
  feedback: { id: number; title: string; submitted_at: string }[];
  answers: { submission_id: number; title: string; text_value: string | null; number_value: number | null; options?: string | null }[];
}
const base = "/api/admin/activity-lab";
export function ActivityLabPage() {
  const [search, setSearch] = useState(""); const [page, setPage] = useState(0); const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const resource = useAdminResource<Overview>(`${base}?${new URLSearchParams({ search, page: String(page) })}`);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form); setBusy(true); setMessage("");
    try { const { data } = await axiosClient.post<{ id: number }>(`${base}/users`, Object.fromEntries(fields)); form.reset(); resource.refresh(); setSelected(data.id); setMessage(`Đã tạo tài khoản #${data.id}.`); }
    catch (e) { setMessage(getApiErrorMessage(e)); } finally { setBusy(false); }
  }
  return <ManagementShell title="Điều phối hoạt động người dùng">
    <p className="admin-note">Trang quản trị truy cập trực tiếp qua URL. Hoạt động được lưu vào dữ liệu nghiệp vụ và thống kê chung. Các thay đổi được ghi vào nhật ký admin.</p>
    <ResourceStatus {...resource} retry={resource.refresh} />
    {resource.data && <>
      {!resource.data.enabled && <p role="alert" className="admin-error">Tính năng đang tắt trên server. Đặt ACTIVITY_LAB_ENABLED=true sau khi chạy migration.</p>}
      <details className="admin-panel"><summary>Tạo tài khoản học viên</summary><form className="activity-lab-form" onSubmit={e => void create(e)}><label>Họ tên<input name="fullName" required maxLength={255} /></label><label>Email<input name="email" type="email" required maxLength={255} /></label><label>Mật khẩu<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={72} /></label><label>Lý do<input name="reason" required maxLength={500} /></label><button className="admin-button" disabled={busy || !resource.data.enabled}>Tạo tài khoản</button></form></details>
      {message && <p role="status">{message}</p>}
      <div className="activity-lab-grid"><section className="admin-panel"><h2>Chọn học viên</h2><label>Tìm tên/email<input className="admin-search" value={search} maxLength={200} onChange={e => { setSearch(e.target.value); setPage(0); }} /></label><div className="activity-lab-list">{resource.data.students.content.map(u => <button className="admin-button" key={u.id} aria-pressed={selected === u.id} onClick={() => setSelected(u.id)}>{u.fullName}<small className="admin-secondary">{u.email} · {u.status}</small></button>)}</div><div className="admin-pagination"><button className="admin-button" disabled={!page} onClick={() => setPage(p => p - 1)}>Trước</button><span>{page + 1}</span><button className="admin-button" disabled={page + 1 >= resource.data.students.totalPages} onClick={() => setPage(p => p + 1)}>Sau</button></div></section>
        {selected ? <UserActivity key={selected} id={selected} overview={resource.data} /> : <p>Chọn hoặc tạo học viên để cấu hình.</p>}
      </div>
    </>}
  </ManagementShell>;
}
function UserActivity({ id, overview }: { id: number; overview: Overview }) {
  const detail = useAdminResource<Detail>(`${base}/users/${id}`);
  return <div><ResourceStatus {...detail} retry={detail.refresh} />{detail.data && <UserControls key={`${id}-${JSON.stringify(detail.data.rules)}`} id={id} overview={overview} detail={detail.data} refresh={detail.refresh} />}</div>;
}
function UserControls({ id, overview, detail, refresh }: { id: number; overview: Overview; detail: Detail; refresh: () => void }) {
  const rule = detail.rules[0]; const student = detail.student.student;
  const [courseId, setCourse] = useState(rule?.course_id ?? overview.courses[0]?.id ?? 0);
  const [minutes, setMinutes] = useState(rule?.daily_minutes ?? 5); const [lessons, setLessons] = useState(rule?.lessons_per_day ?? 1);
  const [enabled, setEnabled] = useState(Boolean(rule?.enabled)); const [features, setFeatures] = useState(rule?.features.split(",").filter(Boolean) ?? ["LEARNING"]);
  const [plan, setPlan] = useState(overview.plans.find(p => p.active && p.price > 0)?.code ?? ""); const [days, setDays] = useState(30);
  const [reason, setReason] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function action(path: string, body: object, method: "post" | "put" = "post") {
    if (!reason.trim()) { setMessage("Nhập lý do thao tác."); return; }
    setBusy(true); setMessage("");
    try { const { data } = await axiosClient[method]<{ alreadyRun?: boolean }>(`${base}/users/${id}/${path}`, { ...body, reason }); setMessage(data.alreadyRun ? "Hôm nay đã chạy; không cộng thêm hoạt động." : "Đã lưu thành công."); refresh(); }
    catch (e) { setMessage(getApiErrorMessage(e)); } finally { setBusy(false); }
  }
  return <>
    <section className="admin-panel"><h2>{student.fullName}</h2><p>{student.email} · {student.status}</p><p>Gói: {student.subscription.planName ?? "Chưa có"} · {student.subscription.state} · Hết hạn: {dateTime(student.subscription.expiresAt)}</p>
      <div className="activity-lab-form"><label>Lý do thao tác<input value={reason} maxLength={500} required onChange={e => setReason(e.target.value)} /></label></div>
      <fieldset disabled={busy || !overview.enabled || student.status !== "ACTIVE"} className="activity-lab-form">
        <legend>Cài đặt học mỗi ngày</legend><label>Khóa học<select value={courseId} onChange={e => setCourse(Number(e.target.value))}>{overview.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        <label>Phút học (5 / 10 / 15 / tùy chỉnh)<input type="number" min={1} max={180} value={minutes} onChange={e => setMinutes(Number(e.target.value))} /></label>
        <label>Số bài mới hoàn thành mỗi ngày<input type="number" min={0} max={20} value={lessons} onChange={e => setLessons(Number(e.target.value))} /></label>
        <label className="activity-check"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />Tự chạy hằng ngày</label>
        <p>Tính năng ghi nhận truy cập:</p>{overview.features.map(f => <label className="activity-check" key={f}><input type="checkbox" checked={features.includes(f)} onChange={e => setFeatures(old => e.target.checked ? [...old, f] : old.filter(v => v !== f))} />{f}</label>)}
        <button className="admin-button" onClick={() => void action("rule", { courseId, dailyMinutes: minutes, lessonsPerDay: lessons, enabled, features }, "put")}>Lưu cài đặt</button>
        <p>Lần chạy gần nhất: {rule?.last_run_date ?? "Chưa chạy"}. Chạy tối đa một lần/ngày theo giờ Việt Nam; cần gói học đang hiệu lực.</p>
        <button className="admin-button" disabled={!rule} onClick={() => void action("run", {})}>Chạy hoạt động hôm nay theo cài đặt đã lưu</button>
        <legend>Subscription</legend><label>Gói<select value={plan} onChange={e => setPlan(e.target.value)}>{overview.plans.filter(p => p.active && p.price > 0).map(p => <option key={p.code} value={p.code}>{p.name}</option>)}</select></label><label>Thời hạn (ngày)<input type="number" min={1} max={365} value={days} onChange={e => setDays(Number(e.target.value))} /></label><button className="admin-button" disabled={!plan} onClick={() => void action("subscription", { planCode: plan, days })}>Cấp / thay thế subscription</button>
      </fieldset>{message && <p role="status">{message}</p>}
    </section>
    <section className="admin-panel"><h2>Tính năng đã truy cập</h2>{detail.features.map(f => <p key={f.feature}>{f.feature}: {f.accesses} lượt · {f.last_date}</p>)}{!detail.features.length && <p>Chưa có dữ liệu.</p>}</section>
    <section className="admin-panel"><h2>Feedback của người dùng</h2>{detail.feedback.map(f => <div key={f.id}><strong>#{f.id} · {f.title}</strong><p>{dateTime(f.submitted_at)}</p>{detail.answers.filter(a => a.submission_id === f.id).map((a, i) => <p key={i}>{a.title}: {a.text_value ?? a.number_value ?? a.options ?? "—"}</p>)}</div>)}{!detail.feedback.length && <p>Chưa gửi feedback.</p>}
      {overview.enabled && student.status === "ACTIVE" && <UserFeedback id={id} refresh={refresh} />}
    </section>
    <section className="admin-panel"><h2>Nhật ký admin</h2><div className="activity-lab-history">{detail.student.history.map(h => <p key={h.id}>{dateTime(h.createdAt)} · {h.actor} · {h.action}<br />{h.afterData}</p>)}</div></section>
  </>;
}
function UserFeedback({ id, refresh }: { id: number; refresh: () => void }) {
  const form = useAdminResource<FeedbackForm | null>(`${base}/users/${id}/feedback`); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  return <><ResourceStatus {...form} retry={form.refresh} />{form.data && !form.data.hasSubmitted && <><h3>Gửi vào đợt: {form.data.title}</h3><FeedbackFields key={form.data.id} questions={form.data.questions} busy={busy} onSubmit={async answers => {
    setBusy(true); setMessage(""); try { await axiosClient.post(`${base}/users/${id}/feedback`, { formId: form.data?.id, revision: form.data?.revision, answers }); setMessage("Đã gửi phản hồi."); form.refresh(); refresh(); } catch (e) { setMessage(getApiErrorMessage(e)); } finally { setBusy(false); }
  }} /></>}{form.data?.hasSubmitted && <p>Học viên đã gửi đợt feedback hiện tại.</p>}{form.data === null && <p>Chưa có đợt feedback đang mở.</p>}{message && <p role="status">{message}</p>}</>;
}
