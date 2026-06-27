import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";

export default function TestPracticeView({ course, firstLesson }) {
    const tests = course.chapters.map((chapter) => ({
        id: chapter.id,
        title: `Bài test chương ${chapter.order_index}`,
        description: `Ôn tập ${chapter.title.toLowerCase()} bằng quiz tổng hợp và bài nghe ngắn.`,
        questions: chapter.lessons.reduce((total, lesson) => total + lesson.quiz.questions.length, 0) + 5,
        status: chapter.order_index <= 2 ? "Đã mở" : "Khóa",
    }));

    return (
        <section id="test-practice" className="scroll-mt-24 rounded-2xl border border-[#7c3aed]/20 bg-[#120922] p-5 shadow-xl shadow-black/10">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-xl font-black">Test Practice</h2>
                    <p className="mt-1 text-sm text-[#94a3b8]">Luyện test theo từng chapter trước khi làm bài tổng kết.</p>
                </div>
                <Link to={`/learning/courses/${course.id}/lessons/${firstLesson.id}`} className="w-fit rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-bold text-white no-underline hover:bg-[#6d28d9]">
                    Tiếp tục luyện tập
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tests.map((test) => (
                    <div key={test.id} className="rounded-2xl border border-[#7c3aed]/15 bg-[#160e2e] p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#0f0920] text-[#a78bfa]">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${test.status === "Đã mở" ? "bg-emerald-400/15 text-emerald-300" : "bg-[#2a1a4d] text-[#94a3b8]"}`}>
                                {test.status}
                            </span>
                        </div>
                        <h3 className="text-base font-black">{test.title}</h3>
                        <p className="mt-2 min-h-10 text-sm text-[#94a3b8]">{test.description}</p>
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-[#cbd5e1]">{test.questions} câu hỏi</span>
                            <span className="text-amber-300">🏆 {test.id % 4 + 2}/6</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
