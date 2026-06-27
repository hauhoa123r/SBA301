import { Send } from "lucide-react";

export default function ChapterAssignmentPanel({ assignment, value, submitted, onChange, onSubmit }) {
    return (
        <section className="rounded-2xl border border-[#2b1852] bg-[#160d2b] p-6">
            <p className="text-sm font-bold text-[#fbbf24]">Bài tập lớn cuối chương {assignment.chapter.order_index}</p>
            <h2 className="mt-2 text-2xl font-extrabold">{assignment.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#a7b0c7]">{assignment.description}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_220px]">
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={7}
                    placeholder="Nhập nội dung bài làm hoặc ghi chú file nộp..."
                    className="resize-none rounded-2xl border border-[#2b1852] bg-[#120922] p-4 text-sm text-white outline-none focus:border-[#7c3aed]"
                />
                <div className="rounded-2xl border border-[#2b1852] bg-[#120922] p-4">
                    <p className="text-sm text-[#a7b0c7]">Deadline</p>
                    <p className="mt-1 text-2xl font-extrabold">{assignment.deadline_days} ngày</p>
                    <p className="mt-4 text-sm text-[#a7b0c7]">File mẫu</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#a78bfa]">{assignment.attachment_url || "Không có"}</p>
                </div>
            </div>
            {submitted && <p className="mt-4 text-sm font-bold text-emerald-300">Đã nộp bài tổng kết chương này.</p>}
            <button
                type="button"
                disabled={submitted || !value.trim()}
                onClick={onSubmit}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#fbbf24] px-5 py-3 text-sm font-extrabold text-[#221407] transition hover:bg-[#f59e0b] disabled:cursor-not-allowed disabled:bg-[#4a3a20] disabled:text-[#9a8b70]"
            >
                <Send className="h-4 w-4" />
                Nộp bài tập
            </button>
        </section>
    );
}
