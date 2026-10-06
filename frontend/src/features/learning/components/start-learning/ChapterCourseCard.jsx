import { Link } from "react-router-dom";
import { getChapterStats, progressSets } from "../../shared/learnCourseUtils";
import { AnimatedCard, UserImage } from "@/shared/ui";

export default function ChapterCourseCard({ course, chapter }) {
    const stats = getChapterStats({ course, ...progressSets(course.progress) })[chapter.id];
    const completed = new Set(course.progress?.completedLessonIds || []);
    const firstLesson = chapter.lessons.find(lesson => !completed.has(lesson.id)) || chapter.lessons[0];
    const progress = stats.total ? Math.floor(stats.done / stats.total * 100) : 0;

    return (
        <AnimatedCard as={Link} to={firstLesson ? `/learning/courses/${course.id}/lessons/${firstLesson.id}` : `/learning/courses/${course.id}`} className="block h-full overflow-hidden rounded-2xl border border-brand-accent/20 bg-brand-light no-underline hover:border-brand-accentSoft/70">
            <div className="relative aspect-[16/9] bg-brand-menu">
                <div className="absolute inset-0 opacity-55">
                    <UserImage src={course.thumbnail_url} alt={chapter.title} className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-light via-brand-light/30 to-brand-transparent" />
                <div className="absolute left-4 top-4 rounded-xl bg-brand-accent px-3 py-1 text-xs font-black text-brand-white">
                    Chương {chapter.order_index}
                </div>
            </div>
            <div className="p-4">
                <h4 className="line-clamp-2 min-h-10 text-base font-black text-brand-white">{chapter.title}</h4>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-brand-textSecondary">{chapter.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-brand-textMutedLight">{stats.done}/{stats.total} hoạt động</span>
                    <span className="inline-flex items-center gap-1 text-status-warningSoft">
                        {progress}%
                    </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-borderSoft" role="progressbar" aria-label={`Tiến độ chương ${chapter.order_index}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                    <div aria-hidden="true" className="h-full rounded-full bg-brand-accent" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </AnimatedCard>
    );
}
