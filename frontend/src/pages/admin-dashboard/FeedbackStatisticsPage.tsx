import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAdminResource, dateTime } from "@/features/admin-dashboard/management";
import { stateLabels, type FeedbackStats, type FormPage, type TextPage } from "@/features/feedback/model";
import { ManagementShell, ResourceStatus } from "./ManagementShell";
import "./feedbackAdmin.css";

const api = "/api/admin/feedback";
const number = (value: number) => value.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
function TextResponses({ formId, questionId }: { formId: number; questionId: number }) {
  const [page, setPage] = useState(0);
  const resource = useAdminResource<TextPage>(`${api}/${formId}/questions/${questionId}/text-answers?page=${page}`);
  return <><ResourceStatus {...resource} retry={resource.refresh} />{resource.data && <>
    <ul className="feedback-text-responses">{resource.data.content.map(row => <li key={row.submissionId}><p>{row.text}</p><small>Lượt gửi #{row.submissionId} · {dateTime(row.submittedAt)}</small></li>)}</ul>
    {!resource.data.content.length && <p className="admin-note">Chưa có câu trả lời văn bản.</p>}
    <div className="admin-pagination"><span>{resource.data.totalElements} câu trả lời · Trang {page + 1}</span><div><button className="admin-button" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
      <button className="admin-button" disabled={page + 1 >= resource.data.totalPages} onClick={() => setPage(page + 1)}>Sau</button></div></div>
  </>}</>;
}
function Statistics({ id }: { id: number }) {
  const resource = useAdminResource<FeedbackStats>(`${api}/${id}/statistics`); const data = resource.data;
  return <><ResourceStatus {...resource} retry={resource.refresh} />{data && <>
    <section className="admin-panel"><div className="feedback-admin-actions"><h2>{data.form.title}</h2><button className="admin-button" onClick={resource.refresh}>Làm mới thống kê</button><Link className="admin-button" to={`/admin/feedback?formId=${id}`}>Mở biểu mẫu</Link></div>
      <p className="admin-caption">{stateLabels[data.form.status]} · {data.form.active ? "Đang nhận phản hồi" : "Chưa mở / tạm dừng / đã kết thúc"}</p>
      <p className="admin-note">Xuất bản lần đầu: {dateTime(data.form.publishedAt)} · Bắt đầu: {dateTime(data.form.startsAt ?? data.form.publishedAt)}<br />Kết thúc theo lịch: {dateTime(data.form.endsAt)} · Đóng: {dateTime(data.form.closedAt)}</p>
      <div className="feedback-summary-grid">{[["Tổng lượt gửi", data.submissions], ["Người tham gia duy nhất", data.participants], ["Người đã mở biểu mẫu", data.startedUsers], ["Tỷ lệ hoàn thành", `${number(data.completionRate)}%`], ["Số câu hỏi", data.questionCount], ["Câu trả lời hợp lệ", data.validAnswers]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <p className="admin-note">Tỷ lệ hoàn thành = người đã gửi / người đã mở biểu mẫu sau khi đăng nhập. Câu hỏi bỏ qua không tính là câu trả lời hợp lệ. Khảo sát cho gửi nhiều lần vẫn chỉ tính mỗi người một lần trong tỷ lệ hoàn thành.</p>
    </section>
    {data.questions.map((q, index) => <section className="admin-panel" key={q.questionId}><h2>{index + 1}. {q.title}</h2><p className="admin-caption">{q.answered} câu trả lời hợp lệ</p>
      {q.numeric && <div className="feedback-numeric-grid">{[["Trung bình", q.numeric.average], ["Trung vị", q.numeric.median], ["Nhỏ nhất", q.numeric.min], ["Lớn nhất", q.numeric.max]].map(([label, value]) => <p key={label}>{label}: <strong>{number(Number(value))}</strong></p>)}</div>}
      {q.distribution.length > 0 && <ul className="feedback-distribution" aria-label={`Phân bố câu trả lời: ${q.title}`}>{q.distribution.map((b, i) => <li key={i}>
        <div><span>{b.label}</span><strong>{b.count} · {number(b.percentage)}%</strong></div><div className="admin-bar-track"><div className="admin-bar" style={{ width: `${b.percentage}%` }} /></div></li>)}</ul>}
      {q.type === "MULTIPLE_CHOICE" && <p className="admin-note">Tỷ lệ mỗi phương án tính trên số lượt trả lời câu hỏi; tổng có thể vượt 100%.</p>}
      {(q.type === "SHORT_TEXT" || q.type === "LONG_TEXT") && <TextResponses formId={id} questionId={q.questionId} />}
      {q.answered === 0 && <p className="admin-note">Chưa có dữ liệu cho câu hỏi này.</p>}
    </section>)}
  </>}</>;
}
export function FeedbackStatisticsPage() {
  const [params, setParams] = useSearchParams(); const [page, setPage] = useState(0);
  const history = useAdminResource<FormPage>(`${api}?page=${page}`); const explicit = Number(params.get("formId"));
  const selected = Number.isSafeInteger(explicit) && explicit > 0 ? explicit : (history.data?.content.find(f => f.active)?.id ?? history.data?.content[0]?.id);
  return <ManagementShell title="Thống kê Feedback"><Link className="admin-button" to="/admin/feedback">Quản lý đợt feedback</Link>
    <ResourceStatus {...history} retry={history.refresh} />
    {history.data && <section className="admin-panel"><label>Chọn đợt hiện hành hoặc báo cáo lịch sử<select value={selected ?? ""} onChange={e => setParams({ formId: e.target.value })}>
      {selected && !history.data.content.some(f => f.id === selected) && <option value={selected}>Đợt #{selected}</option>}
      {!history.data.content.length && <option value="">Chưa có đợt feedback</option>}
      {history.data.content.map(f => <option key={f.id} value={f.id}>{f.title} · {f.active ? "Hiện hành" : stateLabels[f.status]}</option>)}</select></label>
      <div className="admin-pagination"><span>Trang lịch sử {page + 1}</span><div><button className="admin-button" disabled={page === 0} onClick={() => setPage(page - 1)}>Đợt mới hơn</button>
        <button className="admin-button" disabled={page + 1 >= history.data.totalPages} onClick={() => setPage(page + 1)}>Đợt cũ hơn</button></div></div>
    </section>}
    {selected && <Statistics key={selected} id={selected} />}
  </ManagementShell>;
}
