import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";

export default function ChapterCourseCard({ course, chapter }) {
    const doneLessons = Math.max(0, chapter.order_index - 1);
    const firstLesson = chapter.lessons[0];
    const progress = Math.round((doneLessons / chapter.lessons.length) * 100);

    return (
        <Link to={`/learning/courses/${course.id}/lessons/${firstLesson.id}`} className="overflow-hidden rounded-2xl border border-brand-accent/20 bg-brand-light no-underline transition hover:-translate-y-1 hover:border-brand-accentSoft/70">
            <div className="relative aspect-[16/9] bg-brand-menu">
                <img src={course.thumbnail_url} alt={chapter.title} className="h-full w-full object-cover opacity-55" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-light via-brand-light/30 to-brand-transparent" />
                <div className="absolute left-4 top-4 rounded-xl bg-brand-accent px-3 py-1 text-xs font-black text-brand-white">
                    Chương {chapter.order_index}
                </div>
            </div>
            <div className="p-4">
                <h4 className="line-clamp-2 min-h-10 text-base font-black text-brand-white">{chapter.title}</h4>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-brand-textSecondary">{chapter.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-brand-textMutedLight">{doneLessons}/{chapter.lessons.length} lessons</span>
                    <span className="inline-flex items-center gap-1 text-status-warningSoft">
                        <Trophy className="h-4 w-4" />
                        {chapter.order_index * 8}/{chapter.lessons.length * 12}
                    </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-borderSoft">
                    <div className="h-full rounded-full bg-brand-accent" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </Link>
    );
}
