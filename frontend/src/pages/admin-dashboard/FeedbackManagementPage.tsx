import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { useAdminResource, dateTime } from "@/features/admin-dashboard/management";
import { FeedbackFields } from "@/features/feedback/FeedbackFields";
import { moveItem, newQuestion, questionLabels, stateLabels, type FeedbackForm, type FeedbackQuestion, type FormDraft, type FormPage, type QuestionType } from "@/features/feedback/model";
import { ManagementShell, ResourceStatus } from "./ManagementShell";
import "./feedbackAdmin.css";

const api = "/api/admin/feedback";
function draftOf(form?: FeedbackForm): FormDraft {
  return form ? { revision: form.revision, title: form.title, description: form.description, onePerUser: form.onePerUser,
    startsAt: form.startsAt, endsAt: form.endsAt, questions: form.questions }
    : { revision: null, title: "", description: "", onePerUser: true, startsAt: null, endsAt: null, questions: [] };
}
function localInput(value: string | null) {
  if (!value) return ""; const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function numberInput(value: string) { return value === "" ? null : Number(value); }

function QuestionEditor({ question: q, index, count, update, move, duplicate, remove }: {
  question: FeedbackQuestion; index: number; count: number; update: (q: FeedbackQuestion) => void;
  move: (direction: number) => void; duplicate: () => void; remove: () => void;
}) {
  const patch = (value: Partial<FeedbackQuestion>) => update({ ...q, ...value });
  const fixedOptions = q.type === "LIKERT" || q.type === "YES_NO";
  return <section className="feedback-editor-question">
    <div className="feedback-admin-actions"><strong>Câu {index + 1}</strong>
      <button type="button" className="admin-button" disabled={index === 0} onClick={() => move(-1)} aria-label={`Đưa câu ${index + 1} lên`}>↑</button>
      <button type="button" className="admin-button" disabled={index === count - 1} onClick={() => move(1)} aria-label={`Đưa câu ${index + 1} xuống`}>↓</button>
      <button type="button" className="admin-button" disabled={count >= 100} onClick={duplicate}>Nhân bản câu hỏi</button>
      <button type="button" className="admin-button" onClick={remove}>Xóa câu hỏi</button>
    </div>
    <label>Tiêu đề câu hỏi<input required maxLength={500} value={q.title} onChange={e => patch({ title: e.target.value })} /></label>
    <label>Mô tả câu hỏi<textarea maxLength={2000} rows={2} value={q.description} onChange={e => patch({ description: e.target.value })} /></label>
    <div className="feedback-admin-grid"><label>Loại câu hỏi<select value={q.type} onChange={e => {
      const next = newQuestion(e.target.value as QuestionType); update({ ...next, id: q.id, title: q.title, description: q.description, required: q.required });
    }}>{Object.entries(questionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="admin-toggle"><input type="checkbox" checked={q.required} onChange={e => patch({ required: e.target.checked })} />Bắt buộc</label>
    </div>
    {(q.type === "SHORT_TEXT" || q.type === "LONG_TEXT") && <label>Số ký tự tối đa (để trống = {q.type === "SHORT_TEXT" ? 255 : 10000})
      <input type="number" min={1} max={q.type === "SHORT_TEXT" ? 255 : 10000} step={1} value={q.maxLength ?? ""} onChange={e => patch({ maxLength: numberInput(e.target.value) })} /></label>}
    {(q.type === "NUMBER" || q.type === "RATING") && <div className="feedback-admin-grid">
      <label>Giá trị nhỏ nhất<input type="number" required={q.type === "RATING"} min={q.type === "RATING" ? 0 : undefined} max={q.type === "RATING" ? 20 : undefined}
        step={q.type === "RATING" ? 1 : "0.0001"} value={q.minValue ?? ""} onChange={e => patch({ minValue: numberInput(e.target.value) })} /></label>
      <label>Giá trị lớn nhất<input type="number" required={q.type === "RATING"} min={q.type === "RATING" ? 0 : undefined} max={q.type === "RATING" ? 20 : undefined}
        step={q.type === "RATING" ? 1 : "0.0001"} value={q.maxValue ?? ""} onChange={e => patch({ maxValue: numberInput(e.target.value) })} /></label>
    </div>}
    {q.type === "MULTIPLE_CHOICE" && <div className="feedback-admin-grid"><label>Số phương án tối thiểu<input type="number" min={1} max={q.options.length} step={1} value={q.minSelections ?? ""} onChange={e => patch({ minSelections: numberInput(e.target.value) })} /></label>
      <label>Số phương án tối đa<input type="number" min={q.minSelections ?? 1} max={q.options.length} step={1} value={q.maxSelections ?? ""} onChange={e => patch({ maxSelections: numberInput(e.target.value) })} /></label></div>}
    {q.options.length > 0 && <div className="feedback-option-editor"><p className="admin-caption">{q.type === "LIKERT" ? "Nhãn cho từng mức 1–5 theo thứ tự dưới đây" : "Phương án trả lời"}</p>
      {q.options.map((o, i) => <div className="feedback-option-row" key={i}><label><span>{i + 1}.</span><input required maxLength={300} value={o.label} onChange={e => patch({ options: q.options.map((old, j) => j === i ? { ...old, label: e.target.value } : old) })} /></label>
        <button type="button" className="admin-button" disabled={i === 0} onClick={() => patch({ options: moveItem(q.options, i, -1) })} aria-label={`Đưa phương án ${i + 1} lên`}>↑</button>
        <button type="button" className="admin-button" disabled={i === q.options.length - 1} onClick={() => patch({ options: moveItem(q.options, i, 1) })} aria-label={`Đưa phương án ${i + 1} xuống`}>↓</button>
        {!fixedOptions && <button type="button" className="admin-button" disabled={q.options.length <= 2} onClick={() => patch({ options: q.options.filter((_, j) => j !== i) })}>Xóa</button>}
      </div>)}
      {!fixedOptions && <button type="button" className="admin-button" disabled={q.options.length >= 100} onClick={() => patch({ options: [...q.options, { id: null, label: "" }] })}>Thêm phương án</button>}
    </div>}
  </section>;
}

function FormEditor({ form, onSaved }: { form?: FeedbackForm; onSaved: (form: FeedbackForm) => void }) {
  const [draft, setDraft] = useState<FormDraft>(() => draftOf(form)); const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const editable = !form || form.status === "DRAFT" || form.status === "PAUSED";
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftOf(form));
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { const { data } = form ? await axiosClient.put<FeedbackForm>(`${api}/${form.id}`, draft) : await axiosClient.post<FeedbackForm>(api, draft); onSaved(data); }
    catch (e) { setError(getApiErrorMessage(e)); } finally { setBusy(false); }
  }
  async function state(action: string) {
    if (!form) return; setBusy(true); setError("");
    try { const { data } = await axiosClient.post<FeedbackForm>(`${api}/${form.id}/state`, { action, revision: form.revision }); onSaved(data); }
    catch (e) { setError(getApiErrorMessage(e)); } finally { setBusy(false); }
  }
  const question = (index: number, next: FeedbackQuestion) => setDraft(old => ({ ...old, questions: old.questions.map((q, i) => i === index ? next : q) }));
  return <div className="admin-panel"><h2>{form ? `Chỉnh sửa: ${form.title}` : "Tạo đợt feedback mới"}</h2>
    {form && <p className="admin-caption">{stateLabels[form.status]} · {form.active ? "Đang nhận phản hồi" : "Chưa nhận phản hồi / đã kết thúc"} · Phiên bản {form.revision}</p>}
    {!editable && <p className="admin-note">{form?.status === "PUBLISHED" ? "Tạm dừng trước khi chỉnh sửa biểu mẫu." : "Đợt đã đóng được giữ lại để xem báo cáo. Tạo đợt mới để khảo sát tiếp."}</p>}
    {form?.schemaLocked && <p className="admin-note">Đã có phản hồi: câu hỏi, phương án và quy định số lần gửi được khóa để giữ chính xác dữ liệu lịch sử.</p>}
    <form className="admin-management-form feedback-admin-form" onSubmit={e => { void save(e); }}>
      <fieldset disabled={busy || !editable}>
        <label>Tiêu đề đợt feedback<input required maxLength={200} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
        <label>Mô tả<textarea rows={3} maxLength={4000} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label>
        <div className="feedback-admin-grid"><label>Bắt đầu (giờ máy của bạn)<input type="datetime-local" value={localInput(draft.startsAt)} onChange={e => setDraft({ ...draft, startsAt: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label>
          <label>Kết thúc (giờ máy của bạn)<input type="datetime-local" value={localInput(draft.endsAt)} onChange={e => setDraft({ ...draft, endsAt: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label></div>
        <label className="admin-toggle"><input type="checkbox" disabled={form?.schemaLocked} checked={draft.onePerUser} onChange={e => setDraft({ ...draft, onePerUser: e.target.checked })} />Mỗi tài khoản chỉ gửi một lần</label>
        <fieldset disabled={form?.schemaLocked}>
          {draft.questions.map((q, index) => <QuestionEditor key={index} question={q} index={index} count={draft.questions.length} update={next => question(index, next)}
            move={direction => setDraft(old => ({ ...old, questions: moveItem(old.questions, index, direction) }))}
            remove={() => setDraft(old => ({ ...old, questions: old.questions.filter((_, i) => i !== index) }))}
            duplicate={() => setDraft(old => ({ ...old, questions: [...old.questions.slice(0, index + 1), { ...q, id: null, options: q.options.map(o => ({ ...o, id: null })) }, ...old.questions.slice(index + 1)] }))} />)}
          <button type="button" className="admin-button" disabled={draft.questions.length >= 100} onClick={() => setDraft(old => ({ ...old, questions: [...old.questions, newQuestion()] }))}>+ Thêm câu hỏi</button>
        </fieldset>
        <button className="admin-button" type="submit">{busy ? "Đang lưu…" : "Lưu bản nháp / thay đổi"}</button>
      </fieldset>
    </form>
    <div className="feedback-admin-actions"><button className="admin-button" type="button" onClick={() => setPreview(!preview)}>{preview ? "Ẩn xem trước" : "Xem trước biểu mẫu"}</button>
      {form && <><Link className="admin-button" to={`/admin/feedback/statistics?formId=${form.id}`}>Xem thống kê</Link>
        {editable && <button className="admin-button" disabled={busy || dirty} onClick={() => { void state("PUBLISH"); }}>Xuất bản</button>}
        {form.status === "PUBLISHED" && <button className="admin-button" disabled={busy} onClick={() => { void state("PAUSE"); }}>Tạm dừng</button>}
        {form.status !== "CLOSED" && <button className="admin-button" disabled={busy || dirty} onClick={() => { void state("CLOSE"); }}>Đóng đợt</button>}</>}
    </div>
    {dirty && form && <p className="admin-note">Lưu thay đổi trước khi xuất bản hoặc đóng đợt.</p>}
    {error && <p className="admin-error" role="alert">{error}</p>}
    {preview && <section className="feedback-preview"><h2>{draft.title || "Xem trước biểu mẫu"}</h2><p className="feedback-intro">{draft.description}</p>
      <FeedbackFields key={JSON.stringify(draft.questions)} questions={draft.questions} preview /></section>}
  </div>;
}
function ExistingEditor({ id, onSaved }: { id: number; onSaved: (form: FeedbackForm) => void }) {
  const resource = useAdminResource<FeedbackForm>(`${api}/${id}`);
  return <><ResourceStatus {...resource} retry={resource.refresh} />{resource.data && <FormEditor key={resource.data.revision} form={resource.data} onSaved={form => { onSaved(form); resource.refresh(); }} />}</>;
}
export function FeedbackManagementPage() {
  const [params, setParams] = useSearchParams(); const [page, setPage] = useState(0); const [message, setMessage] = useState("");
  const resource = useAdminResource<FormPage>(`${api}?page=${page}`); const selection = params.get("formId"); const id = Number(selection);
  function saved(form: FeedbackForm) { setMessage("Đã lưu cập nhật feedback."); setParams({ formId: String(form.id) }); resource.refresh(); }
  return <ManagementShell title="Quản lý Feedback">
    <div className="feedback-admin-actions"><button className="admin-button" onClick={() => { setParams({ formId: "new" }); setMessage(""); }}>+ Tạo đợt mới</button><Link className="admin-button" to="/admin/feedback/statistics">Thống kê feedback</Link></div>
    {message && <p className="admin-success" role="status">{message}</p>}
    {selection === "new" ? <FormEditor onSaved={saved} /> : id > 0 && Number.isSafeInteger(id) ? <ExistingEditor key={id} id={id} onSaved={saved} /> : null}
    <ResourceStatus {...resource} retry={resource.refresh} />
    {resource.data && <section className="admin-panel"><h2>Các đợt feedback</h2><p className="admin-note">Chỉ một đợt được xuất bản tại một thời điểm, kể cả đợt đã đặt lịch. Tạm dừng hoặc đóng đợt cũ trước khi xuất bản đợt khác.</p>
      {!resource.data.content.length ? <p>Chưa có đợt feedback. Nhấn “Tạo đợt mới” để bắt đầu.</p> : <div className="admin-table-scroll"><table><thead><tr><th>Tiêu đề</th><th>Trạng thái</th><th>Lượt gửi</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
        <tbody>{resource.data.content.map(f => <tr key={f.id}><td className="admin-course-name">{f.title}</td><td>{stateLabels[f.status]}{f.active && <small className="admin-secondary">Đang nhận phản hồi</small>}</td><td>{f.submissions}</td><td>{dateTime(f.createdAt)}</td>
          <td><Link className="admin-text-button" to={`?formId=${f.id}`}>Mở biểu mẫu</Link><Link className="admin-text-button" to={`/admin/feedback/statistics?formId=${f.id}`}>Thống kê</Link></td></tr>)}</tbody></table></div>}
      <div className="admin-pagination"><span>{resource.data.totalElements} đợt · Trang {page + 1}</span><div><button className="admin-button" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
        <button className="admin-button" disabled={page + 1 >= resource.data.totalPages} onClick={() => setPage(page + 1)}>Sau</button></div></div>
    </section>}
  </ManagementShell>;
}
