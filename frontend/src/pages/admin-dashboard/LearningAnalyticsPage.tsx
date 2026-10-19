import { useState } from "react";
import { Link } from "react-router-dom";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { useAdminResource } from "@/features/admin-dashboard/management";
import { ManagementShell, ResourceStatus } from "./ManagementShell";
import "./learningAnalytics.css";

interface Day { date: string; users: number; watchSeconds: number; thresholds: { minutes: number; users: number }[] }
interface Report {
  settings: { minutes: number[] }; days: Day[];
  courses: { id: number; title: string; enrolled: number; started: number; completedLessonUsers: number }[];
  learners: { id: number; fullName: string; email: string; watchSeconds: number; activities: number }[];
  totalLearners: number; features: { feature: string; users: number; accesses: number }[];
}
export function LearningAnalyticsPage() {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const [from, setFrom] = useState(today); const [to, setTo] = useState(today);
  const [minimumMinutes, setMinimum] = useState(0); const [search, setSearch] = useState(""); const [page, setPage] = useState(0);
  const query = new URLSearchParams({ from, to, page: String(page), minimumMinutes: String(minimumMinutes), search });
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
    <p className="admin-note">Ngày theo giờ Việt Nam. Mốc ≥5/≥10/≥15 phút là cộng dồn thời gian xem được ghi nhận trong ngày; một người có thể đạt nhiều mốc. Thống kê khóa học dùng toàn bộ lịch sử.</p>
    <div className="admin-filters">
      <label>Từ ngày<input type="date" value={from} max={to} onChange={e => { setFrom(e.target.value); setPage(0); }} /></label>
      <label>Đến ngày<input type="date" value={to} min={from} max={today} onChange={e => { setTo(e.target.value); setPage(0); }} /></label>
      <label>Tên/email<input maxLength={200} value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></label>
      <label>Tối thiểu phút trong khoảng<input type="number" min={0} max={1440} value={minimumMinutes} onChange={e => { setMinimum(Number(e.target.value)); setPage(0); }} /></label>
      <button className="admin-button" onClick={resource.refresh} disabled={resource.loading}>Làm mới</button>
    </div>
    <ResourceStatus {...resource} retry={resource.refresh} />
    {data && <>
      <div className="admin-cards">{data.days.at(-1)?.thresholds.map(t => <section className="admin-card" key={t.minutes}><h2>≥ {t.minutes} phút · {to}</h2><strong className="admin-card-value">{t.users}</strong><p>người dùng</p></section>)}</div>
      <section className="admin-panel"><h2>Mốc thời gian học mỗi ngày</h2><div className="admin-filters"><label>Các mốc (phút, cách nhau bằng dấu phẩy)<input placeholder={data.settings.minutes.join(", ")} value={thresholds} onChange={e => setThresholds(e.target.value)} /></label><button className="admin-button" disabled={busy || !thresholds.trim()} onClick={() => void save()}>Lưu mốc</button></div>{message && <p role="status">{message}</p>}</section>
      <section className="admin-panel"><h2>Học tập theo ngày</h2><div className="admin-table-scroll"><table><thead><tr><th>Ngày</th><th>Có hoạt động</th><th>Tổng phút</th>{data.settings.minutes.map(n => <th key={n}>≥ {n} phút</th>)}</tr></thead><tbody>{data.days.map(d => <tr key={d.date}><td>{d.date}</td><td>{d.users}</td><td>{(d.watchSeconds / 60).toFixed(1)}</td>{d.thresholds.map(t => <td key={t.minutes}><span className="learning-bar" style={{ width: `${Math.max(2, 80 * t.users / Math.max(1, d.users))}px` }} /> {t.users}</td>)}</tr>)}</tbody></table></div></section>
      <section className="admin-panel"><h2>Người đã học ít nhất một bài trong khóa</h2><p>Bắt đầu = đã có thời gian xem &gt; 0 hoặc đánh dấu hoàn thành. Hoàn thành ≥1 bài = đã đánh dấu hoàn thành ít nhất một bài. Mỗi người chỉ được đếm một lần trong mỗi khóa.</p><div className="admin-table-scroll"><table><thead><tr><th>Khóa học</th><th>Đăng ký</th><th>Đã bắt đầu ≥1 bài</th><th>Hoàn thành ≥1 bài</th><th>Tỷ lệ bắt đầu</th></tr></thead><tbody>{data.courses.map(c => <tr key={c.id}><td>{c.title}</td><td>{c.enrolled}</td><td>{c.started}</td><td>{c.completedLessonUsers}</td><td>{c.enrolled ? (100 * c.started / c.enrolled).toFixed(1) : 0}%</td></tr>)}</tbody></table></div></section>
      <section className="admin-panel"><h2>Người học trong khoảng đã chọn ({data.totalLearners})</h2><div className="admin-table-scroll"><table><thead><tr><th>Học viên</th><th>Phút học</th><th>Hoạt động</th></tr></thead><tbody>{data.learners.map(u => <tr key={u.id}><td><Link to={`/admin/students/${u.id}`}>{u.fullName}</Link><small className="admin-secondary">{u.email}</small></td><td>{(u.watchSeconds / 60).toFixed(1)}</td><td>{u.activities}</td></tr>)}</tbody></table></div>{!data.learners.length && <p>Chưa có học viên phù hợp.</p>}<div className="admin-pagination"><button className="admin-button" disabled={!page} onClick={() => setPage(p => p - 1)}>Trước</button><span>Trang {page + 1}</span><button className="admin-button" disabled={(page + 1) * 25 >= data.totalLearners} onClick={() => setPage(p => p + 1)}>Sau</button></div></section>
      <section className="admin-panel"><h2>Tính năng được truy cập</h2><p>Số lần gọi API thành công của người dùng đã đăng nhập, gồm các heartbeat khi học.</p><div className="admin-table-scroll"><table><thead><tr><th>Tính năng</th><th>Người dùng</th><th>Lượt truy cập</th></tr></thead><tbody>{data.features.map(f => <tr key={f.feature}><td>{f.feature}</td><td>{f.users}</td><td>{f.accesses}</td></tr>)}</tbody></table></div></section>
    </>}
  </ManagementShell>;
}
