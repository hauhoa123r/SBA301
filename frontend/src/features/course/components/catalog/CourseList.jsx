import { Link } from "react-router-dom";
import { BookOpenText, Clock3, Eye, Star } from "lucide-react";

export default function CourseList({ courses, isLoading = false }) {
    const formatRating = (rating) => Number(rating ?? 5.0).toFixed(1);

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center text-brand-textSecondary">
                Đang tải khóa học...
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center text-brand-textSecondary">
                Không tìm thấy khóa học nào. Hãy thử từ khóa khác.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
                <article key={course.id} className="overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-accent/5 transition hover:-translate-y-1 hover:border-brand-accent/40">
                    <div className="aspect-video overflow-hidden">
                        <img src={course.thumbnailUrl || "/images/logo-removebg-preview.png"} alt={course.title} className="h-full w-full object-cover" />
                    </div>

                    <div className="p-5">
                        <div className="mb-3">
                            <span className="rounded-lg border border-brand-accent/20 bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-brand-accentSoft">
                                {course.category ?? "Chưa phân loại"}
                            </span>
                        </div>

                        <h2 className="mb-2 min-h-14 break-words text-lg font-bold leading-7 text-brand-white">
                            {course.title}
                        </h2>

                        <p className="mb-2 line-clamp-2 min-h-10 text-sm leading-5 text-brand-textSecondary">
                            {course.description}
                        </p>

                        <p className="mb-4 text-sm font-medium text-brand-textSecondary">
                            {course.instructor ?? "Đang cập nhật"}
                        </p>

                        <div className="mb-5 grid grid-cols-3 gap-3 text-xs">
                            <div className="rounded-lg border border-status-warningStrong/20 bg-status-warningStrong/10 p-2">
                                <div className="flex items-center gap-1 text-status-warningSoft">
                                    <Star className="h-3.5 w-3.5 fill-status-warningSoft" />
                                    <span>{formatRating(course.rating)}</span>
                                </div>
                                <span className="block text-xs uppercase tracking-wider text-brand-textSecondary">Đánh giá</span>
                            </div>
                            <div className="rounded-lg border border-status-successStrong/20 bg-status-successStrong/10 p-2">
                                <div className="flex items-center gap-1 text-status-success">
                                    <BookOpenText className="h-3.5 w-3.5" />
                                    <span>{course.totalLessons ?? 0} bài học</span>
                                </div>
                                <span className="block text-xs uppercase tracking-wider text-brand-textSecondary">Bài học</span>
                            </div>
                            <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/10 p-2">
                                <div className="flex items-center gap-1 text-brand-accentSoft">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    <span>{course.durationText ?? "0m"}</span>
                                </div>
                                <span className="block text-xs uppercase tracking-wider text-brand-textSecondary">Thời lượng</span>
                            </div>
                        </div>

                        <Link to={`/courses/${course.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-accent/30 px-4 py-3 text-sm font-semibold text-brand-accentSoft no-underline transition hover:border-brand-accent/60 hover:bg-brand-accent/10 hover:text-brand-white">
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                        </Link>
                    </div>
                </article>
            ))}
        </div>
    );
}
