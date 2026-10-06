import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import "./adminDashboard.css";

interface Submission {
  id: number; studentName: string; assignmentTitle: string; courseTitle: string; text: string;
  status: string; score: number | null; feedback: string | null; submittedAt: string;
}
interface SubmissionPage { content: Submission[]; totalElements: number; totalPages: number; page: number }
const labels: Record<string, string> = { SUBMITTED: "Chờ chấm", GRADED: "Đã chấm", NEEDS_REVISION: "Cần sửa bài" };

function ReviewForm({ submission, onSaved }: { submission: Submission; onSaved: (value: Submission) => void }) {
  const [score, setScore] = useState(submission.score === null ? "" : String(submission.score));
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [status, setStatus] = useState("GRADED");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const { data } = await axiosClient.put<Submission>(`/api/admin/assignments/submissions/${submission.id}/grade`, {
        status, score: status === "GRADED" ? Number(score) : null, feedback,
      });
      onSaved(data);
    } catch (reason) { setError(getApiErrorMessage(reason)); }
    finally { setSaving(false); }
  };
  return <form onSubmit={(event) => { void submit(event); }} className="admin-panel">
    <h2>{submission.assignmentTitle}</h2>
    <p>{submission.studentName} · {submission.courseTitle}</p>
    <p className="admin-caption">Nộp lúc {new Date(submission.submittedAt).toLocaleString("vi-VN")}</p>
    <div className="my-5 whitespace-pre-wrap break-words rounded-xl border border-brand-border p-4">{submission.text || "Bài nộp không có nội dung văn bản."}</div>
    <div className="admin-filters">
      <label>Kết quả<select value={status} onChange={(event) => setStatus(event.target.value)} disabled={saving}>
        <option value="GRADED">Đã chấm</option><option value="NEEDS_REVISION">Yêu cầu sửa bài</option>
      </select></label>
      {status === "GRADED" && <label>Điểm (0–100)<input type="number" min="0" max="100" step="1" required value={score} onChange={(event) => setScore(event.target.value)} disabled={saving} /></label>}
    </div>
    <label className="mt-4 block">Nhận xét<textarea rows={5} maxLength={4000} required={status === "NEEDS_REVISION"} value={feedback}
      onChange={(event) => setFeedback(event.target.value)} disabled={saving} className="mt-2 w-full rounded-xl border border-brand-border bg-brand-panel p-3" /></label>
    {error && <p role="alert" className="admin-error">{error}</p>}
    <button className="admin-button mt-4" disabled={saving}>{saving ? "Đang lưu..." : "Lưu kết quả"}</button>
  </form>;
}

export function AssignmentReviewPage() {
  const [filter, setFilter] = useState("SUBMITTED");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<SubmissionPage | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    axiosClient.get<SubmissionPage>("/api/admin/assignments/submissions", { params: { status: filter, page } })
      .then(({ data: result }) => { if (active) { setData(result); setError(""); } })
      .catch((reason: unknown) => { if (active) setError(getApiErrorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter, page, revision]);
  return <div className="admin-shell">
    <aside className="admin-sidebar"><Link to="/admin/dashboard" className="admin-brand">Chinese Learning</Link>
      <nav><Link to="/admin/dashboard">Dashboard</Link><Link to="/admin/students">Học viên</Link><Link to="/admin/subscription-plans">Gói học</Link><Link to="/admin/assignments">Chấm bài tập</Link></nav></aside>
    <main className="admin-main">
      <header className="admin-header"><div><p className="admin-eyebrow">QUẢN TRỊ HỆ THỐNG</p><h1>Chấm bài tập</h1></div><Link className="admin-button" to="/admin/dashboard">Về Dashboard</Link></header>
      <div className="admin-filters"><label>Trạng thái<select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(0); setSelected(null); setLoading(true); }}>
        <option value="">Tất cả</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label><button className="admin-button" disabled={loading} onClick={() => { setLoading(true); setRevision(value => value + 1); }}>Làm mới</button></div>
      {loading && <p role="status" className="admin-loading">Đang tải bài nộp...</p>}
      {error && <p role="alert" className="admin-error">{error}</p>}
      {message && <p role="status" className="my-4 text-status-successSoft">{message}</p>}
      {!loading && !error && data && <section className="admin-panel">
        <h2>{data.totalElements} bài nộp</h2>
        <div className="admin-table-scroll"><table><thead><tr><th>Học viên</th><th>Bài tập / Khóa học</th><th>Trạng thái</th><th>Điểm</th><th /></tr></thead>
          <tbody>{data.content.map(item => <tr key={item.id}><td>{item.studentName}</td><td>{item.assignmentTitle}<small className="block">{item.courseTitle}</small></td>
            <td>{labels[item.status]}</td><td>{item.score ?? "—"}</td><td><button className="admin-button" onClick={() => { setSelected(item); setMessage(""); }}>Xem bài</button></td></tr>)}</tbody></table></div>
        {!data.content.length && <p className="admin-empty">Không có bài nộp ở trạng thái này.</p>}
        <div className="admin-filters mt-4"><button className="admin-button" disabled={page === 0} onClick={() => { setPage(value => value - 1); setLoading(true); setSelected(null); }}>Trang trước</button>
          <span>Trang {page + 1}/{Math.max(1, data.totalPages)}</span><button className="admin-button" disabled={page + 1 >= data.totalPages} onClick={() => { setPage(value => value + 1); setLoading(true); setSelected(null); }}>Trang sau</button></div>
      </section>}
      {selected && <ReviewForm key={selected.id} submission={selected} onSaved={() => {
        setSelected(null); setMessage("Đã lưu kết quả và cập nhật tiến độ học viên."); setLoading(true); setRevision(value => value + 1);
      }} />}
    </main>
  </div>;
}
