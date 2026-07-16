import { Link } from "react-router-dom";
import { BookOpenText, Clock3, Eye, Star } from "lucide-react";
import AnimatedCard from "../../../../shared/components/animation/AnimatedCard";
import UserImage from "../../../../shared/components/animation/UserImage";
import UserStagger from "../../../../shared/components/animation/UserStagger";

export default function CourseList({ courses, isLoading = false }) {
    const formatRating = (rating) => Number(rating ?? 5.0).toFixed(1);

    if (isLoading) {
        return (
            <div role="status" aria-live="polite" className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center text-brand-textSecondary">
                Đang tải khóa học...
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div role="status" className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center text-brand-textSecondary">
                Không tìm thấy khóa học nào. Hãy thử từ khóa khác.
            </div>
        );
    }

    return (
        <UserStagger as="div" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" itemClassName="h-full" step={65} distance={22}>
            {courses.map((course) => (
                <AnimatedCard as="article" key={course.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-accent/5 hover:border-brand-accent/40">
                    <div className="aspect-video overflow-hidden">
                        <UserImage src={course.thumbnailUrl || "/images/logo-removebg-preview.png"} alt={course.title} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
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
                                    <Star className="h-3.5 w-3.5 fill-status-warningSoft" aria-hidden="true" />
                                    <span>{formatRating(course.rating)}</span>
                                </div>
                                <span className="block text-xs uppercase tracking-wider text-brand-textSecondary">Đánh giá</span>
                            </div>
                            <div className="rounded-lg border border-status-successStrong/20 bg-status-successStrong/10 p-2">
                                <div className="flex items-center gap-1 text-status-success">
                                    <BookOpenText className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>{course.totalLessons ?? 0} bài học</span>
                                </div>
                                <span className="block text-xs uppercase tracking-wider text-brand-textSecondary">Bài học</span>
                            </div>
                            <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/10 p-2">
                                <div className="flex items-center gap-1 text-brand-accentSoft">
                                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>{course.durationText ?? "0m"}</span>
                                </div>
                                <span className="block text-xs uppercase tracking-wider text-brand-textSecondary">Thời lượng</span>
                            </div>
                        </div>

                        <Link to={`/courses/${course.id}`} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-accent/30 px-4 py-3 text-sm font-semibold text-brand-accentSoft no-underline transition hover:border-brand-accent/60 hover:bg-brand-accent/10 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cardBg">
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            Xem chi tiết
                        </Link>
                    </div>
                </AnimatedCard>
            ))}
        </UserStagger>
    );
}
