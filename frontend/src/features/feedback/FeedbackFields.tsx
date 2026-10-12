import { useState, type FormEvent } from "react";
import { buildAnswers, type AnswerValues, type FeedbackAnswer, type FeedbackQuestion } from "./model";
import "./feedback.css";

export function FeedbackFields({ questions, onSubmit, busy = false, preview = false }: {
  questions: FeedbackQuestion[]; onSubmit?: (answers: FeedbackAnswer[]) => Promise<void>; busy?: boolean; preview?: boolean;
}) {
  const [values, setValues] = useState<AnswerValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  function setValue(key: string, value: string | number[]) { setValues(old => ({ ...old, [key]: value })); setErrors(old => ({ ...old, [key]: "" })); setMessage(""); }
  async function submit(event: FormEvent) {
    event.preventDefault(); const result = buildAnswers(questions, values); setErrors(result.errors);
    if (Object.keys(result.errors).length) { setMessage("Vui lòng kiểm tra các câu hỏi được đánh dấu."); return; }
    if (!result.answers.length) { setMessage("Vui lòng trả lời ít nhất một câu hỏi."); return; }
    if (preview) { setMessage("Biểu mẫu hợp lệ. Đây là bản xem trước, câu trả lời chưa được lưu."); return; }
    await onSubmit?.(result.answers);
  }
  return <form className="feedback-fields" noValidate onSubmit={event => { void submit(event); }}>
    <fieldset disabled={busy} className="feedback-fieldset">
      {questions.map((q, index) => {
        const key = String(index); const raw = values[key]; const value = typeof raw === "string" ? raw : "";
        const selected = Array.isArray(raw) ? raw : []; const errorId = `feedback-error-${key}`; const descriptionId = `feedback-description-${key}`;
        const props = { "aria-describedby": `${descriptionId} ${errorId}`, "aria-invalid": Boolean(errors[key]) };
        return <fieldset className="feedback-question" key={q.id ?? key}>
          <legend>{index + 1}. {q.title || "Câu hỏi chưa có tiêu đề"}{q.required && <span className="feedback-required"> * <span className="sr-only">Bắt buộc</span></span>}</legend>
          <p className="feedback-description" id={descriptionId}>{q.description}{q.type === "MULTIPLE_CHOICE" && (q.minSelections || q.maxSelections) ? ` (Chọn ${q.minSelections ?? 1}–${q.maxSelections ?? q.options.length} phương án)` : ""}</p>
          {q.type === "SHORT_TEXT" && <input {...props} aria-label={q.title} type="text" maxLength={q.maxLength ?? 255} value={value} onChange={e => setValue(key, e.target.value)} />}
          {q.type === "LONG_TEXT" && <textarea {...props} aria-label={q.title} rows={4} maxLength={q.maxLength ?? 10000} value={value} onChange={e => setValue(key, e.target.value)} />}
          {q.type === "NUMBER" && <input {...props} aria-label={q.title} type="number" step="0.0001" min={q.minValue ?? undefined} max={q.maxValue ?? undefined} value={value} onChange={e => setValue(key, e.target.value)} />}
          {q.type === "DROPDOWN" && <select {...props} aria-label={q.title} value={selected[0] ?? ""} onChange={e => setValue(key, e.target.value ? [Number(e.target.value)] : [])}>
            <option value="">Chọn phương án</option>{q.options.map((o, i) => <option key={o.id ?? i} value={o.id ?? i + 1}>{o.label}</option>)}</select>}
          {["SINGLE_CHOICE", "MULTIPLE_CHOICE", "YES_NO"].includes(q.type) && <div className="feedback-choices">{q.options.map((o, i) => {
            const id = o.id ?? i + 1;
            return <label key={id}><input {...props} type={q.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name={`q-${key}`} checked={selected.includes(id)}
              onChange={e => setValue(key, q.type === "MULTIPLE_CHOICE" ? (e.target.checked ? [...selected, id] : selected.filter(v => v !== id)) : [id])} />{o.label}</label>;
          })}</div>}
          {(q.type === "LIKERT" || q.type === "RATING") && <div className="feedback-scale">{Array.from({ length: q.type === "LIKERT" ? 5 : Math.max(0, Math.min(21, (q.maxValue ?? 10) - (q.minValue ?? 1) + 1)) }, (_, i) => {
            const score = i + (q.type === "LIKERT" ? 1 : (q.minValue ?? 1));
            return <label key={score}><input {...props} type="radio" name={`q-${key}`} checked={value === String(score)} onChange={() => setValue(key, String(score))} /><strong>{score}</strong>{q.type === "LIKERT" && <span>{q.options[i]?.label}</span>}</label>;
          })}</div>}
          {!q.required && <button className="feedback-clear" type="button" onClick={() => setValue(key, "")}>Xóa câu trả lời</button>}
          <p id={errorId} className="feedback-error" role={errors[key] ? "alert" : undefined}>{errors[key]}</p>
        </fieldset>;
      })}
      <button className="feedback-button" type="submit">{busy ? "Đang gửi…" : preview ? "Kiểm tra bản xem trước" : "Gửi phản hồi"}</button>
    </fieldset>
    {message && <p role="status" className="feedback-note">{message}</p>}
  </form>;
}
