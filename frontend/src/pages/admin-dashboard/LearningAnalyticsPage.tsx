import { useState } from "react";
import { Link } from "react-router-dom";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { useAdminResource } from "@/features/admin-dashboard/management";
import { ManagementShell, ResourceStatus } from "./ManagementShell";
import "./learningAnalytics.css";
import { DateControls, Metric, ValueChart } from "@/features/admin-dashboard/analytics";
import { defaultDates, type LearningReport } from "@/features/admin-dashboard/analyticsModel";

interface Report extends LearningReport {
  settings: { minutes: number[] };
  learners: { id: number; fullName: string; email: string; watchSeconds: number; activities: number }[];
  features: { feature: string; users: number; accesses: number }[];
}
export function LearningAnalyticsPage() {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const [from, setFrom] = useState(defaultDates().from); const [to, setTo] = useState(today);
  const [includeLab, setIncludeLab] = useState(false); const [trendMode, setTrendMode] = useState("day");
  const [minimumMinutes, setMinimum] = useState(0); const [search, setSearch] = useState(""); const [page, setPage] = useState(0);
  const [draftSearch, setDraftSearch] = useState(""); const [draftMinimum, setDraftMinimum] = useState(0);
  const query = new URLSearchParams({ from, to, page: String(page), minimumMinutes: String(minimumMinutes), search, includeLab: String(includeLab) });
  const resource = useAdminResource<Report>(`/api/admin/learning-analytics?${query}`);
  const [thresholds, setThresholds] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function save() {
    const minutes = thresholds.split(/[,;: ]+/).filter(Boolean).map(Number);
    if (!minutes.length || minutes.length > 12 || minutes.some(n => !Number.isInteger(n) || n < 1 || n > 1440)) { setMessage("Nhập 1–12 mốc, mỗi mốc từ 1 đến 1440 phút."); return; }
    setBusy(true); setMessage("");
    try { await axiosClient.put("/api/admin/learning-analytics/settings", { minutes }); resource.refresh(); setThresholds(""); setMessage("Đã lưu mốc thời gian."); }
    catch (e) { setMessage(getApiErrorMessage(e)); } finally { setBusy(false); }
  }
  const data = resource.data;
  return <ManagementShell title="Hoạt động học tập">
    <p className="admin-note">Ngày theo giờ Việt Nam, tối đa 93 ngày. KPI và thống kê khóa học dùng toàn bộ lịch sử; xu hướng ghi danh và hoạt động dùng khoảng chọn. Chỉ tính STUDENT, loại ADMIN; tài khoản đã xóa vẫn thuộc lịch sử. Mặc định loại tài khoản có dấu vết Activity Lab, không suy đoán nguồn của tài khoản chưa được đánh dấu.</p>
    <DateControls value={{ from, to, mode: trendMode, includeLab }} onChange={v => { setFrom(v.from); setTo(v.to); setIncludeLab(v.includeLab); setTrendMode(v.mode); setPage(0); }} lab maxDays={93} />
    <form className="admin-filters" onSubmit={e => { e.preventDefault(); setSearch(draftSearch.trim()); setMinimum(draftMinimum); setPage(0); }}>
      <label>Tên/email<input maxLength={200} value={draftSearch} onChange={e => setDraftSearch(e.target.value)} /></label>
      <label>Tối thiểu phút trong khoảng<input type="number" required min={0} max={1440} value={draftMinimum} onChange={e => setDraftMinimum(Number(e.target.value))} /></label>
      <button className="admin-button">Tìm học viên</button>
      <button type="button" className="admin-button" onClick={resource.refresh} disabled={resource.loading}>Làm mới</button>
    </form>
    <ResourceStatus {...resource} retry={resource.refresh} />
    {data && <>
      <div className="admin-cards"><Metric title="Tổng lượt ghi danh" value={data.summary.totalEnrollments} /><Metric title="Học viên ghi danh duy nhất" value={data.summary.uniqueEnrolledStudents} /><Metric title="Học viên đã bắt đầu học" value={data.summary.studentsStarted} /><Metric title="Hoàn thành ít nhất một bài" value={data.summary.studentsCompletedLesson} /></div>
      <ValueChart title="Lượt ghi danh trong khoảng chọn" rows={Object.entries(data.enrollmentTrend.reduce<Record<string, number>>((all, d) => { const key = trendMode === "month" ? d.date.slice(0, 7) : d.date; all[key] = (all[key] ?? 0) + d.enrollments; return all; }, {})).map(([label, value]) => ({ label, value }))} />
      <div className="admin-cards">{data.days.at(-1)?.thresholds.map(t => <section className="admin-card" key={t.minutes}><h2>≥ {t.minutes} phút · {to}</h2><strong className="admin-card-value">{t.users}</strong><p>người dùng</p></section>)}</div>
      <section className="admin-panel"><h2>Mốc thời gian học mỗi ngày</h2><div className="admin-filters"><label>Các mốc (phút, cách nhau bằng dấu phẩy)<input placeholder={data.settings.minutes.join(", ")} value={thresholds} onChange={e => setThresholds(e.target.value)} /></label><button className="admin-button" disabled={busy || !thresholds.trim()} onClick={() => void save()}>Lưu mốc</button></div>{message && <p role="status">{message}</p>}</section>
      <section className="admin-panel"><h2>Học tập theo ngày</h2><div className="admin-table-scroll"><table><thead><tr><th>Ngày</th><th>Có hoạt động</th><th>Tổng phút</th>{data.settings.minutes.map(n => <th key={n}>≥ {n} phút</th>)}</tr></thead><tbody>{data.days.map(d => <tr key={d.date}><td>{d.date}</td><td>{d.users}</td><td>{(d.watchSeconds / 60).toFixed(1)}</td>{d.thresholds.map(t => <td key={t.minutes}><span className="learning-bar" style={{ width: `${Math.max(2, 80 * t.users / Math.max(1, d.users))}px` }} /> {t.users}</td>)}</tr>)}</tbody></table></div></section>
      <section className="admin-panel"><h2>Người đã học ít nhất một bài trong khóa</h2><p>Bắt đầu = thời gian xem &gt; 0 hoặc hoàn thành ít nhất một bài. Chỉ đếm học viên có ghi danh tương ứng; mỗi người một lần trong mỗi khóa.</p><div className="admin-table-scroll"><table><thead><tr><th>Khóa học</th><th>Lượt ghi danh</th><th>Học viên duy nhất</th><th>Đã bắt đầu ≥1 bài</th><th>Hoàn thành ≥1 bài</th><th>Hoàn thành khóa</th><th>Tỷ lệ bắt đầu</th></tr></thead><tbody>{data.courses.map(c => <tr key={c.id}><td>{c.title}</td><td>{c.enrolled}</td><td>{c.uniqueStudents}</td><td>{c.started}</td><td>{c.completedLessonUsers}</td><td>{c.courseCompletionCount}</td><td>{c.startRate === null ? "—" : `${c.startRate}%`}</td></tr>)}</tbody></table></div></section>
      <section className="admin-panel"><h2>Người học trong khoảng đã chọn ({data.totalLearners})</h2><div className="admin-table-scroll"><table><thead><tr><th>Học viên</th><th>Phút học</th><th>Hoạt động</th></tr></thead><tbody>{data.learners.map(u => <tr key={u.id}><td><Link to={`/admin/students/${u.id}`}>{u.fullName}</Link><small className="admin-secondary">{u.email}</small></td><td>{(u.watchSeconds / 60).toFixed(1)}</td><td>{u.activities}</td></tr>)}</tbody></table></div>{!data.learners.length && <p>Chưa có học viên phù hợp.</p>}<div className="admin-pagination"><button className="admin-button" disabled={!page} onClick={() => setPage(p => p - 1)}>Trước</button><span>Trang {page + 1}</span><button className="admin-button" disabled={(page + 1) * 25 >= data.totalLearners} onClick={() => setPage(p => p + 1)}>Sau</button></div></section>
      <section className="admin-panel"><h2>Tính năng được truy cập</h2><p>Số lần gọi API thành công của người dùng đã đăng nhập, gồm các heartbeat khi học.</p><div className="admin-table-scroll"><table><thead><tr><th>Tính năng</th><th>Người dùng</th><th>Lượt truy cập</th></tr></thead><tbody>{data.features.map(f => <tr key={f.feature}><td>{f.feature}</td><td>{f.users}</td><td>{f.accesses}</td></tr>)}</tbody></table></div></section>
    </>}
  </ManagementShell>;
}
