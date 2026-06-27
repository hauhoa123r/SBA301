import { Send } from "lucide-react";

export default function ChapterAssignmentPanel({ assignment, value, submitted, onChange, onSubmit }) {
    return (
        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
            <p className="text-sm font-bold text-brand-warning">Bài tập lớn cuối chương {assignment.chapter.order_index}</p>
            <h2 className="mt-2 text-2xl font-extrabold">{assignment.title}</h2>
            <p className="mt-3 text-sm leading-6 text-brand-courseMuted">{assignment.description}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_220px]">
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={7}
                    placeholder="Nhập nội dung bài làm hoặc ghi chú file nộp..."
                    className="resize-none rounded-2xl border border-brand-border bg-brand-panel p-4 text-sm text-brand-white outline-none focus:border-brand-accent"
                />
                <div className="rounded-2xl border border-brand-border bg-brand-panel p-4">
                    <p className="text-sm text-brand-courseMuted">Deadline</p>
                    <p className="mt-1 text-2xl font-extrabold">{assignment.deadline_days} ngày</p>
                    <p className="mt-4 text-sm text-brand-courseMuted">File mẫu</p>
                    <p className="mt-1 truncate text-sm font-bold text-brand-accentSoft">{assignment.attachment_url || "Không có"}</p>
                </div>
            </div>
            {submitted && <p className="mt-4 text-sm font-bold text-status-successSoft">Đã nộp bài tổng kết chương này.</p>}
            <button
                type="button"
                disabled={submitted || !value.trim()}
                onClick={onSubmit}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-warning px-5 py-3 text-sm font-extrabold text-brand-warningText transition hover:bg-brand-warningHover disabled:cursor-not-allowed disabled:bg-brand-warningDisabled disabled:text-brand-warningMuted"
            >
                <Send className="h-4 w-4" />
                Nộp bài tập
            </button>
        </section>
    );
}
