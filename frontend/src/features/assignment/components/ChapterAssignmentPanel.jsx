import { Send } from "lucide-react";

export default function ChapterAssignmentPanel({ assignment, value, submitted, submission, saving, onChange, onSubmit }) {
    const inputId = `assignment-response-${assignment.id}`;

    return (
        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
            <p className="text-sm font-bold text-brand-warning">Bài tập chương {assignment.chapter.order_index}</p>
            <h2 className="mt-2 text-2xl font-extrabold">{assignment.title}</h2>
            <p className="mt-3 text-sm leading-6 text-brand-courseMuted">{assignment.description}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_220px]">
                <div>
                    <label htmlFor={inputId} className="mb-2 block text-sm font-bold text-brand-textSoft">
                        Nội dung bài làm
                    </label>
                    <textarea
                        id={inputId}
                        name="assignmentResponse"
                        value={value}
                        maxLength={20000}
                        disabled={saving || submission?.status === "GRADED"}
                        onChange={(event) => onChange(event.target.value)}
                        rows={7}
                        placeholder="Nhập nội dung bài làm..."
                        className="w-full resize-none rounded-2xl border border-brand-border bg-brand-panel p-4 text-sm text-brand-white outline-none focus:border-brand-accent"
                    />
                </div>
                <div className="rounded-2xl border border-brand-border bg-brand-panel p-4">
                    <p className="text-sm text-brand-courseMuted">Thời hạn gợi ý</p>
                    <p className="mt-1 text-2xl font-extrabold">{assignment.deadline_days ? `${assignment.deadline_days} ngày` : "Không quy định"}</p>
                    <p className="mt-4 text-sm text-brand-courseMuted">File mẫu</p>
                    {assignment.attachment_url ? <a href={assignment.attachment_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm font-bold text-brand-accentSoft">Tải tài liệu bài tập</a> : <p>Không có</p>}
                </div>
            </div>
            {submitted && <p role="status" className="mt-4 text-sm font-bold text-status-successSoft">{submission?.status === "GRADED" ? `Đã chấm · Điểm: ${submission.score ?? "—"}` : "Đã lưu bài nộp · Chờ giáo viên chấm"}</p>}
            {submission?.status === "NEEDS_REVISION" && <p role="status" className="mt-4 text-status-warningSoft">Giáo viên yêu cầu sửa bài và nộp lại.</p>}
            {submission?.feedback && <p className="mt-3 whitespace-pre-wrap">Nhận xét: {submission.feedback}</p>}
            {submission?.submittedAt && <p className="mt-2 text-sm text-brand-textSecondary">Nộp lúc: {new Date(submission.submittedAt).toLocaleString("vi-VN")}</p>}
            <button
                type="button"
                disabled={saving || submission?.status === "GRADED" || !value.trim() || value.trim() === submission?.text}
                onClick={onSubmit}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-warning px-5 py-3 text-sm font-extrabold text-brand-warningText transition hover:bg-brand-warningHover disabled:cursor-not-allowed disabled:bg-brand-warningDisabled disabled:text-brand-warningMuted"
            >
                <Send className="h-4 w-4" />
                {saving ? "Đang lưu..." : submission ? "Cập nhật bài nộp" : "Nộp bài tập"}
            </button>
        </section>
    );
}
