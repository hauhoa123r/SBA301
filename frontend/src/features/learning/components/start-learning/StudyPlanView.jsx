import { Link } from "react-router-dom";
import { CheckCircle2, CircleDot } from "lucide-react";
import { buildLearningActivities, progressSets } from "../../shared/learnCourseUtils";

export default function StudyPlanView({ course }) {
    const { allLessons } = buildLearningActivities(course);
    const { completedLessons } = progressSets(course.progress);
    return <section className="space-y-5 rounded-2xl border border-brand-border bg-brand-panel p-5">
        <h2 className="text-xl font-black">Lộ trình học</h2>
        <p className="text-sm text-brand-textSecondary">Học theo thứ tự các bài trong khóa. Trạng thái được lấy từ tiến độ đã lưu.</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {allLessons.map((lesson, index) => {
                const done = completedLessons.has(lesson.id);
                return <Link key={lesson.id} to={`/learning/courses/${course.id}/lessons/${lesson.id}`}
                    className="space-y-3 rounded-xl border border-brand-border bg-brand-light p-4 no-underline hover:border-brand-accent">
                    <p className="flex items-center gap-2 text-sm">{done ? <CheckCircle2 className="h-4 w-4 text-status-successSoft" /> : <CircleDot className="h-4 w-4 text-brand-accentSoft" />}
                        Bài {index + 1} · {done ? "Đã hoàn thành" : "Chưa hoàn thành"}</p>
                    <h3 className="font-bold">{lesson.title}</h3>
                    <p className="text-xs text-brand-textSecondary">{lesson.chapter.title}</p>
                </Link>;
            })}
        </div>
        {!allLessons.length && <p>Khóa học chưa có bài học.</p>}
    </section>;
}
