import { Search, SlidersHorizontal } from "lucide-react";
import ChapterCourseCard from "./ChapterCourseCard";
import UserStagger from "../../../../shared/components/animation/UserStagger";

const courseFilters = ["Tất cả chương", "Đã mở", "Đang học", "Đã hoàn thành"];

export default function MyCoursesView({ course }) {
    return (
        <section id="my-courses" className="scroll-mt-24 rounded-2xl border border-brand-accent/20 bg-brand-panel p-5 shadow-xl shadow-brand-black/10">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-xl font-black">Khóa học của tôi</h2>
                    <p className="mt-1 max-w-3xl text-sm text-brand-textSecondary">
                        Các chương trong {course.displayTitle} được chia theo từng mục tiêu học. Chọn một chương để bắt đầu bài học đầu tiên.
                    </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-brand-accent/20 bg-brand-menu px-4 py-2 text-sm font-bold text-brand-textMutedLight">
                    <SlidersHorizontal className="h-4 w-4 text-brand-accentSoft" />
                    Khóa học hiện tại
                </div>
            </div>

            <div className="mb-5 flex flex-col gap-3 border-b border-brand-accent/15 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {courseFilters.map((item, index) => (
                        <button
                            key={item}
                            type="button"
                            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                                index === 0
                                    ? "border-brand-accent bg-brand-accent text-brand-white"
                                    : "border-brand-accent/20 bg-brand-light text-brand-textSecondary hover:text-brand-white"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <label className="flex w-full items-center gap-2 rounded-full border border-brand-accent/20 bg-brand-menu px-4 py-2 text-sm text-brand-textSecondary lg:w-64">
                    <Search className="h-4 w-4" />
                    <span>Tìm kiếm chương</span>
                </label>
            </div>

            <div className="mb-5 flex items-center gap-4">
                <h3 className="text-lg font-black">{course.displayTitle}</h3>
                <span className="text-sm text-brand-textSecondary">{course.chapters.length} chương</span>
                <span className="text-sm text-status-warningSoft">🏆 92/243</span>
            </div>

            <UserStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5" itemClassName="h-full" distance={20} step={60}>
                {course.chapters.map((chapter) => (
                    <ChapterCourseCard key={chapter.id} course={course} chapter={chapter} />
                ))}
            </UserStagger>
        </section>
    );
}
