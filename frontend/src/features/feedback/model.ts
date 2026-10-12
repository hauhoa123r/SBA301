export type QuestionType = "SHORT_TEXT" | "LONG_TEXT" | "NUMBER" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "DROPDOWN" | "LIKERT" | "RATING" | "YES_NO";
export interface FeedbackOption { id: number | null; label: string }
export interface FeedbackQuestion {
  id: number | null; title: string; description: string; type: QuestionType; required: boolean;
  minValue: number | null; maxValue: number | null; maxLength: number | null;
  minSelections: number | null; maxSelections: number | null; options: FeedbackOption[];
}
export interface FeedbackForm {
  id: number; revision: number; title: string; description: string; status: "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED";
  active: boolean; onePerUser: boolean; startsAt: string | null; endsAt: string | null;
  publishedAt: string | null; closedAt: string | null; hasSubmitted: boolean; schemaLocked: boolean; questions: FeedbackQuestion[];
}
export type FormDraft = Pick<FeedbackForm, "title" | "description" | "onePerUser" | "startsAt" | "endsAt" | "questions"> & { revision: number | null };
export interface FormSummary { id: number; title: string; status: FeedbackForm["status"]; active: boolean; createdAt: string; submissions: number }
export interface FormPage { content: FormSummary[]; totalElements: number; totalPages: number; page: number }
export interface FeedbackAnswer { questionId: number; text: string | null; number: number | null; optionIds: number[] }
export interface QuestionStats {
  questionId: number; title: string; type: QuestionType; answered: number;
  distribution: { label: string; count: number; percentage: number }[];
  numeric: { average: number; median: number; min: number; max: number } | null;
}
export interface FeedbackStats {
  form: FeedbackForm; submissions: number; participants: number; startedUsers: number; completionRate: number;
  questionCount: number; validAnswers: number; questions: QuestionStats[];
}
export interface TextPage { content: { submissionId: number; text: string; submittedAt: string }[]; totalElements: number; totalPages: number; page: number }
export const questionLabels: Record<QuestionType, string> = {
  SHORT_TEXT: "Văn bản ngắn", LONG_TEXT: "Văn bản dài", NUMBER: "Số", SINGLE_CHOICE: "Chọn một",
  MULTIPLE_CHOICE: "Chọn nhiều", DROPDOWN: "Danh sách thả xuống", LIKERT: "Likert 1–5", RATING: "Thang điểm", YES_NO: "Có / Không",
};
export const stateLabels: Record<FeedbackForm["status"], string> = { DRAFT: "Bản nháp", PUBLISHED: "Đã xuất bản", PAUSED: "Tạm dừng", CLOSED: "Đã đóng" };
export function newQuestion(type: QuestionType = "SHORT_TEXT"): FeedbackQuestion {
  return { id: null, title: "", description: "", type, required: false, minValue: type === "RATING" ? 1 : null,
    maxValue: type === "RATING" ? 10 : null, maxLength: null, minSelections: null, maxSelections: null,
    options: type === "LIKERT" ? ["Rất không đồng ý", "Không đồng ý", "Trung lập", "Đồng ý", "Rất đồng ý"].map(label => ({ id: null, label }))
      : type === "YES_NO" ? [{ id: null, label: "Có" }, { id: null, label: "Không" }]
      : ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(type) ? [{ id: null, label: "Phương án 1" }, { id: null, label: "Phương án 2" }] : [] };
}
export function moveItem<T>(items: T[], index: number, direction: number): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items]; const current = next[index]; const other = next[target];
  if (current === undefined || other === undefined) return items;
  next[index] = other; next[target] = current; return next;
}
export type AnswerValues = Record<string, string | number[]>;
export function buildAnswers(questions: FeedbackQuestion[], values: AnswerValues): { answers: FeedbackAnswer[]; errors: Record<string, string> } {
  const answers: FeedbackAnswer[] = []; const errors: Record<string, string> = {};
  questions.forEach((q, index) => {
    const key = String(index); const value = values[key]; const text = typeof value === "string" ? value.trim() : "";
    const selected = Array.isArray(value) ? value : [];
    const empty = !text && selected.length === 0;
    if (empty) { if (q.required) errors[key] = "Vui lòng trả lời câu hỏi này."; return; }
    const answer: FeedbackAnswer = { questionId: q.id ?? index + 1, text: null, number: null, optionIds: [] };
    if (q.type === "SHORT_TEXT" || q.type === "LONG_TEXT") {
      const max = q.maxLength ?? (q.type === "SHORT_TEXT" ? 255 : 10000);
      if (text.length > max) errors[key] = `Tối đa ${max} ký tự.`;
      answer.text = text;
    } else if (["NUMBER", "LIKERT", "RATING"].includes(q.type)) {
      const number = Number(text); const min = q.type === "LIKERT" ? 1 : q.minValue; const max = q.type === "LIKERT" ? 5 : q.maxValue;
      if (!Number.isFinite(number) || Math.abs(number) >= 1e14 || (min !== null && number < min) || (max !== null && number > max)) errors[key] = "Giá trị số nằm ngoài phạm vi cho phép.";
      else if (q.type !== "NUMBER" && !Number.isInteger(number)) errors[key] = "Vui lòng chọn một mức điểm nguyên.";
      else if (q.type === "NUMBER" && !/^-?\d+(\.\d{1,4})?$/.test(text)) errors[key] = "Nhập số với tối đa 4 chữ số thập phân.";
      answer.number = number;
    } else {
      if (q.type === "MULTIPLE_CHOICE") {
        if (selected.length < (q.minSelections ?? 1) || selected.length > (q.maxSelections ?? q.options.length)) errors[key] = "Số phương án đã chọn nằm ngoài giới hạn.";
      } else if (selected.length !== 1) errors[key] = "Vui lòng chọn một phương án.";
      answer.optionIds = selected;
    }
    answers.push(answer);
  });
  return { answers, errors };
}
