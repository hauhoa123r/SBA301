import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { AnimatedCard, UserStagger } from "@/shared/ui";

export default function TestPracticeView({ course, firstLesson }) {
    const tests = course.chapters.map((chapter) => ({
        id: chapter.id,
        title: `Bài kiểm tra chương ${chapter.order_index}`,
        description: `Ôn tập ${chapter.title.toLowerCase()} bằng bài trắc nghiệm tổng hợp và bài nghe ngắn.`,
        questions: chapter.lessons.reduce((total, lesson) => total + (lesson.quiz?.questions?.length || 0), 0) + 5,
        status: chapter.order_index <= 2 ? "Đã mở" : "Đã khóa",
    }));

    return (
        <section id="test-practice" className="scroll-mt-24 rounded-2xl border border-brand-accent/20 bg-brand-panel p-5 shadow-xl shadow-brand-black/10">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-xl font-black">Luyện kiểm tra</h2>
                    <p className="mt-1 text-sm text-brand-textSecondary">Luyện kiểm tra theo từng chương trước khi làm bài tổng kết.</p>
                </div>
                <Link to={`/learning/courses/${course.id}/lessons/${firstLesson.id}`} className="w-fit rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-brand-white no-underline hover:bg-brand-accentHover">
                    Tiếp tục luyện tập
                </Link>
            </div>

            <UserStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-full" distance={20} step={65}>
                {tests.map((test) => (
                    <AnimatedCard key={test.id} className="h-full rounded-2xl border border-brand-accent/15 bg-brand-light p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-menu text-brand-accentSoft">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${test.status === "Đã mở" ? "bg-status-success/15 text-status-successSoft" : "bg-brand-borderSoft text-brand-textSecondary"}`}>
                                {test.status}
                            </span>
                        </div>
                        <h3 className="text-base font-black">{test.title}</h3>
                        <p className="mt-2 min-h-10 text-sm text-brand-textSecondary">{test.description}</p>
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-brand-textMutedLight">{test.questions} câu hỏi</span>
                            <span className="text-status-warningSoft">🏆 {test.id % 4 + 2}/6</span>
                        </div>
                    </AnimatedCard>
                ))}
            </UserStagger>
        </section>
    );
}
